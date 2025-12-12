import { NextRequest, NextResponse } from "next/server";
import { loadResumeData, findRelevantChunks } from "@/lib/utils";

/**
 * Route: POST /api/query
 * - Uses Gemini generateContent
 * - Retries on transient errors and obeys retryDelay from the API
 * - Caches answers in memory for identical questions
 * - Falls back to Groq (if GROQ_API_KEY present) when Gemini is rate-limited
 */

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const MAX_RETRIES = 1;
const answerCache =
  (global as any).__answerCache ||
  ((global as any).__answerCache = new Map<
    string,
    { ts: number; text: string }
  >());

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function sanitizeServerAnswer(raw: string) {
  if (!raw || typeof raw !== "string") return raw ?? "";
  let s = raw.replace(/\r\n/g, "\n").trim();

  // Light cleanup: remove some boilerplate if present
  s = s.replace(
    /^[\s\S]*?(Based on your current skills[\s\S]*?[,.:]?\s*)/i,
    ""
  );
  s = s.replace(
    /^[\s\S]*?(Your current skills include[:\s]*\n)/i,
    ""
  );
  s = s.replace(
    /^[\s\S]*?(Your current skills are[:\s]*\n)/i,
    ""
  );

  s = s.replace(/\n{3,}/g, "\n\n").trim();

  if (s.length < 8) {
    s = raw.replace(/\r\n/g, "\n").trim();
  }

  return s;
}

async function callGemini(
  apiKey: string,
  modelId: string,
  prompt: string,
  generationConfig: any
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const txt = await resp.text().catch(() => "");
  let json = null;
  try {
    json = txt ? JSON.parse(txt) : null;
  } catch {
    json = null;
  }

  return { status: resp.status, ok: resp.ok, text: txt, json };
}

/**
 * Try a single Groq model using dynamic import of groq-sdk.
 * Returns the text answer string on success, otherwise null.
 */
async function callGroqModel(
  apiKey: string | undefined,
  prompt: string,
  model: string
) {
  if (!apiKey) return null;
  try {
    const Groq = await import("groq-sdk").then((m) => m.default ?? m);
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
      max_tokens: 512,
    });

    const ans = completion?.choices?.[0]?.message?.content;
    if (typeof ans === "string") return ans;
    return null;
  } catch (err: any) {
    try {
      console.warn(
        `[Groq] model=${model} error:`,
        err?.message ?? String(err)
      );
      if (err?.error) {
        console.warn("[Groq] error.payload:", JSON.stringify(err.error));
      }
    } catch {
      console.warn("[Groq] error (and error logging failed):", String(err));
    }
    return null;
  }
}

/**
 * High-level Groq fallback that will try a short list of models (first from env)
 * This avoids breaking when a single model is decommissioned.
 */
async function callGroqIfAvailable(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;

  const envModel = process.env.GROQ_MODEL;
  const fallbackCandidates = [
    envModel,
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768",
  ].filter(Boolean) as string[];

  for (const candidate of fallbackCandidates) {
    try {
      const ans = await callGroqModel(apiKey, prompt, candidate);
      if (ans) {
        console.warn(
          `[Groq] Successfully used model ${candidate} as fallback.`
        );
        return ans;
      } else {
        console.warn(`[Groq] model ${candidate} returned no answer.`);
      }
    } catch {
      // already logged inside callGroqModel
    }
  }

  console.warn(
    "[Groq] All fallback models failed or groq-sdk not installed."
  );
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body?.question;
    const mode = body?.mode === "strict" ? "strict" : "recommend";

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid question" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const groqKey = process.env.GROQ_API_KEY; // optional fallback

    // Short-circuit greetings with a concise response
    const normalizedQuestion = question.toLowerCase().trim();
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|what's up|howdy)[\s!?.,]*$/i,
      /^how are you[\s?]*$/i,
      /^how's it going[\s?]*$/i,
      /^how do you do[\s?]*$/i,
      /^what's going on[\s?]*$/i,
    ];
    const isGreeting = greetingPatterns.some((pattern) =>
      pattern.test(normalizedQuestion)
    );
    if (isGreeting) {
      return NextResponse.json({
        answer:
          "Hi! Upload your resume, then ask things like:\n• Rate my resume out of 10\n• What skills should I learn next?\n• What jobs am I currently competitive for?\nI will answer using only your uploaded resume.",
        relevantChunks: 0,
        mode: "greeting",
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not set in env" },
        { status: 500 }
      );
    }

    // Load resume
    const resumeData = loadResumeData();
    if (!resumeData) {
      return NextResponse.json(
        { error: "No resume found. Upload a resume first." },
        { status: 404 }
      );
    }

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(
      question,
      resumeData.chunks || [],
      3
    );
    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find relevant information in your resume to answer this question.",
        relevantChunks: 0,
      });
    }

    const resumeExtract = relevantChunks.join("\n\n");

    // Simple, unified role prompt
    const basePrompt = `You are a helpful chatbot acting as a career strategist and mentor.
You ALWAYS read and consider the user's resume extract before answering.
You only use information that can be reasonably inferred from the resume extract and the user question.
You do NOT invent fake jobs, skills, degrees, or companies.
You keep answers concise, practical, and easy to understand.

--- Resume Extract ---
${resumeExtract}

--- User Question ---
${question}

Now answer the user's question in a way that is genuinely useful for their career, based on this resume.`;

    const prompt = basePrompt;

    // Cache only on mode + question (simple cache, avoids mixing different intents)
    const cacheKey = `q:${mode}:${question.trim()}`;
    const cached = answerCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({
        answer: cached.text,
        relevantChunks: relevantChunks.length,
        mode,
      });
    }

    const generationConfig = {
      temperature: mode === "strict" ? 0.0 : 0.25,
      maxOutputTokens: 2048,
      topP: 0.9,
      topK: 40,
      candidateCount: 1,
    };

    // Retry loop with respect for retryDelay
    let attempt = 0;
    let lastErrorText: string | null = null;
    let geminiJson: any = null;
    let rateLimited = false;
    let retrySecondsHint: number | null = null;

    while (attempt <= MAX_RETRIES) {
      attempt++;
      const { status, ok, text, json } = await callGemini(
        apiKey,
        modelId,
        prompt,
        generationConfig
      );
      if (ok && json) {
        geminiJson = json;
        break;
      }

      lastErrorText = text || (json ? JSON.stringify(json) : null);

      // If rate limited (RESOURCE_EXHAUSTED / 429) — break for fallback
      if (status === 429 || json?.error?.status === "RESOURCE_EXHAUSTED") {
        rateLimited = true;
        let retrySec: number | null = null;
        try {
          const retryInfo = (json?.error?.details || []).find((d: any) =>
            d["@type"]?.includes("RetryInfo")
          );
          const retryStr = retryInfo?.retryDelay || json?.error?.retryDelay;
          if (typeof retryStr === "string") {
            const m = retryStr.match(/(\d+(\.\d+)?)/);
            if (m) retrySec = Number(m[1]);
          } else if (retryStr?.seconds) {
            retrySec = Number(retryStr.seconds);
          }
        } catch {
          retrySec = null;
        }
        retrySecondsHint = retrySec;
        break;
      }

      // For 5xx or network errors, exponential backoff and retry
      if (status >= 500 || !status) {
        const waitMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Transient error calling Gemini (status=${status}). Backing off ${waitMs}ms and retrying.`
        );
        await sleep(waitMs);
        continue;
      }

      // For other 4xx, treat as fatal
      try {
        return NextResponse.json(
          {
            error: "Gemini API returned an error",
            details: text || json,
          },
          { status }
        );
      } catch {
        return NextResponse.json(
          { error: "Gemini API returned an error" },
          { status }
        );
      }
    }
    // If we have geminiJson, extract text
    let answerText: string | null = null;
    if (geminiJson) {
      const candidates = geminiJson?.candidates;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const c = candidates[0];
        answerText =
          c?.content?.parts?.[0]?.text ||
          c?.content?.text ||
          c?.content?.parts?.[0]?.output ||
          (typeof c === "string" ? c : null) ||
          null;
      }
      if (!answerText && typeof geminiJson?.response?.text === "string") {
        answerText = geminiJson.response.text;
      }
    }

    // If Gemini failed or returned nothing meaningful, try fallback to Groq (if key present)
    if (!answerText) {
      if (groqKey) {
        const groqAnswer = await callGroqIfAvailable(groqKey, prompt);
        if (groqAnswer) {
          answerText = groqAnswer;
          console.warn("Used Groq fallback due to Gemini issues.");
        }
      }

      if (!answerText) {
        if (rateLimited) {
          return NextResponse.json(
            {
              error: "Rate limited by Gemini free tier.",
              retrySeconds: retrySecondsHint,
              details: lastErrorText,
            },
            { status: 429 }
          );
        }
        return NextResponse.json(
          {
            error:
              "Failed to generate answer from Gemini and no fallback succeeded.",
            details: lastErrorText,
          },
          { status: 500 }
        );
      }
    }

    // Sanitize answer and cache
    answerText = sanitizeServerAnswer(answerText);
    answerCache.set(cacheKey, { ts: Date.now(), text: answerText });

    return NextResponse.json({
      answer: answerText,
      relevantChunks: relevantChunks.length,
      mode,
    });
  } catch (err) {
    console.error("Gemini Query Error:", err);
    return NextResponse.json(
      { error: "Failed to process query. Please try again." },
      { status: 500 }
    );
  }
}
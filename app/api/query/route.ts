import { NextRequest, NextResponse } from "next/server";
import { getResumeText } from "@/lib/resumeStore";

/**
 * POST /api/query
 * - Reads resume from Redis (Upstash)
 * - Finds relevant chunks (keyword-based, no embeddings)
 * - Uses Gemini (primary) + Groq (fallback)
 * - Caches answers in-memory per server instance
 */

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const answerCache =
  (global as any).__answerCache ||
  ((global as any).__answerCache = new Map<
    string,
    { ts: number; text: string }
  >());

/* ---------------- Utilities ---------------- */

function sanitizeServerAnswer(raw: string) {
  if (!raw || typeof raw !== "string") return raw ?? "";
  let s = raw.replace(/\r\n/g, "\n").trim();

  s = s.replace(
    /^[\s\S]*?(Based on your current skills[\s\S]*?[,.:]?\s*)/i,
    ""
  );
  s = s.replace(/^[\s\S]*?(Your current skills include[:\s]*\n)/i, "");
  s = s.replace(/^[\s\S]*?(Your current skills are[:\s]*\n)/i, "");
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s.length < 8 ? raw.trim() : s;
}

/**
 * Lightweight relevance scoring (Vercel-safe, no embeddings)
 */
function findRelevantChunks(
  question: string,
  resumeText: string,
  maxChunks = 3
) {
  const chunks = resumeText
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  const qWords = question.toLowerCase().split(/\W+/);

  return chunks
    .map((chunk) => {
      const text = chunk.toLowerCase();
      let score = 0;
      for (const w of qWords) {
        if (w.length > 3 && text.includes(w)) score++;
      }
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map((c) => c.chunk);
}

/* ---------------- AI Calls ---------------- */

async function callGemini(
  apiKey: string,
  modelId: string,
  prompt: string
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 1024,
      },
    }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return { ok: res.ok, json };
}

async function callGroqFallback(prompt: string) {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const Groq = await import("groq-sdk").then((m) => m.default ?? m);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
      max_tokens: 512,
    });

    return completion?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/* ---------------- Route ---------------- */

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid question" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not set in env" },
        { status: 500 }
      );
    }

    // ✅ IMPORTANT: await Redis read
    const resumeText = await getResumeText();
    if (!resumeText) {
      return NextResponse.json(
        { error: "No resume found. Upload a resume first." },
        { status: 404 }
      );
    }

    const relevantChunks = findRelevantChunks(question, resumeText, 3);
    if (!relevantChunks.length) {
      return NextResponse.json({
        answer:
          "I couldn't find relevant information in your resume to answer this question.",
        relevantChunks: 0,
      });
    }

    const cacheKey = question.trim();
    const cached = answerCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({
        answer: cached.text,
        relevantChunks: relevantChunks.length,
      });
    }

    const prompt = `
You are a career mentor AI.
Use ONLY the resume extract below.
Do NOT invent facts.

--- Resume ---
${relevantChunks.join("\n\n")}

--- Question ---
${question}
`;

    const { ok, json } = await callGemini(
      apiKey,
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      prompt
    );

    let answer =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!ok || !answer) {
      answer = await callGroqFallback(prompt);
    }

    if (!answer) {
      return NextResponse.json(
        { error: "Failed to generate answer" },
        { status: 500 }
      );
    }

    answer = sanitizeServerAnswer(answer);
    answerCache.set(cacheKey, { ts: Date.now(), text: answer });

    return NextResponse.json({
      answer,
      relevantChunks: relevantChunks.length,
    });
  } catch (err) {
    console.error("Query error:", err);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}

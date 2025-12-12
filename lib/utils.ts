import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const RESUME_FILE = path.join(DATA_DIR, 'resume.json')

// Ensure data directory exists
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Save resume text to JSON file
export function saveResumeText(text: string) {
  ensureDataDir()
  const data = {
    text,
    chunks: splitIntoChunks(text),
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(RESUME_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// Load resume text from JSON file
export function loadResumeData() {
  if (!fs.existsSync(RESUME_FILE)) {
    return null
  }
  const data = fs.readFileSync(RESUME_FILE, 'utf-8')
  return JSON.parse(data)
}

// Split text into chunks for better search
function splitIntoChunks(text: string, chunkSize: number = 500): string[] {
  const sentences = text.split(/[.!?]\s+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [text]
}

// Simple word frequency vector
function textToVector(text: string, vocabulary?: Set<string>): { vector: number[]; vocab: Set<string> } {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0)
  const wordCounts: { [key: string]: number } = {}
  
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })

  // Use provided vocabulary or create new one
  const vocab = vocabulary || new Set(Object.keys(wordCounts))
  
  // Create vector based on vocabulary
  const vector: number[] = []
  vocab.forEach(word => {
    vector.push(wordCounts[word] || 0)
  })

  return { vector, vocab }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Find most relevant chunks using cosine similarity
export function findRelevantChunks(question: string, chunks: string[], topK: number = 3): string[] {
  if (chunks.length === 0) return []

  // Build vocabulary from question and all chunks
  const allText = question + ' ' + chunks.join(' ')
  const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 0)
  const vocabulary = new Set(words)

  // Convert question to vector
  const questionVec = textToVector(question, vocabulary)
  const chunkScores: { chunk: string; score: number }[] = []

  // Calculate similarity for each chunk
  chunks.forEach(chunk => {
    const chunkVec = textToVector(chunk, vocabulary)
    const similarity = cosineSimilarity(questionVec.vector, chunkVec.vector)
    chunkScores.push({ chunk, score: similarity })
  })

  // Sort by score and return top K
  chunkScores.sort((a, b) => b.score - a.score)
  return chunkScores.slice(0, topK).map(item => item.chunk)
}

// Generate answer from relevant chunks
export function generateAnswer(question: string, relevantChunks: string[]): string {
  if (relevantChunks.length === 0) {
    return "I couldn't find relevant information in your resume to answer this question."
  }

  // Combine relevant chunks
  const context = relevantChunks.join(' ')

  // Simple answer generation - in a real app, you might use an LLM
  // For now, we'll return the most relevant chunk(s) with a brief explanation
  if (relevantChunks.length === 1) {
    return `Based on your resume: ${relevantChunks[0]}`
  } else {
    return `Based on your resume:\n\n${relevantChunks.map((chunk, i) => `${i + 1}. ${chunk}`).join('\n\n')}`
  }
}


'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  question?: string // Store the question for regeneration
}

/**
 * Sanitizer keeps bullets and trims lead-ins.
 */
function sanitizeAnswer(raw: string) {
  if (!raw || typeof raw !== 'string') return raw ?? ''

  let s = raw.replace(/\r\n/g, '\n').trim()

  const bulletIndex = s.search(/(^|\n)\s*([-*•])\s+/)
  if (bulletIndex !== -1) {
    s = s.slice(bulletIndex).trim()
    s = s.replace(/\n{3,}/g, '\n\n')
    return s
  }

  s = s.replace(/^[\s\S]*?(Based on your current skills[\s\S]*?[,.:]?\s*)/i, '')
  s = s.replace(/^[\s\S]*?(Your current skills include[:\s]*\n)/i, '')
  s = s.replace(/^[\s\S]*?(Your current skills are[:\s]*\n)/i, '')

  if (s.length < 8) {
    s = raw.replace(/\r\n/g, '\n').trim()
  }

  s = s.replace(/\n{3,}/g, '\n\n').trim()
  return s
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const fetchAnswer = async (question: string) => {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, mode: 'recommend' }), // send mode
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 429) {
        const secs = data?.retrySeconds ?? 30
        throw new Error(`Rate limited. Try again in ~${Math.ceil(secs)}s`)
      }
      throw new Error(data.error || 'Failed to get response')
    }

    const raw = data.answer || 'No answer found.'
    return sanitizeAnswer(raw)
  }

  const PROMPT_LIMIT = 30

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userPrompts = messages.filter((m) => m.role === 'user').length
    if (!input.trim() || loading) return
    if (userPrompts >= PROMPT_LIMIT) {
      setError(`Prompt limit reached (${PROMPT_LIMIT}).`)
      return
    }

    const question = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: question, question }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const answer = await fetchAnswer(question)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, question }])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to get response'
      setError(errMsg)
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry — ${errMsg}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (index: number) => {
    const message = messages[index]
    if (!message || message.role !== 'user' || !message.question) return

    const assistantIndex = index + 1
    setRegeneratingIndex(assistantIndex)
    setError(null)

    setMessages((prev) => {
      const newMessages = [...prev]
      if (newMessages[assistantIndex]) {
        newMessages[assistantIndex] = { role: 'assistant', content: 'Regenerating answer...', question: message.question }
      }
      return newMessages
    })

    try {
      const answer = await fetchAnswer(message.question)
      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages[assistantIndex]) {
          newMessages[assistantIndex] = { role: 'assistant', content: answer, question: message.question }
        }
        return newMessages
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to regenerate response'
      setError(errMsg)
      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages[assistantIndex] && newMessages[assistantIndex].content === 'Regenerating answer...') {
          newMessages[assistantIndex] = { role: 'assistant', content: `Failed to regenerate. ${errMsg}`, question: message.question }
        }
        return newMessages
      })
    } finally {
      setRegeneratingIndex(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat with Your Resume</h1>
              <p className="text-gray-600">Ask questions about your uploaded resume</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                Prompts left: {Math.max(PROMPT_LIMIT - messages.filter((m) => m.role === 'user').length, 0)} / {PROMPT_LIMIT}
              </div>
              <div className="flex gap-3">
                <button onClick={() => router.back()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium">← Back</button>
                <Link href="/" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium">Upload</Link>
                <Link href="/about" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium">About</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600 mb-6">Ask questions about your resume to get started</p>
                  <div className="space-y-2 max-w-md mx-auto">
                    <p className="text-sm text-gray-500 font-medium">Example questions:</p>
                    <div className="space-y-1">
                      <button onClick={() => setInput('What is my work experience?')} className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">What is my work experience?</button>
                      <button onClick={() => setInput('What are my skills?')} className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">What are my skills?</button>
                      <button onClick={() => setInput('What is my education background?')} className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">What is my education background?</button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                    {message.role === 'assistant' && message.question && (
                      <div className="flex justify-start pl-2">
                        <button onClick={() => handleRegenerate(index - 1)} disabled={regeneratingIndex === index} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {regeneratingIndex === index ? 'Regenerating...' : '🔄 Regenerate Answer'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-xs text-gray-600 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about your resume..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-50 disabled:text-gray-500" disabled={loading} />
                <button
                  type="submit"
                  disabled={!input.trim() || loading || messages.filter((m) => m.role === 'user').length >= PROMPT_LIMIT}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

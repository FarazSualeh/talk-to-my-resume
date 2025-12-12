'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const isValid =
      f.type === 'application/pdf' ||
      f.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.name.toLowerCase().endsWith('.pdf') ||
      f.name.toLowerCase().endsWith('.docx')
    if (!isValid) {
      setError('Please upload a PDF or DOCX file.')
      setFile(null)
      return
    }
    setFile(f)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }
    setUploading(true)
    setError(null)
    setSuccess(false)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      setSuccess(true)
      setTimeout(() => router.push('/chat'), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-100 border border-primary-400/30 text-xs font-semibold uppercase tracking-wide">
                Student-built • Privacy-first
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Talk to My Resume</h1>
              <p className="text-lg text-slate-200/90 max-w-2xl">
                Upload your resume, then ask focused questions. Fully local, no external DBs, answers grounded in your file.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-200/70">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">PDF / DOCX</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Local JSON storage</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Cosine similarity search</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">LLM answers (Gemini/Groq)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-start md:justify-end">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-400 transition"
              >
                Go to Chat →
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold shadow-sm hover:bg-white/15 transition"
              >
                About
              </Link>
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📄', title: 'Upload Resume', desc: 'PDF / DOCX up to 10MB, parsed locally.' },
              { icon: '💬', title: 'Ask Anything', desc: 'Grounded answers, no hallucinated sources.' },
              { icon: '🔒', title: 'Fully Local', desc: 'Text stored as JSON on your device.' },
            ].map((card) => (
              <div key={card.title} className="p-6 bg-white/10 border border-white/10 rounded-2xl shadow-lg shadow-black/30 backdrop-blur">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-200/90">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl shadow-2xl shadow-black/30 backdrop-blur p-8 md:p-10 mb-12">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume (PDF or DOCX)
                </label>
                <div className="rounded-xl border border-dashed border-white/30 bg-white/5 hover:border-primary-300 transition px-6 py-8 text-center text-white">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-semibold text-primary-700 hover:border-primary-500 cursor-pointer"
                  >
                    Choose file
                  </label>
                  <p className="mt-3 text-sm text-slate-200/80">Select a PDF or DOCX up to 10MB.</p>
                  {file && (
                    <p className="mt-3 text-sm text-primary-200 font-medium">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-green-400/60 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                  Uploaded successfully. Redirecting to chat...
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Go to Chat'}
                </button>
                <p className="text-sm text-slate-200/80">
                  Need to check answers?{' '}
                  <Link href="/chat" className="text-primary-200 font-semibold hover:underline">
                    Open chat directly
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl shadow-black/30 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-4">About this project</h2>
            <p className="text-slate-200/90 leading-relaxed mb-3">
              I built this as a student project to combine file parsing, embeddings-free search,
              and LLM prompting in a privacy-first way. Your resume is stored locally as JSON, and all queries stay here.
            </p>
            <p className="text-slate-200/90 leading-relaxed">
              Want to see more of my work?{' '}
              <a
                href="https://faraz-sualeh-portfolio.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-primary-200 font-semibold hover:underline"
              >
                Check my portfolio
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

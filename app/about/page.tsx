'use client'

import {
  Instagram,
  Github,
  Mail,
} from 'lucide-react'

export default function AboutPage() {
  const sections = [
    {
      title: 'Why I Built TalkToMyResume',
      body:
        "As a BSc IT student, I constantly saw students — including myself — struggle with resumes. Most resume tools are either too complicated, filled with ads, require paid plans, or handle personal data in unclear ways. I wanted a tool that is fast, transparent, and genuinely helpful. TalkToMyResume was built to let users understand how their resume reads through AI-driven, resume-grounded answers — without unnecessary complexity.",
    },
    {
      title: 'What Problem It Solves',
      body:
        "Many students have resumes but don’t know how clearly their experience is communicated. They are unsure what stands out, what feels weak, or what skills are missing for specific roles. Instead of blindly rewriting resumes, TalkToMyResume allows users to directly question their own resume content and receive focused insights grounded only in what they have written.",
    },
    {
      title: 'My Goals With This Project',
      body:
        "This project was built as a hands-on learning experience — covering frontend development, backend APIs, file parsing, AI integration, and deployment. Another goal was to create something genuinely useful for students and freshers, while also serving as a meaningful portfolio project rather than a simple demo app.",
    },
    {
      title: 'Future Roadmap',
      body:
        "Planned improvements include exportable insights, keyword highlighting, multi-resume comparison, minimal resume templates, better mobile UX, and optional offline support through PWA. The focus will remain on clarity, usefulness, and responsible handling of user data.",
    },
    {
      title: 'My Portfolio',
      body:
        "You can explore more of my projects and work here:",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <div className="container mx-auto px-4 py-16 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-100 border border-primary-400/30 text-xs font-semibold uppercase tracking-wide">
                About • Student-built project
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Behind TalkToMyResume
              </h1>
              <p className="text-slate-200/90 text-base md:text-lg max-w-2xl">
                A resume-grounded AI project built to help students better understand their own experience.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold shadow-sm hover:bg-white/15 transition text-sm"
              >
                ← Back to upload
              </a>
            </div>
          </header>

          {/* Main card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur p-8 md:p-10 space-y-8">
            {sections.map((section, idx) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  {section.title}
                </h2>
                <p className="text-sm md:text-base text-slate-200/90 leading-relaxed">
                  {section.body}{' '}
                  {section.title === 'My Portfolio' && (
                    <a
                      href="https://faraz-sualeh-portfolio.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-200 font-semibold hover:underline"
                    >
                      View my portfolio
                    </a>
                  )}
                </p>
                {idx < sections.length - 1 && (
                  <div className="h-px bg-white/10 mt-4" aria-hidden="true" />
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/60">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-slate-300">
          <p>© 2025 Faraz Sualeh. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/editsbyfaraz"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition"
            >
              <Instagram size={18} />
            </a>

            <a
              href="https://github.com/FarazSualeh"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-white transition"
            >
              <Github size={18} />
            </a>

            <a
              href="mailto:farazsualeh75@gmail.com"
              aria-label="Email"
              className="hover:text-white transition"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

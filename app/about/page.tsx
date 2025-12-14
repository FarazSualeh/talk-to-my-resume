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
            "While studying IT, I noticed that a lot of students, including myself, struggle with resumes. We write them, rewrite them, and still feel unsure about how they actually sound to others. Most tools I found were either confusing, paid, or unclear about how they handle personal data. I wanted something simple, fast, and honest. That is how TalkToMyResume started."
        },
        {
          title: 'What Problem It Solves',
          body:
            "Many students have resumes but do not really understand them. It is hard to tell what stands out, what sounds weak, or whether the content fits a specific role. People often keep editing without knowing what is wrong. This project lets users ask direct questions about their own resume and get answers based only on what they have written."
        },
        {
          title: 'My Goals With This Project',
          body:
            "I built this project mainly to learn by building something real. It helped me understand file uploads, text parsing, API design, AI integration, and deployment challenges. At the same time, I wanted it to be useful for students and freshers, not just a demo project sitting in a repository."
        },
        {
          title: 'Future Roadmap',
          body:
            "I plan to add features like downloadable insights, keyword highlighting, comparing multiple resumes, and a better mobile experience. I am also interested in exploring offline support using PWA. The goal is to keep improving the tool while keeping it simple and respectful of user data."
        },
        {
          title: 'My Portfolio',
          body:
            "You can check out more of my projects and work here:"
        }
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
                A simple project made by{" "}
                <a
                    href="https://faraz-sualeh-portfolio.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-200 font-semibold hover:underline"
                >
                    Faraz Sualeh
                </a>{" "}
                that lets you ask questions about your own resume.
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

'use client'

export default function AboutPage() {
  const sections = [
    {
      title: 'Why I Built TalkToMyResume',
      body:
        "As a BSc IT student, I constantly saw students — including myself — struggle with resumes. Most resume tools are either too complicated, filled with ads, require paid plans, or upload your personal data to external servers. I wanted a tool that keeps your data private, runs fast, and actually helps you understand how your own resume reads. That's why I built TalkToMyResume: a simple platform that lets your resume explain itself — clearly, safely, and instantly.",
    },
    {
      title: 'What Problem It Solves',
      body:
        "Many students have resumes, but they don't know how their experience actually sounds to others. They are unsure whether they’re communicating their strengths clearly, what seems weak or unclear, what skills stand out, or what’s missing for specific roles. People keep rewriting their resume without understanding what’s wrong. TalkToMyResume solves this by letting users talk to their resume and explore their own content in an interactive, structured way — without sending data to any external server.",
    },
    {
      title: 'My Goals With This Project',
      body:
        "I built this project to learn by doing — from web development to file handling, UI/UX design, and creating a smooth interactive experience. Another goal is to help students and freshers who struggle with understanding their resume quality. I also wanted a portfolio project that solves a real problem instead of being just a simple demo.",
    },
    {
      title: 'Future Roadmap',
      body:
        "I plan to add features like exportable insight summaries, keyword highlighting, multi-resume comparison, minimal resume templates, improved mobile UI, and eventually offline support through PWA. These additions will make the tool even more practical and privacy-focused while keeping everything simple and efficient.",
    },
    {
      title: 'My Portfolio',
      body:
        "Check my portfolio to see more of my work and projects.",
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
                A privacy-first resume Q&amp;A tool designed and built as a real-world learning
                project.
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
                      Click here to view my portfolio
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
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-slate-300">
          <p>© 2025 Faraz Sualeh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/editsbyfaraz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <span className="text-lg">📸</span>
              <span>@editsbyfaraz</span>
            </a>
            <a
              href="https://github.com/FarazSualeh"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <span className="text-lg">💻</span>
              <span>FarazSualeh</span>
            </a>
            <a
              href="mailto:farazsualeh75@gmail.com"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <span className="text-lg">✉️</span>
              <span>farazsualeh75@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

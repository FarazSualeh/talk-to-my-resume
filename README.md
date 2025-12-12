# Talk to My Resume

A Next.js application that allows you to upload your resume (PDF or DOCX) and ask questions about it using a local cosine-similarity search.

## Features

- 📄 Upload PDF or DOCX resumes
- 💬 Chat interface to ask questions about your resume
- 🤖 Powered by Groq LLaMA 3.1 8B for natural language answers
- 🔍 Local cosine-similarity search for finding relevant information
- 🔄 Regenerate answers with a single click
- 🔒 Resume data stored locally (JSON file)
- 🎨 Beautiful, modern UI with TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Groq API key (get one at [https://console.groq.com](https://console.groq.com))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your Groq API key:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Resume**: Go to the home page and upload your resume (PDF or DOCX format)
2. **Ask Questions**: Navigate to the chat page and ask questions about your resume
3. **Get Answers**: The system will search through your resume and provide relevant answers

## Example Questions

- "What is my work experience?"
- "What are my skills?"
- "What is my education background?"
- "Tell me about my previous jobs"
- "What programming languages do I know?"

## Project Structure

```
talk-to-my-resume/
├── app/
│   ├── api/
│   │   ├── upload/      # API route for file upload
│   │   └── query/       # API route for questions
│   ├── chat/           # Chat page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home/upload page
│   └── globals.css      # Global styles
├── lib/
│   └── utils.ts         # Utility functions for text processing
├── data/                # Local storage for resume data (gitignored)
└── package.json
```

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction
- **groq-sdk** - Groq API client for LLaMA 3.1 8B model
- **cosine-similarity** - Local similarity search (custom implementation)

## License

MIT


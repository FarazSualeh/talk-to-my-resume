import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { saveResumeText } from '@/lib/resumeStore'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (
      !fileType.includes('pdf') &&
      !fileType.includes('wordprocessingml') &&
      !fileName.endsWith('.pdf') &&
      !fileName.endsWith('.docx')
    ) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let extractedText = ''

    // Extract text
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } else {
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file.' },
        { status: 400 }
      )
    }

    // Making it Vercel-safe by using Upstash Redis
    await saveResumeText(extractedText)


    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      textLength: extractedText.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}


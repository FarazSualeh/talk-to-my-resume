import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Extract text based on file type
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to parse PDF file. Please ensure it is a valid PDF.' },
          { status: 400 }
        )
      }
    } else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to parse DOCX file. Please ensure it is a valid DOCX file.' },
          { status: 400 }
        )
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file.' },
        { status: 400 }
      )
    }

    // Save extracted text to JSON file
    const dataDir = join(process.cwd(), 'data')
    await mkdir(dataDir, { recursive: true })
    
    const { saveResumeText } = await import('@/lib/utils')
    saveResumeText(extractedText)

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      textLength: extractedText.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file. Please try again.' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime for PDF parsing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

// Direct PDF parsing function with error handling
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log('🔧 Starting PDF parsing...')
    
    // Try to import pdf-parse-debugging-disabled with fallback
    let pdfParse: any;
    try {
      pdfParse = (await import('pdf-parse-debugging-disabled')).default
    } catch (importError) {
      console.error('Failed to import pdf-parse-debugging-disabled:', importError)
      // Try alternative import
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        pdfParse = require('pdf-parse-debugging-disabled')
      } catch (requireError) {
        console.error('Failed to require pdf-parse-debugging-disabled:', requireError)
        throw new Error('PDF parsing temporarily unavailable. Please copy and paste your CV text instead.')
      }
    }
    
    // Convert ArrayBuffer to Buffer
    const nodeBuffer = Buffer.from(buffer)
    
    console.log('📄 Buffer size:', nodeBuffer.length)
    
    // Parse the PDF with error handling
    let data;
    try {
      data = await pdfParse(nodeBuffer, {
        // Ensure we're not in debug mode
        max: 0,
        // Add version info to help with debugging
        version: 'v2.0.550'
      })
    } catch (parseError: any) {
      console.error('PDF parse error:', parseError)
      // Provide more specific error message
      if (parseError.message?.includes('No PDF header found')) {
        throw new Error('Invalid PDF file. Please ensure the file is a valid PDF document.')
      }
      throw new Error(`PDF parsing failed: ${parseError.message || 'Unknown error'}`)
    }
    
    console.log('✅ PDF parsed successfully')
    console.log('📄 Pages:', data.numpages)
    console.log('📄 Text length:', data.text?.length || 0)
    
    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF contains insufficient readable text. This might be a scanned PDF or image-based document.')
    }
    
    // Clean and return the text with improved spacing
    let cleanedText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .trim()
    
    // Fix common concatenation issues with contact information
    // Add space before email addresses if they're concatenated with numbers
    cleanedText = cleanedText.replace(/(\d)([a-zA-Z]+@)/g, '$1 $2')
    
    // Add space after email addresses if they're concatenated with other text
    cleanedText = cleanedText.replace(/(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})([a-zA-Z])/g, '$1 $2')
    
    // Fix phone numbers concatenated with other text
    // Add space after phone-like patterns (7+ digits)
    cleanedText = cleanedText.replace(/(\d{7,})([a-zA-Z])/g, '$1 $2')
    
    // Fix URLs concatenated with other text
    cleanedText = cleanedText.replace(/(https?:\/\/[^\s]+)([a-zA-Z0-9])/g, '$1 $2')
    cleanedText = cleanedText.replace(/([a-zA-Z0-9])(https?:\/\/)/g, '$1 $2')
    
    // Fix common patterns where contact info elements are concatenated
    // Phone + Email pattern
    cleanedText = cleanedText.replace(/(\+?\d{7,15})([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1 $2')
    
    // Email + URL pattern
    cleanedText = cleanedText.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(https?:\/\/)/g, '$1 $2')
    
    // Fix specific pattern: email.comhttp
    cleanedText = cleanedText.replace(/(@[a-zA-Z0-9.-]+\.com)http/g, '$1 http')
    cleanedText = cleanedText.replace(/(@[a-zA-Z0-9.-]+\.ie)http/g, '$1 http')
    cleanedText = cleanedText.replace(/(@[a-zA-Z0-9.-]+\.co\.uk)http/g, '$1 http')
    
    // Debug: Log if we fixed any concatenation issues
    if (cleanedText !== data.text) {
      console.log('✅ Applied text cleaning fixes')
      // Check if contact info is now properly spaced
      const emailCheck = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
      if (emailCheck) {
        console.log('📧 Emails after cleaning:', emailCheck)
      }
    }
    
    return cleanedText
      
  } catch (error) {
    console.error('❌ PDF parsing error:', error)
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // More conservative file size limit for Vercel
    if (file.size > 5 * 1024 * 1024) { // 5MB limit  
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed for reliable processing.' },
        { status: 400 }
      )
    }

    try {
      // Get file buffer and extract text
      const buffer = await file.arrayBuffer()
      const extractedText = await extractPDFText(buffer)

      console.log('PDF text extraction successful, length:', extractedText.length)
      
      return NextResponse.json({
        success: true,
        text: extractedText,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      })
      
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError)
      
      // Return fallback for PDF parsing issues
      return NextResponse.json({
        success: false,
        error: 'Could not extract text from this PDF. Please copy and paste your CV text for the best results.',
        fallback: true,
        suggestion: 'Copy your entire CV text and paste it in the text area that will appear.',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }, { status: 200 })
    }
    
  } catch (error: unknown) {
    console.error('General PDF processing error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Could not process file. Please try again or use the text input option.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
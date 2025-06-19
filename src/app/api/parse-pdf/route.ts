import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const buffer = await request.arrayBuffer()
    
    // Check if pdf-parse is available
    let pdfParse: any
    try {
      pdfParse = (await import('pdf-parse')).default
    } catch (importError) {
      console.log('pdf-parse not available, using fallback')
      return NextResponse.json({
        success: false,
        error: 'PDF reading feature is currently unavailable. Please copy-paste your CV text.',
        fallback: true
      }, { status: 503 })
    }
    
    // Parse PDF
    const data = await pdfParse(Buffer.from(buffer))
    
    // Extract and clean text
    let cleanText = data.text || ''
    
    // Basic text cleaning
    cleanText = cleanText
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s{3,}/g, ' ')    // Remove excessive spaces
      .trim()
    
    if (!cleanText || cleanText.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract sufficient text from PDF. Please copy-paste your CV text.',
        extractedLength: cleanText.length
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      text: cleanText,
      pages: data.numpages || 1,
      wordCount: cleanText.split(/\s+/).length,
      info: {
        ...data.info,
        extractedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    
    // More specific error messages
    let errorMessage = 'Could not read PDF file.'
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'Invalid PDF file. Please try a different PDF.'
      } else if (error.message.includes('Password')) {
        errorMessage = 'Password-protected PDF files are not supported.'
      } else if (error.message.includes('Corrupt')) {
        errorMessage = 'PDF file appears to be corrupted.'
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage + ' You can continue by copy-pasting your CV text.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
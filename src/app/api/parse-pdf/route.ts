import { NextRequest, NextResponse } from 'next/server'
import { cleanPDFText } from '@/lib/pdf-text-cleaner'
import { generateContent, validateApiKey } from '@/lib/gemini-client'

export async function POST(request: NextRequest) {
  try {
    const buffer = await request.arrayBuffer()
    
    // Check if pdf-parse is available
    let pdfParse: any
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    // Extract and clean text using the utility function
    let cleanText = cleanPDFText(data.text || '')
    
    if (!cleanText || cleanText.length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract sufficient text from PDF. Please copy-paste your CV text.',
        extractedLength: cleanText.length
      }, { status: 400 })
    }

    // Use Gemini to improve and structure the CV text if available
    try {
      // Check if Gemini is available
      const apiKeyCheck = validateApiKey()
      if (!apiKeyCheck) {
        const improvePrompt = `
You are a professional CV text processor. The following text was extracted from a PDF but has formatting issues and broken words. Please:

1. Fix all broken words and ligature issues
2. Properly format the CV with clear sections
3. Ensure all contact information is preserved
4. Fix any OCR/extraction errors
5. Maintain all original content - don't add or remove information
6. Structure the text in a professional, ATS-friendly format
7. Preserve all dates, numbers, and technical terms exactly
8. Fix spacing and line breaks for readability

Original extracted text:
${cleanText}

Please return the cleaned and properly formatted CV text:
`

        const geminiResult = await generateContent(improvePrompt, {
          context: 'cvOptimization',
          temperature: 0.1, // Low temperature for precise text cleaning
          maxTokens: 4000
        })

        if (geminiResult.success && geminiResult.content) {
          // Use Gemini-improved text if successful
          cleanText = geminiResult.content.trim()
          
          return NextResponse.json({
            success: true,
            text: cleanText,
            pages: data.numpages || 1,
            wordCount: cleanText.split(/\s+/).length,
            enhanced: true, // Flag to indicate Gemini enhancement was used
            info: {
              ...data.info,
              extractedAt: new Date().toISOString(),
              enhancedWithAI: true
            }
          })
        }
      }
    } catch (geminiError) {
      console.log('Gemini enhancement failed, using basic cleaning:', geminiError)
      // Continue with basic cleaning if Gemini fails
    }
    
    return NextResponse.json({
      success: true,
      text: cleanText,
      pages: data.numpages || 1,
      wordCount: cleanText.split(/\s+/).length,
      enhanced: false, // Basic cleaning only
      info: {
        ...data.info,
        extractedAt: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
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
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
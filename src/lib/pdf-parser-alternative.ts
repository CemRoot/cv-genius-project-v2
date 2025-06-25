// Alternative PDF parsing implementation for Next.js
import type { NextRequest } from 'next/server'

export async function parsePDFBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for Node.js compatibility
    const nodeBuffer = Buffer.from(buffer)
    
    // Use pdf-parse-debugging-disabled to avoid test file errors
    const pdfParse = (await import('pdf-parse-debugging-disabled')).default
    
    console.log('🔧 Starting PDF parsing with pdf-parse...')
    
    // Parse the PDF
    const data = await pdfParse(nodeBuffer)
    
    console.log('📄 PDF info:', {
      pages: data.numpages,
      info: data.info,
      textLength: data.text?.length || 0
    })
    
    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF contains insufficient readable text')
    }
    
    // Clean and format the text
    const cleanedText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .trim()
    
    return cleanedText
  } catch (error) {
    console.error('❌ PDF parsing error:', error)
    throw error
  }
}

// Alternative: Use pdfjs-dist for client-side parsing if needed
export async function parsePDFClient(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // This would be used in a client component
    // const pdfjsLib = await import('pdfjs-dist')
    // ... parsing logic ...
    
    // For now, throw an error to use server-side parsing
    throw new Error('Client-side parsing not implemented')
  } catch (error) {
    console.error('Client-side PDF parsing failed:', error)
    throw error
  }
}
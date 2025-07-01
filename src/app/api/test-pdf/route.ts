import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test if pdf-parse-debugging-disabled can be imported
    const pdfParse = (await import('pdf-parse-debugging-disabled')).default
    
    return NextResponse.json({
      success: true,
      message: 'PDF parse module loaded successfully',
      nodeVersion: process.version,
      platform: process.platform
    })
  } catch (error: any) {
    console.error('PDF parse test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      nodeVersion: process.version,
      platform: process.platform
    }, { status: 500 })
  }
}
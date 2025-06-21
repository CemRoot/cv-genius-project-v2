import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string
    const files = formData.getAll('files') as File[]

    // Handle shared files (CV uploads)
    if (files.length > 0) {
      const file = files[0]
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
      }
      
      // Redirect to import page with file processing
      const searchParams = new URLSearchParams({
        source: 'share',
        filename: file.name,
        type: file.type
      })
      
      return NextResponse.redirect(
        new URL(`/import?${searchParams.toString()}`, request.url)
      )
    }
    
    // Handle shared URL
    if (url) {
      const searchParams = new URLSearchParams({
        source: 'share',
        url: url
      })
      
      return NextResponse.redirect(
        new URL(`/import?${searchParams.toString()}`, request.url)
      )
    }
    
    // Handle shared text
    if (text || title) {
      const searchParams = new URLSearchParams({
        source: 'share',
        ...(title && { title }),
        ...(text && { text })
      })
      
      return NextResponse.redirect(
        new URL(`/builder?${searchParams.toString()}`, request.url)
      )
    }
    
    // Default redirect to home
    return NextResponse.redirect(new URL('/', request.url))
    
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json(
      { error: 'Failed to process shared content' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle protocol handler requests (web+cvgenius://)
  const { searchParams } = new URL(request.url)
  const importUrl = searchParams.get('url')
  
  if (importUrl) {
    const params = new URLSearchParams({
      source: 'protocol',
      url: importUrl
    })
    
    return NextResponse.redirect(
      new URL(`/import?${params.toString()}`, request.url)
    )
  }
  
  return NextResponse.redirect(new URL('/', request.url))
}
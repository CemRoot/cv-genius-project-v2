import { NextResponse } from 'next/server'

export async function GET() {
  const content = `# ads.txt file for cvgenius.ie
# This file specifies which ad networks are authorized to sell advertising on this site
# Updated: ${new Date().toISOString().split('T')[0]}

# Google AdSense - Primary ad network
google.com, pub-1742989559393752, DIRECT, f08c47fec0942fa0

# Google Ad Manager (DoubleClick for Publishers) - if using
google.com, pub-1742989559393752, DIRECT, f08c47fec0942fa0`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  })
} 
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    // Check Vercel integration status
    const hasVercelToken = !!process.env.VERCEL_TOKEN
    const hasProjectId = !!process.env.VERCEL_PROJECT_ID
    const hasTeamId = !!process.env.VERCEL_TEAM_ID
    const hasKV = !!process.env.KV_REST_API_URL

    return NextResponse.json({
      success: true,
      vercel: {
        configured: hasVercelToken && hasProjectId,
        hasToken: hasVercelToken,
        hasProjectId: hasProjectId,
        hasTeamId: hasTeamId,
        kvConfigured: hasKV
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check Vercel status' },
      { status: 500 }
    )
  }
}
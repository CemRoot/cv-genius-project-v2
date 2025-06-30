import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
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

    const { ips } = await request.json()
    
    if (!ips || !Array.isArray(ips)) {
      return NextResponse.json({ error: 'Invalid IP list' }, { status: 400 })
    }

    // Vercel API credentials
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID // Optional

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({ 
        error: 'Vercel integration not configured. Please set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.' 
      }, { status: 500 })
    }

    // Update environment variable via Vercel API
    const apiUrl = VERCEL_TEAM_ID 
      ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`

    // First, get the existing env var ID
    const getResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    })

    if (!getResponse.ok) {
      throw new Error('Failed to fetch environment variables')
    }

    const envVars = await getResponse.json()
    const existingVar = envVars.envs?.find((env: any) => env.key === 'ADMIN_IP_WHITELIST')

    // Delete existing if found
    if (existingVar) {
      const deleteUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}`

      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
        }
      })
    }

    // Create new env var
    const createResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'ADMIN_IP_WHITELIST',
        value: ips.join(','),
        type: 'encrypted',
        target: ['production', 'preview', 'development']
      })
    })

    if (!createResponse.ok) {
      const error = await createResponse.text()
      throw new Error(`Failed to update environment variable: ${error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'IP whitelist updated in Vercel. Changes will take effect on next deployment.',
      ips: ips
    })

  } catch (error) {
    console.error('Vercel update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Vercel environment' },
      { status: 500 }
    )
  }
}
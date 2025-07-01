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

    // Get current API configurations
    const apiConfig = {
      gemini: {
        enabled: !!process.env.GEMINI_API_KEY || !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        hasKey: !!process.env.GEMINI_API_KEY,
        hasPublicKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        model: 'gemini-1.5-flash'
      },
      huggingface: {
        enabled: !!process.env.HUGGINGFACE_API_KEY,
        hasKey: !!process.env.HUGGINGFACE_API_KEY
      },
      vercel: {
        enabled: !!process.env.VERCEL_TOKEN && !!process.env.VERCEL_PROJECT_ID,
        hasToken: !!process.env.VERCEL_TOKEN,
        hasProjectId: !!process.env.VERCEL_PROJECT_ID,
        kvEnabled: !!process.env.KV_REST_API_URL
      },
      security: {
        ipWhitelistEnabled: process.env.DISABLE_IP_WHITELIST !== 'true',
        jwtConfigured: !!process.env.JWT_SECRET,
        adminConfigured: !!process.env.ADMIN_USERNAME && !!process.env.ADMIN_PWD_HASH_B64
      },
      features: {
        adsEnabled: !!process.env.NEXT_PUBLIC_ADSENSE_PUB_ID,
        analyticsEnabled: false, // Can be expanded later
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
      }
    }

    return NextResponse.json({
      success: true,
      config: apiConfig
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get API configuration' },
      { status: 500 }
    )
  }
}

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

    const { updates } = await request.json()
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid updates' }, { status: 400 })
    }

    // Process updates
    const results = []

    // Update maintenance mode
    if ('maintenanceMode' in updates) {
      process.env.MAINTENANCE_MODE = updates.maintenanceMode ? 'true' : 'false'
      results.push({ key: 'maintenanceMode', success: true })
    }

    // Update IP whitelist
    if ('ipWhitelistEnabled' in updates) {
      process.env.DISABLE_IP_WHITELIST = updates.ipWhitelistEnabled ? 'false' : 'true'
      results.push({ key: 'ipWhitelistEnabled', success: true })
    }

    // For Vercel environment updates
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      const vercelUpdates = []
      
      if ('maintenanceMode' in updates) {
        vercelUpdates.push({
          key: 'MAINTENANCE_MODE',
          value: updates.maintenanceMode ? 'true' : 'false'
        })
      }
      
      if ('ipWhitelistEnabled' in updates) {
        vercelUpdates.push({
          key: 'DISABLE_IP_WHITELIST',
          value: updates.ipWhitelistEnabled ? 'false' : 'true'
        })
      }

      // Update Vercel if needed
      if (vercelUpdates.length > 0) {
        try {
          await updateVercelEnv(vercelUpdates)
          results.push({ key: 'vercel', success: true, message: 'Vercel updated' })
        } catch (error) {
          results.push({ key: 'vercel', success: false, message: 'Failed to update Vercel' })
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Configuration updated. Some changes may require redeployment.'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

async function updateVercelEnv(updates: Array<{key: string, value: string}>) {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel not configured')
  }

  const apiUrl = VERCEL_TEAM_ID 
    ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
    : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`

  // Get existing vars
  const getResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    }
  })

  if (!getResponse.ok) {
    throw new Error('Failed to fetch env vars')
  }

  const envData = await getResponse.json()

  // Update each variable
  for (const update of updates) {
    const existingVar = envData.envs?.find((env: any) => env.key === update.key)
    
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

    // Create new
    const createResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: update.key,
        value: update.value,
        type: 'plain',
        target: ['production', 'preview', 'development']
      })
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to update ${update.key}`)
    }
  }
}
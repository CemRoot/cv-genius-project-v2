import { NextRequest, NextResponse } from 'next/server'
import { VercelAPI } from '@/lib/vercel-api'

export async function POST(request: NextRequest) {
  try {
    // Authentication is handled by middleware, admin info is in headers
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, environment = 'production' } = body

    console.log(`🚀 Admin (${adminEmail}): Updating Vercel ${environment} environment`)

    if (action === 'update_ip_whitelist') {
      // Get current IP whitelist from environment
      const currentWhitelist = process.env.ADMIN_IP_WHITELIST || ''
      
      if (!currentWhitelist) {
        return NextResponse.json({ 
          error: 'No IP whitelist found in current environment' 
        }, { status: 400 })
      }

      // Check if Vercel API is configured
      if (!VercelAPI.isConfigured()) {
        const config = VercelAPI.getConfigurationStatus()
        return NextResponse.json({ 
          error: `Vercel API not configured: ${config.instructions}` 
        }, { status: 400 })
      }

      // Update Vercel environment variables
      const results = []
      
      // Update IP whitelist
      const ipResult = await VercelAPI.updateEnvironmentVariable('ADMIN_IP_WHITELIST', currentWhitelist, ['production'])
      results.push(`ADMIN_IP_WHITELIST: ${ipResult.message}`)
      
      // Update NODE_ENV
      const nodeResult = await VercelAPI.updateEnvironmentVariable('NODE_ENV', 'production', ['production'])
      results.push(`NODE_ENV: ${nodeResult.message}`)
      
      // Disable IP whitelist bypass
      const bypassResult = await VercelAPI.updateEnvironmentVariable('DISABLE_IP_WHITELIST', 'false', ['production'])
      results.push(`DISABLE_IP_WHITELIST: ${bypassResult.message}`)

      const allSuccessful = ipResult.success && nodeResult.success && bypassResult.success

      if (allSuccessful) {
        console.log(`✅ Admin (${adminEmail}): Vercel ${environment} environment updated successfully`)
        return NextResponse.json({ 
          success: true, 
          message: `Vercel ${environment} environment updated successfully!\\n${results.join('\\n')}`,
          updatedVariables: ['ADMIN_IP_WHITELIST', 'NODE_ENV', 'DISABLE_IP_WHITELIST'],
          currentWhitelist: currentWhitelist
        })
      } else {
        console.log(`❌ Admin (${adminEmail}): Some Vercel environment updates failed`)
        return NextResponse.json({ 
          error: `Some environment updates failed:\\n${results.join('\\n')}`
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('💥 Vercel environment update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 
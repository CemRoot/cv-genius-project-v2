import { NextRequest, NextResponse } from 'next/server'
import { VercelAPI } from '@/lib/vercel-api'
import IPWhitelistManager from '@/lib/ip-whitelist'

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
    const { action } = body

    console.log(`🔄 Admin (${adminEmail}): Syncing IP whitelist with Vercel`)

    if (action === 'sync_whitelist') {
      // Check if Vercel API is configured
      if (!VercelAPI.isConfigured()) {
        const config = VercelAPI.getConfigurationStatus()
        return NextResponse.json({ 
          error: `Vercel API not configured: ${config.instructions}` 
        }, { status: 400 })
      }

      // Get current local IP whitelist
      const localEntries = IPWhitelistManager.getAllEntries()
      const localIPs = localEntries.map(entry => entry.ip)
      const localWhitelistString = localIPs.join(',')

      // Get current Vercel environment variables
      const vercelResult = await VercelAPI.getEnvironmentVariables()
      
      if (!vercelResult.success) {
        return NextResponse.json({ 
          error: `Failed to fetch Vercel environment: ${vercelResult.message}` 
        }, { status: 500 })
      }

      // Find the current ADMIN_IP_WHITELIST in Vercel
      const vercelIPWhitelist = vercelResult.data?.find((env: any) => env.key === 'ADMIN_IP_WHITELIST')
      const vercelWhitelistString = vercelIPWhitelist?.value || ''
      
      // Compare local and Vercel whitelists
      const comparison = {
        local: localWhitelistString,
        vercel: vercelWhitelistString,
        isInSync: localWhitelistString === vercelWhitelistString,
        localCount: localIPs.length,
        vercelCount: vercelWhitelistString ? vercelWhitelistString.split(',').length : 0
      }

      if (comparison.isInSync) {
        console.log(`✅ Admin (${adminEmail}): IP whitelists are already in sync`)
        return NextResponse.json({ 
          success: true, 
          message: `IP whitelists are already in sync!\\nLocal: ${comparison.localCount} IPs\\nVercel: ${comparison.vercelCount} IPs`,
          comparison: comparison,
          action: 'no_changes_needed'
        })
      }

      // Update Vercel with local whitelist
      const updateResult = await VercelAPI.updateEnvironmentVariable('ADMIN_IP_WHITELIST', localWhitelistString, ['production'])
      
      if (updateResult.success) {
        console.log(`✅ Admin (${adminEmail}): Successfully synced IP whitelist to Vercel`)
        return NextResponse.json({ 
          success: true, 
          message: `IP whitelist synced successfully!\\nUpdated Vercel with ${comparison.localCount} IPs\\nOld Vercel: ${comparison.vercelCount} IPs`,
          comparison: comparison,
          action: 'updated_vercel',
          newWhitelist: localWhitelistString
        })
      } else {
        console.log(`❌ Admin (${adminEmail}): Failed to sync IP whitelist: ${updateResult.message}`)
        return NextResponse.json({ 
          error: `Failed to update Vercel: ${updateResult.message}`
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('💥 Vercel sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 
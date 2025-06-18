import { NextRequest, NextResponse } from 'next/server'
import IPWhitelistManager from '@/lib/ip-whitelist'

export async function GET(request: NextRequest) {
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

    const entries = IPWhitelistManager.getAllEntries()
    const currentIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    return NextResponse.json({
      success: true,
      entries: entries,
      currentIP: currentIP,
      isFirstTimeSetup: IPWhitelistManager.isFirstTimeSetup()
    })

  } catch (error) {
    console.error('IP Whitelist GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to load IP whitelist' },
      { status: 500 }
    )
  }
}

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
    const { action, ip, label } = body

    const currentIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    if (action === 'add') {
      if (!ip) {
        return NextResponse.json(
          { error: 'IP address is required' },
          { status: 400 }
        )
      }

      const success = IPWhitelistManager.addIP(ip, label || 'Admin IP')
      
      if (success) {
        console.log(`🔒 Admin (${adminEmail}): Added IP ${ip} to whitelist`)
        return NextResponse.json({
          success: true,
          message: `IP ${ip} added to whitelist`,
          entries: IPWhitelistManager.getAllEntries()
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to add IP to whitelist' },
          { status: 500 }
        )
      }
    }

    if (action === 'remove') {
      if (!ip) {
        return NextResponse.json(
          { error: 'IP address is required' },
          { status: 400 }
        )
      }

      // Prevent removing current IP
      if (ip === currentIP || currentIP.includes(ip)) {
        return NextResponse.json(
          { error: 'Cannot remove your current IP address' },
          { status: 400 }
        )
      }

      const success = IPWhitelistManager.removeIP(ip)
      
      if (success) {
        console.log(`🔒 Admin (${adminEmail}): Removed IP ${ip} from whitelist`)
        return NextResponse.json({
          success: true,
          message: `IP ${ip} removed from whitelist`,
          entries: IPWhitelistManager.getAllEntries()
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to remove IP from whitelist' },
          { status: 500 }
        )
      }
    }

    if (action === 'add-current') {
      const success = IPWhitelistManager.addIP(currentIP, label || `Admin IP (${new Date().toLocaleDateString()})`)
      
      if (success) {
        console.log(`🔒 Admin (${adminEmail}): Added current IP ${currentIP} to whitelist`)
        return NextResponse.json({
          success: true,
          message: `Your current IP ${currentIP} has been added to whitelist`,
          entries: IPWhitelistManager.getAllEntries()
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to add current IP to whitelist' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('IP Whitelist POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
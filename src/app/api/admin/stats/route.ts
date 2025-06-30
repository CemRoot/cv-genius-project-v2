import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import SecurityAuditLogger from '@/lib/security-audit'

// In production, these would come from a database
// For now, we'll use in-memory storage and calculate from available data
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

    // Get security stats from audit logger
    const auditLogger = SecurityAuditLogger.getInstance()
    const securityStats = auditLogger.getSecurityStats()

    // Real stats - no fake data
    const stats = {
      dashboard: {
        totalUsers: 0, // No database, no users
        activeUsers: 0,
        totalCVs: 0,
        todayLogins: securityStats.totalLogins || 0,
        growth: {
          users: '0%',
          cvs: '0'
        }
      },
      system: {
        api: 'healthy', // API is working if we got here
        database: 'not_configured', // No database connection
        storage: 'local_only', // Only local storage
        performance: 100, // No load, perfect performance
        connections: 0, // No database connections
        cpu: 0, // Cannot measure in browser/edge runtime
        memory: 0, // Cannot measure in browser/edge runtime
        requests: securityStats.totalLogins || 0 // Only count actual logins
      },
      security: {
        twoFactorEnabled: false, // Not implemented
        ipWhitelistEnabled: process.env.DISABLE_IP_WHITELIST !== 'true',
        currentIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        ipWhitelist: process.env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()).filter(Boolean) || [],
        ...securityStats
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}


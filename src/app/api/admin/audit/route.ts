import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import SecurityAuditLogger from '@/lib/security-audit'

// JWT secret must be set via environment variable
let JWT_SECRET: Uint8Array | null = null
try {
  if (process.env.JWT_SECRET) {
    JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
  }
} catch (e) {
  console.error('Failed to initialize JWT_SECRET:', e)
}

// Auth check function
async function checkAuth(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token = authHeader.split(' ')[1]
    await jose.jwtVerify(token, JWT_SECRET)
    return null // No error
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

interface AuditLog {
  id: string
  timestamp: string
  adminId: string
  adminEmail: string
  action: string
  details: string
  ip: string
  userAgent: string
  success: boolean
}

// In production, store in database
let auditLogs: AuditLog[] = []

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResponse = await checkAuth(request)
    if (authResponse) {
      return authResponse
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const eventId = url.searchParams.get('eventId')

    const auditLogger = SecurityAuditLogger.getInstance()

    switch (action) {
      case 'stats':
        const stats = auditLogger.getSecurityStats()
        return NextResponse.json({
          success: true,
          stats
        })

      case 'events':
        const events = auditLogger.getRecentEvents(limit)
        return NextResponse.json({
          success: true,
          events
        })

      case 'event-details':
        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID is required' },
            { status: 400 }
          )
        }
        const eventDetails = auditLogger.getEventDetails(eventId)
        if (!eventDetails) {
          return NextResponse.json(
            { error: 'Event not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          event: eventDetails
        })

      default:
        // Return combined dashboard data
        return NextResponse.json({
          success: true,
          stats: auditLogger.getSecurityStats(),
          recentEvents: auditLogger.getRecentEvents(20)
        })
    }

  } catch (error) {
    console.error('Audit API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResponse = await checkAuth(request)
    if (authResponse) {
      return authResponse
    }

    const body = await request.json()
    const { action } = body

    const auditLogger = SecurityAuditLogger.getInstance()

    switch (action) {
      case 'clear-old-logs':
        const daysOld = parseInt(body.daysOld) || 30
        auditLogger.clearOldLogs(daysOld)
        return NextResponse.json({
          success: true,
          message: `Cleared logs older than ${daysOld} days`
        })

      case 'manual-log':
        await auditLogger.logEvent({
          eventType: body.eventType,
          userId: body.userId || 'admin',
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: body.metadata || {}
        })
        return NextResponse.json({
          success: true,
          message: 'Event logged successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Audit API POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to add audit logs from other parts of the application
export function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  details: string,
  ip: string,
  userAgent: string,
  success: boolean = true
) {
  const auditEntry: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    adminId,
    adminEmail,
    action,
    details,
    ip,
    userAgent,
    success
  }

  auditLogs.push(auditEntry)

  // Keep only last 1000 entries
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000)
  }

  console.log(`📋 Audit Log: ${action} by ${adminEmail} from ${ip}`)
}
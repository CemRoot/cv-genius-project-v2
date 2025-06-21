import { NextRequest, NextResponse } from 'next/server'

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
    // Authentication is handled by middleware
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const action = url.searchParams.get('action')

    // Filter logs
    let filteredLogs = [...auditLogs]
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(action))
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Paginate
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Audit Log API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, details, success = true } = body

    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const adminId = request.headers.get('x-admin-id') || 'system'
    const adminEmail = request.headers.get('x-admin-email') || 'system@cvgenius.com'

    const auditEntry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      adminId,
      adminEmail,
      action,
      details,
      ip: clientIP,
      userAgent,
      success
    }

    // In production, save to database
    auditLogs.push(auditEntry)

    // Keep only last 1000 entries in memory
    if (auditLogs.length > 1000) {
      auditLogs = auditLogs.slice(-1000)
    }

    console.log(`📋 Audit Log: ${action} by ${adminEmail} from ${clientIP}`)

    return NextResponse.json({
      success: true,
      message: 'Audit log created'
    })

  } catch (error) {
    console.error('Audit Log Creation Error:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
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
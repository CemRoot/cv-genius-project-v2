import crypto from 'crypto'

/**
 * Security Audit Logger - In-Memory Implementation
 * 
 * This class provides security audit logging functionality using only in-memory storage.
 * No file system operations are performed - all data is stored in memory.
 * 
 * For production use, audit logs are sent to Vercel environment variables for persistence.
 * Memory limits are enforced to prevent excessive memory usage.
 */

// Types for audit logging
export interface AuditEvent {
  id: string
  timestamp: string
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | '2FA_ENABLE' | '2FA_DISABLE' | 'IP_BLOCKED' | 'SESSION_EXPIRED'
  userId: string
  ip: string
  userAgent: string
  metadata: Record<string, any> | string
  encrypted: boolean
}

export interface LoginAttempt {
  ip: string
  timestamp: string
  success: boolean
  username: string
  failureReason?: string
  userAgent: string
  location?: string
}

export interface SecurityStats {
  totalLogins: number
  failedLogins: number
  lastLogin: string
  lastLoginIP: string
  totalSessions: number
  activeSessions: number
  blockedIPs: string[]
  recentAttempts: LoginAttempt[]
}

class SecurityAuditLogger {
  private static instance: SecurityAuditLogger
  private auditLog: AuditEvent[] = []
  private loginAttempts: LoginAttempt[] = []
  private encryptionKey: string

  constructor() {
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
    
    // In production, audit logs should be stored in a database or external service
    // For now, we use in-memory storage which resets on deployment
    console.log('🔒 Security Audit Logger initialized (in-memory mode)')
  }

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger()
    }
    return SecurityAuditLogger.instance
  }

  // In-memory storage operations (no file system access)
  private saveToMemory(): void {
    // Keep only last 1000 audit events
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000)
    }
    
    // Keep only last 500 login attempts
    if (this.loginAttempts.length > 500) {
      this.loginAttempts = this.loginAttempts.slice(-500)
    }
    
    // Log memory usage for monitoring
    if (process.env.NODE_ENV === 'production') {
      console.log(`🔒 Audit log size: ${this.auditLog.length} events, ${this.loginAttempts.length} login attempts`)
    }
  }

  // Encrypt sensitive data
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  // Decrypt sensitive data
  private decrypt(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  // Log audit event
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'encrypted'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      encrypted: true,
      ...event,
      metadata: this.encrypt(JSON.stringify(event.metadata))
    }

    this.auditLog.push(auditEvent)
    
    // Save to memory only (handles size limits)
    this.saveToMemory()
    
    // Send to Vercel if configured (for persistent storage)
    await this.sendToVercel(auditEvent)
  }

  // Log login attempt
  async logLoginAttempt(attempt: LoginAttempt): Promise<void> {
    this.loginAttempts.push(attempt)
    
    // Save to memory only (handles size limits)
    this.saveToMemory()
    
    // Log as audit event
    await this.logEvent({
      eventType: attempt.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      userId: attempt.username,
      ip: attempt.ip,
      userAgent: attempt.userAgent,
      metadata: {
        success: attempt.success,
        failureReason: attempt.failureReason,
        location: attempt.location
      }
    })
  }

  // Send encrypted audit data to Vercel
  private async sendToVercel(event: AuditEvent): Promise<void> {
    try {
      const vercelToken = process.env.VERCEL_TOKEN
      const projectId = process.env.VERCEL_PROJECT_ID
      
      if (!vercelToken || !projectId) return

      // Encrypt entire event for transmission
      const encryptedEvent = this.encrypt(JSON.stringify(event))
      
      const response = await fetch(`https://api.vercel.com/v1/projects/${projectId}/env`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: `AUDIT_LOG_${Date.now()}`,
          value: encryptedEvent,
          type: 'encrypted',
          target: ['production']
        })
      })

      if (!response.ok) {
        console.error('Failed to send audit log to Vercel:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending audit log to Vercel:', error)
    }
  }

  // Get IP location (basic implementation)
  async getIPLocation(ip: string): Promise<string> {
    try {
      // Use a free IP geolocation service
      const response = await fetch(`http://ip-api.com/json/${ip}`)
      const data = await response.json()
      return `${data.city}, ${data.country}`
    } catch {
      return 'Unknown'
    }
  }

  // Get security statistics
  getSecurityStats(): SecurityStats {
    const successfulLogins = this.loginAttempts.filter(a => a.success)
    const failedLogins = this.loginAttempts.filter(a => !a.success)
    const lastLogin = successfulLogins[successfulLogins.length - 1]

    // Get blocked IPs (IPs with multiple failed attempts)
    const ipCounts = new Map<string, number>()
    failedLogins.forEach(attempt => {
      ipCounts.set(attempt.ip, (ipCounts.get(attempt.ip) || 0) + 1)
    })
    const blockedIPs = Array.from(ipCounts.entries())
      .filter(([_, count]) => count >= 5)
      .map(([ip, _]) => ip)

    return {
      totalLogins: successfulLogins.length,
      failedLogins: failedLogins.length,
      lastLogin: lastLogin?.timestamp || 'Never',
      lastLoginIP: lastLogin?.ip || 'Unknown',
      totalSessions: this.auditLog.filter(e => e.eventType === 'LOGIN_SUCCESS').length,
      activeSessions: 1, // Simplified - would need session tracking
      blockedIPs,
      recentAttempts: this.loginAttempts.slice(-10)
    }
  }

  // Get recent audit events (decrypted)
  getRecentEvents(limit: number = 50): Omit<AuditEvent, 'metadata'>[] {
    return this.auditLog.slice(-limit).map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      encrypted: event.encrypted
    }))
  }

  // Get event details by ID (decrypted)
  getEventDetails(eventId: string): AuditEvent | null {
    const event = this.auditLog.find(e => e.id === eventId)
    if (!event) return null

    try {
      return {
        ...event,
        metadata: event.encrypted && typeof event.metadata === 'string' 
          ? JSON.parse(this.decrypt(event.metadata))
          : event.metadata
      }
    } catch (error) {
      console.error('Failed to decrypt event metadata:', error)
      return {
        ...event,
        metadata: { error: 'Failed to decrypt metadata' }
      }
    }
  }

  // Clear old logs
  clearOldLogs(daysOld: number = 30): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    this.auditLog = this.auditLog.filter(event => 
      new Date(event.timestamp) > cutoffDate
    )
    
    this.loginAttempts = this.loginAttempts.filter(attempt =>
      new Date(attempt.timestamp) > cutoffDate
    )
  }
}

export default SecurityAuditLogger 
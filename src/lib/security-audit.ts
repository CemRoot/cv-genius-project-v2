// Edge Runtime compatible - no Node.js crypto module

/**
 * Security Audit Logger - In-Memory Implementation
 * 
 * This class provides security audit logging functionality using only in-memory storage.
 * No file system operations are performed - all data is stored in memory.
 * 
 * For production use, audit logs are sent to Vercel environment variables for persistence.
 * Memory limits are enforced to prevent excessive memory usage.
 */

// Edge Runtime compatible UUID generator
function generateUUID(): string {
  // Use crypto.getRandomValues() which is available in Edge Runtime
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  
  // Set version (4) and variant bits
  array[6] = (array[6] & 0x0f) | 0x40
  array[8] = (array[8] & 0x3f) | 0x80
  
  // Convert to hex string with hyphens
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

// Edge Runtime compatible random hex string generator
function generateRandomHex(bytes: number): string {
  const array = new Uint8Array(bytes)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

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
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || generateRandomHex(32)
    
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

  // Simple obfuscation for sensitive data (not true encryption in Edge Runtime)
  // For production, consider using Web Crypto API's subtle crypto or server-side encryption
  private encrypt(data: string): string {
    // Simple XOR-based obfuscation with the encryption key
    const keyBytes = new TextEncoder().encode(this.encryptionKey)
    const dataBytes = new TextEncoder().encode(data)
    const result = new Uint8Array(dataBytes.length)
    
    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
    }
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result))
  }

  // Decrypt obfuscated data
  private decrypt(encryptedData: string): string {
    try {
      // Decode from base64
      const encrypted = atob(encryptedData)
      const encryptedBytes = new Uint8Array(encrypted.length)
      for (let i = 0; i < encrypted.length; i++) {
        encryptedBytes[i] = encrypted.charCodeAt(i)
      }
      
      // XOR with key to decrypt
      const keyBytes = new TextEncoder().encode(this.encryptionKey)
      const result = new Uint8Array(encryptedBytes.length)
      
      for (let i = 0; i < encryptedBytes.length; i++) {
        result[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length]
      }
      
      return new TextDecoder().decode(result)
    } catch (error) {
      console.error('Decryption failed:', error)
      return encryptedData
    }
  }

  // Log audit event
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'encrypted'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: generateUUID(),
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
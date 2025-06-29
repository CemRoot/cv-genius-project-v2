import * as jose from 'jose'
import SecurityObfuscator from './security-obfuscation'
import fs from 'fs/promises'
import path from 'path'

// JWT secret must be set via environment variable (server-side only)
function getJWTSecret() {
  if (typeof window !== 'undefined') {
    // Client-side: JWT_SECRET not needed
    return null
  }
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export interface AdminSession {
  sub: string
  role: string
  email: string
  ip: string
  iat: number
  exp: number
}

export class AdminAuth {
  static async verifyToken(token: string): Promise<AdminSession | null> {
    try {
      const jwtSecret = getJWTSecret()
      if (!jwtSecret) {
        throw new Error('JWT verification not available on client-side')
      }
      
      const { payload } = await jose.jwtVerify(token, jwtSecret, {
        issuer: 'cvgenius-admin',
        audience: 'cvgenius-admin-api',
      })

      return payload as unknown as AdminSession
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  static async isTokenExpired(token: string): Promise<boolean> {
    try {
      const session = await this.verifyToken(token)
      if (!session) return true

      const now = Math.floor(Date.now() / 1000)
      return session.exp < now
    } catch {
      return true
    }
  }

  static async refreshTokenIfNeeded(
    token: string,
    refreshThresholdMinutes: number = 30
  ): Promise<{ needsRefresh: boolean; isValid: boolean }> {
    try {
      const session = await this.verifyToken(token)
      if (!session) return { needsRefresh: false, isValid: false }

      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = session.exp - now
      const refreshThreshold = refreshThresholdMinutes * 60

      return {
        needsRefresh: timeUntilExpiry < refreshThreshold,
        isValid: true
      }
    } catch {
      return { needsRefresh: false, isValid: false }
    }
  }
}

// Standalone functions for API usage
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  return AdminAuth.verifyToken(token)
}

export async function checkIPWhitelist(clientIP: string): Promise<boolean> {
  try {
    const dataPath = path.join(process.cwd(), 'data')
    const ipWhitelistPath = path.join(dataPath, 'admin-ip-whitelist.json')
    
    // Check if whitelist file exists
    try {
      await fs.access(ipWhitelistPath)
    } catch {
      // If no whitelist file exists, allow all IPs (first time setup)
      console.log('🔍 No IP whitelist found, allowing access for setup')
      return true
    }

    const whitelistData = await fs.readFile(ipWhitelistPath, 'utf-8')
    const whitelist = JSON.parse(whitelistData)
    
    // Check if IP is in whitelist
    const isAllowed = whitelist.ips?.some((entry: any) => 
      entry.ip === clientIP || 
      entry.ip === 'localhost' && (clientIP === '127.0.0.1' || clientIP === '::1')
    ) || false
    
    if (!isAllowed) {
      console.warn(`🚨 Access denied for IP: ${clientIP}`)
    }
    
    return isAllowed
  } catch (error) {
    console.error('Error checking IP whitelist:', error)
    // If there's an error reading whitelist, deny access for security
    return false
  }
}

// Client-side auth utilities
export class ClientAdminAuth {
  private static TOKEN_KEY = 'admin-token'
  private static CSRF_KEY = 'csrf-token'

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  static getCsrfToken(): string | null {
    if (typeof window !== 'undefined') {
      // Get CSRF token from cookie
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === this.CSRF_KEY) {
          return decodeURIComponent(value)
        }
      }
    }
    return null
  }

  static async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Debug logs removed for production security
    
    const token = this.getToken()
    let csrfToken = this.getCsrfToken()
    
    // Auto-restore missing CSRF token if JWT exists
    if (token && !csrfToken && typeof window !== 'undefined') {
      try {
        const restoreResponse = await fetch('/api/admin/auth/restore-csrf', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (restoreResponse.ok) {
          const restoreData = await restoreResponse.json()
          if (restoreData.csrfToken) {
            // CSRF token will be set via Set-Cookie header automatically
            csrfToken = restoreData.csrfToken
          }
        }
      } catch (error) {
        // Silent error handling for security
      }
    }

    const headers = new Headers(options.headers)
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
      headers.set('X-CSRF-Token', csrfToken)
    }

    // Security obfuscation for admin endpoints
    let secureUrl = url
    if (url.includes('/api/admin/')) {
      try {
        const urlParts = url.split('/api/admin/')
        const endpointPath = urlParts[1]?.split('?')[0]
        
        // Map common endpoints to obfuscated aliases
        const endpointMap: Record<string, string> = {
          'auth/login': 'auth_login',
          'auth/2fa/setup': 'auth_2fa_setup',
          'auth/2fa/verify': 'auth_2fa_verify',
          'auth/2fa/disable': 'auth_2fa_disable',
          'settings': 'admin_settings',
          'test-prompt': 'admin_test',
          'auth/refresh': 'auth_refresh',
          'auth/logout': 'auth_logout',
          'ip-whitelist': 'admin_ip_whitelist'
        }

        const alias = endpointMap[endpointPath]
        if (alias) {
          secureUrl = SecurityObfuscator.getSecureEndpoint(alias)
        }
      } catch (error) {
        // Fallback to original URL if obfuscation fails
      }
    }

    const response = await fetch(secureUrl, {
      ...options,
      headers
    })

    // If token is expired, try to refresh
    if (response.status === 401 && token) {
      const refreshResponse = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        this.setToken(refreshData.token)

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${refreshData.token}`)
        if (refreshData.csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
          headers.set('X-CSRF-Token', refreshData.csrfToken)
        }

        return fetch(url, {
          ...options,
          headers
        })
      } else {
        // Refresh failed, redirect to login
        this.removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        }
      }
    }

    return response
  }

  static async logout(): Promise<void> {
    try {
      await this.makeAuthenticatedRequest('/api/admin/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.removeToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/admin'
      }
    }
  }
}
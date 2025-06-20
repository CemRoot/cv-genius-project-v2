import * as jose from 'jose'
import SecurityObfuscator from './security-obfuscation'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

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
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        issuer: 'cvgenius-admin',
        audience: 'cvgenius-admin-api',
      })

      return payload as AdminSession
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
    const token = this.getToken()
    const csrfToken = this.getCsrfToken()

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
          'auth/logout': 'auth_logout'
        }

        const alias = endpointMap[endpointPath]
        if (alias) {
          secureUrl = SecurityObfuscator.getSecureEndpoint(alias)
        }
      } catch (error) {
        // Fallback to original URL if obfuscation fails
        console.debug('Security obfuscation failed, using original URL')
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
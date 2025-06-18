// Enterprise Security Layer - API Endpoint Obfuscation
// This file contains hidden security mechanisms

class SecurityObfuscator {
  private static readonly ENDPOINT_MAP = new Map([
    ['auth_login', '/api/admin/auth/login'],
    ['auth_2fa_setup', '/api/admin/auth/2fa/setup'],
    ['auth_2fa_verify', '/api/admin/auth/2fa/verify'],
    ['auth_2fa_disable', '/api/admin/auth/2fa/disable'],
    ['admin_settings', '/api/admin/settings'],
    ['admin_test', '/api/admin/test-prompt'],
    ['auth_refresh', '/api/admin/auth/refresh'],
    ['auth_logout', '/api/admin/auth/logout']
  ])

  private static readonly SECURITY_TOKENS = [
    0x4A5B6C7D, 0x8E9F0A1B, 0x2C3D4E5F, 0x6A7B8C9D
  ]

  // Hidden endpoint resolution
  static getSecureEndpoint(alias: string): string {
    const baseEndpoint = this.ENDPOINT_MAP.get(alias)
    if (!baseEndpoint) {
      throw new Error('Invalid endpoint alias')
    }

    // Add security parameter for server-side validation
    const timestamp = Date.now()
    const securityHash = this.generateSecurityHash(alias, timestamp)
    const separator = baseEndpoint.includes('?') ? '&' : '?'
    
    return `${baseEndpoint}${separator}__s=${securityHash}&__t=${timestamp}`
  }

  private static generateSecurityHash(alias: string, timestamp: number): string {
    let hash = 0
    const payload = alias + timestamp.toString()
    
    for (let i = 0; i < payload.length; i++) {
      hash = ((hash << 5) - hash + payload.charCodeAt(i)) & 0xFFFFFFFF
    }
    
    // XOR with security tokens
    const securityXor = this.SECURITY_TOKENS.reduce((acc, token) => acc ^ token, hash)
    return (securityXor >>> 0).toString(16)
  }

  // Generate access key for admin panel
  static generateAccessKey(): string {
    const validationKeys = [0x1A2B, 0x3C4D, 0x5E6F, 0x7890]
    const timeWindow = Date.now() % 86400000 // 24 hour rotation
    const expectedHash = validationKeys.reduce((acc, key) => acc ^ key, timeWindow)
    return (expectedHash & 0xFFFF).toString(16)
  }

  // Validate security parameters from middleware
  static validateSecurityParams(alias: string, securityHash: string, timestamp: string): boolean {
    try {
      const timestampNum = parseInt(timestamp)
      const currentTime = Date.now()
      
      // Check timestamp validity (5 minute window)
      if (Math.abs(currentTime - timestampNum) > 300000) {
        return false
      }

      const expectedHash = this.generateSecurityHash(alias, timestampNum)
      return expectedHash === securityHash
    } catch {
      return false
    }
  }

  // Environment variable obfuscation for client-side
  static getClientConfig(): Record<string, string> {
    // Only return safe, obfuscated client values
    return {
      app_mode: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
      build_id: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || 'local'
    }
  }
}

// Anti-debugging measures
const SecurityHooks = {
  // Detect F12 developer tools
  detectDevTools: () => {
    let devtools = { open: false, orientation: null }
    
    const threshold = 160
    
    setInterval(() => {
      if (typeof window !== 'undefined') {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true
            // Log but don't block - just for monitoring
            console.warn('Developer tools detected')
          }
        } else {
          devtools.open = false
        }
      }
    }, 500)
  },

  // Clear console periodically 
  clearConsole: () => {
    if (typeof window !== 'undefined') {
      // Clear console every 5 seconds
      setInterval(() => {
        console.clear()
        console.log('%c🔒 Admin Panel Protected', 'color: red; font-size: 20px; font-weight: bold;')
      }, 5000)
    }
  },

  // Ultra security: Disable all debugging methods
  disableRightClick: () => {
    if (typeof window !== 'undefined') {
      // Disable right-click
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        window.close() // Try to close tab
      })
      
      // Disable text selection
      document.addEventListener('selectstart', (e) => e.preventDefault())
      document.addEventListener('dragstart', (e) => e.preventDefault())
      
      // Disable F12 and other dev tool shortcuts
      document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, etc.
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 's') ||
            (e.ctrlKey && e.key === 'a') ||
            (e.ctrlKey && e.key === 'p')) {
          e.preventDefault()
          // Try multiple methods to close tab
          window.close()
          window.location.href = 'about:blank'
          setTimeout(() => {
            window.location.href = 'chrome://settings/'
          }, 100)
        }
      })

      // Detect if dev tools are open and close tab
      let devtools = { open: false }
      const element = new Image()
      
      setInterval(() => {
        const start = new Date()
        debugger // This will pause if dev tools are open
        const end = new Date()
        
        if (end - start > 100) {
          if (!devtools.open) {
            devtools.open = true
            alert('🚨 Developer tools detected! Closing for security.')
            window.close()
            window.location.href = 'about:blank'
          }
        } else {
          devtools.open = false
        }
      }, 1000)
    }
  }
}

export { SecurityObfuscator, SecurityHooks }
export default SecurityObfuscator
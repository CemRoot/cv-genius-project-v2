// TEMPORARY: Security features disabled for debugging
// This file replaces security-obfuscation.ts temporarily

class SecurityObfuscator {
  private static readonly ENDPOINT_MAP = new Map([
    ['auth_login', '/api/admin/auth/login'],
    ['auth_2fa_setup', '/api/admin/auth/2fa/setup'],
    ['auth_2fa_verify', '/api/admin/auth/2fa/verify'],
    ['auth_2fa_disable', '/api/admin/auth/2fa/disable'],
    ['admin_settings', '/api/admin/settings'],
    ['admin_test', '/api/admin/test-prompt'],
    ['auth_refresh', '/api/admin/auth/refresh'],
    ['auth_logout', '/api/admin/auth/logout'],
    ['admin_ip_whitelist', '/api/admin/ip-whitelist']
  ])

  static getSecureEndpoint(alias: string): string {
    console.log('🔍 DEBUG: Getting endpoint for alias:', alias)
    const baseEndpoint = this.ENDPOINT_MAP.get(alias)
    if (!baseEndpoint) {
      console.error('❌ Invalid endpoint alias:', alias)
      throw new Error('Invalid endpoint alias')
    }
    console.log('✅ Endpoint found:', baseEndpoint)
    return baseEndpoint
  }

  static generateAccessKey(): string {
    return 'debug-key'
  }

  static validateSecurityParams(): boolean {
    return true
  }

  static getClientConfig(): Record<string, string> {
    return {
      app_mode: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
      build_id: 'debug'
    }
  }
}

// DISABLED Security Hooks for debugging
const SecurityHooks = {
  detectDevTools: () => {
    console.log('🔓 Dev tools detection DISABLED for debugging')
  },
  
  clearConsole: () => {
    console.log('🔓 Console clearing DISABLED for debugging')
  },
  
  disableRightClick: () => {
    console.log('🔓 Right-click protection DISABLED for debugging')
  }
}

export { SecurityObfuscator, SecurityHooks }
export default SecurityObfuscator
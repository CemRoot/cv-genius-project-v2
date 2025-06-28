// Persistent 2FA state management
// Uses environment variables for Vercel compatibility
// In production, this should be stored in a database

interface TwoFAState {
  secret: string | null
  enabled: boolean
  lastUpdated: string
}

export class Admin2FAState {
  private static state: TwoFAState | null = null
  private static readonly ENV_KEY = 'ADMIN_2FA_STATE'

  private static loadState(): TwoFAState {
    if (this.state) return this.state

    try {
      // Try to load from environment variable first (Vercel compatible)
      const envState = process.env[this.ENV_KEY]
      if (envState) {
        this.state = JSON.parse(envState)
        return this.state!
      }

      // Fallback to file system for local development
      if (typeof window === 'undefined') {
        const fs = require('fs')
        const path = require('path')
        const STATE_FILE = path.join(process.cwd(), '.2fa-state.json')
        
        if (fs.existsSync(STATE_FILE)) {
          const data = fs.readFileSync(STATE_FILE, 'utf8')
          this.state = JSON.parse(data)
          return this.state!
        }
      }
    } catch (error) {
      // Silent error handling for production
    }

    // Default state
    this.state = {
      secret: null,
      enabled: false,
      lastUpdated: new Date().toISOString()
    }
    return this.state
  }

  private static saveState(): void {
    if (!this.state) return

    try {
      this.state.lastUpdated = new Date().toISOString()
      const stateJson = JSON.stringify(this.state)

      // For local development, save to file
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        const fs = require('fs')
        const path = require('path')
        const STATE_FILE = path.join(process.cwd(), '.2fa-state.json')
        fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2))
      }

      // Note: For Vercel production, you need to manually update environment variable
      // or use a database for true persistence
      
    } catch (error) {
      // Silent error handling for production
    }
  }

  static getSecret(): string | null {
    const state = this.loadState()
    return state.secret
  }

  static setSecret(secret: string | null): void {
    const state = this.loadState()
    state.secret = secret
    this.saveState()
  }

  static isEnabled(): boolean {
    const state = this.loadState()
    return state.enabled
  }

  static setEnabled(enabled: boolean): void {
    const state = this.loadState()
    state.enabled = enabled
    this.saveState()
  }

  static reset(): void {
    this.state = {
      secret: null,
      enabled: false,
      lastUpdated: new Date().toISOString()
    }
    this.saveState()
  }

  static getStatus(): { enabled: boolean; lastUpdated: string } {
    const state = this.loadState()
    return {
      enabled: state.enabled,
      lastUpdated: state.lastUpdated
    }
  }
}

export default Admin2FAState
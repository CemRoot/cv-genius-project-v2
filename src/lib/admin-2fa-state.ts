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

      // Update Vercel environment variable for production persistence
      if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
        this.updateVercelEnvironment(stateJson).catch(error => {
          console.error('Failed to update 2FA state in Vercel:', error)
        })
      }
      
    } catch (error) {
      // Silent error handling for production
    }
  }

  private static async updateVercelEnvironment(stateJson: string): Promise<void> {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      throw new Error('Vercel integration not configured')
    }

    const apiUrl = VERCEL_TEAM_ID 
      ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`

    // Get existing env vars
    const getResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    })

    if (!getResponse.ok) {
      throw new Error('Failed to fetch environment variables')
    }

    const envVars = await getResponse.json()
    const existingVar = envVars.envs?.find((env: any) => env.key === this.ENV_KEY)

    // Delete existing if found
    if (existingVar) {
      const deleteUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}`

      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
        }
      })
    }

    // Create new env var if state is not default
    if (this.state?.enabled || this.state?.secret) {
      const createResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: this.ENV_KEY,
          value: stateJson,
          type: 'encrypted',
          target: ['production', 'preview', 'development']
        })
      })

      if (!createResponse.ok) {
        const error = await createResponse.text()
        throw new Error(`Failed to update 2FA state in Vercel: ${error}`)
      }
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
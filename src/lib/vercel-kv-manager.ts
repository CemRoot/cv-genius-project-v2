import { kv } from '@vercel/kv'

// Vercel KV Store Manager for persistent data
export class VercelKVManager {
  static async getIPWhitelist(): Promise<string[]> {
    try {
      // First check if Vercel KV is available
      if (!process.env.KV_REST_API_URL) {
        // Fallback to env variable
        const envIPs = process.env.ADMIN_IP_WHITELIST || ''
        return envIPs.split(',').map(ip => ip.trim()).filter(Boolean)
      }

      const whitelist = await kv.get<string[]>('admin:ip-whitelist')
      if (!whitelist) {
        // Initialize from env if empty
        const envIPs = process.env.ADMIN_IP_WHITELIST || ''
        const ips = envIPs.split(',').map(ip => ip.trim()).filter(Boolean)
        await kv.set('admin:ip-whitelist', ips)
        return ips
      }
      return whitelist
    } catch (error) {
      console.error('Failed to get IP whitelist from KV:', error)
      // Fallback to env
      const envIPs = process.env.ADMIN_IP_WHITELIST || ''
      return envIPs.split(',').map(ip => ip.trim()).filter(Boolean)
    }
  }

  static async addIPToWhitelist(ip: string): Promise<boolean> {
    try {
      if (!process.env.KV_REST_API_URL) {
        console.warn('Vercel KV not configured')
        return false
      }

      const whitelist = await this.getIPWhitelist()
      if (!whitelist.includes(ip)) {
        whitelist.push(ip)
        await kv.set('admin:ip-whitelist', whitelist)
      }
      return true
    } catch (error) {
      console.error('Failed to add IP to whitelist:', error)
      return false
    }
  }

  static async removeIPFromWhitelist(ip: string): Promise<boolean> {
    try {
      if (!process.env.KV_REST_API_URL) {
        console.warn('Vercel KV not configured')
        return false
      }

      const whitelist = await this.getIPWhitelist()
      const filtered = whitelist.filter(wip => wip !== ip)
      await kv.set('admin:ip-whitelist', filtered)
      return true
    } catch (error) {
      console.error('Failed to remove IP from whitelist:', error)
      return false
    }
  }

  // Store admin settings
  static async getAdminSettings(): Promise<any> {
    try {
      if (!process.env.KV_REST_API_URL) return null
      return await kv.get('admin:settings')
    } catch (error) {
      return null
    }
  }

  static async updateAdminSettings(settings: any): Promise<boolean> {
    try {
      if (!process.env.KV_REST_API_URL) return false
      await kv.set('admin:settings', settings)
      return true
    } catch (error) {
      return false
    }
  }

  // Store password hash (encrypted)
  static async updatePasswordHash(encryptedHash: string): Promise<boolean> {
    try {
      if (!process.env.KV_REST_API_URL) return false
      await kv.set('admin:password-hash', encryptedHash)
      return true
    } catch (error) {
      return false
    }
  }

  static async getPasswordHash(): Promise<string | null> {
    try {
      if (!process.env.KV_REST_API_URL) {
        // Fallback to env
        return process.env.ADMIN_PWD_HASH_B64 || null
      }
      const hash = await kv.get<string>('admin:password-hash')
      return hash || process.env.ADMIN_PWD_HASH_B64 || null
    } catch (error) {
      return process.env.ADMIN_PWD_HASH_B64 || null
    }
  }
}
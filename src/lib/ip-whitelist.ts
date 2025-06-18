import fs from 'fs'
import path from 'path'

// IP Whitelist Management System
// Stores allowed IPs persistently

const IP_WHITELIST_FILE = path.join(process.cwd(), '.ip-whitelist.json')

interface IPWhitelistEntry {
  ip: string
  addedAt: string
  label: string
  isActive: boolean
}

interface IPWhitelistData {
  entries: IPWhitelistEntry[]
  lastUpdated: string
}

export class IPWhitelistManager {
  private static data: IPWhitelistData | null = null

  private static loadWhitelist(): IPWhitelistData {
    if (this.data) return this.data

    try {
      // Try to load from environment variable first (Vercel compatible)
      const envWhitelist = process.env.ADMIN_IP_WHITELIST
      if (envWhitelist) {
        this.data = JSON.parse(envWhitelist)
        console.log('🔒 IP whitelist loaded from environment')
        return this.data!
      }

      // Fallback to file system for local development
      if (typeof window === 'undefined' && fs.existsSync(IP_WHITELIST_FILE)) {
        const data = fs.readFileSync(IP_WHITELIST_FILE, 'utf8')
        this.data = JSON.parse(data)
        console.log('🔒 IP whitelist loaded from file')
        return this.data!
      }
    } catch (error) {
      console.error('Error loading IP whitelist:', error)
    }

    // Default whitelist with localhost
    this.data = {
      entries: [
        {
          ip: '127.0.0.1',
          addedAt: new Date().toISOString(),
          label: 'Localhost IPv4',
          isActive: true
        },
        {
          ip: '::1',
          addedAt: new Date().toISOString(),
          label: 'Localhost IPv6',
          isActive: true
        }
      ],
      lastUpdated: new Date().toISOString()
    }
    return this.data
  }

  private static saveWhitelist(): void {
    if (!this.data) return

    try {
      this.data.lastUpdated = new Date().toISOString()
      const whitelistJson = JSON.stringify(this.data)

      // For local development, save to file
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        fs.writeFileSync(IP_WHITELIST_FILE, JSON.stringify(this.data, null, 2))
        console.log('💾 IP whitelist saved to file (development)')
      }

      // Note: For Vercel production, you need to manually update environment variable
      console.log('💾 IP whitelist updated (restart required for Vercel)')
      console.log('⚠️  For production persistence, set ADMIN_IP_WHITELIST environment variable to:', whitelistJson)
      
    } catch (error) {
      console.error('Error saving IP whitelist:', error)
    }
  }

  // Check if IP is whitelisted
  static isIPAllowed(ip: string): boolean {
    const whitelist = this.loadWhitelist()
    
    // Always allow localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1') || ip.includes('::1'))) {
      return true
    }

    return whitelist.entries.some(entry => 
      entry.isActive && (entry.ip === ip || ip.includes(entry.ip))
    )
  }

  // Add IP to whitelist
  static addIP(ip: string, label: string = 'Admin IP'): boolean {
    try {
      const whitelist = this.loadWhitelist()
      
      // Check if IP already exists
      const existingEntry = whitelist.entries.find(entry => entry.ip === ip)
      if (existingEntry) {
        existingEntry.isActive = true
        existingEntry.label = label
        console.log(`🔒 IP ${ip} reactivated in whitelist`)
      } else {
        whitelist.entries.push({
          ip,
          addedAt: new Date().toISOString(),
          label,
          isActive: true
        })
        console.log(`🔒 IP ${ip} added to whitelist as "${label}"`)
      }

      this.saveWhitelist()
      return true
    } catch (error) {
      console.error('Error adding IP to whitelist:', error)
      return false
    }
  }

  // Remove IP from whitelist
  static removeIP(ip: string): boolean {
    try {
      const whitelist = this.loadWhitelist()
      const entry = whitelist.entries.find(entry => entry.ip === ip)
      
      if (entry) {
        entry.isActive = false
        this.saveWhitelist()
        console.log(`🔒 IP ${ip} removed from whitelist`)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing IP from whitelist:', error)
      return false
    }
  }

  // Get all whitelist entries
  static getAllEntries(): IPWhitelistEntry[] {
    const whitelist = this.loadWhitelist()
    return whitelist.entries
  }

  // Get active IPs only
  static getActiveIPs(): string[] {
    const whitelist = this.loadWhitelist()
    return whitelist.entries
      .filter(entry => entry.isActive)
      .map(entry => entry.ip)
  }

  // Check if whitelist is empty (first time setup)
  static isFirstTimeSetup(): boolean {
    const whitelist = this.loadWhitelist()
    return whitelist.entries.filter(entry => 
      entry.isActive && !entry.ip.includes('127.0.0.1') && entry.ip !== '::1'
    ).length === 0
  }
}

export default IPWhitelistManager
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Admin settings storage (shared with admin/ads API)
interface AdminAdSettings {
  enableAds: boolean
  mobileAds: boolean
  testMode: boolean
  monetagPopup: boolean
  monetagPush: boolean
  monetagNative: boolean
  lastUpdated: string
}

const defaultAdSettings: AdminAdSettings = {
  enableAds: true,
  mobileAds: true,
  testMode: false,
  monetagPopup: false,
  monetagPush: false,
  monetagNative: false,
  lastUpdated: new Date().toISOString()
}

// In-memory storage for edge runtime (shared with admin/ads API)
let inMemoryAdSettings: AdminAdSettings | null = null

async function loadAdSettings(): Promise<AdminAdSettings> {
  // Try environment variable first (Vercel compatible)
  const envSettings = process.env.ADMIN_AD_SETTINGS
  if (envSettings) {
    try {
      return JSON.parse(envSettings)
    } catch (e) {
      console.error('Failed to parse ADMIN_AD_SETTINGS from env:', e)
    }
  }

  // Use in-memory cache
  if (inMemoryAdSettings) {
    return inMemoryAdSettings
  }

  // Try file system only in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const settingsPath = path.join(process.cwd(), 'data', 'admin-ad-settings.json')
      const data = await fs.readFile(settingsPath, 'utf-8')
      const parsedSettings = JSON.parse(data)
      inMemoryAdSettings = parsedSettings
      return parsedSettings
    } catch (error) {
      // File doesn't exist, use defaults
    }
  }

  // Return defaults
  inMemoryAdSettings = defaultAdSettings
  return defaultAdSettings
}

// Public endpoint - client-side için admin reklam ayarları
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Ad status requested from client')
    
    // Use the same settings loading logic as admin/ads API
    const adminSettings = await loadAdSettings()
    
    console.log('📊 Current ad settings:', adminSettings)
    
    // Return essential settings for client-side consumption
    const publicSettings = {
      enableAds: adminSettings.enableAds ?? true,
      mobileAds: adminSettings.mobileAds ?? true,
      testMode: adminSettings.testMode ?? false,
      monetagPopup: adminSettings.monetagPopup ?? false,
      monetagPush: adminSettings.monetagPush ?? false,
      monetagNative: adminSettings.monetagNative ?? false,
      lastUpdated: adminSettings.lastUpdated
    }
    
    console.log('✅ Returning public settings:', publicSettings)
    
    return NextResponse.json(publicSettings)

  } catch (error) {
    console.error('❌ Failed to load admin ad settings:', error)
    
    // Hata durumunda güvenli default değerler
    return NextResponse.json({
      enableAds: false, // Güvenlik için false
      mobileAds: false,
      testMode: true,
      monetagPopup: false,
      monetagPush: false,
      monetagNative: false,
      lastUpdated: new Date().toISOString()
    })
  }
} 
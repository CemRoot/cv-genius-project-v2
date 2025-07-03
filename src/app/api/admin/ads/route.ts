import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { defaultAdConfigs, AdConfig } from '@/lib/ad-config'
import fs from 'fs/promises'
import path from 'path'

// Store admin ad settings persistently
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

// In-memory storage for edge runtime
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
      inMemoryAdSettings = JSON.parse(data)
      return inMemoryAdSettings
    } catch (error) {
      // File doesn't exist, use defaults
    }
  }

  // Return defaults
  inMemoryAdSettings = defaultAdSettings
  return defaultAdSettings
}

async function saveAdSettings(settings: AdminAdSettings): Promise<void> {
  // Update in-memory cache
  inMemoryAdSettings = settings

  // Save to file only in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const dataDir = path.join(process.cwd(), 'data')
      try {
        await fs.access(dataDir)
      } catch {
        await fs.mkdir(dataDir, { recursive: true })
      }
      
      const settingsPath = path.join(dataDir, 'admin-ad-settings.json')
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    } catch (error) {
      console.error('Failed to save ad settings to file:', error)
    }
  }

  // Log for production deployment
  console.log('💾 Ad settings updated (in-memory):', settings)
  console.log('⚠️  For production persistence, set ADMIN_AD_SETTINGS env var to:', JSON.stringify(settings))
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const settings = await loadAdSettings()

    return NextResponse.json({
      success: true,
      settings,
      adConfigs: defaultAdConfigs.filter(ad => ad.enabled)
    })

  } catch (error) {
    console.error('Failed to load ad settings:', error)
    return NextResponse.json({ error: 'Failed to load ad settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 Admin Ads API - PUT request received')
    
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or invalid format')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      console.log('❌ Invalid or expired session')
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 Request body received:', body)
    
    const { setting, enabled, settings: newSettings } = body

    if (!setting || typeof enabled !== 'boolean') {
      console.log('❌ Invalid request parameters:', { setting, enabled, hasNewSettings: !!newSettings })
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // Load current settings
    const currentSettings = await loadAdSettings()
    console.log('📖 Current settings loaded:', currentSettings)
    
    // Update the specific setting
    const updatedSettings: AdminAdSettings = {
      ...currentSettings,
      [setting]: enabled,
      lastUpdated: new Date().toISOString()
    }

    // If bulk settings provided, merge them
    if (newSettings && typeof newSettings === 'object') {
      Object.assign(updatedSettings, newSettings)
      updatedSettings.lastUpdated = new Date().toISOString()
    }

    console.log('💾 About to save settings:', updatedSettings)
    
    // Save updated settings
    await saveAdSettings(updatedSettings)
    
    console.log('✅ Settings saved successfully')

    return NextResponse.json({
      success: true,
      message: `${setting} ${enabled ? 'enabled' : 'disabled'} successfully`,
      settings: updatedSettings
    })

  } catch (error) {
    console.error('Failed to update ad setting:', error)
    return NextResponse.json({ error: 'Failed to update ad setting' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const newAdConfig: AdConfig = await request.json()
    
    // Validation  
    if (!newAdConfig.id || !newAdConfig.name || !newAdConfig.type) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    // ID'nin benzersiz olduğunu kontrol et
    if (defaultAdConfigs.find(ad => ad.id === newAdConfig.id)) {
      return NextResponse.json({ error: 'Bu ID zaten kullanılıyor' }, { status: 400 })
    }

    defaultAdConfigs.push(newAdConfig)
    return NextResponse.json({ success: true, ad: newAdConfig })
  } catch (error) {
    console.error('Ad config eklenemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const { adId } = await request.json()

    const adIndex = defaultAdConfigs.findIndex(ad => ad.id === adId)
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad config bulunamadı' }, { status: 404 })
    }

    defaultAdConfigs.splice(adIndex, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ad config silinemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Public endpoint - client-side kullanım için
export async function GET_PUBLIC() {
  try {
    // Sadece enabled olan reklamları döndür ve admin bilgilerini filtrele
    const publicConfigs = defaultAdConfigs
      .filter(ad => ad.enabled)
      .map(ad => ({
        id: ad.id,
        name: ad.name,
        type: ad.type,
        enabled: ad.enabled,
        zone: ad.zone,
        position: ad.position,
        settings: ad.settings
      }))

    return NextResponse.json(publicConfigs)
  } catch (error) {
    console.error('Public ad configs getirilemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


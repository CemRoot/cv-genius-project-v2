import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

// AdSense konfigürasyonu için tip tanımı
interface AdSenseConfig {
  sidebarSlot: string
  inlineSlot: string
  footerSlot: string
  stickySlot: string
  lastUpdated: string
}

// In-memory storage for edge runtime
let inMemoryAdSenseConfig: AdSenseConfig | null = null

// Default konfigürasyon
const defaultAdSenseConfig: AdSenseConfig = {
  sidebarSlot: '',
  inlineSlot: '',
  footerSlot: '',
  stickySlot: '',
  lastUpdated: new Date().toISOString()
}

async function loadAdSenseConfig(): Promise<AdSenseConfig> {
  // Environment variable'dan yükle
  const envConfig = process.env.ADSENSE_CONFIG
  if (envConfig) {
    try {
      return JSON.parse(envConfig)
    } catch (e) {
      console.error('Failed to parse ADSENSE_CONFIG from env:', e)
    }
  }

  // In-memory cache kullan
  if (inMemoryAdSenseConfig) {
    return inMemoryAdSenseConfig
  }

  // Default değerleri environment variable'lardan al
  const config: AdSenseConfig = {
    sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
    inlineSlot: process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
    footerSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
    stickySlot: process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || '',
    lastUpdated: new Date().toISOString()
  }

  inMemoryAdSenseConfig = config
  return config
}

async function saveAdSenseConfig(config: AdSenseConfig): Promise<void> {
  // In-memory cache güncelle
  inMemoryAdSenseConfig = config

  // Vercel API ile environment variable güncelleme (eğer token varsa)
  if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
    try {
      const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/env`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const { envs } = await response.json()
        
        // Mevcut ADSENSE_CONFIG env var'ını bul
        const existingEnv = envs.find((env: any) => env.key === 'ADSENSE_CONFIG')
        
        // Güncelle veya oluştur
        const method = existingEnv ? 'PATCH' : 'POST'
        const url = existingEnv 
          ? `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/env/${existingEnv.id}`
          : `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/env`

        const updateResponse = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: 'ADSENSE_CONFIG',
            value: JSON.stringify(config),
            target: ['production', 'preview', 'development'],
            type: 'plain'
          })
        })

        if (updateResponse.ok) {
          console.log('✅ AdSense config saved to Vercel')
        } else {
          console.error('Failed to update Vercel env:', await updateResponse.text())
        }
      }
    } catch (error) {
      console.error('Failed to update Vercel environment:', error)
    }
  }

  console.log('💾 AdSense config updated (in-memory):', config)
}

// GET - AdSense konfigürasyonunu getir
export async function GET(request: NextRequest) {
  try {
    // Admin doğrulaması
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const config = await loadAdSenseConfig()

    return NextResponse.json({
      success: true,
      config,
      hasVercelIntegration: !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
    })

  } catch (error) {
    console.error('Failed to load AdSense config:', error)
    return NextResponse.json({ error: 'Failed to load AdSense config' }, { status: 500 })
  }
}

// PUT - AdSense konfigürasyonunu güncelle
export async function PUT(request: NextRequest) {
  try {
    // Admin doğrulaması
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const body = await request.json()
    const { sidebarSlot, inlineSlot, footerSlot, stickySlot } = body

    // Validasyon
    const isValidSlot = (slot: string) => {
      if (!slot) return true // Boş olabilir
      // Basit bir AdSense slot ID kontrolü (10 haneli sayı)
      return /^\d{10}$/.test(slot)
    }

    if (!isValidSlot(sidebarSlot) || !isValidSlot(inlineSlot) || 
        !isValidSlot(footerSlot) || !isValidSlot(stickySlot)) {
      return NextResponse.json({ 
        error: 'Invalid slot ID format. AdSense slot IDs should be 10-digit numbers.' 
      }, { status: 400 })
    }

    // Yeni konfigürasyon
    const newConfig: AdSenseConfig = {
      sidebarSlot: sidebarSlot || '',
      inlineSlot: inlineSlot || '',
      footerSlot: footerSlot || '',
      stickySlot: stickySlot || '',
      lastUpdated: new Date().toISOString()
    }

    // Kaydet
    await saveAdSenseConfig(newConfig)

    return NextResponse.json({
      success: true,
      message: 'AdSense configuration updated successfully',
      config: newConfig,
      note: process.env.VERCEL_TOKEN 
        ? 'Configuration saved to Vercel. Redeploy may be required for changes to take effect.'
        : 'Configuration saved in-memory only. Set VERCEL_TOKEN for persistent storage.'
    })

  } catch (error) {
    console.error('Failed to update AdSense config:', error)
    return NextResponse.json({ error: 'Failed to update AdSense config' }, { status: 500 })
  }
}

// Public endpoint - Client tarafı için
export async function POST(request: NextRequest) {
  try {
    const config = await loadAdSenseConfig()
    
    // Sadece gerekli bilgileri döndür
    return NextResponse.json({
      sidebarSlot: config.sidebarSlot || process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
      inlineSlot: config.inlineSlot || process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
      footerSlot: config.footerSlot || process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
      stickySlot: config.stickySlot || process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || ''
    })
  } catch (error) {
    console.error('Failed to get public AdSense config:', error)
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 })
  }
}
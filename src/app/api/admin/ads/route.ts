import { NextRequest, NextResponse } from 'next/server'
import { defaultAdConfigs, AdConfig } from '@/lib/ad-config'

// In-memory storage için geçici çözüm
// Production'da gerçek veritabanı kullanılmalı
let adConfigs: AdConfig[] = [...defaultAdConfigs]

export async function GET(request: NextRequest) {
  try {
    // Admin auth kontrolü
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(adConfigs)
  } catch (error) {
    console.error('Ad configs getirilemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Admin auth kontrolü
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { adId, enabled, settings } = await request.json()

    const adIndex = adConfigs.findIndex(ad => ad.id === adId)
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad config bulunamadı' }, { status: 404 })
    }

    // Güncelleme
    adConfigs[adIndex] = {
      ...adConfigs[adIndex],
      enabled,
      ...(settings && { settings: { ...adConfigs[adIndex].settings, ...settings } })
    }

    return NextResponse.json({ success: true, ad: adConfigs[adIndex] })
  } catch (error) {
    console.error('Ad config güncellenemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin auth kontrolü
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newAdConfig: AdConfig = await request.json()
    
    // Validation  
    if (!newAdConfig.id || !newAdConfig.name || !newAdConfig.type) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 })
    }

    // ID'nin benzersiz olduğunu kontrol et
    if (adConfigs.find(ad => ad.id === newAdConfig.id)) {
      return NextResponse.json({ error: 'Bu ID zaten kullanılıyor' }, { status: 400 })
    }

    adConfigs.push(newAdConfig)
    return NextResponse.json({ success: true, ad: newAdConfig })
  } catch (error) {
    console.error('Ad config eklenemedi:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin auth kontrolü
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidAdminAuth(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { adId } = await request.json()

    const adIndex = adConfigs.findIndex(ad => ad.id === adId)
    if (adIndex === -1) {
      return NextResponse.json({ error: 'Ad config bulunamadı' }, { status: 404 })
    }

    adConfigs.splice(adIndex, 1)
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
    const publicConfigs = adConfigs
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

function isValidAdminAuth(authHeader: string): boolean {
  // Basit auth kontrolü - production'da daha güvenli olmalı
  // Bearer token veya session tabanlı auth kullanılmalı
  const token = authHeader.replace('Bearer ', '')
  
  // Admin session kontrolü
  // Gerçek uygulamada JWT veya session store kontrolü yapılmalı
  return token === 'admin-session-token' || 
         process.env.NODE_ENV === 'development'
}
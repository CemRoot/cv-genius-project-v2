import { NextRequest, NextResponse } from 'next/server'
import { defaultAdConfigs } from '@/lib/ad-config'

// Public endpoint - client-side için reklam konfigürasyonları
export async function GET(request: NextRequest) {
  try {
    // Gerçek uygulamada bu veriler veritabanından gelecek
    // Şimdilik memory'den alıyoruz
    
    // Sadece aktif olan reklamları ve gerekli bilgileri döndür
    const publicConfigs = defaultAdConfigs
      .filter(ad => ad.enabled)
      .map(ad => ({
        id: ad.id,
        type: ad.type,
        enabled: ad.enabled,
        zone: ad.zone,
        position: ad.position,
        settings: {
          delay: ad.settings?.delay,
          size: ad.settings?.size,
          restrictedPages: ad.settings?.restrictedPages,
          adSenseClient: ad.settings?.adSenseClient,
          adSenseSlot: ad.settings?.adSenseSlot
        }
      }))

    return NextResponse.json(publicConfigs)
  } catch (error) {
    console.error('Public ad configs alınamadı:', error)
    return NextResponse.json([], { status: 200 }) // Hata durumunda boş array döndür
  }
}
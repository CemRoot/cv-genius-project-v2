import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Public endpoint - client-side için admin reklam ayarları
export async function GET(request: NextRequest) {
  try {
    // Admin ad settings dosyasını oku
    const settingsPath = path.join(process.cwd(), 'data', 'admin-ad-settings.json')
    
    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      const adminSettings = JSON.parse(data)
      
      // Sadece gerekli ayarları public olarak döndür
      return NextResponse.json({
        enableAds: adminSettings.enableAds ?? true,
        mobileAds: adminSettings.mobileAds ?? true,
        testMode: adminSettings.testMode ?? false,
        monetagPopup: adminSettings.monetagPopup ?? false,
        monetagPush: adminSettings.monetagPush ?? false,
        monetagNative: adminSettings.monetagNative ?? false
      })
    } catch (fileError) {
      // Dosya yoksa default ayarları döndür
      return NextResponse.json({
        enableAds: true,
        mobileAds: true,
        testMode: false,
        monetagPopup: false,
        monetagPush: false,
        monetagNative: false
      })
    }
  } catch (error) {
    console.error('Admin ad settings alınamadı:', error)
    
    // Hata durumunda güvenli default değerler
    return NextResponse.json({
      enableAds: false, // Güvenlik için false
      mobileAds: false,
      testMode: true,
      monetagPopup: false,
      monetagPush: false,
      monetagNative: false
    })
  }
} 
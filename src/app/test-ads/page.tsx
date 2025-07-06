'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SidebarAds } from '@/components/ads/sidebar-ads'
import { Info, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestAdsPage() {
  useEffect(() => {
    // AdSense script'ini yükle
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1742989559393752'
    script.crossOrigin = 'anonymous'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">AdSense Test Sayfası</h1>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Test Ortamı</AlertTitle>
        <AlertDescription>
          Bu sayfa Google AdSense reklamlarınızı test etmek için oluşturulmuştur.
          Production'da reklamlarınızın düzgün çalıştığından emin olmak için bu sayfayı kullanın.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana içerik */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AdSense Entegrasyonu</CardTitle>
              <CardDescription>Google AdSense hesabınız başarıyla etkinleştirildi!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Publisher ID Ayarlandı</p>
                  <p className="text-sm text-muted-foreground">ca-pub-1742989559393752</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">ads.txt Dosyası Oluşturuldu</p>
                  <p className="text-sm text-muted-foreground">/public/ads.txt konumunda</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Reklam Birimleri Bekleniyor</p>
                  <p className="text-sm text-muted-foreground">
                    AdSense panelinden reklam birimleri oluşturun ve slot ID'lerini .env.local dosyasına ekleyin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yapılması Gerekenler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h3 className="font-medium">1. AdSense Panelinde Reklam Birimleri Oluşturun</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                  <li>Sidebar için 300x300 boyutunda reklam birimi</li>
                  <li>İçerik içi için responsive reklam birimi</li>
                  <li>Footer için 728x90 banner reklam birimi</li>
                  <li>Sticky sidebar için 160x600 skyscraper reklam birimi</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">2. Slot ID'lerini .env.local Dosyasına Ekleyin</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1234567890
NEXT_PUBLIC_ADSENSE_INLINE_SLOT=0987654321
NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=1122334455
NEXT_PUBLIC_ADSENSE_STICKY_SLOT=5544332211`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">3. Deployment Sonrası</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                  <li>Site URL'nizi AdSense'e ekleyin</li>
                  <li>ads.txt dosyasının erişilebilir olduğunu kontrol edin</li>
                  <li>AdSense onayını bekleyin (24-48 saat)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Banner Alanı */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Reklam Alanı (728x90)</CardTitle>
              <CardDescription>Header banner reklamı burada görünecek</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <div className="text-sm text-gray-500 mb-2">Google AdSense</div>
                <div className="text-lg font-medium text-gray-700">728 x 90 Banner</div>
                <div className="text-xs text-gray-500 mt-2">Slot ID gerekli</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Reklam</CardTitle>
              <CardDescription>300x300 kare reklam alanı</CardDescription>
            </CardHeader>
            <CardContent>
              <SidebarAds />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Admin panelinden reklamları yönetebilirsiniz:
              </p>
              <ul className="text-sm space-y-2">
                <li>✓ Reklamları aç/kapa</li>
                <li>✓ Mobil reklamları kontrol et</li>
                <li>✓ Test modunu etkinleştir</li>
                <li>✓ Performans verilerini görüntüle</li>
              </ul>
              <a 
                href="/admin" 
                className="inline-flex items-center text-sm text-blue-600 hover:underline mt-2"
              >
                Admin Paneline Git →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Banner Alanı */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Footer Reklam Alanı (728x90)</CardTitle>
          <CardDescription>Footer banner reklamı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Google AdSense</div>
            <div className="text-lg font-medium text-gray-700">728 x 90 Footer Banner</div>
            <div className="text-xs text-gray-500 mt-2">Slot ID gerekli</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
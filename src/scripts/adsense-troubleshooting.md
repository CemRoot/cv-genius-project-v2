# AdSense Troubleshooting Guide

Bu rehber AdSense script'lerinin yüklenmeme sorunlarını çözmek için hazırlanmıştır.

## 1. Console Log'larını Kontrol Etme

### Tarayıcı Geliştirici Araçları
1. F12 veya Ctrl+Shift+I ile Developer Tools'u açın
2. Console sekmesine gidin
3. Aşağıdaki log'ları arayın:

#### AdSense Script Yükleme Log'ları
- `🚀 [AdSense] Starting AdSense script loading...`
- `📡 [AdSense] Attempt X/3 - Creating script element...`
- `✅ [AdSense] Script loaded successfully in Xms`
- `❌ [AdSense] Script load error after Xms`

#### AdSense Loader Hook Log'ları
- `🔍 [AdSense Loader] Production mode - Starting availability checks...`
- `✅ [AdSense Loader] AdSense is available! Check count: X`
- `❌ [AdSense Loader] AdSense not available after 30 seconds`

#### Component Log'ları
- `🎯 [BannerAds] Component initialized`
- `📱 [SidebarAds] Component initialized`
- `🔧 [AdSense Config] Initializing AdSense config...`

## 2. Manuel Debug Komutları

Tarayıcı console'unda aşağıdaki komutları kullanabilirsiniz:

### Genel Durum Kontrolü
```javascript
// AdSense durumunu kontrol et
window.adSenseDebug.getInfo()

// Log'a yazdır
window.adSenseDebug.logInfo()

// Script yükleme durumunu kontrol et
window.adSenseDebug.checkScript()
```

### Manual İşlemler
```javascript
// AdSense yüklemeyi yeniden dene
window.adSenseDebug.retry()

// AdSense state'ini temizle
window.adSenseDebug.clear()

// Test için AdSense yüklemeyi simüle et
window.adSenseDebug.simulate()
```

## 3. Yaygın Sorunlar ve Çözümleri

### Sorun 1: AdSense Script Yüklenmiyor
**Belirtiler:**
- `❌ [AdSense] Script load error` log'u
- `⏰ [AdSense] Script timeout` log'u

**Çözümler:**
1. Network sekmesinde `adsbygoogle.js` isteğini kontrol edin
2. AdSense Client ID'yi doğrulayın: `ca-pub-1742989559393752`
3. Production environment'ta olduğunuzdan emin olun

### Sorun 2: AdSense Loader Hook Çalışmıyor
**Belirtiler:**
- `❌ [AdSense Loader] AdSense not available after 30 seconds`
- Component'lerde placeholder görünüyor

**Çözümler:**
1. `window.adSenseDebug.checkScript()` ile durumu kontrol edin
2. Network bağlantısını kontrol edin
3. Browser extension'ları devre dışı bırakın

### Sorun 3: Component'ler Render Edilmiyor
**Belirtiler:**
- `🚫 [BannerAds] Ads disabled by admin settings`
- `🚫 [SidebarAds] No sidebar ads configured`

**Çözümler:**
1. Admin panelinden reklam ayarlarını kontrol edin
2. Environment variable'ları doğrulayın
3. Dynamic Ad Manager ayarlarını kontrol edin

## 4. Environment Variable'ları

Aşağıdaki environment variable'ların doğru ayarlandığından emin olun:

```bash
# AdSense Client ID
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1742989559393752

# AdSense Slot ID'leri
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1006957692
NEXT_PUBLIC_ADSENSE_INLINE_SLOT=1006957692
NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=1006957692
NEXT_PUBLIC_ADSENSE_STICKY_SLOT=1006957692

# Production Environment
NODE_ENV=production
```

## 5. Network Troubleshooting

### DNS ve Connectivity
```bash
# AdSense sunucularına erişimi test et
ping pagead2.googlesyndication.com
nslookup pagead2.googlesyndication.com
```

### Browser Network Tab
1. F12 -> Network sekmesi
2. "adsbygoogle.js" araması yapın
3. Response code'unu kontrol edin (200 OK olmalı)
4. Response time'ı kontrol edin

## 6. Log Filtreleri

Console error filter, AdSense log'larını otomatik olarak korur:
- `[AdSense]` içeren log'lar hiçbir zaman filtrelenmez
- `[BannerAds]` ve `[SidebarAds]` log'ları korunur
- `AdSense Config` ve `AdSense Loader` log'ları korunur

## 7. Production vs Development

### Development Mode
- AdSense script'leri yüklenmez
- Placeholder'lar gösterilir
- Log: `🔍 [AdSense Loader] Development mode - AdSense disabled`

### Production Mode
- AdSense script'leri yüklenir
- Gerçek reklamlar gösterilir
- Log: `🔍 [AdSense Loader] Production mode - Starting availability checks...`

## 8. Performans Optimizasyonu

### Preconnect ve DNS Prefetch
Layout.tsx'te otomatik olarak eklenir:
```html
<link rel="preconnect" href="https://pagead2.googlesyndication.com" />
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
```

### Retry Mechanism
- 3 deneme hakkı
- Exponential backoff (2s, 3s, 4.5s)
- Timeout: 15 saniye
- Fallback: boş adsbygoogle array

## 9. Hata Ayıklama Checklist

- [ ] Console'da AdSense log'larını kontrol et
- [ ] Network tab'da script yükleme durumunu kontrol et
- [ ] Environment variable'ları doğrula
- [ ] Admin panel reklam ayarlarını kontrol et
- [ ] `window.adSenseDebug.getInfo()` çalıştır
- [ ] Browser extension'ları devre dışı bırak
- [ ] AdSense hesap durumunu kontrol et
- [ ] Site AdSense'de onaylandığından emin ol

## 10. İleri Seviye Debugging

### AdSense API Durumu
```javascript
// AdSense API'ye manuel istek
fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1742989559393752')
  .then(response => console.log('AdSense API Response:', response.status))
  .catch(error => console.error('AdSense API Error:', error))
```

### Local Storage ve Session Storage
```javascript
// AdSense ile ilgili local storage kontrolü
Object.keys(localStorage).forEach(key => {
  if (key.includes('ads') || key.includes('google')) {
    console.log(key, localStorage.getItem(key))
  }
})
```

Bu rehber AdSense sorunlarının çoğunu çözmeye yardımcı olacaktır. Sorun devam ederse, console log'larını ve network tab'ını inceleyerek daha detaylı analiz yapabilirsiniz.
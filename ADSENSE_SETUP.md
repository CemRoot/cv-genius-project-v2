# Google AdSense Kurulum Rehberi

## ✅ Tamamlanan Adımlar

1. **Publisher ID Ayarlandı**
   - `.env.local` dosyasında: `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1742989559393752`

2. **ads.txt Dosyası Oluşturuldu**
   - Konum: `/public/ads.txt`
   - İçerik: `google.com, pub-1742989559393752, DIRECT, f08c47fec0942fa0`

3. **Reklam Altyapısı Hazır**
   - Dinamik reklam yönetim sistemi aktif
   - Admin panelden kontrol edilebilir
   - Test sayfası: `/test-ads`

4. **Admin Panel AdSense Yönetimi**
   - Admin panelden AdSense slot ID'lerini dinamik olarak yönetebilirsiniz
   - Vercel environment variable entegrasyonu eklendi
   - Admin Panel → Ads → AdSense Config sekmesinden erişebilirsiniz

## 📋 Yapılması Gerekenler

### 1. Vercel Token Ayarlayın

Admin panelden AdSense ayarlarının kalıcı olması için Vercel token'ınızı ekleyin:

1. [Vercel Account Settings](https://vercel.com/account/tokens) sayfasına gidin
2. "Create" butonuna tıklayın
3. Token'a bir isim verin (örn: "CV Genius Admin")
4. Token'ı kopyalayın
5. Vercel projenizde Environment Variables'a ekleyin:
   - `VERCEL_TOKEN` = [kopyaladığınız token]
   - `VERCEL_PROJECT_ID` = [proje ID'niz] (zaten var)

### 2. Google AdSense Panelinde Reklam Birimleri Oluşturun

AdSense hesabınıza giriş yapın ve aşağıdaki reklam birimlerini oluşturun:

1. **Sidebar Reklamı (300x300)**
   - Ad birim adı: "CV Genius - Sidebar"
   - Boyut: 300x300 (Kare)
   - Tür: Display

2. **İçerik İçi Reklam (Responsive)**
   - Ad birim adı: "CV Genius - Content"
   - Boyut: Responsive
   - Tür: Display

3. **Footer Banner (728x90)**
   - Ad birim adı: "CV Genius - Footer"
   - Boyut: 728x90 (Leaderboard)
   - Tür: Display

4. **Sticky Sidebar (160x600)**
   - Ad birim adı: "CV Genius - Sticky"
   - Boyut: 160x600 (Wide Skyscraper)
   - Tür: Display

### 3. Admin Panelden Slot ID'lerini Ayarlayın

1. Admin panele giriş yapın: `/admin`
2. Sol menüden "Ads" seçeneğine tıklayın
3. "AdSense Config" sekmesine geçin
4. Her reklam birimi için AdSense'in verdiği 10 haneli slot ID'lerini girin:
   - Sidebar Ad (300x300): `1234567890`
   - Inline Content Ad: `0987654321`
   - Footer Banner: `1122334455`
   - Sticky Sidebar: `5544332211`
5. "Save Configuration" butonuna tıklayın

**NOT**: Eğer Vercel token ayarladıysanız, değişiklikler otomatik olarak Vercel'e kaydedilir. Aksi takdirde sadece geçici olarak bellekte tutulur.

### 4. Test Edin

```bash
npm run dev
```

Sonra tarayıcıda açın:
- Test sayfası: http://localhost:3000/test-ads
- Admin panel: http://localhost:3000/admin

### 5. Deploy Edin

```bash
git add .
git commit -m "Add AdSense integration"
git push
```

Vercel otomatik olarak deploy edecektir.

### 6. AdSense Onayı

1. AdSense panelinde sitenizi ekleyin: `cvgenius-one.vercel.app`
2. ads.txt dosyasının erişilebilir olduğunu kontrol edin: https://cvgenius-one.vercel.app/ads.txt
3. AdSense'in site onayını bekleyin (genelde 24-48 saat)

## 🎯 Yeni Özellik: Admin Panel AdSense Yönetimi

Admin panelden AdSense slot ID'lerini dinamik olarak yönetebilirsiniz:

1. **AdSense Config Sekmesi**
   - Admin Panel → Ads → AdSense Config
   - Her reklam birimi için slot ID'leri girebilirsiniz
   - Değişiklikler anında uygulanır

2. **Vercel Entegrasyonu**
   - VERCEL_TOKEN ayarlandığında değişiklikler kalıcı olur
   - Otomatik environment variable güncelleme
   - Deploy gerektirmeden reklam ayarları değiştirilebilir

## 🎛️ Admin Panel Kullanımı

Admin panelde (`/admin`) şunları yapabilirsiniz:

1. **Global Kontroller**
   - Tüm reklamları aç/kapa
   - Mobil reklamları kontrol et
   - Test modunu etkinleştir

2. **Reklam Yönetimi**
   - Her reklam birimini ayrı ayrı kontrol et
   - Gecikme sürelerini ayarla
   - Platform bazlı yönetim

3. **Performans İzleme**
   - İzlenim sayıları
   - Tıklama oranları
   - Tahmini gelir

## 🚨 Önemli Notlar

1. **Güvenlik**: Admin paneli sadece yetkili IP adreslerinden erişilebilir
2. **Kullanıcı Deneyimi**: Kritik sayfalarda (builder, export) reklam gösterilmez
3. **Mobil Optimizasyon**: Mobil cihazlarda farklı reklam yerleşimleri kullanılır
4. **Test Modu**: Development ortamında gerçek reklamlar yerine placeholder'lar görünür

## 📊 Reklam Yerleşimleri

- **Ana Sayfa**: Banner + Sidebar
- **İçerik Sayfaları**: Inline + Sidebar
- **Mobil**: Top/Bottom banner (320x50)
- **Download Akışı**: Interstitial reklam

## 🔧 Sorun Giderme

1. **Reklamlar görünmüyor**
   - Slot ID'lerin doğru girildiğinden emin olun
   - AdSense onayının tamamlandığını kontrol edin
   - Browser konsol hatalarını kontrol edin

2. **ads.txt erişilemiyor**
   - Vercel deployment'ın başarılı olduğunu kontrol edin
   - `/public` klasöründe olduğundan emin olun

3. **Admin panele erişemiyorum**
   - IP adresinizin whitelist'te olduğundan emin olun
   - Doğru kullanıcı adı/şifre kullandığınızdan emin olun
# PDF Export - Clean Print Instructions

CV'yi PDF olarak temiz bir şekilde çıktı almak için aşağıdaki adımları izleyin:

## 🚨 ÖNEMLİ: Print Dialog Ayarları

PDF export butonuna tıkladığınızda açılan print dialog'da **MUTLAKA** şu ayarları yapın:

### Chrome/Edge Kullanıcıları:
1. **"More settings"** (Daha fazla ayar) seçeneğine tıklayın
2. **"Headers and footers"** (Üstbilgi ve altbilgi) seçeneğini **❌ KAPATIN**
3. **"Background graphics"** (Arka plan grafikleri) seçeneğini **✅ AÇIN**
4. **"Margins"** (Kenar boşlukları) seçeneğini **"Minimum"** yapın
5. **"Save as PDF"** seçeneğini seçin ve kaydedin

### Firefox Kullanıcıları:
1. **"Print"** butonuna tıklayın
2. Sağ üstteki **"Settings"** (Ayarlar) ikonuna tıklayın
3. **"Headers and Footers"** seçeneğini **"None"** yapın
4. **"Print backgrounds"** seçeneğini **✅ AÇIN**
5. **"Save to PDF"** seçeneğini seçin

### Safari Kullanıcıları:
1. **"Show Details"** butonuna tıklayın
2. **"Headers and Footers"** dropdown'ını **"None"** yapın
3. **"Save as PDF"** seçeneğini seçin

## 🔧 Teknik İyileştirmeler (Otomatik):

✅ **Aggressive CSS kuralları** - Tüm browser header/footer elemanları gizlendi
✅ **Single page forcing** - 1 sayfa CV'ler için sayfa bölünmesi engellendi  
✅ **Clean document title** - `about:blank` yerine temiz CV başlığı
✅ **Enhanced print settings** - JavaScript ile otomatik browser optimizasyonu
✅ **User guidance overlay** - Print dialog'da otomatik talimat gösterimi

## ⚠️ Sorun Devam Ederse:

### Adım 1: Tarayıcı Ayarları Sıfırlama
- Chrome: `chrome://settings/reset`
- Firefox: `about:support` → "Refresh Firefox"
- Safari: "Develop" → "Empty Caches"

### Adım 2: Alternatif Tarayıcı Deneme
1. Incognito/Private browsing mode kullanın
2. Farklı bir tarayıcı deneyin (Chrome, Firefox, Safari)
3. Browser extensions'ları devre dışı bırakın

### Adım 3: Manuel Print Ayarları
Print dialog açıldığında **ekranda görünen yönergeler**i takip edin.

## ✅ Başarılı PDF'te Olmaması Gerekenler:

- ❌ Sol üstte tarih/saat (örn: "7/8/25, 12:20 PM")
- ❌ Sol altta "about:blank" yazısı
- ❌ Sağ altta sayfa numarası (örn: "1/2")
- ❌ Sağ üstte dosya adı
- ❌ Herhangi bir browser bilgisi

## ✅ Başarılı PDF'te Olması Gerekenler:

- ✅ Sadece CV içeriği (temiz, profesyonel görünüm)
- ✅ Düzgün margin'lar (15mm kenar boşlukları)
- ✅ Tam renk desteği (renkli tasarım elementleri korunur)
- ✅ Tek sayfa layout (1 sayfa CV'ler için)

## 🆘 Hala Sorun Yaşıyorsanız:

Bu talimatları izlemesine rağmen hala header/footer görünüyorsa:
1. Browser'ınızı güncelleyin
2. Printer ayarlarınızı kontrol edin
3. System print settings'lerini sıfırlayın
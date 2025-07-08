# PDF Export - Clean Print Instructions

CV'yi PDF olarak çıktı alırken tarayıcı header/footer elemanlarını gizlemek için aşağıdaki adımları izleyin:

## Chrome/Edge Kullanıcıları İçin:

### Yöntem 1: Print Dialog Ayarları
1. CV'yi PDF olarak export etmek için export butonuna tıklayın
2. Print dialog açıldığında **"More settings"** (Daha fazla ayar) seçeneğine tıklayın
3. **"Headers and footers"** (Üstbilgi ve altbilgi) seçeneğini **KAPATIN**
4. **"Background graphics"** (Arka plan grafikleri) seçeneğini **AÇIN**
5. **"Save as PDF"** seçeneğini seçin
6. **"Save"** butonuna tıklayın

### Yöntem 2: Chrome Flags (Kalıcı Çözüm)
1. Chrome address bar'a `chrome://flags` yazın
2. **"Print header footer"** arayın
3. **"Enable print header footer"** seçeneğini **"Disabled"** yapın
4. Chrome'u yeniden başlatın

## Firefox Kullanıcıları İçin:

1. CV'yi PDF olarak export etmek için export butonuna tıklayın
2. Print dialog açıldığında **"Page Setup"** (Sayfa Kurulumu) seçeneğine tıklayın
3. **"Headers & Footers"** sekmesine gidin
4. Tüm header/footer seçeneklerini **"--blank--"** yapın
5. **"OK"** butonuna tıklayın
6. **"Print to PDF"** seçeneğini seçin

## Safari Kullanıcıları İçin:

1. CV'yi PDF olarak export etmek için export butonuna tıklayın
2. Print dialog açıldığında **"Show Details"** butonuna tıklayın
3. **"Headers and Footers"** dropdown'ını **"None"** yapın
4. **"Save as PDF"** seçeneğini seçin

## Teknik Notlar:

- Kodda zaten CSS ve JavaScript ile header/footer'ları gizleme kuralları eklendi
- `@page { margin-header: 0; margin-footer: 0; }` CSS kuralları eklendi
- HTML title düzenlendi: `about:blank` yerine anlamlı başlık gösterilecek
- Print window'da JavaScript ile tarayıcı ayarları optimize edildi

## Sorun Devam Ederse:

1. Tarayıcı cache'ini temizleyin
2. Farklı bir tarayıcı deneyin
3. Incognito/Private mode kullanın
4. Tarayıcı print ayarlarını varsayılan değerlere sıfırlayın

Bu ayarlar yapıldıktan sonra PDF'te:
- ❌ Sol altta 'about:blank' yazmayacak
- ❌ Sağ altta sayfa numaraları çıkmayacak  
- ❌ Üst kısımda tarih/saat görünmeyecek
- ✅ Sadece CV içeriği temiz şekilde görünecek
# Vercel Deployment Security Guide

## 🔒 Güvenlik Değişiklikleri Özeti

Projede tespit edilen güvenlik açıkları kapatıldı ve tüm hassas bilgiler environment variable'lara taşındı.

### Kaldırılan Hardcoded Değerler:
1. ✅ JWT Secret
2. ✅ Admin şifresi ve hash'i
3. ✅ Password encryption key
4. ✅ Audit encryption key
5. ✅ Reklam ID'leri

### Yeni Güvenlik Özellikleri:
1. ✅ Runtime environment validation
2. ✅ Zorunlu environment variable kontrolü
3. ✅ Production-ready security headers
4. ✅ IP whitelist desteği

## 🚀 Vercel Deployment Adımları

### 1. Vercel Dashboard'da Environment Variables Ekleyin

**ZORUNLU DEĞİŞKENLER:**

```bash
# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key

# Security Keys (Güvenli değerler üretin!)
JWT_SECRET=<openssl rand -hex 32 ile üretilen değer>
PASSWORD_ENCRYPTION_KEY=<openssl rand -hex 32 ile üretilen değer>
AUDIT_ENCRYPTION_KEY=<openssl rand -hex 32 ile üretilen değer>
NEXTAUTH_SECRET=<openssl rand -hex 16 ile üretilen değer>

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PWD_HASH_B64=<bcrypt hash'inin base64 encoded hali>

# Admin Security Keys
ADMIN_KEY_1=<openssl rand -hex 4>
ADMIN_KEY_2=<openssl rand -hex 4>
ADMIN_KEY_3=<openssl rand -hex 4>
ADMIN_KEY_4=<openssl rand -hex 4>

# Application
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### 2. Güvenli Değer Üretme Komutları

```bash
# JWT Secret üret
openssl rand -hex 32

# Encryption key üret
openssl rand -hex 32

# Admin password hash üret
node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('YourVerySecurePassword123!', 10); console.log(Buffer.from(hash).toString('base64'));"

# Security keys üret
openssl rand -hex 4
```

### 3. Vercel Dashboard'da Ayarlama

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings → Environment Variables
4. Her bir değişkeni ekleyin
5. Production, Preview ve Development için ayrı değerler kullanın

### 4. IP Whitelist Konfigürasyonu

Production'da admin paneli güvenliği için:

```bash
ADMIN_IP_WHITELIST=trusted_ip_1,trusted_ip_2,office_ip
```

### 5. Deployment Sonrası Kontroller

1. **Environment Validation:** Uygulama başlarken tüm zorunlu değişkenler kontrol edilir
2. **Security Headers:** `vercel.json` ile güvenlik başlıkları otomatik eklenir
3. **Admin Panel:** `/admin` sayfasına giriş yaparak test edin

## ⚠️ Önemli Güvenlik Notları

1. **ASLA** .env.local dosyasını commit etmeyin
2. **HER ZAMAN** production için yeni, güçlü şifreler kullanın
3. **DÜZENLİ** olarak şifreleri rotasyon yapın (90 günde bir)
4. **FARKLI** environment'lar için farklı credentials kullanın
5. **İZLEYİN** admin panel erişim loglarını

## 🛠️ Sorun Giderme

### "JWT_SECRET environment variable is required" hatası
- Vercel Dashboard'da JWT_SECRET eklendiğinden emin olun
- Deployment'ı yeniden başlatın

### Admin paneline giriş yapamıyorum
1. ADMIN_PWD_HASH_B64 doğru ayarlandığından emin olun
2. Şifrenizi doğru girdiğinizden emin olun
3. IP whitelist'e IP'nizi ekleyin

### Environment validation hataları
- Tüm zorunlu değişkenlerin eklendiğinden emin olun
- Değerlerin doğru formatta olduğunu kontrol edin

## 📝 Güvenlik Checklist

- [ ] Tüm zorunlu environment variable'lar eklendi
- [ ] Production şifreleri güçlü ve benzersiz
- [ ] IP whitelist konfigüre edildi
- [ ] Admin şifresi değiştirildi
- [ ] Vercel Dashboard'da değişkenler doğru environment'lara atandı
- [ ] .env.local gitignore'da
- [ ] İlk deployment sonrası admin paneli test edildi

## 🔄 Düzenli Bakım

1. **Şifre Rotasyonu:** Her 90 günde bir
2. **IP Whitelist Güncelleme:** Gerektiğinde
3. **Security Audit Log İnceleme:** Haftalık
4. **Environment Variable Kontrolü:** Aylık

---

**Not:** Bu dokümandaki örnek değerler sadece gösterim amaçlıdır. Production'da kesinlikle kendi güvenli değerlerinizi üretin ve kullanın!
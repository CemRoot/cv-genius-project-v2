const crypto = require('crypto');

// Admin şifrenizi buraya yazın
const adminPassword = "your-password-here";  // ← BU SATIRI DEĞİŞTİRİN

// Hash oluştur
const hash = crypto.createHash('sha256').update(adminPassword).digest('hex');
const base64Hash = Buffer.from(hash).toString('base64');

console.log('='.repeat(50));
console.log('🔐 ADMIN ŞİFRE HASH GENERATORü');
console.log('='.repeat(50));
console.log('Şifre:', adminPassword);
console.log('Hash (base64):', base64Hash);
console.log('='.repeat(50));
console.log('Bu değeri Vercel environment variables\'a ekleyin:');
console.log('Name: ADMIN_PWD_HASH_B64');
console.log('Value:', base64Hash);
console.log('='.repeat(50)); 
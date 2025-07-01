# CV Genius Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Configuration

#### 🔐 Critical Security Variables (REQUIRED)
```env
# JWT Authentication
JWT_SECRET=<generate-64-character-random-string>

# Admin Credentials
ADMIN_USERNAME=<your-admin-username>
ADMIN_PWD_HASH_B64=<bcrypt-hash-base64-encoded>

# Encryption Keys
PASSWORD_ENCRYPTION_KEY=<64-character-hex-string>
AUDIT_ENCRYPTION_KEY=<32-character-random-string>

# API Authentication
VALID_API_KEYS=<comma-separated-api-keys>
```

#### 🤖 AI API Keys (REQUIRED)
```env
# Gemini API (Required for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>

# HuggingFace (Optional for ATS features)
HUGGINGFACE_API_KEY=<your-huggingface-api-key>
```

#### 🔒 Admin Security Keys (REQUIRED)
```env
# Hidden panel validation keys
ADMIN_KEY_1=0x1A2B
ADMIN_KEY_2=0x3C4D
ADMIN_KEY_3=0x5E6F
ADMIN_KEY_4=0x7890
```

#### 📡 Vercel KV (Auto-configured when connected)
```env
KV_REST_API_URL=<auto-configured>
KV_REST_API_TOKEN=<auto-configured>
KV_REST_API_READ_ONLY_TOKEN=<auto-configured>
```

#### ⚙️ Optional Configuration
```env
# IP Whitelist (comma-separated IPs)
ADMIN_IP_WHITELIST=192.168.1.1,10.0.0.1

# Disable IP whitelist (NOT recommended for production)
DISABLE_IP_WHITELIST=false

# Environment
NODE_ENV=production

# Public API Key for client-side AI features (if needed)
NEXT_PUBLIC_API_KEY=<public-api-key>
```

### 2. Generate Required Values

#### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Generate Password Hash
```bash
# Install bcrypt if needed
npm install bcrypt

# Generate hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD_HERE', 10, (err, hash) => console.log(Buffer.from(hash).toString('base64')))"
```

#### Generate Encryption Keys
```bash
# For PASSWORD_ENCRYPTION_KEY (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For AUDIT_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### Generate API Keys
```bash
# Generate secure API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Vercel Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variables**
   ```bash
   # Set each variable
   vercel env add JWT_SECRET production
   vercel env add ADMIN_USERNAME production
   vercel env add ADMIN_PWD_HASH_B64 production
   # ... repeat for all variables
   ```

4. **Connect Vercel KV**
   - Go to Vercel Dashboard → Storage → Create Database
   - Select KV Storage
   - Connect to your project

5. **Deploy**
   ```bash
   vercel --prod
   ```

### 4. Post-Deployment Verification

#### ✅ Security Checks
- [ ] Admin panel requires authentication (`/admin`)
- [ ] AI endpoints return 401 without API key
- [ ] Cover letter generation uses admin-managed prompts
- [ ] Ad settings can be controlled from admin panel
- [ ] API keys are not exposed in client-side code

#### ✅ Functionality Tests
- [ ] CV Builder creates and saves CVs
- [ ] ATS Checker analyzes resumes
- [ ] Cover Letter Generator works with all templates
- [ ] AI Improve works on CV sections
- [ ] Admin can update prompts and see changes reflected

#### ✅ Admin Panel Access
1. Navigate to `/admin`
2. If IP whitelisting is enabled, add `?k=<calculated-key>` parameter
3. Login with your admin credentials
4. Test all admin features:
   - [ ] CV Builder Prompts management
   - [ ] Cover Letter Prompts management
   - [ ] AI Settings control
   - [ ] Ad control (enable/disable)

### 5. API Testing

#### Test Authentication
```bash
# Should return 401
curl https://your-app.vercel.app/api/ai/generate-cover-letter

# Should work with API key
curl -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template":"basic","tone":"formal"}' \
  https://your-app.vercel.app/api/ai/generate-cover-letter
```

### 6. Monitoring Setup

1. **Enable Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Check Logs**
   ```bash
   vercel logs --follow
   ```

3. **Monitor API Usage**
   - Check Gemini API console for usage
   - Monitor Vercel KV usage
   - Review rate limiting effectiveness

### 7. Backup Important Data

Before deploying, backup:
- [ ] `/data/cv-builder-prompts.json`
- [ ] `/data/cover-letter-prompts.json`
- [ ] `/data/admin-settings.json`
- [ ] `/data/admin-ad-settings.json`

### 8. Emergency Procedures

#### If locked out of admin panel:
1. Set `DISABLE_IP_WHITELIST=true` temporarily
2. Access admin panel and update IP whitelist
3. Remove `DISABLE_IP_WHITELIST` environment variable

#### If API keys compromised:
1. Generate new API keys immediately
2. Update `VALID_API_KEYS` environment variable
3. Notify any users with API access

### 9. Final Checklist

- [ ] All environment variables set
- [ ] Vercel KV connected
- [ ] Admin password is strong and unique
- [ ] API keys are distributed securely
- [ ] IP whitelist configured (if using)
- [ ] Tested all core features
- [ ] Monitoring is active
- [ ] Backup completed
- [ ] Team notified of deployment

## 🚀 Ready to Deploy!

Once all items are checked, your CV Genius application is ready for production deployment on Vercel.
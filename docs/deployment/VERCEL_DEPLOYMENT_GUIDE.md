# Vercel Deployment Guide - CV Genius

## Overview

This guide covers the complete deployment and security configuration for CV Genius on Vercel, including environment variables, KV storage setup, and security best practices.

## Prerequisites

- Vercel account with Pro plan (for KV storage)
- Node.js 18+ locally installed
- Vercel CLI: `npm i -g vercel`

## Environment Variables Setup

### 1. Critical Security Variables (Required)

```bash
# Authentication
JWT_SECRET=<generate-64-char-random-string>
ADMIN_USERNAME=<your-admin-username>
ADMIN_PWD_HASH_B64=<bcrypt-hash-base64-encoded>
PASSWORD_ENCRYPTION_KEY=<64-char-hex-string>
AUDIT_ENCRYPTION_KEY=<32-char-random-string>

# API Security
VALID_API_KEYS=<comma-separated-api-keys>
# Example: key1,key2,key3

# Admin Security Keys (for hidden panel validation)
ADMIN_KEY_1=0x1A2B
ADMIN_KEY_2=0x3C4D
ADMIN_KEY_3=0x5E6F
ADMIN_KEY_4=0x7890
```

### 2. AI/ML API Keys

```bash
# Gemini API (Required for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>

# HuggingFace (Optional)
HUGGINGFACE_API_KEY=<your-huggingface-key>
```

### 3. Vercel KV Configuration (Auto-configured)

```bash
# These are automatically set when you connect Vercel KV
KV_REST_API_URL=<auto-configured>
KV_REST_API_TOKEN=<auto-configured>
KV_REST_API_READ_ONLY_TOKEN=<auto-configured>
```

### 4. Optional Security Settings

```bash
# IP Whitelist (comma-separated)
ADMIN_IP_WHITELIST=192.168.1.1,10.0.0.1

# Disable IP whitelist (NOT recommended for production)
DISABLE_IP_WHITELIST=false

# Development mode
NODE_ENV=production
```

## Step-by-Step Deployment

### 1. Generate Required Secrets

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Password Hash
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10, (err, hash) => console.log(Buffer.from(hash).toString('base64')))"

# Generate Encryption Keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Create Vercel Project

```bash
# Login to Vercel
vercel login

# Create new project
vercel

# Link to existing project
vercel link
```

### 3. Configure Environment Variables

```bash
# Add each variable
vercel env add JWT_SECRET production
vercel env add ADMIN_USERNAME production
# ... repeat for all variables
```

Or use the Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment
3. Optionally add different values for Preview/Development

### 4. Setup Vercel KV

1. In Vercel Dashboard → Storage → Create Database
2. Select KV Storage
3. Choose your region (closest to your users)
4. Connect to your project

The KV environment variables will be automatically added.

### 5. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch if connected to Git
git push origin main
```

## Post-Deployment Configuration

### 1. Initialize Admin Password

After first deployment, the admin password hash will be stored in Vercel KV automatically on first login.

### 2. Configure IP Whitelist

```bash
# Add allowed IPs via environment variable
vercel env add ADMIN_IP_WHITELIST "your-ip,office-ip" production
```

Or use the admin panel (after whitelisting your IP):
1. Navigate to `/admin`
2. Use security key parameter: `/admin?k=<calculated-key>`
3. Access IP whitelist settings

### 3. Generate API Keys

```bash
# Generate secure API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `VALID_API_KEYS` environment variable.

### 4. Test Security Features

```bash
# Test admin panel security
curl https://your-app.vercel.app/admin
# Should return 404

# Test API authentication
curl https://your-app.vercel.app/api/ai/generate-cover-letter
# Should return 401 Unauthorized

# Test with API key
curl -H "x-api-key: your-key" https://your-app.vercel.app/api/ai/generate-cover-letter
```

## Vercel-Specific Optimizations

### 1. Edge Runtime (Performance)

For better performance, some routes can use Edge Runtime:

```typescript
export const runtime = 'edge' // Add to route.ts files
```

Suitable for:
- Authentication checks
- Simple API routes
- Static data fetching

### 2. Caching Headers

Configure caching in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/templates/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=86400'
        }
      ]
    }
  ]
}
```

### 3. Monitoring

1. Enable Vercel Analytics:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to layout.tsx:
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   
   <Analytics />
   ```

## Security Checklist

- [ ] All environment variables set
- [ ] JWT_SECRET is strong and unique
- [ ] Admin password is hashed (not plain text)
- [ ] API keys generated and set
- [ ] IP whitelist configured (if needed)
- [ ] Vercel KV connected and working
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] AI endpoints require authentication

## Troubleshooting

### KV Connection Issues

```bash
# Test KV connection
vercel env pull
# Check if KV variables are present
```

### Admin Access Issues

1. Check IP whitelist settings
2. Verify security key calculation
3. Check browser console for CORS errors
4. Verify JWT_SECRET is set

### API Rate Limiting

If legitimate users hit rate limits:
1. Increase limits in code
2. Use different limits per API key tier
3. Consider implementing usage quotas

## Maintenance

### Regular Tasks

1. **Rotate Secrets Quarterly**
   ```bash
   vercel env rm JWT_SECRET production
   vercel env add JWT_SECRET production
   ```

2. **Monitor API Usage**
   - Check Vercel KV for rate limit patterns
   - Monitor Gemini API costs
   - Review access logs

3. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Project Issues: https://github.com/your-repo/issues

Remember: Never commit sensitive environment variables to your repository!
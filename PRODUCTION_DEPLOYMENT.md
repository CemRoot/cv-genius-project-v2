# Production Deployment Guide

## 🔒 Security Checklist

### Environment Variables
Before deploying to production, ensure all environment variables are properly set:

#### Required Variables
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
JWT_SECRET=your_strong_jwt_secret_key_here
NEXTAUTH_SECRET=your_strong_nextauth_secret_here
```

#### Optional but Recommended
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
ADMIN_IP_WHITELIST={"entries":[{"ip":"YOUR_ADMIN_IP","label":"Admin Access","isActive":true}],"lastUpdated":"2024-01-01T00:00:00.000Z"}
ADMIN_2FA_STATE={"secret":null,"enabled":false,"lastUpdated":"2024-01-01T00:00:00.000Z"}
```

#### Performance & Analytics
```bash
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=CV Genius
```

### Files to Never Commit
- `.env.local` - Contains API keys
- `.env.production` - Production environment
- `.2fa-state.json` - 2FA secrets
- `.ip-whitelist.json` - IP whitelist data
- `scripts/admin/` - Admin access scripts

## 🚀 Deployment Steps

### 1. Environment Setup
1. Copy `.env.example` to `.env.production`
2. Fill in all required environment variables
3. Generate strong secrets:
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   
   # Generate NextAuth secret
   openssl rand -base64 32
   ```

### 2. Security Configuration
1. Set up IP whitelist for admin access
2. Configure 2FA for admin panel
3. Update CORS settings if needed
4. Set up rate limiting (consider Redis for production)

### 3. Performance Optimization
1. Enable Next.js production optimizations
2. Configure CDN for static assets
3. Set up proper caching headers
4. Enable compression

### 4. Monitoring
1. Set up error tracking (Sentry, etc.)
2. Configure performance monitoring
3. Set up uptime monitoring
4. Enable logging

## 🔧 Vercel Deployment

### Environment Variables in Vercel
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all required variables:
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `HUGGINGFACE_API_KEY` (optional)
   - `ADMIN_IP_WHITELIST` (JSON string)
   - `ADMIN_2FA_STATE` (JSON string)

### Build Settings
```bash
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Custom Headers (vercel.json)
```json
{
  "headers": [
    {
      "source": "/api/admin/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## ⚠️ Post-Deployment Checks

### 1. Functionality Tests
- [ ] CV builder works end-to-end
- [ ] PDF export functions properly
- [ ] AI features are operational
- [ ] Template system loads correctly

### 2. Security Tests
- [ ] Admin panel requires authentication
- [ ] IP whitelist is enforced
- [ ] API endpoints are protected
- [ ] No debug information exposed

### 3. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Images are optimized
- [ ] Bundle size is optimized
- [ ] SEO tags are present

## 🛡️ Security Best Practices

### API Security
- All admin endpoints require authentication
- Rate limiting is enforced
- CORS is properly configured
- Input validation on all endpoints

### Data Protection
- No sensitive data in localStorage
- API keys are server-side only
- User data is not logged
- HTTPS is enforced

### Access Control
- IP whitelist for admin access
- 2FA for admin accounts
- Session management
- Secure cookie settings

## 🔄 Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update API keys as needed
- Review access logs

### Backup Strategy
- Export environment variables
- Backup template configurations
- Document custom modifications

## 📞 Support

If you encounter issues during deployment:
1. Check the console for errors
2. Verify all environment variables
3. Test with development build first
4. Check Vercel deployment logs 
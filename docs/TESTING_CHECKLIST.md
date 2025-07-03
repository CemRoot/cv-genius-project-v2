# CV Genius Testing Checklist

## 🚀 Recent Deployment Fixes

### 1. CSP (Content Security Policy) Fixes
- ✅ Added `vercel.json` with comprehensive CSP headers
- ✅ Included `blob:` in connect-src and worker-src
- ✅ Added `https://cdnjs.cloudflare.com` for PDF.js worker
- ✅ Added Google Fonts domains for font loading
- ✅ Removed CSP from middleware to avoid conflicts

### 2. API Performance Fixes
- ✅ Added `maxDuration: 30` seconds to all AI routes
- ✅ Added `memory: 1024` MB for PDF and AI processing
- ✅ Set `runtime: 'nodejs'` for proper Node.js environment
- ✅ Added `preferredRegion: 'auto'` for optimal performance

### 3. Authentication Fixes
- ✅ Added debug logging to track header issues
- ✅ Improved handling of null origin headers
- ✅ Enhanced same-origin request validation

## 🧪 Testing Steps

### 1. Environment Variables Check
```bash
# Visit this URL after deployment:
https://cvgenius-one.vercel.app/api/test-env

# Should show:
{
  "success": true,
  "environment": {
    "GEMINI_API_KEY": true,
    "HUGGINGFACE_API_KEY": true,
    "JWT_SECRET": true,
    "KV_REST_API_URL": true,
    "KV_REST_API_TOKEN": true,
    "DISABLE_IP_WHITELIST": "true",
    "NODE_ENV": "production"
  }
}
```

### 2. CSP Headers Verification
1. Open Chrome DevTools → Network tab
2. Visit https://cvgenius-one.vercel.app
3. Click on any request → Response Headers
4. Verify `Content-Security-Policy` includes:
   - `blob:` in connect-src and worker-src
   - `https://cdnjs.cloudflare.com` in script-src, connect-src, worker-src
   - `https://fonts.googleapis.com` in style-src

### 3. PDF Upload Test
1. Go to ATS Checker: https://cvgenius-one.vercel.app/ats-check
2. Upload a PDF file
3. Check console for errors
4. Expected: Either successful parse OR graceful fallback message

### 4. AI Features Test
Test each AI endpoint:

#### a. CV Text Improvement
1. Go to CV Builder
2. Add some experience
3. Click "Improve with AI"
4. Should generate improved text without errors

#### b. ATS Analysis
1. Upload or paste CV text
2. Click "Analyze"
3. Should return ATS score and suggestions

#### c. Cover Letter Generation
1. Go to Cover Letter section
2. Fill in job details
3. Generate cover letter
4. Should use admin-configured prompts

### 5. Check Logs (if you have Vercel CLI)
```bash
vercel logs https://cvgenius-one.vercel.app --all

# Look for:
# - "API Auth Headers:" logs
# - Any error stack traces
# - Timeout messages
```

## 🔍 Common Issues & Solutions

### If still getting CSP errors:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache completely
3. Try incognito/private mode

### If API returns 500:
1. Check /api/test-env to verify env vars
2. Look for "API Auth Headers:" in Vercel logs
3. Verify the request has proper origin/referer headers

### If PDF parsing fails:
1. The fallback will suggest using text input
2. This is expected for complex PDFs
3. User can copy-paste CV text as alternative

## 📊 Success Criteria

✅ No CSP violations in console
✅ PDF.js worker loads from cdnjs
✅ API endpoints return 200 status
✅ AI features generate content
✅ No timeout errors (30s limit)

## 🚨 If Issues Persist

1. Share the exact error from console
2. Include the "API Auth Headers:" log entry
3. Note which specific feature is failing
4. Check Network tab for failed requests
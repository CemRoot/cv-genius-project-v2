# Setting Up Gemini API Key on Vercel

## Quick Setup Steps

### 1. Get Your Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIza...")

### 2. Add to Vercel via Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your API key (AIza...)
   - **Environment**: Select all (Production, Preview, Development)
4. Click "Save"

### 3. Alternative: Add via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Add for production
vercel env add GEMINI_API_KEY production

# Add for preview deployments
vercel env add GEMINI_API_KEY preview

# Add for development
vercel env add GEMINI_API_KEY development
```

### 4. Verify Setup
After deployment, check:
```
https://cvgenius-one.vercel.app/api/test-gemini
```

Should return:
```json
{
  "success": true,
  "hasApiKey": true,
  "testResult": true,
  "message": "API is working"
}
```

### 5. Redeploy
- Push any commit to trigger redeployment
- Or go to Vercel dashboard → Deployments → Redeploy

## Important Notes

- **DO NOT** use `NEXT_PUBLIC_GEMINI_API_KEY` - this exposes the key to browsers
- **DO NOT** commit the API key to your repository
- The key should only be in Vercel's environment variables

## Troubleshooting

If you still get 500 errors after setting the key:

1. Check logs in Vercel dashboard → Functions tab
2. Look for "Gemini Client Init:" log entry
3. Ensure the key shows as present with correct length

## Current Status

The code is now configured to:
- Only check for `GEMINI_API_KEY` (not the public version)
- Log debugging info to help diagnose issues
- Return clear error messages if the key is missing
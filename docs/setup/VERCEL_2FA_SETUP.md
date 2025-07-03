# 2FA Setup for Vercel

## The Problem
Your 2FA is set up in Google Authenticator, but Vercel doesn't know about it because the 2FA state is stored locally in `.2fa-state.json` file, which doesn't exist on Vercel's servers.

## Solution 1: Disable 2FA (Easiest)
Add this environment variable to Vercel:

```
ADMIN_2FA_STATE={"secret":null,"enabled":false,"lastUpdated":"2024-12-28T10:00:00.000Z"}
```

This will disable 2FA and let you login with just username and password.

## Solution 2: Enable 2FA with Your Existing Secret
If you want to keep using your existing Google Authenticator setup, you need:

1. The secret key that was shown when you first set up 2FA
2. Add this to Vercel environment variables:

```
ADMIN_2FA_STATE={"secret":"YOUR_SECRET_KEY_HERE","enabled":true,"lastUpdated":"2024-12-28T10:00:00.000Z"}
```

## How to Add to Vercel:

1. Go to your Vercel Dashboard
2. Select your project (cv-genius-project-v2)
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `ADMIN_2FA_STATE`
   - Value: One of the JSON strings above
   - Environment: Production (and Preview if needed)
5. Click Save
6. Redeploy your application

## Important Notes:

- If you don't have your original 2FA secret key, use Solution 1 to disable 2FA first
- After logging in, you can set up 2FA again from the admin panel
- The new setup will give you a new QR code to scan

## Alternative: Use Database
For production, consider storing 2FA state in a database instead of environment variables for better security and management.
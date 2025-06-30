# Admin Panel Dynamic Configuration

This document explains how the CV Genius admin panel dynamically updates IP whitelist and password settings in Vercel.

## Overview

The admin panel now supports dynamic configuration updates that sync with Vercel environment variables, eliminating the need to manually update environment variables through the Vercel dashboard.

## Features

### 1. Dynamic IP Whitelist Management

- **Location**: Admin Panel > Security > IP Whitelist
- **Functionality**: 
  - Add/remove IP addresses from the whitelist
  - Automatically add your current IP
  - Sync changes with Vercel environment variables
  - Works with Vercel KV storage for persistence

### 2. Dynamic Password Updates

- **Location**: Admin Panel > Security > Password Management
- **Functionality**:
  - Change admin password from the panel
  - Automatically updates the password hash in Vercel
  - No need to manually update `ADMIN_PWD_HASH_B64`

## Required Environment Variables

To enable Vercel integration, set the following environment variables:

```env
# Vercel API Integration (Required for dynamic updates)
VERCEL_TOKEN=your_vercel_api_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id  # Optional, only if using teams

# Vercel KV (Optional but recommended)
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
```

## How to Get Vercel API Credentials

1. **VERCEL_TOKEN**:
   - Go to https://vercel.com/account/tokens
   - Create a new token with full access
   - Copy the token value

2. **VERCEL_PROJECT_ID**:
   - Go to your project settings in Vercel
   - Find the Project ID in the General tab
   - Or use: `vercel project ls` in CLI

3. **VERCEL_TEAM_ID** (if using teams):
   - Go to your team settings
   - Find the Team ID
   - Or use: `vercel team ls` in CLI

## Usage

### Managing IP Whitelist

1. Navigate to Admin Panel > Security
2. Click "Manage IP Whitelist"
3. Add or remove IP addresses
4. Click "Update in Vercel" to sync

### Changing Password

1. Navigate to Admin Panel > Security
2. Click "Change Password"
3. Enter current and new passwords
4. Submit to update both locally and in Vercel

## Fallback Behavior

If Vercel integration is not configured:
- IP whitelist changes are saved locally only
- Password changes are saved locally only
- You'll see warnings about missing Vercel configuration
- Manual environment variable updates will be required

## Security Notes

- Always ensure your current IP is in the whitelist before removing others
- The system prevents you from removing your current IP
- Password changes take effect immediately locally
- Vercel environment changes require a new deployment to take effect

## Troubleshooting

### "Vercel Integration Not Configured" Error
- Ensure VERCEL_TOKEN and VERCEL_PROJECT_ID are set
- Verify the token has proper permissions

### Changes Not Reflecting in Production
- Vercel environment changes require a new deployment
- Trigger a redeployment after making changes

### IP Whitelist Not Working
- Check if `DISABLE_IP_WHITELIST=true` is set (disables whitelist)
- Verify your IP format is correct (IPv4 or IPv6)
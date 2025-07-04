# Maintenance Mode System

This document explains how the section-specific maintenance mode system works in CV Genius.

## Overview

The maintenance mode system allows administrators to temporarily disable specific sections of the website while showing users a professional maintenance page. This is useful when debugging issues without taking the entire site offline.

## Features

- **Section-specific maintenance**: Enable maintenance mode for individual sections (CV Builder, Cover Letter Generator, etc.)
- **Global maintenance mode**: Disable the entire site with one toggle
- **Custom messages**: Set custom maintenance messages and estimated downtime for each section
- **Admin bypass**: Administrators can always access sections in maintenance mode
- **Professional maintenance page**: Clean, responsive maintenance page with real-time clock
- **Environment variable control**: Perfect for Vercel deployments

## How to Use

### Method 1: Environment Variables (Recommended for Production)

1. **Access your Vercel Dashboard**
   - Go to your project settings
   - Navigate to Environment Variables

2. **Add maintenance variables**
   ```bash
   # Global maintenance
   NEXT_PUBLIC_GLOBAL_MAINTENANCE=true
   
   # Section-specific maintenance
   NEXT_PUBLIC_CV_BUILDER_MAINTENANCE=true
   NEXT_PUBLIC_CV_BUILDER_MESSAGE="Custom maintenance message"
   NEXT_PUBLIC_CV_BUILDER_TIME="30 minutes"
   ```

3. **Redeploy your application**
   - Changes take effect after redeployment

### Method 2: Local Testing

1. **Copy the example environment file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` to enable maintenance**
   ```bash
   NEXT_PUBLIC_CV_BUILDER_MAINTENANCE=true
   ```

3. **Restart your development server**
   ```bash
   npm run dev
   ```

### Testing Maintenance Mode

1. Open an incognito/private browser window (to bypass admin cookie)
2. Navigate to the section you put in maintenance mode
3. You should see the maintenance page

## Available Sections and Environment Variables

### CV Builder (`/builder`)
- Enable: `NEXT_PUBLIC_CV_BUILDER_MAINTENANCE=true`
- Message: `NEXT_PUBLIC_CV_BUILDER_MESSAGE="Your message"`
- Time: `NEXT_PUBLIC_CV_BUILDER_TIME="30 minutes"`

### Cover Letter Generator (`/cover-letter`)
- Enable: `NEXT_PUBLIC_COVER_LETTER_MAINTENANCE=true`
- Message: `NEXT_PUBLIC_COVER_LETTER_MESSAGE="Your message"`
- Time: `NEXT_PUBLIC_COVER_LETTER_TIME="1 hour"`

### ATS Analyzer (`/ats-analyzer`)
- Enable: `NEXT_PUBLIC_ATS_ANALYZER_MAINTENANCE=true`
- Message: `NEXT_PUBLIC_ATS_ANALYZER_MESSAGE="Your message"`
- Time: `NEXT_PUBLIC_ATS_ANALYZER_TIME="45 minutes"`

### CV Wizard (`/wizard`)
- Enable: `NEXT_PUBLIC_WIZARD_MAINTENANCE=true`
- Message: `NEXT_PUBLIC_WIZARD_MESSAGE="Your message"`
- Time: `NEXT_PUBLIC_WIZARD_TIME="2 hours"`

### Templates (`/templates`)
- Enable: `NEXT_PUBLIC_TEMPLATES_MAINTENANCE=true`
- Message: `NEXT_PUBLIC_TEMPLATES_MESSAGE="Your message"`
- Time: `NEXT_PUBLIC_TEMPLATES_TIME="15 minutes"`

## Technical Details

### Components

1. **MaintenanceManagement Component** (`/src/components/admin/maintenance-management.tsx`)
   - Admin UI for managing maintenance settings
   - Integrates with the admin panel

2. **MaintenancePage Component** (`/src/components/maintenance-page.tsx`)
   - The maintenance page shown to users
   - Displays custom messages and estimated downtime

3. **Maintenance Middleware** (`/src/middleware/maintenance.ts`)
   - Checks maintenance status for each request
   - Redirects to maintenance page when needed

### API Endpoints

- `GET /api/maintenance/status` - Check maintenance status (public)
- `GET/POST/PUT /api/admin/maintenance` - Manage maintenance settings (admin only)

### Data Storage

Maintenance settings are stored in `/data/maintenance-settings.json`:

```json
{
  "globalMaintenance": false,
  "sections": [
    {
      "id": "cv-builder",
      "name": "CV Builder",
      "path": "/builder",
      "isInMaintenance": false,
      "message": "We are currently performing maintenance on the CV Builder.",
      "estimatedTime": "30 minutes"
    }
  ]
}
```

## Vercel Deployment

The system is designed to work seamlessly with Vercel:

1. Maintenance settings are stored in the `/data` directory
2. Settings persist across deployments (if using persistent storage)
3. No environment variables required
4. Works with Vercel's edge runtime

## Security

- Only authenticated administrators can change maintenance settings
- Admin users automatically bypass maintenance mode
- Settings API endpoints are protected with authentication checks

## Troubleshooting

### Maintenance mode not working?

1. Check if the middleware is running (look for console logs)
2. Verify the maintenance settings file exists
3. Ensure you're not logged in as admin (use incognito mode)

### Settings not persisting?

1. Check file write permissions in the `/data` directory
2. Verify the API endpoints are returning success responses
3. Check browser console for errors

## Future Enhancements

- Schedule maintenance windows in advance
- Email notifications when maintenance mode is enabled
- Maintenance history/logs
- API endpoint health checks during maintenance
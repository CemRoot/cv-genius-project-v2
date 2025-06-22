# PropellerAds Keys to Replace

## Current Placeholder Keys in Ad Components

### Banner Ads (`/src/components/ads/banner-ads.tsx`)
- `REPLACE_WITH_LARGE_BANNER_KEY` (728x90)
- `REPLACE_WITH_MEDIUM_BANNER_KEY` (468x60)  
- `REPLACE_WITH_SMALL_BANNER_KEY` (320x50)

### Sidebar Ads (`/src/components/ads/sidebar-ads.tsx`)
- `REPLACE_WITH_YOUR_DISPLAY_KEY` (300x250)
- `REPLACE_WITH_YOUR_AD_ID` (script URL)

### Sticky Side Ads (`/src/components/ads/sticky-side-ads.tsx`)
- `REPLACE_WITH_LEFT_SIDE_KEY` (160x600)
- `REPLACE_WITH_RIGHT_SIDE_KEY` (160x600)

### Mobile Ads (`/src/components/ads/mobile-ads.tsx`)
- `REPLACE_WITH_MOBILE_TOP_KEY` (320x50)
- `REPLACE_WITH_MOBILE_BOTTOM_KEY` (320x50)
- `REPLACE_WITH_MOBILE_FLOAT_KEY` (300x250)

## Instructions
1. Sign up for PropellerAds account
2. Create ad zones for each size/placement
3. Replace the placeholder keys with actual zone IDs
4. Test on staging environment before production

## Download Redirect URL
Current redirect URL in export-manager.tsx and download-redirect-handler.tsx:
- `https://n91hg.com/4/9465036`

Update this with your actual monetization URL.
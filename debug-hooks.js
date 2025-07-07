#!/usr/bin/env node

/**
 * React Hook Error Debug Script
 * Run this to help identify hook violations in production
 */

console.log('🔍 React Hook Error Debug Information\n');

// Check if we're in the right directory
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('./package.json')) {
  console.error('❌ Run this script from the project root directory');
  process.exit(1);
}

console.log('📋 Debug Steps to Follow:\n');

console.log('1. 🧹 Clear Vercel Build Cache:');
console.log('   - Go to Vercel Dashboard');
console.log('   - Settings > Functions > Purge Cache');
console.log('   - Or run: npx vercel --force\n');

console.log('2. 🏗️  Test Production Build Locally:');
console.log('   npm run build');
console.log('   npm run start');
console.log('   - Check for build errors\n');

console.log('3. 🌐 Check Environment Variables:');
console.log('   - NODE_ENV should be "production" on Vercel');
console.log('   - Check .env.production file\n');

console.log('4. 🧹 Clear Browser Cache:');
console.log('   - Open DevTools > Application > Clear Storage');
console.log('   - Or test in Incognito mode\n');

console.log('5. 📊 Monitor Errors:');
console.log('   - Open Browser DevTools Console');
console.log('   - Look for "React Hook Error Details" logs');
console.log('   - Check Network tab for failed requests\n');

console.log('6. 🔄 Force New Deployment:');
console.log('   git add .');
console.log('   git commit -m "fix: force cache bust for hook errors"');
console.log('   git push\n');

console.log('7. ⚡ Quick Fixes Applied:');
console.log('   ✅ useAdSenseLoader hook stabilized');
console.log('   ✅ DynamicAdManager context always provided');
console.log('   ✅ All ad components use SafeAdWrapper');
console.log('   ✅ Hook dependencies fixed');
console.log('   ✅ Error tracking added');
console.log('   ✅ Cache headers updated\n');

console.log('🎯 Key Files Modified:');
console.log('   - src/hooks/use-adsense-loader.ts');
console.log('   - src/components/ads/dynamic-ad-manager.tsx');
console.log('   - src/components/ads/banner-ads.tsx');
console.log('   - src/app/layout.tsx');
console.log('   - vercel.json');
console.log('   - components/SafeAdWrapper.tsx (new)\n');

console.log('🚨 If errors persist after deployment:');
console.log('   1. Check Vercel function logs: npx vercel logs');
console.log('   2. Test in multiple browsers');
console.log('   3. Check for Service Worker cache issues');
console.log('   4. Verify all changes deployed correctly\n');

console.log('✅ React Hook Error 310 should be resolved!');
'use client'

import { useEffect } from 'react'

const GentleMonetization = () => {
  useEffect(() => {
    // Only load in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_MONETIZATION) {
      console.log('🚫 Gentle monetization disabled in development')
      return
    }

    console.log('💰 Gentle monetization system initializing...')

    // Script 1: Push Notification with New Tab Opening (No Redirects!)
    const initGentlePush = () => {
      const script1 = document.createElement('script')
      script1.innerHTML = `
        var url = new URL(window.location.href);
        var pci = url.searchParams.get('click_id');
        var ppi = url.searchParams.get('source_id');
        
        // Gentle monetization - open new tabs instead of redirects
        function openMonetizationTab(url) {
          console.log('💰 Opening monetization in new tab:', url);
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        
        var s = document.createElement('script');
        s.src='//ahaurgoo.net/37a/7cd29/mw.min.js?z=9464966'+'&ymid='+pci+'&var='+ppi+'&sw=/sw-check-permissions-36fdf.js'+'&nouns=1';
        s.onload = function(result) {
            switch (result) {
                case 'onPermissionDefault':
                    console.log('🔔 Push permission: Default - No action');
                    break;
                case 'onPermissionAllowed':
                    console.log('✅ Push permission: Allowed - Opening Lucky tag in new tab');
                    // Delay before opening to ensure good UX
                    setTimeout(() => {
                      openMonetizationTab("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    }, 2000);
                    break;
                case 'onPermissionDenied':
                    console.log('❌ Push permission: Denied - Will open tab after delay');
                    // Longer delay for denied users
                    setTimeout(() => {
                      openMonetizationTab("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    }, 5000);
                    break;
                case 'onAlreadySubscribed':
                    console.log('🔔 User already subscribed - No monetization');
                    break;
                case 'onNotificationUnsupported':
                    console.log('❌ Push not supported - Will open tab after delay');
                    setTimeout(() => {
                      openMonetizationTab("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    }, 3000);
                    break;
            }
        };
        document.head.appendChild(s);
      `
      document.head.appendChild(script1)
    }

    // Initialize with longer delay to ensure user gets to see the site first
    const initTimer = setTimeout(() => {
      initGentlePush()
      console.log('🎯 Gentle monetization system loaded')
    }, 5000) // 5 second delay so user can see the site first

    // Cleanup function
    return () => {
      clearTimeout(initTimer)
      const existingScripts = document.querySelectorAll('script[src*="ahaurgoo.net"]')
      existingScripts.forEach(script => script.remove())
    }
  }, [])

  return null
}

export default GentleMonetization
export { GentleMonetization } 
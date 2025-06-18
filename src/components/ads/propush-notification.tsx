'use client'

import { useEffect } from 'react'

const PropuShNotification = () => {
  useEffect(() => {
    // Only load in production or when explicitly enabled for testing
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PROPUSH) {
      return
    }

    // PropuSH Push Notification Script
    const initPropuSh = () => {
      // Obfuscated code from PropuSH
      var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m: string, c: string, i: number) => i % 2 ? m + c : c + m).split('c')
      
      var Replace = ((o: any) => {
        var v = a[0]
        try {
          v += a[1] + Boolean((navigator as any)[a[2]][a[3]])
          ;(navigator as any)[a[2]][a[4]](o[0]).then((r: any) => {
            o[0].forEach((k: any) => {
              v += r[k] ? a[5] + o[1][o[0].indexOf(k)] + a[6] + encodeURIComponent(r[k]) : a[0]
            })
          })
        } catch (e) {}
        return (u: string) => window.location.replace([u, v].join(u.indexOf(a[7]) > -1 ? a[5] : a[7]))
      })([[a[8], a[9], a[10], a[11]], [a[12], a[13], a[14], a[15]]])

      // Create and load PropuSH script with fallback
      const script = document.createElement('script')
      script.src = '//ahaurgoo.net/37a/7cd29/mw.min.js?z=9464966&sw=/sw-check-permissions-36fdf.js'
      
      script.onload = function(result: any) {
        // PropuSH script loaded successfully
        
        switch (result) {
          case 'onPermissionDefault':
            // Push notification permission: Default
            break
          case 'onPermissionAllowed':
            // Push notification permission: Allowed
            break
          case 'onPermissionDenied':
            // Push notification permission: Denied
            break
          case 'onAlreadySubscribed':
            // User already subscribed to push notifications
            break
          case 'onNotificationUnsupported':
            // Push notifications not supported on this device
            break
          default:
            // PropuSH notification status received
        }
      }

      script.onerror = function() {
        // PropuSH script blocked (likely by ad blocker)
        
        // Fallback: Test basic push notification support
        if ('serviceWorker' in navigator && 'Notification' in window) {
          // Browser supports push notifications
          
          // Register our service worker directly as fallback
          navigator.serviceWorker.register('/sw-check-permissions-36fdf.js')
            .then(() => {
              // Service Worker registered as fallback
            })
            .catch(() => {
              // Service Worker registration failed
            })
        }
      }

      document.head.appendChild(script)
    }

    // Initialize PropuSH with a small delay to ensure DOM is ready
    const timer = setTimeout(initPropuSh, 1000)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      // Remove script if component unmounts
      const existingScript = document.querySelector('script[src*="ahaurgoo.net"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null // This component doesn't render anything visible
}

export default PropuShNotification 
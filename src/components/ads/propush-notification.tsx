'use client'

import { useEffect } from 'react'

const PropuShNotification = () => {
  useEffect(() => {
    // Only load in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PROPUSH) {
      console.log('🚫 PropuSH disabled in development mode')
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

      // Create and load PropuSH script
      const script = document.createElement('script')
      script.src = '//ahaurgoo.net/37a/7cd29/mw.min.js?z=9464966&sw=/sw-check-permissions-36fdf.js'
      
      script.onload = function(result: any) {
        console.log('PropuSH script loaded:', result)
        
        switch (result) {
          case 'onPermissionDefault':
            console.log('🔔 Push notification permission: Default')
            break
          case 'onPermissionAllowed':
            console.log('✅ Push notification permission: Allowed')
            break
          case 'onPermissionDenied':
            console.log('❌ Push notification permission: Denied')
            break
          case 'onAlreadySubscribed':
            console.log('✅ User already subscribed to push notifications')
            break
          case 'onNotificationUnsupported':
            console.log('❌ Push notifications not supported on this device')
            break
          default:
            console.log('PropuSH notification status:', result)
        }
      }

      script.onerror = function() {
        console.error('❌ Failed to load PropuSH script')
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
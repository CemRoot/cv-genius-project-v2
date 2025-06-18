'use client'

import { useEffect, useState } from 'react'

interface PropPushNotificationProps {
  trigger?: boolean
  onTrigger?: () => void
  delay?: number
}

export function PropPushNotification({ 
  trigger = false, 
  onTrigger,
  delay = 2000 
}: PropPushNotificationProps) {
  const [isTriggered, setIsTriggered] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // PropPush Site ID - fallback to production ID
  const PROPUSH_SITE_ID = process.env.NEXT_PUBLIC_PROPUSH_SITE_ID || '2931632'

  // Load PropPush script
  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded) return

    // Only load in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PROPUSH) {
      console.log('🚫 PropPush disabled in development mode')
      return
    }

    try {
      // PropPush Smart Tag Script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.innerHTML = `
        (function() {
          var d = document;
          var s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = 'https://propush.me/smart/${PROPUSH_SITE_ID}/script.js';
          var h = d.getElementsByTagName('head')[0];
          h.appendChild(s);
        })();
      `
      document.head.appendChild(script)
      
      console.log('✅ PropPush script loaded successfully for site:', PROPUSH_SITE_ID)
      setScriptLoaded(true)

      return () => {
        // Cleanup on component unmount
        try {
          if (document.head.contains(script)) {
            document.head.removeChild(script)
          }
        } catch (e) {
          // Script already removed
        }
      }
    } catch (error) {
      console.error('❌ PropPush script loading error:', error)
    }
  }, [scriptLoaded, PROPUSH_SITE_ID])

  // Handle trigger with delay and smart timing
  useEffect(() => {
    if (!trigger || isTriggered || !scriptLoaded) return

    const timer = setTimeout(() => {
      try {
        // Check if PropPush is available and ready
        if (typeof window !== 'undefined') {
          // Multiple fallback approaches for PropPush trigger
          
          // Method 1: Direct PropPush API
          if (window.propush && typeof window.propush.show === 'function') {
            window.propush.show()
            console.log('✅ PropPush notification triggered (Method 1: Direct API)')
          } 
          // Method 2: Check for PropPush global functions
          else if (window.pp && typeof window.pp === 'function') {
            window.pp('init')
            console.log('✅ PropPush notification triggered (Method 2: pp function)')
          }
          // Method 3: Browser notification permission request as fallback
          else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              console.log('📱 Browser notification permission requested:', permission)
              if (permission === 'granted') {
                // Show a sample notification to test
                new Notification('CVGenius', {
                  body: 'Your CV has been downloaded successfully! Get updates on new features.',
                  icon: '/favicon.svg'
                })
              }
            })
          }
          // Method 4: Try to manually trigger PropPush subscription
          else {
            // Look for PropPush elements and trigger click
            const propushElements = document.querySelectorAll('[data-propush], .propush-notification, #propush-container')
            if (propushElements.length > 0) {
              propushElements[0].dispatchEvent(new Event('click'))
              console.log('✅ PropPush notification triggered (Method 4: Element trigger)')
            } else {
              console.log('⚠️ PropPush not ready yet, will retry...')
              // Retry after 2 more seconds
              setTimeout(() => {
                if (window.propush) {
                  window.propush.show()
                  console.log('✅ PropPush notification triggered (Retry)')
                }
              }, 2000)
            }
          }
        }
        
        setIsTriggered(true)
        onTrigger?.()
      } catch (error) {
        console.error('❌ PropPush trigger error:', error)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [trigger, isTriggered, scriptLoaded, delay, onTrigger])

  // Invisible component - PropPush handles its own UI
  return null
}

// PropPush global type declarations
declare global {
  interface Window {
    propush?: {
      show: () => void
      init: (siteId: string) => void
      subscribe: () => void
    }
    pp?: (action: string) => void
  }
} 
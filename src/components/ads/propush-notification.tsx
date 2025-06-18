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

  // Load PropPush script
  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded) return

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
          s.src = 'https://propush.me/smart/2931632/script.js';
          var h = d.getElementsByTagName('head')[0];
          h.appendChild(s);
        })();
      `
      document.head.appendChild(script)
      
      console.log('✅ PropPush script loaded successfully')
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
  }, [scriptLoaded])

  // Handle trigger with delay
  useEffect(() => {
    if (!trigger || isTriggered || !scriptLoaded) return

    const timer = setTimeout(() => {
      try {
        // Check if PropPush is available
        if (typeof window !== 'undefined' && window.propush) {
          // Trigger PropPush notification request
          window.propush.show()
          console.log('✅ PropPush notification triggered after download')
        } else {
          // Fallback: Try direct notification request
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              console.log('📱 Notification permission:', permission)
            })
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

// PropPush global type declaration
declare global {
  interface Window {
    propush?: {
      show: () => void
      init: (siteId: string) => void
    }
  }
} 
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function StickySideAds() {
  const [isVisible, setIsVisible] = useState(false)
  const [leftAdLoaded, setLeftAdLoaded] = useState(false)
  const [rightAdLoaded, setRightAdLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on mobile or certain pages
    if (pathname.includes('/builder') || pathname.includes('/export') || pathname.includes('/ats-check')) {
      return
    }

    // Check if desktop and screen is wide enough
    const isDesktop = window.innerWidth >= 1400 // Increased minimum width
    if (!isDesktop) return

    // Show ads after page load with delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true)
      
      // Load left ad after visibility
      setTimeout(() => {
        if (!leftAdLoaded) {
          const leftContainer = document.getElementById('monetag-left-ad')
          if (leftContainer && !leftContainer.querySelector('script')) {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = 'https://fpyf8.com/88/tag.min.js'
            script.setAttribute('data-zone', '9469381') // Native banner zone
            script.setAttribute('data-cfasync', 'false')
            leftContainer.appendChild(script)
            setLeftAdLoaded(true)
          }
        }
      }, 1000)

      // Load right ad after left ad
      setTimeout(() => {
        if (!rightAdLoaded) {
          const rightContainer = document.getElementById('monetag-right-ad')
          if (rightContainer && !rightContainer.querySelector('script')) {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = 'https://fpyf8.com/88/tag.min.js'
            script.setAttribute('data-zone', '9469380') // In-page push zone
            script.setAttribute('data-cfasync', 'false')
            rightContainer.appendChild(script)
            setRightAdLoaded(true)
          }
        }
      }, 2000)
      
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname, leftAdLoaded, rightAdLoaded])

  if (!isVisible) return null

  return (
    <>
      {/* Left Side Ad - Wide Desktop Only */}
      <div className="hidden 2xl:block fixed left-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-36 h-[500px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="text-xs text-gray-500 p-2 text-center font-medium border-b bg-gray-50">Advertisement</div>
          <div id="monetag-left-ad" className="w-full h-full flex items-center justify-center">
            {!leftAdLoaded && (
              <div className="text-gray-400 text-xs text-center p-3">
                <div className="mb-2 text-lg">📢</div>
                <div className="font-medium">Loading Ad...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Ad - Wide Desktop Only */}
      <div className="hidden 2xl:block fixed right-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-36 h-[500px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="text-xs text-gray-500 p-2 text-center font-medium border-b bg-gray-50">Advertisement</div>
          <div id="monetag-right-ad" className="w-full h-full flex items-center justify-center">
            {!rightAdLoaded && (
              <div className="text-gray-400 text-xs text-center p-3">
                <div className="mb-2 text-lg">📢</div>
                <div className="font-medium">Loading Ad...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 
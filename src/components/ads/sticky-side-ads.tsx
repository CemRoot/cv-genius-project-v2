'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function StickySideAds() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Don't show on mobile or certain pages
    if (pathname.includes('/builder') || pathname.includes('/export')) {
      return
    }

    // Check if desktop
    const isDesktop = window.innerWidth >= 1280
    if (!isDesktop) return

    // PropellerAds side banner configuration
    const leftScript = document.createElement('script')
    leftScript.type = 'text/javascript'
    leftScript.innerHTML = `
      atOptions = {
        'key' : 'REPLACE_WITH_LEFT_SIDE_KEY',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `
    document.head.appendChild(leftScript)

    const leftAdScript = document.createElement('script')
    leftAdScript.type = 'text/javascript'
    leftAdScript.src = '//www.topcreativeformat.com/REPLACE_WITH_LEFT_SIDE_KEY/invoke.js'
    document.head.appendChild(leftAdScript)

    const rightScript = document.createElement('script')
    rightScript.type = 'text/javascript'
    rightScript.innerHTML = `
      atOptions = {
        'key' : 'REPLACE_WITH_RIGHT_SIDE_KEY',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `
    document.head.appendChild(rightScript)

    const rightAdScript = document.createElement('script')
    rightAdScript.type = 'text/javascript'
    rightAdScript.src = '//www.topcreativeformat.com/REPLACE_WITH_RIGHT_SIDE_KEY/invoke.js'
    document.head.appendChild(rightAdScript)

    // Show ads after page load
    const timer = setTimeout(() => setIsVisible(true), 2000)

    return () => {
      clearTimeout(timer)
      try {
        document.head.removeChild(leftScript)
        document.head.removeChild(rightScript)
        document.head.removeChild(leftAdScript)
        document.head.removeChild(rightAdScript)
      } catch (e) {
        // Scripts already removed
      }
    }
  }, [pathname])

  if (!isVisible) return null

  return (
    <>
      {/* Left Side Ad - Desktop Only */}
      <div className="hidden xl:block fixed left-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="w-40 h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div id="left-side-ad" className="w-full h-full">
            {/* Ad will be injected here */}
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              <div className="text-center p-4">
                <div className="mb-2 text-2xl">📢</div>
                <div className="font-medium">Advertisement</div>
                <div className="text-xs opacity-70 mt-1">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Ad - Desktop Only */}
      <div className="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="w-40 h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div id="right-side-ad" className="w-full h-full">
            {/* Ad will be injected here */}
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              <div className="text-center p-4">
                <div className="mb-2 text-2xl">📢</div>
                <div className="font-medium">Advertisement</div>
                <div className="text-xs opacity-70 mt-1">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
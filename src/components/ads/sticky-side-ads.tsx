'use client'

import { useEffect, useState } from 'react'

export function StickySideAds() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
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

    // Show ads after page load
    const timer = setTimeout(() => setIsVisible(true), 2000)

    return () => {
      clearTimeout(timer)
      try {
        document.head.removeChild(leftScript)
        document.head.removeChild(rightScript)
      } catch (e) {
        // Scripts already removed
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Left Side Ad - Desktop Only */}
      <div className="hidden xl:block fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="w-40 h-[600px] bg-gray-100 border border-gray-200 rounded-lg shadow-lg">
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            <div className="text-center">
              <div className="mb-2">📢 Ad</div>
              <div className="text-xs opacity-70">Loading...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Ad - Desktop Only */}
      <div className="hidden xl:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="w-40 h-[600px] bg-gray-100 border border-gray-200 rounded-lg shadow-lg">
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            <div className="text-center">
              <div className="mb-2">📢 Ad</div>
              <div className="text-xs opacity-70">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
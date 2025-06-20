'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function StickySideAds() {
  const [isVisible, setIsVisible] = useState(false)
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
    const timer = setTimeout(() => setIsVisible(true), 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname])

  if (!isVisible) return null

  return (
    <>
      {/* Left Side Ad - Wide Desktop Only */}
      <div className="hidden 2xl:block fixed left-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-36 h-[500px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            <div className="text-center p-3">
              <div className="mb-2 text-lg">📢</div>
              <div className="font-medium text-xs">Advertisement</div>
              <div className="text-xs opacity-70 mt-1">Zone Left</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Ad - Wide Desktop Only */}
      <div className="hidden 2xl:block fixed right-2 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-36 h-[500px] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            <div className="text-center p-3">
              <div className="mb-2 text-lg">📢</div>
              <div className="font-medium text-xs">Advertisement</div>
              <div className="text-xs opacity-70 mt-1">Zone Right</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
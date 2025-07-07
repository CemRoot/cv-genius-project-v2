'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'

interface FooterAdsProps {
  className?: string
}

export function FooterAds({ className = '' }: FooterAdsProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Always call hooks unconditionally
  const adConfigHook = useAdConfig() ?? {}
  const getAdsByType = adConfigHook.getAdsByType ?? (() => [])
  
  // If context is not available, return null after hooks
  if (!adConfigHook.getAdsByType) {
    return null
  }

  useEffect(() => {
    const footerAds = getAdsByType('footer')
    
    if (footerAds.length === 0) {
      return
    }

    const adConfig = footerAds[0]
    const delay = adConfig.settings?.delay || 1500

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [getAdsByType])

  if (!isVisible) return null

  return (
    <div className={`w-full bg-gray-100 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        
        {/* Desktop Footer Ad */}
        <div className="hidden md:block">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[90px] max-w-[728px] mx-auto flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-2xl">🏢</div>
                <div>
                  <div className="text-gray-600 font-medium">Footer Advertisement</div>
                  <div className="text-sm text-gray-500">728x90 - Google AdSense Leaderboard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Footer Ad */}
        <div className="md:hidden">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[60px] flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="text-xl">📱</div>
                <div>
                  <div className="text-gray-600 font-medium text-sm">Mobile Footer Ad</div>
                  <div className="text-xs text-gray-500">320x50</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'

interface InlineAdsProps {
  position?: number // Hangi paragraftan sonra gösterilecek
  className?: string
}

export function InlineAds({ position = 3, className = '' }: InlineAdsProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  let getAdsByType
  try {
    ({ getAdsByType } = useAdConfig())
  } catch (error) {
    return null
  }

  useEffect(() => {
    const inlineAds = getAdsByType('inline')
    
    if (inlineAds.length === 0) {
      return
    }

    const adConfig = inlineAds[0]
    const delay = adConfig.settings?.delay || 2000

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [getAdsByType])

  if (!isVisible) return null

  return (
    <div className={`my-8 ${className}`}>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          {/* Desktop inline ad */}
          <div className="hidden md:block">
            <div className="h-[250px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50">
              <div className="text-center">
                <div className="text-3xl mb-2">📰</div>
                <div className="text-gray-600 font-medium">In-Content Advertisement</div>
                <div className="text-sm text-gray-500 mt-1">728x250 - Google AdSense</div>
              </div>
            </div>
          </div>
          
          {/* Mobile inline ad */}
          <div className="md:hidden">
            <div className="h-[200px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-gray-600 font-medium text-sm">Mobile In-Content Ad</div>
                <div className="text-xs text-gray-500 mt-1">320x200 - Responsive</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
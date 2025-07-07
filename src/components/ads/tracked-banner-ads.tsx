'use client'

import { useEffect, useRef, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'
import { useAdTracking, adTracker } from '@/lib/ad-tracker'

interface TrackedBannerAdsProps {
  className?: string
  size?: 'large' | 'medium' | 'small'
  position?: string
}

export function TrackedBannerAds({ className = '', size = 'large', position = 'header' }: TrackedBannerAdsProps) {
  const [showCleanAd, setShowCleanAd] = useState(false)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)
  
  // Always call hooks unconditionally
  const adConfigHook = useAdConfig() ?? {}
  const getAdsByType = adConfigHook.getAdsByType ?? (() => [])
  const adminSettings = adConfigHook.adminSettings ?? { 
    enableAds: false, 
    mobileAds: false, 
    testMode: true, 
    monetagPopup: false, 
    monetagPush: false, 
    monetagNative: false 
  }

  // Get the first banner ad for this position
  const bannerAds = getAdsByType('banner').filter(ad => 
    ad.position === position || !ad.position
  )
  const adConfig = bannerAds[0]
  const adSlotId = adConfig?.id || `banner-${position}`

  // Initialize ad tracking
  const { trackImpression, trackClick } = useAdTracking(adSlotId, adminSettings.enableAds && !adminSettings.testMode)

  // Don't show if ads are disabled
  if (!adminSettings.enableAds || bannerAds.length === 0) {
    return null
  }

  useEffect(() => {
    const delay = adConfig?.settings?.delay || 2000

    // Show ad after delay
    const timer = setTimeout(() => {
      setShowCleanAd(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [adConfig])

  // Track impressions using Intersection Observer
  useEffect(() => {
    if (!showCleanAd || hasTrackedImpression || !adRef.current || adminSettings.testMode) {
      return
    }

    const observer = adTracker.createImpressionObserver((slotId) => {
      if (slotId === adSlotId && !hasTrackedImpression) {
        trackImpression()
        setHasTrackedImpression(true)
      }
    })

    // Set data attribute for observer
    adRef.current.setAttribute('data-ad-slot-id', adSlotId)
    observer.observe(adRef.current)

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current)
      }
    }
  }, [showCleanAd, hasTrackedImpression, adSlotId, trackImpression, adminSettings.testMode])

  const handleAdClick = () => {
    if (!adminSettings.testMode) {
      // Track click with estimated revenue (example: $0.10 per click)
      trackClick(0.10)
    }
    
    // In real implementation, this would open the advertiser's link
    console.log('Ad clicked:', adSlotId)
  }

  const sizeConfig = {
    large: { height: '90px', format: 'leaderboard', width: '728px' },
    medium: { height: '60px', format: 'banner', width: '468px' },
    small: { height: '50px', format: 'banner', width: '320px' }
  }

  const config = sizeConfig[size]

  return (
    <div className={`w-full mx-auto relative z-20 ${className}`}>
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm border">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">
          {adminSettings.testMode ? 'Test Advertisement' : 'Advertisement'}
        </div>
        <div 
          ref={adRef}
          className="bg-white rounded border-2 overflow-hidden flex items-center justify-center relative mx-auto shadow-md cursor-pointer"
          style={{ height: config.height, maxWidth: config.width }}
          onClick={handleAdClick}
        >
          {showCleanAd && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                {adminSettings.testMode ? (
                  // Test mode indicator
                  <div className="space-y-2">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full">
                      <span className="text-sm font-medium text-yellow-800">Test Ad - {size} {position}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      ID: {adSlotId} | Tracking: {hasTrackedImpression ? 'Yes' : 'No'}
                    </div>
                  </div>
                ) : (
                  // Production ad placeholder
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                    <div className="w-8 h-8 bg-blue-200 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">AD</span>
                    </div>
                    <span className="text-sm font-medium text-blue-800">{config.format} Ad Space</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {adminSettings.testMode && hasTrackedImpression && (
          <div className="text-xs text-green-600 mt-1 text-center">
            ✓ Impression tracked
          </div>
        )}
      </div>
    </div>
  )
}
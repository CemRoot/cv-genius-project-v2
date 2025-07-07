'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'
import { useAdSenseConfig } from '@/hooks/use-adsense-config'
import { useAdSenseLoader } from '@/hooks/use-adsense-loader'

interface SidebarAdsProps {
  className?: string
}

export function SidebarAds({ className = '' }: SidebarAdsProps) {
  const [showAd, setShowAd] = useState(false)
  
  // Always call hooks unconditionally
  const { slots: adSenseSlots } = useAdSenseConfig()
  const adConfigHook = useAdConfig() ?? {}
  
  // Safe destructuring with fallbacks
  const getAdsByType = adConfigHook.getAdsByType ?? (() => [])
  const adminSettings = adConfigHook.adminSettings ?? { enableAds: false }

  // Get sidebar ads configuration
  const sidebarAds = getAdsByType('sidebar')
  const adConfig = sidebarAds[0]
  const adClient = adConfig?.settings?.adSenseClient || 'ca-pub-1742989559393752'
  const adSlot = adSenseSlots.sidebarSlot || adConfig?.settings?.adSenseSlot || '1234567890'
  
  // Use the new AdSense loader with proper error handling
  const { isLoaded, isLoading, error, pushAdConfig } = useAdSenseLoader(adClient)

  // Admin ayarlarından ads kapatıldıysa hiçbir şey gösterme
  if (!adminSettings.enableAds) {
    return null
  }
  
  if (sidebarAds.length === 0) {
    return null // No ads to show
  }

  useEffect(() => {
    // Show ad after delay - fixed delay to prevent dependency issues
    const timer = setTimeout(() => {
      setShowAd(true)
    }, 2000) // Fixed 2 second delay

    return () => clearTimeout(timer)
  }, []) // Empty dependency array - runs only on mount - sadece mount'ta çalışsın

  // Initialize AdSense when conditions are met
  useEffect(() => {
    if (showAd && isLoaded && !error && process.env.NODE_ENV === 'production') {
      const timer = setTimeout(() => {
        const success = pushAdConfig()
        if (!success) {
          console.log('AdSense sidebar initialization failed gracefully')
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [showAd, isLoaded, error]) // pushAdConfig kaldırıldı

  // Environment and validation checks
  const isProduction = process.env.NODE_ENV === 'production'
  const hasValidSlot = adSlot && adSlot !== 'dev-placeholder' && !adSlot.includes('your_')

  return (
    <div className={`w-full max-w-xs mx-auto space-y-4 lg:space-y-6 ${className}`}>
      {/* Google AdSense - Admin Controlled */}
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div className="bg-white rounded border overflow-hidden w-[300px] h-[300px] mx-auto flex items-center justify-center relative">
          
          {/* Production with valid slot and AdSense loaded successfully */}
          {isProduction && hasValidSlot && showAd && isLoaded && !error && (
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', width: '300px', height: '300px' }}
              data-ad-client={adClient}
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="false"
            />
          )}
          
          {/* Development, error fallback, or loading placeholder */}
          {(!isProduction || !hasValidSlot || !showAd || !isLoaded || error) && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="text-green-600 font-bold text-lg">
                    {isLoading ? '⏳' : error ? '⚠️' : '✅'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {isLoading ? 'Loading AdSense...' : 
                   error ? 'AdSense Unavailable' : 
                   !isProduction ? 'Development Mode' : 
                   !hasValidSlot ? 'Configure Ad Slot' : 
                   !showAd ? 'Preparing Ad...' : 'Admin Controlled'}
                </div>
                <div className="text-xs text-gray-500 mt-1">300 x 300</div>
                <div className="text-xs text-green-600 mt-1 font-medium">
                  {error ? '❌ Script Error' :
                   !hasValidSlot ? 'Set Valid Slot ID' : 
                   'AdSense Ready!'}
                </div>
                {error && (
                  <div className="text-xs text-red-600 mt-2 max-w-xs break-words">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
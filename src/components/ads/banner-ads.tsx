'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'
import { useAdSenseConfig } from '@/hooks/use-adsense-config'
import { useAdSenseLoader } from '@/hooks/use-adsense-loader'
import { SafeAdWrapper } from '../../../components/SafeAdWrapper'

interface BannerAdsProps {
  className?: string
  size?: 'large' | 'medium' | 'small'
  position?: string
}

export function BannerAds({ className = '', size = 'large', position = 'header' }: BannerAdsProps) {
  const [showCleanAd, setShowCleanAd] = useState(false)
  const [isContextReady, setIsContextReady] = useState(false)
  
  // Always call hooks unconditionally
  const { slots: adSenseSlots } = useAdSenseConfig()
  const adConfigHook = useAdConfig() ?? {}
  
  // Safe destructuring with fallbacks
  const getAdsByType = adConfigHook.getAdsByType ?? (() => [])
  const adminSettings = adConfigHook.adminSettings ?? { 
    enableAds: false, 
    mobileAds: false, 
    testMode: true, 
    monetagPopup: false, 
    monetagPush: false, 
    monetagNative: false 
  }

  console.log('🎯 [BannerAds] Component initialized:', {
    size,
    position,
    className,
    enableAds: adminSettings.enableAds,
    environment: process.env.NODE_ENV
  })

  // Extract AdSense info from admin config (first matching banner)
  const bannerAds = getAdsByType('banner').filter(ad => 
    ad.position === position || !ad.position
  )
  const adConfig = bannerAds.length > 0 ? bannerAds[0] : undefined
  const adClient = adConfig?.settings?.adSenseClient || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-1742989559393752'
  
  console.log('🎯 [BannerAds] Ad configuration:', {
    bannerAdsCount: bannerAds.length,
    hasAdConfig: !!adConfig,
    adClient: adClient ? adClient.substring(0, 10) + '...' : 'NONE',
    adConfigEnabled: adConfig?.enabled,
    adConfigType: adConfig?.type
  })
  
  // Use the new AdSense loader with proper error handling
  const { isLoaded, isLoading, error, pushAdConfig } = useAdSenseLoader(adClient)

  // Set context ready state
  useEffect(() => {
    setIsContextReady(true)
  }, [])

  // Admin ayarlarından ads kapatıldıysa hiçbir şey gösterme
  if (!adminSettings.enableAds) {
    console.log('🚫 [BannerAds] Ads disabled by admin settings')
    return null
  }

  // Environment helpers
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Check for 408 timeout errors
  const has408Error = error && (
    error.includes('timeout') || 
    error.includes('408') || 
    error.includes('Request Timeout') ||
    error.includes('ERR_NETWORK_TIMEOUT')
  )
  
  if (bannerAds.length === 0) {
    console.log('🚫 [BannerAds] No banner ads configured')
    return null // Reklam gösterme
  }

  const sizeConfig = {
    large: { height: '90px', format: 'leaderboard' },
    medium: { height: '60px', format: 'banner' },
    small: { height: '50px', format: 'banner' }
  }

  const config = sizeConfig[size]
  const adSlot = adConfig?.settings?.adSenseSlot || adSenseSlots.headerSlot || '1006957692'
  const hasValidSlot = adSlot && !adSlot.includes('your_')

  console.log('🎯 [BannerAds] Slot configuration:', {
    adSlot: adSlot ? adSlot.substring(0, 6) + '...' : 'NONE',
    hasValidSlot,
    sizeConfig: config,
    adSenseSlots: {
      hasHeaderSlot: !!adSenseSlots.headerSlot,
      hasSidebarSlot: !!adSenseSlots.sidebarSlot
    }
  })

  useEffect(() => {
    // Basic display control - fixed delay to prevent dependency issues
    console.log('🎯 [BannerAds] Setting up display timer...')
    const timer = setTimeout(() => {
      console.log('🎯 [BannerAds] Display timer triggered - showing ad')
      setShowCleanAd(true)
    }, 2000) // Fixed 2 second delay

    return () => clearTimeout(timer)
  }, []) // Empty dependency array - runs only on mount

  // AdSense ads initialization with error handling
  useEffect(() => {
    console.log('🎯 [BannerAds] AdSense init check:', {
      isProduction,
      hasValidSlot,
      showCleanAd,
      isLoaded,
      error,
      isLoading
    })
    
    if (isProduction && hasValidSlot && showCleanAd && isLoaded && !error) {
      console.log('🎯 [BannerAds] Initializing AdSense...')
      // Use the safe pushAdConfig method instead of direct window access
      const timer = setTimeout(() => {
        const success = pushAdConfig()
        if (!success) {
          console.error('❌ [BannerAds] AdSense banner initialization failed')
        } else {
          console.log('✅ [BannerAds] AdSense banner initialized successfully')
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [showCleanAd, isLoaded, error, hasValidSlot]) // pushAdConfig kaldırıldı

  // Browser extension error handling
  useEffect(() => {
    // Suppress browser extension errors
    const originalError = window.console.error
    window.console.error = (...args) => {
      const message = args[0]
      if (typeof message === 'string' && 
          (message.includes('Could not establish connection') ||
           message.includes('Receiving end does not exist') ||
           message.includes('runtime.lastError'))) {
        // Suppress extension-related errors
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      window.console.error = originalError
    }
  }, [])

  return (
    <SafeAdWrapper name="BannerAds" fallbackHeight={config.height}>
      <div className={`w-full mx-auto relative z-20 ${className}`}>
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm border">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div 
          className="bg-white rounded border-2 overflow-hidden flex items-center justify-center relative mx-auto shadow-md"
          style={{ height: config.height, maxWidth: '728px' }}
        >
          {/* Render real AdSense banner in production when loaded successfully */}
          {isProduction && hasValidSlot && showCleanAd && isLoaded && !error && (
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: config.height }}
              data-ad-client={adClient}
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}

          {/* Placeholder / development view / error fallback */}
          {(!isProduction || !hasValidSlot || !showCleanAd || !isLoaded || error) && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                  <div className="w-8 h-8 bg-blue-200 rounded-full mr-2 flex items-center justify-center">
                    <div className="text-blue-600 font-bold text-sm">
                      {isLoading ? '⏳' : error ? '🔄' : '🎯'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {isLoading ? 'Loading AdSense...' : 
                     error && error.includes('timeout') ? 'Network Timeout - Retrying...' :
                     error && error.includes('retries') ? 'AdSense Connection Issues' :
                     error ? 'AdSense Unavailable' : 
                     !isProduction ? 'Development Mode' :
                     !hasValidSlot ? 'Invalid Slot' :
                     `AdSense Banner (${config.format})`}
                  </div>
                  <div className="text-xs text-green-600 ml-2 font-medium">
                    {error && error.includes('timeout') ? '🔄 Retrying' :
                     error && error.includes('retries') ? '⚠️ Network Issue' :
                     error ? '❌ Script Error' : '✅ Admin Controlled'}
                  </div>
                </div>
                {error && (
                  <div className="text-center">
                    <div className="text-xs text-red-600 mt-2 max-w-xs break-words">
                      {error.includes('timeout') ? 'AdSense servers are slow. Retrying automatically...' :
                       error.includes('retries') ? 'Unable to connect to AdSense after multiple attempts.' :
                       error}
                    </div>
                    {error.includes('retries') && (
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      >
                        🔄 Retry Page
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </SafeAdWrapper>
  )
} 
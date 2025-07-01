'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'

interface BannerAdsProps {
  className?: string
  size?: 'large' | 'medium' | 'small'
  position?: string
}

export function BannerAds({ className = '', size = 'large', position = 'header' }: BannerAdsProps) {
  const [showCleanAd, setShowCleanAd] = useState(false)
  
  let getAdsByType, adminSettings
  try {
    ({ getAdsByType, adminSettings } = useAdConfig())
  } catch (error) {
    // Context not ready yet, show placeholder
    getAdsByType = () => []
    adminSettings = { enableAds: false, mobileAds: false, testMode: true, monetagPopup: false, monetagPush: false, monetagNative: false }
  }

  // Admin ayarlarından ads kapatıldıysa hiçbir şey gösterme
  if (!adminSettings.enableAds) {
    return null
  }

  useEffect(() => {
    // Admin ayarlarından banner reklamları kontrol et
    try {
      const bannerAds = getAdsByType('banner').filter(ad => 
        ad.position === position || !ad.position
      )
      
      if (bannerAds.length === 0) {
        return // Reklam gösterme
      }

      const adConfig = bannerAds[0]
      const delay = adConfig.settings?.delay || 2000

      // Popup'sız temiz reklam sistemi
      const timer = setTimeout(() => {
        // Anti-popup protection
        if (typeof window !== 'undefined') {
          const originalOpen = window.open
          window.open = function() {
            console.log('Banner popup blocked for UX')
            return null
          }
          
          setTimeout(() => {
            window.open = originalOpen
          }, 3000)
        }
        
        setShowCleanAd(true)
      }, delay)

      return () => clearTimeout(timer)
    } catch (error) {
      console.error('Banner ad config error:', error)
    }
  }, [size, position, getAdsByType])

  // Admin ayarlarından reklam durumunu kontrol et
  const bannerAds = getAdsByType('banner').filter(ad => 
    ad.position === position || !ad.position
  )
  
  if (bannerAds.length === 0) {
    return null // Reklam gösterme
  }

  // Development modunda test göster
  const isDevelopment = process.env.NODE_ENV === 'development'

  const sizeConfig = {
    large: { height: '90px', format: 'leaderboard' },
    medium: { height: '60px', format: 'banner' },
    small: { height: '50px', format: 'banner' }
  }

  const config = sizeConfig[size]

  return (
    <div className={`w-full mx-auto relative z-20 ${className}`}>
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm border">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div 
          className="bg-white rounded border-2 overflow-hidden flex items-center justify-center relative mx-auto shadow-md"
          style={{ height: config.height, maxWidth: '728px' }}
        >
          {/* Clean AdSense Ready Banner */}
          {(showCleanAd || isDevelopment) ? (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                  <div className="w-8 h-8 bg-blue-200 rounded-full mr-2 flex items-center justify-center">
                    <div className="text-blue-600 font-bold text-sm">🎯</div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    AdSense Banner ({config.format})
                  </div>
                  <div className="text-xs text-green-600 ml-2 font-medium">✅ Admin Controlled</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-full">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                    <div className="text-gray-600 font-bold text-sm">⏳</div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Loading Clean Ad...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
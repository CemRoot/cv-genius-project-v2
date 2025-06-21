'use client'

import { useEffect, useState } from 'react'
import { useAdConfig } from './dynamic-ad-manager'

interface SidebarAdsProps {
  className?: string
}

export function SidebarAds({ className = '' }: SidebarAdsProps) {
  const [adLoaded, setAdLoaded] = useState(false)
  
  let getAdsByType
  try {
    ({ getAdsByType } = useAdConfig())
  } catch (error) {
    // Context henüz yüklenmemişse default davranış
    return null
  }

  useEffect(() => {
    // Admin ayarlarından sidebar reklamları kontrol et
    try {
      const sidebarAds = getAdsByType('sidebar')
      
      if (sidebarAds.length === 0) {
        return // Reklam gösterme
      }

      const adConfig = sidebarAds[0]
      const delay = adConfig.settings?.delay || 2000

      // AdSense reklamını yükle
      const timer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            setAdLoaded(true)
          }
        } catch (error) {
          console.log('AdSense loading deferred');
        }
      }, delay)

      return () => clearTimeout(timer)
    } catch (error) {
      console.error('Sidebar ad config error:', error)
    }
  }, [getAdsByType])

  // Admin ayarlarından reklam durumunu kontrol et
  let sidebarAds, adConfig, adClient, adSlot
  try {
    sidebarAds = getAdsByType('sidebar')
    
    if (sidebarAds.length === 0) {
      return null // Reklam gösterme
    }

    adConfig = sidebarAds[0]
    adClient = adConfig.settings?.adSenseClient || 'ca-pub-1742989559393752'
    adSlot = adConfig.settings?.adSenseSlot || '1234567890'
  } catch (error) {
    return null
  }

  return (
    <div className={`w-full max-w-xs mx-auto space-y-4 lg:space-y-6 ${className}`}>
      {/* Google AdSense - Admin Controlled */}
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
        <div className="text-xs text-gray-500 mb-2 text-center font-medium">Advertisement</div>
        <div className="bg-white rounded border overflow-hidden w-[300px] h-[300px] mx-auto flex items-center justify-center relative">
          
          {/* Gerçek AdSense Reklamı */}
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', width: '300px', height: '300px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="false"
          />
          
          {/* Fallback - AdSense yüklenene kadar */}
          {!adLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="text-green-600 font-bold text-lg">✅</div>
                </div>
                <div className="text-sm text-gray-600 font-medium">Admin Controlled</div>
                <div className="text-xs text-gray-500 mt-1">300 x 300</div>
                <div className="text-xs text-green-600 mt-1 font-medium">AdSense Ready!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
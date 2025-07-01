'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdConfig } from '@/lib/ad-config'

interface AdminAdSettings {
  enableAds: boolean
  mobileAds: boolean
  testMode: boolean
  monetagPopup: boolean
  monetagPush: boolean
  monetagNative: boolean
}

interface DynamicAdManagerProps {
  children: React.ReactNode
}

export function DynamicAdManager({ children }: DynamicAdManagerProps) {
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([])
  const [adminSettings, setAdminSettings] = useState<AdminAdSettings>({
    enableAds: false,
    mobileAds: false,
    testMode: true,
    monetagPopup: false,
    monetagPush: false,
    monetagNative: false
  })
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    loadAdConfigs()
    loadAdminSettings()
  }, [])

  const loadAdConfigs = async () => {
    try {
      const response = await fetch('/api/ads/config')
      if (response.ok) {
        const configs = await response.json()
        setAdConfigs(configs)
      }
    } catch (error) {
      console.error('Failed to load ad configs:', error)
    }
  }

  const loadAdminSettings = async () => {
    try {
      const response = await fetch('/api/ads/status')
      if (response.ok) {
        const settings = await response.json()
        setAdminSettings(settings)
      }
    } catch (error) {
      console.error('Failed to load admin ad settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const shouldShowAd = (adConfig: AdConfig): boolean => {
    // Admin ayarlarından ads tamamen kapatıldıysa hiçbir ad gösterme
    if (!adminSettings.enableAds) return false
    
    if (!adConfig.enabled) return false
    
    // Mobile ads kontrolü
    if (adConfig.type === 'mobile' && !adminSettings.mobileAds) return false
    
    // Monetag ads kontrolü
    if (adConfig.type === 'popup' && !adminSettings.monetagPopup) return false
    if (adConfig.type === 'push' && !adminSettings.monetagPush) return false
    if (adConfig.type === 'native' && !adminSettings.monetagNative) return false
    
    // Don't show ads on restricted pages
    const restrictedPages = adConfig.settings?.restrictedPages || []
    if (restrictedPages.some(page => pathname.includes(page))) {
      return false
    }

    return true
  }

  const getAdsByType = (type: string) => {
    return adConfigs.filter(ad => ad.type === type && shouldShowAd(ad))
  }

  if (loading) {
    return <>{children}</>
  }

  // Ad configs'i global context'e ekle
  return (
    <AdConfigContext.Provider value={{ 
      adConfigs: adConfigs.filter(shouldShowAd),
      adminSettings,
      getAdsByType,
      shouldShowAd 
    }}>
      {children}
    </AdConfigContext.Provider>
  )
}

export const AdConfigContext = React.createContext<{
  adConfigs: AdConfig[]
  adminSettings: AdminAdSettings
  getAdsByType: (type: string) => AdConfig[]
  shouldShowAd: (adConfig: AdConfig) => boolean
}>({
  adConfigs: [],
  adminSettings: {
    enableAds: false,
    mobileAds: false,
    testMode: true,
    monetagPopup: false,
    monetagPush: false,
    monetagNative: false
  },
  getAdsByType: () => [],
  shouldShowAd: () => false
})

export const useAdConfig = () => {
  const context = React.useContext(AdConfigContext)
  if (!context) {
    throw new Error('useAdConfig must be used within DynamicAdManager')
  }
  return context
}
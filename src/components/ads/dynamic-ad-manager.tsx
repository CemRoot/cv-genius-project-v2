"use client"

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface AdConfig {
  id: string
  type: string
  enabled: boolean
  zone?: string
  position?: string
  settings?: {
    delay?: number
    restrictedPages?: string[]
    adSenseClient?: string
    adSenseSlot?: string
    size?: string
  }
}

interface AdminAdSettings {
  enableAds: boolean
  mobileAds: boolean
  testMode: boolean
  monetagPopup: boolean
  monetagPush: boolean
  monetagNative: boolean
  lastUpdated?: string
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    const loadInitialData = async () => {
      if (!mounted) return
      
      // Load both config and settings
      const results = await Promise.allSettled([
        loadAdConfigs(),
        loadAdminSettings()
      ])
      
      // Check if both succeeded
      const allSuccessful = results.every(result => result.status === 'fulfilled')
      if (!allSuccessful && mounted) {
        console.warn('Some ad data failed to load:', results)
      }
      
      if (mounted) {
        setLoading(false)
      }
    }
    
    loadInitialData()

    // Periodic refresh - with exponential backoff on errors
    if (!hasError && retryCount < 3) {
      const delay = Math.min(15000 * Math.pow(2, retryCount), 60000) // Max 1 minute
      timeoutId = setTimeout(() => {
        if (mounted && !hasError) {
          loadAdminSettings()
        }
      }, delay)
    }

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [hasError, retryCount])

  const loadAdConfigs = async (): Promise<boolean> => {
    try {
      // Add timeout to fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/ads/config', {
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const configs = await response.json()
        setAdConfigs(Array.isArray(configs) ? configs : [])
        setHasError(false)
        return true
      } else {
        console.warn('⚠️ Failed to load ad configs:', response.status)
        return false
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Ad configs request timed out')
      } else {
        console.warn('⚠️ Failed to load ad configs:', error)
      }
      setHasError(true)
      return false
    }
  }

  const loadAdminSettings = async (): Promise<boolean> => {
    try {
      // Add timeout to fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/ads/status', {
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const settings = await response.json()
        
        // Only update if settings actually changed
        if (settings.lastUpdated !== lastUpdated) {
          console.log('🔄 Ad settings updated:', settings)
          setAdminSettings({
            enableAds: settings.enableAds ?? false,
            mobileAds: settings.mobileAds ?? false,
            testMode: settings.testMode ?? true,
            monetagPopup: settings.monetagPopup ?? false,
            monetagPush: settings.monetagPush ?? false,
            monetagNative: settings.monetagNative ?? false,
            lastUpdated: settings.lastUpdated
          })
          setLastUpdated(settings.lastUpdated)
        }
        
        // Reset error state on successful request
        setHasError(false)
        setRetryCount(0)
        return true
      } else {
        console.warn(`⚠️ Ad status API returned ${response.status}`)
        setRetryCount(prev => Math.min(prev + 1, 3))
        return false
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Ad status request timed out')
      } else {
        console.warn('⚠️ Failed to load admin ad settings:', error)
      }
      
      setRetryCount(prev => Math.min(prev + 1, 3))
      
      // Stop retrying after 3 attempts
      if (retryCount >= 2) {
        setHasError(true)
        console.warn('⚠️ Ad settings: Too many failures, stopping retries')
      }
      return false
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

  // Always provide context, even while loading
  const contextValue = {
    adConfigs: loading ? [] : adConfigs.filter(shouldShowAd),
    adminSettings,
    getAdsByType: loading ? () => [] : getAdsByType,
    shouldShowAd: loading ? () => false : shouldShowAd,
    loading,
    hasError
  }

  // Ad configs'i global context'e ekle
  return (
    <AdConfigContext.Provider value={contextValue}>
      {children}
    </AdConfigContext.Provider>
  )
}

export const AdConfigContext = React.createContext<{
  adConfigs: AdConfig[]
  adminSettings: AdminAdSettings
  getAdsByType: (type: string) => AdConfig[]
  shouldShowAd: (adConfig: AdConfig) => boolean
  loading: boolean
  hasError: boolean
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
  shouldShowAd: () => false,
  loading: true,
  hasError: false
})

export const useAdConfig = () => {
  const context = React.useContext(AdConfigContext)
  
  // Instead of throwing error, return default values
  if (!context) {
    return {
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
      shouldShowAd: () => false,
      loading: false,
      hasError: false
    }
  }
  
  return context
}
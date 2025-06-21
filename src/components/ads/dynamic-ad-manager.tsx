'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdConfig } from '@/lib/ad-config'

interface DynamicAdManagerProps {
  children: React.ReactNode
}

export function DynamicAdManager({ children }: DynamicAdManagerProps) {
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    loadAdConfigs()
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
    } finally {
      setLoading(false)
    }
  }

  const shouldShowAd = (adConfig: AdConfig): boolean => {
    if (!adConfig.enabled) return false
    
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
      getAdsByType,
      shouldShowAd 
    }}>
      {children}
    </AdConfigContext.Provider>
  )
}

export const AdConfigContext = React.createContext<{
  adConfigs: AdConfig[]
  getAdsByType: (type: string) => AdConfig[]
  shouldShowAd: (adConfig: AdConfig) => boolean
}>({
  adConfigs: [],
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
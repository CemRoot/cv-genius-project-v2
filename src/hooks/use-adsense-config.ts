'use client'

import { useState, useEffect } from 'react'

interface AdSenseSlots {
  headerSlot: string
  sidebarSlot: string
  inlineSlot: string
  footerSlot: string
  stickySlot: string
}

const defaultSlots: AdSenseSlots = {
  headerSlot: '',
  sidebarSlot: '',
  inlineSlot: '',
  footerSlot: '',
  stickySlot: ''
}

export function useAdSenseConfig() {
  const [slots, setSlots] = useState<AdSenseSlots>(defaultSlots)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔧 [AdSense Config] Initializing AdSense config...', {
      environment: process.env.NODE_ENV,
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? 
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT.substring(0, 10) + '...' : 'NOT SET'
    })
    loadAdSenseConfig()
  }, [])

  const loadAdSenseConfig = async () => {
    try {
      console.log('🔧 [AdSense Config] Fetching config from API...')
      
      // Public endpoint'ten config'i al
      const response = await fetch('/api/admin/ads/config', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [AdSense Config] Config loaded from API:', {
          hasHeaderSlot: !!data.headerSlot,
          hasSidebarSlot: !!data.sidebarSlot,
          hasInlineSlot: !!data.inlineSlot,
          hasFooterSlot: !!data.footerSlot,
          hasStickySlot: !!data.stickySlot
        })
        setSlots(data)
      } else {
        console.warn('⚠️ [AdSense Config] API failed, using environment variables')
        // Fallback olarak environment variable'ları kullan
        const envSlots = {
          headerSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT || '',
          sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
          inlineSlot: process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
          footerSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
          stickySlot: process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || ''
        }
        
        console.log('🔧 [AdSense Config] Using env variables:', {
          hasHeaderSlot: !!envSlots.headerSlot,
          hasSidebarSlot: !!envSlots.sidebarSlot,
          hasInlineSlot: !!envSlots.inlineSlot,
          hasFooterSlot: !!envSlots.footerSlot,
          hasStickySlot: !!envSlots.stickySlot
        })
        
        setSlots(envSlots)
      }
    } catch (error) {
      console.error('❌ [AdSense Config] Failed to load config:', error)
      // Hata durumunda environment variable'ları kullan
      const envSlots = {
        headerSlot: process.env.NEXT_PUBLIC_ADSENSE_HEADER_SLOT || '',
        sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
        inlineSlot: process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
        footerSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
        stickySlot: process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || ''
      }
      
      console.log('🔧 [AdSense Config] Fallback to env variables:', {
        hasHeaderSlot: !!envSlots.headerSlot,
        hasSidebarSlot: !!envSlots.sidebarSlot,
        hasInlineSlot: !!envSlots.inlineSlot,
        hasFooterSlot: !!envSlots.footerSlot,
        hasStickySlot: !!envSlots.stickySlot
      })
      
      setSlots(envSlots)
    } finally {
      setLoading(false)
    }
  }

  return {
    slots,
    loading,
    reload: loadAdSenseConfig
  }
}
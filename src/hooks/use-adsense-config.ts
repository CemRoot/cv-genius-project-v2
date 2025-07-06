'use client'

import { useState, useEffect } from 'react'

interface AdSenseSlots {
  sidebarSlot: string
  inlineSlot: string
  footerSlot: string
  stickySlot: string
}

const defaultSlots: AdSenseSlots = {
  sidebarSlot: '',
  inlineSlot: '',
  footerSlot: '',
  stickySlot: ''
}

export function useAdSenseConfig() {
  const [slots, setSlots] = useState<AdSenseSlots>(defaultSlots)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdSenseConfig()
  }, [])

  const loadAdSenseConfig = async () => {
    try {
      // Public endpoint'ten config'i al
      const response = await fetch('/api/admin/ads/config', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setSlots(data)
      } else {
        // Fallback olarak environment variable'ları kullan
        setSlots({
          sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
          inlineSlot: process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
          footerSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
          stickySlot: process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || ''
        })
      }
    } catch (error) {
      console.error('Failed to load AdSense config:', error)
      // Hata durumunda environment variable'ları kullan
      setSlots({
        sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
        inlineSlot: process.env.NEXT_PUBLIC_ADSENSE_INLINE_SLOT || '',
        footerSlot: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
        stickySlot: process.env.NEXT_PUBLIC_ADSENSE_STICKY_SLOT || ''
      })
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
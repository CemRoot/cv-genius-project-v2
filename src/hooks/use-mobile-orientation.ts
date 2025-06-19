'use client'

import { useState, useEffect } from 'react'

interface OrientationState {
  orientation: 'portrait' | 'landscape'
  isPortrait: boolean
  isLandscape: boolean
  angle: number
}

export function useMobileOrientation(): OrientationState {
  const [orientationState, setOrientationState] = useState<OrientationState>({
    orientation: 'portrait',
    isPortrait: true,
    isLandscape: false,
    angle: 0
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      const angle = window.screen?.orientation?.angle || 0
      const isPortrait = window.innerHeight > window.innerWidth
      
      setOrientationState({
        orientation: isPortrait ? 'portrait' : 'landscape',
        isPortrait,
        isLandscape: !isPortrait,
        angle
      })
    }

    // Initial check
    updateOrientation()

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateOrientation)

    return () => {
      window.removeEventListener('orientationchange', updateOrientation)
      window.removeEventListener('resize', updateOrientation)
    }
  }, [])

  return orientationState
}
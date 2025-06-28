'use client'

import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  screenWidth: number
  screenHeight: number
  deviceType: 'mobile' | 'tablet' | 'desktop'
  hasCamera: boolean
  hasVoiceInput: boolean
  hasHaptic: boolean
  orientation: 'portrait' | 'landscape'
}

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1280,
  desktop: 1440,
} as const

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initial SSR-safe state
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      screenWidth: 1920,
      screenHeight: 1080,
      deviceType: 'desktop',
      hasCamera: false,
      hasVoiceInput: false,
      hasHaptic: false,
      orientation: 'landscape'
    }
  })

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Device type detection
      const isMobile = width < BREAKPOINTS.mobile
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
      const isDesktop = width >= BREAKPOINTS.tablet
      
      // Touch detection
      const isTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 ||
                     /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      
      // Feature detection
      const hasCamera = 'mediaDevices' in navigator && 
                       'getUserMedia' in navigator.mediaDevices
      
      const hasVoiceInput = 'webkitSpeechRecognition' in window || 
                           'SpeechRecognition' in window
      
      const hasHaptic = 'vibrate' in navigator
      
      // Orientation
      const orientation = width > height ? 'landscape' : 'portrait'
      
      // Device type
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile) deviceType = 'mobile'
      else if (isTablet) deviceType = 'tablet'
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        screenWidth: width,
        screenHeight: height,
        deviceType,
        hasCamera,
        hasVoiceInput,
        hasHaptic,
        orientation
      })
    }
    
    // Initial detection
    detectDevice()
    
    // Event listeners
    window.addEventListener('resize', detectDevice)
    window.addEventListener('orientationchange', detectDevice)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', detectDevice)
      window.removeEventListener('orientationchange', detectDevice)
    }
  }, [])
  
  return deviceInfo
}

// Utility function for server-side detection
export function getDeviceTypeFromUserAgent(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const mobileRegex = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i
  const tabletRegex = /iPad|Android.*Tablet|Tablet.*Android|Kindle|Silk/i
  
  if (tabletRegex.test(userAgent)) return 'tablet'
  if (mobileRegex.test(userAgent)) return 'mobile'
  return 'desktop'
}
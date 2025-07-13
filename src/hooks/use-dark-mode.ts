'use client'

import { useState, useEffect } from 'react'

type DarkModeOptions = {
  autoMode?: boolean
  batteryAware?: boolean
  oledOptimized?: boolean
}

export function useDarkMode(options: DarkModeOptions = {}) {
  const { autoMode = true, batteryAware = true, oledOptimized = true } = options
  
  const [darkMode, setDarkMode] = useState<boolean | null>(null)
  const [autoModeEnabled, setAutoModeEnabled] = useState(autoMode)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [isCharging, setIsCharging] = useState<boolean | null>(null)

  // Initialize dark mode
  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    const autoStored = localStorage.getItem('autoMode')
    
    if (autoStored !== null) {
      setAutoModeEnabled(JSON.parse(autoStored))
    }

    if (stored !== null) {
      setDarkMode(JSON.parse(stored))
    } else if (autoModeEnabled) {
      // Auto mode based on system preference only
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    } else {
      setDarkMode(false)
    }
  }, [autoModeEnabled])

  // Monitor system dark mode preference
  useEffect(() => {
    if (!autoModeEnabled) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (autoModeEnabled) {
        setDarkMode(mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [autoModeEnabled])


  // Battery API monitoring
  useEffect(() => {
    if (!batteryAware || !('getBattery' in navigator)) return

    let batteryUpdateInterval: NodeJS.Timeout

    const initBattery = async () => {
      try {
        const battery = await (navigator as any).getBattery()
        
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level)
          setIsCharging(battery.charging)
          
          // Auto enable dark mode when battery is low and not charging
          if (batteryAware && battery.level < 0.2 && !battery.charging && !darkMode) {
            setDarkMode(true)
          }
        }

        updateBatteryInfo()
        
        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingchange', updateBatteryInfo)
        
        // Update battery info every 5 minutes
        batteryUpdateInterval = setInterval(updateBatteryInfo, 5 * 60 * 1000)
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo)
          battery.removeEventListener('chargingchange', updateBatteryInfo)
          clearInterval(batteryUpdateInterval)
        }
      } catch (error) {
        console.warn('Battery API not supported')
      }
    }

    initBattery()
    
    return () => {
      if (batteryUpdateInterval) {
        clearInterval(batteryUpdateInterval)
      }
    }
  }, [batteryAware, darkMode])

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode === null) return

    const root = document.documentElement
    
    if (darkMode) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
      
      // OLED optimization
      if (oledOptimized) {
        root.style.setProperty('--background', '0 0% 0%') // True black
        root.style.setProperty('--card', '0 0% 4%') // Near black
      }
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
      
      // Reset OLED optimizations
      if (oledOptimized) {
        root.style.removeProperty('--background')
        root.style.removeProperty('--card')
      }
    }

    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode, oledOptimized])

  // Save auto mode preference
  useEffect(() => {
    localStorage.setItem('autoMode', JSON.stringify(autoModeEnabled))
  }, [autoModeEnabled])

  const toggleDarkMode = () => {
    setAutoModeEnabled(false) // Disable auto mode when manually toggling
    setDarkMode(prev => !prev)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const enableAutoMode = () => {
    setAutoModeEnabled(true)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
  }

  const disableAutoMode = () => {
    setAutoModeEnabled(false)
  }

  return {
    darkMode: darkMode ?? false,
    toggleDarkMode,
    autoModeEnabled,
    enableAutoMode,
    disableAutoMode,
    batteryLevel,
    isCharging,
    isLoading: darkMode === null
  }
}


// Hook for theme-aware colors
export function useThemeColors() {
  const { darkMode } = useDarkMode()

  const colors = {
    background: darkMode ? '#000000' : '#ffffff',
    foreground: darkMode ? '#ffffff' : '#000000',
    card: darkMode ? '#111111' : '#ffffff',
    cardForeground: darkMode ? '#ffffff' : '#000000',
    primary: darkMode ? '#A78BFA' : '#8B5CF6',
    primaryForeground: darkMode ? '#000000' : '#ffffff',
    secondary: darkMode ? '#1F2937' : '#F3F4F6',
    secondaryForeground: darkMode ? '#ffffff' : '#111827',
    muted: darkMode ? '#1F2937' : '#F3F4F6',
    mutedForeground: darkMode ? '#9CA3AF' : '#6B7280',
    accent: darkMode ? '#1F2937' : '#F3F4F6',
    accentForeground: darkMode ? '#ffffff' : '#111827',
    border: darkMode ? '#2A2A2A' : '#E5E7EB',
    input: darkMode ? '#2A2A2A' : '#E5E7EB',
    ring: darkMode ? '#A78BFA' : '#8B5CF6'
  }

  return colors
}
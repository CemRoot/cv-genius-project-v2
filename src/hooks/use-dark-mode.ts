'use client'

import { useState, useEffect } from 'react'

interface DarkModeOptions {
  autoMode?: boolean
  batteryAware?: boolean
  oledOptimized?: boolean
}

export function useDarkMode(options: DarkModeOptions = {}) {
  // Always return light mode - dark mode completely disabled
  const [darkMode] = useState<boolean>(false)
  const [autoModeEnabled] = useState<boolean>(false)
  const [batteryLevel] = useState<number | null>(null)
  const [isCharging] = useState<boolean | null>(null)

  // Force light mode on document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.colorScheme = 'light'
    
    // Force light mode in localStorage
    localStorage.setItem('darkMode', JSON.stringify(false))
    localStorage.setItem('autoMode', JSON.stringify(false))
  }, [])

  // Dummy functions - no functionality needed
  const toggleDarkMode = () => {
    // Do nothing - dark mode disabled
  }

  const enableAutoMode = () => {
    // Do nothing - dark mode disabled
  }

  const disableAutoMode = () => {
    // Do nothing - dark mode disabled
  }

  return {
    darkMode: false, // Always false
    toggleDarkMode,
    autoModeEnabled: false, // Always false
    enableAutoMode,
    disableAutoMode,
    batteryLevel,
    isCharging,
    isLoading: false // Always loaded as light mode
  }
}

// Hook for theme-aware colors - only light mode colors
export function useThemeColors() {
  const colors = {
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    cardForeground: '#000000',
    primary: '#8B5CF6',
    primaryForeground: '#ffffff',
    secondary: '#F3F4F6',
    secondaryForeground: '#111827',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    accent: '#F3F4F6',
    accentForeground: '#111827',
    border: '#E5E7EB',
    input: '#E5E7EB',
    ring: '#8B5CF6'
  }

  return colors
}
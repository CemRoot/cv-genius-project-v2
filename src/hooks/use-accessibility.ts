'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AccessibilityPreferences {
  highContrast: boolean
  largeText: boolean
  reduceMotion: boolean
  enhancedFocus: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface AccessibilityState {
  preferences: AccessibilityPreferences
  isScreenReaderActive: boolean
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  colorScheme: 'light' | 'dark' | 'auto'
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  enhancedFocus: true,
  screenReader: false,
  keyboardNavigation: true
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences)
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'auto'>('auto')

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: AccessibilityPreferences) => {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences))
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error)
    }
  }, [])

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(reducedMotionQuery.matches)
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(highContrastQuery.matches)
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }
    highContrastQuery.addEventListener('change', handleHighContrastChange)

    // Check for color scheme preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)')
    
    const updateColorScheme = () => {
      if (darkModeQuery.matches) {
        setColorScheme('dark')
      } else if (lightModeQuery.matches) {
        setColorScheme('light')
      } else {
        setColorScheme('auto')
      }
    }
    
    updateColorScheme()
    darkModeQuery.addEventListener('change', updateColorScheme)
    lightModeQuery.addEventListener('change', updateColorScheme)

    // Detect screen reader
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelector('[aria-live]') !== null
      const hasScreenReaderClass = document.body.classList.contains('screen-reader-active')
      const hasSpeechSynthesis = 'speechSynthesis' in window
      
      setIsScreenReaderActive(hasAriaLive || hasScreenReaderClass || hasSpeechSynthesis)
    }
    
    detectScreenReader()
    
    // Monitor for screen reader activation
    const observer = new MutationObserver(() => {
      detectScreenReader()
    })
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
      darkModeQuery.removeEventListener('change', updateColorScheme)
      lightModeQuery.removeEventListener('change', updateColorScheme)
      observer.disconnect()
    }
  }, [])

  // Apply preferences to DOM
  useEffect(() => {
    if (typeof window === 'undefined') return

    const body = document.body
    const html = document.documentElement

    // High contrast
    body.classList.toggle('high-contrast', preferences.highContrast || prefersHighContrast)
    
    // Large text
    body.classList.toggle('large-text', preferences.largeText)
    
    // Reduced motion
    body.classList.toggle('reduce-motion', preferences.reduceMotion || prefersReducedMotion)
    
    // Enhanced focus
    body.classList.toggle('enhanced-focus', preferences.enhancedFocus)
    
    // Screen reader
    body.classList.toggle('screen-reader-active', preferences.screenReader || isScreenReaderActive)
    
    // Keyboard navigation
    body.classList.toggle('keyboard-navigation', preferences.keyboardNavigation)

    // Color scheme
    html.setAttribute('data-theme', colorScheme)

  }, [preferences, prefersReducedMotion, prefersHighContrast, isScreenReaderActive, colorScheme])

  // Update specific preference
  const updatePreference = useCallback((key: keyof AccessibilityPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    savePreferences(newPreferences)
  }, [preferences, savePreferences])

  // Toggle preference
  const togglePreference = useCallback((key: keyof AccessibilityPreferences) => {
    updatePreference(key, !preferences[key])
  }, [preferences, updatePreference])

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
    savePreferences(defaultPreferences)
  }, [savePreferences])

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return

    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [])

  // Focus management
  const focusElement = useCallback((selector: string | Element) => {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector
    
    if (element instanceof HTMLElement) {
      element.focus()
      
      // Scroll into view if needed
      if (preferences.enhancedFocus) {
        element.scrollIntoView({
          behavior: preferences.reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        })
      }
    }
  }, [preferences.enhancedFocus, preferences.reduceMotion])

  // Skip to content
  const skipToMain = useCallback(() => {
    const main = document.querySelector('main, [role="main"], #main-content')
    if (main instanceof HTMLElement) {
      main.focus()
      main.scrollIntoView({
        behavior: preferences.reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      })
      announce('Skipped to main content')
    }
  }, [preferences.reduceMotion, announce])

  // Check if element is keyboard accessible
  const isKeyboardAccessible = useCallback((element: Element): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]
    
    return focusableSelectors.some(selector => element.matches(selector))
  }, [])

  // Get reading level estimate
  const getReadingLevel = useCallback((text: string): 'easy' | 'medium' | 'hard' => {
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).length
    const syllables = text.split(/[aeiouAEIOU]/).length - 1
    
    if (words === 0) return 'easy'
    
    // Simplified Flesch Reading Ease calculation
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
    
    if (score >= 60) return 'easy'
    if (score >= 30) return 'medium'
    return 'hard'
  }, [])

  const state: AccessibilityState = {
    preferences,
    isScreenReaderActive,
    prefersReducedMotion,
    prefersHighContrast,
    colorScheme
  }

  return {
    // State
    ...state,
    
    // Actions
    updatePreference,
    togglePreference,
    resetPreferences,
    
    // Utilities
    announce,
    focusElement,
    skipToMain,
    isKeyboardAccessible,
    getReadingLevel,
    
    // Computed values
    shouldReduceMotion: preferences.reduceMotion || prefersReducedMotion,
    shouldUseHighContrast: preferences.highContrast || prefersHighContrast,
    isUsingKeyboard: preferences.keyboardNavigation,
    isUsingScreenReader: preferences.screenReader || isScreenReaderActive
  }
}

export default useAccessibility
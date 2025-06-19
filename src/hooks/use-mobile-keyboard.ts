"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export interface KeyboardState {
  isVisible: boolean
  height: number
  animating: boolean
  lastActiveElement: Element | null
}

export interface MobileKeyboardOptions {
  autoScroll?: boolean
  scrollOffset?: number
  adjustViewport?: boolean
  detectFocusableElements?: string[]
  preventBodyScroll?: boolean
  restoreScrollOnHide?: boolean
}

const defaultOptions: Required<MobileKeyboardOptions> = {
  autoScroll: true,
  scrollOffset: 20,
  adjustViewport: true,
  detectFocusableElements: ['input', 'textarea', 'select', '[contenteditable]'],
  preventBodyScroll: true,
  restoreScrollOnHide: true,
}

export function useMobileKeyboard(options: MobileKeyboardOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  // Enhanced mobile detection
  const isMobileDevice = useRef(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isMobileDevice.current = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (window.innerWidth < 768)
    }
  }, [])
  
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    animating: false,
    lastActiveElement: null,
  })

  const initialViewportHeight = useRef<number>(0)
  const currentViewportHeight = useRef<number>(0)
  const savedScrollPosition = useRef<number>(0)
  const animationTimer = useRef<NodeJS.Timeout | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  // Initialize viewport height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialViewportHeight.current = window.innerHeight
      currentViewportHeight.current = window.innerHeight
    }
  }, [])

  // Enhanced keyboard detection with multiple methods
  const detectKeyboardVisibility = useCallback(() => {
    if (typeof window === 'undefined' || !isMobileDevice.current) return

    let currentHeight = window.innerHeight
    let isKeyboardVisible = false
    let keyboardHeight = 0

    // Method 1: Visual Viewport API (most reliable on modern browsers)
    if ('visualViewport' in window && window.visualViewport) {
      currentHeight = window.visualViewport.height
      const heightDifference = initialViewportHeight.current - currentHeight
      isKeyboardVisible = heightDifference > 150
      keyboardHeight = isKeyboardVisible ? heightDifference : 0
    } else {
      // Method 2: Window height detection (fallback)
      const heightDifference = initialViewportHeight.current - currentHeight
      const threshold = 150 // Minimum height change to consider keyboard open
      isKeyboardVisible = heightDifference > threshold
      keyboardHeight = isKeyboardVisible ? heightDifference : 0
    }

    if (isKeyboardVisible !== keyboardState.isVisible) {
      setKeyboardState(prev => ({
        ...prev,
        isVisible: isKeyboardVisible,
        height: keyboardHeight,
        animating: true,
      }))

      // Clear existing animation timer
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }

      // End animation state after transition
      animationTimer.current = setTimeout(() => {
        setKeyboardState(prev => ({
          ...prev,
          animating: false,
        }))
      }, 300)

      // Update CSS custom property for keyboard height
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${keyboardHeight}px`
      )

      // Adjust viewport if enabled
      if (opts.adjustViewport) {
        document.documentElement.style.setProperty(
          '--mobile-vh-keyboard',
          `${currentHeight * 0.01}px`
        )
      }
    }

    currentViewportHeight.current = currentHeight
  }, [keyboardState.isVisible, opts.adjustViewport])

  // Enhanced scroll element into view with keyboard awareness
  const scrollElementIntoView = useCallback((element: Element) => {
    if (!opts.autoScroll || !element || !isMobileDevice.current) return

    const rect = element.getBoundingClientRect()
    const viewportHeight = keyboardState.isVisible 
      ? window.innerHeight - keyboardState.height 
      : window.innerHeight
    
    const elementTop = rect.top
    const elementBottom = rect.bottom + opts.scrollOffset
    const elementCenter = elementTop + (rect.height / 2)
    
    // Calculate if element is in view considering keyboard
    const isElementVisible = elementTop >= 0 && elementBottom <= viewportHeight
    
    if (!isElementVisible) {
      // Save current scroll position
      savedScrollPosition.current = window.scrollY
      
      let scrollAmount = 0
      
      if (elementBottom > viewportHeight) {
        // Element is below visible area
        scrollAmount = elementBottom - viewportHeight + 20
      } else if (elementTop < 0) {
        // Element is above visible area
        scrollAmount = elementTop - 20
      }
      
      // Enhanced smooth scroll with momentum
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      })
      
      // Add a small delay to ensure scroll completes before any further actions
      setTimeout(() => {
        // Double-check if element is now visible, if not, center it
        const newRect = element.getBoundingClientRect()
        const newViewportHeight = keyboardState.isVisible 
          ? window.innerHeight - keyboardState.height 
          : window.innerHeight
        
        if (newRect.bottom > newViewportHeight || newRect.top < 0) {
          const centerOffset = (newViewportHeight / 2) - (newRect.height / 2)
          const additionalScroll = newRect.top - centerOffset
          
          window.scrollBy({
            top: additionalScroll,
            behavior: 'smooth'
          })
        }
      }, 300)
    }
  }, [opts.autoScroll, opts.scrollOffset, keyboardState.isVisible, keyboardState.height])

  // Enhanced focus handling with better timing
  const handleFocusIn = useCallback((event: FocusEvent) => {
    const target = event.target as Element
    
    if (!isMobileDevice.current) return
    
    // Check if focused element is a focusable input
    const isFocusableElement = opts.detectFocusableElements.some(selector => 
      target.matches?.(selector)
    )

    if (isFocusableElement) {
      setKeyboardState(prev => ({
        ...prev,
        lastActiveElement: target,
      }))

      // Prevent body scroll if enabled
      if (opts.preventBodyScroll) {
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
      }

      // Enhanced timing for keyboard appearance detection
      const scrollTimeouts = [150, 300, 600] // Multiple attempts for better reliability
      
      scrollTimeouts.forEach((delay, index) => {
        setTimeout(() => {
          scrollElementIntoView(target)
          
          // Add haptic feedback on successful focus (mobile only)
          if (index === 0 && 'vibrate' in navigator) {
            navigator.vibrate([10])
          }
        }, delay)
      })
      
      // Ensure element remains focused
      setTimeout(() => {
        if (document.activeElement !== target) {
          (target as HTMLElement).focus()
        }
      }, 100)
    }
  }, [opts.detectFocusableElements, opts.preventBodyScroll, scrollElementIntoView])

  // Enhanced focus out handling
  const handleFocusOut = useCallback(() => {
    if (!isMobileDevice.current) return
    
    // Delay to check if focus moved to another input
    setTimeout(() => {
      const activeElement = document.activeElement
      const isStillFocusedOnInput = opts.detectFocusableElements.some(selector => 
        activeElement?.matches?.(selector)
      )
      
      if (!isStillFocusedOnInput) {
        // Restore body scroll
        if (opts.preventBodyScroll) {
          document.body.style.overflow = ''
          document.body.style.position = ''
          document.body.style.width = ''
        }

        // Restore scroll position if enabled and keyboard is hidden
        if (opts.restoreScrollOnHide && !keyboardState.isVisible) {
          setTimeout(() => {
            window.scrollTo({
              top: savedScrollPosition.current,
              behavior: 'smooth'
            })
          }, 400)
        }
      }
    }, 100)
  }, [opts.preventBodyScroll, opts.restoreScrollOnHide, opts.detectFocusableElements, keyboardState.isVisible])

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Viewport resize detection
    window.addEventListener('resize', detectKeyboardVisibility)
    
    // Visual viewport API (better detection on iOS)
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport as any
      visualViewport?.addEventListener('resize', detectKeyboardVisibility)
    }

    // Focus events
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    // ResizeObserver for additional detection
    if ('ResizeObserver' in window) {
      resizeObserver.current = new ResizeObserver(() => {
        detectKeyboardVisibility()
      })
      resizeObserver.current.observe(document.documentElement)
    }

    return () => {
      window.removeEventListener('resize', detectKeyboardVisibility)
      
      if ('visualViewport' in window) {
        const visualViewport = window.visualViewport as any
        visualViewport?.removeEventListener('resize', detectKeyboardVisibility)
      }

      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)

      if (resizeObserver.current) {
        resizeObserver.current.disconnect()
      }

      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
      }

      // Cleanup CSS properties
      document.documentElement.style.removeProperty('--keyboard-height')
      document.documentElement.style.removeProperty('--mobile-vh-keyboard')
      document.body.style.overflow = ''
    }
  }, [detectKeyboardVisibility, handleFocusIn, handleFocusOut])

  // Manual control functions
  const forceHideKeyboard = useCallback(() => {
    // Blur active element to hide keyboard
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur()
    }
  }, [])

  const scrollToElement = useCallback((element: Element | string) => {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element)
      : element

    if (targetElement) {
      scrollElementIntoView(targetElement)
    }
  }, [scrollElementIntoView])

  return {
    // State
    isVisible: keyboardState.isVisible,
    height: keyboardState.height,
    animating: keyboardState.animating,
    lastActiveElement: keyboardState.lastActiveElement,

    // Computed values
    isOpen: keyboardState.isVisible, // Alias for better readability
    availableHeight: initialViewportHeight.current - keyboardState.height,
    adjustedViewHeight: keyboardState.isVisible 
      ? `${initialViewportHeight.current - keyboardState.height}px` 
      : '100vh',
    viewportHeightDifference: initialViewportHeight.current - currentViewportHeight.current,
    isMobile: isMobileDevice.current,
    
    // Control functions
    forceHideKeyboard,
    scrollToElement,
    
    // Enhanced utility functions
    isElementInView: (element: Element) => {
      const rect = element.getBoundingClientRect()
      const viewportHeight = keyboardState.isVisible 
        ? window.innerHeight - keyboardState.height 
        : window.innerHeight
      return rect.top >= 0 && rect.bottom <= viewportHeight
    },
    
    isElementPartiallyInView: (element: Element) => {
      const rect = element.getBoundingClientRect()
      const viewportHeight = keyboardState.isVisible 
        ? window.innerHeight - keyboardState.height 
        : window.innerHeight
      return rect.bottom > 0 && rect.top < viewportHeight
    },
    
    getFocusableElements: () => {
      const selector = opts.detectFocusableElements.join(', ')
      return document.querySelectorAll(selector)
    },
  }
}

export default useMobileKeyboard
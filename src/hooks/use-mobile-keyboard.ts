'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface KeyboardState {
  isVisible: boolean
  height: number
  isAnimating: boolean
  hasSupport: boolean
}

export interface KeyboardOptions {
  enableViewportAdjustment?: boolean
  enableScrollIntoView?: boolean
  animationDuration?: number
  onShow?: (height: number) => void
  onHide?: () => void
  onHeightChange?: (height: number) => void
}

const defaultOptions: Required<KeyboardOptions> = {
  enableViewportAdjustment: true,
  enableScrollIntoView: true,
  animationDuration: 300,
  onShow: () => {},
  onHide: () => {},
  onHeightChange: () => {}
}

export function useMobileKeyboard(options: KeyboardOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    isAnimating: false,
    hasSupport: typeof window !== 'undefined' && 'visualViewport' in window
  })

  const initialViewportHeight = useRef<number>(0)
  const currentActiveElement = useRef<Element | null>(null)
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null)
  const animationTimeout = useRef<NodeJS.Timeout | null>(null)

  // Store initial viewport height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialViewportHeight.current = window.innerHeight
    }
  }, [])

  // Handle viewport changes for iOS
  const handleVisualViewportChange = useCallback(() => {
    if (!window.visualViewport) return

    const { height: viewportHeight } = window.visualViewport
    const keyboardHeight = initialViewportHeight.current - viewportHeight
    const isKeyboardVisible = keyboardHeight > 100 // Threshold for keyboard detection

    setKeyboardState(prev => {
      if (prev.isVisible !== isKeyboardVisible || prev.height !== keyboardHeight) {
        // Set animating state
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current)
        }
        
        const newState = {
          ...prev,
          isVisible: isKeyboardVisible,
          height: Math.max(0, keyboardHeight),
          isAnimating: true
        }

        // Clear animating state after animation duration
        animationTimeout.current = setTimeout(() => {
          setKeyboardState(current => ({ ...current, isAnimating: false }))
        }, opts.animationDuration)

        // Call callbacks
        if (isKeyboardVisible && !prev.isVisible) {
          opts.onShow(keyboardHeight)
        } else if (!isKeyboardVisible && prev.isVisible) {
          opts.onHide()
        }
        
        if (prev.height !== keyboardHeight) {
          opts.onHeightChange(keyboardHeight)
        }

        return newState
      }
      return prev
    })
  }, [opts])

  // Handle window resize for Android
  const handleWindowResize = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current)
    }

    // Debounce resize events
    resizeTimeout.current = setTimeout(() => {
      const currentHeight = window.innerHeight
      const heightDifference = initialViewportHeight.current - currentHeight
      const isKeyboardVisible = heightDifference > 100

      setKeyboardState(prev => {
        if (prev.isVisible !== isKeyboardVisible || prev.height !== heightDifference) {
          const newState = {
            ...prev,
            isVisible: isKeyboardVisible,
            height: Math.max(0, heightDifference),
            isAnimating: true
          }

          // Clear animating state
          if (animationTimeout.current) {
            clearTimeout(animationTimeout.current)
          }
          animationTimeout.current = setTimeout(() => {
            setKeyboardState(current => ({ ...current, isAnimating: false }))
          }, opts.animationDuration)

          // Call callbacks
          if (isKeyboardVisible && !prev.isVisible) {
            opts.onShow(heightDifference)
          } else if (!isKeyboardVisible && prev.isVisible) {
            opts.onHide()
          }
          
          if (prev.height !== heightDifference) {
            opts.onHeightChange(heightDifference)
          }

          return newState
        }
        return prev
      })
    }, 150) // Debounce delay
  }, [opts])

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Use Visual Viewport API for iOS (more reliable)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange)
      }
    } else {
      // Fallback to window resize for Android
      window.addEventListener('resize', handleWindowResize)
      return () => {
        window.removeEventListener('resize', handleWindowResize)
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current)
        }
      }
    }
  }, [handleVisualViewportChange, handleWindowResize])

  // Handle focus events to track active element
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      currentActiveElement.current = e.target as Element
      
      // Scroll into view if enabled
      if (opts.enableScrollIntoView && e.target instanceof HTMLElement) {
        setTimeout(() => {
          if (keyboardState.isVisible) {
            e.target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            })
          }
        }, opts.animationDuration + 100) // Wait for keyboard animation
      }
    }

    const handleFocusOut = () => {
      currentActiveElement.current = null
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [keyboardState.isVisible, opts.enableScrollIntoView, opts.animationDuration])

  // Adjust viewport when keyboard is visible
  useEffect(() => {
    if (!opts.enableViewportAdjustment) return

    if (keyboardState.isVisible) {
      // Set CSS custom property for keyboard height
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardState.height}px`)
      document.documentElement.style.setProperty('--available-height', `${window.innerHeight - keyboardState.height}px`)
      
      // Add keyboard-visible class
      document.body.classList.add('keyboard-visible')
      
      // Prevent body scroll on iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.top = '0'
      }
    } else {
      // Remove CSS properties
      document.documentElement.style.removeProperty('--keyboard-height')
      document.documentElement.style.removeProperty('--available-height')
      
      // Remove keyboard-visible class
      document.body.classList.remove('keyboard-visible')
      
      // Restore body scroll
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
      }
    }
  }, [keyboardState.isVisible, keyboardState.height, opts.enableViewportAdjustment])

  // Scroll active element into view
  const scrollActiveElementIntoView = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (currentActiveElement.current && currentActiveElement.current instanceof HTMLElement) {
      currentActiveElement.current.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'nearest'
      })
    }
  }, [])

  // Adjust scroll position to account for keyboard
  const adjustScrollForKeyboard = useCallback((element?: HTMLElement) => {
    if (!keyboardState.isVisible || typeof window === 'undefined') return

    const targetElement = element || currentActiveElement.current
    if (!targetElement || !(targetElement instanceof HTMLElement)) return

    const rect = targetElement.getBoundingClientRect()
    const availableHeight = window.innerHeight - keyboardState.height
    const elementBottom = rect.bottom
    
    if (elementBottom > availableHeight) {
      const scrollAmount = elementBottom - availableHeight + 20 // 20px padding
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [keyboardState.isVisible, keyboardState.height])

  // Get safe area for content when keyboard is visible
  const getSafeArea = useCallback(() => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 0
    return {
      top: 0,
      bottom: keyboardState.isVisible ? keyboardState.height : 0,
      height: height - (keyboardState.isVisible ? keyboardState.height : 0)
    }
  }, [keyboardState.isVisible, keyboardState.height])

  // Check if element is hidden behind keyboard
  const isElementHiddenByKeyboard = useCallback((element: HTMLElement) => {
    if (!keyboardState.isVisible || typeof window === 'undefined') return false

    const rect = element.getBoundingClientRect()
    const availableHeight = window.innerHeight - keyboardState.height
    
    return rect.bottom > availableHeight
  }, [keyboardState.isVisible, keyboardState.height])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current)
      }
      
      // Cleanup CSS properties
      document.documentElement.style.removeProperty('--keyboard-height')
      document.documentElement.style.removeProperty('--available-height')
      document.body.classList.remove('keyboard-visible')
      
      // Restore body styles
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
      }
    }
  }, [])

  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

  return {
    // State
    ...keyboardState,
    
    // Active element
    activeElement: currentActiveElement.current,
    
    // Utility functions
    scrollActiveElementIntoView,
    adjustScrollForKeyboard,
    getSafeArea,
    isElementHiddenByKeyboard,
    
    // Computed values
    availableHeight: windowHeight - keyboardState.height,
    adjustedViewHeight: windowHeight - keyboardState.height,
    keyboardOffset: keyboardState.isVisible ? keyboardState.height : 0,
    
    // Platform detection
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    
    // CSS helpers
    keyboardAwareStyle: {
      paddingBottom: keyboardState.isVisible ? `${keyboardState.height}px` : '0px',
      transition: keyboardState.isAnimating ? `padding-bottom ${opts.animationDuration}ms ease-out` : 'none'
    },
    
    safeAreaStyle: {
      height: `${windowHeight - keyboardState.height}px`,
      transition: keyboardState.isAnimating ? `height ${opts.animationDuration}ms ease-out` : 'none'
    }
  }
}

export default useMobileKeyboard
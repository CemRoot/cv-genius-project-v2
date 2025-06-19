"use client"

import { useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useTouchGestures, { GestureEvent } from './use-touch-gestures'

export interface SwipeNavigationOptions {
  enabled?: boolean
  horizontalThreshold?: number
  verticalThreshold?: number
  velocityThreshold?: number
  enableBackGesture?: boolean
  enableTabSwipe?: boolean
  enableModalClose?: boolean
  enableRefresh?: boolean
  preventHorizontalScroll?: boolean
  preventVerticalScroll?: boolean
}

export interface SwipeNavigationHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onBackGesture?: () => void
  onRefresh?: () => Promise<void>
  onTabChange?: (direction: 'left' | 'right') => void
  onModalClose?: () => void
}

const defaultOptions: Required<SwipeNavigationOptions> = {
  enabled: true,
  horizontalThreshold: 50,
  verticalThreshold: 100,
  velocityThreshold: 0.3,
  enableBackGesture: true,
  enableTabSwipe: true,
  enableModalClose: true,
  enableRefresh: true,
  preventHorizontalScroll: false,
  preventVerticalScroll: false,
}

export function useSwipeNavigation(
  handlers: SwipeNavigationHandlers = {},
  options: SwipeNavigationOptions = {}
) {
  const opts = { ...defaultOptions, ...options }
  const router = useRouter()
  const pathname = usePathname()
  const isRefreshing = useRef(false)
  const startScrollY = useRef(0)
  const refreshProgress = useRef(0)

  // Handle back gesture (swipe from left edge)
  const handleBackGesture = useCallback(() => {
    if (!opts.enableBackGesture) return
    
    if (handlers.onBackGesture) {
      handlers.onBackGesture()
    } else {
      // Default back navigation
      if (window.history.length > 1) {
        router.back()
      }
    }
  }, [opts.enableBackGesture, handlers.onBackGesture, router])

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!opts.enableRefresh || isRefreshing.current) return
    
    isRefreshing.current = true
    refreshProgress.current = 0
    
    try {
      if (handlers.onRefresh) {
        await handlers.onRefresh()
      } else {
        // Default refresh behavior
        window.location.reload()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      isRefreshing.current = false
      refreshProgress.current = 0
    }
  }, [opts.enableRefresh, handlers.onRefresh])

  // Handle tab swipe navigation
  const handleTabSwipe = useCallback((direction: 'left' | 'right') => {
    if (!opts.enableTabSwipe) return
    
    if (handlers.onTabChange) {
      handlers.onTabChange(direction)
    }
  }, [opts.enableTabSwipe, handlers.onTabChange])

  // Handle modal close gesture
  const handleModalClose = useCallback(() => {
    if (!opts.enableModalClose) return
    
    if (handlers.onModalClose) {
      handlers.onModalClose()
    }
  }, [opts.enableModalClose, handlers.onModalClose])

  // Main swipe handler
  const handleSwipe = useCallback((event: GestureEvent) => {
    if (!opts.enabled || event.type !== 'swipe') return

    const { direction, distance = 0, velocity = 0, deltaX = 0, deltaY = 0 } = event

    // Check velocity threshold
    if (velocity < opts.velocityThreshold) return

    switch (direction) {
      case 'left':
        if (Math.abs(deltaX) >= opts.horizontalThreshold) {
          // Handle left swipe
          if (handlers.onSwipeLeft) {
            handlers.onSwipeLeft()
          } else {
            // Default: next tab or forward navigation
            handleTabSwipe('left')
          }
        }
        break

      case 'right':
        if (Math.abs(deltaX) >= opts.horizontalThreshold) {
          // Check if this is a back gesture (swipe from left edge)
          const isFromLeftEdge = (event as any).startX < 50 // Assuming startX is available
          
          if (isFromLeftEdge && opts.enableBackGesture) {
            handleBackGesture()
          } else if (handlers.onSwipeRight) {
            handlers.onSwipeRight()
          } else {
            // Default: previous tab
            handleTabSwipe('right')
          }
        }
        break

      case 'up':
        if (Math.abs(deltaY) >= opts.verticalThreshold) {
          if (handlers.onSwipeUp) {
            handlers.onSwipeUp()
          }
        }
        break

      case 'down':
        if (Math.abs(deltaY) >= opts.verticalThreshold) {
          // Check if this is a pull-to-refresh gesture (from top of page)
          const isFromTop = window.scrollY === 0 && deltaY > 0
          
          if (isFromTop && opts.enableRefresh) {
            handleRefresh()
          } else if (handlers.onSwipeDown) {
            handlers.onSwipeDown()
          } else if (opts.enableModalClose) {
            // Default: close modal/overlay
            handleModalClose()
          }
        }
        break
    }
  }, [
    opts,
    handlers,
    handleBackGesture,
    handleRefresh,
    handleTabSwipe,
    handleModalClose
  ])

  // Pan handler for continuous gestures (like pull-to-refresh preview)
  const handlePan = useCallback((event: GestureEvent) => {
    if (!opts.enabled || event.type !== 'pan') return

    const { deltaY = 0 } = event

    // Handle pull-to-refresh visual feedback
    if (opts.enableRefresh && window.scrollY === 0 && deltaY > 0) {
      refreshProgress.current = Math.min(deltaY / opts.verticalThreshold, 1)
      
      // Trigger haptic feedback at certain thresholds
      if (refreshProgress.current >= 0.5 && refreshProgress.current < 0.6) {
        // Light feedback when halfway
        if ('vibrate' in navigator) {
          navigator.vibrate([5])
        }
      } else if (refreshProgress.current >= 1) {
        // Strong feedback when ready to refresh
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 5, 10])
        }
      }
      
      // Custom CSS variable for refresh indicator
      document.documentElement.style.setProperty(
        '--refresh-progress',
        refreshProgress.current.toString()
      )
    }
  }, [opts])

  // Touch gesture configuration
  const gestureHandlers = useTouchGestures(
    {
      onSwipe: handleSwipe,
      onPan: handlePan,
    },
    {
      swipeThreshold: Math.min(opts.horizontalThreshold, opts.verticalThreshold),
      swipeVelocityThreshold: opts.velocityThreshold,
      preventDefault: opts.preventHorizontalScroll || opts.preventVerticalScroll,
      enableHapticFeedback: true,
    }
  )

  // Cleanup effect
  useEffect(() => {
    return () => {
      isRefreshing.current = false
      refreshProgress.current = 0
      document.documentElement.style.removeProperty('--refresh-progress')
    }
  }, [])

  return {
    ...gestureHandlers,
    // State getters
    isRefreshing: () => isRefreshing.current,
    refreshProgress: () => refreshProgress.current,
    
    // Manual trigger functions
    triggerRefresh: handleRefresh,
    triggerBackGesture: handleBackGesture,
    
    // Configuration
    isEnabled: opts.enabled,
    canGoBack: () => window.history.length > 1,
  }
}

export default useSwipeNavigation
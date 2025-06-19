"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

export interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
  canRefresh: boolean
  progress: number // 0-1
}

export interface PullToRefreshOptions {
  threshold?: number // Distance to trigger refresh
  maxPullDistance?: number // Maximum pull distance
  resistance?: number // Pull resistance (0-1)
  snapBackDuration?: number // Animation duration for snap back
  refreshIndicatorHeight?: number // Height of refresh indicator
  onRefresh?: () => Promise<void>
  onPullStart?: () => void
  onPullProgress?: (progress: number) => void
  onPullEnd?: () => void
  disabled?: boolean
  enableHapticFeedback?: boolean
  refreshTimeout?: number // Timeout for refresh operation
}

const defaultOptions: Required<PullToRefreshOptions> = {
  threshold: 80,
  maxPullDistance: 150,
  resistance: 0.5,
  snapBackDuration: 300,
  refreshIndicatorHeight: 60,
  onRefresh: async () => {},
  onPullStart: () => {},
  onPullProgress: () => {},
  onPullEnd: () => {},
  disabled: false,
  enableHapticFeedback: true,
  refreshTimeout: 10000, // 10 seconds
}

export function usePullToRefresh(options: PullToRefreshOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false,
    progress: 0,
  })

  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const scrollElement = useRef<HTMLElement | null>(null)
  const animationFrame = useRef<number | null>(null)
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasTriggeredHaptic = useRef<boolean>(false)

  // Check if element is at top
  const isAtTop = useCallback((element?: HTMLElement | null): boolean => {
    if (!element) {
      return window.scrollY === 0
    }
    return element.scrollTop === 0
  }, [])

  // Calculate pull distance with resistance
  const calculatePullDistance = useCallback((deltaY: number): number => {
    if (deltaY <= 0) return 0
    
    const resistedDistance = deltaY * opts.resistance
    return Math.min(resistedDistance, opts.maxPullDistance)
  }, [opts.resistance, opts.maxPullDistance])

  // Update pull state
  const updatePullState = useCallback((distance: number) => {
    const progress = Math.min(distance / opts.threshold, 1)
    const canRefresh = distance >= opts.threshold

    setState(prev => ({
      ...prev,
      pullDistance: distance,
      progress,
      canRefresh,
    }))

    // Trigger haptic feedback when threshold is reached
    if (canRefresh && !hasTriggeredHaptic.current && opts.enableHapticFeedback) {
      hasTriggeredHaptic.current = true
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 5, 10])
      }
    } else if (!canRefresh) {
      hasTriggeredHaptic.current = false
    }

    // Update CSS custom property for styling
    document.documentElement.style.setProperty(
      '--pull-refresh-distance',
      `${distance}px`
    )
    document.documentElement.style.setProperty(
      '--pull-refresh-progress',
      progress.toString()
    )

    opts.onPullProgress(progress)
  }, [opts])

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.disabled || state.isRefreshing) return

    const element = scrollElement.current
    if (!isAtTop(element)) return

    startY.current = event.touches[0].clientY
    currentY.current = startY.current

    setState(prev => ({ ...prev, isPulling: true }))
    opts.onPullStart()
  }, [opts, state.isRefreshing, isAtTop])

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (opts.disabled || state.isRefreshing || !state.isPulling) return

    currentY.current = event.touches[0].clientY
    const deltaY = currentY.current - startY.current

    // Only handle downward pulls
    if (deltaY <= 0) return

    // Prevent default scrolling when pulling
    event.preventDefault()

    const pullDistance = calculatePullDistance(deltaY)
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
    }

    animationFrame.current = requestAnimationFrame(() => {
      updatePullState(pullDistance)
    })
  }, [opts, state.isRefreshing, state.isPulling, calculatePullDistance, updatePullState])

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (opts.disabled || state.isRefreshing || !state.isPulling) return

    const shouldRefresh = state.canRefresh

    setState(prev => ({
      ...prev,
      isPulling: false,
      isRefreshing: shouldRefresh,
    }))

    opts.onPullEnd()

    if (shouldRefresh) {
      // Start refresh
      try {
        // Set refresh timeout
        const timeoutPromise = new Promise<void>((_, reject) => {
          refreshTimeout.current = setTimeout(() => {
            reject(new Error('Refresh timeout'))
          }, opts.refreshTimeout)
        })

        // Race between refresh and timeout
        await Promise.race([
          opts.onRefresh(),
          timeoutPromise
        ])

      } catch (error) {
        console.warn('Refresh failed or timed out:', error)
      } finally {
        // Clear timeout
        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current)
          refreshTimeout.current = null
        }
        
        // End refresh state
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false,
          progress: 0,
        }))

        // Clean up CSS properties
        document.documentElement.style.setProperty('--pull-refresh-distance', '0px')
        document.documentElement.style.setProperty('--pull-refresh-progress', '0')
      }
    } else {
      // Snap back animation
      const startDistance = state.pullDistance
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / opts.snapBackDuration, 1)
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentDistance = startDistance * (1 - easeOut)

        updatePullState(currentDistance)

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate)
        } else {
          setState(prev => ({
            ...prev,
            pullDistance: 0,
            canRefresh: false,
            progress: 0,
          }))
          document.documentElement.style.setProperty('--pull-refresh-distance', '0px')
          document.documentElement.style.setProperty('--pull-refresh-progress', '0')
        }
      }

      animationFrame.current = requestAnimationFrame(animate)
    }

    hasTriggeredHaptic.current = false
  }, [opts, state, updatePullState])

  // Manual refresh trigger
  const triggerRefresh = useCallback(async () => {
    if (opts.disabled || state.isRefreshing) return

    setState(prev => ({ ...prev, isRefreshing: true }))

    try {
      await opts.onRefresh()
    } catch (error) {
      console.warn('Manual refresh failed:', error)
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }))
    }
  }, [opts, state.isRefreshing])

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || opts.disabled) return

    const element = scrollElement.current || document.body

    // Passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }

      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current)
      }

      // Clean up CSS properties
      document.documentElement.style.removeProperty('--pull-refresh-distance')
      document.documentElement.style.removeProperty('--pull-refresh-progress')
    }
  }, [opts.disabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Set scroll element reference
  const setScrollElement = useCallback((element: HTMLElement | null) => {
    scrollElement.current = element
  }, [])

  return {
    // State
    ...state,
    
    // Control functions
    triggerRefresh,
    setScrollElement,
    
    // Computed values
    isActive: state.isPulling || state.isRefreshing,
    shouldShowIndicator: state.pullDistance > 0 || state.isRefreshing,
    indicatorStyle: {
      transform: `translateY(${Math.min(state.pullDistance, opts.refreshIndicatorHeight)}px)`,
      opacity: state.progress,
    },
    
    // Configuration
    threshold: opts.threshold,
    maxPullDistance: opts.maxPullDistance,
    
    // Utility functions
    reset: () => {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        canRefresh: false,
        progress: 0,
      })
      document.documentElement.style.setProperty('--pull-refresh-distance', '0px')
      document.documentElement.style.setProperty('--pull-refresh-progress', '0')
    },
  }
}

export default usePullToRefresh
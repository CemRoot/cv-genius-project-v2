'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface SwipeDirection {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

export interface SwipeNavigationState {
  isSwping: boolean
  direction: keyof SwipeDirection | null
  distance: number
  velocity: number
  progress: number // 0-1
  canComplete: boolean
}

export interface SwipeNavigationOptions {
  threshold?: number // Distance to trigger navigation
  maxDistance?: number // Maximum swipe distance
  velocity?: number // Minimum velocity to trigger
  enabledDirections?: Partial<SwipeDirection>
  onSwipeStart?: (direction: keyof SwipeDirection) => void
  onSwipeProgress?: (progress: number, direction: keyof SwipeDirection) => void
  onSwipeComplete?: (direction: keyof SwipeDirection) => void
  onSwipeCancel?: () => void
  enableHapticFeedback?: boolean
  preventScrolling?: boolean
  boundaryElement?: HTMLElement | null
}

const defaultOptions: Required<SwipeNavigationOptions> = {
  threshold: 80,
  maxDistance: 200,
  velocity: 0.3,
  enabledDirections: { left: true, right: true, up: false, down: false },
  onSwipeStart: () => {},
  onSwipeProgress: () => {},
  onSwipeComplete: () => {},
  onSwipeCancel: () => {},
  enableHapticFeedback: true,
  preventScrolling: false,
  boundaryElement: null
}

export function useSwipeNavigation(options: SwipeNavigationOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<SwipeNavigationState>({
    isSwping: false,
    direction: null,
    distance: 0,
    velocity: 0,
    progress: 0,
    canComplete: false
  })

  const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startTime = useRef<number>(0)
  const lastTime = useRef<number>(0)
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const swipeElement = useRef<HTMLElement | null>(null)
  const hasTriggeredHaptic = useRef<boolean>(false)

  // Determine swipe direction
  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): keyof SwipeDirection | null => {
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    // Determine if horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0 && opts.enabledDirections.right) return 'right'
      if (deltaX < 0 && opts.enabledDirections.left) return 'left'
    } else {
      // Vertical swipe
      if (deltaY > 0 && opts.enabledDirections.down) return 'down'
      if (deltaY < 0 && opts.enabledDirections.up) return 'up'
    }
    
    return null
  }, [opts.enabledDirections])

  // Calculate velocity
  const calculateVelocity = useCallback((distance: number, time: number): number => {
    if (time === 0) return 0
    return Math.abs(distance / time)
  }, [])

  // Update swipe state
  const updateSwipeState = useCallback((
    distance: number,
    direction: keyof SwipeDirection | null,
    velocity: number
  ) => {
    const progress = Math.min(distance / opts.threshold, 1)
    const canComplete = distance >= opts.threshold || velocity >= opts.velocity

    setState(prev => ({
      ...prev,
      distance,
      direction,
      velocity,
      progress,
      canComplete
    }))

    // Trigger haptic feedback when threshold is reached
    if (canComplete && !hasTriggeredHaptic.current && opts.enableHapticFeedback) {
      hasTriggeredHaptic.current = true
      if ('vibrate' in navigator) {
        navigator.vibrate([15, 10, 15])
      }
    } else if (!canComplete) {
      hasTriggeredHaptic.current = false
    }

    // Call progress callback
    if (direction) {
      opts.onSwipeProgress(progress, direction)
    }
  }, [opts])

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    startPosition.current = { x: touch.clientX, y: touch.clientY }
    currentPosition.current = { x: touch.clientX, y: touch.clientY }
    lastPosition.current = { x: touch.clientX, y: touch.clientY }
    startTime.current = Date.now()
    lastTime.current = startTime.current

    setState(prev => ({ ...prev, isSwping: true }))
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!state.isSwping && !startPosition.current) return

    const touch = event.touches[0]
    currentPosition.current = { x: touch.clientX, y: touch.clientY }
    
    const deltaX = currentPosition.current.x - startPosition.current.x
    const deltaY = currentPosition.current.y - startPosition.current.y
    const direction = getSwipeDirection(deltaX, deltaY)
    
    if (!direction) return

    // Prevent scrolling if enabled
    if (opts.preventScrolling) {
      event.preventDefault()
    }

    // Calculate distance and velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const currentTime = Date.now()
    const timeDelta = currentTime - lastTime.current
    const positionDelta = Math.sqrt(
      Math.pow(currentPosition.current.x - lastPosition.current.x, 2) +
      Math.pow(currentPosition.current.y - lastPosition.current.y, 2)
    )
    const velocity = calculateVelocity(positionDelta, timeDelta)

    // Limit distance to maxDistance
    const limitedDistance = Math.min(distance, opts.maxDistance)

    // Update state
    updateSwipeState(limitedDistance, direction, velocity)

    // Call start callback only once
    if (!state.direction && direction) {
      opts.onSwipeStart(direction)
    }

    // Update tracking variables
    lastTime.current = currentTime
    lastPosition.current = { ...currentPosition.current }
  }, [state.isSwping, state.direction, getSwipeDirection, calculateVelocity, updateSwipeState, opts])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!state.isSwping || !state.direction) return

    const shouldComplete = state.canComplete
    
    if (shouldComplete) {
      opts.onSwipeComplete(state.direction)
    } else {
      opts.onSwipeCancel()
    }

    // Reset state
    setState({
      isSwping: false,
      direction: null,
      distance: 0,
      velocity: 0,
      progress: 0,
      canComplete: false
    })

    hasTriggeredHaptic.current = false
  }, [state, opts])

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    const element = swipeElement.current || opts.boundaryElement || document.body

    // Passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: !opts.preventScrolling 
    })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.boundaryElement, opts.preventScrolling])

  // Set swipe element reference
  const setSwipeElement = useCallback((element: HTMLElement | null) => {
    swipeElement.current = element
  }, [])

  // Manual trigger functions
  const triggerSwipe = useCallback((direction: keyof SwipeDirection) => {
    if (opts.enabledDirections[direction]) {
      opts.onSwipeComplete(direction)
    }
  }, [opts])

  return {
    // State
    ...state,
    
    // Control functions
    setSwipeElement,
    triggerSwipe,
    
    // Computed values
    isActive: state.isSwping,
    swipeStyle: {
      transform: state.direction && state.isSwping
        ? `translate${state.direction === 'left' || state.direction === 'right' ? 'X' : 'Y'}(${
            state.direction === 'left' || state.direction === 'up' ? '-' : ''
          }${state.distance}px)`
        : 'none',
      transition: state.isSwping ? 'none' : 'transform 0.2s ease-out'
    },
    
    // Configuration
    threshold: opts.threshold,
    maxDistance: opts.maxDistance,
    enabledDirections: opts.enabledDirections,
    
    // Utility functions
    reset: () => {
      setState({
        isSwping: false,
        direction: null,
        distance: 0,
        velocity: 0,
        progress: 0,
        canComplete: false
      })
      hasTriggeredHaptic.current = false
    }
  }
}

export default useSwipeNavigation
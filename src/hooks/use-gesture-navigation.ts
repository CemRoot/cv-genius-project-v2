'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface GestureOptions {
  threshold?: number
  velocity?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchZoom?: (scale: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  longPressDelay?: number
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useGestureNavigation(options: GestureOptions = {}) {
  const {
    threshold = 50,
    velocity = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchZoom,
    onDoubleTap,
    onLongPress,
    longPressDelay = 500
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialPinchDistanceRef = useRef<number | null>(null)
  
  const [isGesturing, setIsGesturing] = useState(false)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)

  // Calculate distance between two touch points
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const now = Date.now()
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }

    setIsGesturing(true)

    // Handle double tap
    if (now - lastTapRef.current < 300 && onDoubleTap) {
      onDoubleTap()
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
    }

    // Handle pinch zoom start
    if (e.touches.length === 2 && onPinchZoom) {
      initialPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1])
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress()
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }, longPressDelay)
    }
  }, [onDoubleTap, onPinchZoom, onLongPress, longPressDelay])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle pinch zoom
    if (e.touches.length === 2 && initialPinchDistanceRef.current && onPinchZoom) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialPinchDistanceRef.current
      onPinchZoom(scale)
    }
  }, [onPinchZoom])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const touch = e.changedTouches[0]
    const now = Date.now()
    
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time
    
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    // Calculate velocity
    const velocityX = absX / deltaTime
    const velocityY = absY / deltaTime
    
    // Determine swipe direction
    if (Math.max(absX, absY) > threshold && Math.max(velocityX, velocityY) > velocity) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          setCurrentGesture('swipeRight')
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          setCurrentGesture('swipeLeft')
          onSwipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          setCurrentGesture('swipeDown')
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          setCurrentGesture('swipeUp')
          onSwipeUp()
        }
      }
      
      // Haptic feedback for swipes
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      }
    }

    // Reset
    setIsGesturing(false)
    setCurrentGesture(null)
    touchStartRef.current = null
    touchEndRef.current = null
    initialPinchDistanceRef.current = null
  }, [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  // Set element ref
  const setElement = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      // Remove old listeners
      elementRef.current.removeEventListener('touchstart', handleTouchStart)
      elementRef.current.removeEventListener('touchmove', handleTouchMove)
      elementRef.current.removeEventListener('touchend', handleTouchEnd)
    }

    elementRef.current = element

    if (element) {
      // Add new listeners
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Cleanup
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    setElement,
    isGesturing,
    currentGesture
  }
}

// Preset gesture patterns
export function useCommonGestures() {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)

  const gestures = useGestureNavigation({
    onSwipeLeft: () => setCurrentPage(prev => prev + 1),
    onSwipeRight: () => setCurrentPage(prev => Math.max(0, prev - 1)),
    onPinchZoom: (scale) => setZoom(scale),
    onDoubleTap: () => setZoom(zoom === 1 ? 2 : 1),
    threshold: 30,
    velocity: 0.2
  })

  return {
    ...gestures,
    currentPage,
    zoom,
    resetZoom: () => setZoom(1)
  }
}
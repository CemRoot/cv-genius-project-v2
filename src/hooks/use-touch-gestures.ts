"use client"

import { useRef, useCallback, useEffect } from 'react'

export interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'longpress' | 'doubletap' | 'pan'
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  scale?: number
  velocity?: number
  duration?: number
  deltaX?: number
  deltaY?: number
  center?: TouchPoint
}

export interface TouchGestureOptions {
  swipeThreshold?: number
  swipeVelocityThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  pinchThreshold?: number
  panThreshold?: number
  preventDefault?: boolean
  enableHapticFeedback?: boolean
}

export interface TouchGestureHandlers {
  onSwipe?: (event: GestureEvent) => void
  onPinch?: (event: GestureEvent) => void
  onLongPress?: (event: GestureEvent) => void
  onDoubleTap?: (event: GestureEvent) => void
  onPan?: (event: GestureEvent) => void
  onTouchStart?: (event: TouchEvent) => void
  onTouchEnd?: (event: TouchEvent) => void
}

const defaultOptions: Required<TouchGestureOptions> = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1,
  panThreshold: 10,
  preventDefault: true,
  enableHapticFeedback: true,
}

export function useTouchGestures(
  handlers: TouchGestureHandlers = {},
  options: TouchGestureOptions = {}
) {
  const opts = { ...defaultOptions, ...options }
  const touchStart = useRef<TouchPoint[]>([])
  const touchCurrent = useRef<TouchPoint[]>([])
  const lastTap = useRef<TouchPoint | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)
  const isPanning = useRef(false)
  const initialDistance = useRef<number>(0)
  const currentDistance = useRef<number>(0)

  // Haptic feedback function
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!opts.enableHapticFeedback) return
    
    // Use native haptic feedback if available
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 20]
      }
      navigator.vibrate(patterns[intensity])
    }
  }, [opts.enableHapticFeedback])

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    )
  }, [])

  // Calculate velocity
  const getVelocity = useCallback((start: TouchPoint, end: TouchPoint): number => {
    const distance = getDistance(start, end)
    const timeDiff = end.timestamp - start.timestamp
    return timeDiff > 0 ? distance / timeDiff : 0
  }, [getDistance])

  // Get direction from swipe
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): 'left' | 'right' | 'up' | 'down' => {
    const deltaX = end.x - start.x
    const deltaY = end.y - start.y
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }, [])

  // Convert touch to point
  const touchToPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), [])

  // Get center point of multiple touches
  const getCenterPoint = useCallback((points: TouchPoint[]): TouchPoint => {
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length
    return { x, y, timestamp: Date.now() }
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault()
    }

    const touches = Array.from(event.touches).map(touchToPoint)
    touchStart.current = touches
    touchCurrent.current = touches
    isLongPress.current = false
    isPanning.current = false

    // Clear any existing long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // Handle double tap detection
    if (touches.length === 1) {
      const currentTap = touches[0]
      
      if (lastTap.current) {
        const timeDiff = currentTap.timestamp - lastTap.current.timestamp
        const distance = getDistance(lastTap.current, currentTap)
        
        if (timeDiff < opts.doubleTapDelay && distance < opts.swipeThreshold / 2) {
          // Double tap detected
          triggerHaptic('medium')
          handlers.onDoubleTap?.({
            type: 'doubletap',
            center: currentTap
          })
          lastTap.current = null
          return
        }
      }
      
      lastTap.current = currentTap
      
      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        if (!isPanning.current) {
          isLongPress.current = true
          triggerHaptic('heavy')
          handlers.onLongPress?.({
            type: 'longpress',
            center: currentTap
          })
        }
      }, opts.longPressDelay)
    }

    // Handle pinch start
    if (touches.length === 2) {
      initialDistance.current = getDistance(touches[0], touches[1])
      currentDistance.current = initialDistance.current
    }

    handlers.onTouchStart?.(event)
  }, [opts, handlers, touchToPoint, getDistance, triggerHaptic])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault()
    }

    const touches = Array.from(event.touches).map(touchToPoint)
    touchCurrent.current = touches

    if (touches.length === 1 && touchStart.current.length === 1) {
      const start = touchStart.current[0]
      const current = touches[0]
      const distance = getDistance(start, current)

      // Cancel long press if moved too much
      if (distance > opts.panThreshold && longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      // Handle pan gesture
      if (distance > opts.panThreshold && !isLongPress.current) {
        isPanning.current = true
        
        handlers.onPan?.({
          type: 'pan',
          deltaX: current.x - start.x,
          deltaY: current.y - start.y,
          distance,
          center: current
        })
      }
    }

    // Handle pinch gesture
    if (touches.length === 2 && touchStart.current.length === 2) {
      currentDistance.current = getDistance(touches[0], touches[1])
      const scale = currentDistance.current / initialDistance.current
      
      if (Math.abs(scale - 1) > opts.pinchThreshold) {
        handlers.onPinch?.({
          type: 'pinch',
          scale,
          center: getCenterPoint(touches)
        })
      }
    }
  }, [opts, handlers, touchToPoint, getDistance, getCenterPoint])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (opts.preventDefault) {
      event.preventDefault()
    }

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const touches = Array.from(event.changedTouches).map(touchToPoint)
    
    // Handle swipe detection
    if (touchStart.current.length === 1 && touches.length === 1 && !isLongPress.current && !isPanning.current) {
      const start = touchStart.current[0]
      const end = touches[0]
      const distance = getDistance(start, end)
      const velocity = getVelocity(start, end)

      if (distance > opts.swipeThreshold && velocity > opts.swipeVelocityThreshold) {
        const direction = getSwipeDirection(start, end)
        triggerHaptic('light')
        
        handlers.onSwipe?.({
          type: 'swipe',
          direction,
          distance,
          velocity,
          duration: end.timestamp - start.timestamp,
          deltaX: end.x - start.x,
          deltaY: end.y - start.y
        })
      }
    }

    // Reset state
    touchStart.current = []
    touchCurrent.current = []
    isPanning.current = false
    isLongPress.current = false

    handlers.onTouchEnd?.(event)
  }, [opts, handlers, touchToPoint, getDistance, getVelocity, getSwipeDirection, triggerHaptic])

  // Return touch event handlers
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    // Utility functions
    getCurrentTouches: () => touchCurrent.current,
    isGesturing: () => isPanning.current || isLongPress.current,
    triggerHaptic,
  }
}

export default useTouchGestures
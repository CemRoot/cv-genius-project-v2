'use client'

import { useRef, useEffect, ReactNode } from 'react'

interface TouchGestureProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (data: { scale: number; centerX: number; centerY: number }) => void
  onLongPress?: () => void
  onDoubleTap?: () => void
  onPan?: (data: { deltaX: number; deltaY: number; velocityX: number; velocityY: number }) => void
  threshold?: number
  className?: string
}

export function TouchGestureWrapper({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  onDoubleTap,
  onPan,
  threshold = 50,
  className = ''
}: TouchGestureProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const touchData = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTap: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    initialDistance: 0,
    lastMoveTime: 0,
    velocityX: 0,
    velocityY: 0
  })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const data = touchData.current

      data.startX = touch.clientX
      data.startY = touch.clientY
      data.startTime = Date.now()
      data.lastMoveTime = Date.now()

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        data.initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
      }

      // Long press detection
      if (onLongPress) {
        data.longPressTimer = setTimeout(() => {
          onLongPress()
        }, 500)
      }

      // Double tap detection
      if (onDoubleTap) {
        const now = Date.now()
        if (now - data.lastTap < 300) {
          onDoubleTap()
          data.lastTap = 0
        } else {
          data.lastTap = now
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const data = touchData.current
      
      // Clear long press if finger moves
      if (data.longPressTimer) {
        clearTimeout(data.longPressTimer)
        data.longPressTimer = null
      }

      const touch = e.touches[0]
      const deltaX = touch.clientX - data.startX
      const deltaY = touch.clientY - data.startY
      
      // Calculate velocity
      const now = Date.now()
      const timeDelta = now - data.lastMoveTime
      if (timeDelta > 0) {
        data.velocityX = deltaX / timeDelta
        data.velocityY = deltaY / timeDelta
        data.lastMoveTime = now
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch && data.initialDistance > 0) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
        const scale = currentDistance / data.initialDistance
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        
        onPinch({ scale, centerX, centerY })
        return
      }

      // Handle pan gesture
      if (onPan && e.touches.length === 1) {
        onPan({
          deltaX,
          deltaY,
          velocityX: data.velocityX,
          velocityY: data.velocityY
        })
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const data = touchData.current
      
      // Clear long press timer
      if (data.longPressTimer) {
        clearTimeout(data.longPressTimer)
        data.longPressTimer = null
      }

      if (e.touches.length > 0) return // Multi-touch, don't process swipe

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - data.startX
      const deltaY = touch.clientY - data.startY
      const deltaTime = Date.now() - data.startTime

      // Only process swipes if they're fast enough and long enough
      if (deltaTime < 300 && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }

      // Reset data
      data.initialDistance = 0
    }

    // Add event listeners with passive flag for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      if (touchData.current.longPressTimer) {
        clearTimeout(touchData.current.longPressTimer)
      }
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onLongPress, onDoubleTap, onPan, threshold])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
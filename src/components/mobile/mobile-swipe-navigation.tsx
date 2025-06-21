'use client'

import React from 'react'
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation'

interface MobileSwipeNavigationProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
  enableHaptic?: boolean
  preventScrolling?: boolean
  showIndicators?: boolean
}

export function MobileSwipeNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 80,
  className = '',
  enableHaptic = true,
  preventScrolling = false,
  showIndicators = true
}: MobileSwipeNavigationProps) {
  const {
    setSwipeElement,
    isActive,
    direction,
    progress,
    swipeStyle
  } = useSwipeNavigation({
    threshold,
    enableHapticFeedback: enableHaptic,
    preventScrolling,
    enabledDirections: {
      left: !!onSwipeLeft,
      right: !!onSwipeRight,
      up: !!onSwipeUp,
      down: !!onSwipeDown
    },
    onSwipeComplete: (dir) => {
      switch (dir) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }
    }
  })

  const getSwipeIndicatorStyle = () => {
    if (!isActive || !direction) return {}
    
    const baseStyle = {
      position: 'absolute' as const,
      background: 'rgba(139, 92, 246, 0.3)',
      borderRadius: '4px',
      transition: 'opacity 0.2s ease',
      opacity: progress
    }

    switch (direction) {
      case 'left':
        return {
          ...baseStyle,
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: `${Math.min(progress * 100, 80)}%`
        }
      case 'right':
        return {
          ...baseStyle,
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: `${Math.min(progress * 100, 80)}%`
        }
      case 'up':
        return {
          ...baseStyle,
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '4px',
          width: `${Math.min(progress * 100, 80)}%`
        }
      case 'down':
        return {
          ...baseStyle,
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '4px',
          width: `${Math.min(progress * 100, 80)}%`
        }
      default:
        return {}
    }
  }

  return (
    <div
      ref={setSwipeElement}
      className={`relative ${className}`}
      style={swipeStyle}
    >
      {children}
      
      {/* Swipe progress indicator */}
      {showIndicators && isActive && direction && (
        <div style={getSwipeIndicatorStyle()} />
      )}
      
      {/* Visual feedback for swipe zones */}
      {showIndicators && !isActive && (
        <>
          {onSwipeLeft && (
            <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
          )}
          {onSwipeRight && (
            <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
          )}
          {onSwipeUp && (
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
          )}
          {onSwipeDown && (
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
          )}
        </>
      )}
    </div>
  )
}

export default MobileSwipeNavigation
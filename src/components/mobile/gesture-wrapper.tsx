"use client"

import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'
import useTouchGestures, { TouchGestureHandlers, TouchGestureOptions } from '@/hooks/use-touch-gestures'

export interface GestureWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gestureHandlers?: TouchGestureHandlers
  gestureOptions?: TouchGestureOptions
  enableVisualFeedback?: boolean
  feedbackClassName?: string
  rippleEffect?: boolean
  hapticFeedback?: boolean
  disabled?: boolean
  as?: keyof JSX.IntrinsicElements
}

export interface GestureWrapperRef {
  triggerHaptic: (intensity?: 'light' | 'medium' | 'heavy') => void
  getCurrentTouches: () => any[]
  isGesturing: () => boolean
}

export const GestureWrapper = forwardRef<GestureWrapperRef, GestureWrapperProps>(
  ({
    children,
    gestureHandlers = {},
    gestureOptions = {},
    enableVisualFeedback = true,
    feedbackClassName = '',
    rippleEffect = false,
    hapticFeedback = true,
    disabled = false,
    as: Component = 'div',
    className,
    style,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const rippleRef = useRef<HTMLDivElement>(null)
    const isPressed = useRef(false)

    // Enhanced gesture handlers with visual feedback
    const enhancedHandlers: TouchGestureHandlers = {
      ...gestureHandlers,
      
      onTouchStart: (event) => {
        if (disabled) return
        
        isPressed.current = true
        
        // Add visual feedback
        if (enableVisualFeedback && elementRef.current) {
          elementRef.current.classList.add('gesture-active')
          if (feedbackClassName) {
            elementRef.current.classList.add(feedbackClassName)
          }
        }

        // Create ripple effect
        if (rippleEffect && elementRef.current && rippleRef.current) {
          const rect = elementRef.current.getBoundingClientRect()
          const touch = event.touches[0]
          const x = touch.clientX - rect.left
          const y = touch.clientY - rect.top
          
          const ripple = document.createElement('div')
          ripple.className = 'gesture-ripple'
          ripple.style.left = `${x}px`
          ripple.style.top = `${y}px`
          
          rippleRef.current.appendChild(ripple)
          
          // Remove ripple after animation
          setTimeout(() => {
            if (rippleRef.current?.contains(ripple)) {
              rippleRef.current.removeChild(ripple)
            }
          }, 600)
        }

        gestureHandlers.onTouchStart?.(event)
      },

      onTouchEnd: (event) => {
        if (disabled) return
        
        isPressed.current = false
        
        // Remove visual feedback
        if (enableVisualFeedback && elementRef.current) {
          elementRef.current.classList.remove('gesture-active')
          if (feedbackClassName) {
            elementRef.current.classList.remove(feedbackClassName)
          }
        }

        gestureHandlers.onTouchEnd?.(event)
      },

      onSwipe: (event) => {
        if (disabled) return
        gestureHandlers.onSwipe?.(event)
      },

      onPinch: (event) => {
        if (disabled) return
        gestureHandlers.onPinch?.(event)
      },

      onLongPress: (event) => {
        if (disabled) return
        
        // Add long press visual feedback
        if (enableVisualFeedback && elementRef.current) {
          elementRef.current.classList.add('gesture-longpress')
          setTimeout(() => {
            elementRef.current?.classList.remove('gesture-longpress')
          }, 300)
        }

        gestureHandlers.onLongPress?.(event)
      },

      onDoubleTap: (event) => {
        if (disabled) return
        
        // Add double tap visual feedback
        if (enableVisualFeedback && elementRef.current) {
          elementRef.current.classList.add('gesture-doubletap')
          setTimeout(() => {
            elementRef.current?.classList.remove('gesture-doubletap')
          }, 200)
        }

        gestureHandlers.onDoubleTap?.(event)
      },

      onPan: (event) => {
        if (disabled) return
        gestureHandlers.onPan?.(event)
      },
    }

    // Touch gesture hook with enhanced options
    const touchGestures = useTouchGestures(enhancedHandlers, {
      enableHapticFeedback: hapticFeedback,
      ...gestureOptions,
    })

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      triggerHaptic: touchGestures.triggerHaptic,
      getCurrentTouches: touchGestures.getCurrentTouches,
      isGesturing: touchGestures.isGesturing,
    }), [touchGestures])

    // Combined class names
    const combinedClassName = cn(
      'gesture-wrapper',
      {
        'gesture-disabled': disabled,
        'gesture-ripple-enabled': rippleEffect,
        'gesture-feedback-enabled': enableVisualFeedback,
      },
      className
    )

    return (
      <Component
        ref={elementRef}
        className={combinedClassName}
        style={{
          ...style,
          touchAction: disabled ? 'auto' : 'none',
          userSelect: disabled ? 'auto' : 'none',
          WebkitUserSelect: disabled ? 'auto' : 'none',
          WebkitTouchCallout: disabled ? 'auto' : 'none',
        }}
        {...touchGestures}
        {...props}
      >
        {children}
        
        {/* Ripple container */}
        {rippleEffect && (
          <div
            ref={rippleRef}
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
            aria-hidden="true"
          />
        )}
      </Component>
    )
  }
)

GestureWrapper.displayName = 'GestureWrapper'

export default GestureWrapper

// CSS-in-JS styles to be added to globals.css
export const gestureWrapperStyles = `
/* Gesture Wrapper Styles */
.gesture-wrapper {
  position: relative;
  transition: all 0.15s ease-out;
}

.gesture-wrapper.gesture-disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* Visual feedback states */
.gesture-wrapper.gesture-active {
  transform: scale(0.98);
  filter: brightness(0.95);
}

.gesture-wrapper.gesture-longpress {
  transform: scale(1.02);
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gesture-wrapper.gesture-doubletap {
  transform: scale(1.05);
  filter: brightness(1.05);
}

/* Ripple effect */
.gesture-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(10);
    opacity: 0.5;
  }
  100% {
    transform: scale(20);
    opacity: 0;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .gesture-wrapper.gesture-active {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .gesture-wrapper,
  .gesture-ripple {
    transition: none;
    animation: none;
  }
  
  .gesture-wrapper.gesture-active,
  .gesture-wrapper.gesture-longpress,
  .gesture-wrapper.gesture-doubletap {
    transform: none;
  }
}

/* Dark mode support */
.dark .gesture-ripple {
  background: rgba(255, 255, 255, 0.1);
}

/* Touch device specific styles */
@media (pointer: coarse) {
  .gesture-wrapper {
    /* Larger touch targets on touch devices */
    min-width: 44px;
    min-height: 44px;
  }
}
`
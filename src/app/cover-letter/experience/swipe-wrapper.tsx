'use client'

import { useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'

interface SwipeWrapperProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  enabled?: boolean
}

export function SwipeWrapper({ children, onSwipeLeft, onSwipeRight, enabled = true }: SwipeWrapperProps) {
  const constraintsRef = useRef(null)

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    
    if (info.offset.x > swipeThreshold && onSwipeRight) {
      onSwipeRight()
    } else if (info.offset.x < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft()
    }
  }

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <motion.div
      ref={constraintsRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
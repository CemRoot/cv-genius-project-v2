'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TouchGestureWrapper } from './touch-gesture-wrapper'

interface SwipeNavigationItem {
  id: string
  content: React.ReactNode
}

interface SwipeNavigationProps {
  items: SwipeNavigationItem[]
  currentIndex: number
  onIndexChange: (index: number) => void
  showIndicators?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
  containerClassName?: string
}

export function SwipeNavigation({
  items,
  currentIndex,
  onIndexChange,
  showIndicators = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  className = '',
  containerClassName = ''
}: SwipeNavigationProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % items.length
        onIndexChange(nextIndex)
      }, autoPlayInterval)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay, currentIndex, items.length, onIndexChange, autoPlayInterval, isDragging])

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    onIndexChange(prevIndex)
  }

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % items.length
    onIndexChange(nextIndex)
  }

  const handleSwipeLeft = () => {
    goToNext()
  }

  const handleSwipeRight = () => {
    goToPrevious()
  }

  const handlePan = ({ deltaX }: { deltaX: number }) => {
    setIsDragging(true)
    setDragOffset(deltaX)
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false)
    setDragOffset(0)

    const threshold = 100
    const velocity = info.velocity.x

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 || velocity > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      <TouchGestureWrapper
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onPan={handlePan}
        className="h-full"
      >
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={`absolute inset-0 ${className}`}
              style={{
                x: dragOffset
              }}
            >
              {items[currentIndex]?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </TouchGestureWrapper>

      {/* Navigation Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 touch-manipulation"
            aria-label="Previous item"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 touch-manipulation"
            aria-label="Next item"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 touch-manipulation ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar for auto-play */}
      {autoPlay && !isDragging && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <motion.div
            className="h-full bg-white"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
            key={currentIndex}
          />
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface MasonryItem {
  id: string
  content: React.ReactNode
  height?: number // Optional fixed height
}

interface MobileMasonryLayoutProps {
  items: MasonryItem[]
  columns?: number
  gap?: number
  className?: string
  itemClassName?: string
  animated?: boolean
}

export function MobileMasonryLayout({ 
  items, 
  columns = 2, 
  gap = 16,
  className = '',
  itemClassName = '',
  animated = true
}: MobileMasonryLayoutProps) {
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const [itemPositions, setItemPositions] = useState<Array<{x: number, y: number}>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const columnWidth = (containerWidth - (gap * (columns - 1))) / columns
      const heights = new Array(columns).fill(0)
      const positions: Array<{x: number, y: number}> = []

      items.forEach((item, index) => {
        // Find the shortest column
        const shortestColumnIndex = heights.indexOf(Math.min(...heights))
        const x = shortestColumnIndex * (columnWidth + gap)
        const y = heights[shortestColumnIndex]

        positions.push({ x, y })

        // Get item height
        const itemElement = itemRefs.current[index]
        const itemHeight = item.height || (itemElement ? itemElement.offsetHeight : 200)

        // Update column height
        heights[shortestColumnIndex] += itemHeight + gap
      })

      setColumnHeights(heights)
      setItemPositions(positions)
    }

    // Calculate layout after items render
    const timer = setTimeout(calculateLayout, 100)
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateLayout)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateLayout)
    }
  }, [items, columns, gap])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animated ? 0.1 : 0
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }

  const containerHeight = Math.max(...columnHeights) - gap

  return (
    <motion.div 
      ref={containerRef}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
      className={`relative w-full ${className}`}
      style={{ height: containerHeight > 0 ? containerHeight : 'auto' }}
    >
      {items.map((item, index) => {
        const position = itemPositions[index]
        
        return (
          <motion.div
            key={item.id}
            ref={el => itemRefs.current[index] = el}
            variants={animated ? itemVariants : undefined}
            className={`absolute w-full ${itemClassName}`}
            style={{
              left: position?.x || 0,
              top: position?.y || 0,
              width: `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)`,
              transform: animated ? undefined : `translate3d(${position?.x || 0}px, ${position?.y || 0}px, 0)`
            }}
          >
            {item.content}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
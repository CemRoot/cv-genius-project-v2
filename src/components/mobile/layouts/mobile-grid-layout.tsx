'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GridItem {
  id: string
  content: React.ReactNode
  span?: number // How many columns this item should span
  rowSpan?: number // How many rows this item should span
  minHeight?: string
}

interface MobileGridLayoutProps {
  items: GridItem[]
  columns?: number
  gap?: number
  className?: string
  itemClassName?: string
  animated?: boolean
}

export function MobileGridLayout({ 
  items, 
  columns = 2, 
  gap = 4,
  className = '',
  itemClassName = '',
  animated = true
}: MobileGridLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  if (!mounted) {
    return (
      <div className={`grid grid-cols-${columns} gap-${gap} ${className}`}>
        {items.map(item => (
          <div 
            key={item.id}
            className={`
              ${item.span ? `col-span-${Math.min(item.span, columns)}` : 'col-span-1'}
              ${item.rowSpan ? `row-span-${item.rowSpan}` : ''}
              ${itemClassName}
            `}
            style={{ minHeight: item.minHeight }}
          >
            {item.content}
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div 
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={animated ? itemVariants : undefined}
          className={`
            ${item.span ? `col-span-${Math.min(item.span, columns)}` : 'col-span-1'}
            ${item.rowSpan ? `row-span-${item.rowSpan}` : ''}
            ${itemClassName}
          `}
          style={{ 
            minHeight: item.minHeight,
            gridColumn: item.span ? `span ${Math.min(item.span, columns)}` : undefined,
            gridRow: item.rowSpan ? `span ${item.rowSpan}` : undefined
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  )
}
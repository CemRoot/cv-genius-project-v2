'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxLayer {
  id: string
  content: React.ReactNode
  speed?: number // Parallax speed multiplier (0-1, where 0 is static)
  zIndex?: number
  className?: string
}

interface MobileParallaxLayoutProps {
  layers: ParallaxLayer[]
  height?: string
  className?: string
}

export function MobileParallaxLayout({ 
  layers, 
  height = '100vh',
  className = '' 
}: MobileParallaxLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {layers
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map(layer => {
          const speed = layer.speed ?? 0.5
          const y = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -(containerHeight * speed)]
          )

          return (
            <motion.div
              key={layer.id}
              style={{ 
                y: speed > 0 ? y : undefined,
                zIndex: layer.zIndex || 0
              }}
              className={`absolute inset-0 ${layer.className || ''}`}
            >
              {layer.content}
            </motion.div>
          )
        })}
    </div>
  )
}

// Helper component for creating parallax backgrounds
interface ParallaxBackgroundProps {
  src: string
  alt?: string
  className?: string
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
}

export function ParallaxBackground({ 
  src, 
  alt = 'Background', 
  className = '',
  overlay = false,
  overlayColor = 'bg-black',
  overlayOpacity = 0.4
}: ParallaxBackgroundProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
      />
      {overlay && (
        <div 
          className={`absolute inset-0 ${overlayColor}`}
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  )
}

// Helper component for parallax content sections
interface ParallaxContentProps {
  children: React.ReactNode
  className?: string
  centered?: boolean
}

export function ParallaxContent({ 
  children, 
  className = '',
  centered = false 
}: ParallaxContentProps) {
  return (
    <div className={`
      w-full h-full 
      ${centered ? 'flex items-center justify-center' : ''}
      ${className}
    `}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  )
}
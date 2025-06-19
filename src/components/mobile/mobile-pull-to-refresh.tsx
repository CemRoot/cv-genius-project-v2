'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  className?: string
}

export function MobilePullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 60,
  className = '' 
}: MobilePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setIsAtTop(containerRef.current.scrollTop === 0)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleDragStart = () => {
    if (!isAtTop || isRefreshing) return false
  }

  const handleDrag = (_: any, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return
    
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, threshold * 1.5))
    }
  }

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return
    
    if (info.offset.y > threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
  }

  const refreshProgress = Math.min(pullDistance / threshold, 1)
  const showRefreshIcon = pullDistance > 20

  return (
    <motion.div
      ref={containerRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`relative overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      {/* Pull to refresh indicator */}
      <motion.div
        initial={false}
        animate={{
          y: isRefreshing ? 0 : Math.max(0, pullDistance - 40),
          opacity: showRefreshIcon ? 1 : 0
        }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full shadow-lg p-3 border"
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : refreshProgress * 180
          }}
          transition={{
            rotate: isRefreshing 
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : { duration: 0.2 }
          }}
        >
          <RefreshCw 
            className={`h-5 w-5 ${
              refreshProgress >= 1 ? 'text-green-500' : 'text-gray-400'
            }`} 
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? 60 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Loading overlay */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent flex items-center justify-center"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Refreshing...
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
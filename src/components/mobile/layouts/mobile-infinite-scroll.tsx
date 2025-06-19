'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollItem {
  id: string
  content: React.ReactNode
}

interface MobileInfiniteScrollProps<T = any> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loadMore: () => Promise<T[]>
  hasMore: boolean
  loading?: boolean
  threshold?: number // Distance from bottom to trigger load
  className?: string
  itemClassName?: string
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  onError?: (error: Error) => void
}

export function MobileInfiniteScroll<T = any>({ 
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  threshold = 200,
  className = '',
  itemClassName = '',
  loadingComponent,
  emptyComponent,
  errorComponent,
  onError
}: MobileInfiniteScrollProps<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore || loading) return

    try {
      setIsLoading(true)
      setError(null)
      await loadMore()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more items')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loading, loadMore, onError])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < threshold && hasMore && !isLoading && !loading) {
        handleLoadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [threshold, hasMore, isLoading, loading, handleLoadMore])

  // Intersection Observer for loading trigger
  useEffect(() => {
    if (!loadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !loading) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadingRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loading, handleLoadMore])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  if (items.length === 0 && !loading && !isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-40 ${className}`}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>No items to display</p>
          </div>
        )}
      </div>
    )
  }

  if (error && errorComponent) {
    return (
      <div className={`flex items-center justify-center min-h-40 ${className}`}>
        {errorComponent}
      </div>
    )
  }

  return (
    <motion.div 
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`h-full overflow-y-auto ${className}`}
    >
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={`item-${index}`}
              variants={itemVariants}
              layout
              className={itemClassName}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading trigger element */}
        <div ref={loadingRef} className="h-1" />

        {/* Loading indicator */}
        <AnimatePresence>
          {(isLoading || loading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center py-4"
            >
              {loadingComponent || (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* End of list indicator */}
        {!hasMore && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 text-gray-500 text-sm"
          >
            You've reached the end
          </motion.div>
        )}

        {/* Error indicator */}
        {error && !errorComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <p className="text-red-600 text-sm mb-2">Failed to load more items</p>
            <button
              onClick={handleLoadMore}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
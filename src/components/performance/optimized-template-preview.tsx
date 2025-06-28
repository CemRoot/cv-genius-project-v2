'use client'

import { memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LazyImage } from './lazy-load'
import { debounce } from '@/lib/performance'
import { getOptimizedImageSrc } from '@/lib/performance'

interface OptimizedTemplatePreviewProps {
  templateId: string
  templateName: string
  templateImage?: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

// Memoized template preview for performance
export const OptimizedTemplatePreview = memo(function OptimizedTemplatePreview({
  templateId,
  templateName,
  templateImage,
  isSelected,
  onClick,
  className
}: OptimizedTemplatePreviewProps) {
  // Debounced click handler
  const handleClick = useCallback(
    debounce(() => {
      onClick?.()
    }, 300),
    [onClick]
  )

  // Optimized image source
  const optimizedSrc = useMemo(() => {
    if (!templateImage) return ''
    return getOptimizedImageSrc(templateImage, {
      width: 400,
      quality: 85,
      format: 'webp'
    })
  }, [templateImage])

  // Generate blur placeholder
  const blurDataURL = useMemo(() => {
    // This would be generated during build time in production
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...' // Truncated for brevity
  }, [])

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer rounded-lg overflow-hidden',
        'border-2 transition-all duration-200',
        isSelected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20' 
          : 'border-gray-200 hover:border-gray-300',
        className
      )}
    >
      {templateImage ? (
        <LazyImage
          src={optimizedSrc}
          alt={templateName}
          className="w-full h-full object-cover"
          blurDataURL={blurDataURL}
        />
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 p-4">
          <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
            {/* Skeleton template preview */}
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
            <div className="pt-4 space-y-1.5">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-2 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${85 - i * 5}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}

      {/* Template name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <h4 className="text-white font-medium text-sm truncate">
          {templateName}
        </h4>
      </div>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.templateId === nextProps.templateId &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.templateName === nextProps.templateName &&
    prevProps.templateImage === nextProps.templateImage
  )
})

// Virtualized template grid for large lists
interface OptimizedTemplateGridProps {
  templates: Array<{
    id: string
    name: string
    image?: string
  }>
  selectedId?: string
  onSelect?: (id: string) => void
  columns?: number
  gap?: number
}

export function OptimizedTemplateGrid({
  templates,
  selectedId,
  onSelect,
  columns = 3,
  gap = 16
}: OptimizedTemplateGridProps) {
  const handleSelect = useCallback((id: string) => {
    onSelect?.(id)
  }, [onSelect])

  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {templates.map((template) => (
        <OptimizedTemplatePreview
          key={template.id}
          templateId={template.id}
          templateName={template.name}
          templateImage={template.image}
          isSelected={selectedId === template.id}
          onClick={() => handleSelect(template.id)}
        />
      ))}
    </div>
  )
}
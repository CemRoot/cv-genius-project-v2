'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/use-responsive'
import { Loader2 } from 'lucide-react'

interface ResponsiveImageProps {
  src: string | {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  alt: string
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  width?: number
  height?: number
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto'
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  lazy?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  className,
  priority = false,
  quality = 75,
  fill = false,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  lazy = true,
  placeholder,
  blurDataURL,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const { breakpoint, deviceCategory } = useResponsive()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Get responsive src
  const currentSrc = typeof src === 'string' 
    ? src 
    : src[breakpoint] || src.xl || src.lg || src.md || src.sm || src.xs || ''

  // Responsive quality based on device
  const responsiveQuality = {
    mobile: 60,
    tablet: 70,
    desktop: quality
  }[deviceCategory]

  // Aspect ratio classes
  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-4/3',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
    'auto': ''
  }[aspectRatio]

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    onError?.()
  }

  if (error) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          aspectRatioClass,
          className
        )}
      >
        <div className="text-gray-400 text-center p-4">
          <svg 
            className="w-12 h-12 mx-auto mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  const imageProps = fill 
    ? { fill: true }
    : { width: width || 800, height: height || 600 }

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <Image
        {...imageProps}
        src={currentSrc}
        alt={alt}
        quality={responsiveQuality}
        priority={priority}
        loading={lazy ? 'lazy' : 'eager'}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          fill && `object-${objectFit}`
        )}
      />
    </div>
  )
}

// Picture element for art direction
interface ResponsivePictureProps {
  sources: Array<{
    media: string
    srcSet: string
    type?: string
  }>
  fallback: {
    src: string
    alt: string
  }
  className?: string
  loading?: 'lazy' | 'eager'
}

export function ResponsivePicture({
  sources,
  fallback,
  className,
  loading = 'lazy'
}: ResponsivePictureProps) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source 
          key={index}
          media={source.media}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img 
        src={fallback.src} 
        alt={fallback.alt}
        loading={loading}
        className="w-full h-auto"
      />
    </picture>
  )
}

// Background image component
interface ResponsiveBackgroundProps {
  src: string | Record<string, string>
  children: React.ReactNode
  className?: string
  overlay?: boolean
  overlayOpacity?: number
  parallax?: boolean
}

export function ResponsiveBackground({
  src,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
  parallax = false
}: ResponsiveBackgroundProps) {
  const { breakpoint } = useResponsive()
  const [offset, setOffset] = useState(0)

  const currentSrc = typeof src === 'string' 
    ? src 
    : src[breakpoint] || src.xl || src.lg || src.md || src.sm || src.xs || ''

  useEffect(() => {
    if (!parallax) return

    const handleScroll = () => {
      setOffset(window.scrollY * 0.5)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [parallax])

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundImage: `url(${currentSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(parallax && {
          transform: `translateY(${offset}px)`
        })
      }}
    >
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
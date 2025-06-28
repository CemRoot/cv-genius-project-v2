'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  breakpoints, 
  Breakpoint, 
  getDeviceCategory, 
  getActiveBreakpoint,
  getResponsiveValue,
  Orientation,
  getOrientation,
  type ResponsiveValue
} from '@/lib/responsive'

interface ResponsiveInfo {
  width: number
  height: number
  breakpoint: Breakpoint
  deviceCategory: 'mobile' | 'tablet' | 'desktop'
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
}

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Initial dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Set initial dimensions
    updateDimensions()

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateDimensions, 150)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  const info = useMemo((): ResponsiveInfo => {
    const { width, height } = dimensions
    const breakpoint = getActiveBreakpoint(width)
    const deviceCategory = getDeviceCategory(width)
    const orientation = getOrientation(width, height)

    return {
      width,
      height,
      breakpoint,
      deviceCategory,
      orientation,
      isMobile: deviceCategory === 'mobile',
      isTablet: deviceCategory === 'tablet',
      isDesktop: deviceCategory === 'desktop',
      isXs: width >= breakpoints.xs,
      isSm: width >= breakpoints.sm,
      isMd: width >= breakpoints.md,
      isLg: width >= breakpoints.lg,
      isXl: width >= breakpoints.xl,
      is2xl: width >= breakpoints['2xl']
    }
  }, [dimensions])

  return info
}

// Hook for responsive values
export function useResponsiveValue<T>(
  value: ResponsiveValue<T>
): T | undefined {
  const { breakpoint } = useResponsive()
  return getResponsiveValue(value, breakpoint)
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (try modern API first, fallback to legacy)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

// Preset media queries
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`
  return useMediaQuery(query)
}

// Hook for adaptive layouts
interface AdaptiveLayoutOptions<T> {
  mobile: T
  tablet: T
  desktop: T
}

export function useAdaptiveLayout<T>(
  options: AdaptiveLayoutOptions<T>
): T {
  const { deviceCategory } = useResponsive()
  return options[deviceCategory]
}

// Hook for responsive class names
export function useResponsiveClasses(
  classes: ResponsiveValue<string>
): string {
  const value = useResponsiveValue(classes)
  return value || ''
}

// Hook for container queries (when supported)
export function useContainerQuery(
  containerRef: React.RefObject<HTMLElement>,
  query: string
): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Check if Container Queries are supported
    if (!('ResizeObserver' in window)) {
      return
    }

    const container = containerRef.current
    const checkQuery = () => {
      // For now, use ResizeObserver as a fallback
      // In the future, use native container queries when widely supported
      const { width } = container.getBoundingClientRect()
      
      // Parse simple width queries
      const match = query.match(/\(min-width:\s*(\d+)px\)/)
      if (match) {
        const minWidth = parseInt(match[1])
        setMatches(width >= minWidth)
      }
    }

    const observer = new ResizeObserver(checkQuery)
    observer.observe(container)
    checkQuery() // Initial check

    return () => {
      observer.disconnect()
    }
  }, [containerRef, query])

  return matches
}

// Hook for responsive grid
interface ResponsiveGridOptions {
  minItemWidth: number
  gap?: number
  maxColumns?: number
}

export function useResponsiveGrid(
  options: ResponsiveGridOptions
): {
  columns: number
  itemWidth: string
} {
  const { width } = useResponsive()
  const { minItemWidth, gap = 16, maxColumns = Infinity } = options

  const columns = useMemo(() => {
    const availableWidth = width - gap
    const possibleColumns = Math.floor(availableWidth / (minItemWidth + gap))
    return Math.max(1, Math.min(possibleColumns, maxColumns))
  }, [width, minItemWidth, gap, maxColumns])

  const itemWidth = useMemo(() => {
    const totalGaps = gap * (columns - 1)
    const availableWidth = width - totalGaps
    return `${Math.floor(availableWidth / columns)}px`
  }, [width, columns, gap])

  return { columns, itemWidth }
}

// Hook for responsive image loading
export function useResponsiveImage(
  sources: ResponsiveValue<string>
): string {
  const src = useResponsiveValue(sources)
  return src || ''
}

// Hook for viewport units with fallback
export function useViewportUnits() {
  const { width, height } = useResponsive()

  return {
    vw: (percentage: number) => (width * percentage) / 100,
    vh: (percentage: number) => (height * percentage) / 100,
    vmin: (percentage: number) => (Math.min(width, height) * percentage) / 100,
    vmax: (percentage: number) => (Math.max(width, height) * percentage) / 100
  }
}
'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/use-responsive'
import { getContainerWidth } from '@/lib/responsive'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fluid?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  center?: boolean
}

export function ResponsiveContainer({
  children,
  className,
  fluid = false,
  maxWidth = '2xl',
  padding = true,
  center = true
}: ResponsiveContainerProps) {
  const { breakpoint, isMobile, isTablet } = useResponsive()

  // Responsive padding values
  const paddingClass = padding ? {
    mobile: 'px-4',
    tablet: 'px-6',
    desktop: 'px-8'
  }[isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'] : ''

  // Max width class
  const maxWidthClass = fluid ? 'max-w-full' : {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  }[maxWidth]

  return (
    <div
      className={cn(
        'w-full',
        paddingClass,
        maxWidthClass,
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive grid container
interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number
}

export function ResponsiveGrid({
  children,
  className,
  cols = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6
  },
  gap = 4
}: ResponsiveGridProps) {
  const { breakpoint } = useResponsive()
  
  // Get current column count
  const currentCols = cols[breakpoint] || 1

  // Generate grid template columns
  const gridTemplateColumns = `repeat(${currentCols}, minmax(0, 1fr))`
  
  // Gap classes
  const gapClass = `gap-${gap}`

  return (
    <div
      className={cn('grid', gapClass, className)}
      style={{ gridTemplateColumns }}
    >
      {children}
    </div>
  )
}

// Responsive stack component
interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal' | 'responsive'
  gap?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export function ResponsiveStack({
  children,
  className,
  direction = 'responsive',
  gap = 4,
  align = 'stretch',
  justify = 'start'
}: ResponsiveStackProps) {
  const { isMobile } = useResponsive()

  // Direction classes
  const directionClass = direction === 'responsive'
    ? isMobile ? 'flex-col' : 'flex-row'
    : direction === 'vertical' ? 'flex-col' : 'flex-row'

  // Alignment classes
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }[align]

  // Justify classes
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }[justify]

  // Gap class
  const gapClass = `gap-${gap}`

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        alignClass,
        justifyClass,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  )
}

// Show/hide based on breakpoints
interface ResponsiveShowProps {
  children: ReactNode
  above?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  below?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  only?: 'mobile' | 'tablet' | 'desktop'
}

export function ResponsiveShow({
  children,
  above,
  below,
  only
}: ResponsiveShowProps) {
  const responsive = useResponsive()

  // Check if should show based on breakpoint
  let shouldShow = true

  if (above) {
    const breakpointMap = {
      xs: responsive.isXs,
      sm: responsive.isSm,
      md: responsive.isMd,
      lg: responsive.isLg,
      xl: responsive.isXl,
      '2xl': responsive.is2xl
    }
    shouldShow = shouldShow && breakpointMap[above]
  }

  if (below) {
    const breakpointMap = {
      xs: !responsive.isXs,
      sm: !responsive.isSm,
      md: !responsive.isMd,
      lg: !responsive.isLg,
      xl: !responsive.isXl,
      '2xl': !responsive.is2xl
    }
    shouldShow = shouldShow && breakpointMap[below]
  }

  if (only) {
    const deviceMap = {
      mobile: responsive.isMobile,
      tablet: responsive.isTablet,
      desktop: responsive.isDesktop
    }
    shouldShow = shouldShow && deviceMap[only]
  }

  return shouldShow ? <>{children}</> : null
}
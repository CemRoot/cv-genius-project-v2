'use client'

// Responsive breakpoints matching Tailwind CSS
export const breakpoints = {
  xs: 475,    // Extra small devices
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices
  '2xl': 1536 // 2X large devices
} as const

export type Breakpoint = keyof typeof breakpoints

// Device categories based on breakpoints
export const deviceCategories = {
  mobile: { min: 0, max: breakpoints.sm - 1 },
  tablet: { min: breakpoints.sm, max: breakpoints.lg - 1 },
  desktop: { min: breakpoints.lg, max: Infinity }
} as const

// Responsive utility functions
export function getDeviceCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < breakpoints.sm) return 'mobile'
  if (width < breakpoints.lg) return 'tablet'
  return 'desktop'
}

export function isBreakpointActive(breakpoint: Breakpoint, width: number): boolean {
  return width >= breakpoints[breakpoint]
}

export function getActiveBreakpoint(width: number): Breakpoint {
  const entries = Object.entries(breakpoints).reverse() as [Breakpoint, number][]
  
  for (const [key, value] of entries) {
    if (width >= value) return key
  }
  
  return 'xs'
}

// Responsive value helpers
type ResponsiveValue<T> = T | {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: Breakpoint
): T | undefined {
  if (typeof value !== 'object' || value === null) {
    return value as T
  }

  const responsiveValue = value as Record<Breakpoint, T>
  const breakpointKeys = Object.keys(breakpoints) as Breakpoint[]
  const currentIndex = breakpointKeys.indexOf(breakpoint)

  // Find the value for current or nearest smaller breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpointKeys[i]
    if (key in responsiveValue) {
      return responsiveValue[key]
    }
  }

  return undefined
}

// CSS-in-JS responsive helper
export function responsive<T>(values: ResponsiveValue<T>): string {
  if (typeof values !== 'object' || values === null) {
    return String(values)
  }

  const styles: string[] = []
  
  Object.entries(values).forEach(([key, value]) => {
    const breakpoint = key as Breakpoint
    const minWidth = breakpoints[breakpoint]
    
    if (minWidth === 0) {
      styles.push(String(value))
    } else {
      styles.push(`@media (min-width: ${minWidth}px) { ${String(value)} }`)
    }
  })

  return styles.join('\n')
}

// Touch target size helper
export function getTouchTargetSize(deviceCategory: 'mobile' | 'tablet' | 'desktop'): number {
  switch (deviceCategory) {
    case 'mobile':
      return 44 // iOS minimum
    case 'tablet':
      return 40 // Slightly smaller for tablets
    case 'desktop':
      return 32 // Desktop with mouse
  }
}

// Font size scaling
export function getResponsiveFontSize(
  baseSizePx: number,
  deviceCategory: 'mobile' | 'tablet' | 'desktop'
): string {
  const scales = {
    mobile: 0.875,  // 87.5% of base
    tablet: 0.9375, // 93.75% of base
    desktop: 1      // 100% of base
  }

  const scaledSize = baseSizePx * scales[deviceCategory]
  return `${scaledSize}px`
}

// Spacing scale
export function getResponsiveSpacing(
  baseSpacing: number,
  deviceCategory: 'mobile' | 'tablet' | 'desktop'
): number {
  const scales = {
    mobile: 0.75,   // More compact on mobile
    tablet: 0.875,  // Slightly compact on tablet
    desktop: 1      // Full spacing on desktop
  }

  return Math.round(baseSpacing * scales[deviceCategory])
}

// Grid columns helper
export function getResponsiveColumns(width: number): number {
  if (width < breakpoints.sm) return 1  // Mobile: single column
  if (width < breakpoints.md) return 2  // Small tablet: 2 columns
  if (width < breakpoints.lg) return 3  // Large tablet: 3 columns
  if (width < breakpoints.xl) return 4  // Desktop: 4 columns
  return 6 // Large desktop: 6 columns
}

// Container width helper
export function getContainerWidth(breakpoint: Breakpoint): string {
  const widths: Record<Breakpoint, string> = {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }

  return widths[breakpoint]
}

// Orientation helper
export type Orientation = 'portrait' | 'landscape'

export function getOrientation(width: number, height: number): Orientation {
  return height > width ? 'portrait' : 'landscape'
}

// Safe area insets for mobile devices
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0')
  }
}
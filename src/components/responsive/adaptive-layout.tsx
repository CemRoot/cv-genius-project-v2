'use client'

import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/use-responsive'

interface AdaptiveLayoutProps {
  mobile: ReactNode
  tablet?: ReactNode
  desktop: ReactNode
}

export function AdaptiveLayout({ mobile, tablet, desktop }: AdaptiveLayoutProps) {
  const { deviceCategory } = useResponsive()

  switch (deviceCategory) {
    case 'mobile':
      return <>{mobile}</>
    case 'tablet':
      return <>{tablet || desktop}</>
    case 'desktop':
      return <>{desktop}</>
  }
}

// Conditional rendering based on device
interface DeviceOnlyProps {
  children: ReactNode
  devices: Array<'mobile' | 'tablet' | 'desktop'>
}

export function DeviceOnly({ children, devices }: DeviceOnlyProps) {
  const { deviceCategory } = useResponsive()
  
  if (devices.includes(deviceCategory)) {
    return <>{children}</>
  }
  
  return null
}

// Responsive component wrapper
interface ResponsiveWrapperProps<T> {
  mobile: React.ComponentType<T>
  tablet?: React.ComponentType<T>
  desktop: React.ComponentType<T>
  props: T
}

export function ResponsiveWrapper<T>({ 
  mobile: MobileComponent, 
  tablet: TabletComponent, 
  desktop: DesktopComponent,
  props 
}: ResponsiveWrapperProps<T>) {
  const { deviceCategory } = useResponsive()

  switch (deviceCategory) {
    case 'mobile':
      return <MobileComponent {...props} />
    case 'tablet':
      return TabletComponent ? <TabletComponent {...props} /> : <DesktopComponent {...props} />
    case 'desktop':
      return <DesktopComponent {...props} />
  }
}

// Orientation-based layout
interface OrientationLayoutProps {
  portrait: ReactNode
  landscape: ReactNode
}

export function OrientationLayout({ portrait, landscape }: OrientationLayoutProps) {
  const { orientation } = useResponsive()
  
  return <>{orientation === 'portrait' ? portrait : landscape}</>
}

// Breakpoint-specific styles
interface BreakpointStylesProps {
  children: ReactNode
  className?: string
  xs?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
  '2xl'?: string
}

export function BreakpointStyles({ 
  children, 
  className = '',
  xs,
  sm,
  md,
  lg,
  xl,
  '2xl': xxl
}: BreakpointStylesProps) {
  const responsive = useResponsive()
  
  // Build class string based on active breakpoints
  const classes = [className]
  
  if (xs && responsive.isXs) classes.push(xs)
  if (sm && responsive.isSm) classes.push(sm)
  if (md && responsive.isMd) classes.push(md)
  if (lg && responsive.isLg) classes.push(lg)
  if (xl && responsive.isXl) classes.push(xl)
  if (xxl && responsive.is2xl) classes.push(xxl)
  
  return (
    <div className={classes.join(' ')}>
      {children}
    </div>
  )
}

// Safe area wrapper for mobile
interface SafeAreaWrapperProps {
  children: ReactNode
  className?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export function SafeAreaWrapper({
  children,
  className = '',
  top = true,
  bottom = true,
  left = true,
  right = true
}: SafeAreaWrapperProps) {
  const { isMobile } = useResponsive()
  
  if (!isMobile) {
    return <div className={className}>{children}</div>
  }
  
  const safeAreaClasses = []
  if (top) safeAreaClasses.push('pt-safe')
  if (bottom) safeAreaClasses.push('pb-safe')
  if (left) safeAreaClasses.push('pl-safe')
  if (right) safeAreaClasses.push('pr-safe')
  
  return (
    <div className={`${className} ${safeAreaClasses.join(' ')}`}>
      {children}
    </div>
  )
}
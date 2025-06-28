'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive'
import { getResponsiveFontSize } from '@/lib/responsive'

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
type TextWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
type TextAlign = 'left' | 'center' | 'right' | 'justify'

interface ResponsiveTextProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: TextSize | {
    xs?: TextSize
    sm?: TextSize
    md?: TextSize
    lg?: TextSize
    xl?: TextSize
    '2xl'?: TextSize
  }
  weight?: TextWeight | {
    xs?: TextWeight
    sm?: TextWeight
    md?: TextWeight
    lg?: TextWeight
    xl?: TextWeight
    '2xl'?: TextWeight
  }
  align?: TextAlign | {
    xs?: TextAlign
    sm?: TextAlign
    md?: TextAlign
    lg?: TextAlign
    xl?: TextAlign
    '2xl'?: TextAlign
  }
  className?: string
  lineClamp?: number
  truncate?: boolean
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl'
}

const weightClasses: Record<TextWeight, string> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
}

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
}

export function ResponsiveText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  align = 'left',
  className,
  lineClamp,
  truncate = false
}: ResponsiveTextProps) {
  const currentSize = useResponsiveValue(size) || 'base'
  const currentWeight = useResponsiveValue(weight) || 'normal'
  const currentAlign = useResponsiveValue(align) || 'left'

  const lineClampClass = lineClamp 
    ? `line-clamp-${lineClamp}` 
    : truncate 
    ? 'truncate' 
    : ''

  return (
    <Component
      className={cn(
        sizeClasses[currentSize],
        weightClasses[currentWeight],
        alignClasses[currentAlign],
        lineClampClass,
        className
      )}
    >
      {children}
    </Component>
  )
}

// Responsive heading component with semantic defaults
interface ResponsiveHeadingProps {
  children: ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  responsive?: boolean
}

export function ResponsiveHeading({
  children,
  level,
  className,
  responsive = true
}: ResponsiveHeadingProps) {
  const { deviceCategory } = useResponsive()
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements

  // Default responsive sizes based on heading level
  const defaultSizes = {
    1: { mobile: '3xl', tablet: '4xl', desktop: '5xl' },
    2: { mobile: '2xl', tablet: '3xl', desktop: '4xl' },
    3: { mobile: 'xl', tablet: '2xl', desktop: '3xl' },
    4: { mobile: 'lg', tablet: 'xl', desktop: '2xl' },
    5: { mobile: 'base', tablet: 'lg', desktop: 'xl' },
    6: { mobile: 'sm', tablet: 'base', desktop: 'lg' }
  }

  const size = responsive 
    ? defaultSizes[level][deviceCategory] as TextSize
    : defaultSizes[level].desktop as TextSize

  return (
    <ResponsiveText
      as={Component as any}
      size={size}
      weight="bold"
      className={className}
    >
      {children}
    </ResponsiveText>
  )
}

// Responsive paragraph with optimized line height
interface ResponsiveParagraphProps {
  children: ReactNode
  className?: string
  lead?: boolean
  small?: boolean
}

export function ResponsiveParagraph({
  children,
  className,
  lead = false,
  small = false
}: ResponsiveParagraphProps) {
  const { deviceCategory } = useResponsive()
  
  const size = small ? 'sm' : lead ? 'lg' : 'base'
  const lineHeight = lead ? 'leading-relaxed' : 'leading-normal'
  
  // Responsive line length for readability
  const maxWidth = {
    mobile: 'max-w-full',
    tablet: 'max-w-2xl',
    desktop: 'max-w-3xl'
  }[deviceCategory]

  return (
    <ResponsiveText
      as="p"
      size={size}
      className={cn(lineHeight, maxWidth, className)}
    >
      {children}
    </ResponsiveText>
  )
}

// Responsive label component
interface ResponsiveLabelProps {
  children: ReactNode
  htmlFor?: string
  className?: string
  required?: boolean
}

export function ResponsiveLabel({
  children,
  htmlFor,
  className,
  required = false
}: ResponsiveLabelProps) {
  const { deviceCategory } = useResponsive()
  
  const size = deviceCategory === 'mobile' ? 'base' : 'sm'
  
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        sizeClasses[size],
        'font-medium text-gray-700 block mb-1',
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Responsive caption/helper text
interface ResponsiveCaptionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'error' | 'success' | 'warning'
}

export function ResponsiveCaption({
  children,
  className,
  variant = 'default'
}: ResponsiveCaptionProps) {
  const variantClasses = {
    default: 'text-gray-600',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600'
  }

  return (
    <ResponsiveText
      as="span"
      size="sm"
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </ResponsiveText>
  )
}

// Responsive code block
interface ResponsiveCodeProps {
  children: ReactNode
  className?: string
  inline?: boolean
}

export function ResponsiveCode({
  children,
  className,
  inline = false
}: ResponsiveCodeProps) {
  const { deviceCategory } = useResponsive()
  
  const fontSize = deviceCategory === 'mobile' ? 'text-xs' : 'text-sm'
  
  if (inline) {
    return (
      <code 
        className={cn(
          fontSize,
          'bg-gray-100 px-1 py-0.5 rounded font-mono',
          className
        )}
      >
        {children}
      </code>
    )
  }
  
  return (
    <pre 
      className={cn(
        fontSize,
        'bg-gray-100 p-4 rounded-lg overflow-x-auto font-mono',
        className
      )}
    >
      <code>{children}</code>
    </pre>
  )
}
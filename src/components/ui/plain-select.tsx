"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PlainSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Additional className overrides.
   */
  className?: string
  children?: React.ReactNode
}

/**
 * Light-themed <select> wrapper that ensures consistent background / text colours
 * in all themes (especially required on iOS/Android dark-mode).
 *
 * Falls back to a plain native element so it works fine with 
 * React-Hook-Form `register()` and does not require Radix.
 */
export const PlainSelect = React.forwardRef<HTMLSelectElement, PlainSelectProps>(
  ({ className, children, ...props }: PlainSelectProps, ref: React.ForwardedRef<HTMLSelectElement>) => {
    return (
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full bg-white text-gray-900 dark:bg-white dark:text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cvgenius-primary focus:border-transparent',
          className
        )}
      >
        {children}
      </select>
    )
  }
)

PlainSelect.displayName = 'PlainSelect'
import React from 'react'
import { AlertCircle, FileText, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageBreakIndicatorProps {
  pageNumber: number
  isVisible?: boolean
  position?: 'top' | 'bottom'
  variant?: 'line' | 'badge' | 'both'
  className?: string
}

export function PageBreakIndicator({ 
  pageNumber, 
  isVisible = true,
  position = 'bottom',
  variant = 'both',
  className 
}: PageBreakIndicatorProps) {
  if (!isVisible) return null

  const showLine = variant === 'line' || variant === 'both'
  const showBadge = variant === 'badge' || variant === 'both'

  return (
    <div 
      className={cn(
        "page-break-indicator relative w-full",
        position === 'top' ? 'mb-4' : 'mt-4',
        className
      )}
    >
      {showLine && (
        <div className="relative">
          {/* Dashed line */}
          <div className="border-t-2 border-dashed border-red-400 opacity-70" />
          
          {/* Scissors icon */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2">
            <span className="text-red-500 text-lg">✂️</span>
          </div>
        </div>
      )}
      
      {showBadge && (
        <div className="absolute -top-3 right-4 flex items-center gap-2">
          <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Page {pageNumber} ends here</span>
          </div>
        </div>
      )}
      
      {/* Warning for multi-page CVs */}
      {pageNumber >= 2 && (
        <div className="absolute -top-10 left-4 flex items-center gap-2">
          <div className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>CV is {pageNumber} pages long</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Page status component for header/sidebar
interface PageStatusProps {
  currentPage: number
  totalPages: number
  className?: string
  showWarning?: boolean
}

export function PageStatus({ 
  currentPage, 
  totalPages, 
  className,
  showWarning = true 
}: PageStatusProps) {
  const isMultiPage = totalPages > 1
  const isTooLong = totalPages > 2

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Page counter */}
      <div className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm",
        isTooLong 
          ? "bg-red-100 text-red-700 border border-red-200" 
          : isMultiPage 
          ? "bg-amber-100 text-amber-700 border border-amber-200"
          : "bg-green-100 text-green-700 border border-green-200"
      )}>
        <FileText className="w-4 h-4" />
        <span>
          {totalPages === 1 
            ? "1 Page" 
            : `${totalPages} Pages`
          }
        </span>
        {currentPage > 1 && (
          <span className="text-xs opacity-75">
            (viewing page {currentPage})
          </span>
        )}
      </div>

      {/* Warning messages */}
      {showWarning && (
        <>
          {isTooLong && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Too long! Aim for 1-2 pages</span>
            </div>
          )}
          {isMultiPage && !isTooLong && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Consider reducing to 1 page</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Floating page indicator for mobile
export function FloatingPageIndicator({ 
  currentPage, 
  totalPages,
  position = 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}: {
  currentPage: number
  totalPages: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  const isMultiPage = totalPages > 1
  const isTooLong = totalPages > 2

  return (
    <div className={cn(
      "fixed z-50",
      positionClasses[position]
    )}>
      <div className={cn(
        "px-4 py-2 rounded-full font-medium text-sm shadow-lg flex items-center gap-2",
        isTooLong 
          ? "bg-red-500 text-white animate-pulse" 
          : isMultiPage 
          ? "bg-amber-500 text-white"
          : "bg-green-500 text-white"
      )}>
        <FileText className="w-4 h-4" />
        <span>
          Page {currentPage}/{totalPages}
        </span>
      </div>
    </div>
  )
}
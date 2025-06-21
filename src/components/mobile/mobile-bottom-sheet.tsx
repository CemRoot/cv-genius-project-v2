'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { X, GripHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: number[] // Percentage heights [0.3, 0.6, 0.9]
  initialSnap?: number // Index of initial snap point
  showHandle?: boolean
  showCloseButton?: boolean
  enableSwipeToClose?: boolean
  className?: string
  overlayClassName?: string
  backdrop?: boolean
  backdropClosable?: boolean
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.4, 0.7, 0.95],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
  enableSwipeToClose = true,
  className = '',
  overlayClassName = '',
  backdrop = true,
  backdropClosable = true
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartHeight, setDragStartHeight] = useState(0)
  const [currentHeight, setCurrentHeight] = useState(snapPoints[initialSnap])
  
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startTouchY = useRef(0)
  const startSheetHeight = useRef(0)

  // Update height when snap point changes
  useEffect(() => {
    if (isOpen) {
      setCurrentHeight(snapPoints[currentSnap])
    }
  }, [currentSnap, snapPoints, isOpen])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableSwipeToClose) return
    
    const touch = e.touches[0]
    startTouchY.current = touch.clientY
    startSheetHeight.current = currentHeight
    setIsDragging(true)
    setDragStartY(touch.clientY)
    setDragStartHeight(currentHeight)
  }, [enableSwipeToClose, currentHeight])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !enableSwipeToClose) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startTouchY.current
    const windowHeight = window.innerHeight
    const deltaPercent = deltaY / windowHeight

    // Calculate new height
    let newHeight = startSheetHeight.current - deltaPercent
    newHeight = Math.max(0.1, Math.min(0.95, newHeight))

    setCurrentHeight(newHeight)

    // Prevent scrolling when dragging
    e.preventDefault()
  }, [isDragging, enableSwipeToClose])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !enableSwipeToClose) return

    setIsDragging(false)

    // Find closest snap point
    let closestSnap = 0
    let closestDistance = Math.abs(currentHeight - snapPoints[0])

    snapPoints.forEach((point, index) => {
      const distance = Math.abs(currentHeight - point)
      if (distance < closestDistance) {
        closestDistance = distance
        closestSnap = index
      }
    })

    // If dragged down significantly, close the sheet
    const dragDistance = dragStartY - (window.innerHeight * currentHeight)
    if (dragDistance > 100 && currentHeight < snapPoints[0] * 0.5) {
      onClose()
      return
    }

    // Snap to closest point
    setCurrentSnap(closestSnap)
    setCurrentHeight(snapPoints[closestSnap])
  }, [isDragging, enableSwipeToClose, currentHeight, snapPoints, dragStartY, onClose])

  // Set up touch event listeners
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return

    const handleRef = sheet.querySelector('[data-bottom-sheet-handle]') as HTMLElement
    const target = handleRef || sheet

    target.addEventListener('touchstart', handleTouchStart, { passive: false })
    target.addEventListener('touchmove', handleTouchMove, { passive: false })
    target.addEventListener('touchend', handleTouchEnd)

    return () => {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchmove', handleTouchMove)
      target.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Animation class based on state
  const getAnimationClass = () => {
    if (!isOpen) return 'translate-y-full'
    if (isDragging) return ''
    return 'transition-transform duration-300 ease-out'
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && backdropClosable) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${overlayClassName}`}
          onClick={handleBackdropClick}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-xl ${getAnimationClass()} ${className}`}
        style={{
          height: `${currentHeight * 100}vh`,
          transform: isDragging ? `translateY(${(1 - currentHeight) * 100}vh)` : undefined
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {/* Drag handle */}
          {showHandle && (
            <div 
              data-bottom-sheet-handle
              className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
            />
          )}

          {/* Title */}
          {title && (
            <h3 className="text-lg font-semibold flex-1 text-center">
              {title}
            </h3>
          )}

          {/* Close button */}
          {showCloseButton && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4"
          style={{
            height: 'calc(100% - 64px)', // Subtract header height
            maxHeight: 'calc(100% - 64px)'
          }}
        >
          {children}
        </div>

        {/* Snap point indicators */}
        {snapPoints.length > 1 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSnap(index)
                  setCurrentHeight(snapPoints[index])
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSnap 
                    ? 'bg-purple-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// Hook for managing bottom sheet state
export function useBottomSheet(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  }
}

export default MobileBottomSheet
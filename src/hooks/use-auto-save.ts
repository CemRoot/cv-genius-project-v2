'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useCVStore } from '@/store/cv-store'

interface UseAutoSaveOptions {
  enabled?: boolean
  interval?: number // in milliseconds
  debounceDelay?: number // debounce delay in milliseconds
  onSave?: (data: any) => void
  onError?: (error: Error) => void
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Auto-save hook for CV Builder
 * Automatically saves CV data to localStorage with debouncing
 */
export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    debounceDelay = 2000, // 2 seconds
    onSave,
    onError
  } = options

  const { 
    currentCV, 
    autoSaveEnabled,
    setAutoSaveInterval,
    enableAutoSave,
    disableAutoSave,
    performAutoSave,
    lastAutoSave 
  } = useCVStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>('')

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(() => {
      try {
        performAutoSave()
        
        // Call custom onSave callback if provided
        if (onSave) {
          onSave(currentCV)
        }
        
        console.log('📝 Auto-save completed:', new Date().toLocaleTimeString())
      } catch (error) {
        console.error('Auto-save failed:', error)
        if (onError && error instanceof Error) {
          onError(error)
        }
      }
    }, debounceDelay),
    [performAutoSave, currentCV, onSave, onError, debounceDelay]
  )

  // Initialize auto-save settings
  useEffect(() => {
    if (enabled) {
      enableAutoSave()
      setAutoSaveInterval(interval)
    } else {
      disableAutoSave()
    }
  }, [enabled, interval, enableAutoSave, disableAutoSave, setAutoSaveInterval])

  // Monitor data changes and trigger debounced save
  useEffect(() => {
    if (!autoSaveEnabled) return

    const currentDataString = JSON.stringify(currentCV)
    
    // Only save if data has actually changed
    if (currentDataString !== previousDataRef.current) {
      previousDataRef.current = currentDataString
      debouncedSave()
    }
  }, [currentCV, autoSaveEnabled, debouncedSave])

  // Periodic auto-save (fallback)
  useEffect(() => {
    if (!autoSaveEnabled) return

    intervalRef.current = setInterval(() => {
      const currentDataString = JSON.stringify(currentCV)
      
      // Only save if data has changed since last save
      if (currentDataString !== previousDataRef.current) {
        previousDataRef.current = currentDataString
        try {
          performAutoSave()
          console.log('🔄 Periodic auto-save completed:', new Date().toLocaleTimeString())
        } catch (error) {
          console.error('Periodic auto-save failed:', error)
        }
      }
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoSaveEnabled, interval, currentCV, performAutoSave])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autoSaveEnabled) {
        try {
          // Synchronous save before page unload
          performAutoSave()
        } catch (error) {
          console.error('Save on unload failed:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [autoSaveEnabled, performAutoSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    isAutoSaveEnabled: autoSaveEnabled,
    lastAutoSave,
    enableAutoSave,
    disableAutoSave,
    performAutoSave: debouncedSave,
    forceSync: () => {
      performAutoSave()
    }
  }
}

// Auto-save status component data hook
export function useAutoSaveStatus() {
  const { autoSaveEnabled, lastAutoSave } = useCVStore()
  
  const getStatusMessage = useCallback(() => {
    if (!autoSaveEnabled) {
      return 'Auto-save disabled'
    }
    
    if (!lastAutoSave) {
      return 'Not saved yet'
    }
    
    const saveDate = new Date(lastAutoSave)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - saveDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) {
      return 'Saved just now'
    } else if (diffMinutes < 60) {
      return `Saved ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      return `Saved at ${saveDate.toLocaleTimeString()}`
    }
  }, [autoSaveEnabled, lastAutoSave])
  
  const getStatusColor = useCallback(() => {
    if (!autoSaveEnabled) return 'text-gray-500'
    if (!lastAutoSave) return 'text-yellow-500'
    
    const saveDate = new Date(lastAutoSave)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - saveDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 2) return 'text-green-500'
    if (diffMinutes < 10) return 'text-blue-500'
    return 'text-yellow-500'
  }, [autoSaveEnabled, lastAutoSave])
  
  return {
    message: getStatusMessage(),
    color: getStatusColor(),
    isEnabled: autoSaveEnabled,
    lastSave: lastAutoSave
  }
}
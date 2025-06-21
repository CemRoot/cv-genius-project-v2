'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type OrientationType = 'portrait' | 'landscape'

export interface OrientationState {
  orientation: OrientationType
  angle: number
  isSupported: boolean
  isLocked: boolean
  canLock: boolean
}

export interface OrientationOptions {
  enableLock?: boolean
  autoAdjustContent?: boolean
  onOrientationChange?: (orientation: OrientationType, angle: number) => void
  onLockStateChange?: (isLocked: boolean) => void
}

const defaultOptions: Required<OrientationOptions> = {
  enableLock: true,
  autoAdjustContent: true,
  onOrientationChange: () => {},
  onLockStateChange: () => {}
}

export function useDeviceOrientation(options: OrientationOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [orientationState, setOrientationState] = useState<OrientationState>(() => {
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
        angle: 0,
        isSupported: false,
        isLocked: false,
        canLock: false
      }
    }

    const getInitialOrientation = (): OrientationType => {
      if (screen.orientation) {
        return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape'
      }
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }

    const getInitialAngle = (): number => {
      if (screen.orientation) {
        return screen.orientation.angle
      }
      return 0
    }

    return {
      orientation: getInitialOrientation(),
      angle: getInitialAngle(),
      isSupported: 'orientation' in screen,
      isLocked: false,
      canLock: 'lock' in screen.orientation
    }
  })

  const lockPromiseRef = useRef<Promise<void> | null>(null)
  const orientationChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update orientation state
  const updateOrientation = useCallback(() => {
    let newOrientation: OrientationType
    let newAngle: number

    if (screen.orientation) {
      newAngle = screen.orientation.angle
      newOrientation = newAngle === 0 || newAngle === 180 ? 'portrait' : 'landscape'
    } else {
      // Fallback for older browsers
      newAngle = (window as any).orientation || 0
      newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }

    setOrientationState(prev => {
      if (prev.orientation !== newOrientation || prev.angle !== newAngle) {
        opts.onOrientationChange(newOrientation, newAngle)
        
        return {
          ...prev,
          orientation: newOrientation,
          angle: newAngle
        }
      }
      return prev
    })
  }, [opts])

  // Handle orientation change with debouncing
  const handleOrientationChange = useCallback(() => {
    // Clear existing timeout
    if (orientationChangeTimeoutRef.current) {
      clearTimeout(orientationChangeTimeoutRef.current)
    }

    // Debounce orientation changes to avoid rapid updates
    orientationChangeTimeoutRef.current = setTimeout(() => {
      updateOrientation()
    }, 100)
  }, [updateOrientation])

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !orientationState.isSupported) return

    // Modern browsers
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
      return () => {
        screen.orientation.removeEventListener('change', handleOrientationChange)
      }
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange)
      window.addEventListener('resize', handleOrientationChange)
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('resize', handleOrientationChange)
      }
    }
  }, [handleOrientationChange, orientationState.isSupported])

  // Auto-adjust content based on orientation
  useEffect(() => {
    if (!opts.autoAdjustContent) return

    // Add orientation class to body
    document.body.classList.remove('orientation-portrait', 'orientation-landscape')
    document.body.classList.add(`orientation-${orientationState.orientation}`)

    // Set CSS custom properties
    document.documentElement.style.setProperty('--orientation', orientationState.orientation)
    document.documentElement.style.setProperty('--orientation-angle', `${orientationState.angle}deg`)
    document.documentElement.style.setProperty('--is-portrait', orientationState.orientation === 'portrait' ? '1' : '0')
    document.documentElement.style.setProperty('--is-landscape', orientationState.orientation === 'landscape' ? '1' : '0')

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('orientation-portrait', 'orientation-landscape')
      document.documentElement.style.removeProperty('--orientation')
      document.documentElement.style.removeProperty('--orientation-angle')
      document.documentElement.style.removeProperty('--is-portrait')
      document.documentElement.style.removeProperty('--is-landscape')
    }
  }, [orientationState.orientation, orientationState.angle, opts.autoAdjustContent])

  // Lock orientation to portrait
  const lockToPortrait = useCallback(async (): Promise<boolean> => {
    if (!orientationState.canLock || !screen.orientation.lock) {
      console.warn('Screen orientation lock not supported')
      return false
    }

    try {
      lockPromiseRef.current = screen.orientation.lock('portrait')
      await lockPromiseRef.current
      
      setOrientationState(prev => ({ ...prev, isLocked: true }))
      opts.onLockStateChange(true)
      return true
    } catch (error) {
      console.error('Failed to lock orientation to portrait:', error)
      return false
    }
  }, [orientationState.canLock, opts])

  // Lock orientation to landscape
  const lockToLandscape = useCallback(async (): Promise<boolean> => {
    if (!orientationState.canLock || !screen.orientation.lock) {
      console.warn('Screen orientation lock not supported')
      return false
    }

    try {
      lockPromiseRef.current = screen.orientation.lock('landscape')
      await lockPromiseRef.current
      
      setOrientationState(prev => ({ ...prev, isLocked: true }))
      opts.onLockStateChange(true)
      return true
    } catch (error) {
      console.error('Failed to lock orientation to landscape:', error)
      return false
    }
  }, [orientationState.canLock, opts])

  // Lock to current orientation
  const lockToCurrentOrientation = useCallback(async (): Promise<boolean> => {
    return orientationState.orientation === 'portrait' 
      ? await lockToPortrait() 
      : await lockToLandscape()
  }, [orientationState.orientation, lockToPortrait, lockToLandscape])

  // Unlock orientation
  const unlockOrientation = useCallback(async (): Promise<boolean> => {
    if (!orientationState.canLock || !screen.orientation.unlock) {
      console.warn('Screen orientation unlock not supported')
      return false
    }

    try {
      // Cancel any pending lock operation
      if (lockPromiseRef.current) {
        try {
          await lockPromiseRef.current
        } catch {
          // Ignore errors from cancelled lock
        }
        lockPromiseRef.current = null
      }

      screen.orientation.unlock()
      
      setOrientationState(prev => ({ ...prev, isLocked: false }))
      opts.onLockStateChange(false)
      return true
    } catch (error) {
      console.error('Failed to unlock orientation:', error)
      return false
    }
  }, [orientationState.canLock, opts])

  // Toggle orientation lock
  const toggleOrientationLock = useCallback(async (): Promise<boolean> => {
    return orientationState.isLocked 
      ? await unlockOrientation() 
      : await lockToCurrentOrientation()
  }, [orientationState.isLocked, unlockOrientation, lockToCurrentOrientation])

  // Get orientation-specific styles
  const getOrientationStyles = useCallback(() => {
    return {
      portrait: {
        width: '100%',
        height: '100vh',
        flexDirection: 'column' as const
      },
      landscape: {
        width: '100vw',
        height: '100%',
        flexDirection: 'row' as const
      }
    }[orientationState.orientation]
  }, [orientationState.orientation])

  // Get responsive dimensions
  const getResponsiveDimensions = useCallback(() => {
    const { innerWidth: vw, innerHeight: vh } = window
    
    return {
      // Always use the smaller dimension as width in portrait mode
      width: orientationState.orientation === 'portrait' ? Math.min(vw, vh) : Math.max(vw, vh),
      height: orientationState.orientation === 'portrait' ? Math.max(vw, vh) : Math.min(vw, vh),
      isWide: orientationState.orientation === 'landscape',
      isTall: orientationState.orientation === 'portrait',
      aspectRatio: orientationState.orientation === 'portrait' ? vh / vw : vw / vh
    }
  }, [orientationState.orientation])

  // Check if orientation is optimal for current content
  const isOptimalOrientation = useCallback((preferredOrientation?: OrientationType) => {
    if (!preferredOrientation) return true
    return orientationState.orientation === preferredOrientation
  }, [orientationState.orientation])

  // Suggest orientation change
  const suggestOrientationChange = useCallback((targetOrientation: OrientationType) => {
    if (orientationState.orientation === targetOrientation) return false

    // Could trigger a notification or UI hint
    console.log(`Consider rotating your device to ${targetOrientation} for better experience`)
    return true
  }, [orientationState.orientation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (orientationChangeTimeoutRef.current) {
        clearTimeout(orientationChangeTimeoutRef.current)
      }
      
      // Auto-unlock on unmount if we locked it
      if (orientationState.isLocked && opts.enableLock) {
        unlockOrientation()
      }
    }
  }, [orientationState.isLocked, opts.enableLock, unlockOrientation])

  return {
    // State
    ...orientationState,
    
    // Lock/unlock functions
    lockToPortrait,
    lockToLandscape,
    lockToCurrentOrientation,
    unlockOrientation,
    toggleOrientationLock,
    
    // Utility functions
    getOrientationStyles,
    getResponsiveDimensions,
    isOptimalOrientation,
    suggestOrientationChange,
    
    // Computed values
    isPortrait: orientationState.orientation === 'portrait',
    isLandscape: orientationState.orientation === 'landscape',
    degrees: orientationState.angle,
    
    // CSS class helpers
    orientationClass: `orientation-${orientationState.orientation}`,
    
    // Responsive breakpoints
    isMobile: orientationState.orientation === 'portrait' && window.innerWidth < 768,
    isTablet: (orientationState.orientation === 'portrait' && window.innerWidth >= 768) || 
              (orientationState.orientation === 'landscape' && window.innerWidth < 1024),
    isDesktop: orientationState.orientation === 'landscape' && window.innerWidth >= 1024,
    
    // Specific device orientations
    isPortraitPrimary: orientationState.angle === 0,
    isPortraitSecondary: orientationState.angle === 180,
    isLandscapeLeft: orientationState.angle === 90,
    isLandscapeRight: orientationState.angle === 270
  }
}

export default useDeviceOrientation
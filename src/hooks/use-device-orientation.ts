"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

export type OrientationType = 'portrait' | 'landscape'
export type OrientationAngle = 0 | 90 | 180 | 270

export interface OrientationState {
  type: OrientationType
  angle: OrientationAngle
  isLandscape: boolean
  isPortrait: boolean
  aspectRatio: number
  width: number
  height: number
}

export interface DeviceOrientationOptions {
  enableMotionData?: boolean
  throttleMs?: number
  onOrientationChange?: (state: OrientationState) => void
  onMotionData?: (data: DeviceOrientationEvent) => void
  adjustLayoutOnChange?: boolean
  rememberPreference?: boolean
}

const defaultOptions: Required<DeviceOrientationOptions> = {
  enableMotionData: false,
  throttleMs: 100,
  onOrientationChange: () => {},
  onMotionData: () => {},
  adjustLayoutOnChange: true,
  rememberPreference: false,
}

export function useDeviceOrientation(options: DeviceOrientationOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [orientationState, setOrientationState] = useState<OrientationState>({
    type: 'portrait',
    angle: 0,
    isLandscape: false,
    isPortrait: true,
    aspectRatio: 1,
    width: 0,
    height: 0,
  })

  const [motionData, setMotionData] = useState<DeviceOrientationEvent | null>(null)
  const [supportsMotion, setSupportsMotion] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  
  const throttleTimer = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTime = useRef<number>(0)

  // Get current orientation info
  const getOrientationInfo = useCallback((): OrientationState => {
    if (typeof window === 'undefined') {
      return orientationState
    }

    const { innerWidth: width, innerHeight: height } = window
    const aspectRatio = width / height
    
    // Determine orientation
    const isLandscape = width > height
    const type: OrientationType = isLandscape ? 'landscape' : 'portrait'
    
    // Get orientation angle
    let angle: OrientationAngle = 0
    if ('orientation' in screen) {
      angle = Math.abs(screen.orientation?.angle || 0) as OrientationAngle
    } else if ('orientation' in window) {
      // Fallback for older browsers
      angle = Math.abs((window as any).orientation || 0) as OrientationAngle
    }

    return {
      type,
      angle,
      isLandscape,
      isPortrait: !isLandscape,
      aspectRatio,
      width,
      height,
    }
  }, [orientationState])

  // Throttled orientation update
  const updateOrientation = useCallback(() => {
    const now = Date.now()
    
    if (now - lastUpdateTime.current < opts.throttleMs) {
      if (throttleTimer.current) return
      
      throttleTimer.current = setTimeout(() => {
        updateOrientation()
        throttleTimer.current = null
      }, opts.throttleMs)
      return
    }

    lastUpdateTime.current = now
    const newState = getOrientationInfo()
    
    setOrientationState(prevState => {
      // Only update if state actually changed
      if (
        prevState.type !== newState.type ||
        prevState.angle !== newState.angle ||
        prevState.width !== newState.width ||
        prevState.height !== newState.height
      ) {
        // Call change handler
        opts.onOrientationChange(newState)
        
        // Adjust layout if enabled
        if (opts.adjustLayoutOnChange) {
          // Update CSS custom properties
          document.documentElement.style.setProperty(
            '--orientation-type',
            newState.type
          )
          document.documentElement.style.setProperty(
            '--orientation-angle',
            `${newState.angle}deg`
          )
          document.documentElement.style.setProperty(
            '--aspect-ratio',
            newState.aspectRatio.toString()
          )
          
          // Add orientation classes to body
          document.body.classList.remove('orientation-portrait', 'orientation-landscape')
          document.body.classList.add(`orientation-${newState.type}`)
        }

        // Remember preference if enabled
        if (opts.rememberPreference && typeof localStorage !== 'undefined') {
          localStorage.setItem('preferred-orientation', newState.type)
        }

        return newState
      }
      
      return prevState
    })
  }, [opts, getOrientationInfo])

  // Handle device motion
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!opts.enableMotionData) return
    
    setMotionData(event)
    opts.onMotionData(event)
  }, [opts])

  // Request motion permission (iOS 13+)
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setSupportsMotion(false)
      setPermissionGranted(false)
      return false
    }

    // Check if permission is required (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        const granted = permission === 'granted'
        setPermissionGranted(granted)
        setSupportsMotion(granted)
        return granted
      } catch (error) {
        console.warn('Motion permission request failed:', error)
        setPermissionGranted(false)
        setSupportsMotion(false)
        return false
      }
    } else {
      // No permission required (Android, older iOS)
      setPermissionGranted(true)
      setSupportsMotion(true)
      return true
    }
  }, [])

  // Force orientation (when possible)
  const requestOrientation = useCallback(async (orientation: OrientationType) => {
    if (!('orientation' in screen) || !screen.orientation) {
      console.warn('Screen Orientation API not supported')
      return false
    }

    try {
      const lockOrientation = orientation === 'landscape' 
        ? 'landscape' 
        : 'portrait'
      
      await screen.orientation.lock(lockOrientation as OrientationLockType)
      return true
    } catch (error) {
      console.warn('Failed to lock orientation:', error)
      return false
    }
  }, [])

  // Unlock orientation
  const unlockOrientation = useCallback(() => {
    if (!('orientation' in screen) || !screen.orientation) {
      console.warn('Screen Orientation API not supported')
      return false
    }

    try {
      screen.orientation.unlock()
      return true
    } catch (error) {
      console.warn('Failed to unlock orientation:', error)
      return false
    }
  }, [])

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initial state
    updateOrientation()

    // Modern orientation API
    if ('orientation' in screen && screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation)
    }

    // Fallback orientation detection
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateOrientation)

    // Device motion (if enabled)
    if (opts.enableMotionData) {
      requestMotionPermission().then(granted => {
        if (granted) {
          window.addEventListener('deviceorientation', handleDeviceOrientation)
        }
      })
    }

    return () => {
      if ('orientation' in screen && screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation)
      }
      
      window.removeEventListener('orientationchange', updateOrientation)
      window.removeEventListener('resize', updateOrientation)
      
      if (opts.enableMotionData) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
      }

      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current)
      }

      // Cleanup CSS properties
      if (opts.adjustLayoutOnChange) {
        document.documentElement.style.removeProperty('--orientation-type')
        document.documentElement.style.removeProperty('--orientation-angle')
        document.documentElement.style.removeProperty('--aspect-ratio')
        document.body.classList.remove('orientation-portrait', 'orientation-landscape')
      }
    }
  }, [opts.enableMotionData, updateOrientation, handleDeviceOrientation, requestMotionPermission])

  // Get preferred orientation from storage
  const getPreferredOrientation = useCallback((): OrientationType | null => {
    if (!opts.rememberPreference || typeof localStorage === 'undefined') {
      return null
    }
    
    const stored = localStorage.getItem('preferred-orientation')
    return stored === 'landscape' || stored === 'portrait' ? stored : null
  }, [opts.rememberPreference])

  // Check if device is likely a mobile device
  const isMobileDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (window.innerWidth <= 1024 && 'ontouchstart' in window)
  }, [])

  return {
    // Current state
    ...orientationState,
    
    // Motion data (if enabled)
    motionData,
    supportsMotion,
    permissionGranted,
    
    // Utility functions
    requestMotionPermission,
    requestOrientation,
    unlockOrientation,
    getPreferredOrientation,
    isMobileDevice,
    
    // Computed values
    isFullscreen: () => {
      return document.fullscreenElement !== null ||
             (document as any).webkitFullscreenElement !== null ||
             (document as any).msFullscreenElement !== null
    },
    
    canLockOrientation: () => {
      return 'orientation' in screen && 
             screen.orientation &&
             'lock' in screen.orientation
    },
    
    // Manual refresh
    refresh: updateOrientation,
  }
}

export default useDeviceOrientation
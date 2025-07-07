'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface AdSenseLoaderState {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  isAvailable: boolean
}

export function useAdSenseLoader(clientId?: string) {
  const [state, setState] = useState<AdSenseLoaderState>({
    isLoaded: false,
    isLoading: true,
    error: null,
    isAvailable: false
  })
  
  // Use ref to store current state for stable callbacks
  const stateRef = useRef(state)
  stateRef.current = state

  // Check if AdSense is available and ready
  const checkAdSenseAvailability = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }

    // Check if script exists in DOM
    const scriptExists = !!document.querySelector(`script[src*="adsbygoogle.js"]`)
    
    // Check if adsbygoogle global is available
    const adsbygoogleAvailable = !!(window as any).adsbygoogle
    
    return scriptExists && adsbygoogleAvailable
  }, [])

  // Initialize adsbygoogle array if not available
  const initializeAdSense = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!(window as any).adsbygoogle) {
          (window as any).adsbygoogle = []
        }
        return true
      } catch (e) {
        console.warn('AdSense initialization failed:', e)
        return false
      }
    }
    return false
  }, [])

  // Push ad configuration safely
  const pushAdConfig = useCallback((config?: any) => {
    // Use ref to get current state without dependencies
    const currentState = stateRef.current
    
    if (currentState.isLoaded && currentState.isAvailable) {
      try {
        // Initialize directly without dependency
        if (typeof window !== 'undefined') {
          if (!(window as any).adsbygoogle) {
            (window as any).adsbygoogle = []
          }
          (window as any).adsbygoogle.push(config || {})
          return true
        }
      } catch (e) {
        console.warn('AdSense push failed:', e)
        return false
      }
    }
    return false
  }, []) // Empty dependencies - stable reference

  // Check script status periodically
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setState({
        isLoaded: false,
        isLoading: false,
        error: 'Development mode - AdSense disabled',
        isAvailable: false
      })
      return
    }

    let checkCount = 0
    const maxChecks = 60 // 30 seconds (500ms * 60)
    let checkInterval: NodeJS.Timeout
    
    const startChecking = () => {
      checkInterval = setInterval(() => {
        checkCount++
        
        const isAvailable = checkAdSenseAvailability()
        
        if (isAvailable) {
          setState({
            isLoaded: true,
            isLoading: false,
            error: null,
            isAvailable: true
          })
          clearInterval(checkInterval)
        } else if (checkCount >= maxChecks) {
          setState({
            isLoaded: false,
            isLoading: false,
            error: 'AdSense script not available after 30 seconds',
            isAvailable: false
          })
          clearInterval(checkInterval)
        }
      }, 500)
    }

    startChecking()

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, []) // Empty dependency array - checkAdSenseAvailability removed

  // Manual retry function
  const retry = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    setTimeout(() => {
      const isAvailable = checkAdSenseAvailability()
      setState({
        isLoaded: isAvailable,
        isLoading: false,
        error: isAvailable ? null : 'AdSense still not available',
        isAvailable
      })
    }, 1000)
  }, [checkAdSenseAvailability])

  return {
    ...state,
    initializeAdSense,
    pushAdConfig,
    retry
  }
}
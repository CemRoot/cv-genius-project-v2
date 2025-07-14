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
      console.log('🔍 [AdSense Loader] Window undefined - running on server')
      return false
    }

    // Safari compatibility check
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      console.log('🦋 [AdSense Loader] Safari detected - using compatible mode')
    }

    // Check for development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' || 
                         window.location.port === '3000'
    
    if (isDevelopment) {
      console.log('🔍 [AdSense Loader] Development mode - AdSense disabled')
      return false
    }

    // Check if script exists in DOM
    const scriptExists = !!document.querySelector(`script[src*="adsbygoogle.js"]`)
    
    // Check if adsbygoogle global is available
    const adsbygoogleAvailable = !!(window as any).adsbygoogle
    
    // Check global state from enhanced layout script
    const globalLoadState = (window as any).adSenseLoaded
    const globalError = (window as any).adSenseError
    const loadTime = (window as any).adSenseLoadTime
    
    console.log('🔍 [AdSense Loader] Enhanced availability check:', {
      scriptExists,
      adsbygoogleAvailable,
      globalLoadState,
      globalError,
      loadTime: loadTime ? loadTime + 'ms' : 'N/A',
      adsbygoogleLength: (window as any).adsbygoogle ? (window as any).adsbygoogle.length : 'N/A',
      isDevelopment
    })
    
    // Enhanced check - consider it available if global state confirms loading
    return (scriptExists && adsbygoogleAvailable) || globalLoadState === true
  }, [])

  // Initialize adsbygoogle array if not available
  const initializeAdSense = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!(window as any).adsbygoogle) {
          (window as any).adsbygoogle = []
          console.log('🔧 [AdSense Loader] Initialized adsbygoogle array')
        } else {
          console.log('🔧 [AdSense Loader] adsbygoogle already exists, length:', (window as any).adsbygoogle.length)
        }
        return true
      } catch (e) {
        console.error('❌ [AdSense Loader] Initialization failed:', e)
        return false
      }
    }
    console.log('🔧 [AdSense Loader] Cannot initialize - window undefined')
    return false
  }, [])

  // Push ad configuration safely with Safari compatibility
  const pushAdConfig = useCallback((config?: any) => {
    // Use ref to get current state without dependencies
    const currentState = stateRef.current
    
    // Safari compatibility check
    const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    console.log('🎯 [AdSense Loader] pushAdConfig called:', {
      isLoaded: currentState.isLoaded,
      isAvailable: currentState.isAvailable,
      isSafari,
      config: config || 'empty config'
    })
    
    if (currentState.isLoaded && currentState.isAvailable) {
      try {
        // Initialize directly without dependency
        if (typeof window !== 'undefined') {
          if (!(window as any).adsbygoogle) {
            (window as any).adsbygoogle = []
            console.log('🔧 [AdSense Loader] Initialized adsbygoogle for push')
          }
          
          const beforeLength = (window as any).adsbygoogle.length
          
          // Safari-specific delay for better compatibility
          if (isSafari) {
            setTimeout(() => {
              ;(window as any).adsbygoogle.push(config || {})
              console.log('🦋 [AdSense Loader] Safari - Config pushed with delay')
            }, 100)
          } else {
            ;(window as any).adsbygoogle.push(config || {})
          }
          
          const afterLength = (window as any).adsbygoogle.length
          
          console.log('✅ [AdSense Loader] Config pushed successfully:', {
            beforeLength,
            afterLength,
            isSafari: isSafari ? 'with delay' : 'immediate',
            config: config || 'empty config'
          })
          
          return true
        }
      } catch (e) {
        console.error('❌ [AdSense Loader] Push failed:', e)
        if (isSafari) {
          console.log('🦋 [AdSense Loader] Safari error - retrying in 500ms')
          setTimeout(() => {
            try {
              if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                ;(window as any).adsbygoogle.push(config || {})
                console.log('🦋 [AdSense Loader] Safari retry successful')
              }
            } catch (retryError) {
              console.error('🦋 [AdSense Loader] Safari retry failed:', retryError)
            }
          }, 500)
        }
        return false
      }
    } else {
      console.warn('⚠️ [AdSense Loader] Cannot push - not ready:', {
        isLoaded: currentState.isLoaded,
        isAvailable: currentState.isAvailable,
        error: currentState.error
      })
    }
    return false
  }, []) // Empty dependencies - stable reference

  // Check script status periodically
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [AdSense Loader] Development mode - AdSense disabled')
      setState({
        isLoaded: false,
        isLoading: false,
        error: 'Development mode - AdSense disabled',
        isAvailable: false
      })
      return
    }

    console.log('🔍 [AdSense Loader] Production mode - Starting availability checks...')
    
    let checkCount = 0
    const maxChecks = 60 // 30 seconds (500ms * 60)
    let checkInterval: NodeJS.Timeout
    
    const startChecking = () => {
      checkInterval = setInterval(() => {
        checkCount++
        
        const isAvailable = checkAdSenseAvailability()
        
        if (isAvailable) {
          console.log('✅ [AdSense Loader] AdSense is available! Check count:', checkCount)
          setState({
            isLoaded: true,
            isLoading: false,
            error: null,
            isAvailable: true
          })
          clearInterval(checkInterval)
        } else if (checkCount >= maxChecks) {
          console.error('❌ [AdSense Loader] AdSense not available after 30 seconds (' + checkCount + ' checks)')
          setState({
            isLoaded: false,
            isLoading: false,
            error: 'AdSense script not available after 30 seconds',
            isAvailable: false
          })
          clearInterval(checkInterval)
        } else if (checkCount % 10 === 0) {
          // Log every 5 seconds
          console.log('⏳ [AdSense Loader] Still checking... (' + checkCount + '/' + maxChecks + ')')
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
    console.log('🔄 [AdSense Loader] Manual retry requested')
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    setTimeout(() => {
      const isAvailable = checkAdSenseAvailability()
      console.log('🔄 [AdSense Loader] Retry result:', { isAvailable })
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
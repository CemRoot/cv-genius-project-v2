'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdSenseLoaderState {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  isAvailable: boolean
}

// Global script loading state to prevent multiple loads
let scriptLoadPromise: Promise<boolean> | null = null
let scriptLoaded = false
let scriptError: string | null = null

export function useAdSenseLoader(clientId?: string) {
  const [state, setState] = useState<AdSenseLoaderState>({
    isLoaded: scriptLoaded,
    isLoading: false,
    error: scriptError,
    isAvailable: false
  })

  const loadScript = useCallback(async (): Promise<boolean> => {
    // If script is already loaded or loading, return existing promise
    if (scriptLoaded) {
      return true
    }
    
    if (scriptLoadPromise) {
      return scriptLoadPromise
    }

    // Don't load in development mode
    if (process.env.NODE_ENV !== 'production') {
      setState(prev => ({ ...prev, isLoaded: false, isLoading: false, error: 'Development mode' }))
      return false
    }

    // Check if script was already loaded by layout.tsx
    const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`)
    if (existingScript) {
      // Script already exists, check if adsbygoogle is available
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        scriptLoaded = true
        setState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          isLoading: false, 
          error: null,
          isAvailable: true
        }))
        return true
      } else {
        // Wait for the existing script to initialize
        return new Promise((resolve) => {
          let attempts = 0
          const checkInterval = setInterval(() => {
            attempts++
            if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
              clearInterval(checkInterval)
              scriptLoaded = true
              setState(prev => ({ 
                ...prev, 
                isLoaded: true, 
                isLoading: false, 
                error: null,
                isAvailable: true
              }))
              resolve(true)
            } else if (attempts > 50) { // 5 seconds timeout
              clearInterval(checkInterval)
              const error = 'AdSense script available but adsbygoogle not ready'
              scriptError = error
              setState(prev => ({ ...prev, isLoaded: false, isLoading: false, error }))
              resolve(false)
            }
          }, 100)
        })
      }
    }

    const adSenseClient = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT
    if (!adSenseClient) {
      const error = 'AdSense client ID not configured'
      scriptError = error
      setState(prev => ({ ...prev, isLoaded: false, isLoading: false, error }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    scriptLoadPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`
      
      let timeoutId: NodeJS.Timeout
      let resolved = false

      const handleSuccess = () => {
        if (resolved) return
        resolved = true
        clearTimeout(timeoutId)
        
        scriptLoaded = true
        scriptError = null
        setState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          isLoading: false, 
          error: null,
          isAvailable: typeof window !== 'undefined' && !!(window as any).adsbygoogle
        }))
        resolve(true)
      }

      const handleError = (errorMsg: string) => {
        if (resolved) return
        resolved = true
        clearTimeout(timeoutId)
        
        scriptLoaded = false
        scriptError = errorMsg
        setState(prev => ({ 
          ...prev, 
          isLoaded: false, 
          isLoading: false, 
          error: errorMsg,
          isAvailable: false
        }))
        resolve(false)
      }

      // Set timeout for script loading (10 seconds)
      timeoutId = setTimeout(() => {
        handleError('AdSense script load timeout (10s)')
      }, 10000)

      script.onload = () => {
        // Additional check to ensure adsbygoogle is available
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            handleSuccess()
          } else {
            handleError('AdSense script loaded but adsbygoogle not available')
          }
        }, 100)
      }

      script.onerror = () => {
        handleError('AdSense script failed to load')
      }

      // Note: Script existence check moved to top of function

      // Add script to document
      try {
        document.head.appendChild(script)
      } catch (e) {
        handleError('Failed to add script to document')
      }
    })

    return scriptLoadPromise
  }, [clientId])

  // Initialize adsbygoogle array if not available
  const initializeAdSense = useCallback(() => {
    if (typeof window !== 'undefined' && state.isLoaded) {
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
  }, [state.isLoaded])

  // Push ad configuration safely
  const pushAdConfig = useCallback((config?: any) => {
    if (state.isLoaded && initializeAdSense()) {
      try {
        (window as any).adsbygoogle.push(config || {})
        return true
      } catch (e) {
        console.warn('AdSense push failed:', e)
        return false
      }
    }
    return false
  }, [state.isLoaded, initializeAdSense])

  // Check script status on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // First check if AdSense is already available
      if (typeof window !== 'undefined') {
        const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`)
        if (existingScript && (window as any).adsbygoogle) {
          // Script already loaded and ready
          scriptLoaded = true
          setState(prev => ({ 
            ...prev, 
            isLoaded: true, 
            isLoading: false, 
            error: null,
            isAvailable: true
          }))
        } else {
          // Load or wait for script
          loadScript()
        }
      }
    } else {
      // Development mode
      setState(prev => ({ 
        ...prev, 
        isLoaded: false, 
        isLoading: false, 
        error: 'Development mode - AdSense disabled',
        isAvailable: false
      }))
    }
  }, [loadScript])

  return {
    ...state,
    loadScript,
    initializeAdSense,
    pushAdConfig,
    retry: loadScript
  }
}
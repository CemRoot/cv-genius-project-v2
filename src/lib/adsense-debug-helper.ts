/**
 * AdSense Debug Helper
 * Provides debugging utilities for AdSense troubleshooting
 */

export interface AdSenseDebugInfo {
  environment: string
  clientId: string | undefined
  scriptLoaded: boolean
  scriptError: string | undefined
  adsbygoogleAvailable: boolean
  adsbygoogleLength: number
  scripts: string[]
  globalState: any
}

export class AdSenseDebugHelper {
  static getDebugInfo(): AdSenseDebugInfo {
    if (typeof window === 'undefined') {
      return {
        environment: 'server',
        clientId: undefined,
        scriptLoaded: false,
        scriptError: undefined,
        adsbygoogleAvailable: false,
        adsbygoogleLength: 0,
        scripts: [],
        globalState: null
      }
    }

    const scripts = Array.from(document.querySelectorAll('script[src*="adsbygoogle"]'))
      .map(script => (script as HTMLScriptElement).src)

    return {
      environment: process.env.NODE_ENV || 'unknown',
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
      scriptLoaded: !!(window as any).adSenseLoaded,
      scriptError: (window as any).adSenseError,
      adsbygoogleAvailable: !!(window as any).adsbygoogle,
      adsbygoogleLength: (window as any).adsbygoogle ? (window as any).adsbygoogle.length : 0,
      scripts,
      globalState: {
        adSenseLoaded: (window as any).adSenseLoaded,
        adSenseError: (window as any).adSenseError,
        adSenseLoadTime: (window as any).adSenseLoadTime
      }
    }
  }

  static logDebugInfo(): void {
    const info = this.getDebugInfo()
    console.log('🔍 [AdSense Debug] Current state:', info)
  }

  static checkAdSenseScript(): boolean {
    if (typeof window === 'undefined') return false
    
    const scriptExists = !!document.querySelector('script[src*="adsbygoogle.js"]')
    const adsbygoogleAvailable = !!(window as any).adsbygoogle
    const globalLoaded = (window as any).adSenseLoaded
    
    console.log('🔍 [AdSense Debug] Script check:', {
      scriptExists,
      adsbygoogleAvailable,
      globalLoaded,
      result: scriptExists && adsbygoogleAvailable
    })
    
    return scriptExists && adsbygoogleAvailable
  }

  static retryAdSenseLoad(): void {
    console.log('🔄 [AdSense Debug] Manual retry initiated')
    
    // Reload the page to retry AdSense loading
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  static clearAdSenseState(): void {
    console.log('🧹 [AdSense Debug] Clearing AdSense state')
    
    if (typeof window !== 'undefined') {
      delete (window as any).adSenseLoaded
      delete (window as any).adSenseError
      delete (window as any).adSenseLoadTime
      delete (window as any).adsbygoogle
    }
  }

  static simulateAdSenseLoad(): void {
    console.log('🧪 [AdSense Debug] Simulating AdSense load for testing')
    
    if (typeof window !== 'undefined') {
      (window as any).adSenseLoaded = true
      ;(window as any).adSenseError = null
      ;(window as any).adSenseLoadTime = 1000
      ;(window as any).adsbygoogle = []
    }
  }
}

// Add global debug functions for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).adSenseDebug = {
    getInfo: () => AdSenseDebugHelper.getDebugInfo(),
    logInfo: () => AdSenseDebugHelper.logDebugInfo(),
    checkScript: () => AdSenseDebugHelper.checkAdSenseScript(),
    retry: () => AdSenseDebugHelper.retryAdSenseLoad(),
    clear: () => AdSenseDebugHelper.clearAdSenseState(),
    simulate: () => AdSenseDebugHelper.simulateAdSenseLoad()
  }
  
  console.log('🔧 [AdSense Debug] Debug helper loaded. Use window.adSenseDebug for manual debugging.')
}

export default AdSenseDebugHelper
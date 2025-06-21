'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Mobile-specific metrics
  memoryUsage?: number
  batteryLevel?: number
  isCharging?: boolean
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
  
  // Performance scores
  performanceScore: number
  suggestions: string[]
}

interface PerformanceOptions {
  enableBatteryAPI?: boolean
  enableMemoryAPI?: boolean
  enableNetworkAPI?: boolean
  trackWebVitals?: boolean
  sampleRate?: number // 0-1, percentage of users to track
}

export function usePerformanceMonitor(options: PerformanceOptions = {}) {
  const {
    enableBatteryAPI = true,
    enableMemoryAPI = true,
    enableNetworkAPI = true,
    trackWebVitals = true,
    sampleRate = 1.0
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    performanceScore: 0,
    suggestions: []
  })
  
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [shouldOptimize, setShouldOptimize] = useState(false)
  const metricsRef = useRef<Partial<PerformanceMetrics>>({})

  // Check if we should track for this user (sampling)
  const shouldTrack = useCallback(() => {
    return Math.random() < sampleRate
  }, [sampleRate])

  // Detect low-end device
  const detectLowEndDevice = useCallback(() => {
    const connection = (navigator as any).connection
    const memory = (navigator as any).deviceMemory
    const cores = navigator.hardwareConcurrency || 4

    const isLowEnd = (
      (memory && memory <= 2) || // <= 2GB RAM
      cores <= 2 || // <= 2 CPU cores
      (connection && connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
    )

    setIsLowEndDevice(isLowEnd)
    setShouldOptimize(isLowEnd)

    return isLowEnd
  }, [])

  // Battery API monitoring
  const monitorBattery = useCallback(async () => {
    if (!enableBatteryAPI || !('getBattery' in navigator)) return

    try {
      const battery = await (navigator as any).getBattery()
      
      const updateBatteryMetrics = () => {
        const level = battery.level
        const charging = battery.charging
        
        metricsRef.current.batteryLevel = level * 100
        metricsRef.current.isCharging = charging
        
        // Enable battery-saving mode when low
        if (level < 0.2 && !charging) {
          setShouldOptimize(true)
        }
      }

      updateBatteryMetrics()
      battery.addEventListener('levelchange', updateBatteryMetrics)
      battery.addEventListener('chargingchange', updateBatteryMetrics)

      return () => {
        battery.removeEventListener('levelchange', updateBatteryMetrics)
        battery.removeEventListener('chargingchange', updateBatteryMetrics)
      }
    } catch (error) {
      console.warn('Battery API not supported')
    }
  }, [enableBatteryAPI])

  // Memory API monitoring
  const monitorMemory = useCallback(() => {
    if (!enableMemoryAPI) return

    const updateMemoryMetrics = () => {
      // Device memory
      const deviceMemory = (navigator as any).deviceMemory
      if (deviceMemory) {
        metricsRef.current.deviceMemory = deviceMemory
      }

      // Memory info (Chrome only)
      const memory = (performance as any).memory
      if (memory) {
        const usedMemory = memory.usedJSHeapSize / memory.totalJSHeapSize
        metricsRef.current.memoryUsage = usedMemory * 100
        
        // Trigger optimization if memory usage is high
        if (usedMemory > 0.8) {
          setShouldOptimize(true)
        }
      }

      // Hardware concurrency
      if (navigator.hardwareConcurrency) {
        metricsRef.current.hardwareConcurrency = navigator.hardwareConcurrency
      }
    }

    updateMemoryMetrics()
    
    // Monitor memory every 30 seconds
    const interval = setInterval(updateMemoryMetrics, 30000)
    return () => clearInterval(interval)
  }, [enableMemoryAPI])

  // Network API monitoring
  const monitorNetwork = useCallback(() => {
    if (!enableNetworkAPI) return

    const updateNetworkMetrics = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        metricsRef.current.connectionType = connection.effectiveType
        
        // Optimize for slow connections
        if (['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
          setShouldOptimize(true)
        }
      }
    }

    updateNetworkMetrics()

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkMetrics)
      return () => connection.removeEventListener('change', updateNetworkMetrics)
    }
  }, [enableNetworkAPI])

  // Web Vitals tracking
  const trackWebVitals = useCallback(() => {
    if (!trackWebVitals || typeof window === 'undefined') return

    // LCP (Largest Contentful Paint)
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metricsRef.current.lcp = lastEntry.startTime
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        return () => observer.disconnect()
      } catch (error) {
        console.warn('LCP observer not supported')
      }
    }

    // FCP (First Contentful Paint)
    const observeFCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              metricsRef.current.fcp = entry.startTime
            }
          }
        })
        observer.observe({ entryTypes: ['paint'] })
        return () => observer.disconnect()
      } catch (error) {
        console.warn('FCP observer not supported')
      }
    }

    // CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      try {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              metricsRef.current.cls = clsValue
            }
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
        return () => observer.disconnect()
      } catch (error) {
        console.warn('CLS observer not supported')
      }
    }

    // FID (First Input Delay)
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            metricsRef.current.fid = (entry as any).processingStart - entry.startTime
          }
        })
        observer.observe({ entryTypes: ['first-input'] })
        return () => observer.disconnect()
      } catch (error) {
        console.warn('FID observer not supported')
      }
    }

    // TTFB (Time to First Byte)
    const measureTTFB = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart
        }
      } catch (error) {
        console.warn('TTFB measurement not supported')
      }
    }

    const cleanupFunctions = [
      observeLCP(),
      observeFCP(),
      observeCLS(),
      observeFID()
    ].filter(Boolean)

    measureTTFB()

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup?.())
    }
  }, [trackWebVitals])

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    const current = metricsRef.current
    let score = 100
    const suggestions: string[] = []

    // LCP scoring
    if (current.lcp) {
      if (current.lcp > 4000) {
        score -= 30
        suggestions.push('Optimize images and reduce server response time')
      } else if (current.lcp > 2500) {
        score -= 15
        suggestions.push('Consider image optimization')
      }
    }

    // FID scoring
    if (current.fid) {
      if (current.fid > 300) {
        score -= 25
        suggestions.push('Reduce JavaScript execution time')
      } else if (current.fid > 100) {
        score -= 10
        suggestions.push('Optimize JavaScript performance')
      }
    }

    // CLS scoring
    if (current.cls) {
      if (current.cls > 0.25) {
        score -= 20
        suggestions.push('Fix layout shifts by setting image dimensions')
      } else if (current.cls > 0.1) {
        score -= 10
        suggestions.push('Minor layout improvements needed')
      }
    }

    // Memory usage scoring
    if (current.memoryUsage && current.memoryUsage > 80) {
      score -= 15
      suggestions.push('High memory usage detected - consider optimizations')
    }

    // Low battery scoring
    if (current.batteryLevel && current.batteryLevel < 20 && !current.isCharging) {
      score -= 10
      suggestions.push('Enable battery saving mode')
    }

    // Slow connection scoring
    if (current.connectionType && ['slow-2g', '2g'].includes(current.connectionType)) {
      score -= 20
      suggestions.push('Optimize for slow network connections')
    }

    return { score: Math.max(0, score), suggestions }
  }, [])

  // Update metrics periodically
  useEffect(() => {
    if (!shouldTrack()) return

    const updateMetrics = () => {
      const { score, suggestions } = calculatePerformanceScore()
      
      setMetrics({
        ...metricsRef.current,
        performanceScore: score,
        suggestions
      })
    }

    // Initial update
    updateMetrics()

    // Update every 10 seconds
    const interval = setInterval(updateMetrics, 10000)
    return () => clearInterval(interval)
  }, [calculatePerformanceScore, shouldTrack])

  // Initialize monitoring
  useEffect(() => {
    if (!shouldTrack()) return

    const cleanupFunctions: Array<(() => void) | undefined> = []

    const init = async () => {
      detectLowEndDevice()
      cleanupFunctions.push(await monitorBattery())
      cleanupFunctions.push(monitorMemory())
      cleanupFunctions.push(monitorNetwork())
      cleanupFunctions.push(trackWebVitals())
    }

    init()

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup?.())
    }
  }, [detectLowEndDevice, monitorBattery, monitorMemory, monitorNetwork, trackWebVitals, shouldTrack])

  // Optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = []

    if (isLowEndDevice) {
      recommendations.push('Enable reduced motion')
      recommendations.push('Disable heavy animations')
      recommendations.push('Use image placeholders')
    }

    if (metrics.batteryLevel && metrics.batteryLevel < 20) {
      recommendations.push('Enable dark mode to save battery')
      recommendations.push('Reduce background activity')
    }

    if (metrics.connectionType && ['slow-2g', '2g', '3g'].includes(metrics.connectionType)) {
      recommendations.push('Enable data saver mode')
      recommendations.push('Compress images more aggressively')
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 80) {
      recommendations.push('Clear caches')
      recommendations.push('Reduce concurrent operations')
    }

    return recommendations
  }, [isLowEndDevice, metrics])

  return {
    metrics,
    isLowEndDevice,
    shouldOptimize,
    getOptimizationRecommendations,
    // Utility functions
    clearMetrics: () => {
      metricsRef.current = {}
      setMetrics({ performanceScore: 0, suggestions: [] })
    },
    forceOptimization: () => setShouldOptimize(true),
    disableOptimization: () => setShouldOptimize(false)
  }
}
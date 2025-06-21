'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

export interface MobileAnalyticsEvent {
  type: 'touch' | 'gesture' | 'interaction' | 'performance' | 'error'
  action: string
  category: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
}

export interface TouchHeatmapData {
  x: number
  y: number
  timestamp: number
  elementSelector?: string
  touchType: 'start' | 'move' | 'end'
}

export interface GestureTrackingData {
  type: 'swipe' | 'pinch' | 'scroll' | 'tap' | 'longpress'
  direction?: 'up' | 'down' | 'left' | 'right'
  duration: number
  distance?: number
  velocity?: number
  elementSelector?: string
}

export interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  touchResponseTime: number
  scrollPerformance: number
  memoryUsage?: number
  batteryLevel?: number
  connectionType?: string
}

interface AnalyticsOptions {
  enableTouchHeatmap?: boolean
  enableGestureTracking?: boolean
  enablePerformanceMonitoring?: boolean
  enableErrorTracking?: boolean
  enableConversionTracking?: boolean
  apiEndpoint?: string
  batchSize?: number
  flushInterval?: number
  sampleRate?: number
}

const defaultOptions: Required<AnalyticsOptions> = {
  enableTouchHeatmap: true,
  enableGestureTracking: true,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableConversionTracking: true,
  apiEndpoint: '/api/analytics',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  sampleRate: 1.0 // 100%
}

export function useMobileAnalytics(options: AnalyticsOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  const pathname = usePathname()
  
  const sessionId = useRef<string>('')
  const events = useRef<MobileAnalyticsEvent[]>([])
  const touchHeatmap = useRef<TouchHeatmapData[]>([])
  const gestureData = useRef<GestureTrackingData[]>([])
  const performanceData = useRef<Partial<PerformanceMetrics>>({})
  const flushTimer = useRef<NodeJS.Timeout | null>(null)
  const startTime = useRef<number>(Date.now())

  // Initialize session ID
  useEffect(() => {
    sessionId.current = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Check if we should track for this user (sampling)
  const shouldTrack = useCallback(() => {
    return Math.random() < opts.sampleRate
  }, [opts.sampleRate])

  // Get element selector for analytics
  const getElementSelector = useCallback((element: Element): string => {
    if (element.id) return `#${element.id}`
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).slice(0, 2).join('.')
      return `.${classes}`
    }
    return element.tagName.toLowerCase()
  }, [])

  // Track event
  const trackEvent = useCallback((
    type: MobileAnalyticsEvent['type'],
    action: string,
    category: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    if (!shouldTrack()) return

    const event: MobileAnalyticsEvent = {
      type,
      action,
      category,
      label,
      value,
      metadata: {
        ...metadata,
        pathname,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        connectionType: (navigator as any).connection?.effectiveType,
        batteryLevel: performanceData.current.batteryLevel,
        memoryUsage: performanceData.current.memoryUsage
      },
      timestamp: Date.now(),
      sessionId: sessionId.current
    }

    events.current.push(event)

    // Auto-flush if batch size reached
    if (events.current.length >= opts.batchSize) {
      flushEvents()
    }
  }, [shouldTrack, pathname, opts.batchSize])

  // Touch heatmap tracking
  useEffect(() => {
    if (!opts.enableTouchHeatmap || !shouldTrack()) return

    const handleTouch = (e: TouchEvent, touchType: TouchHeatmapData['touchType']) => {
      Array.from(e.touches).forEach(touch => {
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        
        touchHeatmap.current.push({
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
          elementSelector: element ? getElementSelector(element) : undefined,
          touchType
        })

        // Track touch interaction
        trackEvent('touch', touchType, 'heatmap', element ? getElementSelector(element) : 'unknown', undefined, {
          x: touch.clientX,
          y: touch.clientY,
          viewportX: touch.clientX / window.innerWidth,
          viewportY: touch.clientY / window.innerHeight
        })
      })
    }

    const handleTouchStart = (e: TouchEvent) => handleTouch(e, 'start')
    const handleTouchMove = (e: TouchEvent) => handleTouch(e, 'move')
    const handleTouchEnd = (e: TouchEvent) => handleTouch(e, 'end')

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [opts.enableTouchHeatmap, shouldTrack, trackEvent, getElementSelector])

  // Gesture tracking
  useEffect(() => {
    if (!opts.enableGestureTracking || !shouldTrack()) return

    let touchStartTime = 0
    let touchStartPos = { x: 0, y: 0 }
    let touchEndPos = { x: 0, y: 0 }
    let startElement: Element | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartTime = Date.now()
      touchStartPos = { x: touch.clientX, y: touch.clientY }
      startElement = document.elementFromPoint(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      touchEndPos = { x: touch.clientX, y: touch.clientY }
      const duration = Date.now() - touchStartTime
      
      const deltaX = touchEndPos.x - touchStartPos.x
      const deltaY = touchEndPos.y - touchStartPos.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = distance / duration

      // Determine gesture type
      if (duration > 500 && distance < 10) {
        // Long press
        const gestureData: GestureTrackingData = {
          type: 'longpress',
          duration,
          elementSelector: startElement ? getElementSelector(startElement) : undefined
        }
        
        trackEvent('gesture', 'longpress', 'interaction', gestureData.elementSelector, duration, gestureData)
      } else if (distance > 50) {
        // Swipe
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up')

        const gestureData: GestureTrackingData = {
          type: 'swipe',
          direction,
          duration,
          distance,
          velocity,
          elementSelector: startElement ? getElementSelector(startElement) : undefined
        }

        trackEvent('gesture', 'swipe', 'interaction', `${direction}_${gestureData.elementSelector}`, distance, gestureData)
      } else if (duration < 200 && distance < 10) {
        // Tap
        const gestureData: GestureTrackingData = {
          type: 'tap',
          duration,
          elementSelector: startElement ? getElementSelector(startElement) : undefined
        }

        trackEvent('gesture', 'tap', 'interaction', gestureData.elementSelector, undefined, gestureData)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [opts.enableGestureTracking, shouldTrack, trackEvent, getElementSelector])

  // Performance monitoring
  useEffect(() => {
    if (!opts.enablePerformanceMonitoring || !shouldTrack()) return

    // Track page load performance
    const trackPageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        performanceData.current.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart
        
        trackEvent('performance', 'page_load', 'timing', pathname, performanceData.current.pageLoadTime)
      }
    }

    // Track Web Vitals
    const trackWebVitals = () => {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        performanceData.current.largestContentfulPaint = lastEntry.startTime
        trackEvent('performance', 'lcp', 'web_vitals', pathname, lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            performanceData.current.firstContentfulPaint = entry.startTime
            trackEvent('performance', 'fcp', 'web_vitals', pathname, entry.startTime)
          }
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          const fid = (entry as any).processingStart - entry.startTime
          performanceData.current.firstInputDelay = fid
          trackEvent('performance', 'fid', 'web_vitals', pathname, fid)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        performanceData.current.cumulativeLayoutShift = clsValue
        trackEvent('performance', 'cls', 'web_vitals', pathname, clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Track memory usage
    const trackMemoryUsage = () => {
      const memory = (performance as any).memory
      if (memory) {
        performanceData.current.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize * 100
        trackEvent('performance', 'memory_usage', 'system', pathname, performanceData.current.memoryUsage)
      }
    }

    // Track battery level
    const trackBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          performanceData.current.batteryLevel = battery.level * 100
          trackEvent('performance', 'battery_level', 'system', pathname, performanceData.current.batteryLevel)
        } catch (error) {
          console.warn('Battery API not supported')
        }
      }
    }

    // Initial measurements
    setTimeout(trackPageLoad, 1000)
    trackWebVitals()
    trackMemoryUsage()
    trackBatteryLevel()

    // Periodic measurements
    const memoryInterval = setInterval(trackMemoryUsage, 30000) // Every 30 seconds
    const batteryInterval = setInterval(trackBatteryLevel, 60000) // Every minute

    return () => {
      clearInterval(memoryInterval)
      clearInterval(batteryInterval)
    }
  }, [opts.enablePerformanceMonitoring, shouldTrack, trackEvent, pathname])

  // Error tracking
  useEffect(() => {
    if (!opts.enableErrorTracking || !shouldTrack()) return

    const handleError = (event: ErrorEvent) => {
      trackEvent('error', 'javascript_error', 'runtime', event.filename, undefined, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('error', 'unhandled_promise_rejection', 'runtime', undefined, undefined, {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [opts.enableErrorTracking, shouldTrack, trackEvent])

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (events.current.length === 0) return

    try {
      const eventsToSend = [...events.current]
      events.current = []

      const payload = {
        events: eventsToSend,
        touchHeatmap: [...touchHeatmap.current],
        gestureData: [...gestureData.current],
        performanceData: { ...performanceData.current },
        sessionInfo: {
          sessionId: sessionId.current,
          duration: Date.now() - startTime.current,
          pathname
        }
      }

      // Clear sent data
      touchHeatmap.current = []
      gestureData.current = []

      await fetch(opts.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to send analytics data:', error)
      // Re-add events back to queue for retry
      events.current.unshift(...events.current)
    }
  }, [opts.apiEndpoint, pathname])

  // Set up flush timer
  useEffect(() => {
    flushTimer.current = setInterval(flushEvents, opts.flushInterval)
    
    return () => {
      if (flushTimer.current) {
        clearInterval(flushTimer.current)
        flushEvents() // Flush remaining events
      }
    }
  }, [flushEvents, opts.flushInterval])

  // Page visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushEvents() // Flush events when page becomes hidden
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [flushEvents])

  // Conversion tracking helpers
  const trackConversion = useCallback((
    event: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    trackEvent('interaction', event, 'conversion', pathname, value, metadata)
  }, [trackEvent, pathname])

  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent('interaction', success ? 'form_submit_success' : 'form_submit_error', 'form', formName)
  }, [trackEvent])

  const trackButtonClick = useCallback((buttonName: string, element?: Element) => {
    trackEvent('interaction', 'button_click', 'ui', buttonName, undefined, {
      elementSelector: element ? getElementSelector(element) : undefined
    })
  }, [trackEvent, getElementSelector])

  return {
    // Core tracking functions
    trackEvent,
    trackConversion,
    trackFormSubmission,
    trackButtonClick,
    flushEvents,
    
    // Session info
    sessionId: sessionId.current,
    
    // Current data
    currentEvents: events.current.length,
    currentHeatmapPoints: touchHeatmap.current.length,
    currentGestures: gestureData.current.length,
    
    // Performance data
    performanceMetrics: performanceData.current,
    
    // Utility functions
    isTracking: shouldTrack(),
    getElementSelector
  }
}

export default useMobileAnalytics
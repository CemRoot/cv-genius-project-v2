'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PerformanceMetrics {
  fps: number
  avgFps: number
  memoryUsage: number // MB
  touchResponseTime: number // ms
  scrollFps: number
  renderTime: number // ms
  domNodes: number
  isLowEnd: boolean
  networkType: string
  connectionSpeed: number // Mbps
}

export interface PerformanceThresholds {
  lowFpsThreshold?: number
  highMemoryThreshold?: number // MB
  slowTouchThreshold?: number // ms
  lowEndDeviceThreshold?: number // Combined score 0-100
}

export interface MobilePerformanceOptions {
  enableFpsMonitoring?: boolean
  enableMemoryMonitoring?: boolean
  enableTouchMonitoring?: boolean
  enableScrollMonitoring?: boolean
  enableNetworkMonitoring?: boolean
  monitoringInterval?: number // ms
  fpsCalculationWindow?: number // frames
  onPerformanceChange?: (metrics: PerformanceMetrics) => void
  onLowPerformanceDetected?: (metrics: PerformanceMetrics) => void
  thresholds?: PerformanceThresholds
}

const defaultOptions: Required<MobilePerformanceOptions> = {
  enableFpsMonitoring: true,
  enableMemoryMonitoring: true,
  enableTouchMonitoring: true,
  enableScrollMonitoring: true,
  enableNetworkMonitoring: true,
  monitoringInterval: 1000,
  fpsCalculationWindow: 60,
  onPerformanceChange: () => {},
  onLowPerformanceDetected: () => {},
  thresholds: {
    lowFpsThreshold: 45,
    highMemoryThreshold: 100,
    slowTouchThreshold: 100,
    lowEndDeviceThreshold: 30,
  }
}

export function useMobilePerformance(options: MobilePerformanceOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    memoryUsage: 0,
    touchResponseTime: 0,
    scrollFps: 60,
    renderTime: 0,
    domNodes: 0,
    isLowEnd: false,
    networkType: 'unknown',
    connectionSpeed: 0,
  })

  // Simple FPS tracking
  const frameCount = useRef<number>(0)
  const lastTime = useRef<number>(performance.now())

  // Measure memory usage
  const measureMemory = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return Math.round(memory.usedJSHeapSize / 1024 / 1024) // Convert to MB
    }
    return 0
  }, [])

  // Measure network info
  const measureNetwork = useCallback(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection
      return {
        type: conn.effectiveType || 'unknown',
        speed: conn.downlink || 0
      }
    }
    return { type: 'unknown', speed: 0 }
  }, [])

  // Simple FPS measurement
  const measureFps = useCallback(() => {
    const now = performance.now()
    frameCount.current++
    
    if (now - lastTime.current >= 1000) {
      const fps = frameCount.current
      setMetrics(prev => ({
        ...prev,
        fps,
        avgFps: Math.round((prev.avgFps + fps) / 2)
      }))
      
      frameCount.current = 0
      lastTime.current = now
    }
    
    if (opts.enableFpsMonitoring) {
      requestAnimationFrame(measureFps)
    }
  }, [opts.enableFpsMonitoring])

  // Touch response measurement
  const touchStartTime = useRef<number>(0)
  
  const handleTouchStart = useCallback(() => {
    touchStartTime.current = performance.now()
  }, [])
  
  const handleTouchEnd = useCallback(() => {
    if (touchStartTime.current > 0) {
      const responseTime = performance.now() - touchStartTime.current
      setMetrics(prev => ({
        ...prev,
        touchResponseTime: Math.round(responseTime)
      }))
      touchStartTime.current = 0
    }
  }, [])

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    setMetrics(prev => {
      const memoryUsage = measureMemory()
      const domNodes = document.getElementsByTagName('*').length
      const network = measureNetwork()
      
      const newMetrics = {
        ...prev,
        memoryUsage,
        domNodes,
        networkType: network.type,
        connectionSpeed: network.speed,
      }
      
      // Simple device classification
      newMetrics.isLowEnd = newMetrics.avgFps < 45 || newMetrics.memoryUsage > 100
      
      // Check for low performance
      const isLowPerformance = 
        newMetrics.avgFps < (opts.thresholds?.lowFpsThreshold || 45) ||
        newMetrics.memoryUsage > (opts.thresholds?.highMemoryThreshold || 100) ||
        newMetrics.touchResponseTime > (opts.thresholds?.slowTouchThreshold || 100)

      if (isLowPerformance) {
        opts.onLowPerformanceDetected?.(newMetrics)
      }
      
      opts.onPerformanceChange?.(newMetrics)
      return newMetrics
    })
  }, [measureMemory, measureNetwork, opts])

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = []
    
    if (metrics.avgFps < 45) {
      recommendations.push('Consider reducing animation complexity')
    }
    
    if (metrics.memoryUsage > 100) {
      recommendations.push('Optimize images and assets')
    }
    
    if (metrics.touchResponseTime > 100) {
      recommendations.push('Reduce touch event handler complexity')
    }
    
    if (metrics.domNodes > 1000) {
      recommendations.push('Implement virtualization for large lists')
    }
    
    if (metrics.connectionSpeed < 1) {
      recommendations.push('Optimize for slow networks')
    }
    
    return recommendations
  }, [metrics])

  // Performance grade
  const getPerformanceGrade = useCallback(() => {
    const fpsScore = (metrics.avgFps / 60) * 25
    const memoryScore = Math.max(0, (200 - metrics.memoryUsage) / 200) * 25
    const touchScore = Math.max(0, (200 - metrics.touchResponseTime) / 200) * 25
    const networkScore = Math.min(metrics.connectionSpeed / 10, 1) * 25
    
    const totalScore = fpsScore + memoryScore + touchScore + networkScore
    
    if (totalScore >= 85) return 'A'
    if (totalScore >= 70) return 'B'
    if (totalScore >= 55) return 'C'
    if (totalScore >= 40) return 'D'
    return 'F'
  }, [metrics])

  // Setup monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Start FPS monitoring
    if (opts.enableFpsMonitoring) {
      measureFps()
    }

    // Setup touch monitoring
    if (opts.enableTouchMonitoring) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    // Setup periodic metrics update
    const interval = setInterval(updateMetrics, opts.monitoringInterval)

    return () => {
      clearInterval(interval)
      if (opts.enableTouchMonitoring) {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [
    opts.enableFpsMonitoring,
    opts.enableTouchMonitoring,
    opts.monitoringInterval,
    measureFps,
    handleTouchStart,
    handleTouchEnd,
    updateMetrics
  ])

  return {
    // Current metrics
    ...metrics,
    
    // Analysis
    recommendations: getRecommendations(),
    grade: getPerformanceGrade(),
    
    // Control functions
    reset: () => {
      frameCount.current = 0
      lastTime.current = performance.now()
      touchStartTime.current = 0
    },
    
    // Manual measurements
    measureNow: updateMetrics,
    
    // Utility functions
    isHighPerformance: () => getPerformanceGrade() === 'A',
    shouldReduceAnimations: () => metrics.avgFps < 45 || metrics.isLowEnd,
    shouldOptimizeImages: () => metrics.memoryUsage > 80 || metrics.connectionSpeed < 1,
    shouldUseVirtualization: () => metrics.domNodes > 500 || metrics.isLowEnd,
  }
}

export default useMobilePerformance
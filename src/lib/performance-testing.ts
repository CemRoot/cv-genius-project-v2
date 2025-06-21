// Performance Testing Framework for CVGenius Mobile
// Comprehensive performance monitoring and testing utilities

export interface PerformanceMetrics {
  // Core Web Vitals
  largestContentfulPaint: number | null
  firstInputDelay: number | null
  cumulativeLayoutShift: number | null
  
  // Additional Metrics
  firstContentfulPaint: number | null
  timeToInteractive: number | null
  totalBlockingTime: number | null
  
  // Custom Metrics
  domContentLoaded: number
  windowLoad: number
  firstPaint: number | null
  
  // Mobile-specific
  batteryLevel: number | null
  deviceMemory: number | null
  effectiveConnectionType: string | null
  
  // Page-specific
  resourceCount: number
  resourceSize: number
  jsErrors: number
}

export interface PerformanceTest {
  id: string
  name: string
  description: string
  category: 'core' | 'mobile' | 'network' | 'memory' | 'battery'
  run: () => Promise<PerformanceTestResult>
}

export interface PerformanceTestResult {
  testId: string
  passed: boolean
  score: number // 0-100
  metrics: Record<string, number>
  recommendations: string[]
  timestamp: Date
  userAgent: string
  url: string
}

export interface PerformanceReport {
  overall: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
  }
  webVitals: {
    lcp: { value: number | null; score: number; status: 'good' | 'needs-improvement' | 'poor' }
    fid: { value: number | null; score: number; status: 'good' | 'needs-improvement' | 'poor' }
    cls: { value: number | null; score: number; status: 'good' | 'needs-improvement' | 'poor' }
  }
  categories: Record<string, {
    score: number
    tests: PerformanceTestResult[]
    recommendations: string[]
  }>
  device: {
    mobile: boolean
    lowEnd: boolean
    network: string
    memory: number
  }
}

// Performance thresholds based on Google's Web Vitals
const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },   // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTI: { good: 3800, poor: 7300 }, // Time to Interactive (ms)
  TBT: { good: 200, poor: 600 }    // Total Blocking Time (ms)
}

// Performance observer for Web Vitals
class WebVitalsObserver {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    this.observeWebVitals()
  }

  private observeWebVitals() {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.largestContentfulPaint = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        }
        this.metrics.cumulativeLayoutShift = cls
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime
          }
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime
          }
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(fcpObserver)

    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
  }
}

// Global Web Vitals observer instance
let webVitalsObserver: WebVitalsObserver | null = null

export function startPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return
  
  if (!webVitalsObserver) {
    webVitalsObserver = new WebVitalsObserver()
  }
}

export function stopPerformanceMonitoring(): void {
  if (webVitalsObserver) {
    webVitalsObserver.disconnect()
    webVitalsObserver = null
  }
}

// Collect comprehensive performance metrics
export async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const vitals = webVitalsObserver?.getMetrics() || {}
  
  // Get battery info if available
  let batteryLevel: number | null = null
  try {
    const battery = await (navigator as any).getBattery?.()
    batteryLevel = battery ? battery.level * 100 : null
  } catch {
    // Battery API not supported
  }

  // Get device memory if available
  const deviceMemory = (navigator as any).deviceMemory || null

  // Get connection info if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  const effectiveConnectionType = connection?.effectiveType || null

  // Count resources and calculate total size
  const resources = performance.getEntriesByType('resource')
  const resourceSize = resources.reduce((total, resource: any) => {
    return total + (resource.transferSize || 0)
  }, 0)

  // Count JS errors (this would be set up separately in error handling)
  const jsErrors = (window as any).__jsErrorCount__ || 0

  return {
    // Core Web Vitals
    largestContentfulPaint: vitals.largestContentfulPaint || null,
    firstInputDelay: vitals.firstInputDelay || null,
    cumulativeLayoutShift: vitals.cumulativeLayoutShift || null,
    
    // Additional metrics
    firstContentfulPaint: vitals.firstContentfulPaint || null,
    timeToInteractive: null, // Would need separate calculation
    totalBlockingTime: null, // Would need separate calculation
    
    // Navigation timing
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    windowLoad: navigation.loadEventEnd - navigation.fetchStart,
    firstPaint: vitals.firstPaint || null,
    
    // Device/connection info
    batteryLevel,
    deviceMemory,
    effectiveConnectionType,
    
    // Resource info
    resourceCount: resources.length,
    resourceSize,
    jsErrors
  }
}

// Core performance tests
export const PERFORMANCE_TESTS: PerformanceTest[] = [
  {
    id: 'lcp-test',
    name: 'Largest Contentful Paint',
    description: 'Measures when the largest content element is rendered',
    category: 'core',
    run: async () => {
      const metrics = await collectPerformanceMetrics()
      const lcp = metrics.largestContentfulPaint || 0
      
      let score = 100
      if (lcp > WEB_VITALS_THRESHOLDS.LCP.poor) score = 0
      else if (lcp > WEB_VITALS_THRESHOLDS.LCP.good) score = 50
      
      const recommendations: string[] = []
      if (lcp > WEB_VITALS_THRESHOLDS.LCP.good) {
        recommendations.push('Optimize images and use modern formats like WebP')
        recommendations.push('Preload important resources')
        recommendations.push('Remove unused CSS and JavaScript')
      }

      return {
        testId: 'lcp-test',
        passed: lcp <= WEB_VITALS_THRESHOLDS.LCP.good,
        score,
        metrics: { lcp },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  },
  {
    id: 'cls-test',
    name: 'Cumulative Layout Shift',
    description: 'Measures visual stability by tracking layout shifts',
    category: 'core',
    run: async () => {
      const metrics = await collectPerformanceMetrics()
      const cls = metrics.cumulativeLayoutShift || 0
      
      let score = 100
      if (cls > WEB_VITALS_THRESHOLDS.CLS.poor) score = 0
      else if (cls > WEB_VITALS_THRESHOLDS.CLS.good) score = 50
      
      const recommendations: string[] = []
      if (cls > WEB_VITALS_THRESHOLDS.CLS.good) {
        recommendations.push('Set explicit dimensions for images and videos')
        recommendations.push('Avoid inserting content above existing content')
        recommendations.push('Use CSS transforms for animations')
      }

      return {
        testId: 'cls-test',
        passed: cls <= WEB_VITALS_THRESHOLDS.CLS.good,
        score,
        metrics: { cls },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  },
  {
    id: 'mobile-performance',
    name: 'Mobile Performance',
    description: 'Tests performance on mobile devices with limited resources',
    category: 'mobile',
    run: async () => {
      const startTime = performance.now()
      
      // Simulate mobile workload
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 300
      const ctx = canvas.getContext('2d')!
      
      // Draw test to measure canvas performance
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`
        ctx.fillRect(Math.random() * 300, Math.random() * 300, 10, 10)
      }
      
      const canvasTime = performance.now() - startTime
      
      // Test JavaScript performance
      const jsStart = performance.now()
      let sum = 0
      for (let i = 0; i < 10000; i++) {
        sum += Math.sqrt(i)
      }
      const jsTime = performance.now() - jsStart
      
      const totalTime = canvasTime + jsTime
      let score = Math.max(0, 100 - (totalTime / 10)) // Score based on total time
      
      const recommendations: string[] = []
      if (totalTime > 100) {
        recommendations.push('Consider reducing visual complexity on mobile')
        recommendations.push('Use CSS transforms instead of JavaScript animations')
        recommendations.push('Implement progressive loading for heavy content')
      }

      return {
        testId: 'mobile-performance',
        passed: totalTime < 50,
        score,
        metrics: { canvasTime, jsTime, totalTime },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    description: 'Monitors JavaScript heap memory usage',
    category: 'memory',
    run: async () => {
      const memory = (performance as any).memory
      if (!memory) {
        return {
          testId: 'memory-usage',
          passed: false,
          score: 0,
          metrics: { memoryAvailable: 0 },
          recommendations: ['Memory API not available in this browser'],
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }

      const usedMemory = memory.usedJSHeapSize
      const totalMemory = memory.totalJSHeapSize
      const memoryUsage = (usedMemory / totalMemory) * 100
      
      let score = Math.max(0, 100 - memoryUsage)
      
      const recommendations: string[] = []
      if (memoryUsage > 80) {
        recommendations.push('High memory usage detected')
        recommendations.push('Clear unused variables and event listeners')
        recommendations.push('Consider lazy loading for large datasets')
      }

      return {
        testId: 'memory-usage',
        passed: memoryUsage < 70,
        score,
        metrics: { usedMemory, totalMemory, memoryUsage },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  },
  {
    id: 'network-efficiency',
    name: 'Network Efficiency',
    description: 'Evaluates network usage and resource loading',
    category: 'network',
    run: async () => {
      const metrics = await collectPerformanceMetrics()
      const resourceSize = metrics.resourceSize
      const resourceCount = metrics.resourceCount
      
      // Score based on resource efficiency
      let score = 100
      if (resourceSize > 5000000) score -= 30 // > 5MB
      if (resourceCount > 100) score -= 20    // > 100 resources
      if (resourceSize > 10000000) score = 0  // > 10MB
      
      const recommendations: string[] = []
      if (resourceSize > 2000000) {
        recommendations.push('Large resource size detected - consider compression')
        recommendations.push('Use modern image formats (WebP, AVIF)')
        recommendations.push('Implement lazy loading for images')
      }
      if (resourceCount > 50) {
        recommendations.push('Many resources detected - consider bundling')
        recommendations.push('Use HTTP/2 server push for critical resources')
      }

      return {
        testId: 'network-efficiency',
        passed: resourceSize < 3000000 && resourceCount < 75,
        score: Math.max(0, score),
        metrics: { resourceSize, resourceCount },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  },
  {
    id: 'battery-impact',
    name: 'Battery Impact',
    description: 'Assesses impact on device battery life',
    category: 'battery',
    run: async () => {
      const metrics = await collectPerformanceMetrics()
      
      // Estimate battery impact based on various factors
      let batteryScore = 100
      
      // High CPU usage indicators
      if (metrics.jsErrors > 5) batteryScore -= 20
      if (metrics.resourceCount > 100) batteryScore -= 15
      
      // Connection type impact
      if (metrics.effectiveConnectionType === '2g' || metrics.effectiveConnectionType === 'slow-2g') {
        batteryScore -= 25
      }
      
      const recommendations: string[] = []
      if (batteryScore < 70) {
        recommendations.push('Reduce background processing')
        recommendations.push('Optimize animations and transitions')
        recommendations.push('Use efficient algorithms for heavy computations')
      }
      
      if (metrics.batteryLevel && metrics.batteryLevel < 20) {
        recommendations.push('Device battery is low - consider enabling power saving mode')
      }

      return {
        testId: 'battery-impact',
        passed: batteryScore >= 70,
        score: Math.max(0, batteryScore),
        metrics: { 
          batteryLevel: metrics.batteryLevel || 0,
          estimatedImpact: 100 - batteryScore
        },
        recommendations,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
  }
]

// Run all performance tests
export async function runPerformanceTests(): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []
  
  for (const test of PERFORMANCE_TESTS) {
    try {
      const result = await test.run()
      results.push(result)
    } catch (error) {
      console.error(`Performance test ${test.id} failed:`, error)
      results.push({
        testId: test.id,
        passed: false,
        score: 0,
        metrics: {},
        recommendations: [`Test failed: ${error}`],
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }
  }
  
  return results
}

// Generate performance report
export async function generatePerformanceReport(): Promise<PerformanceReport> {
  const testResults = await runPerformanceTests()
  const metrics = await collectPerformanceMetrics()
  
  // Calculate Web Vitals scores
  const webVitals = {
    lcp: calculateWebVitalScore(metrics.largestContentfulPaint, WEB_VITALS_THRESHOLDS.LCP),
    fid: calculateWebVitalScore(metrics.firstInputDelay, WEB_VITALS_THRESHOLDS.FID),
    cls: calculateWebVitalScore(metrics.cumulativeLayoutShift, WEB_VITALS_THRESHOLDS.CLS)
  }
  
  // Group results by category
  const categories: Record<string, {
    score: number
    tests: PerformanceTestResult[]
    recommendations: string[]
  }> = {}
  
  PERFORMANCE_TESTS.forEach(test => {
    const results = testResults.filter(r => r.testId === test.id)
    const categoryResults = results.length > 0 ? results : []
    const avgScore = categoryResults.length > 0 
      ? categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length 
      : 0
    
    if (!categories[test.category]) {
      categories[test.category] = {
        score: 0,
        tests: [],
        recommendations: []
      }
    }
    
    categories[test.category].tests.push(...categoryResults)
    categories[test.category].score = avgScore
    categories[test.category].recommendations.push(
      ...categoryResults.flatMap(r => r.recommendations)
    )
  })
  
  // Calculate overall score
  const overallScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0) / Object.keys(categories).length
  
  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (overallScore >= 90) grade = 'A'
  else if (overallScore >= 80) grade = 'B'
  else if (overallScore >= 70) grade = 'C'
  else if (overallScore >= 60) grade = 'D'
  else grade = 'F'
  
  // Device detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isLowEnd = (metrics.deviceMemory || 4) <= 2
  
  return {
    overall: {
      score: Math.round(overallScore),
      grade,
      summary: generatePerformanceSummary(grade, overallScore)
    },
    webVitals,
    categories,
    device: {
      mobile: isMobile,
      lowEnd: isLowEnd,
      network: metrics.effectiveConnectionType || 'unknown',
      memory: metrics.deviceMemory || 0
    }
  }
}

function calculateWebVitalScore(value: number | null, thresholds: { good: number; poor: number }) {
  if (value === null) {
    return { value, score: 0, status: 'poor' as const }
  }
  
  let score: number
  let status: 'good' | 'needs-improvement' | 'poor'
  
  if (value <= thresholds.good) {
    score = 100
    status = 'good'
  } else if (value <= thresholds.poor) {
    score = 50
    status = 'needs-improvement'
  } else {
    score = 0
    status = 'poor'
  }
  
  return { value, score, status }
}

function generatePerformanceSummary(grade: string, score: number): string {
  switch (grade) {
    case 'A':
      return 'Excellent performance! Your experience with CVGenius should be very smooth.'
    case 'B':
      return 'Good performance with minor areas for improvement.'
    case 'C':
      return 'Fair performance. Some features may feel slower than optimal.'
    case 'D':
      return 'Below average performance. Consider optimizing your setup.'
    case 'F':
      return 'Poor performance detected. Significant issues may impact your experience.'
    default:
      return 'Performance analysis complete.'
  }
}

// Start monitoring when module loads
if (typeof window !== 'undefined') {
  startPerformanceMonitoring()
}

export default {
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
  collectPerformanceMetrics,
  runPerformanceTests,
  generatePerformanceReport,
  PERFORMANCE_TESTS,
  WEB_VITALS_THRESHOLDS
}
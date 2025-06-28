'use client'

// Performance monitoring utilities
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  mark(name: string) {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark)
    const end = endMark ? this.marks.get(endMark) : performance.now()

    if (start && end) {
      const duration = end - start
      this.measures.set(name, duration)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      }
      
      return duration
    }
    
    return 0
  }

  getMetrics() {
    return {
      marks: Object.fromEntries(this.marks),
      measures: Object.fromEntries(this.measures)
    }
  }

  clear() {
    this.marks.clear()
    this.measures.clear()
  }
}

// Create singleton instance
export const perfMonitor = new PerformanceMonitor()

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Request idle callback wrapper
export function requestIdleCallbackWrapper(
  callback: () => void,
  options?: { timeout?: number }
) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options)
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, options?.timeout || 1)
  }
}

// Memory cache with LRU eviction
export class MemoryCache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map()
  private maxSize: number
  private ttl: number // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, item)
    
    return item.value
  }

  set(key: string, value: T) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// Batch operations for performance
export class BatchProcessor<T> {
  private queue: T[] = []
  private processing = false
  private batchSize: number
  private delay: number
  private processor: (items: T[]) => Promise<void>

  constructor(
    processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.delay = delay
  }

  add(item: T) {
    this.queue.push(item)
    this.processQueue()
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    // Wait for more items or process after delay
    await new Promise(resolve => setTimeout(resolve, this.delay))
    
    // Process batch
    const batch = this.queue.splice(0, this.batchSize)
    
    try {
      await this.processor(batch)
    } catch (error) {
      console.error('Batch processing error:', error)
    }
    
    this.processing = false
    
    // Process remaining items
    if (this.queue.length > 0) {
      this.processQueue()
    }
  }

  flush() {
    return this.processQueue()
  }
}

// Web vitals monitoring
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log('Web Vitals:', metric)
    
    // You can send to your analytics service here
    // Example: sendToAnalytics(metric)
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }
  
  document.head.appendChild(link)
}

// Lazy load scripts
export function lazyLoadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
}

// Image optimization helper
export function getOptimizedImageSrc(
  src: string,
  options: {
    width?: number
    quality?: number
    format?: 'webp' | 'avif' | 'auto'
  } = {}
): string {
  // If using a CDN that supports image optimization
  const params = new URLSearchParams()
  
  if (options.width) params.append('w', options.width.toString())
  if (options.quality) params.append('q', options.quality.toString())
  if (options.format) params.append('fm', options.format)
  
  return params.toString() ? `${src}?${params}` : src
}
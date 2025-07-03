// Ad Performance Tracking System
// Tracks impressions, clicks, revenue, and other metrics for each ad placement

export interface AdMetrics {
  impressions: number
  clicks: number
  revenue: number
  lastUpdated: string
}

export interface AdPerformanceData {
  [adSlotId: string]: AdMetrics
}

export interface DailyMetrics {
  date: string
  metrics: AdPerformanceData
  totalRevenue: number
  totalImpressions: number
  totalClicks: number
}

export interface AdEvent {
  type: 'impression' | 'click' | 'conversion'
  adSlotId: string
  timestamp: string
  revenue?: number
  userId?: string
  sessionId?: string
  device?: 'desktop' | 'mobile' | 'tablet'
  platform?: string
}

// In-memory storage for performance data
class AdPerformanceTracker {
  private static instance: AdPerformanceTracker
  private performanceData: AdPerformanceData = {}
  private dailyMetrics: Map<string, DailyMetrics> = new Map()
  private events: AdEvent[] = []
  private readonly maxEvents = 10000 // Keep last 10k events

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): AdPerformanceTracker {
    if (!AdPerformanceTracker.instance) {
      AdPerformanceTracker.instance = new AdPerformanceTracker()
    }
    return AdPerformanceTracker.instance
  }

  // Track an ad event
  trackEvent(event: AdEvent): void {
    // Add event to queue
    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.shift() // Remove oldest event
    }

    // Update metrics
    const adSlotId = event.adSlotId
    if (!this.performanceData[adSlotId]) {
      this.performanceData[adSlotId] = {
        impressions: 0,
        clicks: 0,
        revenue: 0,
        lastUpdated: new Date().toISOString()
      }
    }

    const metrics = this.performanceData[adSlotId]
    
    switch (event.type) {
      case 'impression':
        metrics.impressions++
        break
      case 'click':
        metrics.clicks++
        if (event.revenue) {
          metrics.revenue += event.revenue
        }
        break
      case 'conversion':
        if (event.revenue) {
          metrics.revenue += event.revenue
        }
        break
    }

    metrics.lastUpdated = new Date().toISOString()

    // Update daily metrics
    this.updateDailyMetrics(event)

    // Save to storage
    this.saveToStorage()
  }

  // Track impression
  trackImpression(adSlotId: string, device?: 'desktop' | 'mobile' | 'tablet'): void {
    this.trackEvent({
      type: 'impression',
      adSlotId,
      timestamp: new Date().toISOString(),
      device
    })
  }

  // Track click
  trackClick(adSlotId: string, revenue?: number, device?: 'desktop' | 'mobile' | 'tablet'): void {
    this.trackEvent({
      type: 'click',
      adSlotId,
      timestamp: new Date().toISOString(),
      revenue,
      device
    })
  }

  // Get performance metrics for a specific ad slot
  getAdMetrics(adSlotId: string): AdMetrics | null {
    return this.performanceData[adSlotId] || null
  }

  // Get all performance data
  getAllMetrics(): AdPerformanceData {
    return { ...this.performanceData }
  }

  // Get aggregated metrics
  getAggregatedMetrics(): {
    totalImpressions: number
    totalClicks: number
    totalRevenue: number
    averageCTR: number
    topPerformingAds: Array<{ adSlotId: string; ctr: number; revenue: number }>
  } {
    let totalImpressions = 0
    let totalClicks = 0
    let totalRevenue = 0
    const adPerformance: Array<{ adSlotId: string; ctr: number; revenue: number }> = []

    Object.entries(this.performanceData).forEach(([adSlotId, metrics]) => {
      totalImpressions += metrics.impressions
      totalClicks += metrics.clicks
      totalRevenue += metrics.revenue

      const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
      adPerformance.push({ adSlotId, ctr, revenue: metrics.revenue })
    })

    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    // Sort by revenue and get top 5
    const topPerformingAds = adPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      totalImpressions,
      totalClicks,
      totalRevenue,
      averageCTR,
      topPerformingAds
    }
  }

  // Get daily metrics for a date range
  getDailyMetrics(startDate: string, endDate: string): DailyMetrics[] {
    const metrics: DailyMetrics[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    this.dailyMetrics.forEach((dayMetrics, date) => {
      const metricDate = new Date(date)
      if (metricDate >= start && metricDate <= end) {
        metrics.push(dayMetrics)
      }
    })

    return metrics.sort((a, b) => a.date.localeCompare(b.date))
  }

  // Get metrics by time period
  getMetricsByPeriod(period: 'today' | 'week' | 'month'): {
    current: { impressions: number; clicks: number; revenue: number }
    previous: { impressions: number; clicks: number; revenue: number }
    growth: { impressions: number; clicks: number; revenue: number }
  } {
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 1)
        previousEndDate = new Date(startDate)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(startDate)
        previousStartDate.setMonth(previousStartDate.getMonth() - 1)
        previousEndDate = new Date(startDate)
        previousEndDate.setDate(0) // Last day of previous month
        break
    }

    const current = this.calculatePeriodMetrics(startDate, now)
    const previous = this.calculatePeriodMetrics(previousStartDate, previousEndDate)

    const growth = {
      impressions: previous.impressions > 0 
        ? ((current.impressions - previous.impressions) / previous.impressions) * 100 
        : 0,
      clicks: previous.clicks > 0 
        ? ((current.clicks - previous.clicks) / previous.clicks) * 100 
        : 0,
      revenue: previous.revenue > 0 
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100 
        : 0
    }

    return { current, previous, growth }
  }

  // Reset metrics for an ad slot
  resetAdMetrics(adSlotId: string): void {
    delete this.performanceData[adSlotId]
    this.saveToStorage()
  }

  // Reset all metrics
  resetAllMetrics(): void {
    this.performanceData = {}
    this.dailyMetrics.clear()
    this.events = []
    this.saveToStorage()
  }

  // Private methods
  private updateDailyMetrics(event: AdEvent): void {
    const date = new Date(event.timestamp)
    const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

    if (!this.dailyMetrics.has(dateKey)) {
      this.dailyMetrics.set(dateKey, {
        date: dateKey,
        metrics: {},
        totalRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0
      })
    }

    const daily = this.dailyMetrics.get(dateKey)!
    
    if (!daily.metrics[event.adSlotId]) {
      daily.metrics[event.adSlotId] = {
        impressions: 0,
        clicks: 0,
        revenue: 0,
        lastUpdated: event.timestamp
      }
    }

    const slotMetrics = daily.metrics[event.adSlotId]

    switch (event.type) {
      case 'impression':
        slotMetrics.impressions++
        daily.totalImpressions++
        break
      case 'click':
        slotMetrics.clicks++
        daily.totalClicks++
        if (event.revenue) {
          slotMetrics.revenue += event.revenue
          daily.totalRevenue += event.revenue
        }
        break
      case 'conversion':
        if (event.revenue) {
          slotMetrics.revenue += event.revenue
          daily.totalRevenue += event.revenue
        }
        break
    }

    slotMetrics.lastUpdated = event.timestamp
  }

  private calculatePeriodMetrics(startDate: Date, endDate: Date): {
    impressions: number
    clicks: number
    revenue: number
  } {
    let impressions = 0
    let clicks = 0
    let revenue = 0

    this.events.forEach(event => {
      const eventDate = new Date(event.timestamp)
      if (eventDate >= startDate && eventDate <= endDate) {
        switch (event.type) {
          case 'impression':
            impressions++
            break
          case 'click':
            clicks++
            if (event.revenue) revenue += event.revenue
            break
          case 'conversion':
            if (event.revenue) revenue += event.revenue
            break
        }
      }
    })

    return { impressions, clicks, revenue }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      // Load from localStorage
      const storedData = localStorage.getItem('ad-performance-data')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        this.performanceData = parsed.performanceData || {}
        this.events = parsed.events || []
        
        // Reconstruct daily metrics from events
        this.reconstructDailyMetrics()
      }

      // Also check for environment variable data in production
      if (process.env.AD_PERFORMANCE_DATA) {
        try {
          const envData = JSON.parse(process.env.AD_PERFORMANCE_DATA)
          // Merge with existing data
          Object.assign(this.performanceData, envData.performanceData || {})
        } catch (e) {
          console.error('Failed to parse AD_PERFORMANCE_DATA:', e)
        }
      }
    } catch (error) {
      console.error('Failed to load ad performance data:', error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const dataToStore = {
        performanceData: this.performanceData,
        events: this.events.slice(-1000), // Store only last 1000 events
        lastUpdated: new Date().toISOString()
      }

      localStorage.setItem('ad-performance-data', JSON.stringify(dataToStore))

      // Log for production deployment
      console.log('💾 Ad performance data saved')
      console.log('⚠️  For production persistence, set AD_PERFORMANCE_DATA env var')
    } catch (error) {
      console.error('Failed to save ad performance data:', error)
    }
  }

  private reconstructDailyMetrics(): void {
    this.dailyMetrics.clear()
    
    // Rebuild daily metrics from events
    this.events.forEach(event => {
      this.updateDailyMetrics(event)
    })
  }
}

// Export singleton instance
export const adPerformanceTracker = AdPerformanceTracker.getInstance()

// Helper function to format revenue
export function formatRevenue(revenue: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(revenue)
}

// Helper function to format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Helper function to calculate CTR
export function calculateCTR(clicks: number, impressions: number): number {
  return impressions > 0 ? (clicks / impressions) * 100 : 0
}
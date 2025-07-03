// Client-side ad tracking utility
// Tracks impressions and clicks for ad performance analytics

interface TrackingOptions {
  adSlotId: string
  type: 'impression' | 'click'
  revenue?: number
  device?: 'desktop' | 'mobile' | 'tablet'
}

class AdTracker {
  private static instance: AdTracker
  private impressionCache: Set<string> = new Set()
  private trackingQueue: TrackingOptions[] = []
  private isProcessing = false
  private readonly batchSize = 10
  private readonly batchDelay = 1000 // 1 second

  private constructor() {
    // Start batch processing
    this.processBatch()
  }

  static getInstance(): AdTracker {
    if (!AdTracker.instance) {
      AdTracker.instance = new AdTracker()
    }
    return AdTracker.instance
  }

  // Track an ad impression
  trackImpression(adSlotId: string): void {
    // Avoid duplicate impressions in the same session
    const impressionKey = `${adSlotId}-${Date.now()}`
    if (this.impressionCache.has(impressionKey)) {
      return
    }

    this.impressionCache.add(impressionKey)
    
    // Clean up old impression keys (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    this.impressionCache.forEach(key => {
      const timestamp = parseInt(key.split('-').pop() || '0')
      if (timestamp < fiveMinutesAgo) {
        this.impressionCache.delete(key)
      }
    })

    this.addToQueue({
      adSlotId,
      type: 'impression',
      device: this.detectDevice()
    })
  }

  // Track an ad click
  trackClick(adSlotId: string, revenue?: number): void {
    this.addToQueue({
      adSlotId,
      type: 'click',
      revenue,
      device: this.detectDevice()
    })
  }

  // Add tracking event to queue
  private addToQueue(event: TrackingOptions): void {
    this.trackingQueue.push(event)
    
    // Process immediately if queue is full
    if (this.trackingQueue.length >= this.batchSize) {
      this.processBatch()
    }
  }

  // Process tracking events in batches
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.trackingQueue.length === 0) {
      // Schedule next batch
      setTimeout(() => this.processBatch(), this.batchDelay)
      return
    }

    this.isProcessing = true
    
    // Get events to process
    const eventsToProcess = this.trackingQueue.splice(0, this.batchSize)
    
    try {
      // Send events to tracking API
      for (const event of eventsToProcess) {
        await this.sendTrackingEvent(event)
      }
    } catch (error) {
      console.error('Failed to send tracking events:', error)
      // Re-add failed events to queue
      this.trackingQueue.unshift(...eventsToProcess)
    } finally {
      this.isProcessing = false
    }

    // Schedule next batch
    setTimeout(() => this.processBatch(), this.batchDelay)
  }

  // Send tracking event to API
  private async sendTrackingEvent(event: TrackingOptions): Promise<void> {
    try {
      const response = await fetch('/api/ads/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`Tracking failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Tracking error:', error)
      throw error
    }
  }

  // Detect device type
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipod/.test(userAgent)) {
      return 'mobile'
    } else if (/ipad|tablet/.test(userAgent)) {
      return 'tablet'
    }
    
    return 'desktop'
  }

  // Create intersection observer for impression tracking
  createImpressionObserver(callback: (adSlotId: string) => void): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const adSlotId = entry.target.getAttribute('data-ad-slot-id')
            if (adSlotId) {
              callback(adSlotId)
            }
          }
        })
      },
      {
        threshold: 0.5, // Ad must be 50% visible
        rootMargin: '0px'
      }
    )
  }
}

// Export singleton instance
export const adTracker = AdTracker.getInstance()

// React hook for ad tracking
export function useAdTracking(adSlotId: string, enabled: boolean = true) {
  if (typeof window === 'undefined' || !enabled) {
    return {
      trackImpression: () => {},
      trackClick: () => {}
    }
  }

  return {
    trackImpression: () => adTracker.trackImpression(adSlotId),
    trackClick: (revenue?: number) => adTracker.trackClick(adSlotId, revenue)
  }
}
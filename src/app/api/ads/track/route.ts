import { NextRequest, NextResponse } from 'next/server'
import { adPerformanceTracker } from '@/lib/ad-performance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, adSlotId, revenue, device } = body

    if (!type || !adSlotId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get user agent for device detection if not provided
    let detectedDevice = device
    if (!detectedDevice) {
      const userAgent = request.headers.get('user-agent') || ''
      if (/mobile/i.test(userAgent)) {
        detectedDevice = 'mobile'
      } else if (/tablet/i.test(userAgent)) {
        detectedDevice = 'tablet'
      } else {
        detectedDevice = 'desktop'
      }
    }

    // Track the event
    adPerformanceTracker.trackEvent({
      type,
      adSlotId,
      timestamp: new Date().toISOString(),
      revenue,
      device: detectedDevice
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to track ad event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

// GET endpoint to retrieve performance data (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adSlotId = searchParams.get('adSlotId')
    const period = searchParams.get('period') as 'today' | 'week' | 'month' | null

    if (adSlotId) {
      // Get metrics for specific ad slot
      const metrics = adPerformanceTracker.getAdMetrics(adSlotId)
      return NextResponse.json({ success: true, metrics })
    } else if (period) {
      // Get metrics by period
      const periodMetrics = adPerformanceTracker.getMetricsByPeriod(period)
      return NextResponse.json({ success: true, ...periodMetrics })
    } else {
      // Get aggregated metrics
      const aggregated = adPerformanceTracker.getAggregatedMetrics()
      return NextResponse.json({ success: true, ...aggregated })
    }

  } catch (error) {
    console.error('Failed to get ad metrics:', error)
    return NextResponse.json({ error: 'Failed to get metrics' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { adPerformanceTracker, formatRevenue, formatNumber, calculateCTR } from '@/lib/ad-performance'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'overview'
    const period = searchParams.get('period') as 'today' | 'week' | 'month' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let responseData: any = {}

    switch (view) {
      case 'overview':
        // Get aggregated metrics and period comparison
        const aggregated = adPerformanceTracker.getAggregatedMetrics()
        const periodData = period ? adPerformanceTracker.getMetricsByPeriod(period) : null

        responseData = {
          success: true,
          overview: {
            total: {
              impressions: aggregated.totalImpressions,
              clicks: aggregated.totalClicks,
              revenue: aggregated.totalRevenue,
              ctr: aggregated.averageCTR,
              formattedRevenue: formatRevenue(aggregated.totalRevenue),
              formattedImpressions: formatNumber(aggregated.totalImpressions),
              formattedClicks: formatNumber(aggregated.totalClicks)
            },
            topPerformingAds: aggregated.topPerformingAds.map(ad => ({
              ...ad,
              formattedRevenue: formatRevenue(ad.revenue),
              formattedCTR: ad.ctr.toFixed(2) + '%'
            })),
            period: periodData
          }
        }
        break

      case 'detailed':
        // Get all metrics with calculations
        const allMetrics = adPerformanceTracker.getAllMetrics()
        const detailedMetrics = Object.entries(allMetrics).map(([adSlotId, metrics]) => ({
          adSlotId,
          ...metrics,
          ctr: calculateCTR(metrics.clicks, metrics.impressions),
          formattedRevenue: formatRevenue(metrics.revenue),
          formattedCTR: calculateCTR(metrics.clicks, metrics.impressions).toFixed(2) + '%',
          ecpm: metrics.impressions > 0 ? (metrics.revenue / metrics.impressions) * 1000 : 0
        }))

        responseData = {
          success: true,
          detailed: detailedMetrics.sort((a, b) => b.revenue - a.revenue)
        }
        break

      case 'timeline':
        // Get daily metrics for date range
        if (!startDate || !endDate) {
          // Default to last 30 days
          const end = new Date()
          const start = new Date()
          start.setDate(start.getDate() - 30)
          
          const dailyMetrics = adPerformanceTracker.getDailyMetrics(
            start.toISOString(),
            end.toISOString()
          )

          responseData = {
            success: true,
            timeline: dailyMetrics.map(day => ({
              ...day,
              formattedRevenue: formatRevenue(day.totalRevenue),
              ctr: calculateCTR(day.totalClicks, day.totalImpressions)
            }))
          }
        } else {
          const dailyMetrics = adPerformanceTracker.getDailyMetrics(startDate, endDate)
          
          responseData = {
            success: true,
            timeline: dailyMetrics.map(day => ({
              ...day,
              formattedRevenue: formatRevenue(day.totalRevenue),
              ctr: calculateCTR(day.totalClicks, day.totalImpressions)
            }))
          }
        }
        break

      case 'comparison':
        // Compare different periods
        const currentPeriod = adPerformanceTracker.getMetricsByPeriod(period || 'week')
        
        responseData = {
          success: true,
          comparison: {
            current: {
              ...currentPeriod.current,
              formattedRevenue: formatRevenue(currentPeriod.current.revenue),
              ctr: calculateCTR(currentPeriod.current.clicks, currentPeriod.current.impressions)
            },
            previous: {
              ...currentPeriod.previous,
              formattedRevenue: formatRevenue(currentPeriod.previous.revenue),
              ctr: calculateCTR(currentPeriod.previous.clicks, currentPeriod.previous.impressions)
            },
            growth: {
              ...currentPeriod.growth,
              impressions: currentPeriod.growth.impressions.toFixed(1) + '%',
              clicks: currentPeriod.growth.clicks.toFixed(1) + '%',
              revenue: currentPeriod.growth.revenue.toFixed(1) + '%'
            }
          }
        }
        break
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Failed to get ad performance data:', error)
    return NextResponse.json({ error: 'Failed to get performance data' }, { status: 500 })
  }
}

// Reset performance data
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const adSlotId = searchParams.get('adSlotId')

    if (adSlotId) {
      // Reset specific ad slot metrics
      adPerformanceTracker.resetAdMetrics(adSlotId)
      return NextResponse.json({ 
        success: true, 
        message: `Metrics reset for ad slot: ${adSlotId}` 
      })
    } else {
      // Reset all metrics
      adPerformanceTracker.resetAllMetrics()
      return NextResponse.json({ 
        success: true, 
        message: 'All ad performance metrics have been reset' 
      })
    }

  } catch (error) {
    console.error('Failed to reset ad performance data:', error)
    return NextResponse.json({ error: 'Failed to reset performance data' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'

const MAINTENANCE_PATH = '/maintenance'

// In-memory cache for maintenance settings
let maintenanceCache: {
  settings: any | null
  timestamp: number
} = {
  settings: null,
  timestamp: 0
}

const CACHE_DURATION = 10000 // 10 seconds cache

export async function checkMaintenanceMode(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if user is admin (has admin cookie)
  const isAdmin = request.cookies.get('admin-authenticated')?.value === 'true'
  
  // Admins bypass maintenance mode
  if (isAdmin) {
    return null
  }

  try {
    const now = Date.now()
    let settings = null

    // Use cached settings if available and fresh
    if (maintenanceCache.settings && (now - maintenanceCache.timestamp) < CACHE_DURATION) {
      settings = maintenanceCache.settings
    } else {
      // Fetch maintenance settings from API
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/maintenance/status`, {
          headers: {
            'cookie': request.headers.get('cookie') || ''
          }
        })
        
        if (response.ok) {
          settings = await response.json()
          // Update cache
          maintenanceCache = { settings, timestamp: now }
        }
      } catch (error) {
        // If fetch fails, use default (no maintenance)
        return null
      }
    }

    if (!settings) {
      return null
    }

    // Check global maintenance
    if (settings.globalMaintenance) {
      const url = new URL(MAINTENANCE_PATH, request.url)
      url.searchParams.set('section', 'Site')
      url.searchParams.set('message', 'The entire site is currently undergoing maintenance.')
      url.searchParams.set('estimatedTime', '1 hour')
      return NextResponse.redirect(url)
    }

    // Check section-specific maintenance
    const maintenanceSection = settings.sections?.find((section: any) => 
      pathname.startsWith(section.path) && section.isInMaintenance
    )

    if (maintenanceSection) {
      const url = new URL(MAINTENANCE_PATH, request.url)
      url.searchParams.set('section', maintenanceSection.name)
      url.searchParams.set('message', maintenanceSection.message)
      url.searchParams.set('estimatedTime', maintenanceSection.estimatedTime)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
  }

  return null
}
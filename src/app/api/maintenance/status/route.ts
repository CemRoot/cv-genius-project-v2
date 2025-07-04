import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { loadSettings } from '@/lib/maintenance-storage'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (has admin cookie)
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-authenticated')?.value === 'true'

    // For admin users, never show maintenance
    if (isAdmin) {
      return NextResponse.json({
        globalMaintenance: false,
        sections: []
      })
    }

    // Load maintenance settings using shared storage
    const maintenanceSettings = await loadSettings()

    return NextResponse.json(maintenanceSettings)
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance status' },
      { status: 500 }
    )
  }
}


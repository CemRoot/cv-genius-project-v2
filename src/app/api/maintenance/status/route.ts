import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance-settings.json')

// Default settings
const defaultSettings = {
  globalMaintenance: false,
  sections: [
    {
      id: 'cv-builder',
      name: 'CV Builder',
      path: '/builder',
      isInMaintenance: false,
      message: 'We are currently performing maintenance on the CV Builder.',
      estimatedTime: '30 minutes'
    },
    {
      id: 'ats-check',
      name: 'ATS Check',
      path: '/ats-check',
      isInMaintenance: false,
      message: 'ATS Check is undergoing scheduled maintenance.',
      estimatedTime: '45 minutes'
    },
    {
      id: 'cover-letter',
      name: 'Cover Letters',
      path: '/cover-letter',
      isInMaintenance: false,
      message: 'The Cover Letter Generator is temporarily unavailable.',
      estimatedTime: '1 hour'
    },
    {
      id: 'templates',
      name: 'Templates',
      path: '/templates',
      isInMaintenance: false,
      message: 'Template gallery is being updated.',
      estimatedTime: '15 minutes'
    },
    {
      id: 'examples',
      name: 'Examples',
      path: '/examples',
      isInMaintenance: false,
      message: 'CV Examples section is being updated.',
      estimatedTime: '30 minutes'
    },
    {
      id: 'career-guide',
      name: 'Career Guide',
      path: '/guides',
      isInMaintenance: false,
      message: 'Career Guide is temporarily offline for improvements.',
      estimatedTime: '1 hour'
    }
  ]
}

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

    // Try to load maintenance settings from file
    let maintenanceSettings
    try {
      const data = await fs.readFile(MAINTENANCE_FILE, 'utf-8')
      maintenanceSettings = JSON.parse(data)
    } catch (error) {
      // If file doesn't exist, use default settings
      maintenanceSettings = defaultSettings
    }

    return NextResponse.json(maintenanceSettings)
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin-authenticated')?.value === 'true'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // In production, save this to a database
    // For now, we'll return success
    // You can implement Redis or database storage here
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating maintenance status:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance status' },
      { status: 500 }
    )
  }
}
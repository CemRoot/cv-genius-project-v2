import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance-settings.json')

interface MaintenanceSettings {
  globalMaintenance: boolean
  sections: Array<{
    id: string
    name: string
    path: string
    isInMaintenance: boolean
    message: string
    estimatedTime: string
  }>
}

// Default settings
const defaultSettings: MaintenanceSettings = {
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

// Load maintenance settings
async function loadSettings(): Promise<MaintenanceSettings> {
  try {
    const data = await fs.readFile(MAINTENANCE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return default settings
    return defaultSettings
  }
}

// Save maintenance settings
async function saveSettings(settings: MaintenanceSettings): Promise<void> {
  const dir = path.dirname(MAINTENANCE_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(MAINTENANCE_FILE, JSON.stringify(settings, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const settings = await loadSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error loading maintenance settings:', error)
    return NextResponse.json(
      { error: 'Failed to load maintenance settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    await saveSettings(settings)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving maintenance settings:', error)
    return NextResponse.json(
      { error: 'Failed to save maintenance settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {

    const update = await request.json()
    const settings = await loadSettings()

    // Update specific section or global maintenance
    if (update.sectionId) {
      const section = settings.sections.find(s => s.id === update.sectionId)
      if (section) {
        section.isInMaintenance = update.isInMaintenance
        if (update.message) section.message = update.message
        if (update.estimatedTime) section.estimatedTime = update.estimatedTime
      }
    } else if (update.globalMaintenance !== undefined) {
      settings.globalMaintenance = update.globalMaintenance
    }

    await saveSettings(settings)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating maintenance settings:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance settings' },
      { status: 500 }
    )
  }
}
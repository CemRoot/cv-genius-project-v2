import { NextRequest, NextResponse } from 'next/server'
import { loadSettings, saveSettings, type MaintenanceSettings } from '@/lib/maintenance-storage'

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
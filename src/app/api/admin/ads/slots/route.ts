import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { defaultAdConfigs, AdConfig } from '@/lib/ad-config'

// In-memory storage for ad slot configurations
let adSlotConfigs: Map<string, Partial<AdConfig>> = new Map()

// Initialize from environment variable if available
if (process.env.AD_SLOT_CONFIGS) {
  try {
    const configs = JSON.parse(process.env.AD_SLOT_CONFIGS)
    adSlotConfigs = new Map(Object.entries(configs))
  } catch (e) {
    console.error('Failed to parse AD_SLOT_CONFIGS:', e)
  }
}

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

    // Get all ad configs with their current state
    const currentConfigs = defaultAdConfigs.map(config => {
      const overrides = adSlotConfigs.get(config.id)
      return overrides ? { ...config, ...overrides } : config
    })

    return NextResponse.json({
      success: true,
      slots: currentConfigs
    })

  } catch (error) {
    console.error('Failed to get ad slots:', error)
    return NextResponse.json({ error: 'Failed to get ad slots' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { slotId, updates } = await request.json()

    if (!slotId || !updates) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // Find the slot in default configs
    const slotExists = defaultAdConfigs.find(config => config.id === slotId)
    if (!slotExists) {
      return NextResponse.json({ error: 'Ad slot not found' }, { status: 404 })
    }

    // Store the updates
    adSlotConfigs.set(slotId, updates)

    // Log for production deployment
    const configsObject = Object.fromEntries(adSlotConfigs)
    console.log('💾 Ad slot updated:', { slotId, updates })
    console.log('⚠️  For production persistence, set AD_SLOT_CONFIGS env var to:', JSON.stringify(configsObject))

    // Apply the update to the runtime config
    const slotIndex = defaultAdConfigs.findIndex(config => config.id === slotId)
    if (slotIndex !== -1) {
      defaultAdConfigs[slotIndex] = { ...defaultAdConfigs[slotIndex], ...updates }
    }

    return NextResponse.json({
      success: true,
      message: `Ad slot ${slotId} updated successfully`,
      slot: { ...slotExists, ...updates }
    })

  } catch (error) {
    console.error('Failed to update ad slot:', error)
    return NextResponse.json({ error: 'Failed to update ad slot' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { slotId, enabled } = await request.json()

    if (!slotId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    // Quick toggle for enabling/disabling a slot
    const updates = { enabled }
    adSlotConfigs.set(slotId, { ...adSlotConfigs.get(slotId), ...updates })

    // Apply to runtime
    const slotIndex = defaultAdConfigs.findIndex(config => config.id === slotId)
    if (slotIndex !== -1) {
      defaultAdConfigs[slotIndex].enabled = enabled
    }

    return NextResponse.json({
      success: true,
      message: `Ad slot ${slotId} ${enabled ? 'enabled' : 'disabled'}`,
      enabled
    })

  } catch (error) {
    console.error('Failed to toggle ad slot:', error)
    return NextResponse.json({ error: 'Failed to toggle ad slot' }, { status: 500 })
  }
}

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

    const { slotId } = await request.json()

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID required' }, { status: 400 })
    }

    // Remove custom configuration (revert to defaults)
    adSlotConfigs.delete(slotId)

    // Reset to default in runtime
    const defaultSlot = defaultAdConfigs.find(config => config.id === slotId)
    if (defaultSlot) {
      const slotIndex = defaultAdConfigs.findIndex(config => config.id === slotId)
      if (slotIndex !== -1) {
        // Reset to original default values
        // This is a simplified approach - in production you'd want to store original defaults
        defaultAdConfigs[slotIndex].enabled = false
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ad slot ${slotId} reset to defaults`
    })

  } catch (error) {
    console.error('Failed to reset ad slot:', error)
    return NextResponse.json({ error: 'Failed to reset ad slot' }, { status: 500 })
  }
}
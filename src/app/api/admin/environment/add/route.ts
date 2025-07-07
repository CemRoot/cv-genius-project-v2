import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { VercelAPI } from '@/lib/vercel-api'

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

    const body = await request.json()
    const { key, value, type, target, category, description } = body

    // Validation
    if (!key || !value) {
      return NextResponse.json({ 
        error: 'Variable name and value are required' 
      }, { status: 400 })
    }

    if (!key.match(/^[A-Z_][A-Z0-9_]*$/)) {
      return NextResponse.json({ 
        error: 'Variable name must contain only uppercase letters, numbers, and underscores' 
      }, { status: 400 })
    }

    console.log(`➕ Admin (${adminSession.email}): Adding environment variable "${key}"`)

    // Check if Vercel API is configured
    if (!VercelAPI.isConfigured()) {
      const config = VercelAPI.getConfigurationStatus()
      return NextResponse.json({ 
        error: `Vercel API not configured: ${config.instructions}` 
      }, { status: 400 })
    }

    // Add variable to Vercel
    const result = await VercelAPI.updateEnvironmentVariable(key, value, target || ['production'])
    
    if (result.success) {
      console.log(`✅ Admin (${adminSession.email}): Successfully added "${key}" to Vercel`)
      return NextResponse.json({
        success: true,
        message: `Environment variable "${key}" added successfully`,
        variable: {
          key,
          value: type === 'sensitive' ? '••••••••' : value,
          type: type || 'plain',
          target: target || ['production'],
          category: category || 'config',
          description: description || `Environment variable: ${key}`,
          lastUpdated: new Date().toISOString()
        }
      })
    } else {
      console.log(`❌ Admin (${adminSession.email}): Failed to add "${key}": ${result.message}`)
      return NextResponse.json({ 
        error: `Failed to add variable: ${result.message}`
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Environment variable add error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 
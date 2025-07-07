import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { VercelAPI } from '@/lib/vercel-api'

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

    const body = await request.json()
    const { key, environment } = body

    // Validation
    if (!key) {
      return NextResponse.json({ 
        error: 'Variable name is required' 
      }, { status: 400 })
    }

    // Prevent deletion of critical variables
    const criticalVariables = [
      'JWT_SECRET',
      'ADMIN_USERNAME', 
      'ADMIN_PWD_HASH_B64',
      'VERCEL_TOKEN',
      'VERCEL_PROJECT_ID'
    ]

    if (criticalVariables.includes(key)) {
      return NextResponse.json({ 
        error: `Cannot delete critical system variable: ${key}` 
      }, { status: 403 })
    }

    console.log(`🗑️ Admin (${adminSession.email}): Deleting environment variable "${key}"`)

    // Check if Vercel API is configured
    if (!VercelAPI.isConfigured()) {
      const config = VercelAPI.getConfigurationStatus()
      return NextResponse.json({ 
        error: `Vercel API not configured: ${config.instructions}` 
      }, { status: 400 })
    }

    // Get current environment variables to find the variable ID
    const envResult = await VercelAPI.getEnvironmentVariables()
    
    if (!envResult.success) {
      return NextResponse.json({ 
        error: `Failed to fetch environment variables: ${envResult.message}` 
      }, { status: 500 })
    }

    // Find the variable to delete
    const variableToDelete = envResult.data?.find((env: any) => 
      env.key === key && env.target.includes(environment || 'production')
    )

    if (!variableToDelete) {
      return NextResponse.json({ 
        error: `Variable "${key}" not found in ${environment || 'production'} environment` 
      }, { status: 404 })
    }

    // Delete variable from Vercel
    const result = await VercelAPI.deleteEnvironmentVariable(variableToDelete.id)
    
    if (result.success) {
      console.log(`✅ Admin (${adminSession.email}): Successfully deleted "${key}" from Vercel`)
      return NextResponse.json({
        success: true,
        message: `Environment variable "${key}" deleted successfully`,
        deletedVariable: {
          key,
          environment: environment || 'production',
          deletedAt: new Date().toISOString()
        }
      })
    } else {
      console.log(`❌ Admin (${adminSession.email}): Failed to delete "${key}": ${result.message}`)
      return NextResponse.json({ 
        error: `Failed to delete variable: ${result.message}`
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Environment variable delete error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { VercelAPI } from '@/lib/vercel-api'

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
    const environment = searchParams.get('env') || 'production'

    console.log(`🔍 Admin (${adminSession.email}): Fetching ${environment} environment variables`)

    // Check if Vercel API is configured
    const vercelConnected = VercelAPI.isConfigured()

    if (!vercelConnected) {
      // Return local environment variables if Vercel is not configured
      const localVariables = getLocalEnvironmentVariables()
      return NextResponse.json({
        success: true,
        variables: localVariables,
        vercelConnected: false,
        message: 'Showing local environment variables. Configure Vercel API for full functionality.'
      })
    }

    // Get variables from Vercel
    const result = await VercelAPI.getEnvironmentVariables()
    
    if (!result.success) {
      return NextResponse.json({ 
        error: `Failed to fetch environment variables: ${result.message}` 
      }, { status: 500 })
    }

    // Filter by environment and add metadata
    const filteredVariables = result.data
      ?.filter((env: any) => env.target.includes(environment))
      ?.map((env: any) => ({
        id: env.id,
        key: env.key,
        value: env.value || '••••••••', // Vercel doesn't return actual values for security
        type: detectVariableType(env.key),
        target: env.target,
        lastUpdated: env.updatedAt,
        category: detectCategory(env.key),
        description: getVariableDescription(env.key)
      })) || []

    console.log(`✅ Admin (${adminSession.email}): Retrieved ${filteredVariables.length} ${environment} variables`)

    return NextResponse.json({
      success: true,
      variables: filteredVariables,
      vercelConnected: true,
      environment,
      total: filteredVariables.length
    })

  } catch (error) {
    console.error('💥 Environment variables fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Helper function to get local environment variables when Vercel is not configured
function getLocalEnvironmentVariables() {
  const localVars = []
  const envKeys = Object.keys(process.env)

  // Filter out system and unimportant variables
  const relevantKeys = envKeys.filter(key => 
    !key.startsWith('_') && 
    !key.startsWith('npm_') && 
    !key.startsWith('VERCEL_') && 
    !['PWD', 'HOME', 'USER', 'PATH', 'SHELL', 'LANG'].includes(key)
  )

  for (const key of relevantKeys) {
    localVars.push({
      id: key,
      key,
      value: process.env[key] || '',
      type: detectVariableType(key),
      target: ['development'],
      category: detectCategory(key),
      description: getVariableDescription(key),
      lastUpdated: new Date().toISOString()
    })
  }

  return localVars
}

// Helper function to detect variable type based on name
function detectVariableType(key: string): 'encrypted' | 'plain' | 'sensitive' {
  const lowerKey = key.toLowerCase()
  
  if (lowerKey.includes('secret') || lowerKey.includes('key') || lowerKey.includes('token') || 
      lowerKey.includes('password') || lowerKey.includes('hash') || lowerKey.includes('private')) {
    return 'sensitive'
  }
  
  if (lowerKey.includes('encrypted') || lowerKey.includes('cipher')) {
    return 'encrypted'
  }
  
  return 'plain'
}

// Helper function to detect category
function detectCategory(key: string): string {
  const lowerKey = key.toLowerCase()
  
  if (lowerKey.includes('jwt') || lowerKey.includes('secret') || lowerKey.includes('admin') || 
      lowerKey.includes('password') || lowerKey.includes('hash') || lowerKey.includes('auth')) {
    return 'security'
  }
  if (lowerKey.includes('api_key') || lowerKey.includes('token') || lowerKey.includes('gemini') || 
      lowerKey.includes('huggingface') || lowerKey.includes('openai')) {
    return 'api'
  }
  if (lowerKey.includes('adsense') || lowerKey.includes('monetag') || lowerKey.includes('ad_') || 
      lowerKey.includes('pub_id')) {
    return 'ads'
  }
  if (lowerKey.includes('kv_') || lowerKey.includes('database') || lowerKey.includes('redis') || 
      lowerKey.includes('db_')) {
    return 'database'
  }
  if (lowerKey.includes('maintenance') || lowerKey.includes('enable_') || lowerKey.includes('disable_') || 
      lowerKey.includes('feature_')) {
    return 'features'
  }
  
  return 'config'
}

// Helper function to provide descriptions for common variables
function getVariableDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'JWT_SECRET': 'Secret key for JWT token signing',
    'ADMIN_USERNAME': 'Admin panel username',
    'ADMIN_PWD_HASH_B64': 'Base64 encoded admin password hash',
    'ADMIN_IP_WHITELIST': 'Comma-separated list of allowed admin IPs',
    'NEXT_PUBLIC_ADSENSE_CLIENT': 'Google AdSense publisher client ID',
    'NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT': 'AdSense sidebar ad slot ID',
    'NEXT_PUBLIC_ADSENSE_INLINE_SLOT': 'AdSense inline content ad slot ID',
    'NEXT_PUBLIC_ADSENSE_FOOTER_SLOT': 'AdSense footer ad slot ID',
    'NEXT_PUBLIC_ADSENSE_STICKY_SLOT': 'AdSense sticky sidebar ad slot ID',
    'GEMINI_API_KEY': 'Google Gemini AI API key',
    'HUGGINGFACE_API_KEY': 'Hugging Face AI API key',
    'MAINTENANCE_MODE': 'Global maintenance mode toggle',
    'VERCEL_TOKEN': 'Vercel API access token',
    'VERCEL_PROJECT_ID': 'Vercel project identifier',
    'ADMIN_2FA_SECRET': '2FA TOTP secret for admin authentication',
    'NEXT_PUBLIC_APP_URL': 'Production application URL',
    'NODE_ENV': 'Node.js environment (production/development)'
  }

  return descriptions[key] || `Environment variable: ${key}`
} 
import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { verifyAdminToken } from '@/lib/admin-auth'
import { VercelKVManager } from '@/lib/vercel-kv-manager'


export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Password change request started')
    
    // Verify JWT token using existing admin auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    console.log('✅ Admin session verified:', adminSession?.email || 'unknown')
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📥 Request body fields:', {
      hasCurrentPassword: !!body.currentPassword,
      hasNewPassword: !!body.newPassword,
      hasConfirmPassword: !!body.confirmPassword,
      currentPasswordLength: body.currentPassword?.length || 0,
      newPasswordLength: body.newPassword?.length || 0,
      confirmPasswordLength: body.confirmPassword?.length || 0,
      fieldsMatch: body.newPassword === body.confirmPassword
    })
    
    let currentPassword, newPassword, confirmPassword
    
    // Check if passwords are encrypted (old format) or plain (new format)
    if (body.encryptedPasswords) {
      // For now, return error for encrypted format since we can't decrypt on server
      return NextResponse.json({ 
        error: 'Password encryption not supported. Please refresh the page and try again.' 
      }, { status: 400 })
    } else {
      // Direct passwords
      currentPassword = body.currentPassword
      newPassword = body.newPassword
      confirmPassword = body.confirmPassword
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ 
        error: 'Current password and new password are required',
        debug: { currentPassword: !!currentPassword, newPassword: !!newPassword }
      }, { status: 400 })
    }

    // Validate password confirmation
    if (confirmPassword && newPassword !== confirmPassword) {
      console.log('❌ Password confirmation mismatch')
      return NextResponse.json({ 
        error: 'New password and confirmation password do not match',
        debug: { newPasswordLength: newPassword.length, confirmPasswordLength: confirmPassword.length }
      }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      console.log('❌ Password too short:', newPassword.length)
      return NextResponse.json({ 
        error: 'New password must be at least 8 characters long',
        debug: { actualLength: newPassword.length }
      }, { status: 400 })
    }

    // Additional password strength checks
    if (newPassword === currentPassword) {
      console.log('❌ New password same as current')
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 })
    }

    // Check for basic password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)

    console.log('🔍 Password complexity check:', {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      passes: (hasUpperCase || hasLowerCase) && hasNumbers
    })

    if (!(hasUpperCase || hasLowerCase) || !hasNumbers) {
      console.log('❌ Password complexity failed')
      return NextResponse.json({ 
        error: 'Password must contain at least one letter and one number',
        debug: { hasUpperCase, hasLowerCase, hasNumbers }
      }, { status: 400 })
    }
    
    console.log('✅ All validations passed')

    // Get current password hash from environment
    const currentHashB64 = process.env.ADMIN_PWD_HASH_B64
    if (!currentHashB64) {
      return NextResponse.json({ 
        error: 'Admin password not configured' 
      }, { status: 500 })
    }

    // Decode current hash
    const currentHash = Buffer.from(currentHashB64, 'base64').toString('utf-8')

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentHash)
    if (!isCurrentPasswordValid) {
      // Security audit logging for failed attempts
      console.log('🚨 Admin password change failed - Invalid current password', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            request.headers.get('cf-connecting-ip') || 
            'unknown',
        sessionId: adminSession?.id || 'unknown',
        reason: 'Invalid current password'
      })
      
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: 400 })
    }

    // Generate new hash
    const newHash = await bcrypt.hash(newPassword, 10)
    const newHashB64 = Buffer.from(newHash).toString('base64')

    // Update password hash in memory for immediate effect
    process.env.ADMIN_PWD_HASH_B64 = newHashB64
    
    // Update in Vercel KV if available
    await VercelKVManager.updatePasswordHash(newHashB64)
    
    // Update Vercel environment variable
    let vercelUpdateSuccess = false
    let vercelError = ''
    
    // Debug: Log Vercel configuration status
    console.log('🔍 Vercel integration status:', {
      hasToken: !!process.env.VERCEL_TOKEN,
      hasProjectId: !!process.env.VERCEL_PROJECT_ID,
      hasTeamId: !!process.env.VERCEL_TEAM_ID,
      tokenLength: process.env.VERCEL_TOKEN?.length || 0,
      projectId: process.env.VERCEL_PROJECT_ID ? 'configured' : 'missing'
    })
    
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        console.log('🚀 Attempting to update Vercel environment variable...')
        await updatePasswordInVercel(newHashB64)
        vercelUpdateSuccess = true
        console.log('✅ Vercel environment variable updated successfully')
      } catch (error) {
        vercelError = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Failed to update password in Vercel:', {
          error: vercelError,
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    } else {
      vercelError = 'Vercel integration not configured - missing VERCEL_TOKEN or VERCEL_PROJECT_ID'
      console.warn('⚠️ ' + vercelError)
    }

    // Return success response with instructions
    const response = {
      success: true,
      message: 'Password changed successfully',
      newHashB64: newHashB64,
      vercelUpdated: vercelUpdateSuccess,
      vercelError: vercelError || undefined,
      instructions: {
        manual: 'Update your .env.local file with the new ADMIN_PWD_HASH_B64 value',
        restart: 'Restart your development server after updating .env.local',
        vercel: vercelUpdateSuccess 
          ? 'Vercel environment variable updated automatically' 
          : `Vercel update failed: ${vercelError}. Manual update required.`
      }
    }

    // Security audit logging
    console.log('🔐 Admin password changed successfully', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          request.headers.get('cf-connecting-ip') || 
          'unknown',
      vercelUpdated: vercelUpdateSuccess,
      sessionId: adminSession?.id || 'unknown'
    })

    // Password change completed
    return NextResponse.json(response)

  } catch (error) {
    // Password change error
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function updatePasswordInVercel(newHashB64: string): Promise<void> {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

  console.log('🔧 Vercel API Configuration:', {
    hasToken: !!VERCEL_TOKEN,
    hasProjectId: !!VERCEL_PROJECT_ID,
    hasTeamId: !!VERCEL_TEAM_ID,
    projectId: VERCEL_PROJECT_ID?.substring(0, 8) + '...' || 'missing'
  })

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel integration not configured - missing credentials')
  }

  const apiUrl = VERCEL_TEAM_ID 
    ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
    : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`

  console.log('📡 Fetching environment variables from:', apiUrl.replace(VERCEL_TOKEN, '[TOKEN]'))

  // Get existing env vars
  const getResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    }
  })

  console.log('📥 GET Response status:', getResponse.status, getResponse.statusText)

  if (!getResponse.ok) {
    const errorText = await getResponse.text()
    console.error('❌ Failed to fetch env vars:', errorText)
    throw new Error(`Failed to fetch environment variables: ${getResponse.status} ${errorText}`)
  }

  const envVars = await getResponse.json()
  console.log('📋 Found environment variables:', envVars.envs?.length || 0)
  
  const existingVar = envVars.envs?.find((env: any) => env.key === 'ADMIN_PWD_HASH_B64')
  console.log('🔍 Existing ADMIN_PWD_HASH_B64:', existingVar ? 'found' : 'not found')

  // Delete existing if found
  if (existingVar) {
    const deleteUrl = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}`

    console.log('🗑️ Deleting existing variable...')
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    })
    
    console.log('🗑️ DELETE Response status:', deleteResponse.status, deleteResponse.statusText)
    
    if (!deleteResponse.ok) {
      const deleteError = await deleteResponse.text()
      console.warn('⚠️ Delete failed but continuing:', deleteError)
    }
  }

  // Create new env var
  console.log('➕ Creating new environment variable...')
  const createResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: 'ADMIN_PWD_HASH_B64',
      value: newHashB64,
      type: 'encrypted',
      target: ['production', 'preview', 'development']
    })
  })

  console.log('➕ POST Response status:', createResponse.status, createResponse.statusText)

  if (!createResponse.ok) {
    const error = await createResponse.text()
    console.error('❌ Failed to create env var:', error)
    throw new Error(`Failed to update password in Vercel: ${createResponse.status} ${error}`)
  }
  
  const createResult = await createResponse.json()
  console.log('✅ Environment variable created successfully:', createResult)
}
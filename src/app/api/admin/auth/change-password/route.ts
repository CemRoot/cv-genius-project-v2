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
    // Verify JWT token using existing admin auth
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
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 })
    }

    // Validate password confirmation
    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ 
        error: 'New password and confirmation password do not match' 
      }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'New password must be at least 8 characters long' 
      }, { status: 400 })
    }

    // Additional password strength checks
    if (newPassword === currentPassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 })
    }

    // Check for basic password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)

    if (!(hasUpperCase || hasLowerCase) || !hasNumbers) {
      return NextResponse.json({ 
        error: 'Password must contain at least one letter and one number' 
      }, { status: 400 })
    }

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
    
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        await updatePasswordInVercel(newHashB64)
        vercelUpdateSuccess = true
      } catch (error) {
        const vercelError = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to update password in Vercel:', vercelError)
      }
    }

    // Return success response with instructions
    const response = {
      success: true,
      message: 'Password changed successfully',
      newHashB64: newHashB64,
      vercelUpdated: vercelUpdateSuccess,
      instructions: {
        manual: 'Update your .env.local file with the new ADMIN_PWD_HASH_B64 value',
        restart: 'Restart your development server after updating .env.local'
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

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel integration not configured')
  }

  const apiUrl = VERCEL_TEAM_ID 
    ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`
    : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`

  // Get existing env vars
  const getResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    }
  })

  if (!getResponse.ok) {
    throw new Error('Failed to fetch environment variables')
  }

  const envVars = await getResponse.json()
  const existingVar = envVars.envs?.find((env: any) => env.key === 'ADMIN_PWD_HASH_B64')

  // Delete existing if found
  if (existingVar) {
    const deleteUrl = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}?teamId=${VERCEL_TEAM_ID}`
      : `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}`

    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    })
  }

  // Create new env var
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

  if (!createResponse.ok) {
    const error = await createResponse.text()
    throw new Error(`Failed to update password in Vercel: ${error}`)
  }
}
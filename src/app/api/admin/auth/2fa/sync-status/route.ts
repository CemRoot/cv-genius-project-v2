import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminSession = await verifyAdminToken(token);
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'check-production') {
      // Check 2FA status in Vercel production environment
      if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return NextResponse.json({
          success: false,
          error: 'Vercel credentials not configured'
        });
      }

      try {
        // Get environment variables from Vercel
        const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`, {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        });

        if (response.ok) {
          const envVars = await response.json();
          const has2FASecret = envVars.envs?.some((env: any) => 
            env.key === 'ADMIN_2FA_SECRET' && env.value && env.target.includes('production')
          );

          console.log('🔍 Production 2FA check:', {
            admin: adminSession.email,
            productionHas2FA: has2FASecret,
            localHas2FA: !!process.env.ADMIN_2FA_SECRET
          });

          return NextResponse.json({
            success: true,
            production: {
              has2FA: has2FASecret,
              environment: 'vercel-production'
            },
            local: {
              has2FA: !!process.env.ADMIN_2FA_SECRET,
              environment: 'development'
            },
            synchronized: has2FASecret === !!process.env.ADMIN_2FA_SECRET
          });
        } else {
          console.log('⚠️ Failed to fetch Vercel environment variables');
          return NextResponse.json({
            success: false,
            error: 'Failed to check production 2FA status'
          });
        }
      } catch (error) {
        console.error('❌ Vercel API error:', error);
        return NextResponse.json({
          success: false,
          error: 'Vercel API communication failed'
        });
      }
    }

    if (action === 'sync-to-production') {
      // Sync local 2FA status to production
      if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return NextResponse.json({
          success: false,
          error: 'Vercel credentials not configured'
        });
      }

      const local2FASecret = process.env.ADMIN_2FA_SECRET;
      
      try {
        if (local2FASecret) {
          // Add/update 2FA secret in production
          const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${VERCEL_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: 'ADMIN_2FA_SECRET',
              value: local2FASecret,
              type: 'encrypted',
              target: ['production']
            }),
          });

          if (response.ok) {
            console.log('✅ 2FA secret synced to production');
            return NextResponse.json({
              success: true,
              message: '2FA settings synced to production successfully',
              action: 'added-2fa'
            });
          } else {
            const error = await response.text();
            console.log('⚠️ Failed to sync 2FA to production:', error);
            return NextResponse.json({
              success: false,
              error: 'Failed to sync 2FA to production'
            });
          }
        } else {
          // Remove 2FA secret from production
          // First get the environment variable ID
          const getResponse = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`, {
            headers: {
              'Authorization': `Bearer ${VERCEL_TOKEN}`,
            },
          });

          if (getResponse.ok) {
            const envVars = await getResponse.json();
            const twoFAEnv = envVars.envs?.find((env: any) => 
              env.key === 'ADMIN_2FA_SECRET' && env.target.includes('production')
            );

            if (twoFAEnv) {
              const deleteResponse = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${twoFAEnv.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${VERCEL_TOKEN}`,
                },
              });

              if (deleteResponse.ok) {
                console.log('✅ 2FA secret removed from production');
                return NextResponse.json({
                  success: true,
                  message: '2FA settings removed from production successfully',
                  action: 'removed-2fa'
                });
              }
            } else {
              return NextResponse.json({
                success: true,
                message: '2FA already not configured in production',
                action: 'no-change'
              });
            }
          }

          return NextResponse.json({
            success: false,
            error: 'Failed to remove 2FA from production'
          });
        }
      } catch (error) {
        console.error('❌ 2FA sync error:', error);
        return NextResponse.json({
          success: false,
          error: '2FA synchronization failed'
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error('❌ 2FA sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 
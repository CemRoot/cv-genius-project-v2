import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkMaintenanceMode } from './middleware/maintenance'

// IP Whitelist Check Function
function checkIPWhitelist(request: NextRequest): boolean {
  // Check if IP whitelist is disabled
  if (process.env.DISABLE_IP_WHITELIST === 'true') {
    console.log('🔓 IP whitelist is disabled - allowing all IPs')
    return true
  }

  // Get client IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  const clientIP = xForwardedFor?.split(',')[0]?.trim() || 
                   xRealIP || 
                   cfConnectingIP || 
                   'unknown'

  console.log(`🔒 MIDDLEWARE IP CHECK: ${clientIP}`)

  // Always allow localhost in development
  if (process.env.NODE_ENV === 'development' && 
      (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.includes('127.0.0.1') || clientIP.includes('::1'))) {
    console.log('✅ LOCALHOST allowed in development')
    return true
  }

  // Get whitelist from environment
  const envWhitelist = process.env.ADMIN_IP_WHITELIST || ''
  const allowedIPs = envWhitelist.split(',').map(ip => ip.trim()).filter(Boolean)
  
  console.log(`🔍 Checking IP: ${clientIP} against whitelist: [${allowedIPs.join(', ')}]`)

  // Check if IP is in whitelist
  const isAllowed = allowedIPs.some(allowedIP => 
    allowedIP === clientIP || 
    clientIP.includes(allowedIP) ||
    (allowedIP === '127.0.0.1' && (clientIP === '::1' || clientIP.includes('localhost'))) ||
    (allowedIP === '::1' && (clientIP === '127.0.0.1' || clientIP.includes('localhost')))
  )

  if (!isAllowed) {
    console.warn(`🚨 MIDDLEWARE BLOCKED: IP ${clientIP} not in whitelist [${allowedIPs.join(', ')}]`)
  } else {
    console.log(`✅ MIDDLEWARE ALLOWED: IP ${clientIP}`)
  }

  return isAllowed
}

// Create Access Denied Response
function createAccessDeniedResponse(clientIP: string, allowedIPs: string[]): NextResponse {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Access Denied - CV Genius Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
          }
          .container {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            max-width: 500px;
            width: 100%;
          }
          .emoji { 
            font-size: 5rem; 
            margin-bottom: 1.5rem; 
            animation: shake 2s infinite;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          h1 { 
            margin: 0 0 1rem 0; 
            font-size: 2rem;
            font-weight: 700;
          }
          p { 
            margin: 0.8rem 0; 
            opacity: 0.9; 
            line-height: 1.6;
            font-size: 1.1rem;
          }
          .warning {
            background: rgba(255,0,0,0.2);
            padding: 1rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            border: 1px solid rgba(255,0,0,0.3);
          }
          .debug { 
            font-size: 0.9rem; 
            margin-top: 2rem; 
            opacity: 0.8; 
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            border-radius: 8px;
            word-break: break-all;
          }
          .btn {
            display: inline-block;
            color: white; 
            text-decoration: none; 
            padding: 0.8rem 2rem; 
            background: rgba(255,255,255,0.2); 
            border-radius: 25px;
            margin: 1rem 0.5rem;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.3);
          }
          .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }
          @media (max-width: 600px) {
            .container { padding: 2rem 1rem; }
            .emoji { font-size: 3rem; }
            h1 { font-size: 1.5rem; }
            p { font-size: 1rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🛡️</div>
          <h1>Access Denied</h1>
          <p><strong>Unauthorized IP Address Detected</strong></p>
          <div class="warning">
            <p>⚠️ Only authorized IP addresses can access the CV Genius Admin Panel</p>
          </div>
          <p>Your access has been blocked for security reasons. If you believe this is an error, please contact the administrator.</p>
          
          <div class="debug">
            <strong>Security Information:</strong><br/>
            Your IP: <code>${clientIP}</code><br/>
            Allowed IPs: <code>${allowedIPs.length > 0 ? allowedIPs.join(', ') : 'None configured'}</code><br/>
            Timestamp: <code>${new Date().toISOString()}</code>
          </div>
          
          <br/>
          <a href="/" class="btn">🏠 Go to Home</a>
          <a href="mailto:admin@cvgenius.com" class="btn">📧 Contact Admin</a>
        </div>
      </body>
    </html>
  `
  
  return new NextResponse(html, {
    status: 403,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log(`🔧 MIDDLEWARE: ${pathname}`)
  
  // Check IP whitelist for admin routes
  if (pathname.startsWith('/admin')) {
    console.log(`🔐 ADMIN ROUTE DETECTED: ${pathname}`)
    
    if (!checkIPWhitelist(request)) {
      // Get client IP for error message
      const xForwardedFor = request.headers.get('x-forwarded-for')
      const xRealIP = request.headers.get('x-real-ip')
      const cfConnectingIP = request.headers.get('cf-connecting-ip')
      
      const clientIP = xForwardedFor?.split(',')[0]?.trim() || 
                       xRealIP || 
                       cfConnectingIP || 
                       'unknown'

      const envWhitelist = process.env.ADMIN_IP_WHITELIST || ''
      const allowedIPs = envWhitelist.split(',').map(ip => ip.trim()).filter(Boolean)
      
      console.log(`🚫 ACCESS DENIED: ${clientIP} -> ${pathname}`)
      return createAccessDeniedResponse(clientIP, allowedIPs)
    }
    
    console.log(`✅ IP AUTHORIZED: ${pathname}`)
  }
  
  // Evaluate maintenance mode for non-admin routes
  if (!pathname.startsWith('/admin')) {
    const maintenanceResponse = await checkMaintenanceMode(request)
    if (maintenanceResponse) {
      return maintenanceResponse
    }
  }

  // Allow request to continue
  return NextResponse.next()
}

export const config = {
  // Match all routes including admin, but exclude static files and API routes that don't need IP checking
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ]
} 
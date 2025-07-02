import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

function AccessDeniedPage({ clientIP }: { clientIP: string }) {
  return (
    <html>
      <head>
        <title>Access Denied</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          .emoji { font-size: 4rem; margin-bottom: 1rem; }
          h1 { margin: 0 0 1rem 0; }
          p { margin: 0.5rem 0; opacity: 0.9; }
          .debug { font-size: 0.8rem; margin-top: 1rem; opacity: 0.7; }
          a { color: white; text-decoration: none; padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); border-radius: 5px; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="emoji">🛡️</div>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this area.</p>
          <p>Only authorized IPs can access the admin panel.</p>
          <div className="debug">Your IP: {clientIP}</div>
          <br />
          <a href="/">🏠 Go to Home</a>
        </div>
      </body>
    </html>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get client IP from headers
  const headersList = await headers()
  const xForwardedFor = headersList.get('x-forwarded-for')
  const xRealIP = headersList.get('x-real-ip')
  const cfConnectingIP = headersList.get('cf-connecting-ip')
  
  const clientIP = xForwardedFor?.split(',')[0]?.trim() || 
                   xRealIP || 
                   cfConnectingIP || 
                   'unknown'

  console.log(`🔒 ADMIN LAYOUT: IP Check - ${clientIP}`)

  // Simple whitelist - TEMPORARILY BLOCK MY IP FOR TESTING
  const allowedIPs = ['127.0.0.1'] // Blocking my real IP to test
  
  if (!allowedIPs.includes(clientIP)) {
    console.log(`🚫 BLOCKED in layout: ${clientIP} not in whitelist`)
    return <AccessDeniedPage clientIP={clientIP} />
  }

  console.log(`✅ ALLOWED in layout: ${clientIP}`)
  return <>{children}</>
} 
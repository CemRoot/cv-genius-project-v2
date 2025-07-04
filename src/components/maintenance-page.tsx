'use client'

import { useEffect, useState } from 'react'

interface MaintenancePageProps {
  sectionName?: string
  message?: string
  estimatedTime?: string
}

export function MaintenancePage({ 
  sectionName = 'This section', 
  message = 'Scheduled maintenance is currently in progress.',
  estimatedTime = '1 hour'
}: MaintenancePageProps) {
  const [currentDomain, setCurrentDomain] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Maintenance - {currentDomain}</title>
        <link rel="icon" href="/maintenance-favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #1a1a1a;
              --text-color: #e0e0e0;
              --text-secondary: #a0a0a0;
              --illustration-primary: #03c39d;
              --illustration-secondary: #2f2e41;
              --illustration-accent: #3f3d56;
            }
          }
          
          @media (prefers-color-scheme: light) {
            :root {
              --bg-color: #ffffff;
              --text-color: #333333;
              --text-secondary: #666666;
              --illustration-primary: #03c39d;
              --illustration-secondary: #2f2e41;
              --illustration-accent: #3f3d56;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
          }
          
          .artwork {
            max-width: 100%;
            height: auto;
            max-height: 400px;
            margin-bottom: 2rem;
          }
          
          h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-color);
            line-height: 1.2;
          }
          
          p {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .status-info {
            margin-top: 2rem;
            padding: 1.5rem;
            background-color: var(--bg-color);
            border: 1px solid var(--text-secondary);
            border-radius: 8px;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .status-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-color);
          }
          
          .status-info p {
            font-size: 0.9rem;
            color: var(--text-secondary);
          }
          
          @media (max-width: 768px) {
            h1 {
              font-size: 2rem;
            }
            
            p {
              font-size: 1.1rem;
            }
            
            .artwork {
              max-height: 250px;
            }
            
            .status-info {
              padding: 1rem;
              margin-top: 1.5rem;
            }
          }
          
          @media (max-width: 480px) {
            h1 {
              font-size: 1.75rem;
            }
            
            p {
              font-size: 1rem;
            }
            
            .artwork {
              max-height: 200px;
            }
            
            body {
              padding: 15px;
            }
          }
        `}</style>
      </head>
      <body>
        <svg className="artwork" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 700" width="1120" height="700">
          <circle cx="292.61" cy="213" r="213" fill="#f2f2f2"></circle>
          <path fill="var(--illustration-secondary)" d="M0 51.14c0 77.5 48.62 140.21 108.7 140.21"></path>
          <path fill="var(--illustration-primary)" d="M108.7 191.35c0-78.37 54.26-141.78 121.3-141.78M39.38 58.17c0 73.61 31 133.18 69.32 133.18"></path>
          <path fill="var(--illustration-secondary)" d="M108.7 191.35c0-100.14 62.71-181.17 140.2-181.17"></path>
          <path fill="#a8a8a8" d="M85.83 192.34s15.42-.48 20.06-3.78 23.72-7.26 24.87-1.96 23.17 26.4 5.76 26.53-40.44-2.7-45.07-5.53-5.62-15.26-5.62-15.26z"></path>
          <path d="M136.83 211.28c-17.4.15-40.44-2.7-45.07-5.53-3.53-2.15-4.94-9.87-5.41-13.43l-.52.02s.98 12.43 5.62 15.26 27.67 5.67 45.07 5.53c5.03-.04 6.76-1.83 6.67-4.47-.7 1.6-2.62 2.6-6.36 2.62z" opacity=".2"></path>
          <ellipse cx="198.61" cy="424.5" fill="var(--illustration-accent)" rx="187" ry="25.44"></ellipse>
          <ellipse cx="198.61" cy="424.5" opacity=".1" rx="157" ry="21.36"></ellipse>
          <ellipse cx="836.61" cy="660.5" fill="var(--illustration-accent)" rx="283" ry="38.5"></ellipse>
          <ellipse cx="310.61" cy="645.5" fill="var(--illustration-accent)" rx="170" ry="23.13"></ellipse>
          <path fill="none" stroke="var(--illustration-secondary)" strokeMiterlimit="10" strokeWidth="2" d="M462.6 626c90 23 263-30 282-90M309.6 259s130-36 138 80-107 149-17 172M184.01 537.28s39.07-10.82 41.48 24.05-32.16 44.78-5.11 51.7"></path>
          <path fill="var(--illustration-secondary)" d="M778.7 563.24l-7.87 50.3s-38.78 20.6-11.52 21.2 155.74 0 155.74 0 24.84 0-14.55-21.81l-7.87-52.72z"></path>
          <path d="M753.83 634.2c6.2-5.51 17-11.25 17-11.25l7.87-50.3 113.93.1 7.87 49.59c9.19 5.09 14.88 8.99 18.2 11.98 5.07-1.16 10.6-5.45-18.2-21.4l-7.87-52.71-113.93 3.03-7.87 50.3s-32.6 17.31-17 20.66z" opacity=".1"></path>
          <rect width="513.25" height="357.52" x="578.43" y="212.69" fill="var(--illustration-secondary)" rx="18.05"></rect>
          <path fill="var(--illustration-accent)" d="M595.7 231.78h478.71v267.84H595.7z"></path>
          <circle cx="835.06" cy="223.29" r="3.03" fill="#f2f2f2"></circle>
          <path fill="var(--illustration-secondary)" d="M1091.69 520.82v31.34a18.04 18.04 0 01-18.05 18.05H596.48a18.04 18.04 0 01-18.05-18.05v-31.34zM968.98 667.47v6.06H642.97v-4.85l.45-1.21 8.03-21.82h310.86l6.67 21.82zM1094.44 661.53c-.6 2.54-2.84 5.22-7.9 7.75-18.18 9.1-55.15-2.42-55.15-2.42s-28.48-4.85-28.48-17.57a22.72 22.72 0 012.5-1.49c7.64-4.04 32.98-14.02 77.92.42a18.74 18.74 0 018.54 5.6c1.82 2.13 3.25 4.84 2.57 7.71z"></path>
          <path d="M1094.44 661.53c-22.25 8.53-42.09 9.17-62.44-4.97-10.27-7.13-19.6-8.9-26.6-8.76 7.65-4.04 33-14.02 77.93.42a18.74 18.74 0 018.54 5.6c1.82 2.13 3.25 4.84 2.57 7.71z" opacity=".1"></path>
          <ellipse cx="1066.54" cy="654.13" fill="#f2f2f2" rx="7.88" ry="2.42"></ellipse>
          <circle cx="835.06" cy="545.67" r="11.51" fill="#f2f2f2"></circle>
          <path d="M968.98 667.47v6.06H642.97v-4.85l.45-1.21h325.56z" opacity=".1"></path>
          <path fill="var(--illustration-secondary)" d="M108.61 159h208v242h-208z"></path>
          <path fill="var(--illustration-accent)" d="M87.61 135h250v86h-250zM87.61 237h250v86h-250zM87.61 339h250v86h-250z"></path>
          <path fill="var(--illustration-primary)" d="M271.61 150h16v16h-16z" opacity=".4"></path>
          <path fill="var(--illustration-primary)" d="M294.61 150h16v16h-16z" opacity=".8"></path>
          <path fill="var(--illustration-primary)" d="M317.61 150h16v16h-16z"></path>
          <path fill="var(--illustration-primary)" d="M271.61 251h16v16h-16z" opacity=".4"></path>
          <path fill="var(--illustration-primary)" d="M294.61 251h16v16h-16z" opacity=".8"></path>
          <path fill="var(--illustration-primary)" d="M317.61 251h16v16h-16z"></path>
          <path fill="var(--illustration-primary)" d="M271.61 352h16v16h-16z" opacity=".4"></path>
          <path fill="var(--illustration-primary)" d="M294.61 352h16v16h-16z" opacity=".8"></path>
          <path fill="var(--illustration-primary)" d="M317.61 352h16v16h-16z"></path>
          <circle cx="316.61" cy="538" r="79" fill="var(--illustration-secondary)"></circle>
          <path fill="var(--illustration-secondary)" d="M280.61 600h24v43h-24zM328.61 600h24v43h-24z"></path>
          <ellipse cx="300.61" cy="643.5" fill="var(--illustration-secondary)" rx="20" ry="7.5"></ellipse>
          <ellipse cx="348.61" cy="642.5" fill="var(--illustration-secondary)" rx="20" ry="7.5"></ellipse>
          <circle cx="318.61" cy="518" r="27" fill="#fff"></circle>
          <circle cx="318.61" cy="518" r="9" fill="var(--illustration-accent)"></circle>
          <path fill="var(--illustration-primary)" d="M239.98 464.53c-6.38-28.57 14-57.43 45.54-64.47s62.27 10.4 68.64 38.98-14.51 39.1-46.05 46.14-61.75 7.92-68.13-20.65z"></path>
          <ellipse cx="417.22" cy="611.34" fill="var(--illustration-secondary)" rx="39.5" ry="12.4" transform="rotate(-23.17 156.4 637.65)"></ellipse>
          <ellipse cx="269.22" cy="664.34" fill="var(--illustration-secondary)" rx="39.5" ry="12.4" transform="rotate(-23.17 8.4 690.65)"></ellipse>
          <path fill="#fff" d="M362.6 561c0 7.73-19.9 23-42 23s-43-14.27-43-22 20.92-6 43-6 42-2.73 42 5z"></path>
        </svg>
        
        <h1 id="title">
          {currentDomain || 'CV Genius'} is temporarily unavailable.
        </h1>
        
        <p>{message}</p>
        
        <p>We'll be back shortly.</p>
        
        {(sectionName !== 'This section' || estimatedTime !== '1 hour') && (
          <div className="status-info">
            <h3>Maintenance Details</h3>
            <p><strong>Section:</strong> {sectionName}</p>
            <p><strong>Estimated time:</strong> {estimatedTime}</p>
          </div>
        )}
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check maintenance status every 30 seconds
              const checkMaintenanceStatus = async () => {
                try {
                  const response = await fetch('/api/maintenance/status');
                  if (response.ok) {
                    const data = await response.json();
                    // If maintenance is no longer active, reload the page
                    if (!data.globalMaintenance && !data.sections.some(s => s.isInMaintenance && window.location.pathname.startsWith(s.path))) {
                      window.location.reload();
                    }
                  }
                } catch (error) {
                  console.log('Unable to check maintenance status');
                }
              };

              // Check immediately and then every 30 seconds
              checkMaintenanceStatus();
              setInterval(checkMaintenanceStatus, 30000);
              
              // Fallback: full page reload every 5 minutes
              setTimeout(() => {
                window.location.reload();
              }, 300000);
            `
          }}
        />
      </body>
    </html>
  )
}
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast"
import FacebookBrowserRedirect from "@/components/ads/facebook-browser-redirect"
import PropuShNotification from "@/components/ads/propush-notification"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import ClientViewportScript from "@/components/client-viewport-script"
import HydrationFix from "@/components/hydration-fix"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { DynamicAdManager } from "@/components/ads/dynamic-ad-manager"
import AccessibilityWidget, { AccessibilityCSS } from "@/components/accessibility/accessibility-widget"
import { PWAProvider } from "@/components/pwa-provider"
import "@/lib/console-error-filter"

// Load font for admin and base layout
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CV Genius - Dublin Jobs CV Builder | Professional Irish Resume Templates 2025",
  description: "Create winning CVs for Dublin jobs market 2025. AI-powered CV builder with Irish-focused templates. Perfect for Dublin tech, finance, healthcare & engineering jobs. ATS-optimized.",
  keywords: [
    "Dublin jobs CV builder 2025",
    "Irish resume templates",
    "Dublin tech jobs CV",
    "Dublin finance jobs resume", 
    "Dublin healthcare jobs CV",
    "Dublin engineering jobs CV",
    "Irish IT jobs resume",
    "Dublin software engineer CV",
    "Dublin accountant CV template",
    "ATS friendly CV Dublin",
    "Irish job market CV 2025",
    "Dublin recruitment CV builder",
    "Irish professional resume",
    "Dublin employment CV maker",
    "CV builder Ireland",
    "resume builder Dublin"
  ],
  authors: [{ name: "CVGenius Team" }],
  creator: "CVGenius",
  publisher: "CVGenius",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cvgenius.ie"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CV Genius - Dublin Jobs CV Builder | Professional Irish Resume Templates 2025",
    description: "Create winning CVs for Dublin jobs market 2025. AI-powered CV builder with Irish-focused templates. Perfect for Dublin tech, finance, healthcare & engineering jobs. ATS-optimized.",
    url: "https://cvgenius.ie",
    siteName: "CVGenius",
    locale: "en_IE",
    type: "website",
    countryName: "Ireland",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CVGenius - AI CV Builder for Ireland",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 600,
        height: 600,
        alt: "CVGenius Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Genius - Dublin Jobs CV Builder | Professional Irish Resume Templates 2025",
    description: "Create winning CVs for Dublin jobs market 2025. AI-powered CV builder with Irish-focused templates. Perfect for Dublin tech, finance, healthcare & engineering jobs. ATS-optimized.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#8B5CF6",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IE" className="scroll-smooth h-full" suppressHydrationWarning>
      <head>
        {/* Mobile Web App Capabilities */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CVGenius" />
        <meta name="viewport-fit" content="cover" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.svg" sizes="180x180" />
        <link rel="apple-touch-icon" href="/favicon.svg" sizes="152x152" />
        <link rel="apple-touch-icon" href="/favicon.svg" sizes="120x120" />
        
        {/* Enhanced PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Dublin/Irish specific */}
        <meta name="geo.region" content="IE-D" />
        <meta name="geo.placename" content="Dublin" />
        <meta name="geo.position" content="53.349805;-6.26031" />
        <meta name="ICBM" content="53.349805, -6.26031" />
        
        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* AdSense Performance */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
          </>
        )}
        
        {/* Google AdSense with Enhanced Timeout Handling */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script dangerouslySetInnerHTML={{
            __html: `
              // Enhanced AdSense loading with retry and fallback
              (function() {
                var retryCount = 0;
                var maxRetries = 3;
                var retryDelay = 2000;
                
                function loadAdSenseScript() {
                  // Create script element
                  var script = document.createElement('script');
                  script.async = true;
                  script.crossOrigin = 'anonymous';
                  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}';
                  
                  // Set up timeout
                  var timeoutId = setTimeout(function() {
                    console.warn('AdSense script timeout (' + (retryCount + 1) + '/' + maxRetries + ')');
                    script.remove();
                    handleScriptError();
                  }, 15000); // 15 second timeout
                  
                  // Success handler
                  script.onload = function() {
                    clearTimeout(timeoutId);
                    console.log('AdSense script loaded successfully');
                    
                    // Ensure adsbygoogle is available
                    if (!window.adsbygoogle) {
                      window.adsbygoogle = [];
                    }
                  };
                  
                  // Error handler with retry
                  script.onerror = function() {
                    clearTimeout(timeoutId);
                    script.remove();
                    handleScriptError();
                  };
                  
                  // Add to document
                  document.head.appendChild(script);
                }
                
                function handleScriptError() {
                  if (retryCount < maxRetries) {
                    retryCount++;
                    console.log('Retrying AdSense script load in ' + retryDelay + 'ms... (' + retryCount + '/' + maxRetries + ')');
                    setTimeout(loadAdSenseScript, retryDelay);
                    retryDelay *= 1.5; // Exponential backoff
                  } else {
                    console.warn('AdSense script failed to load after ' + maxRetries + ' attempts - using fallback');
                    // Initialize fallback
                    if (!window.adsbygoogle) {
                      window.adsbygoogle = [];
                    }
                  }
                }
                
                // Start loading
                loadAdSenseScript();
              })();
            `
          }} />
        )}
        
        {/* Monetag - Only Banner Zone (No Popups) */}
        
        {/* PropuSH Service Worker - Disabled for Better UX */}
        
        {/* Mobile Keyboard Avoidance */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
        {/* Console Error Suppression - Must be first! */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Early browser extension error suppression
              if (typeof window !== 'undefined' && window.console) {
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalLog = console.log;
                
                const filterMessage = (message) => {
                  const msgStr = String(message).toLowerCase();
                  return msgStr.includes('runtime.lasterror') ||
                         msgStr.includes('unchecked runtime.lasterror') ||
                         msgStr.includes('message port closed') ||
                         msgStr.includes('could not establish connection') ||
                         msgStr.includes('receiving end does not exist') ||
                         msgStr.includes('extension context invalidated') ||
                         msgStr.includes('chrome-extension') ||
                         msgStr.includes('moz-extension') ||
                         msgStr.includes('.chunk.css') ||
                         msgStr.includes('net::err_file_not_found') ||
                         msgStr.includes('syntaxerror: invalid or unexpected token') ||
                         msgStr.includes('download the react devtools') ||
                         msgStr.includes('react devtools') ||
                         msgStr.includes('better development experience') ||
                         msgStr.includes('https://react.dev/link/react-devtools') ||
                         msgStr.includes('listener indicated an asynchronous response') ||
                         msgStr.includes('asynchronous response by returning true') ||
                         msgStr.includes('message channel closed before a response') ||
                         msgStr.includes('the message port closed before a response was received') ||
                         msgStr.includes('caught error handling') ||
                         msgStr.includes('hide-notification') ||
                         msgStr.includes('nmlockstate') ||
                         msgStr.includes('nmofflinestatus') ||
                         msgStr.includes('sending') && msgStr.includes('message to native core') ||
                         msgStr.includes('received message') && msgStr.includes('from native core') ||
                         msgStr.includes('background.js') ||
                         msgStr.includes('pop.html') ||
                         msgStr.includes('pop.chunk.css') ||
                         msgStr.includes('injected.js') ||
                         msgStr.includes('vercel speed insights') ||
                         msgStr.includes('debug mode is enabled by default in development') ||
                         msgStr.includes('no requests will be sent to the server') ||
                         msgStr.includes('speed insights') && msgStr.includes('development') ||
                         msgStr.includes('main-app.js') && msgStr.includes('react devtools') ||
                         msgStr.includes('assets/css/') && msgStr.includes('net::err_file_not_found') ||
                         msgStr.includes('understand this error') ||
                         msgStr.startsWith('[vercel speed insights]') ||
                         // Comprehensive browser extension file patterns
                         /^[a-z-]+\.(html|js|css):\d+/.test(msgStr) && (msgStr.includes('extension') || msgStr.includes('chunk') || msgStr.includes('net::err'));
                };
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (!filterMessage(message)) {
                    originalError.apply(console, args);
                  }
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (!filterMessage(message)) {
                    originalWarn.apply(console, args);
                  }
                };
                
                console.log = function(...args) {
                  const message = args.join(' ');
                  if (!filterMessage(message)) {
                    originalLog.apply(console, args);
                  }
                };
                
                // Handle unhandled rejections
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && filterMessage(String(event.reason.message || event.reason))) {
                    event.preventDefault();
                  }
                });
                
                // Handle general errors
                window.addEventListener('error', function(event) {
                  if (event.message && filterMessage(event.message)) {
                    event.preventDefault();
                  }
                });
                
                // Suppress uncaught syntax errors from extensions
                window.addEventListener('error', function(event) {
                  if (event.filename && (
                    event.filename.includes('chrome-extension') ||
                    event.filename.includes('moz-extension') ||
                    event.filename.includes('extension')
                  )) {
                    event.preventDefault();
                  }
                });
              }
            })();
          `
        }} />
        
        {/* Skip to main content link for accessibility */}
        <style>{`
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #2563eb;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
          }
          .skip-link:focus {
            top: 6px;
          }
        `}</style>
      </head>
      <body className={`${inter.className} min-h-screen h-full flex flex-col antialiased touch-manipulation overscroll-none`} suppressHydrationWarning>
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <PWAProvider>
          <DynamicAdManager>
            <ToastProvider>
              <ErrorBoundary>
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
              </ErrorBoundary>
            </ToastProvider>
          </DynamicAdManager>
        </PWAProvider>
        
        {/* Fix hydration issues caused by browser extensions */}
        <HydrationFix />
        
        {/* Client-side viewport script to prevent hydration errors */}
        <ClientViewportScript />
        
        {/* Offline Indicator */}
        <OfflineIndicator />
        
        {/* PropuSH Push Notifications (Controlled) */}
        <PropuShNotification />
        
        {/* Facebook Browser Redirect */}
        <FacebookBrowserRedirect />
        
        {/* Accessibility Widget */}
        <AccessibilityWidget />
        
        {/* Accessibility CSS */}
        <AccessibilityCSS />
        
        {/* Vercel Speed Insights */}
        <SpeedInsights />
        
        {/* Vercel Web Analytics */}
        <Analytics />
        


        {/* Duplicate Viewport Meta Tag Fix */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Remove duplicate viewport meta tags on page load
            document.addEventListener('DOMContentLoaded', function() {
              const viewportTags = document.querySelectorAll('meta[name="viewport"]');
              if (viewportTags.length > 1) {
                // Keep the first one, remove duplicates
                for (let i = 1; i < viewportTags.length; i++) {
                  viewportTags[i].remove();
                }
              }
            });
          `
        }} />
      </body>
    </html>
  )
}
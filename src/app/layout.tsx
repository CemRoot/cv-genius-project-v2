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
import "@/lib/adsense-debug-helper"

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
        {/* Dark Mode FOUC Prevention Script - Must be first! */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                // Check localStorage for darkMode preference (matching useDarkMode hook)
                const darkModeStored = localStorage.getItem('darkMode');
                let shouldBeDark = false;
                
                if (darkModeStored !== null) {
                  // Use stored preference
                  shouldBeDark = JSON.parse(darkModeStored);
                } else {
                  // Default to system preference
                  shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                
                // Apply dark mode
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (error) {
                // Fallback to system preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              }
            })();
          `
        }} />
        
        {/* Color scheme meta tag to prevent browser dark mode inversion */}
        <meta name="color-scheme" content="light dark" />
        
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
        
        {/* AdSense Performance & Loading */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <>
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
            <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
          </>
        )}
        
        {/* Enhanced AdSense Script Loading with 408 Timeout Protection */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof window === 'undefined') return;
              
              // Skip in development mode
              const isDevelopment = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' || 
                                  window.location.port === '3000';
              if (isDevelopment) {
                console.log('🔍 [AdSense] Development mode detected - AdSense loading disabled');
                return;
              }
              
              const clientId = 'ca-pub-1742989559393752';
              const scriptUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
              
              console.log('🚀 [AdSense] Starting enhanced script loading...');
              
              let attempts = 0;
              const maxAttempts = 3;
              const timeoutMs = 15000; // 15 seconds timeout
              
              function loadAdSenseScript() {
                return new Promise((resolve, reject) => {
                  attempts++;
                  console.log('📡 [AdSense] Attempt ' + attempts + '/' + maxAttempts + ' - Creating script element...');
                  
                  const script = document.createElement('script');
                  script.async = true;
                  script.src = scriptUrl;
                  script.crossOrigin = 'anonymous';
                  script.defer = true;
                  
                  const timeout = setTimeout(() => {
                    console.error('⏰ [AdSense] Script timeout after ' + timeoutMs + 'ms');
                    script.remove();
                    reject(new Error('AdSense script timeout'));
                  }, timeoutMs);
                  
                  script.onload = function() {
                    clearTimeout(timeout);
                    console.log('✅ [AdSense] Script loaded successfully in ' + (Date.now() - startTime) + 'ms');
                    window.adSenseLoaded = true;
                    window.adSenseError = null;
                    window.adSenseLoadTime = Date.now() - startTime;
                    
                    // Initialize adsbygoogle if not already done
                    if (!window.adsbygoogle) {
                      window.adsbygoogle = [];
                      console.log('🔧 [AdSense] Initialized adsbygoogle array');
                    }
                    
                    resolve();
                  };
                  
                  script.onerror = function(error) {
                    clearTimeout(timeout);
                    console.error('❌ [AdSense] Script load error after ' + (Date.now() - startTime) + 'ms:', error);
                    script.remove();
                    reject(error);
                  };
                  
                  const startTime = Date.now();
                  document.head.appendChild(script);
                });
              }
              
              async function retryLoadAdSense() {
                for (let i = 0; i < maxAttempts; i++) {
                  try {
                    await loadAdSenseScript();
                    return; // Success
                  } catch (error) {
                    console.warn('⚠️ [AdSense] Attempt ' + (i + 1) + ' failed:', error.message);
                    
                    if (i === maxAttempts - 1) {
                      console.error('❌ [AdSense] All attempts failed. AdSense will not be available.');
                      window.adSenseLoaded = false;
                      window.adSenseError = error.message;
                      return;
                    }
                    
                    // Wait before retry (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, i), 5000);
                    console.log('⏳ [AdSense] Retrying in ' + delay + 'ms...');
                    await new Promise(resolve => setTimeout(resolve, delay));
                  }
                }
              }
              
              // Global debug helper
              window.adSenseDebug = {
                getInfo: function() {
                  return {
                    loaded: window.adSenseLoaded,
                    error: window.adSenseError,
                    loadTime: window.adSenseLoadTime,
                    adsbygoogleAvailable: !!window.adsbygoogle,
                    adsbygoogleLength: window.adsbygoogle ? window.adsbygoogle.length : 0,
                    attempts: attempts
                  };
                },
                logInfo: function() {
                  console.log('📊 [AdSense Debug]', this.getInfo());
                },
                retry: function() {
                  console.log('🔄 [AdSense] Manual retry requested...');
                  retryLoadAdSense();
                },
                checkScript: function() {
                  const scripts = document.querySelectorAll('script[src*="adsbygoogle"]');
                  console.log('🔍 [AdSense] Script check:', {
                    scriptsFound: scripts.length,
                    scripts: Array.from(scripts).map(s => s.src)
                  });
                  return scripts.length > 0;
                }
              };
              
              // Start loading
              retryLoadAdSense();
            })();
          `
        }} />
        
        {/* Monetag - Only Banner Zone (No Popups) */}
        
        {/* PropuSH Service Worker - Disabled for Better UX */}
        
        {/* Mobile Keyboard Avoidance */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
        {/* React Hook Error Tracking - Must be first! */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // React Hook Error Tracking for Production
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(event) {
                  if (event.error && event.error.message && event.error.message.includes('Hook')) {
                    console.error('React Hook Error Details:', {
                      message: event.error.message,
                      stack: event.error.stack,
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent,
                      url: window.location.href
                    });
                  }
                });
                
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && event.reason.message && event.reason.message.includes('Hook')) {
                    console.error('React Hook Promise Rejection:', {
                      message: event.reason.message,
                      stack: event.reason.stack,
                      timestamp: new Date().toISOString(),
                      url: window.location.href
                    });
                  }
                });
              }
              
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
      <body className={`${inter.className} min-h-screen h-full flex flex-col touch-manipulation overscroll-none`} suppressHydrationWarning>
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
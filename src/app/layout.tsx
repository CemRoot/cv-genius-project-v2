import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast"
import PropuShNotification from "@/components/ads/propush-notification"

// Load font for admin and base layout
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CVGenius - AI-Powered CV Builder for Irish Job Market",
  description: "Create ATS-friendly CVs with AI specifically designed for Dublin and Irish job market. 100% free, no signup required, privacy-first approach.",
  keywords: [
    "CV builder",
    "resume builder", 
    "Dublin jobs",
    "Irish job market",
    "ATS friendly",
    "AI CV",
    "free CV builder",
    "Ireland jobs"
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
    title: "CVGenius - AI-Powered CV Builder for Irish Job Market",
    description: "Create ATS-friendly CVs with AI specifically designed for Dublin and Irish job market. 100% free, no signup required.",
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
    title: "CVGenius - AI-Powered CV Builder for Irish Job Market",
    description: "Create ATS-friendly CVs with AI specifically designed for Dublin and Irish job market. 100% free, no signup required.",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IE" className="scroll-smooth h-full" suppressHydrationWarning>
      <head>
        {/* Enhanced Mobile Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CVGenius" />
        
        {/* Safe Area Support */}
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
        
        {/* Service Worker for PropuSH Push Notifications */}
        <link rel="serviceworker" href="/sw-check-permissions-36fdf.js" />
        <meta name="propush-sw" content="/sw-check-permissions-36fdf.js" />
        
        {/* Mobile Keyboard Avoidance */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
        {/* Viewport Height CSS Variables */}
        <script dangerouslySetInnerHTML={{
          __html: `
            function setVH() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', vh + 'px');
              document.documentElement.style.setProperty('--vh-full', window.innerHeight + 'px');
              document.documentElement.style.setProperty('--vh-small', (window.innerHeight * 0.01) + 'px');
            }
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
          `
        }} />
      </head>
      <body className={`${inter.className} min-h-screen h-full flex flex-col antialiased touch-manipulation overscroll-none`} suppressHydrationWarning>
        <ToastProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ToastProvider>
        
        {/* PropuSH Push Notifications */}
        <PropuShNotification />
      </body>
    </html>
  )
}
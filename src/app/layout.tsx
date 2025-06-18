import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast"

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IE" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CVGenius" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Dublin/Irish specific */}
        <meta name="geo.region" content="IE-D" />
        <meta name="geo.placename" content="Dublin" />
        <meta name="geo.position" content="53.349805;-6.26031" />
        <meta name="ICBM" content="53.349805, -6.26031" />
        
        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PropPush Global Script - Only load on production */}
        {process.env.NODE_ENV === 'production' && (
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var d = document;
                  var s = d.createElement('script');
                  s.type = 'text/javascript';
                  s.async = true;
                  s.src = 'https://propush.me/smart/2931632/script.js';
                  var h = d.getElementsByTagName('head')[0];
                  h.appendChild(s);
                })();
              `
            }}
          />
        )}
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <ToastProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  )
}
import type { Metadata } from "next"
import { Inter, Source_Serif_4, Merriweather, Playfair_Display, Roboto, Open_Sans, Lato, Montserrat } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import ErrorBoundary from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast"
import { StickySideAds } from "@/components/ads/sticky-side-ads"
import { MobileAds } from "@/components/ads/mobile-ads"

// Load professional fonts for CV/Resume use
const inter = Inter({ subsets: ["latin"] })
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"], weight: ['400', '700'] })
const merriweather = Merriweather({ subsets: ["latin"], weight: ['400', '700'] })
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ['400', '700'] })
const roboto = Roboto({ subsets: ["latin"], weight: ['400', '700'] })
const openSans = Open_Sans({ subsets: ["latin"], weight: ['400', '700'] })
const lato = Lato({ subsets: ["latin"], weight: ['400', '700'] })
const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '700'] })

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

        {/* PropellerAds OnClick Ads */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,z,s){
                s.src='//'+d+'/400/'+z;
                try{(document.body||document.documentElement).appendChild(s)}catch(e){}
              })('jsc.propellerads.com','REPLACE_WITH_YOUR_ZONE_ID',document.createElement('script'))
            `
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ToastProvider>
          <ErrorBoundary>
            {/* Mobile Top Ad */}
            <MobileAds position="top" />
            
            <Navigation />
            
            <main className="flex-1">
              {children}
            </main>
            
            <Footer />
            
            {/* Mobile Bottom Ad */}
            <MobileAds position="bottom" />
            
            {/* Mobile Floating Ad */}
            <MobileAds position="floating" />
            
            {/* Desktop Side Ads */}
            <StickySideAds />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  )
}
'use client'

import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdController } from "@/components/ads/ad-controller"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Top Ad - Outside of fixed navigation flow */}
      <div className="lg:hidden">
        <AdController type="mobile-top" />
      </div>
      
      <Navigation />
      
      {/* Header Banner Ad - Desktop (Below Navigation) */}
      <div className="hidden md:block pt-16 lg:pt-20 bg-white border-b relative z-30">
        <div className="container mx-auto px-4">
          <AdController type="banner" size="large" className="py-3" />
        </div>
      </div>
      
      {/* Main content with proper padding to account for fixed navigation and mobile ad */}
      <main className="flex-1 pt-16 lg:pt-20 md:pt-0">
        {children}
      </main>
      
      <Footer />
      
      {/* Mobile Bottom Ad */}
      <AdController type="mobile-bottom" />
      
      {/* Desktop Side Ads */}
      <AdController type="sticky-side" />
    </div>
  )
}
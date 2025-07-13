'use client'

import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdSection } from "@/components/ads/ad-section"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Top Ad - Outside of fixed navigation flow */}
      <div className="lg:hidden">
        <AdSection type="mobile-top" />
      </div>
      
      <Navigation />
      
      {/* Header Banner Ad - Desktop (Below Navigation) */}
      <div className="hidden md:block pt-16 lg:pt-20 bg-background dark:bg-background border-b dark:border-border relative z-30">
        <div className="container mx-auto px-4">
          <AdSection type="banner" size="large" className="py-3" />
        </div>
      </div>
      
      {/* Main content with proper padding to account for fixed navigation and mobile ad */}
      <main className="flex-1 pt-16 lg:pt-20 md:pt-0">
        {children}
      </main>
      
      <Footer />
      
      {/* Mobile Bottom Ad */}
      <AdSection type="mobile-bottom" />
      
      {/* Desktop Side Ads */}
      <AdSection type="sticky-side" />
    </div>
  )
}
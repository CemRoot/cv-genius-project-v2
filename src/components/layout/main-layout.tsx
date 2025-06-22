'use client'

import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdController } from "@/components/ads/ad-controller"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile Top Ad */}
      <AdController type="mobile-top" />
      
      {/* Header Banner Ad - Desktop */}
      <div className="hidden md:block">
        <AdController type="banner" size="large" className="pt-2 pb-1" />
      </div>
      
      <Navigation />
      
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      
      <Footer />
      
      {/* Mobile Bottom Ad */}
      <AdController type="mobile-bottom" />
      
      {/* Desktop Side Ads */}
      <AdController type="sticky-side" />
    </>
  )
}
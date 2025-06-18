'use client'

import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdController } from "@/components/ads/ad-controller"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile Top Ad */}
      <AdController type="mobile-top" />
      
      <Navigation />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      
      {/* Mobile Bottom Ad */}
      <AdController type="mobile-bottom" />
      
      {/* Mobile Floating Ad */}
      <AdController type="mobile-floating" />
      
      {/* Desktop Side Ads */}
      <AdController type="sticky-side" />
    </>
  )
}
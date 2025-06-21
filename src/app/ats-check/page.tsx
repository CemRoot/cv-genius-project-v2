'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard'
import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports with loading states
const ATSAnalyzer = dynamic(() => import('@/components/ats/ats-analyzer').then(mod => ({ default: mod.ATSAnalyzer })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
})

const MobileATSAnalyzer = dynamic(() => import('@/components/ats/mobile-ats-analyzer').then(mod => ({ default: mod.MobileATSAnalyzer })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
})

export default function ATSCheckPage() {
  const [isMobile, setIsMobile] = useState(false)
  const { isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()

  // Detect mobile device
  useEffect(() => {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return (
    <MainLayout>
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        style={{ height: isMobile && isKeyboardOpen ? adjustedViewHeight : 'auto' }}
      >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              ATS Compatibility Checker
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Analyze your CV for Applicant Tracking System (ATS) compatibility and get 
              optimization recommendations for the Irish job market.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 md:py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          {isMobile ? (
            <MobileATSAnalyzer isMobile={isMobile} />
          ) : (
            <ATSAnalyzer isMobile={isMobile} />
          )}
        </Suspense>
      </div>
    </div>
    </MainLayout>
  )
}
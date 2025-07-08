'use client'

import { ExportManager } from '@/components/export/export-manager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMobileKeyboard } from '@/components/mobile'
import { useCVStore } from '@/store/cv-store'
import { useState, useEffect } from 'react'
import { CVPreview } from '@/components/cv/cv-preview'

export default function ExportPage() {
  const [isMobile, setIsMobile] = useState(false)
  const { isVisible: isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()
  const { currentCV, updateSessionState } = useCVStore()
  const router = useRouter()

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

  const handleBackToBuilder = () => {
    // Ensure user goes to form/editor, not template selection
    if (currentCV) {
      updateSessionState({
        selectedTemplateId: currentCV.template || 'harvard',
        builderMode: 'editor',
        mobileActiveTab: 'edit'
      })
    }
    router.push('/builder')
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{ height: isMobile && isKeyboardOpen ? adjustedViewHeight : 'auto' }}
    >
      {/* Hidden off-screen preview for high-fidelity PDF capture */}
      <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        {/* Desktop sized preview so exported PDF matches on-screen design */}
        <CVPreview isMobile={false} />
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-h-[44px] touch-manipulation"
                size={isMobile ? "lg" : "default"}
                onClick={handleBackToBuilder}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to CV Builder
              </Button>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Export Your CV
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Download your professionally formatted CV in multiple formats optimized for the Irish job market.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="space-y-6">
            {/* CV Preview - Mobile */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">CV Preview</h2>
                <p className="text-sm text-gray-600">Your CV will look exactly like this in the PDF</p>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <CVPreview isMobile={true} />
              </div>
            </div>
            
            {/* Export Options - Mobile */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <ExportManager isMobile={isMobile} />
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CV Preview - Desktop */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">CV Preview</h2>
                <p className="text-gray-600">Your CV will look exactly like this in the PDF</p>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
                <CVPreview isMobile={false} />
              </div>
            </div>
            
            {/* Export Options - Desktop */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ExportManager isMobile={isMobile} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
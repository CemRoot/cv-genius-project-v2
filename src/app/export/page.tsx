'use client'

import { ExportManager } from '@/components/export/export-manager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useMobileKeyboard } from '@/components/mobile'
import { useState, useEffect } from 'react'

export default function ExportPage() {
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
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{ height: isMobile && isKeyboardOpen ? adjustedViewHeight : 'auto' }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <Link href="/builder">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 min-h-[44px] touch-manipulation"
                  size={isMobile ? "lg" : "default"}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to CV Builder
                </Button>
              </Link>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ExportManager isMobile={isMobile} />
      </div>
    </div>
  )
}
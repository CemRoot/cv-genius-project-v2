'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { useMobileKeyboard } from '@/components/mobile'
import { useState, useEffect } from 'react'

export default function CoverLetterPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const { isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleStartBuilding = () => {
    router.push('/cover-letter/experience')
  }

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
                AI Cover Letter Builder
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                Create professional cover letters tailored to your experience and career goals. 
                Our smart builder guides you through every step.
              </p>
            </div>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Questionnaire</h3>
            <p className="text-gray-600 text-sm">
              Answer a few questions about your experience and background to personalize your cover letter
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Template</h3>
            <p className="text-gray-600 text-sm">
              Select from professionally designed templates and customize colors to match your style
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Generation</h3>
            <p className="text-gray-600 text-sm">
              Generate compelling content powered by AI, tailored to your specific situation and goals
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleStartBuilding}
            size="lg"
            className="px-8 py-4 text-lg font-semibold"
          >
            Start Building Your Cover Letter
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            Takes less than 5 minutes to complete
          </p>
        </div>
      </div>
      </div>
    </MainLayout>
  )
}
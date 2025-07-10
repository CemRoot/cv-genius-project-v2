'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { CvBuilderInterface } from '@/components/cv-builder/cv-builder-interface'
import { CvBuilderLoading } from '@/components/cv-builder/cv-builder-loading'
import { ArrowLeft, Home, Settings } from 'lucide-react'
import '@/styles/cv-builder.css'

export default function CvBuilderPage() {
  const router = useRouter()

  // Enhanced sticky header with robust scroll detection
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const header = document.querySelector('.cv-builder-header')
          if (header) {
            if (window.scrollY > 10) {
              header.classList.add('scrolled')
            } else {
              header.classList.remove('scrolled')
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    // Force sticky header positioning on mount
    const header = document.querySelector('.cv-builder-header') as HTMLElement
    if (header) {
      // Ensure initial sticky state
      header.style.position = 'sticky'
      header.style.top = '0'
      header.style.zIndex = '9999'
    }

    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial call to set correct state
    handleScroll()
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 cv-builder-page">
      <CvBuilderProvider>
        {/* Enhanced Navigation Header - Fixed Sticky */}
        <header className="cv-builder-header sticky-header">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </button>
                
                <div className="hidden sm:block h-5 w-px bg-gray-300" />
                
                <button
                  onClick={() => router.push('/builder')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Other Builders
                </button>
              </div>

              {/* Center Title */}
              <div className="flex-1 text-center">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Dublin CV Builder
                </h1>
                <p className="hidden sm:block text-sm text-gray-500">
                  ATS-optimized for Irish job market
                </p>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Home"
                >
                  <Home className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => router.push('/builder')}
                  className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Other Builders"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="cv-builder-main-mobile">
          {/* CV Builder Interface */}
          <Suspense fallback={<CvBuilderLoading />}>
            <CvBuilderInterface />
          </Suspense>
        </main>
      </CvBuilderProvider>
    </div>
  )
}
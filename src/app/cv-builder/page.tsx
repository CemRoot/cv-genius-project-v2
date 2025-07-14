'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { CvBuilderInterface } from '@/components/cv-builder/cv-builder-interface'
import { CvBuilderLoading } from '@/components/cv-builder/cv-builder-loading'
import { ArrowLeft, Home, Settings } from 'lucide-react'
import { clearCvBuilderStorage } from '@/utils/clear-cv-storage'
import '@/styles/cv-builder.css'

export default function CvBuilderPage() {
  const router = useRouter()

  // Check for storage clear flag
  useEffect(() => {
    const shouldClear = new URLSearchParams(window.location.search).get('clear') === 'true'
    if (shouldClear) {
      clearCvBuilderStorage()
      // Remove the clear parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Reload to ensure fresh state
      window.location.reload()
    }
  }, [])

  // Static header - no scroll needed since page is fixed height
  useEffect(() => {
    // Ensure header is properly positioned
    const header = document.querySelector('.cv-builder-header') as HTMLElement
    if (header) {
      header.style.position = 'relative' // Changed from sticky to relative
      header.style.zIndex = '9999'
    }
  }, [])

  return (
    <div className="h-screen bg-background cv-builder-page flex flex-col">
      <CvBuilderProvider>
        {/* Enhanced Navigation Header - Fixed */}
        <header className="cv-builder-header flex-shrink-0">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </button>
                
                <div className="hidden sm:block h-5 w-px bg-border" />
                
                <button
                  onClick={() => router.push('/builder')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Other Builders
                </button>
              </div>

              {/* Center Title */}
              <div className="flex-1 text-center">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  Dublin CV Builder
                </h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  ATS-optimized for Irish job market
                </p>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Home"
                >
                  <Home className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => router.push('/builder')}
                  className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Other Builders"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="cv-builder-main-mobile flex-1">
          {/* CV Builder Interface */}
          <Suspense fallback={<CvBuilderLoading />}>
            <CvBuilderInterface />
          </Suspense>
        </main>
      </CvBuilderProvider>
    </div>
  )
}
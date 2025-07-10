'use client'

import { Suspense } from 'react'
import { CvBuilderProvider } from '@/contexts/cv-builder-context'
import { CvBuilderInterface } from '@/components/cv-builder/cv-builder-interface'
import { CvBuilderLoading } from '@/components/cv-builder/cv-builder-loading'

export default function CvBuilderPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CvBuilderProvider>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dublin CV Builder
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create an ATS-friendly CV tailored for Dublin job market. 
              Built with Irish formatting standards and optimized for applicant tracking systems.
            </p>
          </div>

          {/* CV Builder Interface */}
          <Suspense fallback={<CvBuilderLoading />}>
            <CvBuilderInterface />
          </Suspense>
        </div>
      </CvBuilderProvider>
    </main>
  )
}
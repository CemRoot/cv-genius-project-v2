'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderSidebar } from './cv-builder-sidebar'
import { CvBuilderPreview } from './cv-builder-preview'
import { CvBuilderToolbar } from './cv-builder-toolbar'
import { AutoSaveStatus } from './auto-save-status'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-red-50 rounded-lg border border-red-200">
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-700 mb-4 max-w-md">
          {error.message || 'An unexpected error occurred while building your CV.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export function CvBuilderInterface() {
  const router = useRouter()
  const { error, hasUnsavedChanges, isSaving } = useCvBuilder()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'references'>('personal')

  const handleBack = () => {
    // If there are unsaved changes, ask for confirmation
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmLeave) return
    }
    
    // Try to go back in history, or fallback to home page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Compact Header Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section - Navigation & Title */}
              <div className="flex items-center space-x-3">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-sm"
                  title="Go back"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
                
                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Toggle sidebar"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-2.5">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Dublin CV Builder
                    </h2>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      ATS-optimized professional CV
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section - Status & Actions */}
              <div className="flex items-center space-x-2">
                {/* Auto-save Status */}
                <div className="hidden sm:block">
                  <AutoSaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} />
                </div>
                
                {/* Action Buttons */}
                <CvBuilderToolbar />
              </div>
            </div>
          </div>
          
          {/* Mobile Status Bar */}
          <div className="sm:hidden px-4 pb-2">
            <AutoSaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} />
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
          {/* Sidebar - Optimized Width */}
          <div
            className={`transition-all duration-300 border-gray-200 overflow-y-auto overflow-x-hidden bg-gray-50
              ${sidebarOpen ? 'border-b lg:border-b-0 lg:border-r' : ''}
              ${sidebarOpen ? 'max-h-[50vh] lg:max-h-none' : 'h-0 lg:h-auto'}
              ${sidebarOpen ? 'w-full lg:w-[480px] xl:w-[520px]' : 'w-0'}`}
          >
            {/* Render sidebar content only when width is visible to avoid tab order issues */}
            {sidebarOpen && (
              <CvBuilderSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            )}
          </div>

          {/* Preview Area - Centered and Properly Scaled */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            <CvBuilderPreview />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
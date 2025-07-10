'use client'

import React, { useState } from 'react'
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
  const { error, hasUnsavedChanges, isSaving } = useCvBuilder()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'experience' | 'education' | 'skills'>('personal')

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
        {/* Status Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                CV Builder
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <AutoSaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} />
              <CvBuilderToolbar />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'w-96' : 'w-0'} lg:w-96 transition-all duration-300 border-r border-gray-200 overflow-hidden`}>
            <CvBuilderSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100">
            <CvBuilderPreview />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'

export function CvBuilderToolbar() {
  const { saveDocument, downloadPdf, resetDocument, isSaving, pdfGeneration } = useCvBuilder()

  const handleSave = async () => {
    try {
      await saveDocument()
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }

  const handleExportPdf = async () => {
    try {
      const success = await downloadPdf()
      if (!success) {
        console.error('Failed to download PDF')
      }
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your CV? This action cannot be undone.')) {
      resetDocument()
    }
  }

  return (
    <div className="flex items-center space-x-1.5">
      {/* Save Button - Compact */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden sm:inline">Saving...</span>
          </>
        ) : (
          <>
            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Save</span>
          </>
        )}
      </button>

      {/* Export PDF Button - Compact */}
      <div className="relative">
        <button
          onClick={handleExportPdf}
          disabled={pdfGeneration.isGenerating}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pdfGeneration.isGenerating ? (
            <>
              <svg className="animate-spin mr-1.5 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">{Math.round(pdfGeneration.progress)}%</span>
            </>
          ) : (
            <>
              <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">PDF</span>
            </>
          )}
        </button>
        
        {/* Enhanced Progress tooltip */}
        {pdfGeneration.isGenerating && (
          <div className="absolute top-full left-0 mt-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>{pdfGeneration.stage}</span>
            </div>
          </div>
        )}
        
        {/* Enhanced Error tooltip */}
        {pdfGeneration.error && (
          <div className="absolute top-full left-0 mt-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{pdfGeneration.error}</span>
            </div>
          </div>
        )}
      </div>

      {/* More Options Button - Compact */}
      <div className="relative">
        <button 
          onClick={handleReset}
          className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-600 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          title="Reset CV"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
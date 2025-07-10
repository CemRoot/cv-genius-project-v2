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
    <div className="flex items-center space-x-2">
      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Save
          </>
        )}
      </button>

      {/* Export PDF Button */}
      <div className="relative">
        <button
          onClick={handleExportPdf}
          disabled={pdfGeneration.isGenerating}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pdfGeneration.isGenerating ? (
            <>
              <svg className="animate-spin mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {Math.round(pdfGeneration.progress)}%
            </>
          ) : (
            <>
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
        
        {/* Progress tooltip */}
        {pdfGeneration.isGenerating && (
          <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {pdfGeneration.stage}
          </div>
        )}
        
        {/* Error tooltip */}
        {pdfGeneration.error && (
          <div className="absolute top-full left-0 mt-1 bg-red-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {pdfGeneration.error}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      <div className="relative">
        <button className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {/* Dropdown content would be implemented with a proper dropdown library or state */}
      </div>
    </div>
  )
}
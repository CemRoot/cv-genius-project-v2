'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'

interface PdfExportButtonProps {
  variant?: 'download' | 'generate'
  className?: string
  children?: React.ReactNode
}

export function PdfExportButton({ 
  variant = 'download', 
  className = '',
  children 
}: PdfExportButtonProps) {
  const { downloadPdf, exportToPdf, pdfGeneration } = useCvBuilder()

  const handleClick = async () => {
    if (variant === 'download') {
      const success = await downloadPdf()
      if (!success) {
        console.error('PDF download failed')
      }
    } else {
      const success = await exportToPdf()
      if (!success) {
        console.error('PDF generation failed')
      }
    }
  }

  const isLoading = pdfGeneration.isGenerating
  const hasError = !!pdfGeneration.error

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {pdfGeneration.stage}...
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {children || (variant === 'download' ? 'Download PDF' : 'Generate PDF')}
          </>
        )}
      </button>

      {/* Progress indicator */}
      {isLoading && (
        <div className="absolute -bottom-8 left-0 right-0">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${pdfGeneration.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            {Math.round(pdfGeneration.progress)}% - {pdfGeneration.stage}
          </p>
        </div>
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-600 text-center">
          {pdfGeneration.error}
        </div>
      )}
    </div>
  )
}

// Export button for the main CV builder
export function CvBuilderExportButton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Export Your CV
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Download your CV as a PDF file optimized for Dublin job applications and ATS systems.
      </p>
      
      <div className="space-y-3">
        <PdfExportButton 
          variant="download" 
          className="w-full justify-center"
        >
          Download ATS-Optimized PDF
        </PdfExportButton>
        
        <div className="text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ATS Friendly
            </span>
            <span className="flex items-center">
              <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Dublin Format
            </span>
            <span className="flex items-center">
              <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              A4 Layout
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
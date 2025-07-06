'use client'

import { useState } from 'react'
import { PageBreakIndicator, PageStatus, FloatingPageIndicator } from '@/components/ui/page-break-indicator'
import { PageLimitWarning } from '@/components/ui/page-limit-warning'
import { Button } from '@/components/ui/button'

export default function TestPageIndicators() {
  const [pageCount, setPageCount] = useState(1)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Page Indicators Test</h1>
      
      <div className="space-y-6">
        {/* Page Count Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={() => setPageCount(Math.max(1, pageCount - 1))}>
            Decrease Pages
          </Button>
          <span className="text-lg font-medium">Current Pages: {pageCount}</span>
          <Button onClick={() => setPageCount(pageCount + 1)}>
            Increase Pages
          </Button>
        </div>

        {/* Page Limit Warning */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Page Limit Warning Component:</h2>
          <PageLimitWarning 
            currentPageCount={pageCount}
            maxPages={2}
            showOptimizationTips={true}
          />
        </div>

        {/* Page Status */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Page Status Component:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <PageStatus currentPage={1} totalPages={pageCount} />
          </div>
        </div>

        {/* Page Break Indicators */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Page Break Indicator Variants:</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Default (both)</p>
              <PageBreakIndicator pageNumber={1} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Text only</p>
              <PageBreakIndicator pageNumber={2} variant="text" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Visual only</p>
              <PageBreakIndicator pageNumber={3} variant="visual" />
            </div>
          </div>
        </div>

        {/* Floating Page Indicator */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Floating Page Indicator (Mobile):</h2>
          <Button onClick={() => setShowPreview(!showPreview)}>
            Toggle Preview Mode
          </Button>
          {showPreview && (
            <div className="relative h-96 bg-gray-50 rounded overflow-hidden">
              <div className="p-4">
                <p>This simulates a mobile CV preview</p>
              </div>
              <FloatingPageIndicator currentPage={1} totalPages={pageCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
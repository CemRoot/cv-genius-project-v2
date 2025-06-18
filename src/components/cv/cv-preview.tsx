"use client"

import { useCVStore } from "@/store/cv-store"
import { HarvardTemplate } from "@/components/cv/templates/harvard-template"
import { usePageDetection } from "@/hooks/use-page-detection"
import { useState } from "react"

export function CVPreview() {
  const { currentCV } = useCVStore()
  const { pageCount, currentPage, containerRef, contentRef } = usePageDetection()
  const [zoom, setZoom] = useState(100) // Zoom percentage
  
  if (!currentCV) {
    return <div className="p-8 text-center">No CV data available</div>
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200)) // Max 200%
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50)) // Min 50%
  }

  const handleFitWidth = () => {
    setZoom(100) // Reset to 100%
  }

  // Function to render the correct template
  const renderTemplate = () => {
    console.log('Rendering template:', currentCV.template)
    switch (currentCV.template) {
      case 'harvard':
        return <HarvardTemplate cv={currentCV} />
      case 'modern':
        return (
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold mb-4">Modern Template</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        )
      case 'creative':
        return (
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold mb-4">Creative Template</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        )
      default:
        return <HarvardTemplate cv={currentCV} />
    }
  }

  // Get template display name
  const getTemplateName = () => {
    switch (currentCV.template) {
      case 'harvard': return 'Harvard Classic'
      case 'modern': return 'Modern (Coming Soon)'
      case 'creative': return 'Creative (Coming Soon)'
      default: return 'Harvard Classic'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>Template: {getTemplateName()}</span>
          <span>Zoom: {zoom}%</span>
        </div>
      </div>

      {/* CV Preview Container */}
      <div 
        ref={containerRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden max-h-[80vh] overflow-y-auto"
      >
        <div className="relative">
          {/* Dynamic Page indicator */}
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-10">
            Page {currentPage} of {pageCount}
          </div>
          
          {/* Page break indicators */}
          <div className="absolute left-0 right-0 pointer-events-none z-10">
            {Array.from({ length: pageCount - 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-red-300 border-t-2 border-dashed border-red-400"
                style={{ top: `${(i + 1) * 1123}px` }}
              >
                <div className="absolute -top-4 left-2 bg-red-500 text-white text-xs px-1 rounded">
                  Page Break
                </div>
              </div>
            ))}
          </div>
          
          {/* CV Content */}
          <div 
            ref={contentRef}
            className="min-h-[1123px] max-w-[794px] mx-auto bg-white transition-transform duration-200"
            style={{ 
              width: '794px', // A4 width in pixels at 96 DPI
              minHeight: '1123px', // A4 height in pixels at 96 DPI
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
{renderTemplate()}
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="px-3 py-1 text-xs bg-muted rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zoom In
          </button>
          <button 
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="px-3 py-1 text-xs bg-muted rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zoom Out
          </button>
          <button 
            onClick={handleFitWidth}
            className="px-3 py-1 text-xs bg-muted rounded hover:bg-muted/80"
          >
            Fit Width
          </button>
        </div>
        
        {/* Page Counter */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 text-xs rounded font-medium ${
            pageCount > 2 ? 'bg-red-100 text-red-800' : 
            pageCount === 2 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {pageCount === 1 ? '✓ Perfect: 1 Page' : 
             pageCount === 2 ? '⚠ Good: 2 Pages' : 
             `❌ Too Long: ${pageCount} Pages`}
          </div>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount}
          </div>
        </div>
      </div>
    </div>
  )
}
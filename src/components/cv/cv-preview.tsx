"use client"

import { useCVStore } from "@/store/cv-store"
import { HarvardTemplate } from "@/components/cv/templates/harvard-template"
import { ClassicTemplate } from "@/components/cv/templates/classic-template"
import { DublinTechTemplate } from "@/components/cv/templates/dublin-tech-template"
import { IrishFinanceTemplate } from "@/components/cv/templates/irish-finance-template"
import { DublinPharmaTemplate } from "@/components/cv/templates/dublin-pharma-template"
import { IrishGraduateTemplate } from "@/components/cv/templates/irish-graduate-template"
import { usePageDetection } from "@/hooks/use-page-detection"
import { useState, useRef, useCallback } from "react"
import { TouchGestureWrapper } from "@/components/mobile"
import { ZoomIn, ZoomOut, Maximize2, Share, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageBreakIndicator, PageStatus, FloatingPageIndicator } from "@/components/ui/page-break-indicator"

interface CVPreviewProps {
  isMobile?: boolean
}

export function CVPreview({ isMobile = false }: CVPreviewProps) {
  const currentCV = useCVStore((state) => state.currentCV)
  console.log('🔍 CVPreview - currentCV:', currentCV)
  console.log('🔍 CVPreview - personal data:', currentCV?.personal)
  console.log('🔍 CVPreview - nationality:', currentCV?.personal?.nationality)
  const { pageCount, currentPage, containerRef, contentRef } = usePageDetection()
  const [zoom, setZoom] = useState(isMobile ? 100 : 100) // Start at full size on mobile
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'copied'>('idle')
  const [hapticEnabled, setHapticEnabled] = useState(true)
  
  if (!currentCV) {
    return <div className="p-8 text-center">No CV data available</div>
  }

  const handleZoomIn = () => {
    const increment = isMobile ? 20 : 25
    const newZoom = Math.min(zoom + increment, isMobile ? 150 : 200)
    setZoom(newZoom)
    
    // Haptic feedback for button press
    if (isMobile && hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate([15])
    }
  }

  const handleZoomOut = () => {
    const decrement = isMobile ? 20 : 25  
    const newZoom = Math.max(zoom - decrement, isMobile ? 60 : 50)
    setZoom(newZoom)
    
    // Haptic feedback for button press
    if (isMobile && hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate([15])
    }
  }

  const handleFitWidth = () => {
    setZoom(isMobile ? 100 : 100)
    setPanOffset({ x: 0, y: 0 })
    
    // Strong haptic feedback for fit width
    if (isMobile && hapticEnabled && 'vibrate' in navigator) {
      navigator.vibrate([30])
    }
  }

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${currentCV.personal.fullName || 'Professional'} CV - CVGenius`,
      text: `Check out this professional CV created with CVGenius - Ireland's AI-powered CV builder`,
      url: window.location.origin + '/builder'
    }

    setShareStatus('sharing')

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        setShareStatus('success')
        setTimeout(() => setShareStatus('idle'), 2000)
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          // User didn't cancel, try fallback
          handleFallbackShare(shareData.url)
        } else {
          setShareStatus('idle')
        }
      }
    } else {
      // Fallback to clipboard
      handleFallbackShare(shareData.url)
    }
  }, [currentCV.personal.fullName])

  const handleFallbackShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (error: any) {
      console.error('Failed to copy to clipboard:', error)
      setShareStatus('idle')
    }
  }

  const handlePinch = ({ scale }: { scale: number }) => {
    if (isMobile) {
      const newZoom = Math.max(60, Math.min(150, zoom * scale))
      setZoom(newZoom)
      
      // Haptic feedback for zoom changes
      if (hapticEnabled && 'vibrate' in navigator) {
        navigator.vibrate([10])
      }
    }
  }

  const handlePan = ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
    if (isMobile && zoom > 100) {
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      // Light haptic feedback for panning
      if (hapticEnabled && 'vibrate' in navigator && Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        navigator.vibrate([5])
      }
    }
  }

  // Function to render the correct template
  const renderTemplate = () => {
    switch (currentCV.template) {
      case 'harvard':
        return <HarvardTemplate cv={currentCV} isMobile={isMobile} />
      case 'classic':
        return <ClassicTemplate cv={currentCV} isMobile={isMobile} />
      case 'dublin':
      case 'dublin-tech':
        return <DublinTechTemplate cv={currentCV} isMobile={isMobile} />
      case 'irish-finance':
        return <IrishFinanceTemplate cv={currentCV} isMobile={isMobile} />
      case 'dublin-pharma':
        return <DublinPharmaTemplate cv={currentCV} isMobile={isMobile} />
      case 'irish-graduate':
        return <IrishGraduateTemplate cv={currentCV} isMobile={isMobile} />
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
      case 'dublin-creative':
      case 'irish-healthcare':
      case 'dublin-hospitality':
      case 'irish-construction':
      case 'dublin-startup':
      case 'irish-executive':
      case 'dublin-retail':
      case 'irish-education':
        return (
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold mb-4">Template Coming Soon</h3>
            <p className="text-gray-600">This template is under development</p>
          </div>
        )
      default:
        return <HarvardTemplate cv={currentCV} isMobile={isMobile} />
    }
  }

  // Get template display name
  const getTemplateName = () => {
    switch (currentCV.template) {
      case 'harvard': return 'Harvard Classic'
      case 'classic': return 'Classic'
      case 'dublin':
      case 'dublin-tech': return 'Dublin Tech Professional'
      case 'irish-finance': return 'Irish Finance Expert'
      case 'dublin-pharma': return 'Dublin Pharma Professional'
      case 'irish-graduate': return 'Irish Graduate CV'
      case 'dublin-creative': return 'Dublin Creative Industries'
      case 'irish-healthcare': return 'HSE Healthcare Professional'
      case 'dublin-hospitality': return 'Dublin Hospitality Pro'
      case 'irish-construction': return 'Irish Construction & Engineering'
      case 'dublin-startup': return 'Dublin Startup Specialist'
      case 'irish-executive': return 'Irish Executive Leader'
      case 'dublin-retail': return 'Dublin Retail Professional'
      case 'irish-education': return 'Irish Education Professional'
      case 'modern': return 'Modern (Coming Soon)'
      case 'creative': return 'Creative (Coming Soon)'
      default: return 'Harvard Classic'
    }
  }

  const previewContent = (
    <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header - Enhanced for Mobile */}
      <div className={`${isMobile ? 'mb-4' : 'mb-4'} flex items-center justify-between`}>
        <div className="flex-1">
          <h2 className={`${isMobile ? 'text-lg' : 'text-lg'} font-semibold text-gray-900`}>
            {isMobile ? 'CV Preview' : 'CV Preview'}
          </h2>
          {isMobile && (
            <p className="text-sm text-gray-500 mt-0.5">
              {getTemplateName()} • {zoom}%
            </p>
          )}
        </div>
        
        {/* Page Status */}
        <PageStatus 
          currentPage={currentPage} 
          totalPages={pageCount} 
          showWarning={!isMobile}
        />
        
        {!isMobile && (
          <div className="text-sm text-muted-foreground flex items-center gap-4 ml-4">
            <span>Template: {getTemplateName()}</span>
            <span>Zoom: {zoom}%</span>
          </div>
        )}
      </div>

      {/* Multi-page Warning Message */}
      {pageCount > 1 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Not: CV'niz {pageCount} sayfa içermektedir.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                İçerik uzunluğuna bağlı olarak bazı bölümler ikinci sayfaya geçebilir. 
                Lütfen PDF'nin tamamını kontrol ediniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Controls - Compact */}
      {isMobile && (
        <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 60}
                className="p-2 touch-manipulation bg-white border-gray-300 h-10 w-10 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                className="p-2 touch-manipulation bg-white border-gray-300 h-10 w-10 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFitWidth}
                className="p-2 touch-manipulation bg-white border-gray-300 h-10 w-10 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                title="Fit to Width"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm font-medium text-gray-600 px-3 py-1 bg-white rounded-lg border border-gray-200">
              {zoom}%
            </div>
            
            <Button 
              variant={shareStatus === 'success' || shareStatus === 'copied' ? "default" : "outline"}
              size="sm"
              onClick={handleShare}
              disabled={shareStatus === 'sharing'}
              className="px-3 py-2 touch-manipulation bg-white border-gray-300 h-10 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {shareStatus === 'sharing' ? (
                <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
              ) : shareStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : shareStatus === 'copied' ? (
                <Copy className="h-4 w-4 text-blue-600" />
              ) : (
                <Share className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* CV Preview Container - Mobile Optimized */}
      <div 
        ref={containerRef}
        className={`bg-gray-100 rounded-xl overflow-hidden ${
          isMobile ? 'min-h-[70vh] shadow-md border border-gray-200' : 'max-h-[80vh] shadow-lg'
        } overflow-auto`}
        style={{
          // Ensure container is scrollable for multi-page content
          position: 'relative',
          maxHeight: isMobile ? '70vh' : '80vh'
        }}
      >
        <div className="relative" style={{ padding: isMobile ? '1rem' : '2rem' }}>
          {/* Page indicator - Enhanced visibility */}
          <div className="sticky top-2 right-2 z-20 flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {pageCount > 1 && (
                <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
                  Page {currentPage} of {pageCount}
                </div>
              )}
              {pageCount > 2 && (
                <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  ⚠️ Long CV
                </div>
              )}
            </div>
          </div>
          
          {/* Multi-page container with proper A4 pages */}
          <div className="relative">
          
            {/* CV Content - Multi-page support */}
            {isMobile ? (
              <TouchGestureWrapper
                onPinch={handlePinch}
                onPan={handlePan}
                className="w-full"
              >
                <div 
                  id="cv-export-content"
                  ref={contentRef}
                  className="relative mx-auto"
                  style={{ 
                    width: '100%',
                    maxWidth: isMobile ? '90vw' : '600px', // Use more screen width on mobile
                    transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  {/* Render pages */}
                  {Array.from({ length: Math.max(1, pageCount) }, (_, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="bg-white shadow-lg mb-4 relative overflow-hidden"
                      style={{ 
                        aspectRatio: '210/297',
                        pageBreakAfter: 'always',
                        position: 'relative'
                      }}
                    >
                      {/* Page number indicator */}
                      {pageCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                          {pageIndex + 1}/{pageCount}
                        </div>
                      )}
                      
                      {/* Page break indicator for mobile */}
                      {pageIndex < pageCount - 1 && (
                        <PageBreakIndicator 
                          pageNumber={pageIndex + 1} 
                          className="absolute bottom-0 left-0 right-0 z-20"
                          variant="line"
                          isVisible={true}
                        />
                      )}
                      
                      {/* Render template content */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div 
                          style={{ 
                            position: 'absolute',
                            top: `-${pageIndex * 100}%`,
                            left: 0,
                            right: 0,
                            height: `${pageCount * 100}%`
                          }}
                        >
                          {renderTemplate()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TouchGestureWrapper>
            ) : (
              <div 
                id="cv-export-content"
                ref={contentRef}
                className="mx-auto transition-transform duration-200"
                style={{ 
                  width: '100%',
                  maxWidth: '900px', // Increased from 794px for better content display
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* Render A4 pages */}
                {Array.from({ length: Math.max(1, pageCount) }, (_, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="bg-white shadow-xl mb-8 relative overflow-hidden"
                    style={{ 
                      width: '100%',
                      maxWidth: '900px',
                      minHeight: '1123px', // A4 height ratio maintained
                      aspectRatio: '210/297',
                      pageBreakAfter: 'always',
                      position: 'relative'
                    }}
                  >
                    {/* Page number badge */}
                    {pageCount > 1 && (
                      <div className="absolute top-4 right-4 bg-gray-800/90 text-white text-sm px-3 py-1 rounded-lg z-10 font-medium">
                        Page {pageIndex + 1} of {pageCount}
                      </div>
                    )}
                    
                    {/* Page separator with break indicator */}
                    {pageIndex < pageCount - 1 && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50" />
                        <PageBreakIndicator 
                          pageNumber={pageIndex + 1} 
                          className="absolute bottom-0 left-0 right-0"
                          variant="both"
                        />
                      </>
                    )}
                    
                    {/* CV content clipped to page */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div 
                        style={{ 
                          position: 'absolute',
                          top: `-${pageIndex * 1123}px`,
                          left: 0,
                          right: 0
                        }}
                      >
                        {renderTemplate()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Controls Only */}
      {!isMobile && (
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
      )}
      
      {/* Floating page indicator for mobile */}
      {isMobile && pageCount > 1 && (
        <FloatingPageIndicator 
          currentPage={currentPage} 
          totalPages={pageCount}
          position="bottom-right"
        />
      )}
    </div>
  )

  return previewContent
}
"use client"

import { useCVStore } from "@/store/cv-store"
import { HarvardTemplate } from "@/components/cv/templates/harvard-template"
import { DublinTechTemplate } from "@/components/cv/templates/dublin-tech-template"
import { IrishFinanceTemplate } from "@/components/cv/templates/irish-finance-template"
import { DublinPharmaTemplate } from "@/components/cv/templates/dublin-pharma-template"
import { IrishGraduateTemplate } from "@/components/cv/templates/irish-graduate-template"
import { usePageDetection } from "@/hooks/use-page-detection"
import { useState, useRef, useCallback } from "react"
import { TouchGestureWrapper } from "@/components/mobile"
import { ZoomIn, ZoomOut, Maximize2, Share, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CVPreviewProps {
  isMobile?: boolean
}

export function CVPreview({ isMobile = false }: CVPreviewProps) {
  const { currentCV } = useCVStore()
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
      } catch (error) {
        if (error.name !== 'AbortError') {
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
    } catch (error) {
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
        <div>
          <h2 className={`${isMobile ? 'text-lg' : 'text-lg'} font-semibold text-gray-900`}>
            {isMobile ? 'CV Preview' : 'CV Preview'}
          </h2>
          {isMobile && (
            <p className="text-sm text-gray-500 mt-0.5">
              {getTemplateName()} • {zoom}%
            </p>
          )}
        </div>
        {!isMobile && (
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Template: {getTemplateName()}</span>
            <span>Zoom: {zoom}%</span>
          </div>
        )}
      </div>

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
        className={`bg-white rounded-xl overflow-hidden ${
          isMobile ? 'min-h-[70vh] shadow-md border border-gray-200' : 'max-h-[80vh] shadow-lg'
        } overflow-auto`}
      >
        <div className="relative">
          {/* Page indicator */}
          {!isMobile && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-10">
              Page {currentPage} of {pageCount}
            </div>
          )}
          
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
          {isMobile ? (
            <TouchGestureWrapper
              onPinch={handlePinch}
              onPan={handlePan}
              className="w-full h-full flex items-start justify-center py-4"
            >
              <div 
                ref={contentRef}
                className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 ease-out"
                style={{ 
                  width: '100%',
                  maxWidth: '350px', // Mobile optimized width
                  minHeight: 'auto',
                  transform: `scale(${zoom / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transformOrigin: 'top center'
                }}
              >
                <div className="w-full" style={{ aspectRatio: '210/297' }}>
                  {renderTemplate()}
                </div>
              </div>
            </TouchGestureWrapper>
          ) : (
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
          )}
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
    </div>
  )

  return previewContent
}
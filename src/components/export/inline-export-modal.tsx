'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useCVStore } from '@/store/cv-store'

interface InlineExportModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function InlineExportModal({ isOpen, onClose, onComplete }: InlineExportModalProps) {
  const { currentCV } = useCVStore()
  const [step, setStep] = useState<'ad' | 'processing' | 'complete' | 'error'>('ad')
  const [adProgress, setAdProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [adTimeLeft, setAdTimeLeft] = useState(15) // 15 saniye reklam
  
  // Reklam timer
  useEffect(() => {
    if (step === 'ad' && isOpen) {
      const timer = setInterval(() => {
        setAdTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setStep('processing')
            startProcessing()
            return 0
          }
          return prev - 1
        })
        setAdProgress(prev => Math.min(prev + (100 / 15), 100))
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [step, isOpen])
  
  const startProcessing = async () => {
    setProcessingProgress(0)
    
    try {
      // Simulated processing steps
      const steps = [
        { name: 'Preparing CV data...', duration: 800 },
        { name: 'Generating PDF layout...', duration: 1200 },
        { name: 'Applying formatting...', duration: 900 },
        { name: 'Optimizing for ATS...', duration: 600 },
        { name: 'Finalizing download...', duration: 500 }
      ]
      
      let totalProgress = 0
      const progressPerStep = 100 / steps.length
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.duration))
        totalProgress += progressPerStep
        setProcessingProgress(totalProgress)
      }
      
      // Generate and download PDF
      await generateAndDownloadPDF()
      setStep('complete')
      
      // Auto close after success
      setTimeout(() => {
        onComplete()
        handleClose()
      }, 2000)
      
    } catch (error) {
      console.error('Export error:', error)
      setStep('error')
    }
  }
  
  const generateAndDownloadPDF = async () => {
    if (!currentCV) throw new Error('No CV data available')
    
    let tempContainer: HTMLDivElement | null = null
    
    try {
      // Dynamic imports with fallback handling
      const [html2canvas, jsPDF, fileSaver] = await Promise.all([
        import('html2canvas').catch(() => null),
        import('jspdf').catch(() => null),
        import('file-saver').catch(() => null)
      ])
      
      if (!html2canvas || !jsPDF || !fileSaver) {
        throw new Error('Required libraries failed to load. Please check your internet connection and try again.')
      }
      
      // Find the live preview CV element - robust selector with retries
      let previewElement: Element | null = null
      let attempts = 0
      const maxAttempts = 3
      
      while (!previewElement && attempts < maxAttempts) {
        previewElement = document.querySelector('.cv-container.classic') || 
                        document.querySelector('.cv-container') ||
                        document.querySelector('[data-testid="cv-preview"] .cv-container') ||
                        document.querySelector('.live-preview .cv-container') ||
                        document.querySelector('[class*="cv-container"]') ||
                        document.querySelector('[class*="classic"]')
        
        if (!previewElement) {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms between attempts
        }
      }
      
      if (!previewElement) {
        throw new Error('CV preview element not found. Please ensure CV is visible in live preview and try again.')
      }
    
      const element = previewElement as HTMLElement
      const fileName = `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`
      
      // Detect device type for optimal settings
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const devicePixelRatio = window.devicePixelRatio || 1
      const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4
      
      // Create a clone of the element for PDF generation
      const clone = element.cloneNode(true) as HTMLElement
      
      // Create a temporary container for optimization
      tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.top = '-10000px'
      tempContainer.style.left = '-10000px'
      tempContainer.style.width = '794px' // A4 width in pixels at 96 DPI
      tempContainer.style.height = 'auto'
      tempContainer.style.background = 'white'
      tempContainer.style.padding = '40px'
      tempContainer.style.boxSizing = 'border-box'
      tempContainer.style.fontFamily = 'Arial, Helvetica, sans-serif'
      
      // Apply styles to clone for perfect PDF rendering
      clone.style.width = '714px' // 794 - 80 (padding)
      clone.style.minHeight = 'auto'
      clone.style.background = 'white'
      clone.style.color = 'black'
      clone.style.fontFamily = 'Arial, Helvetica, sans-serif'
      clone.style.fontSize = '11pt'
      clone.style.lineHeight = '1.3'
      clone.style.padding = '1rem'
      clone.style.paddingTop = '0.5rem'
      clone.style.paddingBottom = '0.5rem'
      clone.style.margin = '0'
      clone.style.transform = 'none'
      clone.style.position = 'static'
      
      // Fix all text elements for PDF
      const textElements = clone.querySelectorAll('*')
      textElements.forEach(el => {
        const element = el as HTMLElement
        if (element.style) {
          element.style.fontFamily = 'Arial, Helvetica, sans-serif'
          element.style.color = 'black'
          // CSS color-adjust properties for PDF rendering
          ;(element.style as any).webkitPrintColorAdjust = 'exact'
          ;(element.style as any).printColorAdjust = 'exact'
          ;(element.style as any).colorAdjust = 'exact'
        }
      })
      
      tempContainer.appendChild(clone)
      document.body.appendChild(tempContainer)
      
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => {
          // Ignore font loading errors
        })
      }
      
      // Optimal canvas settings based on device
      const canvasOptions = {
        scale: isMobile ? Math.min(devicePixelRatio * 1.5, 2.5) : 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 714,
        height: clone.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: clone.scrollHeight + 80,
        logging: false,
        imageTimeout: isMobile ? 20000 : 10000,
        onclone: (clonedDoc: Document) => {
          // Ensure fonts are loaded in cloned document
          const clonedElement = clonedDoc.querySelector('.cv-container') as HTMLElement
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, Helvetica, sans-serif'
            clonedElement.style.color = 'black'
            clonedElement.style.background = 'white'
            clonedElement.style.margin = '0'
            clonedElement.style.padding = '1rem'
          }
        }
      }
      
      // Generate canvas with error handling
      let canvas: HTMLCanvasElement
      try {
        canvas = await html2canvas.default(clone, canvasOptions)
      } catch (canvasError) {
        console.error('Canvas generation failed:', canvasError)
        // Retry with reduced quality for mobile devices
        if (isMobile || isLowMemory) {
          canvasOptions.scale = Math.min(canvasOptions.scale * 0.7, 1.5)
          canvasOptions.imageTimeout = 30000
          canvas = await html2canvas.default(clone, canvasOptions)
        } else {
          throw new Error('Failed to generate PDF canvas. Please try again with a simpler layout.')
        }
      }
      
      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas is invalid. Please ensure the CV content is visible and try again.')
      }
      
      // Calculate optimal PDF dimensions (A4: 210 x 297 mm)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Create PDF with error handling
      let pdf: InstanceType<typeof jsPDF.jsPDF>
      try {
        pdf = new jsPDF.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: !isMobile // Disable compression on mobile for faster processing
        })
      } catch (pdfError) {
        console.error('PDF creation failed:', pdfError)
        throw new Error('Failed to create PDF document. Please try again.')
      }
      
      // Generate high-quality image data
      const imageQuality = isMobile || isLowMemory ? 0.8 : 0.95
      const imageFormat = isMobile ? 'JPEG' : 'PNG'
      const imageData = canvas.toDataURL(`image/${imageFormat.toLowerCase()}`, imageQuality)
      
      if (!imageData || imageData === 'data:,') {
        throw new Error('Failed to generate image data from CV. Please try again.')
      }
      
      try {
        // Check if content fits on one page
        if (imgHeight <= pageHeight) {
          // Single page - center the content
          const topMargin = Math.max(0, (pageHeight - imgHeight) / 4) // Quarter margin at top
          pdf.addImage(imageData, imageFormat, 0, topMargin, imgWidth, imgHeight)
        } else {
          // Multi-page handling
          let remainingHeight = imgHeight
          let currentPage = 0
          
          while (remainingHeight > 0) {
            if (currentPage > 0) {
              pdf.addPage()
            }
            
            const startY = currentPage * pageHeight
            const sourceHeight = Math.min(pageHeight, remainingHeight)
            
            try {
              // Create a cropped canvas for this page
              const pageCanvas = document.createElement('canvas')
              const pageCtx = pageCanvas.getContext('2d')
              
              if (!pageCtx) {
                throw new Error('Failed to get canvas context for page')
              }
              
              pageCanvas.width = canvas.width
              pageCanvas.height = (sourceHeight * canvas.width) / imgWidth
              
              pageCtx.drawImage(
                canvas,
                0, (startY * canvas.width) / imgWidth, // Source position
                canvas.width, pageCanvas.height, // Source dimensions
                0, 0, // Destination position
                pageCanvas.width, pageCanvas.height // Destination dimensions
              )
              
              const pageImageData = pageCanvas.toDataURL(`image/${imageFormat.toLowerCase()}`, imageQuality)
              pdf.addImage(pageImageData, imageFormat, 0, 0, imgWidth, sourceHeight)
            } catch (pageError) {
              console.error('Page generation failed:', pageError)
              // Continue with remaining pages
            }
            
            remainingHeight -= sourceHeight
            currentPage++
          }
        }
        
        // Generate and download the PDF
        const pdfBlob = pdf.output('blob')
        if (!pdfBlob || pdfBlob.size === 0) {
          throw new Error('Generated PDF is empty or corrupted.')
        }
        
        fileSaver.saveAs(pdfBlob, fileName)
        
      } catch (pdfGenerationError) {
        console.error('PDF generation process failed:', pdfGenerationError)
        throw new Error('Failed to generate PDF pages. Please try reducing the content size.')
      }
      
    } catch (error) {
      console.error('PDF export failed:', error)
      
      // Enhanced error messages based on error type
      let errorMessage = 'Failed to generate PDF. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('libraries failed to load')) {
          errorMessage = 'Required libraries failed to load. Please check your internet connection and try again.'
        } else if (error.message.includes('not found')) {
          errorMessage = 'CV content not found. Please refresh the page and try again.'
        } else if (error.message.includes('canvas')) {
          errorMessage = 'Failed to capture CV content. Please try refreshing the page.'
        } else if (error.message.includes('memory') || error.message.includes('timeout')) {
          errorMessage = 'PDF generation timed out. Please try again or use a device with more memory.'
        } else {
          errorMessage = error.message
        }
      }
      
      throw new Error(errorMessage)
    } finally {
      // Clean up
      try {
        if (tempContainer && tempContainer.parentNode) {
          document.body.removeChild(tempContainer)
        }
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError)
      }
    }
  }
  
  const handleClose = () => {
    setStep('ad')
    setAdProgress(0)
    setProcessingProgress(0)
    setAdTimeLeft(15)
    onClose()
  }
  
  const skipAd = () => {
    if (adTimeLeft <= 5) { // Son 5 saniyede skip edilebilir
      setStep('processing')
      startProcessing()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Export Your CV
          </DialogTitle>
          <DialogDescription>
            {step === 'ad' && 'Please wait while we prepare your download...'}
            {step === 'processing' && 'Generating your professional CV...'}
            {step === 'complete' && 'Your CV has been generated successfully!'}
            {step === 'error' && 'There was an error generating your CV.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Reklam Aşaması */}
          {step === 'ad' && (
            <div className="space-y-4">
              {/* Reklam Alanı */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg p-8 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    🎯 Premium CV Templates Available!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unlock 20+ professional templates designed specifically for the Irish job market.
                    Stand out from the competition with industry-specific designs.
                  </p>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-2">✨ What you get:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• ATS-optimized layouts</li>
                      <li>• Industry-specific templates</li>
                      <li>• Professional color schemes</li>
                      <li>• Instant download access</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Countdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Preparing your download...</span>
                  <span className="text-blue-600 font-medium">{adTimeLeft}s</span>
                </div>
                <Progress value={adProgress} className="h-2" />
              </div>
              
              {/* Skip butonu (son 5 saniyede) */}
              {adTimeLeft <= 5 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={skipAd}
                  className="w-full"
                >
                  Skip & Download Now
                </Button>
              )}
            </div>
          )}
          
          {/* Processing Aşaması */}
          {step === 'processing' && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Creating Your Professional CV
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we generate your perfectly formatted CV...
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing...</span>
                  <span className="text-blue-600 font-medium">{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            </div>
          )}
          
          {/* Complete Aşaması */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  CV Generated Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your CV has been generated and the download should start automatically.
                </p>
              </div>
            </div>
          )}
          
          {/* Error Aşaması */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Export Failed
                </h3>
                <p className="text-sm text-gray-600">
                  There was an error generating your CV. Please try again.
                </p>
              </div>
              <Button onClick={() => setStep('ad')} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        {/* Close button */}
        {step !== 'processing' && (
          <div className="flex justify-center pt-4">
            <Button variant="ghost" onClick={handleClose} size="sm">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
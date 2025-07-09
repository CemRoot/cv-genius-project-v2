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
  const [debugMode] = useState(typeof window !== 'undefined' && window.location.href.includes('debug=true'))
  
  // Comprehensive diagnostic function for PDF export failures
  const runDiagnostics = () => {
    console.log('🔧 [PDF Export] Running comprehensive diagnostics...')
    
    // Check CV data
    console.log('📊 [PDF Export] CV Data Check:', {
      currentCVExists: !!currentCV,
      personalData: !!currentCV?.personal,
      fullName: currentCV?.personal?.fullName,
      hasExperience: currentCV?.experience?.length || 0,
      hasEducation: currentCV?.education?.length || 0,
      hasSkills: currentCV?.skills?.length || 0
    })
    
    // Check DOM elements
    console.log('🔍 [PDF Export] DOM Elements Check:')
    const allContainers = document.querySelectorAll('[class*="container"], [id*="cv"], [data-testid*="cv"]')
    console.log('  - Total potential CV elements:', allContainers.length)
    allContainers.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      console.log(`  - Element ${index}:`, {
        tagName: el.tagName,
        className: el.className,
        id: (el as HTMLElement).id,
        visible: rect.width > 0 && rect.height > 0,
        dimensions: `${rect.width}x${rect.height}`,
        position: `${rect.left},${rect.top}`
      })
    })
    
    // Check window state
    console.log('🌐 [PDF Export] Window State:', {
      userAgent: navigator.userAgent,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      onlineStatus: navigator.onLine
    })
    
    // Check available libraries
    console.log('📦 [PDF Export] Library Availability Check:')
    const checkLibrary = async (name: string, importFunc: () => Promise<any>) => {
      try {
        await importFunc()
        console.log(`  - ${name}: ✅ Available`)
        return true
      } catch (error) {
        console.log(`  - ${name}: ❌ Failed to load -`, error)
        return false
      }
    }
    
    Promise.all([
      checkLibrary('html2canvas', () => import('html2canvas')),
      checkLibrary('jsPDF', () => import('jspdf')),
      checkLibrary('file-saver', () => import('file-saver'))
    ]).then(results => {
      console.log('📦 [PDF Export] Library Check Complete:', {
        html2canvas: results[0],
        jsPDF: results[1],
        fileSaver: results[2],
        allAvailable: results.every(r => r)
      })
    })
  }
  
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
      // Update progress during PDF generation
      setProcessingProgress(10)
      
      // Generate and download PDF with progress updates
      await generateAndDownloadPDF()
      
      setProcessingProgress(100)
      setStep('complete')
      
      // Auto close after success
      setTimeout(() => {
        onComplete()
        handleClose()
      }, 2000)
      
    } catch (error) {
      console.error('Export error:', error)
      
      // Run diagnostics on error
      if (debugMode) {
        runDiagnostics()
      }
      
      setStep('error')
    }
  }
  
  const generateAndDownloadPDF = async () => {
    console.log('🚀 [PDF Export] Starting PDF generation...')
    
    if (!currentCV) {
      console.error('❌ [PDF Export] No CV data available')
      throw new Error('No CV data available')
    }
    
    console.log('📊 [PDF Export] CV data found:', currentCV.personal?.fullName)
    
    let tempContainer: HTMLDivElement | null = null
    
    try {
      console.log('📦 [PDF Export] Loading libraries...')
      setProcessingProgress(20)
      
      // Dynamic imports with fallback handling
      const [html2canvas, jsPDF, fileSaver] = await Promise.all([
        import('html2canvas').catch((err) => {
          console.error('❌ [PDF Export] html2canvas failed to load:', err)
          return null
        }),
        import('jspdf').catch((err) => {
          console.error('❌ [PDF Export] jsPDF failed to load:', err)
          return null
        }),
        import('file-saver').then(module => module.saveAs).catch((err) => {
          console.error('❌ [PDF Export] file-saver failed to load:', err)
          return null
        })
      ])
      
      if (!html2canvas || !jsPDF || !fileSaver) {
        console.error('❌ [PDF Export] Libraries failed to load', {
          html2canvas: !!html2canvas,
          jsPDF: !!jsPDF,
          fileSaver: !!fileSaver
        })
        throw new Error('Required libraries failed to load. Please check your internet connection and try again.')
      }
      
      console.log('✅ [PDF Export] Libraries loaded successfully')
      
      console.log('🔍 [PDF Export] Finding CV element...')
      setProcessingProgress(30)
      
      // Debug: Check what's available in the DOM
      console.log('🔍 [PDF Export] DOM Debug - Available elements:')
      const debugSelectors = [
        '.cv-container.classic',
        '.cv-container',
        '#cv-export-content',
        '#cv-export-content .cv-container',
        '[data-testid="cv-preview"]',
        '[data-testid="cv-preview"] .cv-container',
        '.live-preview .cv-container',
        '.cv-preview-container',
        '.cv-preview-container .cv-container',
        '[class*="cv-container"]',
        '[class*="classic"]'
      ]
      
      debugSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        console.log(`  - ${selector}:`, elements.length)
        if (elements.length > 0) {
          elements.forEach((el, index) => {
            console.log(`    [${index}] className:`, el.className)
            console.log(`    [${index}] id:`, (el as HTMLElement).id)
            console.log(`    [${index}] visible:`, el.getBoundingClientRect().width > 0)
          })
        }
      })
      
      // Find the live preview CV element - robust selector with retries
      let previewElement: Element | null = null
      let attempts = 0
      const maxAttempts = 3
      
      while (!previewElement && attempts < maxAttempts) {
        console.log(`🔍 [PDF Export] Attempt ${attempts + 1}/${maxAttempts} to find CV element...`)
        
        // Updated selector order based on actual component structure
        previewElement = document.querySelector('#cv-export-content .cv-container.classic') || 
                        document.querySelector('#cv-export-content .cv-container') ||
                        document.querySelector('.cv-container.classic') || 
                        document.querySelector('.cv-container') ||
                        document.querySelector('[data-testid="cv-preview"] .cv-container') ||
                        document.querySelector('.cv-preview-container .cv-container') ||
                        document.querySelector('.live-preview .cv-container') ||
                        document.querySelector('[class*="cv-container"]') ||
                        document.querySelector('[class*="classic"]')
        
        if (previewElement) {
          console.log('✅ [PDF Export] CV element found with selector')
          console.log('✅ [PDF Export] Element details:', {
            className: previewElement.className,
            id: (previewElement as HTMLElement).id,
            tagName: previewElement.tagName,
            width: previewElement.getBoundingClientRect().width,
            height: previewElement.getBoundingClientRect().height,
            visible: previewElement.getBoundingClientRect().width > 0
          })
          break
        }
        
        attempts++
        if (attempts < maxAttempts) {
          console.log('⏳ [PDF Export] CV element not found, retrying...')
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms between attempts
        }
      }
      
      if (!previewElement) {
        console.error('❌ [PDF Export] CV element not found after all attempts')
        
        // Debug: log all available elements
        const allContainers = document.querySelectorAll('[class*="container"]')
        console.log('🔍 [PDF Export] Available containers:', Array.from(allContainers).map(el => el.className))
        
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
      
      console.log('🎨 [PDF Export] Starting canvas generation...')
      setProcessingProgress(50)
      
      // Generate canvas with error handling
      let canvas: HTMLCanvasElement
      try {
        console.log('🎨 [PDF Export] Canvas options:', {
          scale: canvasOptions.scale,
          width: canvasOptions.width,
          height: canvasOptions.height,
          backgroundColor: canvasOptions.backgroundColor,
          useCORS: canvasOptions.useCORS,
          allowTaint: canvasOptions.allowTaint
        })
        
        canvas = await html2canvas.default(clone, canvasOptions)
        console.log('✅ [PDF Export] Canvas generated successfully:', {
          width: canvas.width,
          height: canvas.height,
          dataSize: canvas.toDataURL().length
        })
      } catch (canvasError) {
        console.error('❌ [PDF Export] Canvas generation failed:', canvasError)
        console.error('❌ [PDF Export] Canvas error details:', {
          name: canvasError instanceof Error ? canvasError.name : 'Unknown',
          message: canvasError instanceof Error ? canvasError.message : String(canvasError),
          stack: canvasError instanceof Error ? canvasError.stack : undefined
        })
        
        // Retry with reduced quality for mobile devices
        if (isMobile || isLowMemory) {
          console.log('🔄 [PDF Export] Retrying with reduced quality...')
          canvasOptions.scale = Math.min(canvasOptions.scale * 0.7, 1.5)
          canvasOptions.imageTimeout = 30000
          
          try {
            canvas = await html2canvas.default(clone, canvasOptions)
            console.log('✅ [PDF Export] Canvas retry successful')
          } catch (retryError) {
            console.error('❌ [PDF Export] Canvas retry also failed:', retryError)
            throw new Error('Failed to generate PDF canvas even with reduced quality. Please try refreshing the page.')
          }
        } else {
          throw new Error('Failed to generate PDF canvas. Please try again with a simpler layout.')
        }
      }
      
      // Validate canvas
      console.log('✅ [PDF Export] Validating canvas...')
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.error('❌ [PDF Export] Canvas validation failed:', {
          canvasExists: !!canvas,
          width: canvas?.width || 0,
          height: canvas?.height || 0
        })
        throw new Error('Generated canvas is invalid. Please ensure the CV content is visible and try again.')
      }
      
      console.log('✅ [PDF Export] Canvas validated successfully')
      setProcessingProgress(60)
      
      // Calculate optimal PDF dimensions (A4: 210 x 297 mm)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      console.log('📐 [PDF Export] PDF dimensions calculated:', {
        imgWidth,
        imgHeight,
        pageHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        willFitOnOnePage: imgHeight <= pageHeight
      })
      
      // Create PDF with error handling
      console.log('📄 [PDF Export] Creating PDF document...')
      let pdf: InstanceType<typeof jsPDF.jsPDF>
      try {
        pdf = new jsPDF.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: !isMobile // Disable compression on mobile for faster processing
        })
        console.log('✅ [PDF Export] PDF document created successfully')
        setProcessingProgress(70)
      } catch (pdfError) {
        console.error('❌ [PDF Export] PDF creation failed:', pdfError)
        console.error('❌ [PDF Export] PDF error details:', {
          name: pdfError instanceof Error ? pdfError.name : 'Unknown',
          message: pdfError instanceof Error ? pdfError.message : String(pdfError)
        })
        throw new Error('Failed to create PDF document. Please try again.')
      }
      
      // Generate high-quality image data
      console.log('🖼️ [PDF Export] Generating image data...')
      const imageQuality = isMobile || isLowMemory ? 0.8 : 0.95
      const imageFormat = isMobile ? 'JPEG' : 'PNG'
      
      console.log('🖼️ [PDF Export] Image settings:', {
        quality: imageQuality,
        format: imageFormat,
        isMobile,
        isLowMemory
      })
      
      let imageData: string
      try {
        imageData = canvas.toDataURL(`image/${imageFormat.toLowerCase()}`, imageQuality)
        console.log('✅ [PDF Export] Image data generated:', {
          length: imageData.length,
          hasData: imageData.startsWith('data:'),
          format: imageData.split(',')[0]
        })
      } catch (imageError) {
        console.error('❌ [PDF Export] Image data generation failed:', imageError)
        throw new Error('Failed to convert canvas to image. Please try again.')
      }
      
      if (!imageData || imageData === 'data:,') {
        console.error('❌ [PDF Export] Invalid image data generated')
        throw new Error('Failed to generate image data from CV. Please try again.')
      }
      
      setProcessingProgress(80)
      
      console.log('📝 [PDF Export] Adding content to PDF...')
      try {
        // Check if content fits on one page
        if (imgHeight <= pageHeight) {
          console.log('📄 [PDF Export] Single page layout')
          // Single page - center the content
          const topMargin = Math.max(0, (pageHeight - imgHeight) / 4) // Quarter margin at top
          console.log('📄 [PDF Export] Adding image to PDF:', {
            format: imageFormat,
            x: 0,
            y: topMargin,
            width: imgWidth,
            height: imgHeight
          })
          pdf.addImage(imageData, imageFormat, 0, topMargin, imgWidth, imgHeight)
          console.log('✅ [PDF Export] Single page content added successfully')
        } else {
          console.log('📄 [PDF Export] Multi-page layout required')
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
        console.log('💾 [PDF Export] Generating final PDF blob...')
        setProcessingProgress(90)
        
        const pdfBlob = pdf.output('blob')
        console.log('💾 [PDF Export] PDF blob generated:', {
          size: pdfBlob.size,
          type: pdfBlob.type,
          isValid: pdfBlob.size > 0
        })
        
        if (!pdfBlob || pdfBlob.size === 0) {
          console.error('❌ [PDF Export] Generated PDF is empty')
          throw new Error('Generated PDF is empty or corrupted.')
        }
        
        console.log('⬇️ [PDF Export] Starting file download:', fileName)
        
        // Use file-saver properly - fileSaver is now the saveAs function directly
        if (fileSaver && typeof fileSaver === 'function') {
          fileSaver(pdfBlob, fileName)
        } else {
          // Manual download fallback
          const url = window.URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
        
        console.log('✅ [PDF Export] Download initiated successfully')
        
      } catch (pdfGenerationError) {
        console.error('❌ [PDF Export] PDF generation process failed:', pdfGenerationError)
        console.error('❌ [PDF Export] PDF generation error details:', {
          name: pdfGenerationError instanceof Error ? pdfGenerationError.name : 'Unknown',
          message: pdfGenerationError instanceof Error ? pdfGenerationError.message : String(pdfGenerationError),
          stack: pdfGenerationError instanceof Error ? pdfGenerationError.stack : undefined
        })
        throw new Error('Failed to generate PDF pages. Please try reducing the content size.')
      }
      
    } catch (error) {
      console.error('❌ [PDF Export] Complete export process failed:', error)
      console.error('❌ [PDF Export] Final error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        currentCV: !!currentCV,
        currentCVName: currentCV?.personal?.fullName
      })
      
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
      
      console.error('❌ [PDF Export] Throwing final error:', errorMessage)
      throw new Error(errorMessage)
    } finally {
      // Clean up
      console.log('🧹 [PDF Export] Starting cleanup...')
      try {
        if (tempContainer && tempContainer.parentNode) {
          document.body.removeChild(tempContainer)
          console.log('🧹 [PDF Export] Temporary container removed')
        }
      } catch (cleanupError) {
        console.warn('⚠️ [PDF Export] Cleanup failed:', cleanupError)
      }
      console.log('🧹 [PDF Export] Cleanup completed')
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
                {debugMode && (
                  <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                    <p className="font-semibold mb-2">Debug Mode Active</p>
                    <p>Check browser console for detailed error logs.</p>
                    <p className="mt-1">URL: Add ?debug=true to enable enhanced logging</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button onClick={() => setStep('ad')} className="w-full">
                  Try Again
                </Button>
                {debugMode && (
                  <Button 
                    onClick={runDiagnostics} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Run Diagnostics
                  </Button>
                )}
              </div>
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
"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Smartphone, Monitor } from 'lucide-react'
import { exportCVToPDF, validateCVForPDF } from '@/lib/pdf-export-service'
import { useCVStore } from '@/store/cv-store'

interface MobilePDFExportProps {
  elementId?: string // Optional now since we use CV store
  filename?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function MobilePDFExport({ 
  elementId, 
  filename = 'document.pdf', 
  onSuccess, 
  onError 
}: MobilePDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { currentCV } = useCVStore()
  
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }
  
  const waitForFonts = () => {
    return new Promise<void>((resolve) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resolve())
      } else {
        setTimeout(resolve, 1000) // Fallback timeout
      }
    })
  }
  
  const prepareMobileElement = (element: HTMLElement) => {
    // Store original styles for restoration
    const originalStyles = {
      transform: element.style.transform,
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      margin: element.style.margin,
      padding: element.style.padding
    }
    
    // Apply mobile-optimized styles
    element.style.transform = 'none'
    element.style.width = '794px' // A4 width in pixels at 96 DPI
    element.style.maxWidth = '794px'
    element.style.position = 'static'
    element.style.left = '0'
    element.style.top = '0'
    element.style.margin = '0 auto'
    element.style.padding = '40px'
    
    return originalStyles
  }
  
  const restoreElementStyles = (element: HTMLElement, originalStyles: any) => {
    Object.keys(originalStyles).forEach(key => {
      element.style[key as any] = originalStyles[key] || ''
    })
  }
  
  const hideExportElements = (element: HTMLElement) => {
    const hiddenElements = element.querySelectorAll('.no-export, .print\\:hidden')
    const originalDisplays: string[] = []
    
    hiddenElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      originalDisplays[index] = htmlEl.style.display || ''
      htmlEl.style.display = 'none'
    })
    
    return { hiddenElements, originalDisplays }
  }
  
  const restoreExportElements = (hiddenElements: NodeListOf<Element>, originalDisplays: string[]) => {
    hiddenElements.forEach((el, index) => {
      (el as HTMLElement).style.display = originalDisplays[index]
    })
  }
  
  const exportToPDF = useCallback(async () => {
    setIsExporting(true)
    
    try {
      if (!currentCV) {
        throw new Error('No CV data available for export')
      }
      
      console.log('📱 Starting mobile PDF export with React-PDF...')
      
      // Validate CV data before export
      const validation = validateCVForPDF(currentCV)
      if (!validation.isValid) {
        console.warn('⚠️ CV validation warnings:', validation.errors)
        // Continue with generation but log warnings
      }
      
      // Generate PDF using React-PDF renderer for perfect consistency
      await exportCVToPDF(currentCV, {
        filename: filename,
        quality: 'high',
        enableOptimization: true
      })
      
      console.log('✅ Mobile PDF export completed successfully')
      onSuccess?.()
      
    } catch (error) {
      console.error('❌ Mobile PDF export failed:', error)
      onError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }, [currentCV, filename, onSuccess, onError])
  
  const isMobile = detectMobile()
  
  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
          Export PDF
        </>
      )}
    </Button>
  )
}

// Enhanced hook for more control
export const useMobilePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }
  
  const exportToPDF = useCallback(async (
    elementId: string, 
    filename = 'document.pdf',
    options: {
      quality?: number
      scale?: number
      width?: number
      timeout?: number
    } = {}
  ) => {
    setIsExporting(true)
    setExportError(null)
    
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error(`Element with ID '${elementId}' not found`)
      
      const isMobile = detectMobile()
      const {
        quality = 0.95,
        scale = isMobile ? Math.min(window.devicePixelRatio * 1.5, 3) : 2,
        width = isMobile ? 794 : element.scrollWidth,
        timeout = isMobile ? 20000 : 15000
      } = options
      
      // Wait for fonts and images to load
      await new Promise(resolve => {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(resolve)
        } else {
          setTimeout(resolve, 1000)
        }
      })
      
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width,
        height: element.scrollHeight,
        letterRendering: true,
        imageTimeout: timeout,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement && isMobile) {
            // Apply mobile-specific fixes
            clonedElement.style.width = `${width}px`
            clonedElement.style.maxWidth = `${width}px`
            clonedElement.style.transform = 'none'
            clonedElement.style.position = 'static'
            clonedElement.style.boxSizing = 'border-box'
          }
        }
      })
      
      const imgData = canvas.toDataURL('image/jpeg', quality)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Smart scaling and centering
      const imgAspectRatio = canvas.height / canvas.width
      let imgWidth = pdfWidth
      let imgHeight = pdfWidth * imgAspectRatio
      let x = 0
      let y = 0
      
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight
        imgWidth = pdfHeight / imgAspectRatio
        x = (pdfWidth - imgWidth) / 2
      } else {
        y = (pdfHeight - imgHeight) / 2
      }
      
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
      pdf.save(filename)
      
      return { success: true, canvas, pdf }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setExportError(errorMessage)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])
  
  return {
    exportToPDF,
    isExporting,
    exportError,
    isMobile: detectMobile()
  }
}
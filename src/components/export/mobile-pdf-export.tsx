"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Smartphone, Monitor } from 'lucide-react'
import { exportCVToPDF, validateCVForPDF } from '@/lib/pdf-export-service'
import { useCVStore } from '@/store/cv-store'

interface MobilePDFExportProps {
  filename?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function MobilePDFExport({ 
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
      disabled={isExporting || !currentCV}
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
  const { currentCV } = useCVStore()

  const exportToPDF = useCallback(async (filename = 'document.pdf') => {
    setIsExporting(true)
    setExportError(null)
    
    try {
      if (!currentCV) {
        throw new Error('No CV data available for export')
      }
      
      // Validate CV data before export
      const validation = validateCVForPDF(currentCV)
      if (!validation.isValid) {
        console.warn('⚠️ CV validation warnings:', validation.errors)
      }
      
      // Generate PDF using React-PDF renderer
      await exportCVToPDF(currentCV, {
        filename: filename,
        quality: 'high',
        enableOptimization: true
      })
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      setExportError(errorMessage)
      console.error('❌ Mobile PDF export failed:', error)
      return false
    } finally {
      setIsExporting(false)
    }
  }, [currentCV])

  const reset = useCallback(() => {
    setExportError(null)
    setIsExporting(false)
  }, [])

  return {
    exportToPDF,
    isExporting,
    exportError,
    reset,
    canExport: !!currentCV
  }
}
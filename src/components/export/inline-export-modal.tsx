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
      setStep('error')
    }
  }
  
  const generateAndDownloadPDF = async () => {
    console.log('🚀 [PDF Export] Starting React-PDF generation...')
    
    if (!currentCV) {
      console.error('❌ [PDF Export] No CV data available')
      throw new Error('No CV data available')
    }
    
    console.log('📊 [PDF Export] CV data found:', currentCV.personal?.fullName)
    
    try {
      console.log('📦 [PDF Export] Using React-PDF renderer for consistency...')
      setProcessingProgress(20)
      
      // Import React-PDF export service
      const { exportCVToPDF, validateCVForPDF } = await import('@/lib/pdf-export-service')
      
      console.log('✅ [PDF Export] React-PDF service loaded successfully')
      
      setProcessingProgress(50)
      
      // Validate CV data before export
      console.log('📊 [PDF Export] Validating CV data...')
      const validation = await validateCVForPDF(currentCV)
      if (!validation.isValid) {
        console.warn('⚠️ [PDF Export] CV validation warnings:', validation.errors)
        // Continue with generation but log warnings
      }
      
      setProcessingProgress(70)
      
      console.log('🖨️ [PDF Export] Generating PDF with React-PDF renderer...')
      
      // Get template ID for consistent rendering
      const templateId = currentCV.template || 'classic'
      console.log('🎯 [InlineExportModal] Using template:', templateId)
      
      // Use React-PDF export service for consistent rendering
      const fileName = (currentCV.personal.fullName || 'CV').replace(/\s+/g, '_')
      console.log('📄 [InlineExportModal] Filename:', `${fileName}_CV.pdf`)
      
      await exportCVToPDF(currentCV, {
        filename: `${fileName}_CV.pdf`,
        quality: 'high',
        enableOptimization: true,
        templateId: templateId  // Explicit template ID
      })
      
      setProcessingProgress(100)
      console.log('✅ [PDF Export] PDF generated and downloaded successfully')
      
    } catch (error) {
      console.error('❌ [PDF Export] Complete export process failed:', error)
      console.error('❌ [PDF Export] Error type:', typeof error)
      console.error('❌ [PDF Export] Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      // Enhanced error messages based on error type
      let errorMessage = 'Failed to generate PDF. Please try again.'
      
      if (error instanceof Error) {
        console.error('❌ [PDF Export] Error message:', error.message)
        
        if (error.message.includes('libraries failed to load')) {
          errorMessage = 'Required libraries failed to load. Please check your internet connection and try again.'
        } else if (error.message.includes('not found')) {
          errorMessage = 'CV content not found. Please refresh the page and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'PDF generation timed out. Please try again.'
        } else if (error.message.includes('Cannot read properties')) {
          errorMessage = 'CV data is incomplete. Please check all required fields are filled.'
        } else if (error.message.includes('template')) {
          errorMessage = 'Template rendering failed. Please try a different template.'
        } else {
          errorMessage = `Export failed: ${error.message}`
        }
      }
      
      console.error('❌ [PDF Export] Throwing final error:', errorMessage)
      throw new Error(errorMessage)
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
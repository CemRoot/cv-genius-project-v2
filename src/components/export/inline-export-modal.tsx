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
    
    // Find the hidden CV preview element for PDF generation
    const previewElement = document.querySelector('.cv-container.classic') || 
                          document.querySelector('.cv-container') ||
                          document.querySelector('[data-cv-preview] .cv-container')
    
    if (!previewElement) {
      throw new Error('CV preview element not found')
    }
    
    // Create a new window with CV content for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window')
    }
    
    const cvHtml = (previewElement as HTMLElement).outerHTML
    const fileName = `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${fileName}</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 0.5in;
              }
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              .cv-container { max-width: 100%; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; }
          </style>
        </head>
        <body>
          ${cvHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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
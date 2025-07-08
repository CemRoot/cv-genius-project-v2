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
    
    // Find the live preview CV element - multiple selectors for robustness
    const previewElement = document.querySelector('.cv-container.classic') || 
                          document.querySelector('.cv-container') ||
                          document.querySelector('[data-testid="cv-preview"] .cv-container') ||
                          document.querySelector('.live-preview .cv-container') ||
                          document.querySelector('[class*="cv-container"]') ||
                          document.querySelector('[class*="classic"]')
    
    if (!previewElement) {
      throw new Error('CV preview element not found. Please ensure CV is visible in live preview.')
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fileName}</title>
          <style>
            @media print {
              /* Page setup with proper A4 dimensions */
              @page {
                size: A4 portrait;
                margin: 0.5in !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                
                /* Remove all headers and footers */
                @top-left-corner { content: "" !important; display: none !important; }
                @top-left { content: "" !important; display: none !important; }
                @top-center { content: "" !important; display: none !important; }
                @top-right { content: "" !important; display: none !important; }
                @top-right-corner { content: "" !important; display: none !important; }
                
                @left-top { content: "" !important; display: none !important; }
                @left-middle { content: "" !important; display: none !important; }
                @left-bottom { content: "" !important; display: none !important; }
                
                @right-top { content: "" !important; display: none !important; }
                @right-middle { content: "" !important; display: none !important; }
                @right-bottom { content: "" !important; display: none !important; }
                
                @bottom-left-corner { content: "" !important; display: none !important; }
                @bottom-left { content: "" !important; display: none !important; }
                @bottom-center { content: "" !important; display: none !important; }
                @bottom-right { content: "" !important; display: none !important; }
                @bottom-right-corner { content: "" !important; display: none !important; }
              }
              
              html {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
                position: relative !important;
                box-sizing: border-box !important;
                
                /* Color settings */
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              /* Ensure ALL content stays in single page */
              * {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                page-break-before: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
                break-before: avoid !important;
                box-sizing: border-box !important;
              }
              
              /* CV Container - Match Live Preview EXACTLY */
              .cv-container {
                padding: 1rem !important;
                font-family: Arial, Helvetica, sans-serif !important;
                font-size: 11pt !important;
                line-height: 1.3 !important;
                max-width: 8.5in !important;
                margin: 0 auto !important;
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
                color: #000000 !important;
                background: #ffffff !important;
                min-height: auto !important;
                width: 100% !important;
              }
              
              .cv-container.classic {
                background: white !important;
                color: black !important;
              }
              
              /* Header - Match Live Preview EXACTLY */
              .cv-header {
                text-align: center !important;
                margin-bottom: 1rem !important;
              }
              
              .cv-header .name, .cv-header h1 {
                font-size: 1.875rem !important; /* 30px */
                font-weight: 900 !important;
                text-transform: uppercase !important;
                margin-bottom: 0.25rem !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .cv-header .title, .cv-header p {
                font-size: 1.125rem !important; /* 18px */
                margin-bottom: 0.75rem !important;
                color: black !important;
                font-weight: 500 !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .cv-header .contact-info {
                font-size: 0.875rem !important; /* 14px */
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .cv-header .contact-info div {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 1.5rem !important;
                flex-wrap: wrap !important;
              }
              
              /* Sections - Match Live Preview EXACTLY */
              .summary, .experience, .education, .skills, .languages, .projects, .certifications, .interests, .references {
                margin-bottom: 1rem !important;
              }
              
              .summary h2, .experience h2, .education h2, .skills h2, .languages h2, .projects h2, .certifications h2, .interests h2, .references h2 {
                font-size: 1.25rem !important; /* 20px */
                font-weight: 900 !important;
                text-transform: uppercase !important;
                margin-bottom: 0.5rem !important;
                padding-bottom: 2px !important;
                border-bottom: 2px solid black !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Experience items */
              .experience-item {
                margin-bottom: 0.75rem !important;
              }
              
              .exp-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                margin-bottom: 0.25rem !important;
              }
              
              .exp-header h3 {
                font-weight: bold !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .exp-meta {
                font-size: 0.875rem !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .exp-description {
                text-align: justify !important;
                line-height: 1.3 !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Education items */
              .education-item {
                margin-bottom: 0.5rem !important;
              }
              
              .edu-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
              }
              
              .edu-header h3 {
                font-weight: bold !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .institution {
                font-weight: 500 !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              .location, .date {
                font-size: 0.875rem !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Skills */
              .skills > div {
                margin-bottom: 0.25rem !important;
              }
              
              .skills span {
                font-size: 0.875rem !important;
                line-height: 1.3 !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Languages */
              .languages > div {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 0.25rem !important;
              }
              
              .languages div > div {
                display: flex !important;
                justify-content: space-between !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* References */
              .references-available {
                text-align: center !important;
                font-style: italic !important;
                color: black !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Lists */
              ul {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin-top: 0.25rem !important;
              }
              
              ul li {
                line-height: 1.3 !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              
              /* Grid layouts */
              .grid {
                display: grid !important;
              }
              
              .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              
              .gap-1 {
                gap: 0.25rem !important;
              }
              
              .gap-3 {
                gap: 0.75rem !important;
              }
              
              .gap-6 {
                gap: 1.5rem !important;
              }
              
              /* Text utilities */
              .text-center {
                text-align: center !important;
              }
              
              .text-right {
                text-align: right !important;
              }
              
              .text-justify {
                text-align: justify !important;
              }
              
              .text-sm {
                font-size: 0.875rem !important;
              }
              
              .text-xs {
                font-size: 0.75rem !important;
              }
              
              .font-bold {
                font-weight: 700 !important;
              }
              
              .font-medium {
                font-weight: 500 !important;
              }
              
              .font-semibold {
                font-weight: 600 !important;
              }
              
              .font-black {
                font-weight: 900 !important;
              }
              
              .uppercase {
                text-transform: uppercase !important;
              }
              
              .italic {
                font-style: italic !important;
              }
              
              /* Flexbox utilities */
              .flex {
                display: flex !important;
              }
              
              .justify-center {
                justify-content: center !important;
              }
              
              .justify-between {
                justify-content: space-between !important;
              }
              
              .items-center {
                align-items: center !important;
              }
              
              .items-start {
                align-items: flex-start !important;
              }
              
              .flex-wrap {
                flex-wrap: wrap !important;
              }
              
              /* Spacing utilities */
              .mb-1 {
                margin-bottom: 0.25rem !important;
              }
              
              .mb-2 {
                margin-bottom: 0.5rem !important;
              }
              
              .mb-3 {
                margin-bottom: 0.75rem !important;
              }
              
              .mb-4 {
                margin-bottom: 1rem !important;
              }
              
              .mt-1 {
                margin-top: 0.25rem !important;
              }
              
              .space-y-0 > * + * {
                margin-top: 0 !important;
              }
              
              .space-y-1 > * + * {
                margin-top: 0.25rem !important;
              }
              
              .space-y-2 > * + * {
                margin-top: 0.5rem !important;
              }
              
              .space-y-3 > * + * {
                margin-top: 0.75rem !important;
              }
              
              .leading-snug {
                line-height: 1.3 !important;
              }
              
              .pl-6 {
                padding-left: 1.5rem !important;
              }
            }
            
            /* Screen styles - match live preview */
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: black;
            }
            
            .cv-container {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11pt;
              line-height: 1.3;
              color: black;
              background: white;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1rem;
            }
            
          </style>
        </head>
        <body>
          ${cvHtml}
          <script>
            window.onload = function() {
              // Wait for fonts to load
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
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
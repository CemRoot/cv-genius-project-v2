'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { CVData } from '@/types/cv'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportButtonProps {
  templateManager: IrishCVTemplateManager
  cvData: CVData
  templateId?: string
}

export function ExportButton({ templateManager, cvData, templateId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | null>(null)
  
  const handleExport = async (format: 'pdf' | 'docx') => {
    setExporting(true)
    setExportFormat(format)
    
    try {
      // Ensure template is selected
      if (templateId) {
        templateManager.selectTemplate(templateId)
      }
      
      // Render final CV
      const html = templateManager.renderCV(cvData)
      const css = templateManager.getTemplateCSS()
      
      if (format === 'pdf') {
        // Use browser's print API for PDF generation
        await generatePDF(html, css, cvData.personal.fullName)
      } else if (format === 'docx') {
        // For Word export, we'll use a different approach
        await generateDOCX(cvData)
      }
      
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
      setExportFormat(null)
    }
  }
  
  const generatePDF = async (html: string, css: string, fileName: string) => {
    let tempContainer: HTMLDivElement | null = null
    
    try {
      // Dynamic imports for better bundle splitting
      const [html2canvas, jsPDF, fileSaver] = await Promise.all([
        import('html2canvas').catch(() => null),
        import('jspdf').catch(() => null),
        import('file-saver').catch(() => null)
      ])
      
      if (!html2canvas || !jsPDF || !fileSaver) {
        throw new Error('Required libraries failed to load. Please check your internet connection and try again.')
      }
      
      // Use live preview element instead of template manager HTML
      const previewElement = document.querySelector('.cv-container.classic') || 
                            document.querySelector('.cv-container') ||
                            document.querySelector('[data-testid="cv-preview"] .cv-container') ||
                            document.querySelector('.live-preview .cv-container') ||
                            document.querySelector('[class*="cv-container"]') ||
                            document.querySelector('[class*="classic"]')
      
      if (!previewElement) {
        throw new Error('CV preview element not found. Please ensure CV is visible in live preview.')
      }
      
      const element = previewElement as HTMLElement
      
      // Detect device type for optimal settings
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const devicePixelRatio = window.devicePixelRatio || 1
      
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
      
      // Generate canvas with mobile-optimized settings
      const canvas = await html2canvas.default(clone, {
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
          const clonedElement = clonedDoc.querySelector('.cv-container') as HTMLElement
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, Helvetica, sans-serif'
            clonedElement.style.color = 'black'
            clonedElement.style.background = 'white'
          }
        }
      })
      
      // Calculate optimal PDF dimensions (A4: 210 x 297 mm)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Create PDF
      const pdf = new jsPDF.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: !isMobile // Disable compression on mobile for faster processing
      })
      
      // Single page handling (most CVs fit on one page)
      const topMargin = Math.max(0, (pageHeight - Math.min(imgHeight, pageHeight)) / 4)
      const finalHeight = Math.min(imgHeight, pageHeight)
      
      const imageQuality = isMobile ? 0.8 : 0.95
      const imageFormat = isMobile ? 'JPEG' : 'PNG'
      const imageData = canvas.toDataURL(`image/${imageFormat.toLowerCase()}`, imageQuality)
      
      pdf.addImage(imageData, imageFormat, 0, topMargin, imgWidth, finalHeight)
      
      // Download the PDF
      const pdfBlob = pdf.output('blob')
      fileSaver.saveAs(pdfBlob, fileName)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error('Failed to generate PDF. Please try again.')
    } finally {
      // Clean up
      if (tempContainer && tempContainer.parentNode) {
        document.body.removeChild(tempContainer)
      }
    }
  }
  
  const generateDOCX = async (cvData: CVData) => {
    // For Word export, we'll send the data to an API endpoint
    // that uses a library like docx to generate the file
    const response = await fetch('/api/export/docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvData,
        templateId,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    // Download the file
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cvData.personal.fullName}_CV_${new Date().toISOString().split('T')[0]}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export CV
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')}>
          <FileText className="w-4 h-4 mr-2" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
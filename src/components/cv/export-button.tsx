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
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window')
    }
    
    // Write the CV content to the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="format-detection" content="telephone=no, email=no, address=no">
          <title>${fileName} - Professional CV</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
                /* Hide browser headers and footers */
                margin-header: 0;
                margin-footer: 0;
              }
              
              /* Remove all browser-generated content */
              @page :first {
                margin: 15mm;
                margin-header: 0;
                margin-footer: 0;
              }
              
              @page :left {
                margin: 15mm;
                margin-header: 0;
                margin-footer: 0;
              }
              
              @page :right {
                margin: 15mm;
                margin-header: 0;
                margin-footer: 0;
              }
              
              /* Hide browser-generated elements */
              body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Ensure no browser elements appear */
              html {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              /* Ensure content doesn't bleed into margins */
              .cv-content,
              .cv-preview-container,
              .a4-page {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* Page break handling with proper margins */
              .page-break {
                page-break-before: always;
                margin-top: 0 !important;
                padding-top: 0 !important;
              }
              
              /* Avoid breaking elements */
              .section,
              .experience-item,
              .education-item,
              .certification-item {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load
    printWindow.onload = () => {
      // Add JavaScript to configure print settings
      const script = printWindow.document.createElement('script')
      script.innerHTML = `
        // Configure print settings to hide headers/footers
        if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
          // Chrome-specific settings
          const printSettings = {
            shouldPrintBackgrounds: true,
            shouldPrintSelectionOnly: false,
            marginType: 1, // NO_MARGINS
            headerFooterEnabled: false,
            isLandscape: false,
            paperSizeUnit: 0,
            paperWidth: 210,
            paperHeight: 297
          };
        }
        
        // Fallback: Use CSS to ensure clean print
        const style = document.createElement('style');
        style.innerHTML = \`
          @media print {
            @page { margin: 15mm; }
            body { margin: 0; padding: 0; }
          }
        \`;
        document.head.appendChild(style);
        
        // Set document title for better PDF naming
        document.title = '${fileName}_CV_Professional';
        
        // Ensure proper viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      `
      printWindow.document.head.appendChild(script)
      
      // Small delay to ensure scripts run
      setTimeout(() => {
        // Trigger print dialog
        printWindow.print()
        
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 100)
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
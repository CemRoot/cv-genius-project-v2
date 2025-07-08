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
              /* ULTIMATE header/footer elimination */
              @page {
                size: A4 portrait;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                
                /* Nuclear option - remove everything */
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
              
              /* Force single page behavior AGGRESSIVELY */
              html {
                margin: 0 !important;
                padding: 0 !important;
                height: 297mm !important;
                width: 210mm !important;
                max-height: 297mm !important;
                max-width: 210mm !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
              }
              
              body {
                margin: 15mm !important;
                padding: 0 !important;
                width: calc(210mm - 30mm) !important;
                height: calc(297mm - 30mm) !important;
                max-width: calc(210mm - 30mm) !important;
                max-height: calc(297mm - 30mm) !important;
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
              
              /* Target all possible content wrappers */
              .cv-content,
              .cv-preview-container,
              .a4-page,
              .cv-container,
              .cv-wrapper,
              .cv-page,
              [class*="cv-"],
              [class*="template-"],
              div {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                page-break-before: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
                break-before: avoid !important;
                margin: 0 !important;
                max-height: none !important;
                overflow: visible !important;
              }
              
              /* Hide any page break elements */
              .page-break,
              .pagebreak,
              [class*="page-break"],
              [class*="break"] {
                display: none !important;
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
        // NUCLEAR OPTION: Remove ALL possible browser interference
        try {
          // Set absolute clean document title
          document.title = 'CV';
          
          // Remove ALL meta tags that could generate headers
          const allMetas = document.querySelectorAll('meta');
          allMetas.forEach(meta => meta.remove());
          
          // Add only essential meta
          const essentialMeta = document.createElement('meta');
          essentialMeta.setAttribute('charset', 'utf-8');
          document.head.appendChild(essentialMeta);
          
          // Force document structure
          document.documentElement.style.cssText = \`
            margin: 0 !important;
            padding: 0 !important;
            height: 297mm !important;
            width: 210mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
          \`;
          
          document.body.style.cssText = \`
            margin: 15mm !important;
            padding: 0 !important;
            width: calc(210mm - 30mm) !important;
            height: calc(297mm - 30mm) !important;
            max-height: calc(297mm - 30mm) !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            position: relative !important;
            box-sizing: border-box !important;
          \`;
          
          // Nuclear CSS injection
          const ultimateStyle = document.createElement('style');
          ultimateStyle.innerHTML = \`
            @media print {
              @page {
                size: A4 portrait;
                margin: 0 !important;
                
                /* Every possible header/footer position */
                @top-left-corner { content: "" !important; display: none !important; }
                @top-left { content: "" !important; display: none !important; }
                @top-center { content: "" !important; display: none !important; }
                @top-right { content: "" !important; display: none !important; }
                @top-right-corner { content: "" !important; display: none !important; }
                @bottom-left-corner { content: "" !important; display: none !important; }
                @bottom-left { content: "" !important; display: none !important; }
                @bottom-center { content: "" !important; display: none !important; }
                @bottom-right { content: "" !important; display: none !important; }
                @bottom-right-corner { content: "" !important; display: none !important; }
                @left-top { content: "" !important; display: none !important; }
                @left-middle { content: "" !important; display: none !important; }
                @left-bottom { content: "" !important; display: none !important; }
                @right-top { content: "" !important; display: none !important; }
                @right-middle { content: "" !important; display: none !important; }
                @right-bottom { content: "" !important; display: none !important; }
              }
              
              html {
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
              }
              
              body {
                height: calc(297mm - 30mm) !important;
                max-height: calc(297mm - 30mm) !important;
                margin: 15mm !important;
                padding: 0 !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
              }
              
              * {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                page-break-before: avoid !important;
                break-after: avoid !important;
                break-inside: avoid !important;
                break-before: avoid !important;
              }
            }
          \`;
          document.head.appendChild(ultimateStyle);
          
          // Remove any elements that could cause page breaks
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            if (el.style) {
              el.style.pageBreakAfter = 'avoid';
              el.style.pageBreakBefore = 'avoid';
              el.style.pageBreakInside = 'avoid';
              el.style.breakAfter = 'avoid';
              el.style.breakBefore = 'avoid';
              el.style.breakInside = 'avoid';
            }
          });
          
          // Hide any page break elements
          const pageBreakElements = document.querySelectorAll('.page-break, .pagebreak, [class*="page-break"], [class*="break"]');
          pageBreakElements.forEach(el => {
            el.style.display = 'none';
            el.remove();
          });
          
        } catch (e) {
          console.warn('Ultimate print configuration failed:', e);
        }
      `
      printWindow.document.head.appendChild(script)
      
      // Enhanced timing for better print handling
      setTimeout(() => {
        // Force recalculation of page dimensions
        printWindow.document.body.style.display = 'none';
        printWindow.document.body.offsetHeight; // Force reflow
        printWindow.document.body.style.display = 'block';
        
        // Additional clean-up before print
        const allElements = printWindow.document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.style) {
            el.style.pageBreakInside = 'avoid';
            el.style.breakInside = 'avoid';
          }
        });
        
        // Print dialog will open automatically without overlay
        
        // Trigger print dialog
        printWindow.print();
        
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 200)
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
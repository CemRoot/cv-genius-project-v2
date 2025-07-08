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
              /* Force single page layout */
              @page {
                size: A4 portrait;
                margin: 15mm;
                margin-top: 0;
                margin-bottom: 0;
                margin-left: 15mm;
                margin-right: 15mm;
                /* Aggressive header/footer removal */
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
              }
              
              /* Remove ALL browser-generated content */
              @page :first {
                margin: 15mm;
                margin-top: 0;
                margin-bottom: 0;
                @top-left { content: none !important; }
                @top-center { content: none !important; }
                @top-right { content: none !important; }
                @bottom-left { content: none !important; }
                @bottom-center { content: none !important; }
                @bottom-right { content: none !important; }
              }
              
              @page :last {
                margin: 15mm;
                margin-top: 0;
                margin-bottom: 0;
                @top-left { content: none !important; }
                @top-center { content: none !important; }
                @top-right { content: none !important; }
                @bottom-left { content: none !important; }
                @bottom-center { content: none !important; }
                @bottom-right { content: none !important; }
              }
              
              /* Force clean document structure */
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: auto !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                page-break-inside: avoid !important;
              }
              
              /* Ensure single page content */
              .cv-content, .cv-preview-container, .a4-page {
                margin: 0 !important;
                padding: 15mm !important;
                width: calc(210mm - 30mm) !important;
                min-height: calc(297mm - 30mm) !important;
                max-height: calc(297mm - 30mm) !important;
                overflow: hidden !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                box-sizing: border-box !important;
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
        // Enhanced print settings configuration
        try {
          // Chrome-specific print settings
          if (window.chrome) {
            const style = document.createElement('style');
            style.innerHTML = \`
              @media print {
                @page { size: A4 portrait; margin: 0; }
                body { margin: 15mm; padding: 0; }
                * { page-break-inside: avoid; }
              }
            \`;
            document.head.appendChild(style);
          }
          
          // Force single page behavior
          document.body.style.pageBreakAfter = 'avoid';
          document.body.style.pageBreakInside = 'avoid';
          document.body.style.overflow = 'hidden';
          
          // Remove any existing page breaks
          const pageBreaks = document.querySelectorAll('.page-break, [style*="page-break"]');
          pageBreaks.forEach(el => {
            el.style.pageBreakBefore = 'avoid';
            el.style.pageBreakAfter = 'avoid';
            el.style.breakBefore = 'avoid';
            el.style.breakAfter = 'avoid';
          });
        } catch (e) {
          console.warn('Print settings configuration failed:', e);
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
        
        // Set clean document title (no browser info)
        document.title = '${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_CV';
        
        // Remove any meta tags that might show in headers
        const metaTags = document.querySelectorAll('meta[name], meta[property]');
        metaTags.forEach(tag => tag.remove());
        
        // Add clean meta structure
        const cleanMeta = document.createElement('meta');
        cleanMeta.setAttribute('name', 'description');
        cleanMeta.setAttribute('content', 'Professional CV');
        document.head.appendChild(cleanMeta);
        
        // Ensure proper viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
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
        
        // Create user instruction overlay
        const overlay = printWindow.document.createElement('div');
        overlay.innerHTML = `
          <div style="position: fixed; top: 10px; left: 10px; background: #000; color: #fff; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999; font-family: Arial, sans-serif;">
            📄 PDF Settings: Please click 'More settings' → Turn OFF 'Headers and footers' → Save as PDF
            <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; background: #fff; color: #000; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">✕</button>
          </div>
        `;
        printWindow.document.body.appendChild(overlay);
        
        // Hide overlay after 10 seconds
        setTimeout(() => {
          if (overlay.parentElement) {
            overlay.style.display = 'none';
          }
        }, 10000);
        
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
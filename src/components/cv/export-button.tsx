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
    
    const cvHtml = (previewElement as HTMLElement).outerHTML
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window')
    }
    
    // Write the CV content to the print window - using same CSS as inline export modal
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fileName} - Professional CV</title>
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
              
              /* Common utility classes */
              .text-center { text-align: center !important; }
              .text-right { text-align: right !important; }
              .text-justify { text-align: justify !important; }
              .text-sm { font-size: 0.875rem !important; }
              .text-xs { font-size: 0.75rem !important; }
              .font-bold { font-weight: 700 !important; }
              .font-medium { font-weight: 500 !important; }
              .font-semibold { font-weight: 600 !important; }
              .font-black { font-weight: 900 !important; }
              .uppercase { text-transform: uppercase !important; }
              .italic { font-style: italic !important; }
              .flex { display: flex !important; }
              .justify-center { justify-content: center !important; }
              .justify-between { justify-content: space-between !important; }
              .items-center { align-items: center !important; }
              .items-start { align-items: flex-start !important; }
              .flex-wrap { flex-wrap: wrap !important; }
              .mb-1 { margin-bottom: 0.25rem !important; }
              .mb-2 { margin-bottom: 0.5rem !important; }
              .mb-3 { margin-bottom: 0.75rem !important; }
              .mb-4 { margin-bottom: 1rem !important; }
              .mt-1 { margin-top: 0.25rem !important; }
              .space-y-1 > * + * { margin-top: 0.25rem !important; }
              .space-y-2 > * + * { margin-top: 0.5rem !important; }
              .space-y-3 > * + * { margin-top: 0.75rem !important; }
              .leading-snug { line-height: 1.3 !important; }
              .pl-6 { padding-left: 1.5rem !important; }
              .grid { display: grid !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .gap-1 { gap: 0.25rem !important; }
              .gap-3 { gap: 0.75rem !important; }
              .gap-6 { gap: 1.5rem !important; }
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
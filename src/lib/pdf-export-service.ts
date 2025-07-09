import { pdf } from '@react-pdf/renderer'
import { PDFTemplate } from '@/components/export/pdf-templates'
import type { CVData } from '@/types/cv'
import { saveAs } from 'file-saver'
import React from 'react'

export interface PDFExportOptions {
  filename?: string
  quality?: 'high' | 'medium' | 'low'
  enableOptimization?: boolean
  templateId?: string
}

export class PDFExportService {
  private static instance: PDFExportService | null = null

  static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService()
    }
    return PDFExportService.instance
  }

  /**
   * Generate PDF from CV data using React-PDF renderer
   * This ensures consistency between live preview and PDF output
   */
  async generatePDF(cvData: CVData, options: PDFExportOptions = {}): Promise<Blob> {
    const {
      filename = `${cvData.personal.fullName || 'cv'}-export.pdf`,
      quality = 'high',
      enableOptimization = true,
      templateId: optionsTemplateId
    } = options

    try {
      // Validate CV data first
      if (!cvData || !cvData.personal) {
        throw new Error('CV data is missing or incomplete')
      }
      
      // Get template ID from options, CV data, or use classic as fallback
      const templateId = optionsTemplateId || cvData.template || 'classic'
      
      console.log('🎯 PDF Export: Using template:', templateId)
      console.log('🎯 PDF Export: CV personal data:', {
        fullName: cvData.personal.fullName || 'Not provided',
        email: cvData.personal.email || 'Not provided',
        template: cvData.template || 'Not set'
      })
      
      // Create PDF document using React-PDF renderer with template ID
      // Pass template directly to PDFTemplate - it will handle the mapping internally
      const documentElement = React.createElement(PDFTemplate, { 
        data: cvData,
        template: templateId
      })
      
      console.log('🔄 PDF Export: Starting PDF generation...')
      
      // Generate PDF blob
      const pdfBlob = await pdf(documentElement as any).toBlob()
      
      console.log('✅ PDF Export: Generated successfully with template:', templateId)
      console.log('✅ PDF Export: PDF size:', pdfBlob.size, 'bytes')
      
      return pdfBlob
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      console.error('❌ PDF generation error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        cvDataExists: !!cvData,
        personalExists: !!(cvData && cvData.personal)
      })
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Export and download PDF
   */
  async exportPDF(cvData: CVData, options: PDFExportOptions = {}): Promise<void> {
    const {
      filename = `${cvData.personal.fullName || 'cv'}-export.pdf`,
    } = options

    try {
      const pdfBlob = await this.generatePDF(cvData, options)
      
      // Download the PDF
      saveAs(pdfBlob, filename)
    } catch (error) {
      console.error('PDF export failed:', error)
      throw error
    }
  }

  /**
   * Generate PDF URL for preview
   */
  async generatePDFURL(cvData: CVData, options: PDFExportOptions = {}): Promise<string> {
    try {
      const pdfBlob = await this.generatePDF(cvData, options)
      return URL.createObjectURL(pdfBlob)
    } catch (error) {
      console.error('PDF URL generation failed:', error)
      throw error
    }
  }

  /**
   * Validate CV data before PDF generation
   */
  validateCVData(cvData: CVData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!cvData.personal.fullName) {
      errors.push('Full name is required')
    }

    if (!cvData.personal.email) {
      errors.push('Email is required')
    }

    // Check for empty sections
    if (cvData.experience.length === 0) {
      errors.push('At least one work experience entry is recommended')
    }

    if (cvData.education.length === 0) {
      errors.push('At least one education entry is recommended')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get PDF generation progress (for future implementation)
   */
  async generatePDFWithProgress(
    cvData: CVData, 
    options: PDFExportOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    // Simulate progress for now
    if (onProgress) {
      onProgress(0)
      await new Promise(resolve => setTimeout(resolve, 100))
      onProgress(30)
      await new Promise(resolve => setTimeout(resolve, 100))
      onProgress(60)
    }

    const pdfBlob = await this.generatePDF(cvData, options)
    
    if (onProgress) {
      onProgress(100)
    }

    return pdfBlob
  }
}

// Export singleton instance
export const pdfExportService = PDFExportService.getInstance()

// Export convenience functions
export async function exportCVToPDF(cvData: CVData, options: PDFExportOptions = {}): Promise<void> {
  return pdfExportService.exportPDF(cvData, options)
}

export async function generateCVPDF(cvData: CVData, options: PDFExportOptions = {}): Promise<Blob> {
  return pdfExportService.generatePDF(cvData, options)
}

export async function validateCVForPDF(cvData: CVData) {
  return pdfExportService.validateCVData(cvData)
}
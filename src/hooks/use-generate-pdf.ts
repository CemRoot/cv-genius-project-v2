'use client'

import { useState, useCallback } from 'react'
import { PDFDocument, PDFPage, StandardFonts, rgb, PDFFont } from 'pdf-lib'
import { CvBuilderDocument } from '@/types/cv-builder'

interface PDFGenerationOptions {
  template?: 'classic' | 'modern' | 'minimal'
  pageMargin?: number
  fontSize?: {
    name: number
    title: number
    section: number
    body: number
    small: number
  }
  colors?: {
    primary: [number, number, number]
    text: [number, number, number]
    accent: [number, number, number]
  }
}

interface PDFGenerationState {
  isGenerating: boolean
  progress: number
  error: string | null
  stage: string
}

interface GeneratePDFResult {
  success: boolean
  blob?: Blob
  url?: string
  error?: string
}

// Default Irish CV formatting options
const DEFAULT_OPTIONS: PDFGenerationOptions = {
  template: 'classic',
  pageMargin: 40, // 15mm in points (1mm = 2.83465 points)
  fontSize: {
    name: 18,
    title: 12,
    section: 11,
    body: 10,
    small: 9
  },
  colors: {
    primary: [0, 0, 0],    // Black - ATS friendly
    text: [0, 0, 0],       // Black text
    accent: [0.2, 0.2, 0.2] // Dark gray
  }
}

interface FontSet {
  regular: PDFFont
  bold: PDFFont
  italic?: PDFFont
}

export function useGeneratePdf() {
  const [state, setState] = useState<PDFGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    stage: 'ready'
  })

  const updateProgress = useCallback((progress: number, stage: string) => {
    setState(prev => ({ ...prev, progress, stage }))
  }, [])

  const formatIrishPhone = useCallback((phone: string): string => {
    if (!phone) return ''
    // Remove any existing formatting
    const cleaned = phone.replace(/\D/g, '')
    
    // Format Irish phone numbers
    if (cleaned.startsWith('353')) {
      const number = cleaned.slice(3)
      if (number.length === 9) {
        return `+353 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
      }
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }, [])

  const formatDate = useCallback((dateStr: string): string => {
    if (!dateStr || dateStr === 'Present') return dateStr
    
    try {
      // Handle YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [year, month] = dateStr.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return date.toLocaleDateString('en-IE', { 
          month: 'short', 
          year: 'numeric' 
        })
      }
      
      // Handle other date formats
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IE', { 
          month: 'short', 
          year: 'numeric' 
        })
      }
    } catch (error) {
      console.warn('Date formatting error:', error)
    }
    
    return dateStr
  }, [])

  const drawText = useCallback((
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    options: {
      font: PDFFont
      size: number
      color?: [number, number, number]
      maxWidth?: number
      lineHeight?: number
    }
  ): number => {
    const { font, size, color = [0, 0, 0], maxWidth, lineHeight = 1.2 } = options
    
    if (!text) return y
    
    const lines = maxWidth 
      ? splitTextIntoLines(text, font, size, maxWidth)
      : [text]
    
    let currentY = y
    
    for (const line of lines) {
      page.drawText(line, {
        x,
        y: currentY,
        size,
        font,
        color: rgb(color[0], color[1], color[2])
      })
      currentY -= size * lineHeight
    }
    
    return currentY
  }, [])

  const splitTextIntoLines = useCallback((
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number
  ): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const textWidth = font.widthOfTextAtSize(testLine, size)
      
      if (textWidth <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Word is too long, break it
          lines.push(word)
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }, [])

  const generateClassicTemplate = useCallback(async (
    doc: PDFDocument,
    cvData: CvBuilderDocument,
    fonts: FontSet,
    options: PDFGenerationOptions
  ): Promise<void> => {
    const page = doc.addPage()
    const { width, height } = page.getSize()
    const margin = options.pageMargin!
    const contentWidth = width - 2 * margin
    
    let currentY = height - margin
    
    // Header - Name and Title
    updateProgress(20, 'Adding header information')
    currentY = drawText(page, cvData.personal.fullName.toUpperCase(), margin, currentY, {
      font: fonts.bold,
      size: options.fontSize!.name,
      color: options.colors!.primary
    })
    
    currentY -= 8
    
    if (cvData.personal.title) {
      currentY = drawText(page, cvData.personal.title, margin, currentY, {
        font: fonts.regular,
        size: options.fontSize!.title,
        color: options.colors!.text
      })
    }
    
    currentY -= 15
    
    // Contact Information
    const contactInfo = [
      cvData.personal.email,
      cvData.personal.phone ? formatIrishPhone(cvData.personal.phone) : '',
      cvData.personal.address
    ].filter(Boolean).join('  •  ')
    
    currentY = drawText(page, contactInfo, margin, currentY, {
      font: fonts.regular,
      size: options.fontSize!.small,
      color: options.colors!.text
    })
    
    currentY -= 20
    
    // Draw header line
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 2,
      color: rgb(0, 0, 0)
    })
    
    currentY -= 15
    
    // Sections
    updateProgress(40, 'Adding CV sections')
    
    for (const section of cvData.sections) {
      if (currentY < 100) {
        // Add new page if needed
        updateProgress(60, 'Adding new page')
        const newPage = doc.addPage()
        currentY = height - margin
        
        // Continue with new page
        currentY = await addSectionToPage(newPage, section, fonts, options, margin, contentWidth, currentY)
      } else {
        currentY = await addSectionToPage(page, section, fonts, options, margin, contentWidth, currentY)
      }
    }
  }, [drawText, formatIrishPhone, updateProgress])

  const addSectionToPage = useCallback(async (
    page: PDFPage,
    section: any,
    fonts: FontSet,
    options: PDFGenerationOptions,
    margin: number,
    contentWidth: number,
    currentY: number
  ): Promise<number> => {
    const { width } = page.getSize()
    
    // Section title
    const sectionTitle = getSectionTitle(section.type)
    currentY = drawText(page, sectionTitle.toUpperCase(), margin, currentY, {
      font: fonts.bold,
      size: options.fontSize!.section,
      color: options.colors!.primary
    })
    
    // Section underline
    currentY -= 3
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    currentY -= 12
    
    // Section content
    switch (section.type) {
      case 'summary':
        currentY = drawText(page, section.markdown, margin, currentY, {
          font: fonts.regular,
          size: options.fontSize!.body,
          color: options.colors!.text,
          maxWidth: contentWidth,
          lineHeight: 1.4
        })
        break
        
      case 'experience':
        for (const exp of section.items) {
          // Job title and company
          currentY = drawText(page, `${exp.role} at ${exp.company}`, margin, currentY, {
            font: fonts.bold,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          // Dates
          const dates = `${formatDate(exp.start)} - ${exp.end ? formatDate(exp.end) : 'Present'}`
          currentY += options.fontSize!.body + 2
          currentY = drawText(page, dates, width - margin - 100, currentY, {
            font: fonts.regular,
            size: options.fontSize!.small,
            color: options.colors!.accent
          })
          
          currentY -= options.fontSize!.body + 2
          currentY -= 8
          
          // Bullets
          for (const bullet of exp.bullets) {
            currentY = drawText(page, `• ${bullet}`, margin + 12, currentY, {
              font: fonts.regular,
              size: options.fontSize!.body,
              color: options.colors!.text,
              maxWidth: contentWidth - 12,
              lineHeight: 1.3
            })
            currentY -= 4
          }
          
          currentY -= 8
        }
        break
        
      case 'education':
        for (const edu of section.items) {
          currentY = drawText(page, `${edu.degree} in ${edu.field}`, margin, currentY, {
            font: fonts.bold,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          currentY = drawText(page, edu.institution, margin, currentY, {
            font: fonts.regular,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          const dates = `${formatDate(edu.start)} - ${edu.end ? formatDate(edu.end) : 'Present'}`
          currentY += options.fontSize!.body + 2
          currentY = drawText(page, dates, width - margin - 100, currentY, {
            font: fonts.regular,
            size: options.fontSize!.small,
            color: options.colors!.accent
          })
          
          currentY -= options.fontSize!.body + 2
          
          if (edu.grade) {
            currentY = drawText(page, `Grade: ${edu.grade}`, margin, currentY, {
              font: fonts.regular,
              size: options.fontSize!.small,
              color: options.colors!.text
            })
          }
          
          currentY -= 12
        }
        break
        
      case 'skills':
        const skillsText = section.items.join(' • ')
        currentY = drawText(page, skillsText, margin, currentY, {
          font: fonts.regular,
          size: options.fontSize!.body,
          color: options.colors!.text,
          maxWidth: contentWidth,
          lineHeight: 1.3
        })
        break
    }
    
    currentY -= 20
    return currentY
  }, [drawText, formatDate])

  const getSectionTitle = useCallback((type: string): string => {
    switch (type) {
      case 'summary': return 'Professional Summary'
      case 'experience': return 'Work Experience'
      case 'education': return 'Education'
      case 'skills': return 'Skills'
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }, [])

  const generatePdf = useCallback(async (
    cvData: CvBuilderDocument,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<GeneratePDFResult> => {
    setState({
      isGenerating: true,
      progress: 0,
      error: null,
      stage: 'initializing'
    })
    
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
      
      updateProgress(10, 'Creating PDF document')
      const pdfDoc = await PDFDocument.create()
      
      updateProgress(15, 'Loading fonts')
      const fonts: FontSet = {
        regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
        bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      }
      
      switch (mergedOptions.template) {
        case 'classic':
        default:
          await generateClassicTemplate(pdfDoc, cvData, fonts, mergedOptions)
          break
      }
      
      updateProgress(80, 'Generating PDF bytes')
      const pdfBytes = await pdfDoc.save()
      
      updateProgress(90, 'Creating download blob')
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      updateProgress(100, 'Complete')
      
      setState({
        isGenerating: false,
        progress: 100,
        error: null,
        stage: 'complete'
      })
      
      return {
        success: true,
        blob,
        url
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDF generation failed'
      
      setState({
        isGenerating: false,
        progress: 0,
        error: errorMessage,
        stage: 'error'
      })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [generateClassicTemplate, updateProgress])

  const downloadPdf = useCallback(async (
    cvData: CvBuilderDocument,
    filename: string = 'CV.pdf',
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<boolean> => {
    const result = await generatePdf(cvData, options)
    
    if (result.success && result.blob) {
      // Create download link
      const link = document.createElement('a')
      link.href = result.url!
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup URL
      URL.revokeObjectURL(result.url!)
      
      return true
    }
    
    return false
  }, [generatePdf])

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      error: null,
      stage: 'ready'
    })
  }, [])

  return {
    ...state,
    generatePdf,
    downloadPdf,
    reset
  }
}
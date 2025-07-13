'use client'

import { useState, useCallback } from 'react'
import { PDFDocument, PDFPage, StandardFonts, rgb, PDFFont } from 'pdf-lib'
import { CvBuilderDocument } from '@/types/cv-builder'
import { getOrderedSections, getSectionLabel } from '@/lib/cv-section-utils'

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
    
    // Debug: Log section visibility
    console.log('PDF Generation - Section Visibility:', cvData.sectionVisibility)
    console.log('PDF Generation - Sections:', cvData.sections.map(s => ({ type: s.type, hasItems: 'items' in s ? s.items.length : 'N/A' })))
    
    // ATS-friendly metadata
    doc.setTitle(`${cvData.personal.fullName} - CV`)
    doc.setAuthor(cvData.personal.fullName)
    doc.setSubject('Curriculum Vitae - ATS Optimized')
    doc.setCreator('CVGenius - ATS Optimized Export')
    doc.setProducer('CVGenius Dublin CV Builder')
    
    // Header - Name and Title (ATS Priority)
    updateProgress(20, 'Adding header information')
    currentY = drawText(page, cvData.personal.fullName.toUpperCase(), margin, currentY, {
      font: fonts.bold,
      size: options.fontSize!.name,
      color: [0, 0, 0] // Pure black for ATS compatibility
    })
    
    currentY -= 8
    
    if (cvData.personal.title) {
      currentY = drawText(page, cvData.personal.title, margin, currentY, {
        font: fonts.regular,
        size: options.fontSize!.title,
        color: [0, 0, 0] // Pure black for ATS compatibility
      })
    }
    
    currentY -= 15
    
    // Contact Information - ATS-friendly format
    const contactInfo = [
      cvData.personal.email,
      cvData.personal.phone ? formatIrishPhone(cvData.personal.phone) : '',
      cvData.personal.address
    ].filter(Boolean).join('  •  ')
    
    currentY = drawText(page, contactInfo, margin, currentY, {
      font: fonts.regular,
      size: options.fontSize!.small,
      color: [0, 0, 0] // Pure black for ATS compatibility
    })
    
    // Add LinkedIn and website if available
    const additionalInfo = [
      cvData.personal.linkedin,
      cvData.personal.website
    ].filter(Boolean).join('  •  ')
    
    if (additionalInfo) {
      currentY -= 10
      currentY = drawText(page, additionalInfo, margin, currentY, {
        font: fonts.regular,
        size: options.fontSize!.small,
        color: [0, 0, 0]
      })
    }
    
    currentY -= 20
    
    // Simple separator line (ATS-friendly)
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0)
    })
    
    currentY -= 12
    
    // Sections
    updateProgress(40, 'Adding CV sections')
    
    // Get ordered and visible sections using new utility
    const orderedSectionConfigs = getOrderedSections(cvData.sectionVisibility)
    const visibleSections = orderedSectionConfigs.map(config => {
      return cvData.sections.find(section => section.type === config.id)
    }).filter(section => {
      if (!section) return false
      
      // Skip empty sections (except references in on-request mode)
      if (section.type === 'summary' && (!section.markdown || section.markdown.trim() === '')) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'experience' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'education' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'skills' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'certifications' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'languages' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'volunteer' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'awards' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'publications' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty)`)
        return false
      }
      if (section.type === 'references' && section.mode === 'detailed' && (!section.items || section.items.length === 0)) {
        console.log(`PDF Generation - Skipping ${section.type} (empty detailed mode)`)
        return false
      }
      
      console.log(`PDF Generation - Including ${section.type}`)
      return true
    })
    
    console.log(`PDF Generation - Total visible sections: ${visibleSections.length}`)
    
    for (const section of visibleSections) {
      
      if (currentY < 100) {
        // Add new page if needed
        updateProgress(60, 'Adding new page')
        const newPage = doc.addPage()
        currentY = height - margin
        
        // Continue with new page
        currentY = await addSectionToPage(newPage, section, fonts, options, margin, contentWidth, currentY, cvData)
      } else {
        currentY = await addSectionToPage(page, section, fonts, options, margin, contentWidth, currentY, cvData)
      }
    }
  }, [drawText, formatIrishPhone, updateProgress, getOrderedSections, getSectionLabel])

  const addSectionToPage = useCallback(async (
    page: PDFPage,
    section: any,
    fonts: FontSet,
    options: PDFGenerationOptions,
    margin: number,
    contentWidth: number,
    currentY: number,
    cvData: CvBuilderDocument
  ): Promise<number> => {
    const { width } = page.getSize()
    
    // Section title
    const sectionTitle = getSectionLabel(section.type)
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
    
    currentY -= 10
    
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
          currentY -= 6
          
          // Bullets
          for (const bullet of exp.bullets) {
            currentY = drawText(page, `• ${bullet}`, margin + 12, currentY, {
              font: fonts.regular,
              size: options.fontSize!.body,
              color: options.colors!.text,
              maxWidth: contentWidth - 12,
              lineHeight: 1.3
            })
            currentY -= 3
          }
          
          currentY -= 6
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
          
          currentY -= 8
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
        
      case 'certifications':
        for (const cert of section.items) {
          currentY = drawText(page, cert.name, margin, currentY, {
            font: fonts.bold,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          const certDetails = `${cert.issuer} • ${formatDate(cert.date)}${cert.expiryDate ? ` - ${formatDate(cert.expiryDate)}` : ''}`
          currentY = drawText(page, certDetails, margin, currentY, {
            font: fonts.regular,
            size: options.fontSize!.small,
            color: options.colors!.accent
          })
          
          if (cert.credentialId) {
            currentY = drawText(page, `ID: ${cert.credentialId}`, margin, currentY, {
              font: fonts.regular,
              size: options.fontSize!.small,
              color: options.colors!.accent
            })
          }
          
          currentY -= 8
        }
        break
        
      case 'languages':
        const languageLines: string[] = []
        for (const lang of section.items) {
          const proficiencyMap: Record<string, string> = {
            'native': 'Native',
            'fluent': 'Fluent',
            'professional': 'Professional',
            'intermediate': 'Intermediate',
            'basic': 'Basic'
          }
          const langText = `${lang.name} - ${proficiencyMap[lang.proficiency] || lang.proficiency}${lang.certification ? ` (${lang.certification})` : ''}`
          languageLines.push(langText)
        }
        currentY = drawText(page, languageLines.join(' • '), margin, currentY, {
          font: fonts.regular,
          size: options.fontSize!.body,
          color: options.colors!.text,
          maxWidth: contentWidth,
          lineHeight: 1.3
        })
        break
        
      case 'volunteer':
        for (const vol of section.items) {
          currentY = drawText(page, `${vol.role} at ${vol.organization}`, margin, currentY, {
            font: fonts.bold,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          const dates = `${formatDate(vol.start)} - ${vol.end ? formatDate(vol.end) : 'Present'}`
          currentY += options.fontSize!.body + 2
          currentY = drawText(page, dates, width - margin - 100, currentY, {
            font: fonts.regular,
            size: options.fontSize!.small,
            color: options.colors!.accent
          })
          
          currentY -= options.fontSize!.body + 2
          currentY -= 4
          
          currentY = drawText(page, vol.description, margin, currentY, {
            font: fonts.regular,
            size: options.fontSize!.body,
            color: options.colors!.text,
            maxWidth: contentWidth,
            lineHeight: 1.3
          })
          
          currentY -= 8
        }
        break
        
      case 'awards':
        for (const award of section.items) {
          const awardText = `${award.name} • ${award.issuer} • ${formatDate(award.date)}`
          currentY = drawText(page, awardText, margin, currentY, {
            font: fonts.bold,
            size: options.fontSize!.body,
            color: options.colors!.text
          })
          
          if (award.description) {
            currentY = drawText(page, award.description, margin, currentY, {
              font: fonts.regular,
              size: options.fontSize!.small,
              color: options.colors!.text,
              maxWidth: contentWidth,
              lineHeight: 1.3
            })
          }
          
          currentY -= 8
        }
        break
        
      case 'publications':
        for (const pub of section.items) {
          let pubText = ''
          if (pub.authors) {
            pubText += `${pub.authors}. `
          }
          pubText += `"${pub.title}" ${pub.publication}, ${formatDate(pub.date)}`
          
          currentY = drawText(page, pubText, margin, currentY, {
            font: fonts.regular,
            size: options.fontSize!.body,
            color: options.colors!.text,
            maxWidth: contentWidth,
            lineHeight: 1.3
          })
          
          currentY -= 8
        }
        break
        
      case 'references':
        if (section.mode === 'on-request') {
          currentY = drawText(page, 'References available upon request', margin, currentY, {
            font: fonts.regular,
            size: options.fontSize!.body,
            color: options.colors!.text,
            maxWidth: contentWidth
          })
        } else {
          for (const ref of section.items) {
            currentY = drawText(page, ref.name, margin, currentY, {
              font: fonts.bold,
              size: options.fontSize!.body,
              color: options.colors!.text
            })
            
            currentY = drawText(page, `${ref.title} at ${ref.company}`, margin, currentY, {
              font: fonts.regular,
              size: options.fontSize!.body,
              color: options.colors!.text
            })
            
            currentY = drawText(page, ref.email, margin, currentY, {
              font: fonts.regular,
              size: options.fontSize!.small,
              color: options.colors!.accent
            })
            
            if (ref.phone) {
              currentY = drawText(page, formatIrishPhone(ref.phone), margin, currentY, {
                font: fonts.regular,
                size: options.fontSize!.small,
                color: options.colors!.accent
              })
            }
            
            if (ref.relationship) {
              currentY = drawText(page, ref.relationship, margin, currentY, {
                font: fonts.regular,
                size: options.fontSize!.small,
                color: options.colors!.text
              })
            }
            
            currentY -= 8
          }
        }
        break
    }
    
    currentY -= 15  // Reduced spacing between sections
    return currentY
  }, [drawText, formatDate, formatIrishPhone, getSectionLabel])

  const generatePdf = useCallback(async (
    cvData: CvBuilderDocument,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<GeneratePDFResult> => {
    console.log('generatePdf called with:', { cvData, options })
    
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
      console.log('PDF document created')
      
      updateProgress(15, 'Loading fonts')
      const fonts: FontSet = {
        regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
        bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      }
      console.log('Fonts loaded')
      
      switch (mergedOptions.template) {
        case 'classic':
        default:
          await generateClassicTemplate(pdfDoc, cvData, fonts, mergedOptions)
          break
      }
      console.log('Template generated')
      
      updateProgress(80, 'Generating PDF bytes')
      const pdfBytes = await pdfDoc.save()
      console.log('PDF bytes generated, size:', pdfBytes.length)
      
      updateProgress(90, 'Creating download blob')
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      console.log('Blob URL created:', url)
      
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
      console.error('PDF generation error:', error)
      
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
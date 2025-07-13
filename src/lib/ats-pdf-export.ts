// ATS-Friendly PDF Export Service
// Ensures PDF output is optimized for ATS parsing and compatibility

import { CvBuilderDocument } from '@/types/cv-builder'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface ATSPDFOptions {
  fontSize: number
  lineHeight: number
  margins: number
  fontFamily: 'arial' | 'times' | 'helvetica'
  includeATSOptimizations: boolean
  removeComplexFormatting: boolean
  ensureTextExtraction: boolean
  addMetadata: boolean
}

export interface ATSPDFResult {
  success: boolean
  blob?: Blob
  url?: string
  atsScore: number
  warnings: string[]
  optimizations: string[]
  error?: string
}

const DEFAULT_ATS_OPTIONS: ATSPDFOptions = {
  fontSize: 11,
  lineHeight: 1.3,
  margins: 50,
  fontFamily: 'times',
  includeATSOptimizations: true,
  removeComplexFormatting: true,
  ensureTextExtraction: true,
  addMetadata: true
}

// ATS-Safe fonts mapping
const ATS_SAFE_FONTS = {
  arial: StandardFonts.Helvetica,
  times: StandardFonts.TimesRoman,
  helvetica: StandardFonts.Helvetica
} as const

export class ATSPDFExporter {
  private cvData: CvBuilderDocument
  private options: ATSPDFOptions
  private optimizations: string[] = []
  private warnings: string[] = []

  constructor(cvData: CvBuilderDocument, options: Partial<ATSPDFOptions> = {}) {
    this.cvData = cvData
    this.options = { ...DEFAULT_ATS_OPTIONS, ...options }
  }

  async exportPDF(): Promise<ATSPDFResult> {
    try {
      // Validate CV data for ATS compatibility
      const validation = this.validateATSCompatibility()
      if (!validation.isValid) {
        return {
          success: false,
          atsScore: 0,
          warnings: validation.warnings,
          optimizations: [],
          error: 'CV data not ATS-compatible'
        }
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create()
      
      // Set metadata for ATS parsing
      if (this.options.addMetadata) {
        this.addATSMetadata(pdfDoc)
      }

      // Add pages and content
      await this.addContentToDocument(pdfDoc)

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false, // Better ATS compatibility
        addDefaultPage: false
      })

      // Create blob and URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      // Calculate ATS score
      const atsScore = this.calculateATSScore()

      return {
        success: true,
        blob,
        url,
        atsScore,
        warnings: this.warnings,
        optimizations: this.optimizations
      }

    } catch (error) {
      return {
        success: false,
        atsScore: 0,
        warnings: this.warnings,
        optimizations: this.optimizations,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      }
    }
  }

  private validateATSCompatibility(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    let isValid = true

    // Check required sections
    const requiredSections = ['summary', 'experience', 'education', 'skills']
    const presentSections = this.cvData.sections.map(s => s.type)
    
    requiredSections.forEach(section => {
      if (!presentSections.includes(section as any)) {
        warnings.push(`Missing required section: ${section}`)
        isValid = false
      }
    })

    // Check personal information
    if (!this.cvData.personal.fullName) {
      warnings.push('Full name is required')
      isValid = false
    }

    if (!this.cvData.personal.email) {
      warnings.push('Email address is required')
      isValid = false
    }

    if (!this.cvData.personal.phone) {
      warnings.push('Phone number is required')
      isValid = false
    }

    this.warnings.push(...warnings)
    return { isValid, warnings }
  }

  private addATSMetadata(pdfDoc: PDFDocument): void {
    const { personal } = this.cvData
    
    pdfDoc.setTitle(`${personal.fullName} - CV`)
    pdfDoc.setAuthor(personal.fullName)
    pdfDoc.setSubject('Curriculum Vitae')
    const keywords = [
      'CV', 'Resume', 'Curriculum Vitae',
      personal.title || 'Professional',
      'Dublin', 'Ireland',
      ...this.extractKeywords()
    ]
    pdfDoc.setKeywords(keywords)
    pdfDoc.setCreator('CVGenius - ATS Optimized')
    pdfDoc.setProducer('CVGenius ATS PDF Export')
    
    this.optimizations.push('Added ATS-friendly metadata')
  }

  private async addContentToDocument(pdfDoc: PDFDocument): Promise<void> {
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()
    
    // Load ATS-safe font
    const font = await pdfDoc.embedFont(ATS_SAFE_FONTS[this.options.fontFamily])
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    let currentY = height - this.options.margins
    const leftMargin = this.options.margins
    const rightMargin = width - this.options.margins
    const contentWidth = rightMargin - leftMargin

    // Header - Name and Contact
    currentY = await this.addHeader(page, font, boldFont, leftMargin, currentY, contentWidth)
    currentY -= 20

    // Add sections based on visibility and ATS best practices
    const visibleSections = this.cvData.sections.filter(section => 
      this.cvData.sectionVisibility?.[section.type as keyof typeof this.cvData.sectionVisibility] !== false
    )

    // Sort sections in ATS-friendly order
    const sectionOrder = ['summary', 'experience', 'skills', 'education', 'certifications', 'languages']
    const sortedSections = visibleSections.sort((a, b) => {
      const indexA = sectionOrder.indexOf(a.type)
      const indexB = sectionOrder.indexOf(b.type)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })

    for (const section of sortedSections) {
      currentY = await this.addSection(page, font, boldFont, section, leftMargin, currentY, contentWidth)
      currentY -= 15
    }

    this.optimizations.push('Used ATS-safe fonts and formatting')
    this.optimizations.push('Optimized section ordering for ATS parsing')
  }

  private async addHeader(page: any, font: any, boldFont: any, x: number, y: number, width: number): Promise<number> {
    const { personal } = this.cvData
    let currentY = y

    // Name (largest text, ATS priority)
    page.drawText(personal.fullName.toUpperCase(), {
      x,
      y: currentY,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0) // Pure black for ATS
    })
    currentY -= 25

    // Title
    if (personal.title) {
      page.drawText(personal.title, {
        x,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      })
      currentY -= 20
    }

    // Contact information in single line for ATS parsing
    const contactParts = [
      personal.email,
      personal.phone,
      personal.address
    ].filter(Boolean)

    if (contactParts.length > 0) {
      const contactText = contactParts.join(' • ')
      page.drawText(contactText, {
        x,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      })
      currentY -= 15
    }

    // LinkedIn and website
    const linkParts = [
      personal.linkedin,
      personal.website
    ].filter(Boolean)

    if (linkParts.length > 0) {
      const linkText = linkParts.join(' • ')
      page.drawText(linkText, {
        x,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      })
      currentY -= 15
    }

    return currentY
  }

  private async addSection(page: any, font: any, boldFont: any, section: any, x: number, y: number, width: number): Promise<number> {
    let currentY = y

    // Section header
    const sectionTitle = this.getSectionTitle(section.type)
    page.drawText(sectionTitle.toUpperCase(), {
      x,
      y: currentY,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    currentY -= 20

    // Section content
    switch (section.type) {
      case 'summary':
        currentY = this.addSummaryContent(page, font, section, x, currentY, width)
        break
      case 'experience':
        currentY = this.addExperienceContent(page, font, boldFont, section, x, currentY, width)
        break
      case 'education':
        currentY = this.addEducationContent(page, font, boldFont, section, x, currentY, width)
        break
      case 'skills':
        currentY = this.addSkillsContent(page, font, section, x, currentY, width)
        break
      case 'certifications':
        currentY = this.addCertificationsContent(page, font, section, x, currentY, width)
        break
      case 'languages':
        currentY = this.addLanguagesContent(page, font, section, x, currentY, width)
        break
    }

    return currentY
  }

  private addSummaryContent(page: any, font: any, section: any, x: number, y: number, width: number): number {
    if (section.markdown) {
      const text = this.cleanTextForATS(section.markdown)
      return this.addWrappedText(page, font, text, x, y, width, 10)
    }
    return y
  }

  private addExperienceContent(page: any, font: any, boldFont: any, section: any, x: number, y: number, width: number): number {
    let currentY = y

    if (section.items && section.items.length > 0) {
      section.items.forEach((exp: any) => {
        // Job title and company
        const titleLine = `${exp.role} - ${exp.company}`
        page.drawText(titleLine, {
          x,
          y: currentY,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0)
        })
        currentY -= 15

        // Dates
        const dateText = `${exp.start} - ${exp.end || 'Present'}`
        page.drawText(dateText, {
          x,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        })
        currentY -= 15

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet: string) => {
            const cleanBullet = this.cleanTextForATS(bullet)
            page.drawText(`• ${cleanBullet}`, {
              x: x + 10,
              y: currentY,
              size: 10,
              font: font,
              color: rgb(0, 0, 0)
            })
            currentY -= 12
          })
        }
        currentY -= 10
      })
    }

    return currentY
  }

  private addEducationContent(page: any, font: any, boldFont: any, section: any, x: number, y: number, width: number): number {
    let currentY = y

    if (section.items && section.items.length > 0) {
      section.items.forEach((edu: any) => {
        // Degree and institution
        const eduLine = `${edu.degree} - ${edu.institution}`
        page.drawText(eduLine, {
          x,
          y: currentY,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0)
        })
        currentY -= 15

        // Field and dates
        const detailParts = [
          edu.field,
          `${edu.start || ''} - ${edu.end || ''}`
        ].filter(Boolean)

        if (detailParts.length > 0) {
          page.drawText(detailParts.join(' • '), {
            x,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          })
          currentY -= 15
        }
        currentY -= 5
      })
    }

    return currentY
  }

  private addSkillsContent(page: any, font: any, section: any, x: number, y: number, width: number): number {
    if (section.items && section.items.length > 0) {
      // Join skills with commas for better ATS parsing
      const skillsText = section.items.join(', ')
      return this.addWrappedText(page, font, skillsText, x, y, width, 10)
    }
    return y
  }

  private addCertificationsContent(page: any, font: any, section: any, x: number, y: number, width: number): number {
    let currentY = y

    if (section.items && section.items.length > 0) {
      section.items.forEach((cert: any) => {
        const certText = typeof cert === 'string' ? cert : `${cert.name} - ${cert.issuer}`
        page.drawText(`• ${certText}`, {
          x,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        })
        currentY -= 12
      })
    }

    return currentY
  }

  private addLanguagesContent(page: any, font: any, section: any, x: number, y: number, width: number): number {
    let currentY = y

    if (section.items && section.items.length > 0) {
      section.items.forEach((lang: any) => {
        const langText = typeof lang === 'string' ? lang : `${lang.language} - ${lang.level}`
        page.drawText(`• ${langText}`, {
          x,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        })
        currentY -= 12
      })
    }

    return currentY
  }

  private addWrappedText(page: any, font: any, text: string, x: number, y: number, width: number, fontSize: number): number {
    // Simple text wrapping for ATS compatibility
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)
      
      if (textWidth <= width) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          lines.push(word)
        }
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    let currentY = y
    lines.forEach(line => {
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      })
      currentY -= fontSize * this.options.lineHeight
    })

    return currentY
  }

  private getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      certifications: 'Certifications',
      languages: 'Languages',
      volunteer: 'Volunteer Experience',
      awards: 'Awards',
      publications: 'Publications',
      references: 'References'
    }
    return titles[sectionType] || sectionType
  }

  private cleanTextForATS(text: string): string {
    // Remove markdown and complex formatting for ATS compatibility
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links, keep text
      .replace(/#{1,6}\s*/g, '')       // Remove markdown headers
      .replace(/`([^`]*)`/g, '$1')     // Remove code blocks
      .replace(/\n+/g, ' ')            // Replace newlines with spaces
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim()
  }

  private extractKeywords(): string[] {
    const keywords: string[] = []
    
    // Extract from title
    if (this.cvData.personal.title) {
      keywords.push(...this.cvData.personal.title.split(' '))
    }

    // Extract from skills
    const skillsSection = this.cvData.sections.find(s => s.type === 'skills')
    if (skillsSection && 'items' in skillsSection) {
      keywords.push(...skillsSection.items)
    }

    // Extract from experience
    const experienceSection = this.cvData.sections.find(s => s.type === 'experience')
    if (experienceSection && 'items' in experienceSection) {
      experienceSection.items.forEach((exp: any) => {
        if (exp.role) keywords.push(...exp.role.split(' '))
        if (exp.company) keywords.push(...exp.company.split(' '))
      })
    }

    return keywords.filter(k => k.length > 2).slice(0, 20)
  }

  private calculateATSScore(): number {
    let score = 100

    // Deduct points for missing elements
    if (!this.cvData.personal.fullName) score -= 20
    if (!this.cvData.personal.email) score -= 15
    if (!this.cvData.personal.phone) score -= 15

    const requiredSections = ['summary', 'experience', 'education', 'skills']
    const presentSections = this.cvData.sections.map(s => s.type)
    
    requiredSections.forEach(section => {
      if (!presentSections.includes(section as any)) {
        score -= 15
      }
    })

    // Bonus points for ATS optimizations
    if (this.options.includeATSOptimizations) score += 5
    if (this.options.ensureTextExtraction) score += 5

    return Math.max(0, Math.min(100, score))
  }
}

// Export utility functions
export async function exportATSFriendlyPDF(cvData: CvBuilderDocument, options?: Partial<ATSPDFOptions>): Promise<ATSPDFResult> {
  const exporter = new ATSPDFExporter(cvData, options)
  return await exporter.exportPDF()
}

export function validateCVForATS(cvData: CvBuilderDocument): { isValid: boolean; issues: string[]; score: number } {
  const exporter = new ATSPDFExporter(cvData)
  const score = exporter['calculateATSScore']()
  const validation = exporter['validateATSCompatibility']()
  
  return {
    isValid: validation.isValid,
    issues: validation.warnings,
    score
  }
} 
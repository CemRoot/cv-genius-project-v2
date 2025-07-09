// PDF Generator for CVGenius Mobile
// Generate high-quality PDFs from scanned CVs and structured data

import { jsPDF } from 'jspdf'
import type { ParsedCVData } from './ai-cv-parser'

export interface PDFGenerationOptions {
  template: 'modern' | 'classic' | 'minimal' | 'dublin-tech' | 'dublin-corporate'
  includePhoto: boolean
  colorScheme: 'blue' | 'green' | 'purple' | 'dark' | 'professional'
  fontSize: 'small' | 'medium' | 'large'
  pageMargins: 'narrow' | 'normal' | 'wide'
  includeBranding: boolean
  optimizeForATS: boolean
  dublinFocus: boolean
}

export interface PDFGenerationResult {
  success: boolean
  blob?: Blob
  url?: string
  fileName: string
  error?: string
  size: number
  pageCount: number
}

const defaultOptions: PDFGenerationOptions = {
  template: 'modern',
  includePhoto: false,
  colorScheme: 'blue',
  fontSize: 'medium',
  pageMargins: 'normal',
  includeBranding: true,
  optimizeForATS: true,
  dublinFocus: true
}

// Color schemes
const COLOR_SCHEMES = {
  blue: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    text: '#1f2937',
    light: '#eff6ff'
  },
  green: {
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    text: '#1f2937',
    light: '#ecfdf5'
  },
  purple: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    text: '#1f2937',
    light: '#f3f4f6'
  },
  dark: {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#6b7280',
    text: '#111827',
    light: '#f9fafb'
  },
  professional: {
    primary: '#1e40af',
    secondary: '#3730a3',
    accent: '#5b21b6',
    text: '#1f2937',
    light: '#f8fafc'
  }
}

// Font sizes
const FONT_SIZES = {
  small: {
    title: 16,
    heading: 12,
    subheading: 10,
    body: 8,
    caption: 7
  },
  medium: {
    title: 18,
    heading: 14,
    subheading: 11,
    body: 9,
    caption: 8
  },
  large: {
    title: 20,
    heading: 16,
    subheading: 12,
    body: 10,
    caption: 9
  }
}

// Page margins
const PAGE_MARGINS = {
  narrow: { top: 15, bottom: 15, left: 15, right: 15 },
  normal: { top: 20, bottom: 20, left: 20, right: 20 },
  wide: { top: 25, bottom: 25, left: 25, right: 25 }
}

export class PDFGenerator {
  private doc: jsPDF
  private options: PDFGenerationOptions
  private colors: typeof COLOR_SCHEMES.blue
  private fonts: typeof FONT_SIZES.medium
  private margins: typeof PAGE_MARGINS.normal
  private currentY: number = 0
  private pageWidth: number
  private pageHeight: number
  private contentWidth: number

  constructor(options: Partial<PDFGenerationOptions> = {}) {
    this.options = { ...defaultOptions, ...options }
    this.doc = new jsPDF('portrait', 'mm', 'a4')
    this.colors = COLOR_SCHEMES[this.options.colorScheme]
    this.fonts = FONT_SIZES[this.options.fontSize]
    this.margins = PAGE_MARGINS[this.options.pageMargins]
    
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right
    this.currentY = this.margins.top
  }

  async generateFromParsedData(data: ParsedCVData): Promise<PDFGenerationResult> {
    try {
      this.setupDocument()
      
      // Generate content based on template
      switch (this.options.template) {
        case 'modern':
          await this.generateModernTemplate(data)
          break
        case 'classic':
          await this.generateClassicTemplate(data)
          break
        case 'minimal':
          await this.generateMinimalTemplate(data)
          break
        case 'dublin-tech':
          await this.generateDublinTechTemplate(data)
          break
        case 'dublin-corporate':
          await this.generateDublinCorporateTemplate(data)
          break
      }

      // Add branding if enabled
      if (this.options.includeBranding) {
        this.addBranding()
      }

      // Generate blob
      const blob = new Blob([this.doc.output('blob')], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const fileName = `${data.personalInfo.name || 'CV'}_${Date.now()}.pdf`

      return {
        success: true,
        blob,
        url,
        fileName,
        size: blob.size,
        pageCount: this.doc.getNumberOfPages()
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
      return {
        success: false,
        fileName: 'cv.pdf',
        error: error instanceof Error ? error.message : 'Unknown error',
        size: 0,
        pageCount: 0
      }
    }
  }

  async generateFromScan(imageData: string, parsedData?: ParsedCVData): Promise<PDFGenerationResult> {
    try {
      this.setupDocument()

      if (parsedData) {
        // Use AI-parsed data to create a clean PDF
        await this.generateModernTemplate(parsedData)
      } else {
        // Just include the scanned image
        await this.addScannedImage(imageData)
      }

      if (this.options.includeBranding) {
        this.addBranding()
      }

      const blob = new Blob([this.doc.output('blob')], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const fileName = `Scanned_CV_${Date.now()}.pdf`

      return {
        success: true,
        blob,
        url,
        fileName,
        size: blob.size,
        pageCount: this.doc.getNumberOfPages()
      }
    } catch (error) {
      console.error('PDF generation from scan failed:', error)
      return {
        success: false,
        fileName: 'scanned_cv.pdf',
        error: error instanceof Error ? error.message : 'Unknown error',
        size: 0,
        pageCount: 0
      }
    }
  }

  private setupDocument() {
    // Set document properties
    this.doc.setProperties({
      title: 'Professional CV',
      subject: 'Curriculum Vitae',
      author: 'CVGenius',
      creator: 'CVGenius Mobile',
      producer: 'CVGenius PDF Generator'
    })

    // Set initial font
    this.doc.setFont('helvetica', 'normal')
  }

  private async generateModernTemplate(data: ParsedCVData) {
    // Header with name and contact info
    this.addHeader(data)
    
    // Professional summary
    if (data.summary) {
      this.addSection('Professional Summary', data.summary)
    }

    // Experience
    if (data.experience.length > 0) {
      this.addExperienceSection(data.experience)
    }

    // Skills (in sidebar or main content)
    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      this.addSkillsSection(data.skills)
    }

    // Education
    if (data.education.length > 0) {
      this.addEducationSection(data.education)
    }

    // Projects
    if (data.projects.length > 0) {
      this.addProjectsSection(data.projects)
    }

    // Certifications
    if (data.certifications.length > 0) {
      this.addCertificationsSection(data.certifications)
    }

    // Awards
    if (data.awards.length > 0) {
      this.addAwardsSection(data.awards)
    }
  }

  private async generateClassicTemplate(data: ParsedCVData) {
    // Classic single-column layout
    this.addClassicHeader(data)
    
    if (data.summary) {
      this.addClassicSection('Objective', data.summary)
    }

    if (data.experience.length > 0) {
      this.addClassicExperienceSection(data.experience)
    }

    if (data.education.length > 0) {
      this.addClassicEducationSection(data.education)
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      this.addClassicSkillsSection(data.skills)
    }
  }

  private async generateMinimalTemplate(data: ParsedCVData) {
    // Ultra-clean minimal design
    this.addMinimalHeader(data)
    
    if (data.experience.length > 0) {
      this.addMinimalExperienceSection(data.experience)
    }

    if (data.education.length > 0) {
      this.addMinimalEducationSection(data.education)
    }

    if (data.skills.technical.length > 0) {
      this.addMinimalSkillsSection(data.skills)
    }
  }

  private async generateDublinTechTemplate(data: ParsedCVData) {
    // Dublin tech industry focused
    this.addTechHeader(data)
    
    if (data.summary) {
      this.addTechSection('Technical Profile', data.summary)
    }

    // Prioritize technical skills
    if (data.skills.technical.length > 0) {
      this.addTechSkillsSection(data.skills)
    }

    if (data.experience.length > 0) {
      this.addTechExperienceSection(data.experience)
    }

    if (data.projects.length > 0) {
      this.addTechProjectsSection(data.projects)
    }

    if (data.education.length > 0) {
      this.addTechEducationSection(data.education)
    }
  }

  private async generateDublinCorporateTemplate(data: ParsedCVData) {
    // Dublin corporate/finance focused
    this.addCorporateHeader(data)
    
    if (data.summary) {
      this.addCorporateSection('Executive Summary', data.summary)
    }

    if (data.experience.length > 0) {
      this.addCorporateExperienceSection(data.experience)
    }

    if (data.education.length > 0) {
      this.addCorporateEducationSection(data.education)
    }

    if (data.certifications.length > 0) {
      this.addCorporateCertificationsSection(data.certifications)
    }

    if (data.skills.soft.length > 0 || data.skills.technical.length > 0) {
      this.addCorporateSkillsSection(data.skills)
    }
  }

  private addHeader(data: ParsedCVData) {
    const { personalInfo } = data

    // Name
    this.doc.setFontSize(this.fonts.title)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    
    const nameWidth = this.doc.getTextWidth(personalInfo.name)
    const nameX = (this.pageWidth - nameWidth) / 2
    this.doc.text(personalInfo.name, nameX, this.currentY)
    this.currentY += 8

    // Contact info
    this.doc.setFontSize(this.fonts.body)
    this.doc.setTextColor(this.colors.text)
    this.doc.setFont('helvetica', 'normal')

    const contactInfo = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location
    ].filter(Boolean).join(' • ')

    if (contactInfo) {
      const contactWidth = this.doc.getTextWidth(contactInfo)
      const contactX = (this.pageWidth - contactWidth) / 2
      this.doc.text(contactInfo, contactX, this.currentY)
      this.currentY += 5
    }

    // Social links
    const socialLinks = [
      personalInfo.linkedin,
      personalInfo.github,
      personalInfo.website
    ].filter(Boolean)

    if (socialLinks.length > 0) {
      this.doc.setTextColor(this.colors.secondary)
      const socialText = socialLinks.join(' • ')
      const socialWidth = this.doc.getTextWidth(socialText)
      const socialX = (this.pageWidth - socialWidth) / 2
      this.doc.text(socialText, socialX, this.currentY)
      this.currentY += 5
    }

    // Add separator line
    this.doc.setDrawColor(this.colors.accent)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margins.left, this.currentY + 2, this.pageWidth - this.margins.right, this.currentY + 2)
    this.currentY += 8
  }

  private addSection(title: string, content: string) {
    this.checkPageBreak(20)

    // Section title
    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margins.left, this.currentY)
    this.currentY += 6

    // Content
    this.doc.setFontSize(this.fonts.body)
    this.doc.setTextColor(this.colors.text)
    this.doc.setFont('helvetica', 'normal')

    const lines = this.doc.splitTextToSize(content, this.contentWidth)
    lines.forEach((line: string) => {
      this.checkPageBreak(5)
      this.doc.text(line, this.margins.left, this.currentY)
      this.currentY += 4
    })

    this.currentY += 4
  }

  private addExperienceSection(experience: ParsedCVData['experience']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Professional Experience', this.margins.left, this.currentY)
    this.currentY += 8

    experience.forEach((exp, index) => {
      this.checkPageBreak(25)

      // Position and company
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(exp.position, this.margins.left, this.currentY)
      
      // Dates (right aligned)
      const dateText = `${exp.startDate} - ${exp.endDate}`
      const dateWidth = this.doc.getTextWidth(dateText)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(this.colors.secondary)
      this.doc.text(dateText, this.pageWidth - this.margins.right - dateWidth, this.currentY)
      this.currentY += 5

      // Company
      this.doc.setFontSize(this.fonts.body)
      this.doc.setTextColor(this.colors.secondary)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(exp.company, this.margins.left, this.currentY)
      this.currentY += 5

      // Description
      if (exp.description) {
        this.doc.setFont('helvetica', 'normal')
        this.doc.setTextColor(this.colors.text)
        const descLines = this.doc.splitTextToSize(exp.description, this.contentWidth)
        descLines.forEach((line: string) => {
          this.checkPageBreak(4)
          this.doc.text(line, this.margins.left, this.currentY)
          this.currentY += 4
        })
      }

      // Achievements
      if (exp.achievements.length > 0) {
        this.currentY += 2
        exp.achievements.forEach(achievement => {
          this.checkPageBreak(4)
          this.doc.text('• ' + achievement, this.margins.left + 3, this.currentY)
          this.currentY += 4
        })
      }

      if (index < experience.length - 1) {
        this.currentY += 6
      }
    })

    this.currentY += 8
  }

  private addSkillsSection(skills: ParsedCVData['skills']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Skills', this.margins.left, this.currentY)
    this.currentY += 8

    // Technical skills
    if (skills.technical.length > 0) {
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Technical Skills', this.margins.left, this.currentY)
      this.currentY += 5

      this.doc.setFontSize(this.fonts.body)
      this.doc.setFont('helvetica', 'normal')
      const techText = skills.technical.join(', ')
      const techLines = this.doc.splitTextToSize(techText, this.contentWidth)
      techLines.forEach((line: string) => {
        this.checkPageBreak(4)
        this.doc.text(line, this.margins.left, this.currentY)
        this.currentY += 4
      })
      this.currentY += 4
    }

    // Soft skills
    if (skills.soft.length > 0) {
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Core Competencies', this.margins.left, this.currentY)
      this.currentY += 5

      this.doc.setFontSize(this.fonts.body)
      this.doc.setFont('helvetica', 'normal')
      const softText = skills.soft.join(', ')
      const softLines = this.doc.splitTextToSize(softText, this.contentWidth)
      softLines.forEach((line: string) => {
        this.checkPageBreak(4)
        this.doc.text(line, this.margins.left, this.currentY)
        this.currentY += 4
      })
      this.currentY += 4
    }

    // Languages
    if (skills.languages.length > 0) {
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Languages', this.margins.left, this.currentY)
      this.currentY += 5

      this.doc.setFontSize(this.fonts.body)
      this.doc.setFont('helvetica', 'normal')
      skills.languages.forEach(lang => {
        this.checkPageBreak(4)
        this.doc.text(`${lang.language} (${lang.proficiency})`, this.margins.left, this.currentY)
        this.currentY += 4
      })
    }

    this.currentY += 4
  }

  private addEducationSection(education: ParsedCVData['education']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Education', this.margins.left, this.currentY)
    this.currentY += 8

    education.forEach((edu, index) => {
      this.checkPageBreak(15)

      // Degree
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(edu.degree, this.margins.left, this.currentY)

      // Dates
      const dateText = `${edu.startDate} - ${edu.endDate}`
      const dateWidth = this.doc.getTextWidth(dateText)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(this.colors.secondary)
      this.doc.text(dateText, this.pageWidth - this.margins.right - dateWidth, this.currentY)
      this.currentY += 5

      // Institution
      this.doc.setFontSize(this.fonts.body)
      this.doc.setTextColor(this.colors.secondary)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(edu.institution, this.margins.left, this.currentY)
      this.currentY += 4

      // Field and grade
      if (edu.field || edu.grade) {
        this.doc.setFont('helvetica', 'normal')
        this.doc.setTextColor(this.colors.text)
        const details = [edu.field, edu.grade ? `Grade: ${edu.grade}` : ''].filter(Boolean).join(' • ')
        this.doc.text(details, this.margins.left, this.currentY)
        this.currentY += 4
      }

      if (index < education.length - 1) {
        this.currentY += 4
      }
    })

    this.currentY += 8
  }

  private addProjectsSection(projects: ParsedCVData['projects']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Notable Projects', this.margins.left, this.currentY)
    this.currentY += 8

    projects.forEach((project, index) => {
      this.checkPageBreak(15)

      // Project name
      this.doc.setFontSize(this.fonts.subheading)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(project.name, this.margins.left, this.currentY)
      this.currentY += 5

      // Description
      this.doc.setFontSize(this.fonts.body)
      this.doc.setFont('helvetica', 'normal')
      const descLines = this.doc.splitTextToSize(project.description, this.contentWidth)
      descLines.forEach((line: string) => {
        this.checkPageBreak(4)
        this.doc.text(line, this.margins.left, this.currentY)
        this.currentY += 4
      })

      // Technologies
      if (project.technologies.length > 0) {
        this.doc.setTextColor(this.colors.secondary)
        this.doc.text('Technologies: ' + project.technologies.join(', '), this.margins.left, this.currentY)
        this.currentY += 4
      }

      // URL
      if (project.url) {
        this.doc.setTextColor(this.colors.secondary)
        this.doc.text('URL: ' + project.url, this.margins.left, this.currentY)
        this.currentY += 4
      }

      if (index < projects.length - 1) {
        this.currentY += 4
      }
    })

    this.currentY += 8
  }

  private addCertificationsSection(certifications: ParsedCVData['certifications']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Certifications', this.margins.left, this.currentY)
    this.currentY += 8

    certifications.forEach((cert, index) => {
      this.checkPageBreak(8)

      this.doc.setFontSize(this.fonts.body)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'normal')
      
      const certText = `${cert.name} - ${cert.issuer} (${cert.date})`
      this.doc.text(certText, this.margins.left, this.currentY)
      this.currentY += 5
    })

    this.currentY += 8
  }

  private addAwardsSection(awards: ParsedCVData['awards']) {
    this.checkPageBreak(20)

    this.doc.setFontSize(this.fonts.heading)
    this.doc.setTextColor(this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Awards & Recognition', this.margins.left, this.currentY)
    this.currentY += 8

    awards.forEach((award, index) => {
      this.checkPageBreak(8)

      this.doc.setFontSize(this.fonts.body)
      this.doc.setTextColor(this.colors.text)
      this.doc.setFont('helvetica', 'normal')
      
      const awardText = `${award.name} - ${award.issuer} (${award.date})`
      this.doc.text(awardText, this.margins.left, this.currentY)
      this.currentY += 5
    })

    this.currentY += 8
  }

  private async addScannedImage(imageData: string) {
    try {
      // Add the scanned image to the PDF
      const imgWidth = this.contentWidth
      const imgHeight = (imgWidth * 3) / 4 // Assume 4:3 aspect ratio

      this.doc.addImage(imageData, 'JPEG', this.margins.left, this.currentY, imgWidth, imgHeight)
      this.currentY += imgHeight + 10
    } catch (error) {
      console.error('Failed to add scanned image:', error)
      // Add error message instead
      this.doc.setFontSize(this.fonts.body)
      this.doc.setTextColor('#ef4444')
      this.doc.text('Error: Could not include scanned image', this.margins.left, this.currentY)
      this.currentY += 10
    }
  }

  private addBranding() {
    // Add CVGenius branding at the bottom
    const brandingY = this.pageHeight - 10
    this.doc.setFontSize(this.fonts.caption)
    this.doc.setTextColor('#9ca3af')
    this.doc.setFont('helvetica', 'normal')
    
    const brandingText = 'Generated by CVGenius Mobile - cvgenius.ie'
    const brandingWidth = this.doc.getTextWidth(brandingText)
    const brandingX = (this.pageWidth - brandingWidth) / 2
    
    this.doc.text(brandingText, brandingX, brandingY)
  }

  private checkPageBreak(requiredSpace: number) {
    // Check if we need a page break (leaving space for bottom margin)
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom - 20) {
      this.doc.addPage()
      // Reset Y position to top margin for the new page
      this.currentY = this.margins.top
      
      // Ensure consistent top margin on all pages (15mm = ~42.5 points)
      const topMarginMm = 15
      const topMarginPoints = topMarginMm * 72 / 25.4 // Convert mm to points
      this.currentY = topMarginPoints
    }
  }

  // Template-specific methods (simplified versions)
  private addClassicHeader(data: ParsedCVData) {
    // Similar to addHeader but with classic styling
    this.addHeader(data)
  }

  private addClassicSection(title: string, content: string) {
    this.addSection(title, content)
  }

  private addClassicExperienceSection(experience: ParsedCVData['experience']) {
    this.addExperienceSection(experience)
  }

  private addClassicEducationSection(education: ParsedCVData['education']) {
    this.addEducationSection(education)
  }

  private addClassicSkillsSection(skills: ParsedCVData['skills']) {
    this.addSkillsSection(skills)
  }

  private addMinimalHeader(data: ParsedCVData) {
    this.addHeader(data)
  }

  private addMinimalExperienceSection(experience: ParsedCVData['experience']) {
    this.addExperienceSection(experience)
  }

  private addMinimalEducationSection(education: ParsedCVData['education']) {
    this.addEducationSection(education)
  }

  private addMinimalSkillsSection(skills: ParsedCVData['skills']) {
    this.addSkillsSection(skills)
  }

  private addTechHeader(data: ParsedCVData) {
    this.addHeader(data)
  }

  private addTechSection(title: string, content: string) {
    this.addSection(title, content)
  }

  private addTechSkillsSection(skills: ParsedCVData['skills']) {
    this.addSkillsSection(skills)
  }

  private addTechExperienceSection(experience: ParsedCVData['experience']) {
    this.addExperienceSection(experience)
  }

  private addTechProjectsSection(projects: ParsedCVData['projects']) {
    this.addProjectsSection(projects)
  }

  private addTechEducationSection(education: ParsedCVData['education']) {
    this.addEducationSection(education)
  }

  private addCorporateHeader(data: ParsedCVData) {
    this.addHeader(data)
  }

  private addCorporateSection(title: string, content: string) {
    this.addSection(title, content)
  }

  private addCorporateExperienceSection(experience: ParsedCVData['experience']) {
    this.addExperienceSection(experience)
  }

  private addCorporateEducationSection(education: ParsedCVData['education']) {
    this.addEducationSection(education)
  }

  private addCorporateCertificationsSection(certifications: ParsedCVData['certifications']) {
    this.addCertificationsSection(certifications)
  }

  private addCorporateSkillsSection(skills: ParsedCVData['skills']) {
    this.addSkillsSection(skills)
  }
}

// Export convenience functions
export async function generatePDFFromParsedData(
  data: ParsedCVData, 
  options?: Partial<PDFGenerationOptions>
): Promise<PDFGenerationResult> {
  const generator = new PDFGenerator(options)
  return generator.generateFromParsedData(data)
}

export async function generatePDFFromScan(
  imageData: string,
  parsedData?: ParsedCVData,
  options?: Partial<PDFGenerationOptions>
): Promise<PDFGenerationResult> {
  const generator = new PDFGenerator(options)
  return generator.generateFromScan(imageData, parsedData)
}

export default PDFGenerator
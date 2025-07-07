import { CVData, CVSection } from '@/types/cv'

export interface TemplateStructure {
  sections: string[]
  layout: 'single-column' | 'two-column' | 'mixed'
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    section: string
    item: string
    line: string
  }
}

export interface CVTemplate {
  id: string
  name: string
  description: string
  thumbnailUrl?: string
  isPremium: boolean
  popularity: number
  categories: string[]
  structure: TemplateStructure
  validate: (data: Partial<CVData>) => string[]
  render: (data: CVData) => string
  getCSS: () => string
}

export class IrishCVTemplateManager {
  private templates: Map<string, CVTemplate> = new Map()
  private currentTemplate: CVTemplate | null = null
  
  constructor() {
    this.initializeTemplates()
  }
  
  private initializeTemplates() {
    // Dublin Tech Template
    this.registerTemplate({
      id: 'dublin-tech',
      name: 'Dublin Tech Professional',
      description: 'Optimized for Dublin\'s thriving tech scene - perfect for Google, Meta, LinkedIn',
      isPremium: false,
      popularity: 98,
      categories: ['tech', 'modern', 'dublin'],
      structure: {
        sections: ['header', 'summary', 'experience', 'skills', 'education', 'projects'],
        layout: 'two-column',
        colorScheme: {
          primary: '#2563eb',
          secondary: '#f3f4f6',
          accent: '#3b82f6',
          text: '#111827',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '1.5rem',
          item: '1rem',
          line: '1.5'
        }
      },
      validate: this.validateDublinTech.bind(this),
      render: this.renderDublinTech.bind(this),
      getCSS: this.getDublinTechCSS.bind(this)
    })
    
    // Irish Finance Template
    this.registerTemplate({
      id: 'irish-finance',
      name: 'Irish Finance Expert',
      description: 'Tailored for IFSC roles - ideal for banking, fintech, and insurance',
      isPremium: false,
      popularity: 95,
      categories: ['finance', 'professional', 'dublin'],
      structure: {
        sections: ['header', 'profile', 'experience', 'education', 'qualifications', 'skills'],
        layout: 'single-column',
        colorScheme: {
          primary: '#166534',
          secondary: '#f0fdf4',
          accent: '#16a34a',
          text: '#111827',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Georgia, serif',
          body: 'Georgia, serif'
        },
        spacing: {
          section: '2rem',
          item: '1.2rem',
          line: '1.6'
        }
      },
      validate: this.validateIrishFinance.bind(this),
      render: this.renderIrishFinance.bind(this),
      getCSS: this.getIrishFinanceCSS.bind(this)
    })
    
    // Classic ATS-Friendly Template
    this.registerTemplate({
      id: 'classic',
      name: 'Classic Professional',
      description: 'Traditional ATS-friendly format - widely accepted across all Irish industries',
      isPremium: false,
      popularity: 99,
      categories: ['classic', 'ats-friendly', 'traditional'],
      structure: {
        sections: ['header', 'summary', 'skills', 'experience', 'education'],
        layout: 'single-column',
        colorScheme: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#333333',
          text: '#000000',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Arial, sans-serif'
        },
        spacing: {
          section: '1.5rem',
          item: '1rem',
          line: '1.4'
        }
      },
      validate: this.validateClassic.bind(this),
      render: this.renderClassic.bind(this),
      getCSS: this.getClassicCSS.bind(this)
    })
    
    // Dublin Pharma Template
    this.registerTemplate({
      id: 'dublin-pharma',
      name: 'Dublin Pharma Professional',
      description: 'Perfect for Ireland\'s pharmaceutical and medical device industry',
      isPremium: false,
      popularity: 92,
      categories: ['technical', 'pharma', 'dublin'],
      structure: {
        sections: ['header', 'profile', 'experience', 'technical', 'education', 'certifications'],
        layout: 'single-column',
        colorScheme: {
          primary: '#0d9488',
          secondary: '#f0fdfa',
          accent: '#14b8a6',
          text: '#111827',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Roboto, sans-serif',
          body: 'Roboto, sans-serif'
        },
        spacing: {
          section: '1.5rem',
          item: '1rem',
          line: '1.5'
        }
      },
      validate: this.validateDublinPharma.bind(this),
      render: this.renderDublinPharma.bind(this),
      getCSS: this.getDublinPharmaCSS.bind(this)
    })
    
    // Add more templates...
  }
  
  registerTemplate(template: CVTemplate) {
    this.templates.set(template.id, template)
  }
  
  selectTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (template) {
      this.currentTemplate = template
      return true
    }
    return false
  }
  
  getAllTemplates(): CVTemplate[] {
    return Array.from(this.templates.values())
  }
  
  getTemplatesByCategory(category: string): CVTemplate[] {
    return this.getAllTemplates().filter(t => t.categories.includes(category))
  }
  
  renderCV(data: CVData): string {
    if (!this.currentTemplate) {
      throw new Error('No template selected')
    }
    return this.currentTemplate.render(data)
  }
  
  validateCV(data: Partial<CVData>): string[] {
    if (!this.currentTemplate) {
      throw new Error('No template selected')
    }
    return this.currentTemplate.validate(data)
  }
  
  getTemplateCSS(): string {
    if (!this.currentTemplate) {
      throw new Error('No template selected')
    }
    return this.currentTemplate.getCSS()
  }
  
  // Template-specific validation functions
  private validateDublinTech(data: Partial<CVData>): string[] {
    const errors: string[] = []
    
    // Tech-specific validations
    if (!data.skills || data.skills.length < 5) {
      errors.push('Tech roles require at least 5 technical skills')
    }
    
    if (data.skills && !data.skills.some(s => s.category === 'Technical')) {
      errors.push('Please include technical skills for tech roles')
    }
    
    // Check for GitHub/Portfolio links
    if (!data.personal?.github && !data.personal?.portfolio) {
      errors.push('Tech CVs should include GitHub or portfolio links')
    }
    
    return errors
  }
  
  private validateIrishFinance(data: Partial<CVData>): string[] {
    const errors: string[] = []
    
    // Finance-specific validations
    if (!data.certifications || data.certifications.length === 0) {
      errors.push('Finance roles typically require professional certifications (e.g., ACA, ACCA, CFA)')
    }
    
    // Check for quantifiable achievements
    if (data.experience) {
      const hasMetrics = data.experience.some(exp => 
        exp.achievements.some(a => /\d+%|\$|€|£/.test(a))
      )
      if (!hasMetrics) {
        errors.push('Finance CVs should include quantifiable achievements (percentages, amounts)')
      }
    }
    
    return errors
  }
  
     private validateClassic(data: Partial<CVData>): string[] {
     const errors: string[] = []
     
     // Classic-specific validations
     if (!data.skills || data.skills.length < 3) {
       errors.push('Classic CVs require at least 3 skills')
     }
     
     if (data.skills && !data.skills.some(s => s.category === 'Technical' || s.category === 'Software')) {
       errors.push('Please include technical or software skills for classic CVs')
     }
     
     // Check for quantifiable achievements
     if (data.experience) {
       const hasMetrics = data.experience.some(exp => 
         exp.achievements.some(a => /\d+%|\$|€|£/.test(a))
       )
       if (!hasMetrics) {
         errors.push('Classic CVs should include quantifiable achievements (percentages, amounts)')
       }
     }
     
     return errors
   }
  
  private validateDublinPharma(data: Partial<CVData>): string[] {
    const errors: string[] = []
    
    // Pharma-specific validations
    if (!data.certifications || data.certifications.length === 0) {
      errors.push('Pharmaceutical roles typically require certifications (e.g., GMP, GDP, regulatory compliance)')
    }
    
    // Check for technical/scientific skills
    if (data.skills && !data.skills.some(s => s.category === 'Technical' || s.category === 'Software')) {
      errors.push('Pharma CVs should include technical or scientific skills')
    }
    
    // Check for industry-specific keywords
    if (data.experience) {
      const hasIndustryTerms = data.experience.some(exp => 
        exp.description.toLowerCase().includes('gmp') || 
        exp.description.toLowerCase().includes('validation') ||
        exp.description.toLowerCase().includes('compliance') ||
        exp.description.toLowerCase().includes('regulatory')
      )
      if (!hasIndustryTerms) {
        errors.push('Consider including pharmaceutical industry terms (GMP, validation, compliance)')
      }
    }
    
    return errors
  }
  
  // Template rendering functions
  private renderDublinTech(data: CVData): string {
    // Use sections array if available, otherwise use default sections
    const sections = data.sections && data.sections.length > 0 
      ? data.sections 
      : this.getDefaultSections()
    
    // Sort sections by order and filter visible ones (exclude sidebar sections)
    const visibleSections = sections
      .filter(section => section.visible && !['skills', 'languages'].includes(section.type))
      .sort((a, b) => a.order - b.order)
    
    // Render dynamic sections for main content
    const sectionHTML = visibleSections
      .map(section => this.getSectionRenderer(section.type)(data))
      .filter(html => html.trim() !== '') // Remove empty sections
      .join('')

    return `
      <div class="cv-container dublin-tech">
        <div class="cv-sidebar">
          <div class="sidebar-section">
            <h1 class="name">${data.personal.fullName}</h1>
            <p class="title">${data.personal.title || 'Software Developer'}</p>
          </div>
          
          <div class="sidebar-section contact">
            <h2>Contact</h2>
            <p><i class="icon-email"></i> ${data.personal.email}</p>
            <p><i class="icon-phone"></i> ${data.personal.phone}</p>
            <p><i class="icon-location"></i> ${data.personal.address}</p>
            ${data.personal.nationality ? `<p><i class="icon-visa"></i> ${data.personal.nationality}</p>` : ''}
            ${data.personal.github ? `<p><i class="icon-github"></i> ${data.personal.github}</p>` : ''}
            ${data.personal.portfolio ? `<p><i class="icon-web"></i> ${data.personal.portfolio}</p>` : ''}
          </div>
          
          ${this.isSectionVisible(data.sections, 'skills') ? `
            <div class="sidebar-section skills">
              <h2>Technical Skills</h2>
              ${data.skills
                .filter(s => s.category === 'Technical')
                .map(skill => `
                  <div class="skill-item">
                    <span class="skill-name">${skill.name}</span>
                    <div class="skill-bar">
                      <div class="skill-progress" style="width: ${this.getSkillWidth(skill.level)}"></div>
                    </div>
                  </div>
                `).join('')}
            </div>
          ` : ''}
          
          ${this.isSectionVisible(data.sections, 'languages') ? `
            <div class="sidebar-section languages">
              <h2>Languages</h2>
              ${(data.languages || []).map(lang => `
                <div class="language-item">
                  <span class="lang-name">${lang.name}</span>
                  <span class="lang-level">${lang.level}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="cv-main">
          <!-- Dynamic Sections -->
          ${sectionHTML}
        </div>
      </div>
    `
  }
  
  private renderIrishFinance(data: CVData): string {
    return `
      <div class="cv-container irish-finance">
        <header class="cv-header">
          <h1 class="name">${data.personal.fullName}</h1>
          <p class="title">${data.personal.title || 'Finance Professional'}</p>
          <div class="contact-info">
            <span>${data.personal.email}</span> | 
            <span>${data.personal.phone}</span> | 
            <span>${data.personal.address}</span>
            ${data.personal.nationality ? ` | <span>${data.personal.nationality}</span>` : ''}
            ${data.personal.linkedin ? ` | <span>${data.personal.linkedin}</span>` : ''}
          </div>
        </header>
        
        ${data.personal.summary ? `
          <section class="professional-profile">
            <h2>Professional Profile</h2>
            <p>${data.personal.summary}</p>
          </section>
        ` : ''}
        
        <section class="core-competencies">
          <h2>Core Competencies</h2>
          <div class="competencies-grid">
            ${data.skills.map(skill => `<span class="competency">${skill.name}</span>`).join('')}
          </div>
        </section>
        
        <section class="professional-experience">
          <h2>Professional Experience</h2>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <strong>${exp.position} at ${exp.company}</strong>
                <span class="date">${exp.location} • ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</span>
              </div>
              <p class="exp-description">${exp.description}</p>
              ${exp.achievements.length > 0 ? `
                <ul class="achievements">
                  ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        
        <section class="education-qualifications">
          <h2>Education & Qualifications</h2>
          ${data.education.map(edu => `
            <div class="education-item">
              <strong>${edu.degree} in ${edu.field}</strong> - ${edu.institution}${edu.current || edu.endDate === 'Present' ? ' (Present)' : edu.endDate ? ` (${this.formatDate(edu.endDate).split(' ')[1] || ''})` : ''}
              ${edu.grade ? ` - ${edu.grade}` : ''}
            </div>
          `).join('')}
          
          ${data.certifications && data.certifications.length > 0 ? `
            <div class="certifications">
              <h3>Professional Certifications</h3>
              ${data.certifications.map(cert => `
                <div class="cert-item">
                  <strong>${cert.name}</strong> - ${cert.issuer} (${this.formatDate(cert.issueDate).split(' ')[1]})
                </div>
              `).join('')}
            </div>
          ` : ''}
        </section>
        
        ${data.languages && data.languages.length > 0 ? `
          <section class="languages">
            <h2>Languages</h2>
            <div class="language-list">
              ${data.languages.map(lang => `
                <div class="language-item">
                  <span class="language-name">${lang.name}</span>
                  <span class="language-level">${lang.level}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${data.references && data.references.length > 0 ? `
          <section class="references">
            <h2>References</h2>
            ${data.references.map(ref => `
              <div class="reference-item">
                <h3>${ref.name}</h3>
                <p class="ref-position">${ref.position} at ${ref.company}</p>
                <p class="ref-contact">${ref.email} • ${ref.phone}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        <footer class="cv-footer">
          <p>EU Work Authorization: Full rights to work in Ireland/EU</p>
        </footer>
      </div>
    `
  }
  
     private renderClassic(data: CVData): string {
     // Use sections array if available, otherwise use default sections
     const sections = data.sections && data.sections.length > 0 
       ? data.sections 
       : this.getDefaultSections()
     
     // Sort sections by order and filter visible ones
     const visibleSections = sections
       .filter(section => section.visible)
       .sort((a, b) => a.order - b.order)
     
     // Render dynamic sections
     const sectionHTML = visibleSections
       .map(section => this.getSectionRenderer(section.type)(data))
       .filter(html => html.trim() !== '') // Remove empty sections
       .join('')
     
     return `
       <div class="cv-container classic">
         <!-- Header (Always First) -->
         <header class="cv-header">
           <h1 class="name">${data.personal.fullName}</h1>
           <p class="title">${data.personal.title || 'Professional'}</p>
           <div class="contact-info">
             ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
             ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
             ${data.personal.address ? `<span>${data.personal.address}</span>` : ''}
             ${data.personal.nationality ? `<span class="nationality">${data.personal.nationality}</span>` : ''}
             ${data.personal.website ? `<span>${data.personal.website}</span>` : ''}
             ${data.personal.linkedin ? `<span>${data.personal.linkedin}</span>` : ''}
           </div>
         </header>
         
         <!-- Dynamic Sections -->
         ${sectionHTML}
       </div>
     `
   }
  
  // CSS generation functions
  private getDublinTechCSS(): string {
    return `
      /* Live preview normalization */
      .cv-preview-direct .cv-container,
      .cv-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .cv-container.dublin-tech {
        display: flex;
        font-family: Arial, Calibri, sans-serif; /* ATS-friendly fonts */
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        font-size: 11pt; /* Base font size for ATS */
        color: #000000; /* Pure black text */
        padding: 15mm; /* Consistent margins with other templates */
        box-sizing: border-box;
      }
      
      /* A4 Page Simulation for Web Preview */
      @media screen {
        /* Ensure proper height calculation for multi-page preview */
        .cv-container {
          min-height: auto !important; /* Override min-height for proper pagination */
        }
      }
      
      /* Page height markers for preview calculation */
      .cv-preview-container {
        position: relative;
      }
      
      /* Page Break Rules for Print */
      @media print {
        /* Prevent page breaks inside sections */
        section, .experience-item, .education-item, 
        .project-item, .certification-item, .reference-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ensure sections don't start in the middle of a page */
        h2 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Keep headers with their content */
        .exp-header, .edu-header {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Ensure list items stay together */
        ul, ol {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Avoid orphaned list items */
        li {
          page-break-inside: avoid;
          break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
      }
      
      /* Page indicators for screen view */
      @media screen {
        .page-break-indicator {
          display: block;
          width: 100%;
          text-align: center;
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 2px dashed #ccc;
          border-bottom: 2px dashed #ccc;
          color: #666;
          font-size: 12px;
          position: relative;
        }
        
        .page-break-indicator::before {
          content: "Page Break";
          background: white;
          padding: 0 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      
      .cv-sidebar {
        width: 35%;
        background: #f8f9fa; /* Light gray instead of blue for ATS */
        color: #000000; /* Black text for ATS */
        padding: 2rem;
        border-right: 2px solid #000000;
      }
      
      .cv-sidebar h1, .cv-sidebar h2 {
        color: #000000; /* Black for ATS */
        margin-bottom: 1rem;
        font-weight: bold;
      }
      
      .cv-sidebar .name {
        font-size: 18pt; /* 18pt for name */
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: #000000;
      }
      
      .cv-sidebar .title {
        font-size: 14pt; /* 14pt for title */
        font-weight: 600;
        margin-bottom: 2rem;
        color: #000000;
      }
      
      .sidebar-section {
        margin-bottom: 1rem;
      }
      
      .sidebar-section h2 {
        font-size: 14pt; /* 14pt section headers */
        border-bottom: 2px solid #000000;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .contact p {
        margin: 0.5rem 0;
        font-size: 11pt; /* 11pt for ATS */
        color: #000000;
        font-weight: 500;
      }
      
      .skill-item {
        margin-bottom: 0.8rem;
      }
      
      .skill-name {
        display: block;
        font-size: 11pt; /* 11pt for ATS */
        margin-bottom: 0.3rem;
        color: #000000;
        font-weight: 600;
      }
      
      .skill-bar {
        height: 6px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
        border: 1px solid #000000;
      }
      
      .skill-progress {
        height: 100%;
        background: #000000; /* Black for ATS */
        border-radius: 2px;
      }
      
      .language-groups {
        margin-bottom: 1rem;
      }
      
      .language-group {
        margin-bottom: 0.4rem;
      }
      
      .language-list {
        font-size: 11pt; /* 11pt for ATS */
        color: #000000;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .language-level-label {
        font-weight: 600;
        color: #2563eb;
      }
      
      /* Legacy support */
      .language-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 11pt; /* 11pt for ATS */
        color: #000000;
        font-weight: 500;
      }
      
      .cv-main {
        flex: 1;
        padding: 2rem;
      }
      
      .cv-main h2 {
        color: #000000; /* Black for ATS */
        font-size: 14pt; /* 14pt section headers */
        margin-bottom: 1rem;
        border-bottom: 2px solid #000000;
        padding-bottom: 0.5rem;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .cv-main section {
        margin-bottom: 1rem;
      }
      
      .experience-item, .education-item {
        margin-bottom: 12px;
      }
      
      .project-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .project-item:last-child {
        border-bottom: none;
      }
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .project-left {
        flex: 1;
      }
      
      .project-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .project-item h3 {
        font-size: 12pt;
        color: #000000;
        margin: 0 0 0.3rem 0;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .project-description {
        font-size: 11pt;
        margin-bottom: 0.2rem;
        line-height: 1.3;
        color: #000000;
        font-weight: 400;
      }
      
      .project-tech {
        font-size: 10pt;
        margin: 0;
        color: #6b7280;
        font-weight: 400;
      }
      
      .project-meta {
        text-align: right;
      }
      
      .project-date {
        font-size: 10pt;
        color: #4a5568;
        margin-bottom: 0.2rem;
        font-weight: 500;
      }
      
      .project-link, .project-github {
        font-size: 10pt;
        color: #2563eb;
        text-decoration: underline;
        word-break: break-all;
        display: block;
        margin-bottom: 0.1rem;
      }
      
      .project-achievements {
        margin-top: 0.3rem;
      }
      
      .project-achievements strong {
        font-size: 10pt;
        color: #000000;
        font-weight: 600;
      }
      
      .project-achievements ul {
        margin: 0.2rem 0 0 1rem;
        padding: 0;
      }
      
      .project-achievements li {
        font-size: 10pt;
        color: #4a5568;
        margin-bottom: 0.1rem;
        line-height: 1.3;
      }
      
      .exp-header, .edu-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.5rem;
      }
      
      .exp-header h3, .edu-header h3 {
        font-size: 12pt; /* 12pt for titles */
        color: #000000;
        margin: 0;
        font-weight: bold;
      }
      
      .date {
        font-size: 11pt;
        color: #000000; /* Black for ATS */
        font-weight: 500;
        white-space: nowrap;
      }
      
      .exp-company, .edu-institution {
        color: #000000; /* Black for ATS */
        font-size: 11pt;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .achievements {
        margin-top: 0.3rem;
        padding-left: 1.5rem;
      }
      
      .achievements li {
        margin-bottom: 0.2rem;
        font-size: 12pt; /* 12pt for ATS */
        color: #000000;
        font-weight: 400;
      }
      
      .tech-stack {
        margin-top: 0.3rem;
      }
      
      .tech-tag {
        display: inline-block;
        background: #f8f9fa; /* Light gray for ATS */
        color: #000000;
        padding: 0.2rem 0.6rem;
        border-radius: 0.25rem;
        font-size: 11pt;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
        border: 1px solid #000000;
      }
      
      .reference-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        background: transparent;
        border: none;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .reference-item:last-child {
        border-bottom: none;
      }
      
      .ref-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .ref-left {
        flex: 1;
      }
      
      .ref-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .reference-item h3 {
        font-size: 12pt;
        color: #000000;
        margin-bottom: 0.3rem;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .ref-position {
        font-size: 11pt;
        color: #000000;
        margin-bottom: 0.2rem;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .ref-contact, .ref-phone {
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
        margin-bottom: 0.1rem;
        line-height: 1.3;
      }
      
      .ref-relationship {
        font-size: 10pt;
        color: #6b7280;
        font-weight: 400;
        font-style: italic;
        margin-top: 0.2rem;
      }
      
      .references-available {
        text-align: center;
        font-style: italic;
        color: #000000;
        font-size: 12pt;
        margin-top: 1rem;
      }
      
      @media print {
        .cv-container.dublin-tech {
          box-shadow: none;
        }
      }
    `
  }
  
  private getIrishFinanceCSS(): string {
    return `
      /* Live preview normalization */
      .cv-preview-direct .cv-container,
      .cv-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .cv-container.irish-finance {
        font-family: Arial, Calibri, sans-serif; /* ATS-friendly fonts */
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 15mm; /* Reduced margins for better live preview */
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        line-height: 1.3;
        font-size: 12pt; /* Base 12pt for ATS */
        color: #000000;
      }
      
      /* A4 Page Simulation for Web Preview */
      @media screen {
        /* Ensure proper height calculation for multi-page preview */
        .cv-container {
          min-height: auto !important; /* Override min-height for proper pagination */
        }
      }
      
      /* Page height markers for preview calculation */
      .cv-preview-container {
        position: relative;
      }
      
      /* Page Break Rules for Print */
      @media print {
        /* Prevent page breaks inside sections */
        section, .experience-item, .education-item, 
        .project-item, .certification-item, .reference-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ensure sections don't start in the middle of a page */
        h2 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Keep headers with their content */
        .exp-header, .edu-header {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Ensure list items stay together */
        ul, ol {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Avoid orphaned list items */
        li {
          page-break-inside: avoid;
          break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
      }
      
      /* Page indicators for screen view */
      @media screen {
        .page-break-indicator {
          display: block;
          width: 100%;
          text-align: center;
          margin: 1rem 0;
          padding: 0.5rem 0;
          border-top: 2px dashed #ccc;
          border-bottom: 2px dashed #ccc;
          color: #666;
          font-size: 12px;
          position: relative;
        }
        
        .page-break-indicator::before {
          content: "Page Break";
          background: white;
          padding: 0 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      
      .cv-header {
        text-align: center;
        margin-bottom: 1rem;
        border-bottom: 3px solid #000000; /* Black for ATS */
        padding-bottom: 0.5rem;
      }
      
      .cv-header .name {
        font-size: 20pt; /* 20pt for name */
        color: #000000; /* Black for ATS */
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      .cv-header .title {
        font-size: 14pt; /* 14pt for title */
        color: #000000;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
      
      .contact-info {
        font-size: 11pt;
        color: #000000;
        font-weight: 500;
      }
      
      .irish-finance h2 {
        color: #000000; /* Black for ATS */
        font-size: 14pt; /* 14pt section headers */
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: bold;
        border-bottom: 2px solid #000000;
        padding-bottom: 0.3rem;
      }
      
      .professional-profile p {
        text-align: left; /* Left align for ATS */
        color: #000000;
        font-size: 12pt;
        font-weight: 400;
        line-height: 1.3;
        margin-bottom: 8px;
      }
      
      .competencies-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      
      .competency {
        padding: 0.3rem 0.6rem;
        background: #ffffff; /* White for ATS */
        border: 1px solid #000000;
        border-radius: 0.25rem;
        font-size: 11pt; /* 11pt for ATS */
        text-align: center;
        color: #000000;
        font-weight: 500;
      }
      
      .experience-item {
        margin-bottom: 12px;
      }
      
      .exp-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.2rem;
      }
      
      .exp-header .date {
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
        white-space: nowrap;
      }
      
      .exp-company {
        font-weight: 500; /* Medium weight instead of italic */
        color: #000000;
        margin-bottom: 0.5rem;
        font-size: 11pt;
      }
      
      .achievements {
        margin-top: 0.3rem;
        padding-left: 1.5rem;
      }
      
      .achievements li {
        margin-bottom: 0.2rem;
        font-size: 12pt;
        color: #000000;
        font-weight: 400;
      }
      
      .education-item {
        margin-bottom: 12px;
      }
      
      .certifications {
        margin-top: 0.5rem;
      }
      
      .certifications h3 {
        font-size: 12pt; /* 12pt for ATS */
        color: #000000;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      .cert-item {
        margin-bottom: 0.5rem;
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
      }
      
      .language-groups {
        margin-bottom: 1rem;
      }
      
      .language-group {
        margin-bottom: 0.4rem;
      }
      
      .language-list {
        font-size: 11pt;
        color: #000000;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .language-level-label {
        font-weight: 600;
        color: #166534;
      }
      
      /* Legacy support */
      .language-item {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 11pt;
      }
      
      .language-name {
        font-weight: 500;
        color: #000000;
      }
      
      .language-level {
        color: #000000;
        font-weight: 400;
      }
      
      .reference-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        background: transparent;
        border: none;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .reference-item:last-child {
        border-bottom: none;
      }
      
      .ref-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .ref-left {
        flex: 1;
      }
      
      .ref-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .reference-item h3 {
        font-size: 12pt;
        color: #000000;
        margin-bottom: 0.3rem;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .ref-position {
        font-size: 11pt;
        color: #000000;
        margin-bottom: 0.2rem;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .ref-contact, .ref-phone {
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
        margin-bottom: 0.1rem;
        line-height: 1.3;
      }
      
      .ref-relationship {
        font-size: 10pt;
        color: #6b7280;
        font-weight: 400;
        font-style: italic;
        margin-top: 0.2rem;
      }
      
      .project-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .project-item:last-child {
        border-bottom: none;
      }
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .project-left {
        flex: 1;
      }
      
      .project-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .project-item h3 {
        font-size: 12pt;
        color: #000000;
        margin: 0 0 0.3rem 0;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .project-description {
        font-size: 11pt;
        margin-bottom: 0.2rem;
        line-height: 1.3;
        color: #000000;
        font-weight: 400;
      }
      
      .project-tech {
        font-size: 10pt;
        margin: 0;
        color: #6b7280;
        font-weight: 400;
      }
      
      .project-link {
        font-size: 10pt;
        color: #166534;
        text-decoration: underline;
        word-break: break-all;
      }
      
      .cv-footer {
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid #000000;
        text-align: center;
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
      }
      
      .references-available {
        text-align: center;
        font-style: italic;
        color: #000000;
        font-size: 12pt;
        margin-top: 1rem;
      }
      
      @media print {
        .cv-container.irish-finance {
          box-shadow: none;
          padding: 1rem;
        }
      }
    `
  }
  
  private getClassicCSS(): string {
    return `
      /* Live preview normalization */
      .cv-preview-direct .cv-container,
      .cv-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      /* Classic Template Styles - ATS Optimized */
      .cv-container.classic {
        font-family: Arial, Calibri, Helvetica, sans-serif;
        max-width: 210mm; /* A4 width */
        width: 100%;
        margin: 0 auto;
        background: white;
        color: #000000; /* Pure black for ATS */
        line-height: 1.3; /* Better readability */
        font-size: 12pt; /* 12pt for ATS compliance */
        padding: 15mm; /* Reduced margins for better live preview */
        box-sizing: border-box;
        min-height: 297mm; /* A4 height */
        position: relative;
      }
      
      /* A4 Page Simulation for Web Preview */
      @media screen {
        /* Ensure proper height calculation for multi-page preview */
        .cv-container {
          min-height: auto !important; /* Override min-height for proper pagination */
        }
      }
      
      /* Page height markers for preview calculation */
      .cv-preview-container {
        position: relative;
      }
      
      /* Page Break Rules for Print */
      @media print {
        /* Prevent page breaks inside sections */
        section, .experience-item, .education-item, 
        .project-item, .certification-item, .reference-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ensure sections don't start in the middle of a page */
        h2 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Keep headers with their content */
        .exp-header, .edu-header {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Ensure list items stay together */
        ul, ol {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Avoid orphaned list items */
        li {
          page-break-inside: avoid;
          break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
      }
      
      /* Page indicators for screen view */
      @media screen {
        .page-break-indicator {
          display: block;
          width: 100%;
          text-align: center;
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 2px dashed #ccc;
          border-bottom: 2px dashed #ccc;
          color: #666;
          font-size: 12px;
          position: relative;
        }
        
        .page-break-indicator::before {
          content: "Page Break";
          background: white;
          padding: 0 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      
      @media screen {
        .cv-container.classic {
          max-width: 800px;
          padding: 40px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin: 20px auto;
        }
      }
      
      /* Header */
      .cv-container.classic .cv-header {
        text-align: center;
        margin-bottom: 1rem;
        padding-bottom: 8px;
        border-bottom: 2px solid #000;
      }
      
      .cv-container.classic .name {
        font-size: 20pt; /* 20pt for name */
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #000000;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .cv-container.classic .title {
        font-size: 14pt; /* 14pt for title */
        color: #000000; /* Black instead of gray */
        margin: 0 0 15px 0;
        font-weight: 600; /* Semi-bold instead of italic */
      }
      
      .cv-container.classic .contact-info {
        font-size: 11pt; /* 11pt for ATS */
        color: #000000; /* Pure black for ATS */
        line-height: 1.5;
        font-weight: 500; /* Medium weight for better scanning */
      }
      
      .cv-container.classic .contact-info span {
        margin: 0 15px;
      }
      
      .cv-container.classic .contact-info span:first-child {
        margin-left: 0;
      }
      
      .cv-container.classic .contact-info span:last-child {
        margin-right: 0;
      }
      
      /* Section Headers */
      .cv-container.classic h2 {
        font-size: 14pt; /* 14pt for section headers */
        font-weight: bold;
        text-transform: uppercase;
        color: #000000;
        margin: 1rem 0 8px 0;
        padding-bottom: 3px;
        border-bottom: 2px solid #000000; /* Thicker for better visibility */
        letter-spacing: 0.5px;
      }
      
      /* Summary */
      .cv-container.classic .summary {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .summary p {
        font-size: 12pt; /* 12pt for ATS */
        line-height: 1.3;
        text-align: left; /* Left align for ATS */
        color: #000000;
        margin: 0 0 8px 0;
        font-weight: 400;
      }
      
      /* Skills */
      .cv-container.classic .skills {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .skills-categories {
        margin: 8px 0 0 0;
      }
      
      .cv-container.classic .skill-category {
        margin-bottom: 0.2rem;
        line-height: 1.3;
        font-size: 12pt; /* 12pt for ATS */
      }
      
      .cv-container.classic .skill-category strong {
        font-weight: bold;
        color: #000000;
        margin-right: 0.5rem;
      }
      
      .cv-container.classic .skill-category span {
        color: #000000;
        font-weight: 400;
      }
      
      /* Experience */
      .cv-container.classic .experience {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .experience-item {
        margin-bottom: 12px;
      }
      
      .cv-container.classic .exp-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }
      
      .cv-container.classic .exp-left {
        flex: 1;
      }
      
      .cv-container.classic .exp-right {
        text-align: right;
        min-width: 200px;
        font-size: 12px;
        color: #000;
      }
      
      .cv-container.classic .exp-meta {
        font-size: 11pt;
        color: #000000; /* Black for ATS */
        margin: 0;
        font-weight: 500; /* Medium weight instead of italic */
      }
      
      .cv-container.classic .exp-header h3 {
        font-size: 12pt; /* 12pt for job titles */
        font-weight: bold;
        margin: 0 0 2px 0;
        color: #000000;
      }
      
      .cv-container.classic .company {
        font-size: 12px;
        margin: 0;
        color: #000;
      }
      
      .cv-container.classic .location {
        font-size: 12px;
        color: #000;
        margin: 0;
        font-weight: normal;
      }
      
      .cv-container.classic .date {
        font-size: 12px;
        color: #000;
        margin: 2px 0 0 0;
        font-weight: normal;
      }
      
      .cv-container.classic .exp-description {
        margin: 4px 0 0 0;
        font-size: 12pt; /* 12pt for ATS */
        color: #000000;
        line-height: 1.3;
        font-weight: 400;
      }
      
      /* Achievements */
      .cv-container.classic .achievements {
        margin: 4px 0 0 0;
        padding-left: 20px;
        list-style-type: disc;
      }
      
      .cv-container.classic .achievements li {
        margin-bottom: 2px;
        line-height: 1.3;
        font-size: 12pt; /* 12pt for ATS */
        color: #000000;
        font-weight: 400;
      }
      
      /* Education */
      .cv-container.classic .education {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .education-item {
        margin-bottom: 12px;
      }
      
      .cv-container.classic .edu-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 5px;
      }
      
      .cv-container.classic .edu-left {
        flex: 1;
      }
      
      .cv-container.classic .edu-right {
        text-align: right;
        min-width: 120px;
        font-size: 12px;
      }
      
      .cv-container.classic .edu-header h3 {
        font-size: 12pt; /* 12pt for ATS */
        font-weight: bold;
        margin: 0;
        color: #000000;
      }
      
      .cv-container.classic .institution {
        font-size: 12pt;
        margin: 2px 0;
        color: #000000;
        font-weight: 500;
      }
      
      .cv-container.classic .grade {
        margin: 3px 0 0 0;
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
      }
      
      .cv-container.classic .projects {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .project-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #000000;
      }
      
      .cv-container.classic .project-item:last-child {
        border-bottom: none;
      }
      
      .cv-container.classic .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .cv-container.classic .project-left {
        flex: 1;
      }
      
      .cv-container.classic .project-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .cv-container.classic .project-item h3 {
        font-size: 12pt; /* 12pt for ATS */
        font-weight: bold;
        margin: 0 0 0.3rem 0;
        color: #000000;
        line-height: 1.3;
      }
      
      .cv-container.classic .project-description {
        font-size: 11pt;
        margin-bottom: 0.2rem;
        line-height: 1.3;
        color: #000000;
        font-weight: 400;
      }
      
      .cv-container.classic .project-tech {
        font-size: 10pt;
        margin: 0;
        color: #4a5568;
        font-weight: 400;
      }
      
      .cv-container.classic .project-link {
        font-size: 10pt;
        color: #2563eb;
        text-decoration: underline;
        word-break: break-all;
      }
      
      .cv-container.classic .certifications {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .certification-item {
        margin-bottom: 8px;
      }
      
      .cv-container.classic .cert-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      
      .cv-container.classic .cert-header h3 {
        font-size: 12pt; /* 12pt for ATS */
        font-weight: bold;
        margin: 0;
        color: #000000;
      }
      
      .cv-container.classic .cert-date {
        font-size: 11pt;
        color: #000000;
        font-weight: 500;
      }
      
      .cv-container.classic .cert-issuer {
        font-size: 12pt;
        margin: 2px 0;
        color: #000000;
        font-weight: 400;
      }
      
      .cv-container.classic .cert-id {
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
      }
      
      .cv-container.classic .languages {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .language-groups {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .language-group {
        margin-bottom: 0.4rem;
      }
      
      .cv-container.classic .language-list {
        font-size: 12pt; /* 12pt for ATS */
        color: #000000;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .cv-container.classic .language-level-label {
        font-weight: 600;
        color: #000000;
      }
      
      /* Legacy support */
      .cv-container.classic .languages-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .cv-container.classic .language-item {
        display: flex;
        justify-content: space-between;
        font-size: 12pt; /* 12pt for ATS */
        padding: 5px 0;
        border-bottom: 1px solid #000000;
        color: #000000;
      }
      
      .cv-container.classic .lang-name {
        font-weight: 600;
        color: #000000;
      }
      
      .cv-container.classic .lang-level {
        font-weight: 500;
        color: #000000;
      }
      
      .cv-container.classic .interests {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .interests p {
        font-size: 12pt; /* 12pt for ATS */
        line-height: 1.3;
        color: #000000;
        font-weight: 400;
      }
      
      .cv-container.classic .references {
        margin-bottom: 1rem;
      }
      
      .cv-container.classic .reference-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        background: transparent;
        border: none;
        border-bottom: 1px solid #000000;
      }
      
      .cv-container.classic .reference-item:last-child {
        border-bottom: none;
      }
      
      .cv-container.classic .ref-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .cv-container.classic .ref-left {
        flex: 1;
      }
      
      .cv-container.classic .ref-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .cv-container.classic .reference-item h3 {
        font-size: 12pt; /* 12pt for ATS */
        font-weight: bold;
        margin: 0 0 0.3rem 0;
        color: #000000;
        line-height: 1.3;
      }
      
      .cv-container.classic .ref-position {
        font-size: 11pt;
        margin: 0 0 0.2rem 0;
        color: #000000;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .cv-container.classic .ref-contact, .cv-container.classic .ref-phone {
        font-size: 11pt;
        margin: 0 0 0.1rem 0;
        color: #000000;
        font-weight: 400;
        line-height: 1.3;
      }
      
      .cv-container.classic .ref-relationship {
        font-size: 10pt;
        margin: 0.2rem 0 0 0;
        color: #4a5568;
        font-weight: 400;
        font-style: italic;
      }
      
      .cv-container.classic .references-available {
        text-align: center;
        font-style: italic;
        color: #000000;
        font-size: 12pt;
        margin-top: 1rem;
      }
      
      @media print {
        .cv-container.classic {
          box-shadow: none;
          padding: 20px;
          font-size: 11pt;
        }
        
        .cv-container.classic h2 {
          page-break-after: avoid;
        }
        
        .experience-item, .education-item {
          page-break-inside: avoid;
        }
        
        .cv-header {
          border-bottom: 1px solid #000000;
        }
      }
    `
  }
  
  private renderDublinPharma(data: CVData): string {
    return `
      <div class="cv-container dublin-pharma">
        <header class="cv-header">
          <h1 class="name">${data.personal.fullName}</h1>
          <p class="title">${data.personal.title || 'Pharmaceutical Professional'}</p>
          <div class="contact-info">
            <span>${data.personal.email}</span>
            <span>${data.personal.phone}</span>
            <span>${data.personal.address}</span>
            ${data.personal.nationality ? `<span>${data.personal.nationality}</span>` : ''}
          </div>
        </header>
        
        ${data.personal.summary ? `
          <section class="profile">
            <h2>Professional Profile</h2>
            <p>${data.personal.summary}</p>
          </section>
        ` : ''}
        
        <section class="experience">
          <h2>Professional Experience</h2>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <h3>${exp.position} at ${exp.company}</h3>
                <span class="date">${exp.location} • ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</span>
              </div>
              <p class="exp-description">${exp.description}</p>
              ${exp.achievements.length > 0 ? `
                <ul class="achievements">
                  ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        
        ${data.skills && data.skills.length > 0 ? `
          <section class="technical-skills">
            <h2>Technical Competencies</h2>
            <div class="skills-grid">
              ${this.groupSkillsByCategory(data.skills).map(group => `
                <div class="skill-category">
                  <h3>${group.category}</h3>
                  <p>${group.skills.join(' • ')}</p>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}
        
        <section class="education">
          <h2>Education</h2>
          ${data.education.map(edu => `
            <div class="education-item">
              <div class="edu-header">
                <h3>${edu.degree} in ${edu.field}</h3>
                <span class="date">${this.formatDate(edu.startDate)} - ${edu.current || edu.endDate === 'Present' ? 'Present' : this.formatDate(edu.endDate)}</span>
              </div>
              <div class="edu-institution">${edu.institution} | ${edu.location}</div>
              ${edu.grade ? `<p class="grade">Grade: ${edu.grade}</p>` : ''}
            </div>
          `).join('')}
        </section>
        
        ${data.certifications && data.certifications.length > 0 ? `
          <section class="certifications">
            <h2>Certifications & Training</h2>
            ${data.certifications.map(cert => `
              <div class="certification-item">
                <h3>${cert.name}</h3>
                <p>${cert.issuer} • ${this.formatDate(cert.issueDate)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}
        
        ${data.languages && data.languages.length > 0 ? `
          <section class="languages">
            <h2>Languages</h2>
            <div class="language-list">
              ${data.languages.map(lang => `
                <div class="language-item">
                  <span class="language-name">${lang.name}</span>
                  <span class="language-level">${lang.level}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${data.references && data.references.length > 0 ? `
          <section class="references">
            <h2>References</h2>
            ${data.references.map(ref => `
              <div class="reference-item">
                <h3>${ref.name}</h3>
                <p class="ref-position">${ref.position} at ${ref.company}</p>
                <p class="ref-contact">${ref.email} • ${ref.phone}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}
      </div>
    `
  }
  
  private getDublinPharmaCSS(): string {
    return `
      /* Live preview normalization */
      .cv-preview-direct .cv-container,
      .cv-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      /* Dublin Pharma Template Styles - ATS Optimized */
      .cv-container.dublin-pharma {
        font-family: Arial, Calibri, sans-serif; /* ATS-friendly fonts */
        max-width: 210mm;
        margin: 0 auto;
        padding: 15mm; /* Reduced margins for better live preview */
        font-size: 12pt; /* Base 12pt for ATS */
        color: #000000; /* Pure black text */
        line-height: 1.3;
        background: #ffffff;
        color: #111827;
      }
      
      /* A4 Page Simulation for Web Preview */
      @media screen {
        /* Ensure proper height calculation for multi-page preview */
        .cv-container {
          min-height: auto !important; /* Override min-height for proper pagination */
        }
      }
      
      /* Page height markers for preview calculation */
      .cv-preview-container {
        position: relative;
      }
      
      /* Page Break Rules for Print */
      @media print {
        /* Prevent page breaks inside sections */
        section, .experience-item, .education-item, 
        .project-item, .certification-item, .reference-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ensure sections don't start in the middle of a page */
        h2 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Keep headers with their content */
        .exp-header, .edu-header {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        /* Ensure list items stay together */
        ul, ol {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Avoid orphaned list items */
        li {
          page-break-inside: avoid;
          break-inside: avoid;
          orphans: 3;
          widows: 3;
        }
      }
      
      /* Page indicators for screen view */
      @media screen {
        .page-break-indicator {
          display: block;
          width: 100%;
          text-align: center;
          margin: 2rem 0;
          padding: 1rem 0;
          border-top: 2px dashed #ccc;
          border-bottom: 2px dashed #ccc;
          color: #666;
          font-size: 12px;
          position: relative;
        }
        
        .page-break-indicator::before {
          content: "Page Break";
          background: white;
          padding: 0 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      
      .dublin-pharma .cv-header {
        text-align: center;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #000000; /* Black for ATS */
        margin-bottom: 1rem;
      }
      
      .dublin-pharma .name {
        font-size: 20pt; /* 20pt for name */
        font-weight: 700;
        color: #000000; /* Black for ATS */
        margin-bottom: 0.5rem;
      }
      
      .dublin-pharma .title {
        font-size: 14pt; /* 14pt for title */
        color: #000000;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .dublin-pharma .contact-info {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        font-size: 11pt; /* 11pt for ATS */
        color: #000000;
        font-weight: 500;
      }
      
      .dublin-pharma section {
        margin-bottom: 1rem;
      }
      
      .dublin-pharma h2 {
        font-size: 14pt; /* 14pt section headers */
        font-weight: bold;
        color: #000000; /* Black for ATS */
        margin-bottom: 0.5rem;
        padding-bottom: 0.3rem;
        border-bottom: 2px solid #000000;
        text-transform: uppercase;
      }
      
      .dublin-pharma h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }
      
      .dublin-pharma .experience-item,
      .dublin-pharma .education-item,
      .dublin-pharma .certification-item {
        margin-bottom: 12px;
      }
      
      .dublin-pharma .exp-header,
      .dublin-pharma .edu-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.5rem;
      }
      
      .dublin-pharma .date {
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
        white-space: nowrap;
      }
      
      .dublin-pharma .exp-company,
      .dublin-pharma .edu-institution {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
      }
      
      .dublin-pharma .achievements {
        margin-top: 0.3rem;
        padding-left: 1.5rem;
      }
      
      .dublin-pharma .achievements li {
        margin-bottom: 0.15rem;
        font-size: 12pt;
        color: #000000;
        font-weight: 400;
      }
      
      .dublin-pharma .skills-grid {
        margin-top: 0.5rem;
      }
      
      .dublin-pharma .skill-category {
        margin-bottom: 0.3rem;
        line-height: 1.3;
      }
      
      .dublin-pharma .skill-category h3 {
        font-size: 12pt;
        color: #000000; /* Black for ATS */
        margin-bottom: 0.1rem;
        font-weight: bold;
        display: inline;
        margin-right: 0.5rem;
      }
      
      .dublin-pharma .skill-category h3:after {
        content: ":";
      }
      
      .dublin-pharma .skill-category p {
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
        display: inline;
        margin: 0;
      }
      
      .dublin-pharma .language-groups {
        margin-bottom: 1rem;
      }
      
      .dublin-pharma .language-group {
        margin-bottom: 0.4rem;
      }
      
      .dublin-pharma .language-list {
        font-size: 11pt;
        color: #000000;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .dublin-pharma .language-level-label {
        font-weight: 600;
        color: #059669;
      }
      
      /* Legacy support */
      .dublin-pharma .language-item {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 11pt;
      }
      
      .dublin-pharma .language-name {
        font-weight: 500;
        color: #000000;
      }
      
      .dublin-pharma .language-level {
        color: #000000;
        font-weight: 400;
      }
      
      .dublin-pharma .reference-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        background: transparent;
        border: none;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .dublin-pharma .reference-item:last-child {
        border-bottom: none;
      }
      
      .dublin-pharma .ref-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .dublin-pharma .ref-left {
        flex: 1;
      }
      
      .dublin-pharma .ref-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .dublin-pharma .reference-item h3 {
        font-size: 12pt;
        color: #000000;
        margin-bottom: 0.3rem;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .dublin-pharma .ref-position {
        font-size: 11pt;
        color: #000000;
        margin-bottom: 0.2rem;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .dublin-pharma .ref-contact, .dublin-pharma .ref-phone {
        font-size: 11pt;
        color: #000000;
        font-weight: 400;
        margin-bottom: 0.1rem;
        line-height: 1.3;
      }
      
      .dublin-pharma .ref-relationship {
        font-size: 10pt;
        color: #6b7280;
        font-weight: 400;
        font-style: italic;
        margin-top: 0.2rem;
      }
      
      .dublin-pharma .references-available {
        text-align: center;
        font-style: italic;
        color: #000000;
        font-size: 12pt;
        margin-top: 1rem;
      }
      
      .dublin-pharma .project-item {
        margin-bottom: 1rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .dublin-pharma .project-item:last-child {
        border-bottom: none;
      }
      
      .dublin-pharma .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .dublin-pharma .project-left {
        flex: 1;
      }
      
      .dublin-pharma .project-right {
        flex-shrink: 0;
        text-align: right;
        min-width: 200px;
      }
      
      .dublin-pharma .project-item h3 {
        font-size: 12pt;
        color: #000000;
        margin: 0 0 0.3rem 0;
        font-weight: bold;
        line-height: 1.3;
      }
      
      .dublin-pharma .project-description {
        font-size: 11pt;
        margin-bottom: 0.2rem;
        line-height: 1.3;
        color: #000000;
        font-weight: 400;
      }
      
      .dublin-pharma .project-tech {
        font-size: 10pt;
        margin: 0;
        color: #6b7280;
        font-weight: 400;
      }
      
      .dublin-pharma .project-link {
        font-size: 10pt;
        color: #059669;
        text-decoration: underline;
        word-break: break-all;
      }
      
      @media print {
        .dublin-pharma {
          padding: 15mm;
        }
        
        .dublin-pharma .cv-header {
          page-break-after: avoid;
        }
        
        .dublin-pharma section {
          page-break-inside: avoid;
        }
      }
    `
  }
  
  // Individual Section Renderers
  private renderSummarySection(data: CVData): string {
    if (!data.personal.summary) return ''
    
    return `
      <section class="summary">
        <h2>Summary</h2>
        <p>${data.personal.summary}</p>
      </section>
    `
  }

  private renderSkillsSection(data: CVData): string {
    if (!data.skills || data.skills.length === 0) return ''
    
    return `
      <section class="skills">
        <h2>Skills</h2>
        <div class="skills-categories">
          ${this.groupSkillsByCategory(data.skills).map(group => `
            <div class="skill-category">
              <strong>${group.category}:</strong>
              <span>${group.skills.join(' • ')}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `
  }

  private renderExperienceSection(data: CVData): string {
    if (!data.experience || data.experience.length === 0) return ''
    
    return `
      <section class="experience">
        <h2>Experience</h2>
        ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="exp-header">
              <div class="exp-left">
                <h3>${exp.position} at ${exp.company}</h3>
              </div>
              <div class="exp-right">
                <p class="exp-meta">${exp.location} • ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</p>
              </div>
            </div>
            ${exp.description ? `<p class="exp-description">${exp.description}</p>` : ''}
            ${exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>
    `
  }

  private renderEducationSection(data: CVData): string {
    if (!data.education || data.education.length === 0) return ''
    
    return `
      <section class="education">
        <h2>Education</h2>
        ${data.education.map(edu => `
          <div class="education-item">
            <div class="edu-header">
              <div class="edu-left">
                <h3>${edu.degree} in ${edu.field}</h3>
                <p class="institution">${edu.institution}</p>
              </div>
              <div class="edu-right">
                <p class="location">${edu.location}</p>
                <p class="date">${this.formatDate(edu.startDate)} - ${edu.current || edu.endDate === 'Present' ? 'Present' : this.formatDate(edu.endDate)}</p>
              </div>
            </div>
            ${edu.grade ? `<p class="grade">Grade: ${edu.grade}</p>` : ''}
          </div>
        `).join('')}
      </section>
    `
  }

  private renderProjectsSection(data: CVData): string {
    if (!data.projects || data.projects.length === 0) return ''
    
    return `
      <section class="projects">
        <h2>Projects</h2>
        ${data.projects.map(project => `
          <div class="project-item">
            <div class="project-header">
              <div class="project-left">
                <h3>${project.name}</h3>
                <p class="project-description">${project.description}</p>
                ${project.technologies && project.technologies.length > 0 ? `
                  <p class="project-tech"><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                ` : ''}
                ${project.achievements && project.achievements.length > 0 ? `
                  <div class="project-achievements">
                    <strong>Key Achievements:</strong>
                    <ul>
                      ${project.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
              <div class="project-right">
                <div class="project-meta">
                  ${project.startDate ? `
                    <p class="project-date">${this.formatDate(project.startDate)} - ${project.current ? 'Present' : (project.endDate ? this.formatDate(project.endDate) : 'Present')}</p>
                  ` : ''}
                  ${project.url ? `<a href="${project.url}" class="project-link" title="Project URL">${project.url}</a>` : ''}
                  ${project.github ? `<a href="${project.github}" class="project-github" title="GitHub Repository">${project.github}</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </section>
    `
  }

  private renderCertificationsSection(data: CVData): string {
    if (!data.certifications || data.certifications.length === 0) return ''
    
    return `
      <section class="certifications">
        <h2>Certifications</h2>
        ${data.certifications.map(cert => `
          <div class="certification-item">
            <div class="cert-header">
              <h3>${cert.name}</h3>
              <span class="cert-date">${this.formatDate(cert.issueDate)}</span>
            </div>
            <p class="cert-issuer">${cert.issuer}</p>
            ${cert.credentialId ? `<p class="cert-id">Credential ID: ${cert.credentialId}</p>` : ''}
          </div>
        `).join('')}
      </section>
    `
  }

  private renderLanguagesSection(data: CVData): string {
    if (!data.languages || data.languages.length === 0) return ''
    
    // Group languages by proficiency level for space efficiency and ATS optimization
    const languagesByLevel = data.languages.reduce((acc, lang) => {
      const level = lang.level || 'Unknown'
      if (!acc[level]) {
        acc[level] = []
      }
      acc[level].push(lang.name)
      return acc
    }, {} as Record<string, string[]>)
    
    // Sort levels by proficiency (Native > Fluent > Advanced > Intermediate > Basic > Beginner)
    const levelOrder = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic', 'Beginner']
    const sortedLevels = Object.keys(languagesByLevel).sort((a, b) => {
      const indexA = levelOrder.indexOf(a)
      const indexB = levelOrder.indexOf(b)
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })
    
    return `
      <section class="languages">
        <h2>Languages</h2>
        <div class="language-groups">
          ${sortedLevels.map(level => `
            <div class="language-group">
              <span class="language-list">${languagesByLevel[level].join(', ')}: <span class="language-level-label">${level}</span></span>
            </div>
          `).join('')}
        </div>
      </section>
    `
  }

  private renderInterestsSection(data: CVData): string {
    if (!data.interests || data.interests.length === 0) return ''
    
    return `
      <section class="interests">
        <h2>Interests</h2>
        <p>${data.interests.map(interest => interest.name).join(' • ')}</p>
      </section>
    `
  }

  private renderReferencesSection(data: CVData): string {
    // Check if section should be visible
    const section = data.sections?.find(s => s.type === 'references')
    if (!section?.visible) return ''
    
    // Check display mode
    if (data.referencesDisplay === 'available-on-request') {
      return `
        <section class="references">
          <h2>References</h2>
          <p class="references-available">Available upon request</p>
        </section>
      `
    }
    
    // Show detailed references if available
    if (!data.references || data.references.length === 0) return ''
    
    return `
      <section class="references">
        <h2>References</h2>
        ${data.references.map(ref => `
          <div class="reference-item">
            <div class="ref-header">
              <div class="ref-left">
                <h3>${ref.name}</h3>
                <p class="ref-position">${ref.position} at ${ref.company}</p>
                ${ref.relationship ? `<p class="ref-relationship">Relationship: ${ref.relationship}</p>` : ''}
              </div>
              <div class="ref-right">
                <p class="ref-contact">${ref.email}</p>
                <p class="ref-phone">${ref.phone}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </section>
    `
  }

  // Section Management
  private getDefaultSections(): CVSection[] {
    return [
      { id: 'summary', type: 'summary', title: 'Summary', visible: true, order: 1 },
      { id: 'skills', type: 'skills', title: 'Skills', visible: true, order: 2 },
      { id: 'experience', type: 'experience', title: 'Experience', visible: true, order: 3 },
      { id: 'education', type: 'education', title: 'Education', visible: true, order: 4 },
      { id: 'projects', type: 'projects', title: 'Projects', visible: true, order: 5 },
      { id: 'certifications', type: 'certifications', title: 'Certifications', visible: true, order: 6 },
      { id: 'languages', type: 'languages', title: 'Languages', visible: true, order: 7 },
      { id: 'interests', type: 'interests', title: 'Interests', visible: true, order: 8 },
      { id: 'references', type: 'references', title: 'References', visible: true, order: 9 }
    ]
  }

  private getSectionRenderer(sectionType: string): (data: CVData) => string {
    const renderers: { [key: string]: (data: CVData) => string } = {
      'summary': this.renderSummarySection.bind(this),
      'skills': this.renderSkillsSection.bind(this),
      'experience': this.renderExperienceSection.bind(this),
      'education': this.renderEducationSection.bind(this),
      'projects': this.renderProjectsSection.bind(this),
      'certifications': this.renderCertificationsSection.bind(this),
      'languages': this.renderLanguagesSection.bind(this),
      'interests': this.renderInterestsSection.bind(this),
      'references': this.renderReferencesSection.bind(this)
    }
    
    return renderers[sectionType] || (() => '')
  }
  
  private isSectionVisible(sections: CVSection[] | undefined, sectionType: string): boolean {
    if (!sections || sections.length === 0) return true // Default to visible if no sections defined
    const section = sections.find(s => s.type === sectionType)
    return section ? section.visible : true
  }

  // Helper functions
  private formatDate(dateStr: string): string {
    if (!dateStr || dateStr === 'Present' || dateStr === '') {
      return dateStr || ''
    }
    
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Check if year is reasonable
    const year = date.getFullYear()
    if (year < 1900 || year > 9999) {
      return ''
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${year}`
  }
  
  private getSkillWidth(level: string): string {
    const widths = {
      'Beginner': '25%',
      'Intermediate': '50%',
      'Advanced': '75%',
      'Expert': '100%'
    }
    return widths[level as keyof typeof widths] || '50%'
  }
  
  private groupSkillsByCategory(skills: any[]): { category: string; skills: string[] }[] {
    const categoryMap: { [key: string]: string } = {
      'Technical': 'Programming Languages',
      'Software': 'Frameworks/Tools',
      'Soft': 'Soft Skills',
      'Other': 'Other Skills'
    }
    
    const grouped: { [key: string]: string[] } = {}
    
    skills.forEach(skill => {
      const category = categoryMap[skill.category] || skill.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(skill.name)
    })
    
    return Object.entries(grouped).map(([category, skillList]) => ({
      category,
      skills: skillList
    }))
  }
}

// Export singleton instance
export const templateManager = new IrishCVTemplateManager()
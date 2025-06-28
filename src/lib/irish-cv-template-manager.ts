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
  
  // Template rendering functions
  private renderDublinTech(data: CVData): string {
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
            ${data.personal.github ? `<p><i class="icon-github"></i> ${data.personal.github}</p>` : ''}
            ${data.personal.portfolio ? `<p><i class="icon-web"></i> ${data.personal.portfolio}</p>` : ''}
          </div>
          
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
          
          <div class="sidebar-section languages">
            <h2>Languages</h2>
            ${(data.languages || []).map(lang => `
              <div class="language-item">
                <span class="lang-name">${lang.name}</span>
                <span class="lang-level">${lang.level}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="cv-main">
          ${data.personal.summary ? `
            <section class="summary">
              <h2>Professional Summary</h2>
              <p>${data.personal.summary}</p>
            </section>
          ` : ''}
          
          <section class="experience">
            <h2>Experience</h2>
            ${data.experience.map(exp => `
              <div class="experience-item">
                <div class="exp-header">
                  <h3>${exp.position}</h3>
                  <span class="date">${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</span>
                </div>
                <div class="exp-company">${exp.company} | ${exp.location}</div>
                <p class="exp-description">${exp.description}</p>
                ${exp.achievements.length > 0 ? `
                  <ul class="achievements">
                    ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
          
          ${data.projects && data.projects.length > 0 ? `
            <section class="projects">
              <h2>Projects</h2>
              ${data.projects.map(project => `
                <div class="project-item">
                  <h3>${project.name}</h3>
                  <p>${project.description}</p>
                  <div class="tech-stack">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </section>
          ` : ''}
          
          <section class="education">
            <h2>Education</h2>
            ${data.education.map(edu => `
              <div class="education-item">
                <div class="edu-header">
                  <h3>${edu.degree} in ${edu.field}</h3>
                  <span class="date">${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}</span>
                </div>
                <div class="edu-institution">${edu.institution} | ${edu.location}</div>
                ${edu.grade ? `<p class="grade">Grade: ${edu.grade}</p>` : ''}
              </div>
            `).join('')}
          </section>
          
          ${data.certifications && data.certifications.length > 0 ? `
            <section class="certifications">
              <h2>Certifications</h2>
              ${data.certifications.map(cert => `
                <div class="certification-item">
                  <h3>${cert.name}</h3>
                  <p>${cert.issuer} • ${this.formatDate(cert.issueDate)}</p>
                </div>
              `).join('')}
            </section>
          ` : ''}
          
          ${data.interests && data.interests.length > 0 ? `
            <section class="interests">
              <h2>Interests</h2>
              <p>${data.interests.map(i => i.name).join(' • ')}</p>
            </section>
          ` : ''}
          
          ${data.references && data.references.length > 0 ? `
            <section class="references">
              <h2>References</h2>
              ${data.references.map(ref => `
                <div class="reference-item">
                  <h3>${ref.name}</h3>
                  <p>${ref.position} at ${ref.company}</p>
                  <p>${ref.email} • ${ref.phone}</p>
                </div>
              `).join('')}
            </section>
          ` : ''}
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
                <strong>${exp.position}</strong>
                <span class="date">${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</span>
              </div>
              <div class="exp-company">${exp.company}, ${exp.location}</div>
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
              <strong>${edu.degree} in ${edu.field}</strong> - ${edu.institution} (${this.formatDate(edu.endDate).split(' ')[1]})
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
      .cv-container.dublin-tech {
        display: flex;
        font-family: 'Inter', sans-serif;
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      
      .cv-sidebar {
        width: 35%;
        background: #2563eb;
        color: white;
        padding: 2rem;
      }
      
      .cv-sidebar h1, .cv-sidebar h2 {
        color: white;
        margin-bottom: 1rem;
      }
      
      .cv-sidebar .name {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      
      .cv-sidebar .title {
        font-size: 1.1rem;
        opacity: 0.9;
        margin-bottom: 2rem;
      }
      
      .sidebar-section {
        margin-bottom: 2rem;
      }
      
      .sidebar-section h2 {
        font-size: 1.2rem;
        border-bottom: 2px solid rgba(255,255,255,0.3);
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .contact p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }
      
      .skill-item {
        margin-bottom: 0.8rem;
      }
      
      .skill-name {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
      }
      
      .skill-bar {
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .skill-progress {
        height: 100%;
        background: white;
        border-radius: 2px;
      }
      
      .language-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
      
      .cv-main {
        flex: 1;
        padding: 2rem;
      }
      
      .cv-main h2 {
        color: #2563eb;
        font-size: 1.4rem;
        margin-bottom: 1rem;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }
      
      .cv-main section {
        margin-bottom: 2rem;
      }
      
      .experience-item, .education-item, .project-item {
        margin-bottom: 1.5rem;
      }
      
      .exp-header, .edu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      
      .exp-header h3, .edu-header h3 {
        font-size: 1.1rem;
        color: #111827;
        margin: 0;
      }
      
      .date {
        font-size: 0.9rem;
        color: #6b7280;
      }
      
      .exp-company, .edu-institution {
        color: #6b7280;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
      }
      
      .achievements {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
      }
      
      .achievements li {
        margin-bottom: 0.3rem;
        font-size: 0.95rem;
      }
      
      .tech-stack {
        margin-top: 0.5rem;
      }
      
      .tech-tag {
        display: inline-block;
        background: #e5e7eb;
        color: #374151;
        padding: 0.2rem 0.6rem;
        border-radius: 0.25rem;
        font-size: 0.85rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
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
      .cv-container.irish-finance {
        font-family: 'Georgia', serif;
        max-width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        line-height: 1.6;
      }
      
      .cv-header {
        text-align: center;
        margin-bottom: 2rem;
        border-bottom: 3px solid #166534;
        padding-bottom: 1rem;
      }
      
      .cv-header .name {
        font-size: 2rem;
        color: #166534;
        margin-bottom: 0.5rem;
      }
      
      .cv-header .title {
        font-size: 1.2rem;
        color: #374151;
        margin-bottom: 0.5rem;
      }
      
      .contact-info {
        font-size: 0.95rem;
        color: #6b7280;
      }
      
      .irish-finance h2 {
        color: #166534;
        font-size: 1.3rem;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .professional-profile p {
        text-align: justify;
        color: #374151;
      }
      
      .competencies-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      
      .competency {
        padding: 0.3rem 0.6rem;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 0.25rem;
        font-size: 0.9rem;
        text-align: center;
      }
      
      .experience-item {
        margin-bottom: 1.5rem;
      }
      
      .exp-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3rem;
      }
      
      .exp-company {
        font-style: italic;
        color: #6b7280;
        margin-bottom: 0.5rem;
      }
      
      .achievements {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
      }
      
      .achievements li {
        margin-bottom: 0.3rem;
      }
      
      .education-item {
        margin-bottom: 0.8rem;
      }
      
      .certifications {
        margin-top: 1rem;
      }
      
      .certifications h3 {
        font-size: 1.1rem;
        color: #374151;
        margin-bottom: 0.5rem;
      }
      
      .cert-item {
        margin-bottom: 0.5rem;
      }
      
      .cv-footer {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 0.9rem;
        color: #6b7280;
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
      /* Classic Template Styles */
      .cv-container.classic {
        font-family: 'Times New Roman', Times, serif;
        max-width: 210mm; /* A4 width */
        width: 100%;
        margin: 0 auto;
        background: white;
        color: #000;
        line-height: 1.4;
        font-size: 12px;
        padding: 20mm; /* A4 margins */
        box-sizing: border-box;
        min-height: 297mm; /* A4 height */
        position: relative;
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
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #000;
      }
      
      .cv-container.classic .name {
        font-size: 28px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .cv-container.classic .title {
        font-size: 16px;
        color: #333;
        margin: 0 0 15px 0;
        font-style: italic;
        font-weight: normal;
      }
      
      .cv-container.classic .contact-info {
        font-size: 12px;
        color: #333;
        line-height: 1.3;
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
        font-size: 16px;
        font-weight: bold;
        text-transform: uppercase;
        color: #000;
        margin: 25px 0 12px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #000;
        letter-spacing: 0.5px;
      }
      
      /* Summary */
      .cv-container.classic .summary {
        margin-bottom: 25px;
        text-align: center;
      }
      
      .cv-container.classic .summary p {
        font-size: 12px;
        line-height: 1.6;
        text-align: justify;
        color: #000;
        margin: 0;
        max-width: none;
      }
      
      /* Skills */
      .cv-container.classic .skills {
        margin-bottom: 25px;
      }
      
      .cv-container.classic .skills-categories {
        margin: 15px 0 0 0;
      }
      
      .cv-container.classic .skill-category {
        display: flex;
        margin-bottom: 8px;
        line-height: 1.5;
        font-size: 12px;
      }
      
      .cv-container.classic .skill-category strong {
        font-weight: bold;
        min-width: 140px;
        flex-shrink: 0;
        color: #000;
      }
      
      .cv-container.classic .skill-category span {
        flex: 1;
        color: #000;
      }
      
      /* Experience */
      .cv-container.classic .experience {
        margin-bottom: 25px;
      }
      
      .cv-container.classic .experience-item {
        margin-bottom: 20px;
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
        min-width: 120px;
        font-size: 12px;
        color: #000;
      }
      
      .cv-container.classic .exp-header h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 2px 0;
        color: #000;
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
        margin: 8px 0 0 0;
        font-size: 12px;
        color: #000;
        line-height: 1.5;
      }
      
      /* Achievements */
      .cv-container.classic .achievements {
        margin: 8px 0 0 0;
        padding-left: 20px;
        list-style-type: disc;
      }
      
      .cv-container.classic .achievements li {
        margin-bottom: 4px;
        line-height: 1.5;
        font-size: 12px;
        color: #000;
      }
      
      /* Education */
      .cv-container.classic .education {
        margin-bottom: 25px;
      }
      
      .cv-container.classic .education-item {
        margin-bottom: 15px;
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
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        color: #000;
      }
      
      .cv-container.classic .institution {
        font-size: 12px;
        margin: 2px 0;
        color: #000;
      }
      
      .cv-container.classic .grade {
        margin: 3px 0 0 0;
        font-size: 12px;
        color: #000;
      }
      
      .cv-container.classic .projects {
        margin-bottom: 20px;
      }
      
      .cv-container.classic .project-item {
        margin-bottom: 15px;
      }
      
      .cv-container.classic .project-item h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 5px 0;
        color: #000;
      }
      
      .cv-container.classic .project-description {
        font-size: 13px;
        margin-bottom: 5px;
        line-height: 1.5;
      }
      
      .cv-container.classic .project-tech {
        font-size: 12px;
        margin: 3px 0;
      }
      
      .cv-container.classic .project-link {
        font-size: 12px;
        margin: 3px 0;
      }
      
      .cv-container.classic .certifications {
        margin-bottom: 20px;
      }
      
      .cv-container.classic .certification-item {
        margin-bottom: 10px;
      }
      
      .cv-container.classic .cert-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      
      .cv-container.classic .cert-header h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        color: #000;
      }
      
      .cv-container.classic .cert-date {
        font-size: 12px;
        color: #333;
      }
      
      .cv-container.classic .cert-issuer {
        font-size: 13px;
        margin: 2px 0;
      }
      
      .cv-container.classic .cert-id {
        font-size: 12px;
        color: #333;
        font-style: italic;
      }
      
      .cv-container.classic .languages {
        margin-bottom: 20px;
      }
      
      .cv-container.classic .languages-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .cv-container.classic .language-item {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding: 5px 0;
        border-bottom: 1px solid #ccc;
      }
      
      .cv-container.classic .lang-name {
        font-weight: 600;
      }
      
      .cv-container.classic .lang-level {
        font-weight: normal;
      }
      
      .cv-container.classic .interests {
        margin-bottom: 20px;
      }
      
      .cv-container.classic .interests p {
        font-size: 13px;
        line-height: 1.5;
      }
      
      .cv-container.classic .references {
        margin-bottom: 20px;
      }
      
      .cv-container.classic .reference-item {
        margin-bottom: 15px;
        padding: 10px;
        background: #f5f5f5;
        border: 1px solid #ccc;
      }
      
      .cv-container.classic .reference-item h3 {
        font-size: 14px;
        font-weight: bold;
        margin: 0 0 5px 0;
        color: #000;
      }
      
      .cv-container.classic .ref-position {
        font-size: 13px;
        margin: 2px 0;
      }
      
      .cv-container.classic .ref-contact {
        font-size: 12px;
        margin: 2px 0;
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
                <h3>${exp.position}</h3>
                <p class="company">${exp.company}</p>
              </div>
              <div class="exp-right">
                <p class="location">${exp.location}</p>
                <p class="date">${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</p>
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
                <p class="date">${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}</p>
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
            <h3>${project.name}</h3>
            <p class="project-description">${project.description}</p>
            ${project.technologies && project.technologies.length > 0 ? `
              <p class="project-tech"><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
            ` : ''}
            ${project.url ? `<p class="project-link"><a href="${project.url}">${project.url}</a></p>` : ''}
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
    
    return `
      <section class="languages">
        <h2>Languages</h2>
        <div class="languages-grid">
          ${data.languages.map(lang => `
            <div class="language-item">
              <span class="lang-name">${lang.name}</span>
              <span class="lang-level">${lang.level}</span>
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
    if (!data.references || data.references.length === 0) return ''
    
    return `
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

  // Helper functions
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
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
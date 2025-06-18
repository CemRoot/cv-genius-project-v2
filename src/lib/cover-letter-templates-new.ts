// Dublin Ireland Professional Cover Letter Templates - Real World Standards

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent?: string;
  text: string;
  background: string;
  [key: string]: string | undefined;
}

export interface TemplateStyles {
  container?: string;
  sidebar?: string;
  mainContent?: string;
  header?: string;
  typography?: string;
  colors: TemplateColors;
  [key: string]: any;
}

export interface CoverLetterTemplate {
  id: string;
  name: string;
  category: 'professional' | 'modern' | 'creative' | 'executive' | 'tech' | 'classic' | 'minimal' | 'academic' | 'casual';
  recommended: boolean;
  preview: string;
  styles: TemplateStyles;
  layout: string;
  description?: string;
  features?: string[];
  baseTemplate?: string;
}

export interface CoverLetterContent {
  name: string;
  title?: string;
  email: string;
  phone: string;
  address?: string;
  recipient?: {
    name: string;
    title?: string;
    company: string;
    address?: string;
  };
  date: string;
  salutation: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
  postscript?: string;
}

// 15 Dublin Ireland Professional Cover Letter Templates
const dublinCoverLetterTemplates: Record<string, CoverLetterTemplate> = {
  // Template 1: Dublin Professional (Traditional Irish Business) - Based on Cascade
  'dublin-professional': {
    id: 'dublin-professional',
    name: 'Dublin Professional',
    category: 'professional',
    recommended: true,
    preview: '/images/templates/dublin-professional.jpg',
    baseTemplate: 'cascade',
    styles: {
      container: 'display: table; width: 100%; table-layout: fixed; min-height: 950px; font-family: "Arial", sans-serif; font-size: 16px; line-height: 1.6;',
      sidebar: 'display: table-cell; width: 200px; background: #2c3e50; color: white; padding: 30px; vertical-align: top;',
      mainContent: 'display: table-cell; padding: 30px; vertical-align: top;',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e', 
        text: '#2c3e50',
        background: '#fff'
      }
    },
    layout: 'cascade',
    description: 'Traditional Irish business letter format - most widely used in Dublin',
    features: ['Irish standard format', 'Two-column layout', 'Professional sidebar']
  },

  // Template 2: Trinity Modern (Popular among graduates) - Based on Crisp
  'trinity-modern': {
    id: 'trinity-modern',
    name: 'Trinity Modern',
    category: 'modern',
    recommended: true,
    preview: '/images/templates/trinity-modern.jpg',
    baseTemplate: 'crisp',
    styles: {
      container: 'max-width: 900px; margin: 0 auto; background: white; padding: 60px; font-family: "Arial", sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-height: 950px;',
      header: 'text-align: center; margin-bottom: 50px; border-bottom: 4px solid #0066cc; padding-bottom: 30px;',
      nameSection: 'font-size: 40px; font-weight: bold; color: #0066cc; margin-bottom: 15px;',
      content: 'line-height: 1.7; color: #333; text-align: justify; font-size: 18px;',
      colors: {
        primary: '#0066cc',
        secondary: '#666666',
        text: '#333333',
        background: '#fff'
      }
    },
    layout: 'crisp',
    description: 'Clean modern design favored by Irish university graduates',
    features: ['Centered header', 'Modern typography', 'Professional blue accent']
  },

  // Template 3: Corporate Dublin (Multinational companies) - Based on Concept
  'corporate-dublin': {
    id: 'corporate-dublin',
    name: 'Corporate Dublin',
    category: 'professional',
    recommended: true,
    preview: '/images/templates/corporate-dublin.jpg',
    baseTemplate: 'concept',
    styles: {
      container: 'max-width: 1000px; margin: 0 auto; background: white; display: grid; grid-template-columns: 320px 1fr; min-height: 1100px; box-shadow: 0 0 20px rgba(0,0,0,0.1);',
      sidebar: 'background: #1e3a8a; color: white; padding: 50px 40px;',
      mainContent: 'padding: 50px; background: white; font-family: "Calibri", sans-serif; font-size: 18px;',
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        text: '#1f2937',
        background: '#fff'
      }
    },
    layout: 'corporate-sidebar',
    description: 'Professional sidebar design popular in Dublin\'s IFSC financial district',
    features: ['Corporate sidebar', 'Two-column layout', 'Executive styling']
  },

  // Template 4: Tech Dublin (For Irish tech companies) - Based on Cubic
  'tech-dublin': {
    id: 'tech-dublin',
    name: 'Tech Dublin',
    category: 'tech',
    recommended: false,
    preview: '/images/templates/tech-dublin.jpg',
    baseTemplate: 'cubic',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: #f8fafc; border: 1px solid #e2e8f0; font-family: "Inter", sans-serif; min-height: 1000px;',
      header: 'background: #0f172a; color: white; padding: 40px; text-align: center;',
      content: 'background: white; padding: 40px; margin: 20px; border-radius: 8px; line-height: 1.6;',
      colors: {
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#3b82f6',
        text: '#1e293b',
        background: '#f8fafc'
      }
    },
    layout: 'tech-modern',
    description: 'Modern design for Dublin\'s thriving tech sector (Google, Facebook, LinkedIn)',
    features: ['Tech-focused design', 'Modern typography', 'Clean layout']
  },

  // Template 5: Creative Cork (For creative industries) - Based on Diamond
  'creative-cork': {
    id: 'creative-cork',
    name: 'Creative Cork',
    category: 'creative',
    recommended: false,
    preview: '/images/templates/creative-cork.jpg',
    baseTemplate: 'diamond',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; min-height: 1000px;',
      innerContainer: 'background: white; padding: 50px; height: 100%; font-family: "Georgia", serif;',
      header: 'text-align: left; margin-bottom: 30px; color: #4a5568;',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        text: '#4a5568',
        background: '#fff'
      }
    },
    layout: 'creative-gradient',
    description: 'Creative design with gradient border for design and media roles',
    features: ['Gradient accent', 'Creative layout', 'Artistic flair']
  },

  // Template 6: Executive Dublin (C-level positions) - Based on Enfold
  'executive-dublin': {
    id: 'executive-dublin',
    name: 'Executive Dublin',
    category: 'executive',
    recommended: false,
    preview: '/images/templates/executive-dublin.jpg',
    baseTemplate: 'enfold',
    styles: {
      container: 'max-width: 850px; margin: 0 auto; background: white; min-height: 1000px; font-family: "Garamond", serif;',
      cardContainer: 'padding: 50px; background: white; border-radius: 8px;',
      header: 'background: #2c3e50; color: white; padding: 50px; text-align: center; margin: -50px -50px 50px -50px;',
      content: 'padding: 0 50px 50px 50px; line-height: 1.8; color: #2c3e50;',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#c9a961',
        text: '#2c3e50',
        background: '#fff'
      }
    },
    layout: 'executive-header',
    description: 'Premium executive template for senior leadership positions',
    features: ['Executive styling', 'Premium typography', 'Sophisticated design']
  },

  // Template 7: Banking Dublin (Financial services)
  'banking-dublin': {
    id: 'banking-dublin',
    name: 'Banking Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/banking-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 60px; font-family: "Arial", sans-serif; border: 2px solid #1a365d; min-height: 1000px;',
      header: 'text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1a365d;',
      content: 'line-height: 1.6; color: #2d3748; text-align: justify;',
      colors: {
        primary: '#1a365d',
        secondary: '#2d3748',
        text: '#2d3748',
        background: '#fff'
      }
    },
    layout: 'banking-formal',
    description: 'Conservative design for banking and financial institutions',
    features: ['Banking appropriate', 'Conservative styling', 'Formal layout']
  },

  // Template 8: Healthcare Dublin (Medical professionals)
  'healthcare-dublin': {
    id: 'healthcare-dublin',
    name: 'Healthcare Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/healthcare-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 50px; font-family: "Times New Roman", serif; border-left: 8px solid #059669; min-height: 1000px;',
      header: 'text-align: left; margin-bottom: 30px; color: #047857;',
      content: 'line-height: 1.7; color: #374151;',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        text: '#374151',
        background: '#fff'
      }
    },
    layout: 'healthcare-standard',
    description: 'Professional design for healthcare and medical positions',
    features: ['Medical appropriate', 'Clean design', 'Trustworthy appearance']
  },

  // Template 9: Academic Dublin (Universities and research)
  'academic-dublin': {
    id: 'academic-dublin',
    name: 'Academic Dublin',
    category: 'academic',
    recommended: false,
    preview: '/images/templates/academic-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 60px; font-family: "Times New Roman", serif; line-height: 2; min-height: 1000px;',
      header: 'text-align: center; margin-bottom: 40px; border-bottom: 1px solid #6b7280; padding-bottom: 20px;',
      content: 'color: #374151; text-align: justify;',
      colors: {
        primary: '#374151',
        secondary: '#6b7280',
        text: '#374151',
        background: '#fff'
      }
    },
    layout: 'academic-formal',
    description: 'Traditional academic format for university and research positions',
    features: ['Academic formatting', 'Double spacing', 'Formal structure']
  },

  // Template 10: Startup Dublin (Emerging companies)
  'startup-dublin': {
    id: 'startup-dublin',
    name: 'Startup Dublin',
    category: 'casual',
    recommended: false,
    preview: '/images/templates/startup-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; border: 3px solid #8b5cf6; border-radius: 12px; padding: 40px; font-family: "Inter", sans-serif; min-height: 1000px;',
      header: 'background: #8b5cf6; color: white; padding: 30px; margin: -40px -40px 30px -40px; border-radius: 9px 9px 0 0;',
      content: 'line-height: 1.6; color: #374151;',
      colors: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#f59e0b',
        text: '#374151',
        background: '#fff'
      }
    },
    layout: 'startup-modern',
    description: 'Fresh modern design for startups and innovative companies',
    features: ['Startup vibe', 'Modern styling', 'Colorful design']
  },

  // Template 11: Legal Dublin (Law firms)
  'legal-dublin': {
    id: 'legal-dublin',
    name: 'Legal Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/legal-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 60px; font-family: "Times New Roman", serif; border: 1px solid #4b5563; min-height: 1000px;',
      header: 'text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px double #4b5563;',
      content: 'line-height: 1.8; color: #1f2937; text-align: justify;',
      colors: {
        primary: '#1f2937',
        secondary: '#4b5563',
        text: '#1f2937',
        background: '#fff'
      }
    },
    layout: 'legal-formal',
    description: 'Traditional formal design for legal profession',
    features: ['Legal appropriate', 'Formal typography', 'Traditional layout']
  },

  // Template 12: Pharma Dublin (Pharmaceutical industry)
  'pharma-dublin': {
    id: 'pharma-dublin',
    name: 'Pharma Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/pharma-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 50px; font-family: "Calibri", sans-serif; border-top: 6px solid #dc2626; min-height: 1000px;',
      header: 'text-align: left; margin-bottom: 30px; color: #991b1b;',
      content: 'line-height: 1.6; color: #374151;',
      colors: {
        primary: '#dc2626',
        secondary: '#991b1b',
        text: '#374151',
        background: '#fff'
      }
    },
    layout: 'pharma-standard',
    description: 'Professional design for pharmaceutical and life sciences',
    features: ['Industry appropriate', 'Clean design', 'Professional red accent']
  },

  // Template 13: Government Dublin (Public sector)
  'government-dublin': {
    id: 'government-dublin',
    name: 'Government Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/government-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 60px; font-family: "Arial", sans-serif; min-height: 1000px;',
      header: 'text-align: center; margin-bottom: 40px; color: #065f46; border-bottom: 2px solid #065f46; padding-bottom: 20px;',
      content: 'line-height: 1.7; color: #1f2937; text-align: justify;',
      colors: {
        primary: '#065f46',
        secondary: '#047857',
        text: '#1f2937',
        background: '#fff'
      }
    },
    layout: 'government-formal',
    description: 'Conservative design appropriate for public sector roles',
    features: ['Government appropriate', 'Conservative styling', 'Formal structure']
  },

  // Template 14: Consulting Dublin (Management consulting)
  'consulting-dublin': {
    id: 'consulting-dublin',
    name: 'Consulting Dublin',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/consulting-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 50px; font-family: "Helvetica", sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-height: 1000px;',
      header: 'text-align: left; margin-bottom: 30px; color: #7c2d12; border-left: 4px solid #ea580c; padding-left: 20px;',
      content: 'line-height: 1.6; color: #292524;',
      colors: {
        primary: '#ea580c',
        secondary: '#7c2d12',
        text: '#292524',
        background: '#fff'
      }
    },
    layout: 'consulting-modern',
    description: 'Sharp modern design for management consulting firms',
    features: ['Consulting style', 'Modern typography', 'Professional orange accent']
  },

  // Template 15: Hospitality Dublin (Tourism and hospitality)
  'hospitality-dublin': {
    id: 'hospitality-dublin',
    name: 'Hospitality Dublin',
    category: 'casual',
    recommended: false,
    preview: '/images/templates/hospitality-dublin.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: linear-gradient(to bottom, #fef3c7, #ffffff); padding: 50px; font-family: "Georgia", serif; border-radius: 8px; min-height: 1000px;',
      header: 'text-align: center; margin-bottom: 30px; color: #92400e;',
      content: 'line-height: 1.7; color: #451a03;',
      colors: {
        primary: '#d97706',
        secondary: '#92400e',
        accent: '#fbbf24',
        text: '#451a03',
        background: '#fef3c7'
      }
    },
    layout: 'hospitality-warm',
    description: 'Warm welcoming design for hospitality and tourism industry',
    features: ['Welcoming design', 'Warm colors', 'Hospitality appropriate']
  }
};

// Template Manager Class with Dublin Standards
export class DublinCoverLetterTemplateManager {
  private templates: Record<string, CoverLetterTemplate>;

  constructor() {
    this.templates = dublinCoverLetterTemplates;
    console.log('🚀 Dublin Template Manager initialized with templates:', Object.keys(this.templates));
    console.log('📊 Total templates:', Object.keys(this.templates).length);
  }

  getAllTemplates(): CoverLetterTemplate[] {
    return Object.values(this.templates);
  }

  getRecommendedTemplates(): CoverLetterTemplate[] {
    return Object.values(this.templates).filter(t => t.recommended);
  }

  getTemplatesByCategory(category: string): CoverLetterTemplate[] {
    return Object.values(this.templates).filter(t => t.category === category);
  }

  getTemplate(id: string): CoverLetterTemplate | null {
    console.log('🔍 getTemplate called with ID:', id);
    console.log('📋 Available template keys:', Object.keys(this.templates));
    
    // First try direct lookup
    if (this.templates[id]) {
      console.log('✅ Found template by key:', id);
      return this.templates[id];
    }
    
    // Then try finding by template ID
    const template = Object.values(this.templates).find(t => t.id === id);
    if (template) {
      console.log('✅ Found template by ID search:', id);
    } else {
      console.log('❌ Template not found:', id);
    }
    return template || null;
  }

  generateHTML(templateId: string, content: CoverLetterContent): string {
    console.log('🎯 Dublin Manager generateHTML called:', templateId);
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error('❌ Template not found:', templateId);
      return '';
    }

    console.log('✅ Template found:', template.name, 'baseTemplate:', template.baseTemplate);

    // If template has a baseTemplate, use hybrid approach
    if (template.baseTemplate) {
      console.log('🔄 Using hybrid approach for baseTemplate:', template.baseTemplate);
      const html = this.createHybridHTML(template, content);
      console.log('✅ Hybrid HTML generated, length:', html.length);
      return html;
    }

    console.log('🔄 Using Dublin layout approach');
    const html = this.createDublinLayoutHTML(template, content);
    console.log('✅ Dublin HTML generated, length:', html.length);
    return html;
  }

  generateCSS(templateId: string): string {
    const template = this.getTemplate(templateId);
    if (!template) return '';

    const { colors } = template.styles;
    
    return `
      .cover-letter-template-${templateId} {
        --primary-color: ${colors.primary};
        --secondary-color: ${colors.secondary};
        --accent-color: ${colors.accent || colors.primary};
        --text-color: ${colors.text};
        --bg-color: ${colors.background};
      }
      
      ${this.generateDublinLayoutCSS(template)}
    `;
  }

  private createDublinLayoutHTML(template: CoverLetterTemplate, content: CoverLetterContent): string {
    const { layout, styles } = template;
    
    switch (layout) {
      case 'irish-standard':
        return this.createIrishStandardHTML(content, styles);
      case 'centered-modern':
        return this.createCenteredModernHTML(content, styles);
      case 'corporate-sidebar':
        return this.createCorporateSidebarHTML(content, styles);
      case 'tech-modern':
        return this.createTechModernHTML(content, styles);
      case 'creative-gradient':
        return this.createCreativeGradientHTML(content, styles);
      case 'executive-header':
        return this.createExecutiveHeaderHTML(content, styles);
      default:
        return this.createIrishStandardHTML(content, styles);
    }
  }

  private createHybridHTML(template: CoverLetterTemplate, content: CoverLetterContent): string {
    const { baseTemplate, styles } = template;
    
    // Map baseTemplate to appropriate layout
    switch (baseTemplate) {
      case 'cascade':
        return this.createCascadeHTML(content, styles);
      case 'crisp':
        return this.createCrispHTML(content, styles);
      case 'concept':
        return this.createConceptHTML(content, styles);
      case 'cubic':
        return this.createCubicHTML(content, styles);
      case 'diamond':
        return this.createDiamondHTML(content, styles);
      case 'enfold':
        return this.createEnfoldHTML(content, styles);
      default:
        return this.createIrishStandardHTML(content, styles);
    }
  }

  private createIrishStandardHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper irish-standard" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
          <div class="contact">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="${styles.content}">
          <div class="date" style="text-align: right; margin-bottom: 20px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 20px;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 50px;">Yours sincerely,</p>
            <p><strong>${content.name}</strong></p>
          </div>
          ${content.postscript ? `<p class="postscript" style="margin-top: 20px; font-style: italic;">${content.postscript}</p>` : ''}
        </div>
      </div>
    `;
  }

  private createCenteredModernHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper centered-modern" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name" style="font-size: 32px; margin: 0 0 10px 0; color: var(--primary-color);">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 18px; color: var(--secondary-color);">${content.title}</p>` : ''}
          <div class="contact" style="margin-top: 20px;">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="${styles.content}">
          <div class="date" style="text-align: right; margin-bottom: 30px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 20px; font-weight: 600;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 50px;">Yours sincerely,</p>
            <p><strong>${content.name}</strong></p>
          </div>
        </div>
      </div>
    `;
  }

  private createCorporateSidebarHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper corporate-sidebar" style="${styles.container}">
        <div class="sidebar" style="${styles.sidebar}">
          <h2 class="name" style="font-size: 28px; margin-bottom: 15px;">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 16px; margin-bottom: 25px; opacity: 0.9;">${content.title}</p>` : ''}
          <div class="contact">
            <div style="margin-bottom: 15px;">
              <strong>Contact</strong>
            </div>
            <p style="margin: 8px 0;">${content.email}</p>
            <p style="margin: 8px 0;">${content.phone}</p>
            ${content.address ? `<p style="margin: 8px 0;">${content.address}</p>` : ''}
          </div>
        </div>
        <div class="main-content" style="${styles.mainContent}">
          <div class="date" style="text-align: right; margin-bottom: 30px; color: #6b7280;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 25px; font-weight: 600; font-size: 16px;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px; line-height: 1.7;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px; line-height: 1.7;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 35px; line-height: 1.7;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 50px;">Yours sincerely,</p>
            <p style="font-weight: 600; font-size: 16px;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createTechModernHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper tech-modern" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name" style="font-size: 32px; margin: 0 0 10px 0;">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 18px; opacity: 0.9;">${content.title}</p>` : ''}
          <div class="contact" style="margin-top: 20px;">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="${styles.content}">
          <div class="date" style="text-align: right; margin-bottom: 25px; color: #64748b;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 25px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 20px; font-weight: 500;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 18px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 18px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 40px;">Best regards,</p>
            <p style="font-weight: 500;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createCreativeGradientHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper creative-gradient" style="${styles.container}">
        <div class="inner-container" style="${styles.innerContainer}">
          <div class="header" style="${styles.header}">
            <h2 class="name" style="font-size: 32px; margin: 0 0 10px 0; color: var(--primary-color);">${content.name}</h2>
            ${content.title ? `<p class="title" style="font-size: 18px; color: var(--secondary-color);">${content.title}</p>` : ''}
            <div class="contact" style="margin-top: 20px;">
              <p>${content.email} | ${content.phone}</p>
              ${content.address ? `<p>${content.address}</p>` : ''}
            </div>
          </div>
          <div class="content">
            <div class="date" style="text-align: right; margin-bottom: 25px; color: #6b7280;">${content.date}</div>
            ${content.recipient ? `
              <div class="recipient" style="margin-bottom: 25px;">
                <p><strong>${content.recipient.name}</strong></p>
                ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
                <p>${content.recipient.company}</p>
                ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
              </div>
            ` : ''}
            <p class="salutation" style="margin-bottom: 20px; font-weight: 500;">${content.salutation}</p>
            <p class="opening" style="margin-bottom: 18px;">${content.opening}</p>
            ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 18px;">${paragraph}</p>`).join('')}
            <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
            <div class="signature">
              <p style="margin-bottom: 40px;">Best regards,</p>
              <p style="font-weight: 500;">${content.name}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private createExecutiveHeaderHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper executive-header" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name" style="font-size: 36px; margin: 0 0 15px 0; text-align: center;">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 20px; text-align: center; margin-bottom: 25px; opacity: 0.9;">${content.title}</p>` : ''}
          <div class="contact" style="text-align: center;">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="${styles.content}">
          <div class="date" style="text-align: right; margin-bottom: 30px; color: #6b7280;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 25px; font-weight: 600; font-size: 18px;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px; line-height: 1.8;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px; line-height: 1.8;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 35px; line-height: 1.8;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 50px;">Yours sincerely,</p>
            <p style="font-weight: 600; font-size: 18px;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Base Template HTML Generation Methods
  private createCascadeHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-cascade" style="${styles.container}; ${cssVariables}">
        <div class="sidebar" style="${styles.sidebar}">
          <h2 class="name" style="font-size: 42px; line-height: 48px; font-weight: bold; margin-bottom: 20px; color: white;">${content.name}</h2>
          ${content.title ? `<p class="title" style="margin-bottom: 25px; font-size: 20px; opacity: 0.9;">${content.title}</p>` : ''}
          <div class="contact" style="font-size: 18px;">
            <p style="margin: 12px 0;">${content.email}</p>
            <p style="margin: 12px 0;">${content.phone}</p>
            ${content.address ? `<p style="margin: 12px 0;">${content.address}</p>` : ''}
          </div>
        </div>
        <div class="main-content" style="${styles.mainContent}; font-size: 18px; line-height: 1.6;">
          <div class="date" style="text-align: right; margin-bottom: 25px; font-size: 18px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px; font-size: 18px;">
              <p style="margin: 6px 0;"><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p style="margin: 6px 0;">${content.recipient.title}</p>` : ''}
              <p style="margin: 6px 0;">${content.recipient.company}</p>
              ${content.recipient.address ? `<p style="margin: 6px 0;">${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 25px; font-size: 18px; font-weight: 600;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px; font-size: 18px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px; font-size: 18px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px; font-size: 18px;">${content.closing}</p>
          <div class="signature" style="font-size: 18px;">
            <p style="margin-bottom: 40px;">Yours sincerely,</p>
            <p style="font-weight: bold;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createCrispHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-crisp" style="${styles.container}; ${cssVariables}">
        <div class="header" style="${styles.header}">
          <h2 class="name" style="${styles.nameSection}">${content.name}</h2>
          ${content.title ? `<p class="title" style="margin-bottom: 20px; font-size: 22px; color: #666;">${content.title}</p>` : ''}
          <div class="contact" style="font-size: 18px; color: #666;">
            <span>${content.email}</span> | <span>${content.phone}</span>
            ${content.address ? ` | <span>${content.address}</span>` : ''}
          </div>
        </div>
        <div class="content" style="${styles.content}">
          <div class="date" style="text-align: right; margin-bottom: 25px; font-size: 18px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 25px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 18px; font-weight: 600;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 16px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 16px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 25px;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 40px;">Yours sincerely,</p>
            <p style="font-weight: 600;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createConceptHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-concept" style="border-left: 200px solid var(--primary-color); padding: 40px 30px; font-family: 'Arial', sans-serif; min-height: 950px; ${cssVariables}">
        <div class="header" style="margin-bottom: 35px;">
          <h2 class="name" style="font-size: 50px; line-height: 58px; color: var(--primary-color); font-weight: bold; margin-bottom: 15px;">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 24px; margin-bottom: 25px; color: #666;">${content.title}</p>` : ''}
          <div class="contact-section" style="display: table; width: 60%;">
            <div class="icon-row" style="display: flex; align-items: center; margin-bottom: 15px; font-size: 18px;">
              <span style="width: 30px; height: 30px; margin-right: 15px; font-size: 22px;">📧</span>
              <span>${content.email}</span>
            </div>
            <div class="icon-row" style="display: flex; align-items: center; margin-bottom: 15px; font-size: 18px;">
              <span style="width: 30px; height: 30px; margin-right: 15px; font-size: 22px;">📞</span>
              <span>${content.phone}</span>
            </div>
            ${content.address ? `
              <div class="icon-row" style="display: flex; align-items: center; margin-bottom: 15px; font-size: 18px;">
                <span style="width: 30px; height: 30px; margin-right: 15px; font-size: 22px;">📍</span>
                <span>${content.address}</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="content" style="font-size: 18px;">
          <div class="date" style="text-align: right; margin-bottom: 25px; font-size: 18px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 30px; font-size: 18px;">
              <p style="margin: 6px 0;"><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p style="margin: 6px 0;">${content.recipient.title}</p>` : ''}
              <p style="margin: 6px 0;">${content.recipient.company}</p>
              ${content.recipient.address ? `<p style="margin: 6px 0;">${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 22px; font-weight: 600; font-size: 18px;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 20px; font-size: 18px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 20px; font-size: 18px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px; font-size: 18px;">${content.closing}</p>
          <div class="signature" style="font-size: 18px;">
            <p style="margin-bottom: 45px;">Yours sincerely,</p>
            <p style="font-weight: 600;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createCubicHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-cubic" style="display: table; min-height: 792px; width: 100%; table-layout: fixed; ${cssVariables}">
        <div class="top-section" style="background: var(--primary-color); color: white; padding: 15px;">
          <h2 class="name" style="font-size: 28px; margin: 0;">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
        </div>
        <div style="display: table-row;">
          <div class="left-column" style="display: table-cell; padding: 15px; vertical-align: top;">
            <div class="date" style="margin-bottom: 20px;">${content.date}</div>
            ${content.recipient ? `
              <div class="recipient" style="margin-bottom: 25px;">
                <p><strong>${content.recipient.name}</strong></p>
                ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
                <p>${content.recipient.company}</p>
                ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
              </div>
            ` : ''}
            <p class="salutation" style="margin-bottom: 18px; font-weight: 600;">${content.salutation}</p>
            <p class="opening" style="margin-bottom: 16px;">${content.opening}</p>
            ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 16px;">${paragraph}</p>`).join('')}
            <p class="closing" style="margin-bottom: 25px;">${content.closing}</p>
            <div class="signature">
              <p style="margin-bottom: 40px;">Yours sincerely,</p>
              <p style="font-weight: 600;">${content.name}</p>
            </div>
          </div>
          <div class="right-column" style="display: table-cell; width: 154px; background: #f4f4f4; padding: 15px; vertical-align: top;">
            <div class="contact">
              <h4>Contact</h4>
              <p>${content.email}</p>
              <p>${content.phone}</p>
              ${content.address ? `<p>${content.address}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private createDiamondHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-diamond" style="padding: 60px 40px; margin-bottom: 24px; font-family: 'Century Gothic', sans-serif; ${cssVariables}">
        <div class="header-section" style="background: var(--primary-color); color: white; margin: -40px; padding: 40px; position: relative;">
          <h2 class="name" style="color: white; font-size: 35px; line-height: 45px; z-index: 2; position: relative; margin: 0;">${content.name}</h2>
          ${content.title ? `<p class="title" style="font-size: 18px; margin-top: 10px;">${content.title}</p>` : ''}
          <div class="contact" style="margin-top: 20px;">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="padding: 40px 0;">
          <div class="date" style="text-align: right; margin-bottom: 25px;">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient" style="margin-bottom: 25px;">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation" style="margin-bottom: 20px; font-weight: 600;">${content.salutation}</p>
          <p class="opening" style="margin-bottom: 18px;">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 18px;">${paragraph}</p>`).join('')}
          <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
          <div class="signature">
            <p style="margin-bottom: 40px;">Yours sincerely,</p>
            <p style="font-weight: 600;">${content.name}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createEnfoldHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    const cssVariables = `
      --primary-color: ${styles.colors.primary};
      --secondary-color: ${styles.colors.secondary};
      --text-color: ${styles.colors.text};
      --bg-color: ${styles.colors.background};
    `;
    
    return `
      <div class="cover-letter-wrapper template-enfold" style="${styles.container}; ${cssVariables}">
        <div class="card-container" style="${styles.cardContainer}">
          <div class="header" style="${styles.header}">
            <h2 class="name" style="font-size: 32px; font-weight: bold; color: var(--primary-color); margin-bottom: 10px;">${content.name}</h2>
            ${content.title ? `<p class="title" style="font-size: 18px; color: var(--secondary-color);">${content.title}</p>` : ''}
            <div class="contact" style="margin-top: 20px;">
              <span>${content.email}</span> | <span>${content.phone}</span>
              ${content.address ? ` | <span>${content.address}</span>` : ''}
            </div>
          </div>
          <div class="content" style="${styles.content}">
            <div class="date" style="text-align: right; margin-bottom: 25px; color: var(--secondary-color);">${content.date}</div>
            ${content.recipient ? `
              <div class="recipient" style="margin-bottom: 25px;">
                <p><strong>${content.recipient.name}</strong></p>
                ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
                <p>${content.recipient.company}</p>
                ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
              </div>
            ` : ''}
            <p class="salutation" style="margin-bottom: 20px; font-weight: 600;">${content.salutation}</p>
            <p class="opening" style="margin-bottom: 18px;">${content.opening}</p>
            ${content.body.map(paragraph => `<p class="body-paragraph" style="margin-bottom: 18px;">${paragraph}</p>`).join('')}
            <p class="closing" style="margin-bottom: 30px;">${content.closing}</p>
            <div class="signature">
              <p style="margin-bottom: 40px;">Yours sincerely,</p>
              <p style="font-weight: 600;">${content.name}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generateDublinLayoutCSS(template: CoverLetterTemplate): string {
    const { layout, styles } = template;
    
    return `
      .cover-letter-template-${template.id} {
        ${styles.container || ''}
      }
      
      .cover-letter-template-${template.id} .header {
        ${styles.header || ''}
      }
      
      .cover-letter-template-${template.id} .content {
        ${styles.content || ''}
      }

      .cover-letter-template-${template.id} .sidebar {
        ${styles.sidebar || ''}
      }

      .cover-letter-template-${template.id} .main-content {
        ${styles.mainContent || ''}
      }
    `;
  }

  getTemplateCategories(): string[] {
    const categories = new Set(Object.values(this.templates).map(t => t.category));
    return Array.from(categories);
  }

  searchTemplates(query: string): CoverLetterTemplate[] {
    const searchTerm = query.toLowerCase();
    return Object.values(this.templates).filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm) ||
      template.description?.toLowerCase().includes(searchTerm) ||
      template.features?.some(feature => feature.toLowerCase().includes(searchTerm))
    );
  }
}

// Export singleton instance
export const dublinTemplateManager = new DublinCoverLetterTemplateManager();

// Export template configurations for direct access
export { dublinCoverLetterTemplates };

// Helper function to create template preview with Dublin standards
export function createDublinTemplatePreview(templateId: string, sampleData?: Partial<CoverLetterContent>): string {
  const defaultData: CoverLetterContent = {
    name: 'John O\'Sullivan',
    title: 'Software Developer',
    email: 'john.osullivan@email.com',
    phone: '+353 1 234 5678',
    address: 'Dublin 2, Ireland',
    recipient: {
      name: 'Ms. Sarah Murphy',
      title: 'Hiring Manager',
      company: 'Tech Ireland Ltd',
      address: 'IFSC, Dublin 1'
    },
    date: new Date().toLocaleDateString('en-IE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    salutation: 'Dear Ms. Murphy',
    opening: 'I am writing to express my strong interest in the Software Developer position at Tech Ireland Ltd. Having followed your company\'s impressive growth in the Irish tech sector, I am excited about the opportunity to contribute to your team.',
    body: [
      'With over 3 years of experience in software development, I have successfully delivered multiple projects using modern technologies including React, Node.js, and TypeScript. My experience working with Irish and international clients has given me valuable insights into both local market requirements and global best practices.',
      'In my current role at Dublin Tech Solutions, I have led the development of a customer portal that serves over 50,000 users across Ireland and the UK. This project improved customer satisfaction by 35% and reduced support queries by 40%.',
      'I am particularly drawn to Tech Ireland Ltd because of your commitment to innovation and your reputation as one of Ireland\'s most employee-friendly tech companies. Your recent expansion into European markets aligns perfectly with my interest in international software solutions.'
    ],
    closing: 'Thank you for considering my application. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to Tech Ireland Ltd\'s continued success. I look forward to hearing from you.',
    signature: 'Yours sincerely,\nJohn O\'Sullivan'
  };

  const content = { ...defaultData, ...sampleData };
  return dublinTemplateManager.generateHTML(templateId, content);
}
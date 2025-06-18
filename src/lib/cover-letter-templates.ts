// Cover Letter Template Manager - CVGenius için geliştirilmiş template sistemi

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

// 15 Premium Cover Letter Templates - Dublin Ireland Professional Standards
const coverLetterTemplates: Record<string, CoverLetterTemplate> = {
  // Template 1: Dublin Professional (Most Popular in Ireland)
  dublinProfessional: {
    id: 'dublin-professional',
    name: 'Dublin Professional',
    category: 'professional',
    recommended: true,
    preview: '/images/templates/dublin-professional.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; min-height: 1000px; box-shadow: 0 0 20px rgba(0,0,0,0.1); font-family: "Times New Roman", serif;',
      header: 'text-align: left; padding: 40px 60px 20px 60px; border-bottom: none;',
      content: 'padding: 0 60px 60px 60px; line-height: 1.6;',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e', 
        text: '#2c3e50',
        background: '#fff'
      }
    },
    layout: 'irish-standard',
    description: 'Traditional Irish business letter format - most widely used in Dublin',
    features: ['Irish standard format', 'Traditional layout', 'Professional typography']
  },

  // Template 2: Trinity Modern (Popular among Irish graduates)
  trinityModern: {
    id: 'trinity-modern',
    name: 'Trinity Modern',
    category: 'modern',
    recommended: true,
    preview: '/images/templates/trinity-modern.jpg',
    styles: {
      container: 'max-width: 800px; margin: 0 auto; background: white; padding: 50px; font-family: "Arial", sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,0.1);',
      header: 'text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0066cc; padding-bottom: 20px;',
      content: 'line-height: 1.7; color: #333;',
      colors: {
        primary: '#0066cc',
        secondary: '#666666',
        text: '#333333',
        background: '#fff'
      }
    },
    layout: 'centered-modern',
    description: 'Clean modern design favored by Irish university graduates',
    features: ['Centered header', 'Modern typography', 'Professional blue accent']
  },

  // Template 3: Concept (Creative Professional)
  concept: {
    id: 'concept',
    name: 'Concept',
    category: 'creative',
    recommended: true,
    preview: '/images/templates/concept.jpg',
    styles: {
      container: 'border-left: 120px solid #102a73; padding: 25px 12px; word-break: break-word; box-sizing: border-box;',
      header: 'color: #102a73; font-size: 35px; line-height: 45px; font-weight: bold;',
      iconElements: 'width: 20px; height: 20px; margin-right: 5px;',
      colors: {
        primary: '#102a73',
        secondary: '#002e58',
        accent: '#fff',
        text: '#000',
        background: '#fff'
      }
    },
    layout: 'creative-border',
    description: 'Creative design with distinctive left border and icons',
    features: ['Creative border', 'Icon integration', 'Bold typography']
  },

  // Template 4: Iconic (Tech Modern)
  iconic: {
    id: 'iconic',
    name: 'Iconic',
    category: 'tech',
    recommended: false,
    preview: '/images/templates/iconic.jpg',
    styles: {
      container: 'padding: 24px 40px; font-family: Century Gothic; color: #000;',
      header: 'color: #102a73; font-size: 35px; line-height: 45px;',
      iconGrid: 'display: table; width: 40%;',
      colors: {
        primary: '#102a73',
        secondary: '#000',
        text: '#000',
        background: '#fff'
      }
    },
    layout: 'icon-enhanced',
    description: 'Modern template with integrated icon system',
    features: ['Icon system', 'Modern layout', 'Tech-friendly']
  },

  // Template 5: Diamond (Executive Elite)
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    category: 'executive',
    recommended: false,
    preview: '/images/templates/diamond.jpg',
    styles: {
      container: 'padding: 60px 40px; margin-bottom: 24px; font-family: Century Gothic;',
      header: 'background: #102a73; color: white; margin: -40px; padding: 40px; position: relative;',
      nameSection: 'color: white; font-size: 35px; line-height: 45px; z-index: 2; position: relative;',
      colors: {
        primary: '#102a73',
        secondary: '#373d48',
        text: '#333',
        background: '#fff'
      }
    },
    layout: 'executive-header',
    description: 'Premium executive template with full-width header',
    features: ['Executive styling', 'Premium appearance', 'Full-width header']
  },

  // Template 6: Cubic (Two Column Pro)
  cubic: {
    id: 'cubic',
    name: 'Cubic',
    category: 'professional',
    recommended: false,
    preview: '/images/templates/cubic.jpg',
    styles: {
      container: 'display: table; min-height: 792px; width: 100%; table-layout: fixed;',
      topSection: 'background: #102a73; color: white; padding: 15px;',
      leftColumn: 'display: table-cell; padding: 15px; vertical-align: top;',
      rightColumn: 'display: table-cell; width: 154px; background: #f4f4f4; padding: 15px; vertical-align: top;',
      colors: {
        primary: '#102a73',
        secondary: '#f4f4f4',
        text: '#343434',
        background: '#fff'
      }
    },
    layout: 'three-section',
    description: 'Professional layout with distinct sections',
    features: ['Three sections', 'Color blocks', 'Structured layout']
  },

  // Template 7: Gradient Flow (Modern Gradient)
  gradientFlow: {
    id: 'gradient-flow',
    name: 'Gradient Flow',
    category: 'modern',
    recommended: false,
    preview: '/images/templates/gradient-flow.jpg',
    styles: {
      container: 'background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 40px; border-radius: 12px;',
      header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold;',
      content: 'background: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 8px; backdrop-filter: blur(10px);',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f5f7fa',
        text: '#4a5568',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }
    },
    layout: 'gradient-modern',
    description: 'Modern gradient design with glassmorphism effects',
    features: ['Gradient background', 'Glassmorphism', 'Modern aesthetics']
  },

  // Template 8: Bold Statement (High Impact)
  boldStatement: {
    id: 'bold-statement',
    name: 'Bold Statement',
    category: 'creative',
    recommended: false,
    preview: '/images/templates/bold-statement.jpg',
    styles: {
      container: 'background: #000; color: #fff; padding: 50px; min-height: 100vh;',
      header: 'font-size: 48px; font-weight: 900; text-transform: uppercase; margin-bottom: 30px;',
      accent: 'background: #ff0066; color: #fff; padding: 8px 20px; display: inline-block; margin: 10px 0;',
      colors: {
        primary: '#ff0066',
        secondary: '#fff',
        text: '#fff',
        background: '#000'
      }
    },
    layout: 'high-impact',
    description: 'Bold and striking design for creative professionals',
    features: ['High contrast', 'Bold typography', 'Creative impact']
  },

  // Template 9: Elegant Serif (Classic Professional)
  elegantSerif: {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    category: 'classic',
    recommended: false,
    preview: '/images/templates/elegant-serif.jpg',
    styles: {
      container: 'background: #f7f3f0; padding: 60px; font-family: "Cormorant Garamond", serif;',
      header: 'font-size: 36px; color: #2c1810; text-align: center; margin-bottom: 40px;',
      typography: 'font-family: "Cormorant Garamond", serif; line-height: 1.8;',
      colors: {
        primary: '#2c1810',
        secondary: '#8b7355',
        accent: '#c9a961',
        text: '#2c1810',
        background: '#f7f3f0'
      }
    },
    layout: 'classic-elegant',
    description: 'Elegant serif typography with classic styling',
    features: ['Serif typography', 'Classic elegance', 'Warm colors']
  },

  // Template 10: Startup Vibe (Casual Modern)
  startupVibe: {
    id: 'startup-vibe',
    name: 'Startup Vibe',
    category: 'casual',
    recommended: false,
    preview: '/images/templates/startup-vibe.jpg',
    styles: {
      container: 'background: #fff; border: 3px solid #6366f1; border-radius: 12px; padding: 30px; margin: 20px;',
      header: 'background: #6366f1; color: white; padding: 30px; margin: -30px -30px 30px -30px; border-radius: 9px 9px 0 0;',
      chips: 'display: inline-block; background: #e0e7ff; color: #6366f1; padding: 6px 16px; border-radius: 20px; margin: 5px; font-size: 14px;',
      colors: {
        primary: '#6366f1',
        secondary: '#e0e7ff',
        accent: '#f59e0b',
        text: '#374151',
        background: '#fff'
      }
    },
    layout: 'startup-fresh',
    description: 'Fresh and modern design perfect for startups',
    features: ['Modern styling', 'Colorful elements', 'Startup aesthetic']
  },

  // Template 11: Academic Scholar (Formal Academic)
  academicScholar: {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    category: 'academic',
    recommended: false,
    preview: '/images/templates/academic-scholar.jpg',
    styles: {
      container: 'font-family: "Times New Roman", serif; line-height: 2; padding: 40px 60px; max-width: 8.5in;',
      header: 'text-align: center; font-size: 18px; margin-bottom: 40px; border-bottom: 1px solid #000; padding-bottom: 10px;',
      typography: 'font-family: "Times New Roman", serif; font-size: 12pt; line-height: 2;',
      colors: {
        primary: '#000',
        secondary: '#333',
        text: '#000',
        background: '#fff'
      }
    },
    layout: 'academic-format',
    description: 'Traditional academic format with formal styling',
    features: ['Academic formatting', 'Formal appearance', 'Traditional layout']
  },

  // Template 12: Creative Agency (Asymmetric Design)
  creativeAgency: {
    id: 'creative-agency',
    name: 'Creative Agency',
    category: 'creative',
    recommended: false,
    preview: '/images/templates/creative-agency.jpg',
    styles: {
      container: 'display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 40px; transform: rotate(-1deg); background: #fff;',
      leftPanel: 'transform: rotate(1deg); background: #ff006e; color: #fff; padding: 30px; border-radius: 20px;',
      rightPanel: 'transform: rotate(1deg); background: #3a0ca3; color: #fff; padding: 30px; border-radius: 20px;',
      colors: {
        primary: '#ff006e',
        secondary: '#3a0ca3',
        accent: '#f72585',
        text: '#fff',
        background: '#fff'
      }
    },
    layout: 'asymmetric-creative',
    description: 'Bold asymmetric design for creative agencies',
    features: ['Asymmetric layout', 'Bold colors', 'Creative rotation']
  },

  // Template 13: Swiss Design (Minimal Grid)
  swissDesign: {
    id: 'swiss-design',
    name: 'Swiss Design',
    category: 'minimal',
    recommended: false,
    preview: '/images/templates/swiss-design.jpg',
    styles: {
      container: 'display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; padding: 40px; font-family: "Helvetica Neue", sans-serif;',
      header: 'grid-column: 1 / 13; font-size: 32px; font-weight: 300; margin-bottom: 20px;',
      redAccent: 'background: #e30613; color: #fff; padding: 10px;',
      colors: {
        primary: '#000',
        secondary: '#e30613',
        text: '#000',
        background: '#fff'
      }
    },
    layout: 'swiss-grid',
    description: 'Clean Swiss design principles with grid system',
    features: ['Grid system', 'Minimal design', 'Swiss typography']
  },

  // Template 14: Retro Classic (Vintage Style)
  retroClassic: {
    id: 'retro-classic',
    name: 'Retro Classic',
    category: 'classic',
    recommended: false,
    preview: '/images/templates/retro-classic.jpg',
    styles: {
      container: 'background: #fef5e7; color: #34495e; padding: 50px; font-family: "Courier New", monospace;',
      header: 'border: 3px double #34495e; padding: 20px; text-align: center; margin-bottom: 30px;',
      typewriter: 'font-family: "Courier New", monospace; letter-spacing: 0.5px;',
      colors: {
        primary: '#34495e',
        secondary: '#e74c3c',
        accent: '#f39c12',
        text: '#34495e',
        background: '#fef5e7'
      }
    },
    layout: 'vintage-typewriter',
    description: 'Nostalgic typewriter-style design',
    features: ['Typewriter font', 'Vintage styling', 'Retro colors']
  },

  // Template 15: Interactive Digital (Modern Tech)
  interactiveDigital: {
    id: 'interactive-digital',
    name: 'Interactive Digital',
    category: 'tech',
    recommended: false,
    preview: '/images/templates/interactive-digital.jpg',
    styles: {
      container: 'background: #0f0f23; color: #00ff41; padding: 40px; font-family: "Fira Code", monospace; border-radius: 8px;',
      header: 'text-shadow: 0 0 10px #00ff41; font-size: 28px; margin-bottom: 20px; animation: glow 2s ease-in-out infinite alternate;',
      glowEffect: 'text-shadow: 0 0 10px currentColor;',
      codeBlock: 'background: rgba(0, 255, 65, 0.1); border: 1px solid #00ff41; padding: 15px; border-radius: 4px; margin: 10px 0;',
      colors: {
        primary: '#00ff41',
        secondary: '#008f11',
        accent: '#ff0040',
        text: '#00ff41',
        background: '#0f0f23'
      }
    },
    layout: 'digital-terminal',
    description: 'Futuristic terminal-style design for tech professionals',
    features: ['Terminal styling', 'Glow effects', 'Tech aesthetic']
  },

  // Template 16: Cascade (Sidebar Professional)
  cascade: {
    id: 'cascade',
    name: 'Cascade',
    category: 'professional',
    recommended: true,
    preview: '/images/templates/cascade.jpg',
    styles: {
      container: 'display: table; width: 100%; table-layout: fixed; min-height: 792px; font-family: "Century Gothic", sans-serif; font-size: 10px; line-height: 15px;',
      sidebar: 'display: table-cell; width: 154px; background: #102a73; color: white; padding: 15px; vertical-align: top;',
      mainContent: 'display: table-cell; padding: 15px; letter-spacing: 0.2px; vertical-align: top;',
      header: 'margin-bottom: 20px;',
      colors: {
        primary: '#102a73',
        secondary: '#ffffff',
        text: '#000000',
        background: '#ffffff'
      }
    },
    layout: 'two-column-left',
    description: 'Professional sidebar layout with blue accent',
    features: ['Two-column layout', 'Professional sidebar', 'Clean typography']
  },

  // Template 17: Crisp (Clean Modern)
  crisp: {
    id: 'crisp',
    name: 'Crisp',
    category: 'modern',
    recommended: true,
    preview: '/images/templates/crisp.jpg',
    styles: {
      container: 'font-family: "Century Gothic", sans-serif; padding: 24px 40px; max-width: 800px; margin: 0 auto; background: white;',
      header: 'border-bottom: 1px solid #d5d6d6; padding-bottom: 2px; margin-bottom: 10px;',
      content: 'line-height: 1.6; color: #333;',
      nameSection: 'font-size: 35px; line-height: 38px; color: #102a73; font-weight: bold;',
      colors: {
        primary: '#102a73',
        secondary: '#d5d6d6',
        text: '#333333',
        background: '#ffffff'
      }
    },
    layout: 'single-column',
    description: 'Clean and crisp modern design with subtle borders',
    features: ['Single column', 'Modern typography', 'Subtle accents']
  },

  // Template 18: Enfold (Card-Based Layout)
  enfold: {
    id: 'enfold',
    name: 'Enfold',
    category: 'executive',
    recommended: false,
    preview: '/images/templates/enfold.jpg',
    styles: {
      container: 'max-width: 850px; margin: 0 auto; background: #f8f9fa; padding: 40px; min-height: 1000px;',
      cardContainer: 'background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); padding: 50px; border-top: 6px solid #102a73;',
      header: 'text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef;',
      content: 'line-height: 1.7; color: #495057;',
      colors: {
        primary: '#102a73',
        secondary: '#6c757d',
        accent: '#e9ecef',
        text: '#495057',
        background: '#f8f9fa'
      }
    },
    layout: 'card-based',
    description: 'Executive card-based design with elegant shadow effects',
    features: ['Card layout', 'Shadow effects', 'Executive styling']
  }
};

// Template Manager Class
export class CoverLetterTemplateManager {
  private templates: Record<string, CoverLetterTemplate>;

  constructor() {
    this.templates = coverLetterTemplates;
  }

  // Get all templates
  getAllTemplates(): CoverLetterTemplate[] {
    return Object.values(this.templates);
  }

  // Get recommended templates
  getRecommendedTemplates(): CoverLetterTemplate[] {
    return Object.values(this.templates).filter(t => t.recommended);
  }

  // Get templates by category
  getTemplatesByCategory(category: string): CoverLetterTemplate[] {
    return Object.values(this.templates).filter(t => t.category === category);
  }

  // Get single template
  getTemplate(id: string): CoverLetterTemplate | null {
    return this.templates[id] || null;
  }

  // Generate HTML for template
  generateHTML(templateId: string, content: CoverLetterContent): string {
    const template = this.getTemplate(templateId);
    if (!template) return '';

    return this.createLayoutHTML(template, content);
  }

  // Generate CSS for template
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
      
      ${this.generateLayoutCSS(template)}
    `;
  }

  // Create layout-specific HTML
  private createLayoutHTML(template: CoverLetterTemplate, content: CoverLetterContent): string {
    const { layout, styles } = template;
    
    switch (layout) {
      case 'two-column-left':
        return this.createTwoColumnLeftHTML(content, styles);
      case 'single-column':
        return this.createSingleColumnHTML(content, styles);
      case 'creative-border':
        return this.createCreativeBorderHTML(content, styles);
      case 'executive-header':
        return this.createExecutiveHeaderHTML(content, styles);
      case 'card-based':
        return this.createCardBasedHTML(content, styles);
      default:
        return this.createDefaultHTML(content, styles);
    }
  }

  // Generate layout-specific CSS
  private generateLayoutCSS(template: CoverLetterTemplate): string {
    const { layout, styles } = template;
    
    return `
      .template-${template.id} {
        ${styles.container || ''}
      }
      
      .template-${template.id} .header {
        ${styles.header || ''}
      }
      
      .template-${template.id} .content {
        ${styles.typography || ''}
      }
    `;
  }

  // Layout creation methods
  private createTwoColumnLeftHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper two-column-left" style="${styles.container}">
        <div class="sidebar" style="${styles.sidebar}">
          <h2 class="name">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
          <div class="contact">
            <p>${content.email}</p>
            <p>${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="main-content" style="${styles.mainContent}">
          <div class="date">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation">${content.salutation}</p>
          <p class="opening">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph">${paragraph}</p>`).join('')}
          <p class="closing">${content.closing}</p>
          <p class="signature">${content.signature}</p>
          ${content.postscript ? `<p class="postscript">${content.postscript}</p>` : ''}
        </div>
      </div>
    `;
  }

  private createSingleColumnHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper single-column" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
          <div class="contact">
            <span>${content.email}</span> | <span>${content.phone}</span>
            ${content.address ? ` | <span>${content.address}</span>` : ''}
          </div>
        </div>
        <div class="content">
          <div class="date">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
              ${content.recipient.address ? `<p>${content.recipient.address}</p>` : ''}
            </div>
          ` : ''}
          <p class="salutation">${content.salutation}</p>
          <p class="opening">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph">${paragraph}</p>`).join('')}
          <p class="closing">${content.closing}</p>
          <p class="signature">${content.signature}</p>
          ${content.postscript ? `<p class="postscript">${content.postscript}</p>` : ''}
        </div>
      </div>
    `;
  }

  private createCreativeBorderHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper creative-border" style="${styles.container}">
        <div class="header" style="${styles.header}">
          <h2 class="name">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
        </div>
        <div class="contact-section">
          <div class="contact-info">
            <p>${content.email}</p>
            <p>${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content">
          <div class="date">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
            </div>
          ` : ''}
          <p class="salutation">${content.salutation}</p>
          <p class="opening">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph">${paragraph}</p>`).join('')}
          <p class="closing">${content.closing}</p>
          <p class="signature">${content.signature}</p>
          ${content.postscript ? `<p class="postscript">${content.postscript}</p>` : ''}
        </div>
      </div>
    `;
  }

  private createExecutiveHeaderHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper executive-header">
        <div class="header-section" style="${styles.header}">
          <h2 class="name" style="${styles.nameSection}">${content.name}</h2>
          ${content.title ? `<p class="title">${content.title}</p>` : ''}
          <div class="contact">
            <p>${content.email} | ${content.phone}</p>
            ${content.address ? `<p>${content.address}</p>` : ''}
          </div>
        </div>
        <div class="content" style="padding: 40px;">
          <div class="date">${content.date}</div>
          ${content.recipient ? `
            <div class="recipient">
              <p><strong>${content.recipient.name}</strong></p>
              ${content.recipient.title ? `<p>${content.recipient.title}</p>` : ''}
              <p>${content.recipient.company}</p>
            </div>
          ` : ''}
          <p class="salutation">${content.salutation}</p>
          <p class="opening">${content.opening}</p>
          ${content.body.map(paragraph => `<p class="body-paragraph">${paragraph}</p>`).join('')}
          <p class="closing">${content.closing}</p>
          <p class="signature">${content.signature}</p>
          ${content.postscript ? `<p class="postscript">${content.postscript}</p>` : ''}
        </div>
      </div>
    `;
  }

  private createCardBasedHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return `
      <div class="cover-letter-wrapper card-based" style="${styles.container}">
        <div class="card-container" style="${styles.cardContainer}">
          <div class="header" style="${styles.header}">
            <h2 class="name" style="font-size: 32px; margin: 0 0 10px 0; color: var(--primary-color);">${content.name}</h2>
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
            ${content.postscript ? `<p class="postscript" style="margin-top: 20px; font-style: italic;">${content.postscript}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private createDefaultHTML(content: CoverLetterContent, styles: TemplateStyles): string {
    return this.createSingleColumnHTML(content, styles);
  }

  // Utility methods
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
export const templateManager = new CoverLetterTemplateManager();

// Export template configurations for direct access
export { coverLetterTemplates };

// Helper function to create template preview
export function createTemplatePreview(templateId: string, sampleData?: Partial<CoverLetterContent>): string {
  const defaultData: CoverLetterContent = {
    name: 'John Doe',
    title: 'Frontend Developer',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: 'San Francisco, CA',
    recipient: {
      name: 'Jane Smith',
      title: 'Hiring Manager',
      company: 'Tech Corp'
    },
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    salutation: 'Dear Ms. Smith',
    opening: 'I am writing to express my strong interest in the Frontend Developer position at Tech Corp.',
    body: [
      'With over 5 years of experience in modern web development, I have successfully delivered numerous projects using React, TypeScript, and Node.js.',
      'In my current role, I have led the development of responsive web applications that serve over 100,000 users daily.',
      'I am particularly drawn to Tech Corp because of your commitment to innovation and user-centric design.'
    ],
    closing: 'Thank you for considering my application. I look forward to discussing how my skills can contribute to your team.',
    signature: 'Sincerely,\nJohn Doe'
  };

  const content = { ...defaultData, ...sampleData };
  return templateManager.generateHTML(templateId, content);
}
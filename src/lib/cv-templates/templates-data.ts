import { CvBuilderDocument } from '@/types/cv-builder'
import { europeanTemplates } from './european-templates'

export interface CvTemplate {
  id: string
  name: string
  description: string
  category: 'irish' | 'european' | 'tech' | 'creative' | 'academic' | 'executive'
  tags: string[]
  defaultData: Partial<CvBuilderDocument>
  styling: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    layout: 'single-column' | 'two-column' | 'modern-grid'
    headerStyle: 'classic' | 'modern' | 'minimal' | 'bold'
  }
}

const baseTemplates: CvTemplate[] = [
  {
    id: 'dublin-professional',
    name: 'Dublin Professional',
    description: 'Clean, ATS-friendly format preferred by Dublin employers. Perfect for corporate roles.',
    category: 'irish',
    tags: ['ATS-Friendly', 'Professional', 'Dublin', 'Corporate'],
    styling: {
      fontFamily: 'Inter',
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'John',
        lastName: 'O\'Sullivan',
        title: 'Senior Software Engineer',
        email: 'john.osullivan@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin 2, Ireland',
        linkedin: 'linkedin.com/in/johnosullivan',
        website: 'johnosullivan.dev'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Experienced software engineer with 8+ years developing scalable web applications for Irish and international companies. Proven track record in leading development teams and delivering complex projects on time. Expertise in modern JavaScript frameworks and cloud technologies.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          visible: true,
          items: [
            {
              company: 'Tech Solutions Ireland',
              role: 'Senior Software Engineer',
              startDate: '2020-03',
              endDate: 'current',
              location: 'Dublin, Ireland',
              bullets: [
                'Led team of 5 developers in migrating legacy systems to microservices architecture',
                'Reduced application response time by 40% through performance optimization',
                'Implemented CI/CD pipelines resulting in 60% faster deployment cycles',
                'Mentored junior developers and conducted technical interviews'
              ]
            }
          ]
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          visible: true,
          items: [
            {
              institution: 'Trinity College Dublin',
              degree: 'MSc Computer Science',
              field: 'Software Engineering',
              startDate: '2013-09',
              endDate: '2015-06',
              grade: 'First Class Honours'
            }
          ]
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Technical Skills',
          visible: true,
          items: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git', 'Agile/Scrum']
        }
      ]
    }
  },
  {
    id: 'cork-tech-modern',
    name: 'Cork Tech Modern',
    description: 'Modern design for tech professionals in Cork\'s growing tech hub. Emphasizes skills and projects.',
    category: 'tech',
    tags: ['Tech', 'Modern', 'Cork', 'Skills-Focused', 'ATS-Compatible'],
    styling: {
      fontFamily: 'Roboto',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      layout: 'two-column',
      headerStyle: 'modern'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'McCarthy',
        title: 'Full Stack Developer',
        email: 'sarah.mccarthy@email.com',
        phone: '+353 86 234 5678',
        address: 'Cork City, Ireland',
        linkedin: 'linkedin.com/in/sarahmccarthy',
        github: 'github.com/sarahmcc'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'About Me',
          visible: true,
          content: 'Passionate full-stack developer with expertise in building scalable web applications. Strong background in React, Node.js, and cloud technologies. Active open-source contributor and tech community organizer in Cork.'
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Core Technologies',
          visible: true,
          items: ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'Python', 'TensorFlow']
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          visible: true,
          items: [
            {
              company: 'InnovateTech Cork',
              role: 'Full Stack Developer',
              startDate: '2021-06',
              endDate: 'current',
              location: 'Cork, Ireland',
              bullets: [
                'Developed React-based SaaS platform serving 10,000+ users',
                'Architected RESTful APIs using Node.js and Express',
                'Implemented real-time features using WebSockets and Redis',
                'Achieved 99.9% uptime through robust error handling and monitoring'
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'european-standard',
    name: 'European Standard',
    description: 'Clean, professional format suitable for applications across EU. Follows Europass guidelines.',
    category: 'european',
    tags: ['European', 'Europass', 'International', 'ATS-Friendly'],
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#003399',
      secondaryColor: '#666666',
      layout: 'single-column',
      headerStyle: 'minimal'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Marie',
        lastName: 'Dubois',
        title: 'Marketing Manager',
        email: 'marie.dubois@email.com',
        phone: '+353 85 345 6789',
        address: 'Dublin, Ireland',
        linkedin: 'linkedin.com/in/mariedubois'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profile',
          visible: true,
          content: 'Results-driven marketing professional with 6+ years of experience in digital marketing and brand management across European markets. Fluent in English, French, and Spanish with proven ability to manage multicultural teams.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          visible: true,
          items: [
            {
              company: 'European Marketing Solutions',
              role: 'Senior Marketing Manager',
              startDate: '2019-09',
              endDate: 'current',
              location: 'Dublin, Ireland',
              bullets: [
                'Managed €2M annual marketing budget across 5 European markets',
                'Increased brand awareness by 45% through integrated campaigns',
                'Led team of 8 marketing professionals across Dublin and Paris offices',
                'Developed partnerships with 20+ European influencers'
              ]
            }
          ]
        },
        {
          id: 'languages',
          type: 'languages',
          title: 'Languages',
          visible: true,
          items: [
            { name: 'English', proficiency: 'Native', certification: 'IELTS 9.0' },
            { name: 'French', proficiency: 'Native', certification: '' },
            { name: 'Spanish', proficiency: 'Professional', certification: 'DELE C1' },
            { name: 'German', proficiency: 'Basic', certification: 'A2' }
          ]
        }
      ]
    }
  },
  {
    id: 'german-engineering',
    name: 'German Engineering',
    description: 'Precise, structured format ideal for engineering and technical roles in German companies.',
    category: 'european',
    tags: ['German', 'Engineering', 'Technical', 'Structured'],
    styling: {
      fontFamily: 'Helvetica',
      primaryColor: '#000000',
      secondaryColor: '#4a4a4a',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Klaus',
        lastName: 'Weber',
        title: 'Mechanical Engineer',
        email: 'klaus.weber@email.com',
        phone: '+353 87 456 7890',
        address: 'Galway, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Profile',
          visible: true,
          content: 'Experienced mechanical engineer with 10+ years in automotive and aerospace industries. Specialized in CAD design, finite element analysis, and project management. Strong track record of delivering innovative solutions for complex engineering challenges.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          visible: true,
          items: [
            {
              company: 'Precision Engineering GmbH',
              role: 'Senior Mechanical Engineer',
              startDate: '2018-01',
              endDate: 'current',
              location: 'Galway, Ireland',
              bullets: [
                'Designed components for automotive systems using CATIA and SolidWorks',
                'Reduced production costs by 25% through design optimization',
                'Led cross-functional team of 12 engineers on €5M project',
                'Implemented ISO 9001 quality standards across department'
              ]
            }
          ]
        },
        {
          id: 'certifications',
          type: 'certifications',
          title: 'Certifications',
          visible: true,
          items: [
            {
              name: 'Chartered Engineer (CEng)',
              issuer: 'Engineers Ireland',
              date: '2020-06',
              credentialId: 'CEI-2020-1234'
            },
            {
              name: 'Six Sigma Black Belt',
              issuer: 'ASQ',
              date: '2019-03',
              credentialId: 'ASQ-BB-2019'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Comprehensive format for academic positions in Irish and European universities.',
    category: 'academic',
    tags: ['Academic', 'Research', 'University', 'Publications'],
    styling: {
      fontFamily: 'Times New Roman',
      primaryColor: '#2c3e50',
      secondaryColor: '#34495e',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Dr. Emma',
        lastName: 'O\'Brien',
        title: 'Research Fellow',
        email: 'emma.obrien@university.ie',
        phone: '+353 1 234 5678',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Research Interests',
          visible: true,
          content: 'Accomplished researcher in computational biology with focus on genomic data analysis and machine learning applications in precision medicine. Published 25+ peer-reviewed papers and secured €1.2M in research funding.'
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          visible: true,
          items: [
            {
              institution: 'University College Dublin',
              degree: 'PhD',
              field: 'Computational Biology',
              startDate: '2015-09',
              endDate: '2019-06',
              grade: 'Summa Cum Laude'
            }
          ]
        },
        {
          id: 'publications',
          type: 'publications',
          title: 'Selected Publications',
          visible: true,
          items: [
            {
              title: 'Machine Learning Approaches in Genomic Medicine',
              publication: 'Nature Genetics',
              date: '2023-03',
              url: 'https://doi.org/10.1038/ng.2023.123',
              authors: 'O\'Brien, E., Murphy, J., et al.'
            }
          ]
        },
        {
          id: 'awards',
          type: 'awards',
          title: 'Awards and Honors',
          visible: true,
          items: [
            {
              name: 'Irish Research Council Laureate Award',
              issuer: 'Irish Research Council',
              date: '2022-11',
              description: 'Awarded €250,000 for excellence in early-career research'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Modern, visually appealing format for creative professionals while maintaining ATS compatibility.',
    category: 'creative',
    tags: ['Creative', 'Design', 'Modern', 'Visual'],
    styling: {
      fontFamily: 'Montserrat',
      primaryColor: '#e11d48',
      secondaryColor: '#f43f5e',
      layout: 'modern-grid',
      headerStyle: 'bold'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Aoife',
        lastName: 'Kelly',
        title: 'Senior UX/UI Designer',
        email: 'aoife.kelly@design.com',
        phone: '+353 89 567 8901',
        address: 'Dublin, Ireland',
        website: 'aoifekellydesign.com'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Creative Profile',
          visible: true,
          content: 'Award-winning UX/UI designer with 7+ years creating intuitive digital experiences for global brands. Passionate about user-centered design, accessibility, and creating beautiful interfaces that drive business results.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Design Experience',
          visible: true,
          items: [
            {
              company: 'Creative Studios Dublin',
              role: 'Senior UX/UI Designer',
              startDate: '2020-01',
              endDate: 'current',
              location: 'Dublin, Ireland',
              bullets: [
                'Redesigned e-commerce platform resulting in 35% increase in conversions',
                'Led design system creation adopted by 50+ developers',
                'Conducted 100+ user interviews and usability tests',
                'Won Irish Design Awards for Best Digital Design 2022'
              ]
            }
          ]
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Design Tools & Skills',
          visible: true,
          items: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'User Research', 'Design Systems', 'Accessibility', 'HTML/CSS', 'React']
        }
      ]
    }
  },
  {
    id: 'finance-executive',
    name: 'Finance Executive',
    description: 'Executive-level template for senior finance roles in Dublin\'s IFSC and European markets.',
    category: 'executive',
    tags: ['Executive', 'Finance', 'IFSC', 'Senior'],
    styling: {
      fontFamily: 'Georgia',
      primaryColor: '#0f172a',
      secondaryColor: '#475569',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Michael',
        lastName: 'Ryan',
        title: 'Chief Financial Officer',
        email: 'michael.ryan@finance.ie',
        phone: '+353 1 678 9012',
        address: 'Dublin 2, Ireland',
        linkedin: 'linkedin.com/in/michaelryancfo'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Executive Summary',
          visible: true,
          content: 'Accomplished CFO with 15+ years driving financial strategy for multinational corporations. Proven track record of leading IPOs, M&A transactions, and implementing transformational finance initiatives. Expert in IFRS, regulatory compliance, and stakeholder management.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Executive Experience',
          visible: true,
          items: [
            {
              company: 'Global Finance Corporation',
              role: 'Chief Financial Officer',
              startDate: '2018-06',
              endDate: 'current',
              location: 'Dublin IFSC, Ireland',
              bullets: [
                'Led successful €500M IPO on Euronext Dublin',
                'Managed finance team of 50+ across 5 European offices',
                'Reduced operational costs by 30% through strategic initiatives',
                'Secured €200M in growth funding from institutional investors'
              ]
            }
          ]
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education & Qualifications',
          visible: true,
          items: [
            {
              institution: 'University College Dublin',
              degree: 'MBA',
              field: 'Finance',
              startDate: '2005-09',
              endDate: '2007-06',
              grade: 'Distinction'
            }
          ]
        },
        {
          id: 'certifications',
          type: 'certifications',
          title: 'Professional Qualifications',
          visible: true,
          items: [
            {
              name: 'Fellow Chartered Accountant (FCA)',
              issuer: 'Chartered Accountants Ireland',
              date: '2010-05',
              credentialId: 'FCA-2010-789'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'dutch-international',
    name: 'Dutch International',
    description: 'Clean, international format popular with Dutch and Belgian employers. Emphasizes clarity.',
    category: 'european',
    tags: ['Dutch', 'Belgian', 'International', 'Clear'],
    styling: {
      fontFamily: 'Open Sans',
      primaryColor: '#ff6600',
      secondaryColor: '#666666',
      layout: 'two-column',
      headerStyle: 'modern'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Jan',
        lastName: 'Van Der Berg',
        title: 'International Sales Manager',
        email: 'jan.vanderberg@sales.eu',
        phone: '+353 83 234 5678',
        address: 'Cork, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profile',
          visible: true,
          content: 'Dynamic sales professional with 8+ years developing business across European markets. Expertise in B2B sales, channel partnerships, and international expansion. Fluent in Dutch, English, German, and French.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          visible: true,
          items: [
            {
              company: 'European Sales Solutions',
              role: 'International Sales Manager',
              startDate: '2019-03',
              endDate: 'current',
              location: 'Cork, Ireland',
              bullets: [
                'Expanded market presence in 8 European countries',
                'Achieved 150% of sales targets for 3 consecutive years',
                'Built partner network of 50+ distributors',
                'Negotiated contracts worth €10M+ annually'
              ]
            }
          ]
        }
      ]
    }
  }
]

export function getTemplateById(id: string): CvTemplate | undefined {
  return cvTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: CvTemplate['category']): CvTemplate[] {
  return cvTemplates.filter(template => template.category === category)
}

export function getTemplatesByTag(tag: string): CvTemplate[] {
  return cvTemplates.filter(template => template.tags.includes(tag))
}

// Combine base templates with European templates
export const cvTemplates: CvTemplate[] = [...baseTemplates, ...europeanTemplates]
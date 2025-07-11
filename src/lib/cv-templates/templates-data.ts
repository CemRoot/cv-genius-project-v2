import { europeanTemplates } from './european-templates'
import { TemplateDocument } from './template-types'

export interface CvTemplate {
  id: string
  name: string
  description: string
  category: 'irish' | 'european' | 'tech' | 'creative' | 'academic' | 'executive' | 'modern' | 'simple' | 'professional' | 'ats'
  tags: string[]
  previewSmall: string
  previewLarge: string
  defaultData: TemplateDocument
  styling: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    layout: 'single-column' | 'two-column' | 'modern-grid'
    headerStyle: 'classic' | 'modern' | 'minimal' | 'bold'
    colorVariants?: {
      primary: string
      secondary: string
      accent?: string
    }[]
  }
}

// Utility function to provide fallback preview images
function getPreviewImage(templateId: string, size: 'small' | 'large'): string {
  const dimension = size === 'small' ? '300' : '600'
  // For now, return placeholder - can be updated to real images later
  return '/img/previews/placeholder.svg'
}

const baseTemplates: CvTemplate[] = [
  // Existing templates
  {
    id: 'dublin-professional',
    name: 'Dublin Professional',
    description: 'Clean, ATS-friendly format preferred by Dublin employers. Perfect for corporate roles.',
    category: 'irish',
    tags: ['ATS-Friendly', 'Professional', 'Dublin', 'Corporate'],
    previewSmall: getPreviewImage('dublin-professional', 'small'),
    previewLarge: getPreviewImage('dublin-professional', 'large'),
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
    previewSmall: getPreviewImage('cork-tech-modern', 'small'),
    previewLarge: getPreviewImage('cork-tech-modern', 'large'),
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
    previewSmall: getPreviewImage('european-standard', 'small'),
    previewLarge: getPreviewImage('european-standard', 'large'),
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
        }
      ]
    }
  },

  // CVapp.ie inspired templates
  {
    id: 'toronto',
    name: 'Toronto',
    description: 'An elegant and classic CV template ideal for highlighting your career highlights and professional story.',
    category: 'modern',
    tags: ['Modern', 'Elegant', 'Classic', 'Professional'],
    previewSmall: getPreviewImage('toronto', 'small'),
    previewLarge: getPreviewImage('toronto', 'large'),
    styling: {
      fontFamily: 'Inter',
      primaryColor: '#232323',
      secondaryColor: '#4b5563',
      layout: 'two-column',
      headerStyle: 'modern',
      colorVariants: [
        { primary: '#232323', secondary: '#4b5563' },
        { primary: '#172F53', secondary: '#3b82f6' },
        { primary: '#361146', secondary: '#8b5cf6' },
        { primary: '#160A45', secondary: '#6366f1' },
        { primary: '#324739', secondary: '#059669' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Fionn',
        lastName: 'Conway',
        title: 'Senior Architect',
        email: 'fionn.conway@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland',
        linkedin: 'linkedin.com/in/fionnconway'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profile',
          visible: true,
          content: 'Experienced architect with over 8 years experience bringing the design software management and fabrication'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Employment History',
          visible: true,
          items: [
            {
              company: 'Conservation Architect at Fox Glás, Kilkenny',
              role: 'Conservation Architect',
              startDate: '2019-12',
              endDate: 'current',
              location: 'Kilkenny, Ireland',
              bullets: [
                'Completed work on Leinster House, Iveagh Gardens, and National Gallery project',
                'Developed and managed design projects from concept to commissioning',
                'Coordinated cross-functional teams including consultants and contractors',
                'Managed project milestones through construction site administration'
              ]
            }
          ]
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          visible: true,
          items: ['Adobe Lightroom', 'Adobe Photoshop', 'Adobe Indesign', 'Google SketchUp', 'Rhino 3d Software', 'Design Analysis', 'Construction Management', 'Project Management']
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          visible: true,
          items: [
            {
              institution: 'University College Dublin',
              degree: 'Bachelor of Architecture',
              field: 'Architecture',
              startDate: '2013-09',
              endDate: '2018-06'
            }
          ]
        }
      ]
    }
  },

  {
    id: 'stockholm',
    name: 'Stockholm',
    description: 'Efficient and energetic design with optimised layout designed to dazzle employers.',
    category: 'modern',
    tags: ['Modern', 'Energetic', 'Optimized', 'Professional'],
    previewSmall: getPreviewImage('stockholm', 'small'),
    previewLarge: getPreviewImage('stockholm', 'large'),
    styling: {
      fontFamily: 'Roboto',
      primaryColor: '#2196F3',
      secondaryColor: '#64748b',
      layout: 'two-column',
      headerStyle: 'modern',
      colorVariants: [
        { primary: '#0F141F', secondary: '#374151' },
        { primary: '#673AB7', secondary: '#8b5cf6' },
        { primary: '#2196F3', secondary: '#3b82f6' },
        { primary: '#22A860', secondary: '#059669' },
        { primary: '#FF4D4D', secondary: '#ef4444' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Roisin',
        lastName: 'Kelly',
        title: 'Professional Profile',
        email: 'roisin.kelly@email.com',
        phone: 'TEL: 045',
        address: 'Dublin, Ireland',
        linkedin: 'linkedin.com/in/roisinkelly'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Profile',
          visible: true,
          content: 'Experienced working in the medical field. Dedicated to the highest standards of professionalism and patient care. Hardworking, dedicated to time efficiency and patient care.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Employment History',
          visible: true,
          items: [
            {
              company: 'St. Mary\'s Hospital, Cork',
              role: 'Nurse',
              startDate: '2018-03',
              endDate: 'current',
              location: 'Cork, Ireland',
              bullets: [
                'Supervised inpatients and developed comprehensive treatment plans to effectively address mental health conditions and disorders',
                'Collaborated proactively with treatment team, including psychiatrists, social workers, and counselors to deliver care that enhanced outcomes',
                'Obtained vital signs and performed diagnostic tests to assist with patient condition assessments'
              ]
            }
          ]
        }
      ]
    }
  },

  {
    id: 'london',
    name: 'London',
    description: 'Classic and sophisticated CV structure crafted to showcase your professional strengths.',
    category: 'simple',
    tags: ['Classic', 'Sophisticated', 'Professional', 'Monochrome'],
    previewSmall: getPreviewImage('london', 'small'),
    previewLarge: getPreviewImage('london', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#000000',
      secondaryColor: '#4b5563',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Jack',
        lastName: 'McCarthy',
        title: 'Accountant',
        email: 'jack.mccarthy@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Dedicated accountant with extensive experience in financial accounting, planning and analysis. Self-motivated team player with excellent communication and attention to detail.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          visible: true,
          items: [
            {
              company: 'ABC Accounting Firm',
              role: 'Senior Accountant',
              startDate: '2020-01',
              endDate: 'current',
              location: 'Dublin, Ireland',
              bullets: [
                'Developed and implemented enhanced financial reporting processes',
                'Prepared monthly financial statements and variance analysis reports',
                'Managed accounts receivable and payable functions',
                'Conducted quarterly tax preparation and compliance reviews'
              ]
            }
          ]
        }
      ]
    }
  },

  // ATS Templates
  {
    id: 'athens',
    name: 'Athens',
    description: 'Clean, modern template design that is easily read by ATS scanners.',
    category: 'ats',
    tags: ['ATS', 'Modern', 'Clean', 'Gold Standard'],
    previewSmall: getPreviewImage('athens', 'small'),
    previewLarge: getPreviewImage('athens', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#3C78D8',
      secondaryColor: '#666666',
      layout: 'single-column',
      headerStyle: 'minimal',
      colorVariants: [
        { primary: '#3C78D8', secondary: '#666666' },
        { primary: '#C799A6', secondary: '#8b5563' },
        { primary: '#90909E', secondary: '#6b7280' },
        { primary: '#909580', secondary: '#78716c' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'Marketing Professional',
        email: 'sarah.johnson@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Results-driven marketing professional with 5+ years of experience in digital marketing and brand management. Proven track record of increasing brand awareness and driving customer engagement through innovative marketing strategies.'
        }
      ]
    }
  },

  {
    id: 'brussels',
    name: 'Brussels',
    description: 'An effortlessly easy, two-tone CV template perfect for conveying your professional story.',
    category: 'ats',
    tags: ['ATS', 'Two-tone', 'Professional', 'Gold Standard'],
    previewSmall: getPreviewImage('brussels', 'small'),
    previewLarge: getPreviewImage('brussels', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#EF8E38',
      secondaryColor: '#666666',
      layout: 'single-column',
      headerStyle: 'minimal',
      colorVariants: [
        { primary: '#EF8E38', secondary: '#f97316' },
        { primary: '#64AA3A', secondary: '#22c55e' },
        { primary: '#8989D1', secondary: '#8b5cf6' },
        { primary: '#5F8CC9', secondary: '#3b82f6' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Michael',
        lastName: 'O\'Brien',
        title: 'Software Developer',
        email: 'michael.obrien@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Experienced software developer specializing in full-stack web development. Strong background in JavaScript, React, and Node.js with a passion for creating efficient and scalable applications.'
        }
      ]
    }
  },

  // Creative Templates
  {
    id: 'vienna',
    name: 'Vienna',
    description: 'Impressive contemporary header with professional two-column design formation.',
    category: 'creative',
    tags: ['Creative', 'Contemporary', 'Two-column', 'Professional'],
    previewSmall: getPreviewImage('vienna', 'small'),
    previewLarge: getPreviewImage('vienna', 'large'),
    styling: {
      fontFamily: 'Roboto',
      primaryColor: '#4BFBBA',
      secondaryColor: '#64748b',
      layout: 'two-column',
      headerStyle: 'bold',
      colorVariants: [
        { primary: '#4BFBBA', secondary: '#10b981' },
        { primary: '#FFF66D', secondary: '#eab308' },
        { primary: '#9AEBFE', secondary: '#0ea5e9' },
        { primary: '#FED78C', secondary: '#f59e0b' },
        { primary: '#E4E4E4', secondary: '#9ca3af' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Lisa',
        lastName: 'Design',
        title: 'Creative Director',
        email: 'lisa.design@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Creative Profile',
          visible: true,
          content: 'Innovative creative director with 8+ years of experience in brand development and visual storytelling. Passionate about creating memorable design experiences that drive business results.'
        }
      ]
    }
  },

  {
    id: 'moscow',
    name: 'Moscow',
    description: 'Spacious design layout with clean structure. Excellent for professionals looking to impress employers.',
    category: 'creative',
    tags: ['Creative', 'Spacious', 'Clean', 'Impressive'],
    previewSmall: getPreviewImage('moscow', 'small'),
    previewLarge: getPreviewImage('moscow', 'large'),
    styling: {
      fontFamily: 'Inter',
      primaryColor: '#FFB3B3',
      secondaryColor: '#64748b',
      layout: 'single-column',
      headerStyle: 'modern',
      colorVariants: [
        { primary: '#FFB3B3', secondary: '#f87171' },
        { primary: '#FFDDCA', secondary: '#fb923c' },
        { primary: '#D0FFE1', secondary: '#4ade80' },
        { primary: '#BBEFFF', secondary: '#38bdf8' },
        { primary: '#BFB9FF', secondary: '#a78bfa' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Emma',
        lastName: 'Creative',
        title: 'Graphic Designer',
        email: 'emma.creative@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'About Me',
          visible: true,
          content: 'Creative graphic designer with a passion for visual storytelling and brand identity. Experienced in creating compelling designs that communicate brand messages effectively across various media.'
        }
      ]
    }
  },

  // More CVapp.ie inspired templates
  {
    id: 'dublin',
    name: 'Dublin',
    description: 'Professional, structured, and clean template perfect for showcasing your career progression.',
    category: 'simple',
    tags: ['Professional', 'Structured', 'Clean', 'Classic'],
    previewSmall: getPreviewImage('dublin', 'small'),
    previewLarge: getPreviewImage('dublin', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#333333',
      secondaryColor: '#666666',
      layout: 'single-column',
      headerStyle: 'minimal',
      colorVariants: [
        { primary: '#333333', secondary: '#666666' },
        { primary: '#2563eb', secondary: '#3b82f6' },
        { primary: '#dc2626', secondary: '#ef4444' },
        { primary: '#16a34a', secondary: '#22c55e' },
        { primary: '#9333ea', secondary: '#a855f7' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'David',
        lastName: 'Murphy',
        title: 'Project Manager',
        email: 'david.murphy@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Experienced project manager with a proven track record of delivering complex projects on time and within budget. Strong leadership skills and expertise in agile methodologies.'
        }
      ]
    }
  },

  {
    id: 'prague',
    name: 'Prague',
    description: 'ATS-optimized template with powerful and sophisticated design elements.',
    category: 'ats',
    tags: ['ATS', 'Powerful', 'Sophisticated', 'Gold Standard'],
    previewSmall: getPreviewImage('prague', 'small'),
    previewLarge: getPreviewImage('prague', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      layout: 'single-column',
      headerStyle: 'minimal',
      colorVariants: [
        { primary: '#1f2937', secondary: '#6b7280' },
        { primary: '#1e40af', secondary: '#3b82f6' },
        { primary: '#dc2626', secondary: '#ef4444' },
        { primary: '#059669', secondary: '#10b981' },
        { primary: '#7c3aed', secondary: '#8b5cf6' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Pavel',
        lastName: 'Novak',
        title: 'Software Architect',
        email: 'pavel.novak@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Senior software architect with 12+ years of experience designing and implementing scalable enterprise solutions. Expert in microservices architecture, cloud platforms, and agile development methodologies.'
        }
      ]
    }
  },

  {
    id: 'shanghai',
    name: 'Shanghai',
    description: 'ATS-compliant template with professional spotlight design for maximum impact.',
    category: 'ats',
    tags: ['ATS', 'Professional', 'Spotlight', 'Gold Standard'],
    previewSmall: getPreviewImage('shanghai', 'small'),
    previewLarge: getPreviewImage('shanghai', 'large'),
    styling: {
      fontFamily: 'Arial',
      primaryColor: '#0f172a',
      secondaryColor: '#64748b',
      layout: 'single-column',
      headerStyle: 'minimal',
      colorVariants: [
        { primary: '#0f172a', secondary: '#64748b' },
        { primary: '#1e40af', secondary: '#3b82f6' },
        { primary: '#059669', secondary: '#10b981' },
        { primary: '#dc2626', secondary: '#ef4444' },
        { primary: '#7c3aed', secondary: '#8b5cf6' }
      ]
    },
    defaultData: {
      personalInfo: {
        firstName: 'Lei',
        lastName: 'Chen',
        title: 'Data Scientist',
        email: 'lei.chen@email.com',
        phone: '+353 87 123 4567',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          visible: true,
          content: 'Experienced data scientist with expertise in machine learning, statistical analysis, and data visualization. Proven ability to extract actionable insights from complex datasets to drive business decisions.'
        }
      ]
    }
  }
]

// Combine base templates with European templates
export const cvTemplates: CvTemplate[] = [...baseTemplates, ...europeanTemplates]

export function getTemplateById(id: string): CvTemplate | undefined {
  return cvTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: CvTemplate['category']): CvTemplate[] {
  return cvTemplates.filter(template => template.category === category)
}

export function getTemplatesByTag(tag: string): CvTemplate[] {
  return cvTemplates.filter(template => template.tags.includes(tag))
}
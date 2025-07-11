import { CvTemplate } from './templates-data'

export const europeanTemplates: CvTemplate[] = [
  {
    id: 'french-professional',
    name: 'French Professional',
    description: 'Elegant format following French CV conventions. Includes photo placeholder and personal details section.',
    category: 'european',
    tags: ['French', 'Professional', 'Elegant', 'Photo'],
    styling: {
      fontFamily: 'Libre Baskerville',
      primaryColor: '#002395',
      secondaryColor: '#555555',
      layout: 'two-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Pierre',
        lastName: 'Moreau',
        title: 'Directeur Marketing Digital',
        email: 'pierre.moreau@email.fr',
        phone: '+353 87 234 5678',
        address: 'Dublin 4, Ireland',
        linkedin: 'linkedin.com/in/pierremoreau'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profil Professionnel',
          visible: true,
          content: 'Directeur marketing digital avec 10+ années d\'expérience dans le développement de stratégies digitales innovantes. Expert en transformation digitale et gestion d\'équipes multiculturelles.'
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Expérience Professionnelle',
          visible: true,
          items: [
            {
              company: 'Digital Solutions France',
              role: 'Directeur Marketing Digital',
              startDate: '2019-01',
              endDate: 'current',
              location: 'Dublin, Ireland',
              bullets: [
                'Direction d\'une équipe de 15 professionnels du marketing',
                'Augmentation du ROI digital de 200% en 2 ans',
                'Développement de partenariats stratégiques européens',
                'Implémentation de solutions MarTech innovantes'
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'spanish-modern',
    name: 'Spanish Modern',
    description: 'Contemporary Spanish CV format with emphasis on competencies and achievements. Barcelona-style design.',
    category: 'european',
    tags: ['Spanish', 'Modern', 'Competencies', 'Mediterranean'],
    styling: {
      fontFamily: 'Raleway',
      primaryColor: '#aa151b',
      secondaryColor: '#f1bf00',
      layout: 'single-column',
      headerStyle: 'modern'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Carlos',
        lastName: 'Rodríguez García',
        title: 'Arquitecto de Software',
        email: 'carlos.rodriguez@email.es',
        phone: '+353 86 345 6789',
        address: 'Dublín, Irlanda'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Perfil Profesional',
          visible: true,
          content: 'Arquitecto de software con amplia experiencia en diseño de sistemas distribuidos y tecnologías cloud. Especializado en arquitecturas de microservicios y DevOps.'
        }
      ]
    }
  },
  {
    id: 'italian-elegant',
    name: 'Italian Elegant',
    description: 'Sophisticated Italian CV design popular in Milan. Clean lines with attention to typography.',
    category: 'european',
    tags: ['Italian', 'Elegant', 'Milan', 'Design-Forward'],
    styling: {
      fontFamily: 'Playfair Display',
      primaryColor: '#009246',
      secondaryColor: '#ce2b37',
      layout: 'single-column',
      headerStyle: 'minimal'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Giulia',
        lastName: 'Bianchi',
        title: 'Fashion Marketing Manager',
        email: 'giulia.bianchi@email.it',
        phone: '+353 85 456 7890',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profilo Professionale',
          visible: true,
          content: 'Marketing manager con esperienza nel settore moda e luxury. Specializzata in strategie di brand positioning e comunicazione integrata per mercati europei.'
        }
      ]
    }
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic Minimal',
    description: 'Clean Scandinavian design focusing on clarity and efficiency. Popular in Sweden, Norway, and Denmark.',
    category: 'european',
    tags: ['Nordic', 'Minimal', 'Scandinavian', 'Clean'],
    styling: {
      fontFamily: 'Helvetica Neue',
      primaryColor: '#003f88',
      secondaryColor: '#ffc300',
      layout: 'single-column',
      headerStyle: 'minimal'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Erik',
        lastName: 'Andersson',
        title: 'Product Designer',
        email: 'erik.andersson@email.se',
        phone: '+353 83 567 8901',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Profile',
          visible: true,
          content: 'User-centered product designer with focus on sustainable design principles. Experience with digital products for Nordic and European markets.'
        }
      ]
    }
  },
  {
    id: 'swiss-precision',
    name: 'Swiss Precision',
    description: 'Ultra-clean Swiss format emphasizing precision and professionalism. Ideal for finance and consulting.',
    category: 'european',
    tags: ['Swiss', 'Precision', 'Finance', 'Consulting'],
    styling: {
      fontFamily: 'Helvetica',
      primaryColor: '#ff0000',
      secondaryColor: '#000000',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Thomas',
        lastName: 'Müller',
        title: 'Financial Analyst',
        email: 'thomas.mueller@email.ch',
        phone: '+353 87 678 9012',
        address: 'Dublin IFSC, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Profile',
          visible: true,
          content: 'CFA-certified financial analyst with expertise in portfolio management and risk assessment. Experience with Swiss banking standards and European regulatory frameworks.'
        }
      ]
    }
  },
  {
    id: 'polish-comprehensive',
    name: 'Polish Comprehensive',
    description: 'Detailed format preferred by Polish employers. Includes comprehensive education and skills sections.',
    category: 'european',
    tags: ['Polish', 'Comprehensive', 'Detailed', 'Traditional'],
    styling: {
      fontFamily: 'Lato',
      primaryColor: '#dc143c',
      secondaryColor: '#333333',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Katarzyna',
        lastName: 'Kowalska',
        title: 'HR Manager',
        email: 'katarzyna.kowalska@email.pl',
        phone: '+353 89 789 0123',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Podsumowanie Zawodowe',
          visible: true,
          content: 'Experienced HR manager specializing in talent acquisition and employee development for international companies. Fluent in Polish, English, and German.'
        }
      ]
    }
  },
  {
    id: 'portuguese-atlantic',
    name: 'Portuguese Atlantic',
    description: 'Modern Portuguese format suitable for Lisbon and Porto markets. Clean with ocean-inspired colors.',
    category: 'european',
    tags: ['Portuguese', 'Modern', 'Lisbon', 'Porto'],
    styling: {
      fontFamily: 'Source Sans Pro',
      primaryColor: '#006600',
      secondaryColor: '#ffcc00',
      layout: 'two-column',
      headerStyle: 'modern'
    },
    defaultData: {
      personalInfo: {
        firstName: 'João',
        lastName: 'Silva Santos',
        title: 'Software Engineer',
        email: 'joao.silva@email.pt',
        phone: '+353 85 890 1234',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Resumo Profissional',
          visible: true,
          content: 'Engenheiro de software com experiência em desenvolvimento web e mobile. Especializado em JavaScript e frameworks modernos para aplicações escaláveis.'
        }
      ]
    }
  },
  {
    id: 'austrian-alpine',
    name: 'Austrian Alpine',
    description: 'Professional Austrian format combining German precision with modern design elements.',
    category: 'european',
    tags: ['Austrian', 'Professional', 'German-Style', 'Modern'],
    styling: {
      fontFamily: 'Roboto',
      primaryColor: '#ed2939',
      secondaryColor: '#333333',
      layout: 'single-column',
      headerStyle: 'classic'
    },
    defaultData: {
      personalInfo: {
        firstName: 'Anna',
        lastName: 'Huber',
        title: 'Project Manager',
        email: 'anna.huber@email.at',
        phone: '+353 86 901 2345',
        address: 'Dublin, Ireland'
      },
      sections: [
        {
          id: 'summary',
          type: 'summary',
          title: 'Berufsprofil',
          visible: true,
          content: 'Erfahrene Projektmanagerin mit Schwerpunkt auf agilen Methoden und internationalen Teams. PMP-zertifiziert mit nachgewiesener Erfolgsbilanz.'
        }
      ]
    }
  }
]

// Merge with existing templates
export function getAllTemplates(existingTemplates: CvTemplate[]): CvTemplate[] {
  return [...existingTemplates, ...europeanTemplates]
}
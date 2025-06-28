import { NextRequest, NextResponse } from 'next/server'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { CVData } from '@/types/cv'

// Sample data for template preview
const sampleCVData: CVData = {
  personal: {
    firstName: 'John',
    lastName: 'O\'Sullivan',
    email: 'john.osullivan@email.com',
    phone: '+353 87 123 4567',
    location: 'Dublin, Ireland',
    title: 'Senior Software Engineer',
    summary: 'Experienced software engineer with 8+ years developing scalable web applications. Passionate about creating efficient solutions and mentoring junior developers.',
    linkedin: 'linkedin.com/in/johnosullivan',
    github: 'github.com/johnosullivan',
    portfolio: 'johnosullivan.dev'
  },
  experience: [
    {
      id: '1',
      company: 'Tech Giants Ireland Ltd',
      position: 'Senior Software Engineer',
      location: 'Dublin, Ireland',
      startDate: '2020-03',
      endDate: '',
      current: true,
      description: 'Lead development of microservices architecture serving 2M+ users',
      achievements: [
        'Reduced API response time by 40% through optimization',
        'Mentored team of 5 junior developers',
        'Implemented CI/CD pipeline reducing deployment time by 60%'
      ]
    },
    {
      id: '2',
      company: 'StartupHub Cork',
      position: 'Full Stack Developer',
      location: 'Cork, Ireland',
      startDate: '2017-06',
      endDate: '2020-02',
      current: false,
      description: 'Developed and maintained web applications for fintech startup',
      achievements: [
        'Built payment processing system handling €10M+ transactions',
        'Improved application performance by 50%',
        'Led migration from monolith to microservices'
      ]
    }
  ],
  education: [
    {
      id: '1',
      degree: 'MSc Computer Science',
      institution: 'University College Dublin',
      location: 'Dublin, Ireland',
      startDate: '2015-09',
      endDate: '2017-05',
      grade: 'First Class Honours',
      achievements: ['Best Thesis Award', 'Dean\'s List']
    },
    {
      id: '2',
      degree: 'BSc Software Engineering',
      institution: 'Cork Institute of Technology',
      location: 'Cork, Ireland',
      startDate: '2011-09',
      endDate: '2015-05',
      grade: '2.1 Honours'
    }
  ],
  skills: [
    { name: 'JavaScript/TypeScript', level: 'Expert', category: 'Technical' },
    { name: 'React/Next.js', level: 'Expert', category: 'Technical' },
    { name: 'Node.js', level: 'Advanced', category: 'Technical' },
    { name: 'Python', level: 'Advanced', category: 'Technical' },
    { name: 'AWS/Docker', level: 'Advanced', category: 'Technical' },
    { name: 'Leadership', level: 'Advanced', category: 'Soft' },
    { name: 'Agile/Scrum', level: 'Expert', category: 'Soft' }
  ],
  projects: [
    {
      id: '1',
      name: 'Open Source Contributing',
      description: 'Active contributor to several open source projects including React and Next.js',
      technologies: ['TypeScript', 'React', 'Testing'],
      link: 'github.com/johnosullivan'
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022-03',
      credentialId: 'AWS-SA-123456'
    }
  ],
  languages: [
    { name: 'English', proficiency: 'Native' },
    { name: 'Irish', proficiency: 'Intermediate' }
  ],
  interests: ['Open Source', 'Machine Learning', 'Hiking', 'Photography'],
  references: [
    {
      id: '1',
      name: 'Sarah McCarthy',
      position: 'Engineering Manager',
      company: 'Tech Giants Ireland Ltd',
      email: 'sarah.mccarthy@techgiants.ie',
      phone: '+353 87 765 4321'
    }
  ]
}

// POST /api/templates/preview - Generate a preview of a template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, data } = body
    
    if (!templateId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template ID is required' 
        },
        { status: 400 }
      )
    }
    
    const templateManager = new IrishCVTemplateManager()
    
    // Select the template
    const success = templateManager.selectTemplate(templateId)
    if (!success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Template not found' 
        },
        { status: 404 }
      )
    }
    
    // Use provided data or sample data
    const cvData = data || sampleCVData
    
    // Validate the CV data against template requirements
    const validationErrors = templateManager.validateCV(cvData)
    
    // Generate the HTML
    const html = templateManager.renderCV(cvData)
    const css = templateManager.getTemplateCSS()
    
    // Get template info
    const templates = templateManager.getAllTemplates()
    const template = templates.find(t => t.id === templateId)
    
    return NextResponse.json({
      success: true,
      template: {
        id: template!.id,
        name: template!.name,
        description: template!.description
      },
      preview: {
        html,
        css,
        validationErrors,
        isValid: validationErrors.length === 0
      }
    })
    
  } catch (error) {
    console.error('Template Preview Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate template preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
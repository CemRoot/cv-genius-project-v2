'use client'

import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { CVData } from '@/types/cv'
import { useEffect, useState } from 'react'

// Sample CV data for testing
const sampleCVData: CVData = {
  personal: {
    fullName: 'John O\'Sullivan',
    title: 'Senior Software Engineer',
    email: 'john.osullivan@email.ie',
    phone: '+353 86 123 4567',
    address: 'Dublin 2, Ireland',
    summary: 'Experienced software engineer with 8+ years developing scalable web applications for Irish and international companies. Proven track record of leading teams and delivering complex projects on time. Expertise in modern JavaScript frameworks, cloud architecture, and agile methodologies.',
    linkedin: 'linkedin.com/in/johnosullivan',
    github: 'github.com/johnosullivan'
  },
  experience: [
    {
      id: '1',
      company: 'Tech Corp Ireland',
      position: 'Senior Software Engineer',
      location: 'Dublin, Ireland',
      startDate: '2020-03',
      endDate: '',
      current: true,
      description: 'Lead development of enterprise SaaS platform serving 500+ Irish businesses',
      achievements: [
        'Reduced application load time by 60% through performance optimization',
        'Led team of 5 developers in migrating legacy system to React/Node.js',
        'Implemented CI/CD pipeline resulting in 40% faster deployments',
        'Mentored 3 junior developers, all promoted within 18 months'
      ]
    },
    {
      id: '2',
      company: 'FinTech Solutions',
      position: 'Full Stack Developer',
      location: 'IFSC, Dublin',
      startDate: '2017-06',
      endDate: '2020-02',
      current: false,
      description: 'Developed financial applications for investment firms in IFSC',
      achievements: [
        'Built real-time trading dashboard processing €2M+ daily transactions',
        'Achieved 99.9% uptime for critical financial systems',
        'Integrated with 10+ third-party financial APIs',
        'Reduced data processing time by 75% using Redis caching'
      ]
    }
  ],
  education: [
    {
      id: '1',
      institution: 'Trinity College Dublin',
      degree: 'BSc (Hons)',
      field: 'Computer Science',
      location: 'Dublin, Ireland',
      startDate: '2013-09',
      endDate: '2017-05',
      grade: 'First Class Honours (1.1)'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript/TypeScript', category: 'Technical', level: 'Expert' },
    { id: '2', name: 'React/Next.js', category: 'Technical', level: 'Expert' },
    { id: '3', name: 'Node.js/Express', category: 'Technical', level: 'Advanced' },
    { id: '4', name: 'AWS/Docker', category: 'Technical', level: 'Advanced' },
    { id: '5', name: 'PostgreSQL/MongoDB', category: 'Technical', level: 'Advanced' },
    { id: '6', name: 'Git/GitHub', category: 'Software', level: 'Expert' },
    { id: '7', name: 'Agile/Scrum', category: 'Software', level: 'Advanced' },
    { id: '8', name: 'Team Leadership', category: 'Soft', level: 'Advanced' },
    { id: '9', name: 'Problem Solving', category: 'Soft', level: 'Expert' }
  ],
  languages: [
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Irish', level: 'Conversational' }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2022-03',
      expiryDate: '2025-03',
      credentialId: 'AWS-123456'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'Open Source React Component Library',
      description: 'Created and maintain popular React component library with 2K+ GitHub stars',
      link: 'github.com/johnosullivan/react-components',
      technologies: ['React', 'TypeScript', 'Storybook', 'Jest']
    }
  ]
}

export default function TestClassicPage() {
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')

  useEffect(() => {
    const manager = new IrishCVTemplateManager()
    manager.selectTemplate('classic')
    
    const renderedHTML = manager.renderCV(sampleCVData)
    const renderedCSS = manager.getTemplateCSS()
    
    setHtml(renderedHTML)
    setCss(renderedCSS)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Classic Professional Template Preview</h1>
          <p className="text-gray-600">This is how your CV will look with the Classic Professional template</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        
        <div className="mt-8 text-center space-x-4">
          <button 
            onClick={() => window.print()} 
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print Preview
          </button>
          <button 
            onClick={() => window.location.href = '/builder'} 
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  )
}
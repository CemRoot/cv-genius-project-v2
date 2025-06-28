'use client'

import { DublinTechTemplate } from './templates/dublin-tech-template'
import { IrishFinanceTemplate } from './templates/irish-finance-template'
import { DublinPharmaTemplate } from './templates/dublin-pharma-template'
import { IrishGraduateTemplate } from './templates/irish-graduate-template'

interface TemplatePreviewProps {
  templateId: string
  scale?: number
}

// Sample data for preview
const sampleData = {
  personal: {
    fullName: 'John O\'Sullivan',
    email: 'john.osullivan@email.com',
    phone: '+353 87 123 4567',
    address: 'Dublin 2, Ireland',
    linkedin: 'linkedin.com/in/johnosullivan',
    github: 'github.com/johnosullivan',
    summary: 'Experienced professional with expertise in delivering innovative solutions in the Irish market.'
  },
  experience: [{
    id: '1',
    company: 'Tech Company Dublin',
    position: 'Senior Developer',
    location: 'Dublin, Ireland',
    startDate: '2022-01',
    endDate: '2024-12',
    current: true,
    description: 'Leading development team in creating cutting-edge solutions.',
    achievements: ['Increased efficiency by 40%', 'Led team of 5 developers']
  }],
  education: [{
    id: '1',
    institution: 'Trinity College Dublin',
    degree: 'BSc Computer Science',
    field: 'Computer Science',
    location: 'Dublin, Ireland',
    startDate: '2018-09',
    endDate: '2022-05',
    current: false,
    grade: 'First Class Honours'
  }],
  skills: [
    { id: '1', name: 'React', level: 'Expert', category: 'Technical' },
    { id: '2', name: 'TypeScript', level: 'Advanced', category: 'Technical' },
    { id: '3', name: 'Node.js', level: 'Advanced', category: 'Technical' }
  ],
  languages: [
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Irish', level: 'Conversational' }
  ]
}

export function TemplatePreview({ templateId, scale = 0.3 }: TemplatePreviewProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'dublin-tech':
        return <DublinTechTemplate data={sampleData} />
      case 'irish-finance':
        return <IrishFinanceTemplate data={sampleData} />
      case 'dublin-pharma':
        return <DublinPharmaTemplate data={sampleData} />
      case 'irish-graduate':
        return <IrishGraduateTemplate data={sampleData} />
      default:
        // For templates not yet implemented, show a styled placeholder
        return (
          <div className="bg-white p-8 h-full flex flex-col">
            <div className="border-b-2 border-gray-200 pb-4 mb-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-4/5 mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div 
      className="w-full h-full origin-top-left pointer-events-none"
      style={{
        transform: `scale(${scale})`,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`
      }}
    >
      {renderTemplate()}
    </div>
  )
}
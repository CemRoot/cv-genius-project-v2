import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { Beaker, GraduationCap, Award, CheckCircle } from "lucide-react"
import React from 'react'
import { formatMonthYear } from '@/utils/format-date'

interface DublinPharmaTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function DublinPharmaTemplate({ cv, cvData, isMobile = false }: DublinPharmaTemplateProps) {
  // Dublin Pharma Template rendered
  const data = cv || cvData
  if (!data) {
    return <div className="p-8 text-center">Loading...</div>
  }
  
  const { 
    personal = { fullName: '', email: '', phone: '', address: '' }, 
    experience = [], 
    education = [], 
    skills = [], 
    languages = [], 
    projects = [], 
    certifications = [], 
    interests = [], 
    references = [], 
    designSettings, 
    sections = [] 
  } = data

  // Helper function to check if a section is visible
  const isSectionVisible = (sectionType: string) => {
    const section = sections.find(s => s.type === sectionType)
    return section?.visible ?? false
  }

  // Clean pharma-focused design settings
  const defaultSettings: DesignSettings = {
    margins: 0.75,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Arial, sans-serif',
    fontSize: 10,
    lineHeight: 1.3
  }

  const settings = designSettings || defaultSettings

  // Clean spacing for pharma CVs
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
    spacious: 'space-y-5'
  }

  const itemSpacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
    spacious: 'space-y-4'
  }

  const sectionSpacing = spacingClasses[settings.sectionSpacing] || spacingClasses.normal
  const itemSpacing = itemSpacingClasses[settings.sectionSpacing] || itemSpacingClasses.normal

  // Dynamic styles based on settings and mobile detection
  const containerStyle = {
    padding: isMobile ? '0.75rem' : `${settings.margins}in`,
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '9px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
  }

  return (
    <div 
      className={`bg-white text-gray-900 min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Pharma Professional Header */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-900 mb-2`}>
          {personal.fullName || "Your Name"}
        </h1>
        <div className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-blue-700 mb-3`}>
          {personal.title || "Pharmaceutical Professional"}
        </div>
        
        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Phone:</span>
            <span>{personal.phone && formatIrishPhone(personal.phone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span>{personal.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Location:</span>
            <span>{personal.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Work Status:</span>
            <span>{personal.nationality || "EU Work Authorization"}</span>
          </div>
        </div>
        
        {/* Professional Links */}
        {(personal.linkedin || personal.website) && (
          <div className="mt-2 text-sm">
            {personal.linkedin && (
              <a href={personal.linkedin} className="text-blue-700 hover:underline mr-4">
                LinkedIn Profile
              </a>
            )}
            {personal.website && (
              <a href={personal.website} className="text-blue-700 hover:underline">
                Portfolio
              </a>
            )}
          </div>
        )}
      </div>

      <div className={sectionSpacing}>
        {/* Professional Summary */}
        {personal.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
              <Beaker className="w-5 h-5 mr-2" />
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">{personal.summary}</p>
          </div>
        )}

        {/* Core Competencies - Pharma Specific */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Core Competencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => s.category === 'Technical').map(skill => (
                    <span key={skill.id} className="bg-white px-3 py-1 rounded text-sm border border-blue-200">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Regulatory & Compliance */}
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-semibold text-green-900 mb-2">Regulatory Knowledge</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => s.category === 'Other' || s.name.includes('GMP') || s.name.includes('GDP')).map(skill => (
                    <span key={skill.id} className="bg-white px-3 py-1 rounded text-sm border border-green-200">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Software & Systems */}
            {skills.filter(s => s.category === 'Software').length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Software & Systems</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => s.category === 'Software').map(skill => (
                    <span key={skill.id} className="bg-white px-3 py-1 rounded text-sm border border-gray-300">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Professional Experience</h2>
            <div className={itemSpacing}>
              {experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-300 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">{exp.position}</h3>
                      <div className="font-semibold text-gray-700">{exp.company} • {exp.location}</div>
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p className="text-gray-700 mb-2 italic">{exp.description}</p>
                  )}
                  
                  {(exp.achievements || []).length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-gray-700">Key Achievements:</div>
                      {(exp.achievements || []).map((achievement, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Qualifications */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Education & Qualifications
            </h2>
            <div className={itemSpacing}>
              {education.map((edu) => (
                <div key={edu.id} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <div className="text-gray-700">{edu.institution} • {edu.location}</div>
                      {edu.grade && (
                        <div className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatMonthYear(edu.startDate)}{edu.current || edu.endDate === 'Present' ? ' - Present' : edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ''}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="mt-2 text-sm text-gray-700">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Training */}
        {certifications && certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certifications & Training
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-green-50 p-3 rounded border border-green-200">
                  <h3 className="font-semibold text-green-900">{cert.name}</h3>
                  <div className="text-sm text-gray-700">{cert.issuer}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">Issued: {cert.issueDate}</span>
                    {cert.expiryDate && (
                      <span className="text-xs text-red-600">Expires: {cert.expiryDate}</span>
                    )}
                  </div>
                  {cert.credentialId && (
                    <div className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research & Projects */}
        {projects && projects.length > 0 && isSectionVisible('projects') && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Research & Projects</h2>
            <div className={itemSpacing}>
              {projects.map((project) => (
                <div key={project.id} className="bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold text-purple-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-700 mt-1">{project.description}</p>
                  )}
                  {(project.technologies || []).length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-semibold">Methods/Technologies: </span>
                      <span className="text-sm text-gray-700">{(project.technologies || []).join(', ')}</span>
                    </div>
                  )}
                  {(project.achievements || []).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {(project.achievements || []).map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && isSectionVisible('languages') && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {languages.map(language => (
                <div key={language.id} className="bg-gray-100 px-4 py-2 rounded">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-sm text-gray-600"> - {language.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {isSectionVisible('references') && (
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-3">References</h2>
            {references && references.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((reference) => (
                  <div key={reference.id} className="bg-gray-50 p-3 rounded">
                    <div className="font-semibold">{reference.name}</div>
                    <div className="text-sm text-gray-700">{reference.position}</div>
                    <div className="text-sm text-gray-700">{reference.company}</div>
                    <div className="text-sm text-blue-600">{reference.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">Available upon request</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
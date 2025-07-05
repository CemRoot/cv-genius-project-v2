import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { Github, Linkedin, Globe, Mail, Phone, MapPin } from "lucide-react"
import React from 'react'
import { formatMonthYear } from '@/utils/format-date'

interface DublinTechTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function DublinTechTemplate({ cv, cvData, isMobile = false }: DublinTechTemplateProps) {
  // Dublin Tech Template rendered
  const data = cv || cvData
  if (!data) {
    return <div className="p-8 text-center">Loading...</div>
  }
  
  const { 
    personal = { fullName: '', email: '', phone: '', address: '', nationality: '' }, 
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

  // Modern tech-focused design settings
  const defaultSettings: DesignSettings = {
    margins: 0.3, // Reduced from 0.75 for more content space
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Inter, sans-serif',
    fontSize: 11, // Increased from 10 for better readability
    lineHeight: 1.3
  }

  const settings = designSettings || defaultSettings

  // Modern spacing for tech CVs
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
    spacious: 'space-y-6'
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
    padding: isMobile ? '1rem' : `${settings.margins}in`, // Increased mobile padding
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '11px' : `${settings.fontSize}pt`, // Increased mobile font size
    lineHeight: settings.lineHeight,
  }

  return (
    <div 
      className={`bg-white text-gray-900 min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Modern Tech Header with Sidebar Design */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Left Column - Contact & Skills */}
        <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg">
          {/* Name & Title */}
          <div className="mb-6">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
              {personal.fullName || "Your Name"}
            </h1>
            <div className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-blue-600`}>
              {personal.title || "Full Stack Developer"}
            </div>
          </div>

          {/* Contact Info with Icons */}
          <div className="space-y-2 mb-6 text-sm">
            {personal.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href={`mailto:${personal.email}`} className="text-gray-700 hover:text-blue-600">
                  {personal.email}
                </a>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{formatIrishPhone(personal.phone)}</span>
              </div>
            )}
            {personal.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{personal.address}</span>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-gray-500" />
                <a 
                  href={personal.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            {personal.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a 
                  href={personal.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Portfolio
                </a>
              </div>
            )}
            {personal.nationality && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                  {personal.nationality}
                </span>
              </div>
            )}
          </div>

          {/* Tech Skills - Categorized */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Technical Skills</h2>
              <div className="space-y-3">
                {['Languages', 'Frameworks', 'Tools', 'Cloud'].map((category) => {
                  const categorySkills = skills.filter(skill => 
                    (category === 'Languages' && skill.category === 'Technical') ||
                    (category === 'Frameworks' && skill.category === 'Software') ||
                    (category === 'Tools' && skill.category === 'Other') ||
                    (category === 'Cloud' && skill.name.toLowerCase().includes('aws') || 
                     skill.name.toLowerCase().includes('azure') || 
                     skill.name.toLowerCase().includes('gcp'))
                  )
                  if (categorySkills.length === 0) return null
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">{category}</h3>
                      <div className="flex flex-wrap gap-1">
                        {categorySkills.map(skill => (
                          <span 
                            key={skill.id} 
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && isSectionVisible('languages') && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Languages</h2>
              <div className="space-y-2">
                {languages.map(language => (
                  <div key={language.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{language.name}</span>
                    <span className="text-xs text-gray-600">{language.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="md:w-2/3">
          {/* Professional Summary */}
          {personal.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 flex items-center">
                <span className="w-8 h-0.5 bg-blue-600 mr-3"></span>
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{personal.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <span className="w-8 h-0.5 bg-blue-600 mr-3"></span>
                Professional Experience
              </h2>
              <div className={itemSpacing}>
                {experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-gray-200 pl-4 ml-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{exp.position}</h3>
                        <div className="text-blue-600 font-medium">{exp.company}</div>
                        <div className="text-sm text-gray-600">{exp.location}</div>
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </div>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                    )}
                    
                    {(exp.achievements || []).length > 0 && (
                      <ul className="space-y-1">
                        {(exp.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">▸</span>
                            <span className="text-gray-700 text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects - Tech Portfolio Style */}
          {projects && projects.length > 0 && isSectionVisible('projects') && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <span className="w-8 h-0.5 bg-blue-600 mr-3"></span>
                Technical Projects
              </h2>
              <div className={itemSpacing}>
                {projects.map((project) => (
                  <div key={project.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <div className="text-sm text-gray-500">
                        {project.startDate} - {project.current ? "Present" : project.endDate}
                      </div>
                    </div>
                    
                    {(project.technologies || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(project.technologies || []).map((tech, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {project.description && (
                      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                    )}
                    
                    {(project.achievements || []).length > 0 && (
                      <ul className="space-y-1">
                        {(project.achievements || []).map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700 text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <span className="w-8 h-0.5 bg-blue-600 mr-3"></span>
                Education
              </h2>
              <div className={itemSpacing}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {edu.degree} in {edu.field}
                        </h3>
                        <div className="text-gray-700">{edu.institution}</div>
                        <div className="text-sm text-gray-600">{edu.location}</div>
                        {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatMonthYear(edu.startDate)}{edu.current || edu.endDate === 'Present' ? ' - Present' : edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <span className="w-8 h-0.5 bg-blue-600 mr-3"></span>
                Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="bg-gray-50 p-3 rounded">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <div className="text-sm text-gray-600">{cert.issuer}</div>
                    <div className="text-xs text-gray-500">{cert.issueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
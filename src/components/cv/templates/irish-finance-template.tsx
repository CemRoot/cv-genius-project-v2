import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import React from 'react'
import { formatMonthYear } from '@/utils/format-date'

interface IrishFinanceTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function IrishFinanceTemplate({ cv, cvData, isMobile = false }: IrishFinanceTemplateProps) {
  console.log('💼 Irish Finance Template rendered')
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

  // Conservative finance-focused design settings
  const defaultSettings: DesignSettings = {
    margins: 0.3, // Reduced from 0.6 for more content space
    sectionSpacing: 'tight',
    headerSpacing: 'compact',
    fontFamily: 'Georgia, serif',
    fontSize: 11, // Already at 11 for better readability
    lineHeight: 1.2
  }

  const settings = designSettings || defaultSettings

  // Professional spacing for finance CVs
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
    spacious: 'space-y-4'
  }

  const itemSpacingClasses = {
    tight: 'space-y-0.5',
    normal: 'space-y-1',
    relaxed: 'space-y-2',
    spacious: 'space-y-3'
  }

  const sectionSpacing = spacingClasses[settings.sectionSpacing] || spacingClasses.tight
  const itemSpacing = itemSpacingClasses[settings.sectionSpacing] || itemSpacingClasses.tight

  // Dynamic styles based on settings and mobile detection
  const containerStyle = {
    padding: isMobile ? '1rem' : `${settings.margins}in`, // Increased mobile padding
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '11px' : `${settings.fontSize}pt`, // Increased mobile font size
    lineHeight: settings.lineHeight,
  }

  return (
    <div 
      className={`bg-white text-black min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Traditional Finance Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center mb-1`}>
          {personal.fullName || "Your Name"}
        </h1>
        <div className={`${isMobile ? 'text-sm' : 'text-base'} text-center text-gray-700 mb-2`}>
          {personal.title || "Finance Professional"}
        </div>
        
        {/* Contact Details - Single Line */}
        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-center`}>
          {personal.phone && formatIrishPhone(personal.phone)}
          {personal.phone && personal.email && ' | '}
          {personal.email}
          {personal.email && personal.address && ' | '}
          {personal.address}
          {personal.nationality && ` | ${personal.nationality}`}
        </div>
        
        {/* Professional Links */}
        {(personal.linkedin || personal.website) && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-center mt-1`}>
            {personal.linkedin && (
              <span>{personal.linkedin.replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}</span>
            )}
            {personal.linkedin && personal.website && ' | '}
            {personal.website && personal.website.replace('https://', '')}
          </div>
        )}
      </div>

      <div className={sectionSpacing}>
        {/* Professional Profile */}
        {personal.summary && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Professional Profile
            </h2>
            <p className="text-justify">{personal.summary}</p>
          </div>
        )}

        {/* Core Competencies - Finance Specific */}
        {skills.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {/* Financial Skills */}
              {skills.filter(s => s.category === 'Technical' || s.category === 'Other').map(skill => (
                <div key={skill.id} className="flex items-center">
                  <span className="text-gray-600 mr-2">•</span>
                  <span className="text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
            
            {/* Software & Systems */}
            {skills.filter(s => s.category === 'Software').length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-sm">Systems & Software:</div>
                <p className="text-sm">
                  {skills.filter(s => s.category === 'Software').map(s => s.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Professional Experience
            </h2>
            <div className={itemSpacing}>
              {experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-bold">{exp.position}</span>
                      <span className="mx-2">|</span>
                      <span className="font-semibold">{exp.company}</span>
                      <span className="text-gray-600">, {exp.location}</span>
                    </div>
                    <div className="text-sm italic whitespace-nowrap">
                      {formatMonthYear(exp.startDate)}{exp.current ? ' - Present' : exp.endDate ? ` - ${formatMonthYear(exp.endDate)}` : ''}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p className="text-sm mb-1 italic">{exp.description}</p>
                  )}
                  
                  {(exp.achievements || []).length > 0 && (
                    <ul className="ml-4">
                      {(exp.achievements || []).map((achievement, index) => (
                        <li key={index} className="text-sm flex items-start">
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

        {/* Education & Professional Qualifications */}
        {education.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Education & Qualifications
            </h2>
            <div className={itemSpacing}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{edu.degree}</span>
                      {edu.field && <span> in {edu.field}</span>}
                      <div className="text-sm">{edu.institution}, {edu.location}</div>
                      {edu.grade && <div className="text-sm italic">Result: {edu.grade}</div>}
                    </div>
                    <div className="text-sm italic">
                      {edu.current ? 'Present' : formatMonthYear(edu.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Professional Certifications
            </h2>
            <div className={itemSpacing}>
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{cert.name}</span>
                    <span className="text-sm"> - {cert.issuer}</span>
                    {cert.credentialId && (
                      <span className="text-xs text-gray-500"> ({cert.credentialId})</span>
                    )}
                  </div>
                  <div className="text-sm italic space-y-1">
                    <div>
                      {new Date(cert.issueDate).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                    </div>
                    {cert.expiryDate && (
                      <div>
                        Expires {new Date(cert.expiryDate).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects / Achievements */}
        {projects && projects.length > 0 && isSectionVisible('projects') && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Key Projects & Achievements
            </h2>
            <div className={itemSpacing}>
              {projects.map((project) => (
                <div key={project.id} className="mb-2">
                  <div className="font-semibold">{project.name}</div>
                  {project.description && (
                    <p className="text-sm">{project.description}</p>
                  )}
                  {(project.achievements || []).length > 0 && (
                    <ul className="ml-4 mt-1">
                      {(project.achievements || []).map((achievement, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="mr-2">-</span>
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
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Languages
            </h2>
            <div className="flex flex-wrap gap-4">
              {languages.map(language => (
                <div key={language.id}>
                  <span className="font-medium">{language.name}</span>
                  <span className="text-sm text-gray-600"> - {language.level}</span>
                  {language.certification && (
                    <span className="text-xs"> ({language.certification})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {interests && interests.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              Additional Information
            </h2>
            <div className="text-sm">
              <span className="font-semibold">Interests: </span>
              {interests.map(i => i.name).join(', ')}
            </div>
          </div>
        )}

        {/* References */}
        {isSectionVisible('references') && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold uppercase border-b border-gray-600 mb-2`}>
              References
            </h2>
            {references && references.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {references.map((reference) => (
                  <div key={reference.id} className="text-sm">
                    <div className="font-semibold">{reference.name}</div>
                    <div>{reference.position}</div>
                    <div>{reference.company}</div>
                    <div>{reference.email}</div>
                    {reference.phone && <div>{reference.phone}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic">Available upon request</p>
            )}
          </div>
        )}
      </div>

      {/* Footer for IFSC/Finance CVs */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
        <p>EU Work Authorization • Full Clean Driving License • Available for Immediate Start</p>
      </div>
    </div>
  )
}
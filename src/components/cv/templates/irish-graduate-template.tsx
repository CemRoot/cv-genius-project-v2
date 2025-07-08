import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { GraduationCap, Award, BookOpen, Users } from "lucide-react"
import React from 'react'
import { formatMonthYear } from '@/utils/format-date'

interface IrishGraduateTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function IrishGraduateTemplate({ cv, cvData, isMobile = false }: IrishGraduateTemplateProps) {
  // Irish Graduate Template rendered
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

  // Fresh graduate-focused design settings
  const defaultSettings: DesignSettings = {
    margins: 0.15, // Reduced from 0.75 for more content space
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Calibri, sans-serif',
    fontSize: 11, // Already at 11 for better readability
    lineHeight: 1.4
  }

  const settings = designSettings || defaultSettings

  // Youthful spacing for graduate CVs
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
      {/* Graduate Header - Clean and Modern */}
      <div className="text-center mb-4 pb-4 border-b-2 border-green-600">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
          {personal.fullName || "Your Name"}
        </h1>
        
        {/* Contact Info - Horizontal Layout */}
        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 flex flex-wrap justify-center gap-2 mb-2`}>
          {personal.phone && (
            <span className="flex items-center">
              📱 {formatIrishPhone(personal.phone)}
            </span>
          )}
          {personal.email && (
            <>
              <span className="text-gray-400">|</span>
              <span className="flex items-center">
                ✉️ {personal.email}
              </span>
            </>
          )}
          {personal.address && (
            <>
              <span className="text-gray-400">|</span>
              <span className="flex items-center">
                📍 {personal.address}
              </span>
            </>
          )}
        </div>
        
        {/* Professional Links */}
        {(personal.linkedin || personal.website) && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {personal.linkedin && (
              <a href={personal.linkedin} className="text-blue-600 hover:underline mr-3">
                LinkedIn
              </a>
            )}
            {personal.website && (
              <a href={personal.website} className="text-blue-600 hover:underline">
                Portfolio
              </a>
            )}
          </div>
        )}
        
        {/* Visa Status for International Students */}
        {personal.nationality && (
          <div className="text-sm text-green-600 font-medium mt-2">
            {personal.nationality}
          </div>
        )}
      </div>

      <div className={sectionSpacing}>
        {/* Personal Statement / Career Objective */}
        {personal.summary && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-2 flex items-center">
              <span className="mr-2">🎯</span>
              Career Objective
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">{personal.summary}</p>
          </div>
        )}

        {/* Education - Primary Section for Graduates */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Education
            </h2>
            <div className={itemSpacing}>
              {education.map((edu) => (
                <div key={edu.id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <div className="text-gray-700 font-medium">{edu.institution}</div>
                      <div className="text-sm text-gray-600">{edu.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatMonthYear(edu.startDate)}{edu.current || edu.endDate === 'Present' ? ' - Present' : edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ''}
                      </div>
                      {edu.grade && (
                        <div className="text-sm font-bold text-green-700 mt-1">
                          {edu.grade}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {edu.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">{edu.description}</p>
                    </div>
                  )}
                  
                  {/* Relevant Modules for Irish Unis */}
                  {edu.modules && (
                    <div className="mt-2">
                      <span className="text-sm font-semibold">Key Modules: </span>
                      <span className="text-sm text-gray-700">{edu.modules}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience - Including Internships */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <span className="mr-2">💼</span>
              Experience & Internships
            </h2>
            <div className={itemSpacing}>
              {experience.map((exp) => (
                <div key={exp.id} className="pl-4 border-l-2 border-gray-300">
                  <div className="mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.position}</h3>
                        <div className="text-gray-700">{exp.company}</div>
                        <div className="text-sm text-gray-600">{exp.location}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </div>
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                  )}
                  
                  {(exp.achievements || []).length > 0 && (
                    <ul className="space-y-1">
                      {(exp.achievements || []).map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
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

        {/* Skills - Organized by Category */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <span className="mr-2">🛠️</span>
              Skills & Competencies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category)
                if (categorySkills.length === 0) return null
                
                return (
                  <div key={category} className="bg-gray-50 p-3 rounded">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      {category === 'Soft' ? 'Interpersonal' : category} Skills
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {categorySkills.map(skill => (
                        <span 
                          key={skill.id} 
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
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

        {/* Academic Projects */}
        {projects && projects.length > 0 && isSectionVisible('projects') && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Academic Projects & Research
            </h2>
            <div className={itemSpacing}>
              {projects.map((project) => (
                <div key={project.id} className="bg-blue-50 p-3 rounded">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className="text-xs text-gray-600">
                      {project.startDate} - {project.endDate || 'Present'}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                  )}
                  
                  {(project.technologies || []).length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">Technologies: </span>
                      {(project.technologies || []).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements & Awards */}
        {certifications && certifications.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements & Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start">
                  <span className="text-yellow-500 mr-2">🏆</span>
                  <div className="flex-1">
                    <div>
                      <span className="font-semibold">{cert.name}</span>
                      <span className="text-sm text-gray-600"> - {cert.issuer}</span>
                      {cert.credentialId && (
                        <span className="text-xs text-gray-500"> ({cert.credentialId})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra-Curricular & Societies */}
        {interests && interests.length > 0 && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Extra-Curricular Activities & Interests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {interests.map(interest => (
                <div key={interest.id} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <div>
                    <span className="font-medium">{interest.name}</span>
                    {interest.description && (
                      <p className="text-xs text-gray-600">{interest.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && isSectionVisible('languages') && (
          <div className="mb-5">
            <h2 className="text-lg font-bold text-green-600 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {languages.map(language => (
                <div key={language.id} className="bg-gray-100 px-3 py-2 rounded">
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
            <h2 className="text-lg font-bold text-green-600 mb-3">References</h2>
            {references && references.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((reference) => (
                  <div key={reference.id} className="bg-gray-50 p-3 rounded">
                    <div className="font-semibold text-gray-900">{reference.name}</div>
                    <div className="text-sm text-gray-700">{reference.position}</div>
                    <div className="text-sm text-gray-700">{reference.company}</div>
                    <div className="text-sm text-blue-600">{reference.email}</div>
                    {reference.relationship && (
                      <div className="text-xs text-gray-500 italic mt-1">{reference.relationship}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">Available upon request</p>
            )}
          </div>
        )}
      </div>

      {/* Graduate Footer */}
      <div className="mt-6 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>Recent Graduate • Eager to Learn • Ready to Contribute</p>
      </div>
    </div>
  )
}
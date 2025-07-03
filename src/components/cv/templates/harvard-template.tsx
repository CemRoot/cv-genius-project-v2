import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"

interface HarvardTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function HarvardTemplate({ cv, cvData, isMobile = false }: HarvardTemplateProps) {
  // Force refresh - ultra-tight spacing v2
  console.log('🔥 Harvard Template rendered with ultra-tight spacing v2')
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

  // Default design settings
  const defaultSettings: DesignSettings = {
    margins: 0.5,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Times New Roman',
    fontSize: 10,
    lineHeight: 1.0  // 1.2 -> 1.0 for tighter spacing
  }

  const settings = designSettings || defaultSettings

  // Convert spacing to CSS classes - Ultra-tight spacing for professional CV
  const spacingClasses = {
    tight: 'space-y-0.5',    // Much tighter
    normal: 'space-y-1',     // 2 -> 1 (half the previous)
    relaxed: 'space-y-1.5',  // 3 -> 1.5 (half the previous)
    spacious: 'space-y-2'    // 4 -> 2 (half the previous)
  }

  const itemSpacingClasses = {
    tight: 'space-y-0',      // No spacing
    normal: 'space-y-0.5',   // 1.5 -> 0.5 (much tighter)
    relaxed: 'space-y-1',    // 2 -> 1 (half the previous)
    spacious: 'space-y-1.5'  // 3 -> 1.5 (half the previous)
  }

  const headerSpacingClasses = {
    compact: 'mb-2',  // 4 -> 2 (much tighter)
    normal: 'mb-3',   // 6 -> 3 (half the previous)
    generous: 'mb-4'  // 8 -> 4 (half the previous)
  }

  const headerInternalSpacingClasses = {
    compact: {
      nameToTitle: 'mb-0.5',      // 1 -> 0.5
      titleToContact: 'mb-1',     // 2 -> 1
      contactInternal: 'space-y-0.5'  // 1 -> 0.5
    },
    normal: {
      nameToTitle: 'mb-1.5',      // 3 -> 1.5
      titleToContact: 'mb-2',     // 4 -> 2
      contactInternal: 'space-y-1'  // 2 -> 1
    },
    generous: {
      nameToTitle: 'mb-2',        // 4 -> 2
      titleToContact: 'mb-3',     // 6 -> 3
      contactInternal: 'space-y-1.5'  // 3 -> 1.5
    }
  }

  const sectionSpacing = spacingClasses[settings.sectionSpacing] || spacingClasses.normal
  const itemSpacing = itemSpacingClasses[settings.sectionSpacing] || itemSpacingClasses.normal
  const headerSpacing = headerSpacingClasses[settings.headerSpacing] || headerSpacingClasses.normal
  const headerInternal = headerInternalSpacingClasses[settings.headerSpacing] || headerInternalSpacingClasses.normal

  // Dynamic styles based on settings and mobile detection
  const containerStyle = {
    padding: isMobile ? '0.3rem' : `${settings.margins}in`,
    fontFamily: `"${settings.fontFamily}", serif`,
    fontSize: isMobile ? '8px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
  }

  return (
    <div 
      className={`bg-white text-black min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={{
        ...containerStyle,
        // Ensure proper dimensions
        maxWidth: '100%',
        padding: isMobile ? '0.5rem' : `${settings.margins}in`,
      }}
    >
      {/* Header */}
      <div className={`text-center ${headerSpacing}`}>
        <h1 className={`${isMobile ? 'text-lg' : 'text-4xl'} font-bold tracking-wide uppercase ${headerInternal.nameToTitle}`}>
          {personal.fullName || "Your Name"}
        </h1>
        
        <div className={`${isMobile ? 'text-sm' : 'text-xl'} font-medium text-gray-600 ${headerInternal.titleToContact}`}>
          {personal.title || "Python Developer"}
        </div>
        
        <div className={`${isMobile ? 'text-xs' : 'text-sm'} ${headerInternal.contactInternal}`}>
          <div className="w-full flex justify-center">
            <div className="w-full text-center" style={{ letterSpacing: '0.3px', wordBreak: isMobile ? 'break-word' : 'break-all' }}>
              {personal.phone && formatIrishPhone(personal.phone)}
              {personal.phone && personal.email && ' • '}
              {personal.email}
              {personal.email && personal.linkedin && ' • '}
              {personal.linkedin && personal.linkedin.replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}
              {personal.linkedin && personal.website && ' • '}
              {personal.website && personal.website.replace('https://', '')}
            </div>
          </div>
          <div className="text-center">
            • {personal.address} • {personal.nationality || "STAMP2 | Master Student"}
          </div>
        </div>
      </div>

      <div className={sectionSpacing}>
        {/* Professional Summary */}
        {personal.summary && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center border-b border-gray-400 pb-0.5`}>Summary</h2>
            <p className="text-justify leading-tight">{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>PROFESSIONAL EXPERIENCE</h2>
            <div className={itemSpacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold">{exp.position}</h3>
                    <div className="italic">{exp.company}, {exp.location}</div>
                  </div>
                  <div className="text-right text-sm">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
                
                {exp.description && (
                  <p className="mb-2 text-justify">{exp.description}</p>
                )}
                
                {(exp.achievements || []).length > 0 && (
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {(exp.achievements || []).map((achievement, index) => (
                      <li key={index} className="text-justify">{achievement}</li>
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
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>EDUCATION</h2>
            <div className={itemSpacing}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                      <div className="italic">{edu.institution}, {edu.location}</div>
                      {edu.grade && <div>Grade: {edu.grade}</div>}
                    </div>
                    <div className="text-right text-sm">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </div>
                  </div>
                  {edu.description && (
                    <p className="mt-1 text-justify">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills - Compact Irish CV Format */}
        {skills.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>SKILLS</h2>
            <div className="space-y-0.5 text-sm leading-tight">
              {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category)
                if (categorySkills.length === 0) return null
                
                // Take only top 5-6 skills per category for compact display
                const topSkills = categorySkills.slice(0, 6)
                const skillNames = topSkills.map(skill => skill.name).join(' • ')
                
                return (
                  <div key={category} className="text-sm">
                    <span className="font-semibold">{category}:</span> {skillNames}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && isSectionVisible('languages') && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>LANGUAGES</h2>
            <div className="grid grid-cols-2 gap-4">
              {languages.map(language => (
                <div key={language.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{language.name}</span>
                    {language.certification && (
                      <div className="text-xs text-gray-600">{language.certification}</div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{language.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {(() => {
          const hasProjects = projects && projects.length > 0
          const isVisible = isSectionVisible('projects')
          return hasProjects && isVisible
        })() && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>PROJECTS</h2>
            <div className={itemSpacing}>
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold">{project.name}</h3>
                      {(project.technologies || []).length > 0 && (
                        <div className="text-sm text-gray-600">
                          Technologies: {(project.technologies || []).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      {project.startDate} - {project.current ? "Present" : project.endDate}
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="mb-2 text-justify">{project.description}</p>
                  )}
                  
                  {(project.achievements || []).length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {(project.achievements || []).map((achievement, index) => (
                        <li key={index} className="text-justify">{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>CERTIFICATIONS</h2>
            <div className={itemSpacing}>
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{cert.name}</h3>
                      <div className="italic">{cert.issuer}</div>
                      {cert.credentialId && (
                        <div className="text-sm text-gray-600">ID: {cert.credentialId}</div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      {cert.issueDate}
                      {cert.expiryDate && (
                        <div>Expires: {cert.expiryDate}</div>
                      )}
                    </div>
                  </div>
                  {cert.description && (
                    <p className="mt-1 text-justify text-sm">{cert.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>INTERESTS</h2>
            <div className="grid grid-cols-2 gap-2">
              {interests.map(interest => (
                <div key={interest.id}>
                  <span className="font-medium">{interest.name}</span>
                  {interest.description && (
                    <div className="text-xs text-gray-600">{interest.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {(() => {
          const isReferencesVisible = isSectionVisible('references')
          const referencesDisplay = cvData?.referencesDisplay || 'available-on-request'
          const hasReferences = references && references.length > 0
          
          // Show references section if it's visible AND either:
          // 1. User wants detailed view AND has references, OR 
          // 2. User wants available-on-request view
          const shouldShowReferencesSection = isReferencesVisible && (
            (referencesDisplay === 'detailed' && hasReferences) ||
            (referencesDisplay === 'available-on-request')
          )
          
          return shouldShowReferencesSection
        })() && (
          <div>
            <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold mb-1 text-center`}>REFERENCES</h2>
            {cvData?.referencesDisplay === 'detailed' && references && references.length > 0 ? (
              <div className="space-y-2">
                {references.map((reference) => (
                  <div key={reference.id} className="text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      <span className="font-semibold">{reference.name}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-700">{reference.position}</span>
                      {reference.company && (
                        <>
                          <span className="text-gray-600">at</span>
                          <span className="text-gray-700">{reference.company}</span>
                        </>
                      )}
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{reference.email}</span>
                      {reference.phone && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-600">{reference.phone}</span>
                        </>
                      )}
                      {reference.relationship && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-xs">({reference.relationship})</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>References available upon request</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Only show if references section is not visible or user hasn't explicitly set preference */}
      {(!isSectionVisible('references') || !cvData?.referencesDisplay) && (
        <div className="text-center text-xs text-gray-600 mt-8 pt-4 border-t border-gray-300">
          <p>References available upon request</p>
        </div>
      )}
    </div>
  )
}
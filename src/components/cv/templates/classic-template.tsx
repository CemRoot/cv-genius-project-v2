import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { formatMonthYear } from "@/utils/format-date"
import { Mail, Phone, MapPin, Linkedin } from "lucide-react"

interface ClassicTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function ClassicTemplate({ cv, cvData, isMobile = false }: ClassicTemplateProps) {
  console.log('🚀 Classic Template rendered')
  const data = cv || cvData
  console.log('📊 Full CV data in template:', data)
  console.log('👤 Personal data:', data?.personal)
  console.log('🌍 Nationality value:', data?.personal?.nationality)
  if (!data) {
    return <div className="p-8 text-center">Loading...</div>
  }
  
  const { 
    personal, 
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

  // Ensure personal data exists with defaults
  const personalInfo = personal || { fullName: '', email: '', phone: '', address: '', nationality: '' }
  
  console.log('🌍 Nationality prop in template:', personalInfo?.nationality)

  // Helper function to check if a section is visible
  const isSectionVisible = (sectionType: string) => {
    const section = sections.find(s => s.type === sectionType)
    return section?.visible ?? false
  }

  // Classic design settings
  const defaultSettings: DesignSettings = {
    margins: 0.15,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Arial, sans-serif',
    fontSize: 11,
    lineHeight: 1.4
  }

  const settings = designSettings || defaultSettings

  // Dynamic styles based on settings
  const containerStyle = {
    padding: isMobile ? '1rem' : `${settings.margins}in`,
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '11px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
  }

  return (
    <div 
      className={`cv-container classic bg-white text-black min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Header - Clean centered layout like user requested */}
      <header className="cv-header text-center mb-6">
        <h1 className={`name ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold uppercase mb-2 text-black`}>
          {personalInfo.fullName || "YOUR NAME"}
        </h1>
        <p className={`title ${isMobile ? 'text-base' : 'text-lg'} mb-3 text-gray-600`}>
          {personalInfo.title || "Test Developer"}
        </p>
        
        {/* Contact info - Simple inline format */}
        <div className="contact-info text-sm text-gray-700 space-y-1">
          <div className="flex justify-center items-center flex-wrap gap-2">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{formatIrishPhone(personalInfo.phone)}</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.nationality && <span className="nationality text-green-700 font-medium">{personalInfo.nationality}</span>}
            {personalInfo.website && <span>{personalInfo.website.replace('https://', '').replace('http://', '')}</span>}
            {personalInfo.linkedin && <span>linkedin.com</span>}
          </div>
        </div>
      </header>

      {/* Summary Section */}
      {personalInfo.summary && isSectionVisible('summary') && (
        <section className="summary mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            SUMMARY
          </h2>
          <p className="text-justify leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && isSectionVisible('experience') && (
        <section className="experience mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="exp-header flex justify-between items-start mb-2">
                  <div className="exp-left">
                    <h3 className="font-bold text-black">
                      {exp.position} at {exp.company}
                    </h3>
                  </div>
                  <div className="exp-right text-right">
                    <p className="exp-meta text-sm text-gray-600">
                      {exp.location} • {new Date(exp.startDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <p className="exp-description text-justify leading-relaxed">
                    {exp.description}
                  </p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="leading-relaxed">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && isSectionVisible('education') && (
        <section className="education mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="education-item">
                <div className="edu-header flex justify-between items-start">
                  <div className="edu-left">
                    <h3 className="font-bold text-black">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="institution font-medium text-gray-700">
                      {edu.institution}
                    </p>
                  </div>
                  <div className="edu-right text-right">
                    <p className="location text-sm text-gray-600">
                      {edu.location}
                    </p>
                    <p className="date text-sm text-gray-600">
                      {formatMonthYear(edu.startDate)}{edu.current || edu.endDate === 'Present' ? ' - Present' : edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ''}
                    </p>
                  </div>
                </div>
                {edu.grade && (
                  <p className="text-sm mt-1 text-gray-600">
                    Grade: {edu.grade}
                  </p>
                )}
                {edu.description && (
                  <p className="text-sm mt-1 text-justify">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && isSectionVisible('skills') && (
        <section className="skills mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            SKILLS
          </h2>
          <div className="space-y-2">
            {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
              const categorySkills = skills.filter(skill => skill.category === category)
              if (categorySkills.length === 0) return null
              
              const skillNames = categorySkills.map(skill => skill.name).join(' • ')
              
              return (
                <div key={category} className="text-sm">
                  <span className="font-semibold">{category}:</span> {skillNames}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Languages Section */}
      {languages && languages.length > 0 && isSectionVisible('languages') && (
        <section className="languages mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            LANGUAGES
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {languages.map(language => (
              <div key={language.id} className="flex justify-between">
                <span className="font-medium">{language.name}</span>
                <span className="text-gray-600">{language.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && isSectionVisible('projects') && (
        <section className="projects mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            PROJECTS
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold">{project.name}</h3>
                  <span className="text-sm text-gray-600">
                    {project.startDate} - {project.current ? "Present" : project.endDate}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-justify mb-2">{project.description}</p>
                )}
                {(project.technologies || []).length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Technologies:</span> {(project.technologies || []).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && isSectionVisible('certifications') && (
        <section className="certifications mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            CERTIFICATIONS
          </h2>
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{cert.name}</h3>
                    <p className="text-sm text-gray-700">{cert.issuer}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{new Date(cert.issueDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}</p>
                    {cert.expiryDate && (
                      <p>Expires {new Date(cert.expiryDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>
                {cert.description && (
                  <p className="text-sm mt-1 text-justify">{cert.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interests Section */}
      {interests && interests.length > 0 && isSectionVisible('interests') && (
        <section className="interests mb-6">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            INTERESTS
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {interests.map(interest => (
              <div key={interest.id}>
                <span className="font-medium">{interest.name}</span>
                {interest.description && (
                  <div className="text-xs text-gray-600">{interest.description}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* References Section */}
      {isSectionVisible('references') && (
        <section className="references">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold uppercase border-b border-black pb-1 mb-3`}>
            REFERENCES
          </h2>
          {data.referencesDisplay === 'detailed' && references && references.length > 0 ? (
            <div className="space-y-2">
              {references.map((reference) => (
                <div key={reference.id} className="text-sm">
                  <p className="font-semibold">{reference.name} - {reference.position}</p>
                  <p>{reference.company}</p>
                  <p>{reference.email} • {reference.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="references-available text-center italic text-gray-600">
              Available upon request
            </p>
          )}
        </section>
      )}
    </div>
  )
} 
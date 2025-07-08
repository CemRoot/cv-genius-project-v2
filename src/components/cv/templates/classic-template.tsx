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

  // Classic design settings - LIVE PREVIEW ILE AYNI
  const defaultSettings: DesignSettings = {
    margins: 0.15, // Daha az kenar boşlukları (0.25 → 0.15)
    sectionSpacing: 'normal', // Dar satır aralığı
    headerSpacing: 'normal', // Compact header spacing
    fontFamily: 'Arial, Helvetica, sans-serif', // SANS-SERIF zorunlu
    fontSize: 11,
    lineHeight: 1.3 // Daha sıkışık satır aralığı
  }

  const settings = designSettings || defaultSettings

  // Dynamic styles - Proper CV formatting
  const containerStyle = {
    padding: isMobile ? '1rem' : `${settings.margins}in`,
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '11px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
    maxWidth: '8.5in', // A4 width
    margin: '0 auto',
    paddingTop: isMobile ? '0.5rem' : '0.5in',
    paddingBottom: isMobile ? '0.5rem' : '0.5in'
  }

  return (
    <div 
      className={`cv-container classic bg-white text-black min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Header - Professional spacing */}
      <header className="cv-header text-center mb-4">
        {/* Ana başlık - KALIN SANS-SERIF */}
        <h1 className={`name ${isMobile ? 'text-2xl' : 'text-3xl'} font-black uppercase mb-1 text-black`}
            style={{fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: '900'}}>
          {personalInfo.fullName || "YOUR NAME"}
        </h1>
        
        {/* Alt başlık - SİYAH SANS-SERIF */}
        <p className={`title ${isMobile ? 'text-base' : 'text-lg'} mb-3 text-black font-medium`}
           style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
          {personalInfo.title || "Test Developer"}
        </p>
        
        {/* Contact info - Single line, properly spaced */}
        <div className="contact-info text-sm text-black"
             style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{formatIrishPhone(personalInfo.phone)}</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.nationality && <span className="nationality text-black font-medium">{personalInfo.nationality}</span>}
            {personalInfo.website && <span>{personalInfo.website.replace('https://', '').replace('http://', '')}</span>}
            {personalInfo.linkedin && <span>linkedin.com</span>}
          </div>
        </div>
      </header>

      {/* Summary Section - KALIN ÇİZGİ */}
      {personalInfo.summary && isSectionVisible('summary') && (
        <section className="summary mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            SUMMARY
          </h2>
          <p className="text-justify leading-snug" // SIKIŞIK LEADING
             style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience Section - KALIN ÇİZGİ */}
      {experience.length > 0 && isSectionVisible('experience') && (
        <section className="experience mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            EXPERIENCE
          </h2>
          <div className="space-y-3"> {/* COMPACT SPACING */}
            {experience.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="exp-header flex justify-between items-start mb-1">
                  <div className="exp-left">
                    <h3 className="font-bold text-black"
                        style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {exp.position} at {exp.company}
                    </h3>
                  </div>
                  <div className="exp-right text-right">
                    <p className="exp-meta text-sm text-black" // SİYAH OLACAK
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {exp.location} • {new Date(exp.startDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {exp.description && (
                  <p className="exp-description text-justify leading-snug" // SIKIŞIK
                     style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>
                    {exp.description}
                  </p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc pl-6 space-y-0 mt-1"> {/* COMPACT */}
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="leading-snug"
                          style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>
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

      {/* Education Section - KALIN ÇİZGİ */}
      {education.length > 0 && isSectionVisible('education') && (
        <section className="education mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            EDUCATION
          </h2>
          <div className="space-y-2"> {/* COMPACT */}
            {education.map((edu) => (
              <div key={edu.id} className="education-item">
                <div className="edu-header flex justify-between items-start">
                  <div className="edu-left">
                    <h3 className="font-bold text-black"
                        style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="institution font-medium text-black" // SİYAH
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {edu.institution}
                    </p>
                  </div>
                  <div className="edu-right text-right">
                    <p className="location text-sm text-black" // SİYAH
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {edu.location}
                    </p>
                    <p className="date text-sm text-black" // SİYAH
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                      {formatMonthYear(edu.startDate)}{edu.current || edu.endDate === 'Present' ? ' - Present' : edu.endDate ? ` - ${formatMonthYear(edu.endDate)}` : ''}
                    </p>
                  </div>
                </div>
                {edu.grade && (
                  <p className="text-sm mt-1 text-black"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                    Grade: {edu.grade}
                  </p>
                )}
                {edu.description && (
                  <p className="text-sm mt-1 text-justify leading-snug"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section - KALIN ÇİZGİ */}
      {skills.length > 0 && isSectionVisible('skills') && (
        <section className="skills mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            SKILLS
          </h2>
          <div className="space-y-1"> {/* COMPACT */}
            {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
              const categorySkills = skills.filter(skill => skill.category === category)
              if (categorySkills.length === 0) return null
              
              const skillNames = categorySkills.map(skill => skill.name).join(' • ')
              
              return (
                <div key={category} className="text-sm leading-snug"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                  <span className="font-semibold">{category}:</span> {skillNames}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Languages Section - KALIN ÇİZGİ */}
      {languages && languages.length > 0 && isSectionVisible('languages') && (
        <section className="languages mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            LANGUAGES
          </h2>
          <div className="grid grid-cols-2 gap-1 text-sm"> {/* COMPACT */}
            {languages.map(language => (
              <div key={language.id} className="flex justify-between"
                   style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                <span className="font-medium">{language.name}</span>
                <span className="text-black">{language.level}</span> {/* SİYAH */}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section - KALIN ÇİZGİ */}
      {projects && projects.length > 0 && isSectionVisible('projects') && (
        <section className="projects mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            PROJECTS
          </h2>
          <div className="space-y-2"> {/* COMPACT */}
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold"
                      style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>{project.name}</h3>
                  <span className="text-sm text-black"
                        style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                    {project.startDate} - {project.current ? "Present" : project.endDate}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-justify mb-1 leading-snug"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>{project.description}</p>
                )}
                {(project.technologies || []).length > 0 && (
                  <p className="text-sm text-black"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                    <span className="font-semibold">Technologies:</span> {(project.technologies || []).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section - KALIN ÇİZGİ */}
      {certifications && certifications.length > 0 && isSectionVisible('certifications') && (
        <section className="certifications mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            CERTIFICATIONS
          </h2>
          <div className="space-y-2"> {/* COMPACT */}
            {certifications.map((cert) => (
              <div key={cert.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold"
                        style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>{cert.name}</h3>
                    <p className="text-sm text-black"
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>{cert.issuer}</p>
                  </div>
                  <div className="text-right text-sm text-black"
                       style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                    <p>{new Date(cert.issueDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}</p>
                    {cert.expiryDate && (
                      <p>Expires {new Date(cert.expiryDate).toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>
                {cert.description && (
                  <p className="text-sm mt-1 text-justify leading-snug"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.3'}}>{cert.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interests Section - KALIN ÇİZGİ */}
      {interests && interests.length > 0 && isSectionVisible('interests') && (
        <section className="interests mb-4">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            INTERESTS
          </h2>
          <div className="grid grid-cols-2 gap-1 text-sm"> {/* COMPACT */}
            {interests.map(interest => (
              <div key={interest.id}
                   style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                <span className="font-medium">{interest.name}</span>
                {interest.description && (
                  <div className="text-xs text-black">{interest.description}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* References Section - KALIN ÇİZGİ */}
      {isSectionVisible('references') && (
        <section className="references">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black uppercase mb-2 text-black`}
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif', 
                borderBottom: '2px solid black', // KALIN ÇİZGİ
                paddingBottom: '2px'
              }}>
            REFERENCES
          </h2>
          {data.referencesDisplay === 'detailed' && references && references.length > 0 ? (
            <div className="space-y-1"> {/* COMPACT */}
              {references.map((reference) => (
                <div key={reference.id} className="text-sm"
                     style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
                  <p className="font-semibold">{reference.name} - {reference.position}</p>
                  <p>{reference.company}</p>
                  <p>{reference.email} • {reference.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="references-available text-center italic text-black" // SİYAH
               style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
              Available upon request
            </p>
          )}
        </section>
      )}
    </div>
  )
} 
import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { Mail, Phone, MapPin, Linkedin } from "lucide-react"

interface ClassicTemplateProps {
  cv?: CVData
  cvData?: CVData
  isMobile?: boolean
}

export function ClassicTemplate({ cv, cvData, isMobile = false }: ClassicTemplateProps) {
  console.log('🚀 Classic Template rendered')
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

  // Classic design settings
  const defaultSettings: DesignSettings = {
    margins: 1,
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
    fontSize: isMobile ? '10px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
  }

  // Group skills by category for display
  const groupSkillsByCategory = (skills: any[]) => {
    const categoryMap: { [key: string]: string } = {
      'Technical': 'Programming Languages',
      'Software': 'Frameworks/Tools',
      'Soft': 'Soft Skills',
      'Other': 'Other Skills'
    }
    
    const grouped: { [key: string]: string[] } = {}
    
    skills.forEach(skill => {
      const category = categoryMap[skill.category] || skill.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(skill.name)
    })
    
    return Object.entries(grouped).map(([category, skillList]) => ({
      category,
      skills: skillList
    }))
  }

  return (
    <div 
      className={`bg-white text-black min-h-full w-full ${isMobile ? 'text-xs' : ''}`}
      style={containerStyle}
    >
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold uppercase mb-2 text-black`}>
          {personal.fullName || "YOUR NAME"}
        </h1>
        <p className={`${isMobile ? 'text-lg' : 'text-xl'} mb-4 text-gray-600`}>
          {personal.title || "Python Developer"}
        </p>
        <div className="flex justify-center items-center flex-wrap gap-4 text-sm">
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {formatIrishPhone(personal.phone)}
            </span>
          )}
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {personal.email}
            </span>
          )}
          {personal.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {personal.address}
            </span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              LinkedIn Profile
            </span>
          )}
          {personal.website && (
            <span className="flex items-center gap-1">
              <span className="text-xs">🌐</span>
              {personal.website.replace('https://', '').replace('http://', '')}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {personal.summary && isSectionVisible('summary') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Summary
          </h2>
          <p className="text-justify leading-relaxed">
            {personal.summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && isSectionVisible('skills') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Skills
          </h2>
          <div className="space-y-3">
            {groupSkillsByCategory(skills).map((group, index) => (
              <div key={index} className="flex flex-wrap">
                <strong className="inline-block min-w-[150px] mr-2">
                  {group.category}:
                </strong>
                <span className="flex-1">
                  {group.skills.join(' • ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && isSectionVisible('experience') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
                    {exp.position}
                  </h3>
                  <p className="font-medium">
                    {exp.company}
                  </p>
                </div>
                <div className="text-right min-w-[150px]">
                  <p className="text-sm">
                    {exp.location}
                  </p>
                  <p className="text-sm">
                    {new Date(exp.startDate).toLocaleDateString('en-IE', { month: '2-digit', year: 'numeric' })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-IE', { month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {exp.description && (
                <p className="text-justify leading-relaxed mb-2">
                  {exp.description}
                </p>
              )}
              {exp.achievements.length > 0 && (
                <ul className="list-disc pl-6 space-y-1">
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

      {/* Education */}
      {education.length > 0 && isSectionVisible('education') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="break-inside-avoid">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="font-medium">
                      {edu.institution}
                    </p>
                  </div>
                  <div className="text-right min-w-[150px]">
                    <p className="text-sm">
                      {edu.location}
                    </p>
                    <p className="text-sm">
                      {new Date(edu.startDate).toLocaleDateString('en-IE', { month: '2-digit', year: 'numeric' })} - {new Date(edu.endDate).toLocaleDateString('en-IE', { month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {edu.grade && (
                  <p className="text-sm mt-1">
                    Grade: {edu.grade}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && isSectionVisible('certifications') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <strong>{cert.name}</strong> - {cert.issuer} ({new Date(cert.issueDate).getFullYear()})
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && isSectionVisible('languages') && (
        <section className="mb-6">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center uppercase border-b border-black pb-2 mb-4`}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <div key={lang.id} className="flex items-center gap-2">
                <span className="font-medium">{lang.name}</span>
                <span className="text-sm text-gray-600">({lang.level})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
} 
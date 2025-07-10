import { CVData, DesignSettings } from "@/types/cv"
import { formatIrishPhone } from "@/lib/utils"
import { formatMonthYear } from "@/utils/format-date"

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

  // Classic design settings optimized for professional layout
  const defaultSettings: DesignSettings = {
    margins: 0.15, // Reduced margins for better content space
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Lato, Arial, sans-serif', // Professional font stack
    fontSize: 11,
    lineHeight: 1.3
  }

  const settings = designSettings || defaultSettings

  // Dynamic styles for A4-optimized layout
  const containerStyle = {
    fontFamily: settings.fontFamily,
    fontSize: isMobile ? '11px' : `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
    color: '#000000', // Ensure pure black for ATS compatibility
    backgroundColor: '#ffffff'
  }

  // A4 page dimensions and spacing
  const pageStyle = isMobile ? {
    padding: '1rem',
    minHeight: 'auto'
  } : {
    padding: '20mm',
    minHeight: 'calc(297mm - 40mm)', // A4 height minus margins
    maxWidth: '210mm', // A4 width
    margin: '0 auto'
  }

  return (
    <div 
      className="cv-template-classic h-full font-lato text-black bg-white overflow-x-auto"
      style={{
        ...containerStyle,
        ...pageStyle,
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: isMobile ? '1rem' : '6mm'
      }}
    >
      {/* Header Section */}
      <header className="cv-header" style={{ gridRow: '1' }}>
        <div 
          className="header-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: isMobile ? '1rem' : '8mm',
            alignItems: 'start'
          }}
        >
          {/* Personal Information */}
          <div className="personal-info">
            <h1 
              className="cv-name text-black font-bold"
              style={{
                fontSize: isMobile ? '1.5rem' : '24pt',
                lineHeight: 1.2,
                margin: '0 0 3mm 0',
                letterSpacing: '0.5px'
              }}
            >
              {personalInfo.fullName || "Your Name"}
            </h1>
            <h2 
              className="cv-title text-black font-medium"
              style={{
                fontSize: isMobile ? '1rem' : '14pt',
                lineHeight: 1.3,
                margin: '0 0 6mm 0',
                fontWeight: '500'
              }}
            >
              {personalInfo.title || "Professional Title"}
            </h2>
          </div>

          {/* Contact Information */}
          <div 
            className="contact-info"
            style={{
              fontSize: isMobile ? '0.75rem' : '10pt',
              lineHeight: 1.4,
              textAlign: 'right'
            }}
          >
            {personalInfo.email && (
              <div className="contact-item" style={{ marginBottom: '2mm' }}>
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="contact-item" style={{ marginBottom: '2mm' }}>
                {formatIrishPhone(personalInfo.phone)}
              </div>
            )}
            {personalInfo.address && (
              <div className="contact-item">
                {personalInfo.address}
              </div>
            )}
            {personalInfo.nationality && (
              <div className="contact-item" style={{ marginBottom: '2mm' }}>
                {personalInfo.nationality}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="cv-content"
        style={{
          gridRow: '2',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: isMobile ? '1rem' : '6mm'
        }}
      >
        {/* Professional Summary Section */}
        {personalInfo.summary && isSectionVisible('summary') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="summary-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Professional Summary
              </h3>
              <div 
                className="summary-content"
                style={{
                  fontSize: isMobile ? '0.875rem' : '11pt',
                  lineHeight: 1.5,
                  textAlign: 'justify',
                  margin: '3mm 0 0 0'
                }}
              >
                {personalInfo.summary}
              </div>
            </div>
          </section>
        )}

        {/* Work Experience Section */}
        {experience.length > 0 && isSectionVisible('experience') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="experience-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Work Experience
              </h3>
              <div className="experience-items" style={{ marginTop: '3mm' }}>
                {experience.map((exp, index) => (
                  <div 
                    key={exp.id} 
                    className="experience-item"
                    style={{ 
                      marginBottom: index < experience.length - 1 ? '4mm' : '0',
                      pageBreakInside: 'avoid'
                    }}
                  >
                    <div 
                      className="exp-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '1mm'
                      }}
                    >
                      <div className="exp-left">
                        <h4 
                          className="job-title font-bold"
                          style={{
                            fontSize: isMobile ? '0.875rem' : '11pt',
                            margin: '0',
                            color: '#000'
                          }}
                        >
                          {exp.position}
                        </h4>
                        <p 
                          className="company"
                          style={{
                            fontSize: isMobile ? '0.75rem' : '10pt',
                            margin: '0',
                            fontWeight: '500',
                            color: '#000'
                          }}
                        >
                          {exp.company}
                        </p>
                      </div>
                      <div className="exp-right text-right">
                        <p 
                          className="date"
                          style={{
                            fontSize: isMobile ? '0.75rem' : '10pt',
                            margin: '0',
                            color: '#000'
                          }}
                        >
                          {formatMonthYear(exp.startDate)} - {exp.current ? 'Present' : formatMonthYear(exp.endDate)}
                        </p>
                        {exp.location && (
                          <p 
                            className="location"
                            style={{
                              fontSize: isMobile ? '0.75rem' : '10pt',
                              margin: '0',
                              color: '#000'
                            }}
                          >
                            {exp.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {exp.description && (
                      <div 
                        className="exp-description"
                        style={{
                          fontSize: isMobile ? '0.75rem' : '10pt',
                          lineHeight: 1.4,
                          margin: '2mm 0 0 0',
                          textAlign: 'justify'
                        }}
                      >
                        {exp.description}
                      </div>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul 
                        className="achievements"
                        style={{
                          margin: '2mm 0 0 4mm',
                          padding: '0',
                          listStyleType: 'disc'
                        }}
                      >
                        {exp.achievements.map((achievement, i) => (
                          <li 
                            key={i}
                            style={{
                              fontSize: isMobile ? '0.75rem' : '10pt',
                              lineHeight: 1.4,
                              marginBottom: '1mm'
                            }}
                          >
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {education.length > 0 && isSectionVisible('education') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="education-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Education
              </h3>
              <div className="education-items" style={{ marginTop: '3mm' }}>
                {education.map((edu, index) => (
                  <div 
                    key={edu.id} 
                    className="education-item"
                    style={{ 
                      marginBottom: index < education.length - 1 ? '4mm' : '0',
                      pageBreakInside: 'avoid'
                    }}
                  >
                    <div 
                      className="edu-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '1mm'
                      }}
                    >
                      <div className="edu-left">
                        <h4 
                          className="degree font-bold"
                          style={{
                            fontSize: isMobile ? '0.875rem' : '11pt',
                            margin: '0',
                            color: '#000'
                          }}
                        >
                          {edu.degree} {edu.field && `in ${edu.field}`}
                        </h4>
                        <p 
                          className="institution"
                          style={{
                            fontSize: isMobile ? '0.75rem' : '10pt',
                            margin: '0',
                            fontWeight: '500',
                            color: '#000'
                          }}
                        >
                          {edu.institution}
                        </p>
                      </div>
                      <div className="edu-right text-right">
                        <p 
                          className="date"
                          style={{
                            fontSize: isMobile ? '0.75rem' : '10pt',
                            margin: '0',
                            color: '#000'
                          }}
                        >
                          {formatMonthYear(edu.startDate)} - {edu.current ? 'Present' : formatMonthYear(edu.endDate)}
                        </p>
                        {edu.location && (
                          <p 
                            className="location"
                            style={{
                              fontSize: isMobile ? '0.75rem' : '10pt',
                              margin: '0',
                              color: '#000'
                            }}
                          >
                            {edu.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {edu.grade && (
                      <p 
                        className="grade"
                        style={{
                          fontSize: isMobile ? '0.75rem' : '10pt',
                          margin: '1mm 0 0 0',
                          color: '#000'
                        }}
                      >
                        Grade: {edu.grade}
                      </p>
                    )}
                    {edu.description && (
                      <div 
                        className="edu-description"
                        style={{
                          fontSize: isMobile ? '0.75rem' : '10pt',
                          lineHeight: 1.4,
                          margin: '2mm 0 0 0',
                          textAlign: 'justify'
                        }}
                      >
                        {edu.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && isSectionVisible('skills') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: '0'
            }}
          >
            <div className="skills-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Skills
              </h3>
              <div className="skills-content" style={{ marginTop: '3mm' }}>
                {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
                  const categorySkills = skills.filter(skill => skill.category === category)
                  if (categorySkills.length === 0) return null
                  
                  const skillNames = categorySkills.map(skill => skill.name).join(' • ')
                  
                  return (
                    <div 
                      key={category} 
                      className="skill-category"
                      style={{ 
                        fontSize: isMobile ? '0.75rem' : '10pt',
                        lineHeight: 1.4,
                        marginBottom: '2mm'
                      }}
                    >
                      <span className="font-semibold">{category}: </span>
                      <span>{skillNames}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Languages Section */}
        {languages && languages.length > 0 && isSectionVisible('languages') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: '0'
            }}
          >
            <div className="languages-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Languages
              </h3>
              <div 
                className="languages-grid"
                style={{ 
                  marginTop: '3mm',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2mm'
                }}
              >
                {languages.map(language => (
                  <div 
                    key={language.id} 
                    className="language-item"
                    style={{
                      fontSize: isMobile ? '0.75rem' : '10pt',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span className="font-medium">{language.name}</span>
                    <span>{language.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Add empty sections with placeholder text */}
        {(!personalInfo.summary || personalInfo.summary.trim() === '') && isSectionVisible('summary') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="summary-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Professional Summary
              </h3>
              <div 
                className="summary-content"
                style={{
                  fontSize: isMobile ? '0.875rem' : '11pt',
                  lineHeight: 1.5,
                  textAlign: 'justify',
                  margin: '3mm 0 0 0',
                  color: '#666',
                  fontStyle: 'italic'
                }}
              >
                Your professional summary will appear here...
              </div>
            </div>
          </section>
        )}

        {experience.length === 0 && isSectionVisible('experience') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="experience-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Work Experience
              </h3>
              <div 
                style={{
                  color: '#666',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.75rem' : '10pt',
                  margin: '3mm 0 0 0'
                }}
              >
                Add your work experience...
              </div>
            </div>
          </section>
        )}

        {education.length === 0 && isSectionVisible('education') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: isMobile ? '1rem' : '6mm'
            }}
          >
            <div className="education-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Education
              </h3>
              <div 
                style={{
                  color: '#666',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.75rem' : '10pt',
                  margin: '3mm 0 0 0'
                }}
              >
                Add your education...
              </div>
            </div>
          </section>
        )}

        {skills.length === 0 && isSectionVisible('skills') && (
          <section 
            className="cv-section"
            style={{
              breakInside: 'avoid',
              marginBottom: '0'
            }}
          >
            <div className="skills-section">
              <h3 
                className="section-heading text-black font-semibold"
                style={{
                  fontSize: isMobile ? '1rem' : '12pt',
                  lineHeight: 1.3,
                  margin: '0 0 3mm 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  borderBottom: '1pt solid #000',
                  paddingBottom: '1mm'
                }}
              >
                Skills
              </h3>
              <div 
                style={{
                  color: '#666',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.75rem' : '10pt',
                  margin: '3mm 0 0 0'
                }}
              >
                Add your skills...
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
} 
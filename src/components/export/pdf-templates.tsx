import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CVData } from '@/types/cv'
import { registerPDFFonts, getFontFamilyForPDF } from '@/lib/pdf-fonts'

// Using web-safe fonts to avoid CORS issues
// No font registration needed for Helvetica, Times-Roman

// Common styles for all templates
const commonStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    padding: 40,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #333',
    paddingBottom: 15
  },
  name: {
    fontSize: 24,
    fontWeight: 600,
    color: '#333',
    marginBottom: 5
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#666',
    marginTop: 5
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    marginBottom: 8,
    borderBottom: '1px solid #ddd',
    paddingBottom: 3
  },
  experienceItem: {
    marginBottom: 12
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#333'
  },
  company: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2
  },
  dates: {
    fontSize: 9,
    color: '#888',
    marginBottom: 4
  },
  description: {
    fontSize: 10,
    lineHeight: 1.3,
    color: '#555'
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  skillItem: {
    backgroundColor: '#f0f0f0',
    padding: '4 8',
    borderRadius: 3,
    fontSize: 9,
    color: '#333'
  },
  achievement: {
    marginBottom: 3,
    paddingLeft: 10,
    fontSize: 10,
    color: '#555'
  }
})

// Modern template styles
const modernStyles = StyleSheet.create({
  ...commonStyles,
  page: {
    ...commonStyles.page,
    backgroundColor: '#fafafa'
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 20,
    margin: -40,
    marginBottom: 20,
    borderBottom: 'none'
  },
  name: {
    ...commonStyles.name,
    color: 'white',
    fontSize: 28
  },
  contact: {
    ...commonStyles.contact,
    color: '#e5e7eb'
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#2563eb',
    borderBottom: '2px solid #2563eb'
  }
})

// Classic template styles
const classicStyles = StyleSheet.create({
  ...commonStyles,
  header: {
    ...commonStyles.header,
    textAlign: 'center',
    borderBottom: '3px double #333'
  },
  name: {
    ...commonStyles.name,
    fontSize: 26,
    textAlign: 'center'
  },
  contact: {
    ...commonStyles.contact,
    justifyContent: 'center',
    gap: 20
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    padding: 5,
    borderBottom: 'none'
  }
})

// Creative template styles
const creativeStyles = StyleSheet.create({
  ...commonStyles,
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff'
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#10b981',
    color: 'white',
    padding: 25,
    margin: -40,
    marginBottom: 25,
    borderBottom: 'none',
    transform: 'skewY(-2deg)',
    marginTop: -50
  },
  name: {
    ...commonStyles.name,
    color: 'white',
    fontSize: 26,
    transform: 'skewY(2deg)'
  },
  contact: {
    ...commonStyles.contact,
    color: '#d1fae5',
    transform: 'skewY(2deg)'
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#10b981',
    borderBottom: '2px solid #10b981',
    borderLeft: '4px solid #10b981',
    paddingLeft: 8
  }
})

// Format Irish date
const formatIrishDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IE', {
    month: 'short',
    year: 'numeric'
  })
}

// Helper function to check if a section is visible
const isSectionVisible = (sections: any[], sectionType: string) => {
  const section = sections.find(s => s.type === sectionType)
  return section?.visible ?? false
}

// Format Irish phone number
const formatIrishPhone = (phone: string): string => {
  if (!phone) return ''
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's an Irish mobile (starts with 353 or 0)
  if (cleaned.startsWith('353')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  } else if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

interface PDFTemplateProps {
  data: CVData
  template: 'modern' | 'classic' | 'creative' | 'harvard'
}

export function ModernTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  registerPDFFonts()
  
  // Get font family from design settings
  const fontFamily = getFontFamilyForPDF(data.designSettings?.fontFamily || 'Times New Roman')
  
  return (
    <Document>
      <Page size="A4" style={{...modernStyles.page, fontFamily}}>
        {/* Header */}
        <View style={modernStyles.header}>
          <Text style={modernStyles.name}>
            {data.personal.fullName}
          </Text>
          <View style={modernStyles.contact}>
            <Text>{formatIrishPhone(data.personal.phone)}</Text>
            <Text>{data.personal.email}</Text>
            <Text>{data.personal.address}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        {data.personal.summary && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Professional Summary</Text>
            <Text style={modernStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <Text style={modernStyles.jobTitle}>{exp.position}</Text>
                <Text style={modernStyles.company}>{exp.company}</Text>
                <Text style={modernStyles.dates}>
                  {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                </Text>
                <Text style={modernStyles.description}>{exp.description}</Text>
                {exp.achievements?.map((achievement, idx) => (
                  <Text key={idx} style={modernStyles.achievement}>• {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <Text style={modernStyles.jobTitle}>{edu.degree}</Text>
                <Text style={modernStyles.company}>{edu.institution}</Text>
                <Text style={modernStyles.dates}>
                  {formatIrishDate(edu.startDate)} - {formatIrishDate(edu.endDate)}
                  {edu.grade && ` • ${edu.grade}`}
                </Text>
                {edu.description && <Text style={modernStyles.description}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Skills</Text>
            <View style={modernStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={modernStyles.skillItem}>
                  {skill.name} {skill.level && `(${skill.level}/4)`}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

export function ClassicTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  registerPDFFonts()
  
  // Get font family from design settings
  const fontFamily = getFontFamilyForPDF(data.designSettings?.fontFamily || 'Times New Roman')
  
  return (
    <Document>
      <Page size="A4" style={{...classicStyles.page, fontFamily}}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>
            {data.personal.fullName}
          </Text>
          <View style={classicStyles.contact}>
            <Text>{formatIrishPhone(data.personal.phone)}</Text>
            <Text>{data.personal.email}</Text>
            <Text>{data.personal.address}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        {data.personal.summary && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={classicStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <Text style={classicStyles.jobTitle}>{exp.position}</Text>
                <Text style={classicStyles.company}>{exp.company}</Text>
                <Text style={classicStyles.dates}>
                  {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                </Text>
                <Text style={classicStyles.description}>{exp.description}</Text>
                {exp.achievements?.map((achievement, idx) => (
                  <Text key={idx} style={classicStyles.achievement}>• {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>EDUCATION</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <Text style={classicStyles.jobTitle}>{edu.degree}</Text>
                <Text style={classicStyles.company}>{edu.institution}</Text>
                <Text style={classicStyles.dates}>
                  {formatIrishDate(edu.startDate)} - {formatIrishDate(edu.endDate)}
                  {edu.grade && ` • ${edu.grade}`}
                </Text>
                {edu.description && <Text style={classicStyles.description}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SKILLS</Text>
            <View style={classicStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={classicStyles.skillItem}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

export function CreativeTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  registerPDFFonts()
  
  // Get font family from design settings
  const fontFamily = getFontFamilyForPDF(data.designSettings?.fontFamily || 'Times New Roman')
  
  return (
    <Document>
      <Page size="A4" style={{...creativeStyles.page, fontFamily}}>
        {/* Header */}
        <View style={creativeStyles.header}>
          <Text style={creativeStyles.name}>
            {data.personal.fullName}
          </Text>
          <View style={creativeStyles.contact}>
            <Text>{formatIrishPhone(data.personal.phone)}</Text>
            <Text>{data.personal.email}</Text>
            <Text>{data.personal.address}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        {data.personal.summary && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>About Me</Text>
            <Text style={creativeStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={creativeStyles.experienceItem}>
                <Text style={creativeStyles.jobTitle}>{exp.position}</Text>
                <Text style={creativeStyles.company}>{exp.company}</Text>
                <Text style={creativeStyles.dates}>
                  {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                </Text>
                <Text style={creativeStyles.description}>{exp.description}</Text>
                {exp.achievements?.map((achievement, idx) => (
                  <Text key={idx} style={creativeStyles.achievement}>★ {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={creativeStyles.experienceItem}>
                <Text style={creativeStyles.jobTitle}>{edu.degree}</Text>
                <Text style={creativeStyles.company}>{edu.institution}</Text>
                <Text style={creativeStyles.dates}>
                  {formatIrishDate(edu.startDate)} - {formatIrishDate(edu.endDate)}
                  {edu.grade && ` • ${edu.grade}`}
                </Text>
                {edu.description && <Text style={creativeStyles.description}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Skills & Expertise</Text>
            <View style={creativeStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={creativeStyles.skillItem}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

// Harvard Template - matching the main template exactly
export function HarvardTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  registerPDFFonts()
  
  const { personal, experience, education, skills, languages, projects, certifications, interests, sections, designSettings } = data
  
  // Default design settings matching Harvard template
  const defaultSettings = {
    margins: 0.5,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Times New Roman',
    fontSize: 10,
    lineHeight: 1.2
  }
  
  const settings = designSettings || defaultSettings
  
  // Convert spacing settings to points (PDF unit)
  const spacingMap = {
    tight: 12,
    normal: 20,
    relaxed: 28,
    spacious: 36
  }
  
  const headerSpacingMap = {
    compact: 30,
    normal: 40,
    generous: 50
  }
  
  const sectionSpacing = spacingMap[settings.sectionSpacing as keyof typeof spacingMap] || spacingMap.normal
  const headerSpacing = headerSpacingMap[settings.headerSpacing as keyof typeof headerSpacingMap] || headerSpacingMap.normal
  
  return (
    <Document>
      <Page size="A4" style={{
        fontFamily: getFontFamilyForPDF(settings.fontFamily),
        fontSize: settings.fontSize,
        lineHeight: 1.1, // Global lineHeight for PDF - balanced spacing
        padding: `${settings.margins * 72}pt`, // Convert inches to points
        backgroundColor: '#ffffff'
      }}>
        {/* Header - Center aligned like Harvard template */}
        <View style={{
          textAlign: 'center',
          marginBottom: headerSpacing
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 12
          }}>
            {personal.fullName || "Your Name"}
          </Text>
          
          <Text style={{
            fontSize: 16,
            fontWeight: 'normal',
            color: '#666666',
            marginBottom: 16
          }}>
            {personal.title || "Python Developer"}
          </Text>
          
          <View style={{
            fontSize: 9,
            textAlign: 'center',
            marginBottom: 8
          }}>
            <Text>
              {personal.phone && formatIrishPhone(personal.phone)}
              {personal.phone && personal.email && ' • '}
              {personal.email}
              {personal.email && personal.linkedin && ' • '}
              {personal.linkedin && personal.linkedin.replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}
              {personal.linkedin && personal.website && ' • '}
              {personal.website && personal.website.replace('https://', '')}
            </Text>
          </View>
          
          <Text style={{
            fontSize: 9,
            textAlign: 'center'
          }}>
            • {personal.address} • {personal.nationality || "STAMP2 | Master Student"}
          </Text>
        </View>

        {/* Professional Summary */}
        {personal.summary && isSectionVisible(sections, 'summary') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1pt solid #9ca3af',
              paddingBottom: 8,
              marginBottom: 16
            }}>Summary</Text>
            <Text style={{
              fontSize: settings.fontSize,
              lineHeight: 1.2,  // Normal satır aralığı
              letterSpacing: 0  // Kelimeler arası boşluk normal
            }}>{personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12
            }}>PROFESSIONAL EXPERIENCE</Text>
            {experience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 24 }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 4
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{exp.position}</Text>
                    <Text style={{ fontStyle: 'italic', fontSize: 10 }}>{exp.company}, {exp.location}</Text>
                  </View>
                  <Text style={{ fontSize: 9, textAlign: 'right' }}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                
                {exp.description && (
                  <Text style={{
                    marginBottom: 8,
                    fontSize: settings.fontSize,
                    lineHeight: 1.2
                  }}>{exp.description}</Text>
                )}
                
                {(exp.achievements || []).length > 0 && (
                  <View style={{ marginLeft: 16 }}>
                    {(exp.achievements || []).map((achievement, idx) => (
                      <Text key={idx} style={{
                        marginBottom: 3,
                        fontSize: settings.fontSize,
                        lineHeight: 1.2
                      }}>• {achievement}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12
            }}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{edu.degree} in {edu.field}</Text>
                    <Text style={{ fontStyle: 'italic', fontSize: 10 }}>{edu.institution}, {edu.location}</Text>
                    {edu.grade && <Text style={{ fontSize: 10 }}>Grade: {edu.grade}</Text>}
                  </View>
                  <Text style={{ fontSize: 9, textAlign: 'right' }}>
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={{
                    marginTop: 4,
                    fontSize: settings.fontSize,
                    lineHeight: 1.2
                  }}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12
            }}>SKILLS</Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category)
                if (categorySkills.length === 0) return null
                
                return (
                  <View key={category} style={{ width: '48%', marginBottom: 8 }}>
                    <Text style={{
                      fontWeight: 'bold',
                      fontSize: 10,
                      marginBottom: 4
                    }}>{category} Skills:</Text>
                    {categorySkills.map(skill => (
                      <View key={skill.id} style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 2
                      }}>
                        <Text style={{ fontSize: 9 }}>{skill.name}</Text>
                        <Text style={{ fontSize: 8, color: '#666666' }}>{skill.level}</Text>
                      </View>
                    ))}
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

// Main export component that selects the right template
export const PDFTemplate: React.FC<PDFTemplateProps> = ({ data }) => {
  // Always use Harvard template to match the preview
  return <HarvardTemplate data={data} />
}
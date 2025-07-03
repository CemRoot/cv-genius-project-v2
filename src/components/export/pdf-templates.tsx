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
        {data.personal.summary && isSectionVisible(data.sections, 'summary') && (
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
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills') && (
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

        {/* References */}
        {(() => {
          const isReferencesVisible = isSectionVisible(data.sections, 'references')
          const referencesDisplay = data.referencesDisplay || 'available-on-request'
          const hasReferences = data.references && data.references.length > 0
          
          const shouldShowReferencesSection = isReferencesVisible && (
            (referencesDisplay === 'detailed' && hasReferences) ||
            (referencesDisplay === 'available-on-request')
          )
          
          return shouldShowReferencesSection
        })() && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>References</Text>
            {data.referencesDisplay === 'detailed' && data.references && data.references.length > 0 ? (
              <View>
                {data.references.map((reference, index) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={modernStyles.jobTitle}>{reference.name}</Text>
                    <Text style={modernStyles.company}>{reference.position}</Text>
                    {reference.company && (
                      <Text style={modernStyles.company}>{reference.company}</Text>
                    )}
                    <Text style={modernStyles.dates}>{reference.email}{reference.phone ? ` • ${formatIrishPhone(reference.phone)}` : ''}</Text>
                    {reference.relationship && (
                      <Text style={{ fontSize: 9, color: '#888888', fontStyle: 'italic' }}>
                        ({reference.relationship})
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={modernStyles.description}>References available upon request</Text>
            )}
          </View>
        )}

        {/* Footer - Only show if references section is not visible or user hasn't explicitly set preference */}
        {(!isSectionVisible(data.sections, 'references') || !data.referencesDisplay) && (
          <View style={{
            textAlign: 'center',
            marginTop: 20,
            paddingTop: 10,
            borderTop: '1pt solid #cccccc'
          }}>
            <Text style={{
              fontSize: 8,
              color: '#666666'
            }}>References available upon request</Text>
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
        {data.personal.summary && isSectionVisible(data.sections, 'summary') && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={classicStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience') && (
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
        {data.education.length > 0 && isSectionVisible(data.sections, 'education') && (
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
        {data.personal.summary && isSectionVisible(data.sections, 'summary') && (
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
  // Force refresh - ultra-tight spacing v3 + ligature fix
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  if (!data) {
    console.error('HarvardTemplate: No data provided')
    throw new Error('CV data is required for PDF generation')
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
    sections = [],
    designSettings 
  } = data
  
  // Default design settings matching Harvard template
  const defaultSettings = {
    margins: 0.5,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Times New Roman',
    fontSize: 10,
    lineHeight: 1.0  // 1.2 -> 1.0 for tighter spacing
  }
  
  const settings = designSettings || defaultSettings
  
  // Convert spacing settings to points (PDF unit) - Ultra-tight spacing
  const spacingMap = {
    tight: 4,      // 8 -> 4 (half again)
    normal: 6,     // 12 -> 6 (half again)
    relaxed: 8,    // 16 -> 8 (half again)
    spacious: 10   // 20 -> 10 (half again)
  }
  
  const headerSpacingMap = {
    compact: 10,   // 20 -> 10 (half again)
    normal: 12,    // 25 -> 12 (much tighter)
    generous: 16   // 35 -> 16 (much tighter)
  }
  
  const sectionSpacing = spacingMap[settings.sectionSpacing as keyof typeof spacingMap] || spacingMap.normal
  const headerSpacing = headerSpacingMap[settings.headerSpacing as keyof typeof headerSpacingMap] || headerSpacingMap.normal
  
  return (
    <Document>
      <Page size="A4" style={{
        fontFamily: 'Helvetica', // Always use Helvetica for better text rendering
        fontSize: settings.fontSize,
        lineHeight: 1.0, // Global lineHeight for PDF - ultra-tight spacing
        padding: `${settings.margins * 72}pt`, // Convert inches to points
        backgroundColor: '#ffffff'
      }}>
        {/* Header - Center aligned like Harvard template */}
        <View style={{
          textAlign: 'center',
          marginBottom: headerSpacing
        }}>
          <Text style={{
            fontSize: 20,        // 22 -> 20 (even more compact)
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,    // 1.5 -> 1 (tighter)
            marginBottom: 2,     // 3 -> 2 (less space)
            lineHeight: 1.0      // Tighter line height
          }}>
            {personal.fullName || "Your Name"}
          </Text>
          
          <Text style={{
            fontSize: 12,        // 14 -> 12 (smaller)
            fontWeight: 'normal',
            color: '#666666',
            marginBottom: 2,     // 4 -> 2 (less space)
            lineHeight: 1.0      // Tighter line height
          }}>
            {personal.title || "Python Developer"}
          </Text>
          
          <View style={{
            fontSize: 8,         // Keep at 8
            textAlign: 'center',
            marginBottom: 2,     // A bit more space for better separation
            lineHeight: 1.2      // Slightly more readable
          }}>
            {/* First line: Phone, Email */}
            <Text style={{ marginBottom: 1 }}>
              {personal.phone && formatIrishPhone(personal.phone)}
              {personal.phone && personal.email && ' • '}
              {personal.email}
            </Text>
            
            {/* Second line: LinkedIn, Website */}
            {(personal.linkedin || personal.website) && (
              <Text style={{ marginBottom: 1 }}>
                {personal.linkedin && personal.linkedin.replace('https://www.linkedin.com/in/', 'https://www.linkedin.com/in/')}
                {personal.linkedin && personal.website && ' • '}
                {personal.website && personal.website.replace('https://', '')}
              </Text>
            )}
            
            {/* Third line: Address, Status */}
            <Text>
              {personal.address}
              {personal.address && (personal.nationality || "STAMP2 | Master Student") && ' • '}
              {personal.nationality || "STAMP2 | Master Student"}
            </Text>
          </View>
        </View>

        {/* Professional Summary */}
        {personal.summary && isSectionVisible(sections, 'summary') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,      // 12 -> 11 (smaller title)
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1pt solid #9ca3af',
              paddingBottom: 1,  // 2 -> 1 (less padding)
              marginBottom: 2    // 4 -> 2 (less margin)
            }}>Summary</Text>
            <Text style={{
              fontSize: settings.fontSize,
              lineHeight: 1.2,  // 1.0 -> 1.2 (more readable)
              textAlign: 'justify', // Better text flow
              fontFamily: 'Helvetica'
            }}>{personal.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && isSectionVisible(sections, 'experience') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,      // 12 -> 11 (smaller)
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 3    // 6 -> 3 (much less)
            }}>PROFESSIONAL EXPERIENCE</Text>
            {experience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 8 }}> {/* 24 -> 8 (huge reduction) */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 2  // 4 -> 2 (less space)
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{exp.position}</Text> {/* 11 -> 10 */}
                    <Text style={{ fontStyle: 'italic', fontSize: 9 }}>{exp.company}, {exp.location}</Text> {/* 10 -> 9 */}
                  </View>
                  <Text style={{ fontSize: 8, textAlign: 'right' }}> {/* 9 -> 8 */}
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                
                {exp.description && (
                  <Text style={{
                    marginBottom: 4,  // 8 -> 4 (less space)
                    fontSize: settings.fontSize,
                    lineHeight: 1.2,   // 1.0 -> 1.2 (more readable)
                    textAlign: 'justify',
                    fontFamily: 'Helvetica'
                  }}>{exp.description}</Text>
                )}
                
                {(exp.achievements || []).length > 0 && (
                  <View style={{ marginLeft: 12 }}> {/* 16 -> 12 (less indent) */}
                    {(exp.achievements || []).map((achievement, idx) => (
                      <Text key={idx} style={{
                        marginBottom: 1,  // 3 -> 1 (less space)
                        fontSize: settings.fontSize,
                        lineHeight: 1.2,   // 1.0 -> 1.2 (more readable)
                        fontFamily: 'Helvetica'
                      }}>• {achievement}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && isSectionVisible(sections, 'education') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,      // 12 -> 11 (smaller)
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 3    // 12 -> 3 (much less)
            }}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 6 }}> {/* 20 -> 6 (much less) */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{edu.degree} in {edu.field}</Text> {/* 11 -> 10 */}
                    <Text style={{ fontStyle: 'italic', fontSize: 9 }}>{edu.institution}, {edu.location}</Text> {/* 10 -> 9 */}
                    {edu.grade && <Text style={{ fontSize: 9 }}>Grade: {edu.grade}</Text>} {/* 10 -> 9 */}
                  </View>
                  <Text style={{ fontSize: 8, textAlign: 'right' }}> {/* 9 -> 8 */}
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={{
                    marginTop: 2,        // 4 -> 2 (less space)
                    fontSize: settings.fontSize,
                    lineHeight: 1.2,      // 1.0 -> 1.2 (more readable)
                    textAlign: 'justify',
                    fontFamily: 'Helvetica'
                  }}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills - Compact Irish CV Format */}
        {skills.length > 0 && isSectionVisible(sections, 'skills') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,      
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2    // Even less space
            }}>SKILLS</Text>
            <View style={{ lineHeight: 1.0 }}>
              {/* Get unique categories from actual skills data */}
              {Array.from(new Set(skills.map(skill => skill.category))).map((category) => {
                const categorySkills = skills.filter(skill => skill.category === category)
                if (categorySkills.length === 0) return null
                
                // Take only top 6 skills per category for compact display
                const topSkills = categorySkills.slice(0, 6)
                const skillNames = topSkills.map(skill => skill.name).join(' • ')
                
                return (
                  <View key={category} style={{ 
                    flexDirection: 'row',
                    marginBottom: 1,    // Minimal spacing between lines
                    flexWrap: 'wrap'
                  }}>
                    <Text style={{
                      fontSize: 9,
                      fontWeight: 'bold'
                    }}>{category}: </Text>
                    <Text style={{
                      fontSize: 9,
                      lineHeight: 1.0,
                      flex: 1
                    }}>{skillNames}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && isSectionVisible(sections, 'languages') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2
            }}>LANGUAGES</Text>
            <View style={{ lineHeight: 1.0 }}>
              {data.languages.map((language, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1
                }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{language.name}</Text>
                  <Text style={{ fontSize: 9 }}>{language.level}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && isSectionVisible(sections, 'projects') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2
            }}>PROJECTS</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={{ marginBottom: 6 }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1
                }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{project.name}</Text>
                  <Text style={{ fontSize: 8, textAlign: 'right' }}>
                    {project.startDate} - {project.current ? "Present" : project.endDate}
                  </Text>
                </View>
                {project.description && (
                  <Text style={{
                    fontSize: settings.fontSize,
                    lineHeight: 1.2,
                    textAlign: 'justify',
                    marginBottom: 2,
                    fontFamily: 'Helvetica'
                  }}>{project.description}</Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={{
                    fontSize: 9,
                    color: '#666666',
                    fontFamily: 'Helvetica'
                  }}>Technologies: {project.technologies.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && isSectionVisible(sections, 'certifications') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2
            }}>CERTIFICATIONS</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={{ marginBottom: 4 }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{cert.name}</Text>
                    <Text style={{ fontStyle: 'italic', fontSize: 9 }}>{cert.issuer}</Text>
                  </View>
                  <Text style={{ fontSize: 8, textAlign: 'right' }}>
                    {cert.issueDate}
                    {cert.expiryDate && ` - ${cert.expiryDate}`}
                  </Text>
                </View>
                {cert.description && (
                  <Text style={{
                    fontSize: settings.fontSize,
                    lineHeight: 1.2,
                    textAlign: 'justify',
                    fontFamily: 'Helvetica'
                  }}>{cert.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Interests */}
        {data.interests && data.interests.length > 0 && isSectionVisible(sections, 'interests') && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2
            }}>INTERESTS</Text>
            <View style={{ 
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 4
            }}>
                             {data.interests?.map((interest, index) => (
                 <Text key={index} style={{
                   fontSize: 9,
                   fontFamily: 'Helvetica'
                 }}>{interest.name}{index < (data.interests?.length || 0) - 1 ? ' • ' : ''}</Text>
               ))}
            </View>
          </View>
        )}

        {/* References */}
        {(() => {
          const isReferencesVisible = isSectionVisible(sections, 'references')
          const referencesDisplay = data.referencesDisplay || 'available-on-request'
          const hasReferences = data.references && data.references.length > 0
          
          // Show references section if it's visible AND either:
          // 1. User wants detailed view AND has references, OR 
          // 2. User wants available-on-request view
          const shouldShowReferencesSection = isReferencesVisible && (
            (referencesDisplay === 'detailed' && hasReferences) ||
            (referencesDisplay === 'available-on-request')
          )
          
          return shouldShowReferencesSection
        })() && (
          <View style={{ marginBottom: sectionSpacing }}>
            <Text style={{
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 2
            }}>REFERENCES</Text>
            {data.referencesDisplay === 'detailed' && data.references && data.references.length > 0 ? (
              <View>
                {data.references.map((reference, index) => (
                  <View key={index} style={{ marginBottom: 4 }}>
                    <View style={{ marginBottom: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{reference.name}</Text>
                      <Text style={{ fontSize: 9, color: '#666666' }}>{reference.position}</Text>
                      {reference.company && (
                        <Text style={{ fontSize: 9, color: '#666666' }}>{reference.company}</Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={{ fontSize: 8, color: '#666666' }}>{reference.email}</Text>
                      {reference.phone && (
                        <Text style={{ fontSize: 8, color: '#666666' }}>{formatIrishPhone(reference.phone)}</Text>
                      )}
                    </View>
                    {reference.relationship && (
                      <Text style={{ fontSize: 8, color: '#888888', fontStyle: 'italic' }}>
                        ({reference.relationship})
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{
                fontSize: 10,
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#666666',
                fontFamily: 'Helvetica'
              }}>References available upon request</Text>
            )}
          </View>
        )}

        {/* Footer - Only show if references section is not visible or user hasn't explicitly set preference */}
        {(!isSectionVisible(sections, 'references') || !data.referencesDisplay) && (
          <View style={{
            textAlign: 'center',
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1pt solid #cccccc'
          }}>
            <Text style={{
              fontSize: 8,
              color: '#666666',
              fontFamily: 'Helvetica'
            }}>References available upon request</Text>
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
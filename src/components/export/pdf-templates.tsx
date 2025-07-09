import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CVData } from '@/types/cv'
import { registerPDFFonts, getFontFamilyForPDF } from '@/lib/pdf-fonts'

// Using web-safe fonts to avoid CORS issues
// No font registration needed for Helvetica, Times-Roman

// Common styles matched with live preview (IrishCVTemplateManager)
const commonStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Closest to Arial in PDF
    fontSize: 10,  // Küçült: 11pt -> 10pt (tek sayfaya sığsın)
    lineHeight: 1.2,  // Azalt: 1.3 -> 1.2 (daha sıkışık)
    // Use 15mm margins to match live preview padding
    paddingTop: 40,  // Azalt: 42.5 -> 40
    paddingBottom: 40,  // Azalt: 42.5 -> 40
    paddingLeft: 40,  // Azalt: 42.5 -> 40
    paddingRight: 40,  // Azalt: 42.5 -> 40
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 16,  // Match live preview spacing
    borderBottom: '2px solid #000000',  // Match live preview border
    paddingBottom: 8
  },
  name: {
    fontSize: 16,  // Küçült: 18pt -> 16pt
    fontWeight: 600,  // Azalt: 700 -> 600
    color: '#000000',
    marginBottom: 6  // Azalt: 4 -> 6
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,  // Küçült: 11pt -> 9pt
    color: '#000000',
    marginTop: 6  // Azalt: 8 -> 6
  },
  section: {
    marginBottom: 16  // Match live preview section spacing (1rem = 16pt)
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 6,
    borderBottom: '1px solid #000000',
    paddingBottom: 3,
    textTransform: 'uppercase',
    backgroundColor: 'transparent',  // Arka plan kaldır
    padding: 0,  // Padding kaldır
    textAlign: 'left'  // Sol hizala
  },
  experienceItem: {
    marginBottom: 12  // Better spacing for readability
  },
  jobTitle: {
    fontSize: 11,  // Match live preview base size
    fontWeight: 600,  // Match live preview font-weight
    color: '#000000'  // Black like live preview
  },
  company: {
    fontSize: 11,  // Match live preview
    color: '#000000',  // Black for ATS like live preview
    marginBottom: 4
  },
  dates: {
    fontSize: 11,  // Match live preview
    color: '#000000',  // Black for ATS like live preview
    marginBottom: 4
  },
  description: {
    fontSize: 11,  // Match live preview
    lineHeight: 1.3,  // Match live preview line-height
    color: '#000000'  // Black like live preview
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8  // Better spacing
  },
  skillItem: {
    backgroundColor: '#e5e7eb',  // Match live preview skill bar background
    padding: '4 8',  // Better padding
    borderRadius: 2,
    fontSize: 11,  // Match live preview
    color: '#000000'  // Black like live preview
  },
  achievement: {
    marginBottom: 4,
    paddingLeft: 12,
    fontSize: 11,  // Match live preview
    color: '#000000'  // Black like live preview
  }
})

// Modern template styles - matching Dublin Tech live preview
const modernStyles = StyleSheet.create({
  ...commonStyles,
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff',  // White background like live preview
    flexDirection: 'row'  // Two-column layout like live preview
  },
  // Sidebar (left column) - matching live preview sidebar
  sidebar: {
    width: '35%',
    backgroundColor: '#f8f9fa',  // Light gray like live preview
    padding: 16,  // 2rem = 16pt
    borderRight: '2px solid #000000'  // Black border like live preview
  },
  // Main content (right column)
  mainContent: {
    width: '65%',
    padding: 16  // 2rem = 16pt
  },
  header: {
    ...commonStyles.header,
    backgroundColor: 'transparent',  // No background in sidebar
    borderBottom: 'none',  // No border in sidebar
    marginBottom: 16,
    padding: 0,
    margin: 0
  },
  name: {
    ...commonStyles.name,
    color: '#000000',  // Black like live preview
    fontSize: 18,  // Match live preview 18pt
    fontWeight: 700
  },
  contact: {
    ...commonStyles.contact,
    color: '#000000',  // Black like live preview
    fontSize: 11,  // Match live preview 11pt
    fontWeight: 500,
    flexDirection: 'column',  // Stack vertically in sidebar
    justifyContent: 'flex-start',
    gap: 4
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#000000',  // Black like live preview
    borderBottom: '2px solid #000000'  // Black border like live preview
  },
  // Sidebar specific styles
  sidebarSection: {
    marginBottom: 16  // 1rem = 16pt
  },
  sidebarSectionTitle: {
    fontSize: 11,  // Küçült: 14 -> 11
    fontWeight: 600,  // Azalt: bold -> 600
    color: '#000000',
    marginBottom: 6,  // Azalt: 8 -> 6
    borderBottom: '1px solid #000000',  // İncelten: 2px -> 1px
    paddingBottom: 3,  // Azalt: 4 -> 3
    textTransform: 'uppercase'
  }
})

// Classic template styles - matching Irish Finance live preview
const classicStyles = StyleSheet.create({
  ...commonStyles,
  page: {
    ...commonStyles.page,
    fontFamily: 'Times-Roman', // Closest to Georgia serif in PDF
    lineHeight: 1.6,  // Match Irish Finance line height
    backgroundColor: '#ffffff'
  },
  header: {
    ...commonStyles.header,
    textAlign: 'center',
    borderBottom: '1px solid #000000',  // Siyah border, ince: 2px -> 1px
    marginBottom: 12  // Azalt: 20 -> 12
  },
  name: {
    ...commonStyles.name,
    fontSize: 18,  // Match live preview 18pt
    textAlign: 'center',
    color: '#166534',  // Irish Finance green color
    fontWeight: 700
  },
  contact: {
    ...commonStyles.contact,
    justifyContent: 'center',
    gap: 6,  // Azalt: 8 -> 6
    fontSize: 9,  // Küçült: 11 -> 9
    color: '#000000'  // Siyah yap: #111827 -> #000000
  },
  section: {
    ...commonStyles.section,
    marginBottom: 12  // Azalt: 20 -> 12 (tek sayfaya sığsın)
  },
  sectionTitle: {
    fontSize: 14,  // Match live preview
    fontWeight: 'bold',
    color: '#000000',  // SİYAH: live preview ile aynı (#166534 -> #000000)
    marginBottom: 12,  // Match live preview spacing
    textAlign: 'left',  // Left align like live preview
    backgroundColor: 'transparent',  // ARKA PLAN KALDIR: live preview ile aynı
    padding: 0,  // PADDING KALDIR: live preview ile aynı
    borderLeft: 'none',  // SOL BORDER KALDIR: live preview ile aynı
    borderBottom: '2px solid #000000',  // KALIN ÇİZGİ: live preview ile aynı
    paddingBottom: 2,  // LIVE PREVIEW İLE AYNI: 2px
    textTransform: 'uppercase'
  },
  experienceItem: {
    ...commonStyles.experienceItem,
    marginBottom: 8  // Azalt: 12 -> 8
  },
  jobTitle: {
    ...commonStyles.jobTitle,
    color: '#000000',  // Siyah yap: #166534 -> #000000
    fontWeight: 500,  // Azalt: 600 -> 500
    fontSize: 10  // Küçült
  },
  company: {
    ...commonStyles.company,
    color: '#111827'  // Irish Finance text color
  },
  dates: {
    ...commonStyles.dates,
    color: '#111827'  // Irish Finance text color
  },
  description: {
    ...commonStyles.description,
    color: '#111827',  // Irish Finance text color
    lineHeight: 1.6  // Match Irish Finance line height
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
    padding: 10,  // Reduced from 25
    margin: -42.5,
    marginBottom: 8,  // Reduced from 25
    borderBottom: 'none',
    transform: 'skewY(-1deg)',  // Reduced from -2deg
    marginTop: -42.5
  },
  name: {
    ...commonStyles.name,
    color: 'white',
    fontSize: 20,  // Reduced from 26
    transform: 'skewY(1deg)'  // Reduced from 2deg
  },
  contact: {
    ...commonStyles.contact,
    color: '#d1fae5',
    transform: 'skewY(1deg)'  // Reduced from 2deg
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#10b981',
    borderBottom: '1px solid #10b981',  // Reduced from 2px
    borderLeft: '2px solid #10b981',  // Reduced from 4px
    paddingLeft: 4  // Reduced from 8
  }
})

// Format Irish date
const formatIrishDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return dateString || ''
  }
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
  const fontFamily = getFontFamilyForPDF(data.designSettings?.fontFamily || 'Helvetica')
  
  return (
    <Document>
      <Page size="A4" style={{...modernStyles.page, fontFamily}}>
        
        {/* SIDEBAR - Left Column (35%) - matching Dublin Tech live preview */}
        <View style={modernStyles.sidebar}>
          
          {/* Header - Name & Title */}
          <View style={modernStyles.header}>
            <Text style={modernStyles.name}>
              {data.personal.fullName}
            </Text>
            {data.personal.title && (
              <Text style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#000000',
                marginBottom: 16
              }}>
                {data.personal.title}
              </Text>
            )}
          </View>

          {/* Contact Information */}
          <View style={modernStyles.sidebarSection}>
            <Text style={modernStyles.sidebarSectionTitle}>CONTACT</Text>
            <View style={modernStyles.contact}>
              {data.personal.phone && <Text>{formatIrishPhone(data.personal.phone)}</Text>}
              {data.personal.email && <Text>{data.personal.email}</Text>}
              {data.personal.address && <Text>{data.personal.address}</Text>}
              {data.personal.linkedin && <Text>{data.personal.linkedin}</Text>}
            </View>
          </View>

          {/* Skills - with progress bars like live preview */}
          {data.skills.length > 0 && isSectionVisible(data.sections, 'skills') && (
            <View style={modernStyles.sidebarSection}>
              <Text style={modernStyles.sidebarSectionTitle}>SKILLS</Text>
              {data.skills.map((skill, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={{
                    fontSize: 10,  // Küçült: 11 -> 10
                    color: '#000000',
                    fontWeight: 500,  // Azalt: 600 -> 500
                    marginBottom: 3
                  }}>
                    {skill.name}
                  </Text>
                  {/* Skill level bar representation */}
                  {skill.level && (
                    <View style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: '#e5e7eb',
                      borderRadius: 2,
                      border: '1px solid #000000'
                    }}>
                      <View style={{
                        width: `${(Number(skill.level) / 4) * 100}%`,
                        height: '100%',
                        backgroundColor: '#000000',
                        borderRadius: 2
                      }} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages') && (
            <View style={modernStyles.sidebarSection}>
              <Text style={modernStyles.sidebarSectionTitle}>LANGUAGES</Text>
              {data.languages.map((language, index) => (
                <View key={index} style={{ marginBottom: 4 }}>
                  <Text style={{
                    fontSize: 11,
                    color: '#000000',
                    fontWeight: 500
                  }}>
                    {language.name} {language.level && `(${language.level})`}
                  </Text>
                </View>
              ))}
            </View>
          )}

        </View>

        {/* MAIN CONTENT - Right Column (65%) */}
        <View style={modernStyles.mainContent}>

          {/* Professional Summary */}
          {data.personal.summary && isSectionVisible(data.sections, 'summary') && (
            <View style={modernStyles.section}>
              <Text style={modernStyles.sectionTitle}>SUMMARY</Text>
              <Text style={modernStyles.description}>{data.personal.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View style={modernStyles.section}>
              <Text style={modernStyles.sectionTitle}>EXPERIENCE</Text>
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
              <Text style={modernStyles.sectionTitle}>EDUCATION</Text>
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

          {/* Projects */}
          {data.projects && data.projects.length > 0 && isSectionVisible(data.sections, 'projects') && (
            <View style={modernStyles.section}>
              <Text style={modernStyles.sectionTitle}>PROJECTS</Text>
              {data.projects.map((project, index) => (
                <View key={index} style={modernStyles.experienceItem}>
                  <Text style={modernStyles.jobTitle}>{project.name}</Text>
                  {project.url && <Text style={modernStyles.company}>{project.url}</Text>}
                  <Text style={modernStyles.dates}>
                    {project.startDate ? formatIrishDate(project.startDate) : ''} - {project.endDate ? formatIrishDate(project.endDate) : 'Present'}
                  </Text>
                  <Text style={modernStyles.description}>{project.description}</Text>
                                     {project.technologies && project.technologies.length > 0 && (
                     <Text style={{
                       fontSize: 10,
                       color: '#666666',
                       marginTop: 4
                     }}>
                       Technologies: {project.technologies.join(', ')}
                     </Text>
                   )}
                </View>
              ))}
            </View>
          )}

        </View>
      </Page>
    </Document>
  )
}

export function ClassicTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  registerPDFFonts()
  
  // Get font family from design settings - Irish Finance uses serif fonts
  const fontFamily = getFontFamilyForPDF(data.designSettings?.fontFamily || 'Times-Roman')
  
  return (
    <Document>
      <Page size="A4" style={{...classicStyles.page, fontFamily}}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>
            {data.personal.fullName}
          </Text>
          {data.personal.title && (
            <Text style={{
              fontSize: 12,  // Küçült: 14 -> 12
              fontWeight: 500,  // Azalt: 600 -> 500
              color: '#000000',  // Siyah yap: #166534 -> #000000
              textAlign: 'center',
              marginTop: 3  // Azalt: 4 -> 3
            }}>
              {data.personal.title}
            </Text>
          )}
          <View style={classicStyles.contact}>
            {data.personal.phone && <Text>{formatIrishPhone(data.personal.phone)}</Text>}
            {data.personal.email && <Text>{data.personal.email}</Text>}
            {data.personal.address && <Text>{data.personal.address}</Text>}
            {data.personal.linkedin && <Text>{data.personal.linkedin}</Text>}
          </View>
        </View>

        {/* Professional Profile/Summary */}
        {data.personal.summary && isSectionVisible(data.sections, 'summary') && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL PROFILE</Text>
            <Text style={classicStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Professional Experience */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience') && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <Text style={classicStyles.jobTitle}>{exp.position}</Text>
                <Text style={classicStyles.company}>{exp.company}</Text>
                <Text style={classicStyles.dates}>
                  {exp.startDate ? formatIrishDate(exp.startDate) : ''} - {exp.current ? 'Present' : (exp.endDate ? formatIrishDate(exp.endDate) : '')}
                </Text>
                <Text style={classicStyles.description}>{exp.description}</Text>
                {exp.achievements?.map((achievement, idx) => (
                  <Text key={idx} style={{
                    ...classicStyles.achievement,
                    color: '#111827'
                  }}>• {achievement}</Text>
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
                  {edu.startDate ? formatIrishDate(edu.startDate) : ''} - {edu.endDate ? formatIrishDate(edu.endDate) : ''}
                  {edu.grade && ` • ${edu.grade}`}
                </Text>
                {edu.description && <Text style={classicStyles.description}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Qualifications/Certifications */}
        {data.certifications && data.certifications.length > 0 && isSectionVisible(data.sections, 'certifications') && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>QUALIFICATIONS</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <Text style={classicStyles.jobTitle}>{cert.name}</Text>
                <Text style={classicStyles.company}>{cert.issuer}</Text>
                <Text style={classicStyles.dates}>
                  {cert.issueDate ? formatIrishDate(cert.issueDate) : ''}
                  {cert.expiryDate && ` • Expires: ${formatIrishDate(cert.expiryDate)}`}
                </Text>
                {cert.description && <Text style={classicStyles.description}>{cert.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills') && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SKILLS</Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={{
                  backgroundColor: '#f5f5f5',  // Gri yap: #f0fdf4 -> #f5f5f5
                  padding: '3 6',  // Küçült: 4 8 -> 3 6
                  borderRadius: 2,
                  fontSize: 10,  // Küçült: 11 -> 10
                  color: '#000000',  // Siyah yap: #166534 -> #000000
                  fontWeight: 500,  // Azalt: 600 -> 500
                  border: '1px solid #cccccc'  // Gri border: #166534 -> #cccccc
                }}>
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
    tight: 2,      // Approximately 0.7mm
    normal: 3,     // Approximately 1mm
    relaxed: 4,    // Approximately 1.4mm
    spacious: 5    // Approximately 1.7mm
  }
  
  const headerSpacingMap = {
    compact: 4,    // Approximately 1.4mm
    normal: 6,     // Approximately 2mm
    generous: 8    // Approximately 2.8mm
  }
  
  const sectionSpacing = spacingMap[settings.sectionSpacing as keyof typeof spacingMap] || spacingMap.normal
  const headerSpacing = headerSpacingMap[settings.headerSpacing as keyof typeof headerSpacingMap] || headerSpacingMap.normal
  
  return (
    <Document>
      <Page size="A4" style={{
        fontFamily: 'Helvetica', // Always use Helvetica for better text rendering
        fontSize: settings.fontSize,
        lineHeight: 1.0, // Global lineHeight for PDF - ultra-tight spacing
        // Use consistent 15mm (42.5pt) margins instead of variable margins
        paddingTop: 42.5,
        paddingBottom: 42.5,
        paddingLeft: 42.5,
        paddingRight: 42.5,
        backgroundColor: '#ffffff'
      }}>
        {/* Header - Left aligned professional format */}
        <View style={{
          textAlign: 'left',
          marginBottom: headerSpacing,
          borderBottom: '2px solid #000000',
          paddingBottom: 8
        }}>
          <Text style={{
            fontSize: 20,        // 22 -> 20 (even more compact)
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,    // 1.5 -> 1 (tighter)
            marginBottom: 2,     // 3 -> 2 (less space)
            lineHeight: 1.0,      // Tighter line height
            textAlign: 'left'
          }}>
            {personal.fullName || "Your Name"}
          </Text>
          
          <Text style={{
            fontSize: 12,        // 14 -> 12 (smaller)
            fontWeight: 'normal',
            color: '#666666',
            marginBottom: 2,     // 4 -> 2 (less space)
            lineHeight: 1.0,      // Tighter line height
            textAlign: 'left'
          }}>
            {personal.title || "Python Developer"}
          </Text>
          
          <View style={{
            fontSize: 8,         // Keep at 8
            textAlign: 'left',
            marginBottom: 2,     // A bit more space for better separation
            lineHeight: 1.2      // Slightly more readable
          }}>
            {/* First line: Phone, Email */}
            <Text style={{ marginBottom: 1, textAlign: 'left' }}>
              {personal.phone && formatIrishPhone(personal.phone)}
              {personal.phone && personal.email && ' • '}
              {personal.email}
            </Text>
            
            {/* Second line: LinkedIn, Website */}
            {(personal.linkedin || personal.website) && (
              <Text style={{ marginBottom: 1, textAlign: 'left' }}>
                {personal.linkedin && personal.linkedin.replace('https://www.linkedin.com/in/', 'https://www.linkedin.com/in/')}
                {personal.linkedin && personal.website && ' • '}
                {personal.website && personal.website.replace('https://', '')}
              </Text>
            )}
            
            {/* Third line: Address, Status */}
            <Text style={{ textAlign: 'left' }}>
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
              textAlign: 'left',
              borderBottom: '1pt solid #333333',
              paddingBottom: 1,  // 2 -> 1 (less padding)
              marginBottom: 2,    // 4 -> 2 (less margin)
              textTransform: 'uppercase'
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
              fontSize: 10,      // Reduced from 11
              fontWeight: 500,   // Reduced from 'bold' (ATS friendly)
              textAlign: 'left',
              marginBottom: 2,    // Reduced from 3
              textTransform: 'uppercase',
              borderBottom: '0.5px solid #333333',  // Thinner border
              paddingBottom: 1  // Reduced from 2
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
              fontSize: 10,      // Reduced from 11
              fontWeight: 500,   // Reduced from 'bold' (ATS friendly)
              textAlign: 'left',
              marginBottom: 2,    // Reduced from 3
              textTransform: 'uppercase',
              borderBottom: '0.5px solid #333333',  // Thinner border
              paddingBottom: 1  // Reduced from 2
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
              textAlign: 'left',
              marginBottom: 2,    // Even less space
              textTransform: 'uppercase',
              borderBottom: '1px solid #333333',
              paddingBottom: 2
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
              textAlign: 'left',
              marginBottom: 2,
              textTransform: 'uppercase',
              borderBottom: '1px solid #333333',
              paddingBottom: 2
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
              textAlign: 'left',
              marginBottom: 2,
              textTransform: 'uppercase',
              borderBottom: '1px solid #333333',
              paddingBottom: 2
            }}>PROJECTS</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={{ marginBottom: 4 }}>  {/* Reduced from 6 to 4 (~1mm) */}
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
              fontSize: 10,  // Reduced from 11
              fontWeight: 500,  // Reduced from 'bold' (ATS friendly)
              textAlign: 'left',
              marginBottom: 1,  // Reduced from 2
              textTransform: 'uppercase',
              borderBottom: '0.5px solid #333333',  // Thinner border
              paddingBottom: 1  // Reduced from 2
            }}>CERTIFICATIONS</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={{ marginBottom: 3 }}>  {/* Reduced from 4 to 3 (~1mm) */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 1
                }}>
                  <View>
                    <Text style={{ fontWeight: 500, fontSize: 10 }}>{cert.name}</Text>
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
              fontSize: 10,  // Reduced from 11
              fontWeight: 500,  // Reduced from 'bold' (ATS friendly)
              textAlign: 'left',
              marginBottom: 1,  // Reduced from 2
              textTransform: 'uppercase',
              borderBottom: '0.5px solid #333333',  // Thinner border
              paddingBottom: 1  // Reduced from 2
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
              fontSize: 10,  // Reduced from 11
              fontWeight: 500,  // Reduced from 'bold' (ATS friendly)
              textAlign: 'left',
              marginBottom: 1,  // Reduced from 2
              textTransform: 'uppercase',
              borderBottom: '0.5px solid #333333',  // Thinner border
              paddingBottom: 1  // Reduced from 2
            }}>REFERENCES</Text>
            {data.referencesDisplay === 'detailed' && data.references && data.references.length > 0 ? (
              <View>
                {data.references.map((reference, index) => (
                  <View key={index} style={{ marginBottom: 3 }}>  {/* Reduced from 4 to 3 (~1mm) */}
                    <View style={{ marginBottom: 1 }}>
                      <Text style={{ fontWeight: 500, fontSize: 10 }}>{reference.name}</Text>
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
                textAlign: 'left',
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
            textAlign: 'left',
            marginTop: 4,  // Reduced from 8
            paddingTop: 3,  // Reduced from 6
            borderTop: '0.5pt solid #cccccc'  // Thinner border
          }}>
            <Text style={{
              fontSize: 8,
              color: '#666666',
              fontFamily: 'Helvetica',
              textAlign: 'left'
            }}>References available upon request</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

// --- Thin wrappers for additional builder templates until dedicated designs are ready ---
export const DublinTechTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  /* For now, reuse the Modern template styling */
  <ModernTemplate data={data} />
)

export const IrishFinanceTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  /* Finance template uses ClassicTemplate with Irish Finance styling */
  <ClassicTemplate data={data} />
)

export const DublinPharmaTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  /* Reuse Modern template but can later get pharma-specific accents */
  <ModernTemplate data={data} />
)

// Update templateIdMap to map to new string keys (component switch below)
const templateIdMap: Record<string, string> = {
  // Core templates with dedicated PDF designs
  'classic': 'classic',
  'dublin-creative': 'creative',
  // IDs that visually resemble the Modern template
  'dublin-tech': 'dublin-tech',
  'dublin-startup': 'modern',
  'dublin-hospitality': 'modern',
  'dublin-retail': 'modern',
  'dublin-pharma': 'dublin-pharma',
  'irish-construction': 'modern',
  // IDs that are closer to the Harvard (academic/professional) layout
  'irish-finance': 'irish-finance',
  'irish-graduate': 'harvard',
  'irish-education': 'harvard',
  // Fallback for the remaining templates
  'irish-healthcare': 'classic',
  'irish-executive': 'classic'
}

export const PDFTemplate: React.FC<{ data: CVData; template?: string }> = ({ data, template }) => {
  // Use provided template parameter or fallback to data.template
  const templateToUse = template || data.template || 'classic'
  const resolved = templateIdMap[templateToUse] || 'harvard'
  
  console.log('🎯 PDFTemplate rendering:', { templateToUse, resolved })

  switch (resolved) {
    case 'classic':
      return <ClassicTemplate data={data} />
    case 'modern':
      return <ModernTemplate data={data} />
    case 'creative':
      return <CreativeTemplate data={data} />
    case 'dublin-tech':
      return <DublinTechTemplate data={data} />
    case 'dublin-pharma':
      return <DublinPharmaTemplate data={data} />
    case 'irish-finance':
      return <IrishFinanceTemplate data={data} />
    case 'harvard':
    default:
      return <HarvardTemplate data={data} />
  }
}
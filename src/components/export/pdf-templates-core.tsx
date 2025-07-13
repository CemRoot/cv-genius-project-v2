import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CVData } from '@/types/cv'
import { registerPDFFonts, getFontFamilyForPDF } from '@/lib/pdf-fonts'

// Using web-safe fonts to avoid CORS issues
// No font registration needed for Helvetica, Times-Roman

// Common styles matched with live preview - improved consistency
const commonStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Closest to Arial in PDF
    fontSize: 11,  // Increased: 10pt -> 11pt to match live preview better
    lineHeight: 1.3,  // Increased: 1.2 -> 1.3 to match live preview
    // Slightly larger margins to match live preview padding
    paddingTop: 48,  // Increased: 40 -> 48
    paddingBottom: 48,  // Increased: 40 -> 48  
    paddingLeft: 48,  // Increased: 40 -> 48
    paddingRight: 48,  // Increased: 40 -> 48
    backgroundColor: '#ffffff'
  },
  // ... other common styles
})

// Modern template styles
const modernStyles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 18,  // Increased: 16 -> 18
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 14  // Increased: 12 -> 14
  },
  name: {
    fontSize: 22,  // Increased: 20 -> 22
    fontWeight: 'bold',
    marginBottom: 6,  // Increased: 4 -> 6
    color: '#2c3e50'
  },
  title: {
    fontSize: 13,  // Increased: 12 -> 13
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#34495e'
  },
  contact: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#7f8c8d',
    marginBottom: 4
  },
  section: {
    marginBottom: 18,  // Increased: 16 -> 18
    paddingBottom: 14  // Increased: 12 -> 14
  },
  sectionTitle: {
    fontSize: 14,  // Increased: 12 -> 14
    fontWeight: 'bold',
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#2c3e50',
    textTransform: 'uppercase'
  },
  experienceItem: {
    marginBottom: 12,  // Increased: 10 -> 12
    paddingBottom: 12,  // Increased: 10 -> 12
    borderBottomWidth: 0.5,
    borderBottomColor: '#ecf0f1'
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'flex-start'
  },
  jobTitle: {
    fontSize: 12,  // Increased: 11 -> 12
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  jobMeta: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#7f8c8d',
    textAlign: 'right',
    maxWidth: '40%'
  },
  description: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    lineHeight: 1.4,  // Increased: 1.3 -> 1.4
    marginTop: 4
  },
  skillsContainer: {
    marginBottom: 6,  // Increased: 4 -> 6
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skill: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    marginRight: 12,  // Increased: 8 -> 12
    marginBottom: 4
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'center'
  },
  languageName: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    flex: 1
  },
  languageLevel: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#7f8c8d',
    fontWeight: 'bold'
  }
})

// Classic template styles  
const classicStyles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 18,  // Increased: 16 -> 18
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 14  // Increased: 12 -> 14
  },
  name: {
    fontSize: 20,  // Increased: 18 -> 20
    fontWeight: 'bold',
    marginBottom: 6,  // Increased: 4 -> 6
    color: '#000000',
    letterSpacing: 1
  },
  title: {
    fontSize: 13,  // Increased: 12 -> 13
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#333333',
    fontWeight: 'bold'
  },
  contact: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    marginBottom: 4
  },
  section: {
    marginBottom: 18,  // Increased: 16 -> 18
    paddingBottom: 14  // Increased: 12 -> 14
  },
  sectionTitle: {
    fontSize: 14,  // Increased: 12 -> 14
    fontWeight: 'bold',
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  experienceItem: {
    marginBottom: 12,  // Increased: 10 -> 12
    paddingBottom: 12  // Increased: 10 -> 12
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'flex-start'
  },
  jobTitle: {
    fontSize: 12,  // Increased: 11 -> 12
    fontWeight: 'bold',
    color: '#000000',
    flex: 1
  },
  jobMeta: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    textAlign: 'right',
    maxWidth: '40%'
  },
  description: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    lineHeight: 1.4,  // Increased: 1.3 -> 1.4
    marginTop: 4
  },
  skillsContainer: {
    marginBottom: 6,  // Increased: 4 -> 6
  },
  skillCategory: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    marginBottom: 4,
    lineHeight: 1.4
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'center'
  },
  languageName: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    flex: 1
  },
  languageLevel: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    fontWeight: 'bold'
  }
})

// Creative template styles
const creativeStyles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 18,  // Increased: 16 -> 18
    backgroundColor: '#3498db',
    color: '#ffffff',
    padding: 16,  // Increased: 14 -> 16
    textAlign: 'center'
  },
  name: {
    fontSize: 22,  // Increased: 20 -> 22
    fontWeight: 'bold',
    marginBottom: 6,  // Increased: 4 -> 6
    color: '#ffffff'
  },
  title: {
    fontSize: 13,  // Increased: 12 -> 13
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#ffffff'
  },
  contact: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#ffffff',
    marginBottom: 4
  },
  section: {
    marginBottom: 18,  // Increased: 16 -> 18
    paddingBottom: 14  // Increased: 12 -> 14
  },
  sectionTitle: {
    fontSize: 14,  // Increased: 12 -> 14
    fontWeight: 'bold',
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#3498db',
    textTransform: 'uppercase'
  },
  experienceItem: {
    marginBottom: 12,  // Increased: 10 -> 12
    paddingBottom: 12,  // Increased: 10 -> 12
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'flex-start'
  },
  jobTitle: {
    fontSize: 12,  // Increased: 11 -> 12
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  jobMeta: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#7f8c8d',
    textAlign: 'right',
    maxWidth: '40%'
  },
  description: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    lineHeight: 1.4,  // Increased: 1.3 -> 1.4
    marginTop: 4
  },
  skillsContainer: {
    marginBottom: 6,  // Increased: 4 -> 6
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skill: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    marginRight: 12,  // Increased: 8 -> 12
    marginBottom: 4
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'center'
  },
  languageName: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#34495e',
    flex: 1
  },
  languageLevel: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#7f8c8d',
    fontWeight: 'bold'
  }
})

// Harvard template styles
const harvardStyles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 18,  // Increased: 16 -> 18
    textAlign: 'left',
    borderBottomWidth: 2,
    borderBottomColor: '#8b0000',
    paddingBottom: 14  // Increased: 12 -> 14
  },
  name: {
    fontSize: 20,  // Increased: 18 -> 20
    fontWeight: 'bold',
    marginBottom: 6,  // Increased: 4 -> 6
    color: '#8b0000'
  },
  title: {
    fontSize: 13,  // Increased: 12 -> 13
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#333333'
  },
  contact: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    marginBottom: 4
  },
  section: {
    marginBottom: 18,  // Increased: 16 -> 18
    paddingBottom: 14  // Increased: 12 -> 14
  },
  sectionTitle: {
    fontSize: 14,  // Increased: 12 -> 14
    fontWeight: 'bold',
    marginBottom: 10,  // Increased: 8 -> 10
    color: '#8b0000',
    textTransform: 'uppercase'
  },
  experienceItem: {
    marginBottom: 12,  // Increased: 10 -> 12
    paddingBottom: 12  // Increased: 10 -> 12
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'flex-start'
  },
  jobTitle: {
    fontSize: 12,  // Increased: 11 -> 12
    fontWeight: 'bold',
    color: '#000000',
    flex: 1
  },
  jobMeta: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    textAlign: 'right',
    maxWidth: '40%'
  },
  description: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    lineHeight: 1.4,  // Increased: 1.3 -> 1.4
    marginTop: 4
  },
  skillsContainer: {
    marginBottom: 6,  // Increased: 4 -> 6
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skill: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    marginRight: 12,  // Increased: 8 -> 12
    marginBottom: 4
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,  // Increased: 4 -> 6
    alignItems: 'center'
  },
  languageName: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    flex: 1
  },
  languageLevel: {
    fontSize: 10,  // Increased: 9 -> 10
    color: '#333333',
    fontWeight: 'bold'
  }
})

// Format Irish date
const formatIrishDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IE', { 
    year: 'numeric', 
    month: '2-digit' 
  })
}

// Helper function to check if a section is visible
const isSectionVisible = (sections: any[], sectionType: string, sectionVisibility?: Record<string, boolean>) => {
  console.log(`🔍 isSectionVisible check for ${sectionType}:`, {
    sectionVisibility,
    sections: sections.map(s => ({ type: s.type, visible: s.visible })),
    sectionType
  })
  
  // If sectionVisibility object is provided (CV Builder format), use it
  if (sectionVisibility) {
    const result = sectionVisibility[sectionType] ?? true // Default to true for backwards compatibility
    console.log(`✅ Using sectionVisibility for ${sectionType}:`, result)
    return result
  }
  
  // Fallback to section.visible property (legacy format)
  const section = sections.find(s => s.type === sectionType)
  const result = section?.visible ?? true // Default to true for backwards compatibility
  console.log(`⚠️ Using legacy section.visible for ${sectionType}:`, result)
  return result
}

// Format Irish phone number
const formatIrishPhone = (phone: string): string => {
  if (!phone) return ''
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's an Irish mobile (starts with 353 or 0)
  if (cleaned.startsWith('353')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  
  // If it starts with 0, assume it's Irish
  if (cleaned.startsWith('0')) {
    return `+353 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  
  // Return as is if doesn't match Irish pattern
  return phone
}

export function ModernTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  return (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        {/* Header */}
        <View style={modernStyles.header}>
          <Text style={modernStyles.name}>
            {data.personal.fullName || "Your Name"}
          </Text>
          <Text style={modernStyles.title}>
            {data.personal.title || "Professional Title"}
          </Text>
          <Text style={modernStyles.contact}>
            {data.personal.email || "email@example.com"} • {data.personal.phone ? formatIrishPhone(data.personal.phone) : "+353 XX XXX XXXX"} • {data.personal.address || "Dublin, Ireland"}
          </Text>
          {(data.personal.linkedin || data.personal.website) && (
            <Text style={modernStyles.contact}>
              {data.personal.linkedin ? `LinkedIn: ${data.personal.linkedin}` : ""} {data.personal.website ? `• Website: ${data.personal.website}` : ""}
            </Text>
          )}
        </View>

        {/* Summary Section */}
        {data.personal.summary && isSectionVisible(data.sections, 'summary', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Professional Summary</Text>
            <Text style={modernStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <View style={modernStyles.experienceHeader}>
                  <Text style={modernStyles.jobTitle}>
                    {exp.position} at {exp.company}
                  </Text>
                  <Text style={modernStyles.jobMeta}>
                    {exp.location} • {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={modernStyles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {data.education.length > 0 && isSectionVisible(data.sections, 'education', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <View style={modernStyles.experienceHeader}>
                  <Text style={modernStyles.jobTitle}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={modernStyles.jobMeta}>
                    {edu.school} • {formatIrishDate(edu.startDate)} - {edu.current ? 'Present' : formatIrishDate(edu.endDate)}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={modernStyles.description}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Skills</Text>
            <View style={modernStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={modernStyles.skill}>
                  {skill.name} • 
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, index) => (
              <View key={index} style={modernStyles.languageItem}>
                <Text style={modernStyles.languageName}>{lang.language}</Text>
                <Text style={modernStyles.languageLevel}>{lang.proficiency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* References Section */}
        {data.references && data.references.length > 0 && isSectionVisible(data.sections, 'references', data.sectionVisibility) && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>References</Text>
            {data.references.map((ref, index) => (
              <View key={index} style={modernStyles.experienceItem}>
                <Text style={modernStyles.jobTitle}>
                  {ref.name} - {ref.position}
                </Text>
                <Text style={modernStyles.jobMeta}>
                  {ref.company} • {ref.email} • {ref.phone}
                </Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  )
}

export function ClassicTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  console.log('🎯 ClassicTemplate data:', data)
  console.log('🎯 ClassicTemplate experience:', data.experience)
  console.log('🎯 ClassicTemplate education:', data.education)
  console.log('🎯 ClassicTemplate skills:', data.skills)
  console.log('🎯 ClassicTemplate sections:', data.sections)
  console.log('🎯 ClassicTemplate personal:', data.personal)
  
  return (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>
            {data.personal.fullName?.toUpperCase() || "YOUR NAME"}
          </Text>
          <Text style={classicStyles.title}>
            {data.personal.title || "Professional Title"}
          </Text>
          <Text style={classicStyles.contact}>
            {data.personal.email || "email@example.com"} {data.personal.phone ? `• ${formatIrishPhone(data.personal.phone)}` : ""} {data.personal.address ? `• ${data.personal.address}` : ""}
          </Text>
          {(data.personal.linkedin || data.personal.website) && (
            <Text style={classicStyles.contact}>
              {data.personal.linkedin ? `${data.personal.linkedin}` : ""} {data.personal.website ? `• ${data.personal.website}` : ""}
            </Text>
          )}
        </View>

        {/* Summary Section */}
        {data.personal.summary && isSectionVisible(data.sections, 'summary', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SUMMARY</Text>
            <Text style={classicStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>EXPERIENCE</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={classicStyles.experienceItem}>
                <View style={classicStyles.experienceHeader}>
                  <Text style={classicStyles.jobTitle}>
                    {exp.position} at {exp.company}
                  </Text>
                  <Text style={classicStyles.jobMeta}>
                    {exp.location} • {exp.startDate ? formatIrishDate(exp.startDate) : ''} - {exp.current ? 'Present' : (exp.endDate ? formatIrishDate(exp.endDate) : '')}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={classicStyles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section - COMPACT SPACING */}
        {data.education.length > 0 && isSectionVisible(data.sections, 'education', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>EDUCATION</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <View style={classicStyles.experienceHeader}>
                  <Text style={classicStyles.jobTitle}>
                    {edu.degree} in {edu.field || 'studies'}
                  </Text>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={classicStyles.jobMeta}>{edu.location || 'Dublin, Ireland'}</Text>
                    <Text style={classicStyles.jobMeta}>
                      {edu.startDate ? formatIrishDate(edu.startDate) : ''} - {edu.current || edu.endDate === 'Present' ? 'Present' : (edu.endDate ? formatIrishDate(edu.endDate) : '')}
                    </Text>
                  </View>
                </View>
                {edu.description && (
                  <Text style={classicStyles.description}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>SKILLS</Text>
            {['Technical', 'Software', 'Soft', 'Other'].map((category) => {
              const categorySkills = data.skills.filter(skill => skill.category === category)
              if (categorySkills.length === 0) return null
              
              const skillNames = categorySkills.map(skill => skill.name).join(' • ')
              
              return (
                <View key={category} style={classicStyles.skillsContainer}>
                  <Text style={classicStyles.skillCategory}>
                    <Text style={{fontWeight: 600}}>{category}:</Text> {skillNames}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>LANGUAGES</Text>
            {data.languages.map((lang, index) => (
              <View key={index} style={classicStyles.languageItem}>
                <Text style={classicStyles.languageName}>{lang.language}</Text>
                <Text style={classicStyles.languageLevel}>{lang.proficiency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* References Section */}
        {isSectionVisible(data.sections, 'references', data.sectionVisibility) && (
          <View style={classicStyles.section}>
            <Text style={classicStyles.sectionTitle}>REFERENCES</Text>
            {data.references && data.references.length > 0 ? (
              data.references.map((ref, index) => (
                <View key={index} style={classicStyles.experienceItem}>
                  <Text style={classicStyles.jobTitle}>
                    {ref.name} - {ref.position}
                  </Text>
                  <Text style={classicStyles.jobMeta}>
                    {ref.company} • {ref.email} • {ref.phone}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={classicStyles.description}>Available upon request</Text>
            )}
          </View>
        )}

      </Page>
    </Document>
  )
}

export function CreativeTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  return (
    <Document>
      <Page size="A4" style={creativeStyles.page}>
        {/* Header */}
        <View style={creativeStyles.header}>
          <Text style={creativeStyles.name}>
            {data.personal.fullName || "Your Name"}
          </Text>
          <Text style={creativeStyles.title}>
            {data.personal.title || "Professional Title"}
          </Text>
          <Text style={creativeStyles.contact}>
            {data.personal.email || "email@example.com"} • {data.personal.phone ? formatIrishPhone(data.personal.phone) : "+353 XX XXX XXXX"} • {data.personal.address || "Dublin, Ireland"}
          </Text>
          {(data.personal.linkedin || data.personal.website) && (
            <Text style={creativeStyles.contact}>
              {data.personal.linkedin ? `LinkedIn: ${data.personal.linkedin}` : ""} {data.personal.website ? `• Website: ${data.personal.website}` : ""}
            </Text>
          )}
        </View>

        {/* Summary Section */}
        {data.personal.summary && isSectionVisible(data.sections, 'summary', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Professional Summary</Text>
            <Text style={creativeStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={creativeStyles.experienceItem}>
                <View style={creativeStyles.experienceHeader}>
                  <Text style={creativeStyles.jobTitle}>
                    {exp.position} at {exp.company}
                  </Text>
                  <Text style={creativeStyles.jobMeta}>
                    {exp.location} • {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={creativeStyles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {data.education.length > 0 && isSectionVisible(data.sections, 'education', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={creativeStyles.experienceItem}>
                <View style={creativeStyles.experienceHeader}>
                  <Text style={creativeStyles.jobTitle}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={creativeStyles.jobMeta}>
                    {edu.school} • {formatIrishDate(edu.startDate)} - {edu.current ? 'Present' : formatIrishDate(edu.endDate)}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={creativeStyles.description}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Skills</Text>
            <View style={creativeStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={creativeStyles.skill}>
                  {skill.name} • 
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, index) => (
              <View key={index} style={creativeStyles.languageItem}>
                <Text style={creativeStyles.languageName}>{lang.language}</Text>
                <Text style={creativeStyles.languageLevel}>{lang.proficiency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* References Section */}
        {data.references && data.references.length > 0 && isSectionVisible(data.sections, 'references', data.sectionVisibility) && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>References</Text>
            {data.references.map((ref, index) => (
              <View key={index} style={creativeStyles.experienceItem}>
                <Text style={creativeStyles.jobTitle}>
                  {ref.name} - {ref.position}
                </Text>
                <Text style={creativeStyles.jobMeta}>
                  {ref.company} • {ref.email} • {ref.phone}
                </Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  )
}

export function HarvardTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously (PDF rendering doesn't support useEffect)
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  return (
    <Document>
      <Page size="A4" style={harvardStyles.page}>
        {/* Header */}
        <View style={harvardStyles.header}>
          <Text style={harvardStyles.name}>
            {data.personal.fullName || "Your Name"}
          </Text>
          <Text style={harvardStyles.title}>
            {data.personal.title || "Professional Title"}
          </Text>
          <Text style={harvardStyles.contact}>
            {data.personal.email || "email@example.com"} • {data.personal.phone ? formatIrishPhone(data.personal.phone) : "+353 XX XXX XXXX"} • {data.personal.address || "Dublin, Ireland"}
          </Text>
          {(data.personal.linkedin || data.personal.website) && (
            <Text style={harvardStyles.contact}>
              {data.personal.linkedin ? `LinkedIn: ${data.personal.linkedin}` : ""} {data.personal.website ? `• Website: ${data.personal.website}` : ""}
            </Text>
          )}
        </View>

        {/* Summary Section */}
        {data.personal.summary && isSectionVisible(data.sections, 'summary', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>Professional Summary</Text>
            <Text style={harvardStyles.description}>{data.personal.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {data.experience.length > 0 && isSectionVisible(data.sections, 'experience', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={harvardStyles.experienceItem}>
                <View style={harvardStyles.experienceHeader}>
                  <Text style={harvardStyles.jobTitle}>
                    {exp.position} at {exp.company}
                  </Text>
                  <Text style={harvardStyles.jobMeta}>
                    {exp.location} • {formatIrishDate(exp.startDate)} - {exp.current ? 'Present' : formatIrishDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={harvardStyles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {data.education.length > 0 && isSectionVisible(data.sections, 'education', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={harvardStyles.experienceItem}>
                <View style={harvardStyles.experienceHeader}>
                  <Text style={harvardStyles.jobTitle}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={harvardStyles.jobMeta}>
                    {edu.school} • {formatIrishDate(edu.startDate)} - {edu.current ? 'Present' : formatIrishDate(edu.endDate)}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={harvardStyles.description}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && isSectionVisible(data.sections, 'skills', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>Skills</Text>
            <View style={harvardStyles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={harvardStyles.skill}>
                  {skill.name} • 
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages Section */}
        {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, index) => (
              <View key={index} style={harvardStyles.languageItem}>
                <Text style={harvardStyles.languageName}>{lang.language}</Text>
                <Text style={harvardStyles.languageLevel}>{lang.proficiency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* References Section */}
        {data.references && data.references.length > 0 && isSectionVisible(data.sections, 'references', data.sectionVisibility) && (
          <View style={harvardStyles.section}>
            <Text style={harvardStyles.sectionTitle}>References</Text>
            {data.references.map((ref, index) => (
              <View key={index} style={harvardStyles.experienceItem}>
                <Text style={harvardStyles.jobTitle}>
                  {ref.name} - {ref.position}
                </Text>
                <Text style={harvardStyles.jobMeta}>
                  {ref.company} • {ref.email} • {ref.phone}
                </Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  )
}

// Template ID mapping
const templateIdMap: Record<string, string> = {
  'classic': 'classic',
  'modern': 'modern', 
  'creative': 'creative',
  'harvard': 'harvard',
  'stockholm': 'stockholm',
  'dublin-professional': 'dublin-professional',
  'london': 'london',
  'dublin-tech': 'dublin-tech',
  'irish-finance': 'irish-finance',
  'dublin-pharma': 'dublin-pharma'
}

export const PDFTemplate: React.FC<{ data: CVData; template?: string }> = ({ data, template }) => {
  // Ensure this only runs on client-side
  if (typeof window === 'undefined') {
    console.error('PDFTemplate attempted to render on server-side')
    return null
  }
  
  // Use provided template parameter or fallback to data.template
  const templateToUse = template || data.template || 'classic'
  const resolved = templateIdMap[templateToUse] || 'classic'
  
  console.log('🎯 PDFTemplate rendering:', { templateToUse, resolved })
  
  switch (resolved) {
    case 'modern':
      return <ModernTemplate data={data} />
    case 'creative':
      return <CreativeTemplate data={data} />
    case 'harvard':
      return <HarvardTemplate data={data} />
    case 'classic':
    default:
      return <ClassicTemplate data={data} />
  }
} 
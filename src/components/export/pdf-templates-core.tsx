import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import type { CVData } from '@/types/cv'
import { registerPDFFonts, getFontFamilyForPDF } from '@/lib/pdf-fonts'

// Tailwind to PDF style mapping - exact values from live preview
const colors = {
  primary: '#1f2937',      // gray-800 (used for primary color)
  text: {
    black: '#000000',      // text-black
    gray900: '#111827',    // text-gray-900 
    gray800: '#1f2937',    // text-gray-800
    gray700: '#374151',    // text-gray-700
    gray600: '#4b5563',    // text-gray-600
    gray500: '#6b7280',    // text-gray-500
  }
}

// Create StyleSheet that mirrors live preview exactly
const styles = StyleSheet.create({
  // Main container - matches "h-full flex flex-col p-6" - OPTIMIZED for A4
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,        // Reduced from 11 to 9
    lineHeight: 1.3,    // Tightened from 1.4 to 1.3
    padding: 16,        // Reduced from 24 to 16 (p-4 equivalent)
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },

  // Header section - matches "text-center mb-6" - OPTIMIZED
  header: {
    textAlign: 'center',
    marginBottom: 12,  // Reduced from 24 to 12
  },

  // Name - matches "text-3xl font-bold mb-2" - OPTIMIZED
  name: {
    fontSize: 22,        // Reduced from 30 to 22 (27% reduction)
    fontWeight: 'bold',
    marginBottom: 6,     // Increased from 4 to 6 for better spacing with title
    color: colors.primary,
    letterSpacing: 0
  },

  // Title - matches "text-lg text-gray-600 mb-3" - OPTIMIZED
  title: {
    fontSize: 14,        // Reduced from 18 to 14 (22% reduction)
    color: colors.text.gray600,
    marginBottom: 6,     // Reduced from 12 to 6
    fontWeight: 'normal'
  },

  // Contact info - matches "text-sm text-gray-500" - OPTIMIZED
  contactContainer: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray500,
    lineHeight: 1.3     // Tightened from 1.4 to 1.3
  },

  contactLine: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray500,
    marginBottom: 2,     // Reduced from 4 to 2
  },

  // Content container - matches "space-y-6 flex-1"
  contentContainer: {
    flex: 1,
    // space-y-6 will be handled by marginBottom on sections
  },

  // Section - matches default section styling - OPTIMIZED
  section: {
    marginBottom: 12,    // Reduced from 24 to 12 (50% reduction)
  },

  // Section title - matches "text-base font-semibold mb-3" - OPTIMIZED
  sectionTitle: {
    fontSize: 12,        // Reduced from 16 to 12 (25% reduction)
    fontWeight: 'bold',  // font-semibold
    marginBottom: 6,     // Reduced from 12 to 6
    color: colors.primary,
    textTransform: 'none'
  },

  // Experience/Education item - matches "mb-4" and "mb-3" - OPTIMIZED
  experienceItem: {
    marginBottom: 8,     // Reduced from 16 to 8 (50% reduction)
  },

  educationItem: {
    marginBottom: 6,     // Reduced from 12 to 6 (50% reduction)
  },

  // Header layout - matches "flex justify-between items-start"
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0
  },

  // Left side - matches "flex-1" - OPTIMIZED
  itemLeft: {
    flex: 1,
    paddingRight: 12,    // Reduced from 16 to 12
  },

  // Right side - matches "text-sm text-gray-600 ml-4 whitespace-nowrap" - OPTIMIZED
  itemRight: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray600,
    textAlign: 'right',
    minWidth: 80,        // Reduced from 100 to 80
  },

  // Job title - matches "text-sm font-semibold text-gray-900" - OPTIMIZED
  jobTitle: {
    fontSize: 11,        // Reduced from 14 to 11
    fontWeight: 'bold',  // font-semibold
    color: colors.text.gray900,
    marginBottom: 1      // Reduced from 2 to 1
  },

  // Company - matches "text-sm text-gray-700 font-medium" - OPTIMIZED
  company: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray700,
    fontWeight: 500,     // font-medium
    marginBottom: 0
  },

  // Education degree - matches "text-sm font-semibold text-gray-900" - OPTIMIZED
  degree: {
    fontSize: 11,        // Reduced from 14 to 11
    fontWeight: 'bold',  // font-semibold
    color: colors.text.gray900,
    marginBottom: 1      // Reduced from 2 to 1
  },

  // Institution - matches "text-sm text-gray-700 font-medium" - OPTIMIZED
  institution: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray700,
    fontWeight: 500,     // font-medium
    marginBottom: 1      // Reduced from 2 to 1
  },

  // Field - matches "text-sm text-gray-600" - OPTIMIZED
  field: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray600,
    marginBottom: 1      // Reduced from 2 to 1
  },

  // Grade - matches "text-sm text-gray-600" - OPTIMIZED
  grade: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray600,
  },

  // Skills content - matches "text-sm text-gray-700" - OPTIMIZED
  skillsText: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray700,
    lineHeight: 1.3      // Tightened from 1.4 to 1.3
  },

  // Summary text styling - justified alignment
  summaryText: {
    fontSize: 11,        // Same as skillsText
    color: colors.text.gray700,
    lineHeight: 1.3,
    textAlign: 'justify' // Two-sided alignment for better appearance
  },

  // Language item - matches "mb-2" - OPTIMIZED
  languageItem: {
    marginBottom: 4,     // Reduced from 8 to 4 (50% reduction)
  },

  // Language header - matches "flex justify-between items-center" - OPTIMIZED
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1      // Reduced from 2 to 1
  },

  // Language name - matches "font-medium text-gray-800" - OPTIMIZED
  languageName: {
    fontWeight: 500,     // font-medium
    color: colors.text.gray800,
    fontSize: 11,        // Reduced from 14 to 11
  },

  // Language level - matches "text-gray-600 capitalize" - OPTIMIZED
  languageLevel: {
    color: colors.text.gray600,
    fontSize: 11,        // Reduced from 14 to 11
  },

  // Language certification - matches "text-gray-600 text-xs mt-0.5" - OPTIMIZED
  languageCertification: {
    color: colors.text.gray600,
    fontSize: 10,        // Reduced from 12 to 10
    marginTop: 1,        // Reduced from 2 to 1
  },

  // References text - matches "text-sm text-gray-700" - OPTIMIZED
  referencesText: {
    fontSize: 11,        // Reduced from 14 to 11
    color: colors.text.gray700,
  },

  // Link styling for clickable URLs
  link: {
    fontSize: 11,
    color: colors.text.gray500,
    textDecoration: 'none'
  }
})

// Helper function to check if a section is visible
const isSectionVisible = (sections: any[], sectionType: string, sectionVisibility?: Record<string, boolean>) => {
  // If sectionVisibility object is provided (CV Builder format), use it
  if (sectionVisibility) {
    return sectionVisibility[sectionType] ?? true // Default to true for backwards compatibility
  }
  
  // Fallback to section.visible property (legacy format)
  const section = sections.find(s => s.type === sectionType)
  return section?.visible ?? true // Default to true for backwards compatibility
}

// Format date to match live preview exactly (YYYY-MM format)
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  
  // If already in YYYY-MM format, return as-is
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Handle full date format - convert to YYYY-MM
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString // Return as-is if invalid
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function ClassicTemplate({ data }: { data: CVData }) {
  // Register fonts synchronously
  try {
    registerPDFFonts()
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error)
  }
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section - exact match with live preview */}
        <View style={styles.header}>
          {/* Name with its own spacing */}
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.name}>
              {data.personal.fullName || "Your Name"}
            </Text>
          </View>
          {/* Title in separate View */}
          <View>
            <Text style={styles.title}>
              {data.personal.title || "Professional Title"}
            </Text>
          </View>
          
          {/* Contact Info - matches live preview structure */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactLine}>
              {data.personal.email || "your.email@example.com"} • {data.personal.phone || "+353 XX XXX XXXX"} • {data.personal.address || "Dublin, Ireland"}
            </Text>
            
            {/* Work Status - matches "Work Status: {workPermit}" */}
            {data.personal.stamp && (
              <Text style={styles.contactLine}>
                Work Status: {data.personal.stamp}
              </Text>
            )}
            
            {/* LinkedIn and Portfolio - matches live preview format - CLICKABLE LINKS */}
            {(data.personal.linkedin || data.personal.website) && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                {data.personal.linkedin && (
                  <Link style={styles.link} src={data.personal.linkedin}>
                    LinkedIn: {data.personal.linkedin.replace('https://www.linkedin.com/in/', '').replace('/', '')}/
                  </Link>
                )}
                {data.personal.linkedin && data.personal.website && (
                  <Text style={styles.contactLine}> • </Text>
                )}
                {data.personal.website && (
                  <Link style={styles.link} src={data.personal.website}>
                    Portfolio: {data.personal.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}/
                  </Link>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Summary Section */}
          {data.personal.summary && isSectionVisible(data.sections, 'summary', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{data.personal.summary}</Text>
            </View>
          )}

          {/* Experience Section */}
          {data.experience.length > 0 && isSectionVisible(data.sections, 'experience', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, index) => {
                // Handle both field name formats
                const position = (exp as any).role || exp.position;
                const startDate = (exp as any).start || exp.startDate;
                const endDate = (exp as any).end || (exp.current ? 'Present' : exp.endDate);
                const dateRange = `${startDate ? formatDate(startDate) : ''} - ${endDate === 'Present' ? 'Present' : (endDate ? formatDate(endDate) : '')}`;
                
                return (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.jobTitle}>{position}</Text>
                        <Text style={styles.company}>{exp.company}</Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text>{dateRange}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Education Section */}
          {data.education.length > 0 && isSectionVisible(data.sections, 'education', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education.map((edu, index) => {
                // Handle both field name formats
                const startDate = (edu as any).start || edu.startDate;
                const endDate = (edu as any).end || (edu.current ? 'Present' : edu.endDate);
                const dateRange = `${startDate ? formatDate(startDate) : ''} - ${endDate === 'Present' ? 'Present' : (endDate ? formatDate(endDate) : '')}`;
                
                return (
                  <View key={index} style={styles.educationItem}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.degree}>{edu.degree}</Text>
                        <Text style={styles.institution}>{edu.institution}</Text>
                        <Text style={styles.field}>{edu.field}</Text>
                        {edu.grade && (
                          <Text style={styles.grade}>Grade: {edu.grade}</Text>
                        )}
                      </View>
                      <View style={styles.itemRight}>
                        <Text>{dateRange}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Skills Section */}
          {data.skills.length > 0 && isSectionVisible(data.sections, 'skills', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
              <Text style={styles.skillsText}>
                {typeof data.skills[0] === 'string' 
                  ? data.skills.join(', ')
                  : data.skills.map(skill => skill.name).join(', ')
                }
              </Text>
            </View>
          )}

          {/* Languages Section */}
          {data.languages && data.languages.length > 0 && isSectionVisible(data.sections, 'languages', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Languages</Text>
              {data.languages.map((lang, index) => {
                // Handle both field name formats
                const proficiency = (lang as any).proficiency || lang.level || '';
                const displayProficiency = proficiency ? proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase() : '';
                
                return (
                  <View key={index} style={styles.languageItem}>
                    <View style={styles.languageHeader}>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      <Text style={styles.languageLevel}>{displayProficiency}</Text>
                    </View>
                    {lang.certification && (
                      <Text style={styles.languageCertification}>
                        Certification: {lang.certification}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* References Section */}
          {isSectionVisible(data.sections, 'references', data.sectionVisibility) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              <Text style={styles.referencesText}>Available upon request</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

// Template ID mapping for other templates (keeping existing structure)
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
    case 'classic':
    default:
      return <ClassicTemplate data={data} />
  }
} 
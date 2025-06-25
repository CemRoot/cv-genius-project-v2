import React from 'react'
import { dublinTemplateManager } from '@/lib/cover-letter-templates-new'

interface StyledCoverLetterProps {
  content: string
  templateId: string
  colorOption?: string
  signature?: {
    type: 'drawn' | 'uploaded' | 'typed' | null
    value: string
  }
}

export function StyledCoverLetter({ 
  content, 
  templateId, 
  colorOption = 'color1',
  signature 
}: StyledCoverLetterProps) {
  // Debug log
  console.log('🎨 StyledCoverLetter props:', { templateId, colorOption })
  
  // Get the template configuration
  const template = dublinTemplateManager.getTemplate(templateId)
  
  if (!template) {
    // Fallback to basic display if template not found
    return (
      <div className="font-serif whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
        {content}
        {signature && (
          <div className="mt-8">
            {renderSignature(signature)}
          </div>
        )}
      </div>
    )
  }

  // Parse the cover letter content into sections
  const sections = parseCoverLetter(content)
  
  // Map color options to actual colors with better contrast for PDF
  const getColorValue = (colorOption: string) => {
    const colorMap: Record<string, string> = {
      // Standard color names (legacy support) - improved for PDF
      'green': '#16a34a', // Lighter green
      'blue': '#2563eb',  // Lighter blue  
      'purple': '#9333ea', // Lighter purple
      'red': '#dc2626',
      'orange': '#ea580c',
      'teal': '#0d9488', // Lighter teal
      // New color system with PDF-optimized colors
      'color1': '#2563eb', // Professional blue (lighter)
      'color2': '#475569', // Medium gray (lighter)
      'color3': '#b45309', // Warm brown (lighter) - better for PDF
      'color4': '#7c3aed', // Purple (lighter)
      'color5': '#059669', // Emerald (lighter)
      'color6': '#dc2626', // Red
      'color7': '#db2777', // Pink (lighter) - much more visible in PDF
      'color8': '#16a34a', // Green (lighter)
      // Fallback to template defaults
      'default': template.styles.colors.primary
    }
    
    const selectedColor = colorMap[colorOption] || template.styles.colors.primary
    
    console.log('🎨 Color mapping (PDF optimized):', { 
      colorOption, 
      mapped: selectedColor,
      availableColors: Object.keys(colorMap)
    })
    
    return selectedColor
  }

  const primaryColor = getColorValue(colorOption || 'color1')
  
  console.log('🎯 Final primary color for template:', primaryColor)
  
  // Apply template-specific styling based on template ID
  const getTemplateStyles = () => {
    switch (templateId) {
      case 'trinity-modern':
        return {
          container: {
            maxWidth: '900px',
            margin: '0 auto',
            background: 'white',
            padding: '60px',
            fontFamily: '"Arial", sans-serif',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            minHeight: '950px'
          },
          header: {
            textAlign: 'center' as const,
            marginBottom: '50px',
            borderBottom: `4px solid ${primaryColor}`,
            paddingBottom: '30px'
          },
          nameStyle: {
            fontSize: '40px',
            fontWeight: 'bold',
            color: primaryColor,
            marginBottom: '15px'
          },
          contentStyle: {
            lineHeight: '1.7',
            color: '#333',
            textAlign: 'justify' as const,
            fontSize: '16px'
          }
        }
      case 'corporate-dublin':
        return {
          container: {
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'white',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            minHeight: '1100px',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)'
          },
          sidebar: {
            background: primaryColor,
            color: 'white',
            padding: '50px 40px'
          },
          mainContent: {
            padding: '50px',
            background: 'white',
            fontFamily: '"Calibri", sans-serif',
            fontSize: '16px'
          },
          nameStyle: {
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }
        }
      case 'tech-dublin':
        return {
          container: {
            maxWidth: '800px',
            margin: '0 auto',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontFamily: '"Inter", sans-serif',
            minHeight: '1000px'
          },
          header: {
            background: primaryColor,
            color: 'white',
            padding: '40px',
            textAlign: 'center' as const
          },
          content: {
            background: 'white',
            padding: '40px',
            margin: '20px',
            borderRadius: '8px',
            lineHeight: '1.6'
          },
          nameStyle: {
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }
        }
      case 'dublin-professional':
      default:
        return {
          container: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed' as const,
            minHeight: '950px',
            fontFamily: '"Arial", sans-serif',
            fontSize: '16px',
            lineHeight: '1.6'
          },
          sidebar: {
            display: 'table-cell',
            width: '200px',
            background: primaryColor,
            color: 'white',
            padding: '30px',
            verticalAlign: 'top'
          },
          mainContent: {
            display: 'table-cell',
            padding: '30px',
            verticalAlign: 'top'
          },
          nameStyle: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }
        }
    }
  }

  const styles = getTemplateStyles()
  
  // Render template-specific layout
  if (templateId === 'trinity-modern') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.nameStyle}>{sections.senderName}</div>
          {sections.address && <p style={{ marginBottom: '5px' }}>{sections.address}</p>}
          {sections.phone && <p style={{ marginBottom: '5px' }}>{sections.phone}</p>}
          {sections.email && <p style={{ marginBottom: '5px' }}>{sections.email}</p>}
        </div>
        
        <div style={styles.contentStyle}>
          {sections.date && <p style={{ textAlign: 'right', marginBottom: '30px' }}>{sections.date}</p>}
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ marginBottom: '5px' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px' }}>{highlightPlaceholders(sections.company)}</p>
            <p>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '15px' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '15px' }}>{sections.closing}</p>
          
          <p style={{ marginBottom: '10px' }}>{sections.applicantName}</p>
          
          {signature && (
            <div style={{ marginTop: '5px' }}>
              {renderSignature(signature)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  if (templateId === 'corporate-dublin') {
    return (
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h2 style={styles.nameStyle}>{sections.senderName}</h2>
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Contact</h3>
            {sections.email && <p style={{ marginBottom: '8px' }}>{sections.email}</p>}
            {sections.phone && <p style={{ marginBottom: '8px' }}>{sections.phone}</p>}
            {sections.address && <p style={{ marginBottom: '8px' }}>{sections.address}</p>}
          </div>
        </div>
        
        <div style={styles.mainContent}>
          {sections.date && <p style={{ textAlign: 'right', marginBottom: '30px', color: '#6b7280' }}>{sections.date}</p>}
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px' }}>{highlightPlaceholders(sections.company)}</p>
            <p>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '25px', fontWeight: '600', fontSize: '16px' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '20px', lineHeight: '1.7' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '35px', lineHeight: '1.7' }}>{sections.closing}</p>
          
          <p style={{ fontWeight: '600', fontSize: '16px' }}>{sections.applicantName}</p>
          
          {signature && (
            <div style={{ marginTop: '20px' }}>
              {renderSignature(signature)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  if (templateId === 'tech-dublin') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.nameStyle}>{sections.senderName}</h2>
          <div style={{ marginTop: '20px' }}>
            <p>{sections.email} | {sections.phone}</p>
            {sections.address && <p>{sections.address}</p>}
          </div>
        </div>
        
        <div style={styles.content}>
          {sections.date && <p style={{ textAlign: 'right', marginBottom: '25px', color: '#64748b' }}>{sections.date}</p>}
          
          <div style={{ marginBottom: '25px' }}>
            <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px' }}>{highlightPlaceholders(sections.company)}</p>
            <p>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '20px', fontWeight: '500' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '18px' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '30px' }}>{sections.closing}</p>
          
          <p style={{ fontWeight: '500' }}>{sections.applicantName}</p>
          
          {signature && (
            <div style={{ marginTop: '20px' }}>
              {renderSignature(signature)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Default layout (dublin-professional and others)
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.nameStyle}>{sections.senderName}</h2>
        <div style={{ marginTop: '30px' }}>
          {sections.email && <p style={{ marginBottom: '10px' }}>{sections.email}</p>}
          {sections.phone && <p style={{ marginBottom: '10px' }}>{sections.phone}</p>}
          {sections.address && <p style={{ marginBottom: '10px' }}>{sections.address}</p>}
        </div>
      </div>
      
      <div style={styles.mainContent}>
        {sections.date && <p style={{ textAlign: 'right', marginBottom: '30px' }}>{sections.date}</p>}
        
        <div style={{ marginBottom: '30px' }}>
          <p style={{ marginBottom: '5px' }}>{sections.recipientName}</p>
          <p style={{ marginBottom: '5px' }}>{highlightPlaceholders(sections.company)}</p>
          <p>{sections.companyAddress}</p>
        </div>
        
        <p style={{ marginBottom: '20px' }}>{sections.salutation}</p>
        
        {sections.paragraphs.map((para, index) => (
          <p key={index} style={{ marginBottom: '15px' }}>
            {highlightPlaceholders(para)}
          </p>
        ))}
        
        <p style={{ marginBottom: '15px' }}>{sections.closing}</p>
        
        <p style={{ marginBottom: '10px' }}>{sections.applicantName}</p>
        
        {signature && (
          <div style={{ marginTop: '5px' }}>
            {renderSignature(signature)}
          </div>
        )}
      </div>
    </div>
  )
}

function parseCoverLetter(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  
  // Extract components
  let senderName = ''
  let address = ''
  let phone = ''
  let email = ''
  let date = ''
  let recipientName = 'Hiring Manager'
  let company = ''
  let companyAddress = ''
  let salutation = ''
  let closing = ''
  let applicantName = ''
  const paragraphs: string[] = []
  
  let currentIndex = 0
  
  // Parse sender info - NEW FORMAT: Name first, then address, phone, email
  // First line should be the sender's name
  if (lines[0] && !lines[0].includes('Hiring Manager') && !lines[0].includes('Dear')) {
    senderName = lines[0]
    currentIndex++
  }
  
  // Next line might be address (contains Dublin, Ireland, or similar)
  if (lines[currentIndex] && (lines[currentIndex].includes('Dublin') || lines[currentIndex].includes('Ireland') || lines[currentIndex].includes(','))) {
    address = lines[currentIndex]
    currentIndex++
  }
  
  // Phone number
  if (lines[currentIndex] && lines[currentIndex].includes('+353')) {
    phone = lines[currentIndex]
    currentIndex++
  }
  
  // Email
  if (lines[currentIndex] && lines[currentIndex].includes('@')) {
    email = lines[currentIndex]
    currentIndex++
  }
  
  // Date - various formats
  if (lines[currentIndex] && (lines[currentIndex].match(/\d{1,2}\/\d{1,2}\/\d{4}/) || 
      lines[currentIndex].match(/\d{1,2}\s+\w+\s+\d{4}/) || 
      lines[currentIndex].match(/\w+\s+\d{1,2},?\s+\d{4}/))) {
    date = lines[currentIndex]
    currentIndex++
  }
  
  // Skip any empty lines
  while (currentIndex < lines.length && !lines[currentIndex]) {
    currentIndex++
  }
  
  // Parse recipient info
  if (lines[currentIndex] && lines[currentIndex].includes('Hiring Manager')) {
    recipientName = lines[currentIndex]
    currentIndex++
  }
  
  if (lines[currentIndex] && !lines[currentIndex].includes('Dear')) {
    company = lines[currentIndex]
    currentIndex++
  }
  
  if (lines[currentIndex] && lines[currentIndex].includes('Dublin')) {
    companyAddress = lines[currentIndex]
    currentIndex++
  }
  
  // Find salutation
  const salutationIndex = lines.findIndex(line => line.startsWith('Dear'))
  if (salutationIndex !== -1) {
    salutation = lines[salutationIndex]
    currentIndex = salutationIndex + 1
  }
  
  // Find closing
  const closingIndex = lines.findIndex(line => line.startsWith('Yours sincerely'))
  if (closingIndex !== -1) {
    closing = lines[closingIndex]
    
    // Extract paragraphs between salutation and closing
    for (let i = currentIndex; i < closingIndex; i++) {
      if (lines[i] && lines[i].trim()) {
        paragraphs.push(lines[i])
      }
    }
    
    // Get applicant name (last non-empty line)
    for (let i = lines.length - 1; i > closingIndex; i--) {
      if (lines[i] && lines[i].trim()) {
        applicantName = lines[i]
        break
      }
    }
  }
  
  return {
    senderName,
    address,
    phone,
    email,
    date,
    recipientName,
    company,
    companyAddress,
    salutation,
    paragraphs,
    closing,
    applicantName
  }
}

function renderSignature(signature: { type: string | null; value: string }) {
  if (!signature || !signature.type) {
    return null
  }

  if (signature.type === 'drawn' || signature.type === 'uploaded') {
    return (
      <img 
        src={signature.value} 
        alt="Signature" 
        style={{ 
          maxHeight: '60px',
          filter: 'contrast(1.2)'
        }}
      />
    )
  }
  
  if (signature.type === 'typed') {
    return (
      <div style={{ 
        fontFamily: 'cursive', 
        fontSize: '24px',
        color: '#000000'
      }}>
        {signature.value}
      </div>
    )
  }
  
  return null
}

function highlightPlaceholders(text: string): React.ReactNode {
  // For PDF export and professional appearance, disable highlighting completely
  // Just return the text as-is without any special formatting
  return text
}
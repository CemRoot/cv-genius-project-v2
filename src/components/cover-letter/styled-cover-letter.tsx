import React, { useState, useEffect } from 'react'
import { dublinTemplateManager } from '@/lib/cover-letter-templates-new'
import { processSignature } from '@/lib/signature-utils'

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
  signature,
  isPdfExport = false 
}: StyledCoverLetterProps & { isPdfExport?: boolean }) {
  // Debug log
  console.log('🎨 StyledCoverLetter props:', { templateId, colorOption, isPdfExport })
  
  // State for processed signature
  const [processedSignature, setProcessedSignature] = useState<{
    url: string
    width: number
    height: number
  } | null>(null)
  
  // Process signature to remove white background
  useEffect(() => {
    if (signature?.value && (signature.type === 'drawn' || signature.type === 'uploaded')) {
      processSignature(signature.value)
        .then(result => {
          setProcessedSignature(result)
        })
        .catch(err => {
          console.error('Signature processing failed:', err)
          // Fallback to original
          setProcessedSignature({
            url: signature.value,
            width: 200,
            height: 80
          })
        })
    }
  }, [signature])
  
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

  // Define renderSignature function inside component to access processedSignature state
  const renderSignature = (signature: { type: string | null; value: string }) => {
    if (!signature || !signature.type) {
      return null
    }

    if (signature.type === 'drawn' || signature.type === 'uploaded') {
      // Use processed signature if available
      const signatureUrl = processedSignature?.url || signature.value
      const maxHeight = processedSignature ? Math.min(processedSignature.height, 50) : 50
      
      return (
        <img 
          src={signatureUrl} 
          alt="Signature" 
          style={{ 
            maxHeight: `${maxHeight}px`,
            height: 'auto',
            width: 'auto',
            display: 'block'
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
            width: '100%',
            maxWidth: isPdfExport ? '100%' : '800px',
            margin: '0 auto',
            background: 'white',
            padding: isPdfExport ? '60px 50px' : '40px',
            fontFamily: '"Arial", sans-serif',
            boxSizing: 'border-box' as const
          },
          header: {
            textAlign: 'center' as const,
            marginBottom: '35px',
            borderBottom: `3px solid ${primaryColor}`,
            paddingBottom: '20px'
          },
          nameStyle: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: primaryColor,
            marginBottom: '10px'
          },
          contentStyle: {
            lineHeight: '1.6',
            color: '#333',
            textAlign: 'justify' as const,
            fontSize: '14px'
          }
        }
      case 'corporate-dublin':
        return {
          container: {
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            boxSizing: 'border-box' as const
          },
          sidebar: {
            background: primaryColor,
            color: 'white',
            padding: '35px 25px'
          },
          mainContent: {
            padding: '35px',
            background: 'white',
            fontFamily: '"Calibri", sans-serif',
            fontSize: '14px'
          },
          nameStyle: {
            fontSize: '26px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }
        }
      case 'tech-dublin':
        return {
          container: {
            width: '100%',
            maxWidth: '750px',
            margin: '0 auto',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontFamily: '"Inter", sans-serif',
            boxSizing: 'border-box' as const
          },
          header: {
            background: primaryColor,
            color: 'white',
            padding: '30px',
            textAlign: 'center' as const
          },
          content: {
            background: 'white',
            padding: '30px',
            margin: '15px',
            borderRadius: '6px',
            lineHeight: '1.5',
            fontSize: '14px'
          },
          nameStyle: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }
        }
      case 'dublin-professional':
      default:
        return {
          container: {
            display: 'table',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            tableLayout: 'fixed' as const,
            fontFamily: '"Arial", sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            boxSizing: 'border-box' as const
          },
          sidebar: {
            display: 'table-cell',
            width: '180px',
            background: primaryColor,
            color: 'white',
            padding: '25px',
            verticalAlign: 'top'
          },
          mainContent: {
            display: 'table-cell',
            padding: '25px',
            verticalAlign: 'top'
          },
          nameStyle: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px'
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
          <div style={styles.nameStyle}>{sections.senderName || 'Your Name'}</div>
          {sections.address && <p style={{ marginBottom: '5px' }}>{sections.address}</p>}
          {sections.phone && <p style={{ marginBottom: '5px' }}>{sections.phone}</p>}
          {sections.email && <p style={{ marginBottom: '5px' }}>{sections.email}</p>}
        </div>
        
        <div style={styles.contentStyle}>
          {sections.date && <p style={{ textAlign: 'right', marginBottom: '30px' }}>{sections.date}</p>}
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ marginBottom: '5px', textAlign: 'left' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px', textAlign: 'left' }}>{highlightPlaceholders(sections.company)}</p>
            <p style={{ textAlign: 'left' }}>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '15px', textAlign: 'justify' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '15px' }}>{sections.closing}</p>
          
          {signature && (
            <div style={{ marginTop: '5px', marginBottom: '10px' }}>
              {renderSignature(signature)}
            </div>
          )}
          
          <p style={{ marginBottom: '10px' }}>{sections.applicantName}</p>
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
            <p style={{ marginBottom: '5px', fontWeight: 'bold', textAlign: 'left' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px', textAlign: 'left' }}>{highlightPlaceholders(sections.company)}</p>
            <p style={{ textAlign: 'left' }}>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '25px', fontWeight: '600', fontSize: '16px' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '20px', lineHeight: '1.7', textAlign: 'justify' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '35px', lineHeight: '1.7' }}>{sections.closing}</p>
          
          {signature && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              {renderSignature(signature)}
            </div>
          )}
          
          <p style={{ fontWeight: '600', fontSize: '16px' }}>{sections.applicantName}</p>
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
            <p style={{ marginBottom: '5px', fontWeight: 'bold', textAlign: 'left' }}>{sections.recipientName}</p>
            <p style={{ marginBottom: '5px', textAlign: 'left' }}>{highlightPlaceholders(sections.company)}</p>
            <p style={{ textAlign: 'left' }}>{sections.companyAddress}</p>
          </div>
          
          <p style={{ marginBottom: '20px', fontWeight: '500' }}>{sections.salutation}</p>
          
          {sections.paragraphs.map((para, index) => (
            <p key={index} style={{ marginBottom: '18px', textAlign: 'justify' }}>
              {highlightPlaceholders(para)}
            </p>
          ))}
          
          <p style={{ marginBottom: '30px' }}>{sections.closing}</p>
          
          {signature && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              {renderSignature(signature)}
            </div>
          )}
          
          <p style={{ fontWeight: '500' }}>{sections.applicantName}</p>
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
          <p style={{ marginBottom: '5px', textAlign: 'left' }}>{sections.recipientName}</p>
          <p style={{ marginBottom: '5px', textAlign: 'left' }}>{highlightPlaceholders(sections.company)}</p>
          <p style={{ textAlign: 'left' }}>{sections.companyAddress}</p>
        </div>
        
        <p style={{ marginBottom: '20px' }}>{sections.salutation}</p>
        
        {sections.paragraphs.map((para, index) => (
          <p key={index} style={{ marginBottom: '15px', textAlign: 'justify' }}>
            {highlightPlaceholders(para)}
          </p>
        ))}
        
        <p style={{ marginBottom: '15px' }}>{sections.closing}</p>
        
        {signature && (
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            {renderSignature(signature)}
          </div>
        )}
        
        <p style={{ marginTop: signature ? '10px' : '40px' }}>{sections.applicantName}</p>
      </div>
    </div>
  )
}

function parseCoverLetter(content: string) {
  const lines = content.split('\n')
  
  // Debug logging
  console.log('📄 Parsing cover letter, total lines:', lines.length)
  console.log('📄 First 5 lines:', lines.slice(0, 5))
  
  // Extract components with more flexible parsing
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
  
  // Skip empty lines at the beginning
  while (currentIndex < lines.length && !lines[currentIndex].trim()) {
    currentIndex++
  }
  
  // Parse sender info - More flexible parsing
  // Look for patterns in the first few non-empty lines
  const firstNonEmptyLines: string[] = []
  for (let i = currentIndex; i < Math.min(currentIndex + 10, lines.length); i++) {
    if (lines[i].trim()) {
      firstNonEmptyLines.push(lines[i])
    }
  }
  
  console.log('📄 First non-empty lines:', firstNonEmptyLines)
  
  // Process lines in order to correctly identify each component
  let lineIndex = 0
  
  // First line is usually the sender name
  if (lineIndex < firstNonEmptyLines.length && 
      !firstNonEmptyLines[lineIndex].includes('@') && 
      !firstNonEmptyLines[lineIndex].includes('+353')) {
    senderName = firstNonEmptyLines[lineIndex]
    console.log('📄 Found sender name at index', lineIndex, ':', senderName)
    lineIndex++
  }
  
  // Next lines could be address (before phone/email)
  while (lineIndex < firstNonEmptyLines.length) {
    const line = firstNonEmptyLines[lineIndex]
    
    // If we hit phone or email, stop looking for address
    if (line.includes('@') || line.includes('+353')) {
      break
    }
    
    // If we hit a date, stop
    if (line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/) || 
        line.match(/\d{1,2}\s+\w+\s+\d{4}/)) {
      break
    }
    
    // This line is likely part of the address
    if (!address && line.trim()) {
      address = line
      console.log('📄 Found address at index', lineIndex, ':', address)
    }
    lineIndex++
  }
  
  // Now continue with finding phone, email, and date
  
  // Find phone
  for (const line of firstNonEmptyLines) {
    if (line.includes('+353') && !phone) {
      phone = line
      console.log('📄 Found phone:', phone)
    }
  }
  
  // Find email
  for (const line of firstNonEmptyLines) {
    if (line.includes('@') && !email) {
      email = line
      console.log('📄 Found email:', email)
    }
  }
  
  // Find date
  for (const line of firstNonEmptyLines) {
    if ((line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/) || 
        line.match(/\d{1,2}\s+\w+\s+\d{4}/) || 
        line.match(/\w+\s+\d{1,2},?\s+\d{4}/)) && !date) {
      date = line
      console.log('📄 Found date:', date)
    }
  }
  
  // Find recipient info starting from where we found the date or after header info
  let searchStartIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Hiring Manager')) {
      recipientName = lines[i]
      searchStartIndex = i
      console.log('📄 Found recipient at index:', i, recipientName)
      
      // Company is usually the next line
      if (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].startsWith('Dear')) {
        company = lines[i + 1]
        console.log('📄 Found company:', company)
      }
      
      // Company address is usually after company
      if (i + 2 < lines.length && lines[i + 2].trim() && (lines[i + 2].includes('Dublin') || lines[i + 2].includes('Ireland'))) {
        companyAddress = lines[i + 2]
        console.log('📄 Found company address:', companyAddress)
      }
      break
    }
  }
  
  // Find salutation
  const salutationIndex = lines.findIndex(line => line.trim().startsWith('Dear'))
  if (salutationIndex !== -1) {
    salutation = lines[salutationIndex]
    console.log('📄 Found salutation at index:', salutationIndex, salutation)
  }
  
  // Find closing - be more flexible with variations
  const closingPatterns = ['yours sincerely', 'sincerely', 'best regards', 'kind regards', 'regards']
  let closingIndex = -1
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const lineLower = lines[i].toLowerCase().trim()
    if (closingPatterns.some(pattern => lineLower.includes(pattern))) {
      closing = lines[i]
      closingIndex = i
      console.log('📄 Found closing at index:', closingIndex, closing)
      break
    }
  }
  
  // Extract paragraphs between salutation and closing
  if (salutationIndex !== -1 && closingIndex !== -1) {
    for (let i = salutationIndex + 1; i < closingIndex; i++) {
      if (lines[i] && lines[i].trim()) {
        paragraphs.push(lines[i])
      }
    }
  }
  
  console.log('📄 Found paragraphs:', paragraphs.length)
  
  // Get applicant name (should be after closing)
  if (closingIndex !== -1) {
    for (let i = closingIndex + 1; i < lines.length; i++) {
      if (lines[i] && lines[i].trim() && lines[i].match(/^[A-Za-z\s]+$/)) {
        applicantName = lines[i]
        console.log('📄 Found applicant name:', applicantName)
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


function highlightPlaceholders(text: string): React.ReactNode {
  // For PDF export and professional appearance, disable highlighting completely
  // Just return the text as-is without any special formatting
  return text
}
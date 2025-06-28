import { NextRequest, NextResponse } from 'next/server'
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, Packer } from 'docx'
import type { CVData } from '@/types/cv'

interface DOCXExportRequest {
  cvData: CVData
  templateId?: string
}

// Format Irish date
const formatIrishDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

// Helper function to check if a section is visible
const isSectionVisible = (sections: any[], sectionType: string) => {
  const section = sections.find(s => s.type === sectionType)
  return section?.visible ?? false
}

// Font family mapping for DOCX compatibility
const getDocxFontFamily = (fontFamily: string): string => {
  const fontMap: { [key: string]: string } = {
    'Times New Roman': 'Times New Roman',
    'Arial': 'Arial', 
    'Calibri': 'Calibri',
    'Georgia': 'Georgia',
    'Roboto': 'Roboto',
    'Inter': 'Inter',
    'Open Sans': 'Open Sans',
    'Lato': 'Lato',
    'Merriweather': 'Merriweather',
    'Rubik': 'Rubik'
  }
  
  return fontMap[fontFamily] || 'Times New Roman'
}

// Generate proper DOCX document
function generateDOCXDocument(cvData: CVData): Document {
  const { personal, experience, education, skills, languages, projects, certifications, interests, references, sections, designSettings } = cvData
  
  // Get font family from design settings
  const fontFamily = getDocxFontFamily(designSettings?.fontFamily || 'Times New Roman')
  const fontSize = designSettings?.fontSize || 10
  
  const children: (Paragraph)[] = []
  
  // Header - Name and title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personal.fullName || "Your Name",
          bold: true,
          size: 48, // 24pt
          allCaps: true,
          font: fontFamily
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  )
  
  if (personal.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personal.title,
            size: 32, // 16pt
            color: "666666",
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    )
  }
  
  // Contact information
  const contactInfo = []
  if (personal.phone) contactInfo.push(formatIrishPhone(personal.phone))
  if (personal.email) contactInfo.push(personal.email)
  if (personal.linkedin) contactInfo.push(personal.linkedin.replace('https://www.linkedin.com/in/', 'linkedin.com/in/'))
  if (personal.website) contactInfo.push(personal.website.replace('https://', ''))
  
  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(' • '),
            size: 18, // 9pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    )
  }
  
  // Address and nationality
  const addressInfo = []
  if (personal.address) addressInfo.push(personal.address)
  if (personal.nationality) addressInfo.push(personal.nationality)
  else addressInfo.push("STAMP2 | Master Student")
  
  if (addressInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${addressInfo.join(' • ')} •`,
            size: 18, // 9pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )
  }
  
  // Professional Summary
  if (personal.summary && isSectionVisible(sections, 'summary')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Summary",
            bold: true,
            size: 28, // 14pt
            underline: {
              type: UnderlineType.SINGLE
            },
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 }
      })
    )
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personal.summary,
            size: fontSize * 2, // Use design settings fontSize
            font: fontFamily
          })
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 400 }
      })
    )
  }
  
  // Professional Experience
  if (experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROFESSIONAL EXPERIENCE",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 }
      })
    )
    
    experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 22, // 11pt
              font: fontFamily
            })
          ],
          spacing: { before: 200, after: 50 }
        })
      )
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}, ${exp.location}`,
              italics: true,
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          spacing: { after: 50 }
        })
      )
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`,
              size: 18, // 9pt
              font: fontFamily
            })
          ],
          spacing: { after: 100 }
        })
      )
      
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 }
          })
        )
      }
      
      (exp.achievements || []).forEach((achievement) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${achievement}`,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 720 }, // 0.5 inch
            spacing: { after: 50 }
          })
        )
      })
    })
  }
  
  // Education
  if (education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EDUCATION",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 22, // 11pt
              font: fontFamily
            })
          ],
          spacing: { before: 200, after: 50 }
        })
      )
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution}, ${edu.location}`,
              italics: true,
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          spacing: { after: 50 }
        })
      )
      
      const eduDate = `${edu.startDate} - ${edu.current ? "Present" : edu.endDate}`
      const gradeText = edu.grade ? ` | Grade: ${edu.grade}` : ''
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: eduDate + gradeText,
              size: 18, // 9pt
              font: fontFamily
            })
          ],
          spacing: { after: edu.description ? 100 : 200 }
        })
      )
      
      if (edu.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.description,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 }
          })
        )
      }
    })
  }
  
  // Skills
  if (skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "SKILLS",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    const skillCategories = ['Technical', 'Software', 'Soft', 'Other']
    skillCategories.forEach((category) => {
      const categorySkills = skills.filter(skill => skill.category === category)
      if (categorySkills.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${category} Skills:`,
                bold: true,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            spacing: { before: 100, after: 50 }
          })
        )
        
        categorySkills.forEach(skill => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${skill.name} - ${skill.level}`,
                  size: 18, // 9pt
                  font: fontFamily
                })
              ],
              indent: { left: 360 }, // 0.25 inch
              spacing: { after: 50 }
            })
          )
        })
      }
    })
  }
  
  // Languages
  if (languages && languages.length > 0 && isSectionVisible(sections, 'languages')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "LANGUAGES",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    languages.forEach(language => {
      const certText = language.certification ? ` (${language.certification})` : ''
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${language.name}${certText} - ${language.level}`,
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          spacing: { after: 100 }
        })
      )
    })
  }
  
  // Projects
  if (projects && projects.length > 0 && isSectionVisible(sections, 'projects')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROJECTS",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    projects.forEach((project) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 22, // 11pt
              font: fontFamily
            })
          ],
          spacing: { before: 200, after: 50 }
        })
      )
      
      if ((project.technologies || []).length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${(project.technologies || []).join(', ')}`,
                size: 18, // 9pt
                color: "666666",
                font: fontFamily
              })
            ],
            spacing: { after: 50 }
          })
        )
      }
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${project.startDate} - ${project.current ? "Present" : project.endDate}`,
              size: 18, // 9pt
              font: fontFamily
            })
          ],
          spacing: { after: 100 }
        })
      )
      
      if (project.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.description,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 }
          })
        )
      }
      
      (project.achievements || []).forEach((achievement) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${achievement}`,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            indent: { left: 720 }, // 0.5 inch
            spacing: { after: 50 }
          })
        )
      })
    })
  }
  
  // Certifications
  if (certifications && certifications.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "CERTIFICATIONS",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 22, // 11pt
              font: fontFamily
            })
          ],
          spacing: { before: 200, after: 50 }
        })
      )
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.issuer,
              italics: true,
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          spacing: { after: 50 }
        })
      )
      
      if (cert.credentialId) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `ID: ${cert.credentialId}`,
                size: 18, // 9pt
                color: "666666",
                font: fontFamily
              })
            ],
            spacing: { after: 50 }
          })
        )
      }
      
      const dateText = cert.expiryDate ? `${cert.issueDate} - Expires: ${cert.expiryDate}` : cert.issueDate
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dateText,
              size: 18, // 9pt
              font: fontFamily
            })
          ],
          spacing: { after: cert.description ? 100 : 200 }
        })
      )
      
      if (cert.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.description,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 }
          })
        )
      }
    })
  }
  
  // Interests
  if (interests && interests.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "INTERESTS",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    interests.forEach(interest => {
      const descText = interest.description ? ` - ${interest.description}` : ''
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${interest.name}${descText}`,
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          spacing: { after: 100 }
        })
      )
    })
  }
  
  // References
  if (isSectionVisible(sections, 'references')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "REFERENCES",
            bold: true,
            size: 24, // 12pt
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )
    
    if (references && references.length > 0) {
      // Show detailed references
      references.forEach(reference => {
        const refText = [
          reference.name,
          reference.position,
          reference.company && `at ${reference.company}`,
          reference.email,
          reference.phone,
          reference.relationship && `(${reference.relationship})`
        ].filter(Boolean).join(' • ')
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: refText,
                size: fontSize * 2, // Use design settings fontSize
                font: fontFamily
              })
            ],
            spacing: { after: 100 }
          })
        )
      })
    } else {
      // Show default message
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "References available upon request",
              size: fontSize * 2, // Use design settings fontSize
              font: fontFamily
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      )
    }
  } else {
    // Footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "References available upon request",
            size: 16, // 8pt
            color: "666666",
            font: fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 }
      })
    )
  }
  
  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: "portrait",
            width: 11906, // A4 width in twips
            height: 16838 // A4 height in twips
          },
          margin: {
            top: 1440, // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children
    }]
  })
}

export async function POST(request: NextRequest) {
  console.log('DOCX API route called')
  
  try {
    const body = await request.json()
    console.log('DOCX API body received:', body ? 'OK' : 'Empty')
    
    const { cvData, templateId }: DOCXExportRequest = body

    // Validation
    if (!cvData || !cvData.personal) {
      console.error('DOCX API validation failed:', { cvData: !!cvData, personal: !!cvData?.personal })
      return NextResponse.json(
        { error: 'Invalid CV data provided' },
        { status: 400 }
      )
    }
    
    console.log('DOCX API validation passed for:', cvData.personal.fullName)

    // Generate DOCX document
    console.log('Generating DOCX document...')
    const doc = generateDOCXDocument(cvData)
    
    // Convert to buffer
    console.log('Converting to buffer...')
    const buffer = await Packer.toBuffer(doc)
    console.log('Buffer created, size:', buffer.length)
    
    // Set response headers for file download
    const filename = `${cvData.personal.fullName.replace(/\s+/g, '_')}_CV.docx`
    console.log('DOCX file ready:', filename)
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('DOCX Export API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `Internal server error during export: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
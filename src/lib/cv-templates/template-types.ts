// Template-specific types that extend the base CV builder types

import { 
  CvBuilderSection,
  CvBuilderExperience,
  CvBuilderEducation,
  CvBuilderCertification,
  CvBuilderLanguage,
  CvBuilderVolunteer,
  CvBuilderPublication,
  CvBuilderAward,
  CvBuilderReference
} from '@/types/cv-builder'

// Template experience with additional fields
export interface TemplateExperience extends Omit<CvBuilderExperience, 'start' | 'end'> {
  startDate: string
  endDate?: string
  location?: string
}

// Template education with additional fields
export interface TemplateEducation extends Omit<CvBuilderEducation, 'start' | 'end'> {
  startDate: string
  endDate?: string
}

// Template section with additional metadata
export type TemplateSection = 
  | { id: string; type: 'summary'; title: string; visible: boolean; content: string }
  | { id: string; type: 'experience'; title: string; visible: boolean; items: TemplateExperience[] }
  | { id: string; type: 'education'; title: string; visible: boolean; items: TemplateEducation[] }
  | { id: string; type: 'skills'; title: string; visible: boolean; items: string[] }
  | { id: string; type: 'certifications'; title: string; visible: boolean; items: CvBuilderCertification[] }
  | { id: string; type: 'languages'; title: string; visible: boolean; items: CvBuilderLanguage[] }
  | { id: string; type: 'volunteer'; title: string; visible: boolean; items: CvBuilderVolunteer[] }
  | { id: string; type: 'awards'; title: string; visible: boolean; items: CvBuilderAward[] }
  | { id: string; type: 'publications'; title: string; visible: boolean; items: CvBuilderPublication[] }
  | { id: string; type: 'references'; title: string; visible: boolean; mode: 'on-request' | 'detailed'; items: CvBuilderReference[] }

// Personal info with optional fields for templates
export interface TemplatePersonalInfo {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  address: string
  linkedin?: string
  website?: string
  github?: string
}

// Template document structure
export interface TemplateDocument {
  personalInfo: TemplatePersonalInfo
  sections: TemplateSection[]
}

// Convert template data to CV builder format
export function convertTemplateToCvBuilder(templateData: TemplateDocument): any {
  const sections: CvBuilderSection[] = []
  const sectionVisibility: Record<string, boolean> = {}

  // Convert sections
  for (const section of templateData.sections) {
    sectionVisibility[section.type] = section.visible

    switch (section.type) {
      case 'summary':
        sections.push({
          type: 'summary',
          markdown: section.content
        })
        break

      case 'experience':
        sections.push({
          type: 'experience',
          items: section.items.map(item => ({
            company: item.company,
            role: item.role,
            start: item.startDate,
            end: item.endDate || 'Present',
            bullets: item.bullets
          }))
        })
        break

      case 'education':
        sections.push({
          type: 'education',
          items: section.items.map(item => ({
            institution: item.institution,
            degree: item.degree,
            field: item.field,
            start: item.startDate,
            end: item.endDate,
            grade: item.grade
          }))
        })
        break

      case 'skills':
        sections.push({
          type: 'skills',
          items: section.items
        })
        break

      case 'certifications':
        sections.push({
          type: 'certifications',
          items: section.items
        })
        break

      case 'languages':
        sections.push({
          type: 'languages',
          items: section.items
        })
        break

      case 'volunteer':
        sections.push({
          type: 'volunteer',
          items: section.items
        })
        break

      case 'awards':
        sections.push({
          type: 'awards',
          items: section.items
        })
        break

      case 'publications':
        sections.push({
          type: 'publications',
          items: section.items
        })
        break

      case 'references':
        sections.push({
          type: 'references',
          mode: section.mode,
          items: section.items
        })
        break
    }
  }

  return {
    personal: {
      fullName: `${templateData.personalInfo.firstName} ${templateData.personalInfo.lastName}`,
      title: templateData.personalInfo.title,
      email: templateData.personalInfo.email,
      phone: templateData.personalInfo.phone,
      address: templateData.personalInfo.address
    },
    sections,
    sectionVisibility
  }
}
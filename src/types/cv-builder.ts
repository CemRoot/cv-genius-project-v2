import { z } from 'zod'

// Dublin-specific CV builder types for ATS-friendly CV generation

export interface CvBuilderPersonal {
  fullName: string
  title: string
  email: string
  phone: string   // +353 format
  address: string // Dublin, Ireland format
}

export interface CvBuilderExperience {
  company: string
  role: string
  start: string // YYYY-MM
  end?: string  // YYYY-MM | 'Present'
  bullets: string[]
}

export interface CvBuilderEducation {
  institution: string
  degree: string
  field: string
  start: string // YYYY-MM
  end?: string  // YYYY-MM | 'Present'
  grade?: string
}

export interface CvBuilderReference {
  name: string
  title: string
  company: string
  email: string
  phone: string
  relationship?: string
}

export interface CvBuilderLanguage {
  name: string
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic'
  certification?: string
}

export interface CvBuilderCertification {
  name: string
  issuer: string
  date: string // YYYY-MM
  expiryDate?: string // YYYY-MM
  credentialId?: string
}

export interface CvBuilderVolunteer {
  organization: string
  role: string
  start: string // YYYY-MM
  end?: string // YYYY-MM | 'Present'
  description: string
}

export interface CvBuilderPublication {
  title: string
  publication: string
  date: string // YYYY-MM
  url?: string
  authors?: string
}

export interface CvBuilderAward {
  name: string
  issuer: string
  date: string // YYYY-MM
  description?: string
}

export type CvBuilderSection =
  | { type: 'summary'; markdown: string }
  | { type: 'experience'; items: CvBuilderExperience[] }
  | { type: 'education'; items: CvBuilderEducation[] }
  | { type: 'skills'; items: string[] }
  | { type: 'certifications'; items: CvBuilderCertification[] }
  | { type: 'languages'; items: CvBuilderLanguage[] }
  | { type: 'volunteer'; items: CvBuilderVolunteer[] }
  | { type: 'awards'; items: CvBuilderAward[] }
  | { type: 'publications'; items: CvBuilderPublication[] }
  | { type: 'references'; mode: 'on-request' | 'detailed'; items: CvBuilderReference[] }

export interface CvBuilderDocument {
  id: string        // uuid
  updatedAt: string // ISO
  personal: CvBuilderPersonal
  sections: CvBuilderSection[]
}

// Dublin/Irish specific validations
const dublinAddressRegex = /^Dublin[\s\-,].*Ireland$/i
const irishPhoneRegex = /^\+353\s?[0-9]{1,2}\s?[0-9]{3}\s?[0-9]{4}$/
const yearMonthRegex = /^\d{4}-\d{2}$/

// Zod validation schemas
export const CvBuilderPersonalSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  title: z.string()
    .min(2, 'Professional title must be at least 2 characters')
    .max(150, 'Professional title must be less than 150 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .regex(irishPhoneRegex, 'Please enter a valid Irish phone number in format +353 XX XXX XXXX')
    .refine((phone) => {
      // Remove spaces and check if it's a valid Irish mobile or landline
      const cleaned = phone.replace(/\s/g, '')
      // Mobile numbers start with +353 8 or +353 9
      // Landline numbers start with +353 1 (Dublin), +353 21 (Cork), etc.
      return /^\+353[0-9]{8,9}$/.test(cleaned)
    }, 'Please enter a valid Irish phone number'),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .regex(dublinAddressRegex, 'Address must include Dublin and Ireland (e.g., "Dublin 2, Ireland")')
})

export const CvBuilderExperienceSchema = z.object({
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  
  role: z.string()
    .min(1, 'Job title/role is required')
    .max(100, 'Job title must be less than 100 characters'),
  
  start: z.string()
    .regex(yearMonthRegex, 'Start date must be in YYYY-MM format'),
  
  end: z.string()
    .regex(/^(\d{4}-\d{2}|Present)$/, 'End date must be in YYYY-MM format or "Present"')
    .optional(),
  
  bullets: z.array(z.string()
    .min(10, 'Achievement/responsibility must be at least 10 characters')
    .max(500, 'Achievement/responsibility must be less than 500 characters'))
    .min(1, 'At least one achievement or responsibility is required')
    .max(8, 'Maximum 8 achievements/responsibilities allowed for ATS compliance')
})

export const CvBuilderEducationSchema = z.object({
  institution: z.string()
    .min(1, 'Institution name is required')
    .max(100, 'Institution name must be less than 100 characters'),
  
  degree: z.string()
    .min(1, 'Degree/qualification name is required')
    .max(100, 'Degree name must be less than 100 characters'),
  
  field: z.string()
    .min(1, 'Field of study is required')
    .max(100, 'Field of study must be less than 100 characters'),
  
  start: z.string()
    .regex(yearMonthRegex, 'Start date must be in YYYY-MM format'),
  
  end: z.string()
    .regex(/^(\d{4}-\d{2}|Present)$/, 'End date must be in YYYY-MM format or "Present"')
    .optional(),
  
  grade: z.string()
    .max(50, 'Grade must be less than 50 characters')
    .optional()
})

export const CvBuilderReferenceSchema = z.object({
  name: z.string()
    .min(2, 'Reference name must be at least 2 characters')
    .max(100, 'Reference name must be less than 100 characters'),
  
  title: z.string()
    .min(2, 'Reference title must be at least 2 characters')
    .max(100, 'Reference title must be less than 100 characters'),
  
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .regex(irishPhoneRegex, 'Please enter a valid Irish phone number in format +353 XX XXX XXXX'),
  
  relationship: z.string()
    .max(100, 'Relationship must be less than 100 characters')
    .optional()
})

export const CvBuilderLanguageSchema = z.object({
  name: z.string()
    .min(2, 'Language name must be at least 2 characters')
    .max(50, 'Language name must be less than 50 characters'),
  
  proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']),
  
  certification: z.string()
    .max(100, 'Certification must be less than 100 characters')
    .optional()
})

export const CvBuilderCertificationSchema = z.object({
  name: z.string()
    .min(2, 'Certification name must be at least 2 characters')
    .max(150, 'Certification name must be less than 150 characters'),
  
  issuer: z.string()
    .min(2, 'Issuer name must be at least 2 characters')
    .max(100, 'Issuer name must be less than 100 characters'),
  
  date: z.string()
    .regex(yearMonthRegex, 'Date must be in YYYY-MM format'),
  
  expiryDate: z.string()
    .regex(yearMonthRegex, 'Expiry date must be in YYYY-MM format')
    .optional(),
  
  credentialId: z.string()
    .max(100, 'Credential ID must be less than 100 characters')
    .optional()
})

export const CvBuilderVolunteerSchema = z.object({
  organization: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  
  role: z.string()
    .min(2, 'Role must be at least 2 characters')
    .max(100, 'Role must be less than 100 characters'),
  
  start: z.string()
    .regex(yearMonthRegex, 'Start date must be in YYYY-MM format'),
  
  end: z.string()
    .regex(/^(\d{4}-\d{2}|Present)$/, 'End date must be in YYYY-MM format or "Present"')
    .optional(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description must be less than 300 characters')
})

export const CvBuilderPublicationSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  publication: z.string()
    .min(2, 'Publication name must be at least 2 characters')
    .max(150, 'Publication name must be less than 150 characters'),
  
  date: z.string()
    .regex(yearMonthRegex, 'Date must be in YYYY-MM format'),
  
  url: z.string()
    .url('Must be a valid URL')
    .max(200, 'URL must be less than 200 characters')
    .optional(),
  
  authors: z.string()
    .max(200, 'Authors must be less than 200 characters')
    .optional()
})

export const CvBuilderAwardSchema = z.object({
  name: z.string()
    .min(2, 'Award name must be at least 2 characters')
    .max(150, 'Award name must be less than 150 characters'),
  
  issuer: z.string()
    .min(2, 'Issuer name must be at least 2 characters')
    .max(100, 'Issuer name must be less than 100 characters'),
  
  date: z.string()
    .regex(yearMonthRegex, 'Date must be in YYYY-MM format'),
  
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional()
})

export const CvBuilderSectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('summary'),
    markdown: z.string()
      .min(50, 'Professional summary must be at least 50 characters')
      .max(1000, 'Professional summary must be less than 1000 characters for ATS compliance')
  }),
  z.object({
    type: z.literal('experience'),
    items: z.array(CvBuilderExperienceSchema)
      .min(1, 'At least one work experience entry is required')
      .max(10, 'Maximum 10 work experiences for ATS compliance')
  }),
  z.object({
    type: z.literal('education'),
    items: z.array(CvBuilderEducationSchema)
      .min(1, 'At least one education entry is required')
      .max(5, 'Maximum 5 education entries for ATS compliance')
  }),
  z.object({
    type: z.literal('skills'),
    items: z.array(z.string()
      .min(2, 'Skill must be at least 2 characters')
      .max(50, 'Skill must be less than 50 characters'))
      .min(3, 'At least 3 skills are required')
      .max(20, 'Maximum 20 skills for ATS compliance')
  }),
  z.object({
    type: z.literal('certifications'),
    items: z.array(CvBuilderCertificationSchema)
      .max(10, 'Maximum 10 certifications allowed')
  }),
  z.object({
    type: z.literal('languages'),
    items: z.array(CvBuilderLanguageSchema)
      .max(8, 'Maximum 8 languages allowed')
  }),
  z.object({
    type: z.literal('volunteer'),
    items: z.array(CvBuilderVolunteerSchema)
      .max(5, 'Maximum 5 volunteer experiences allowed')
  }),
  z.object({
    type: z.literal('awards'),
    items: z.array(CvBuilderAwardSchema)
      .max(6, 'Maximum 6 awards allowed')
  }),
  z.object({
    type: z.literal('publications'),
    items: z.array(CvBuilderPublicationSchema)
      .max(10, 'Maximum 10 publications allowed')
  }),
  z.object({
    type: z.literal('references'),
    mode: z.enum(['on-request', 'detailed']),
    items: z.array(CvBuilderReferenceSchema)
      .max(4, 'Maximum 4 references allowed')
  })
])

export const CvBuilderDocumentSchema = z.object({
  id: z.string().uuid('Invalid document ID format'),
  
  updatedAt: z.string()
    .datetime('Invalid timestamp format'),
  
  personal: CvBuilderPersonalSchema,
  
  sections: z.array(CvBuilderSectionSchema)
    .min(3, 'CV must include at least 3 sections (summary, experience, education)')
    .max(6, 'Maximum 6 sections allowed for ATS compliance')
    .refine((sections) => {
      const types = sections.map(s => s.type)
      return types.includes('summary') && types.includes('experience') && types.includes('education')
    }, 'CV must include summary, experience, and education sections')
})

// Dublin/Irish specific validation helpers
export const validateIrishPhone = (phone: string): boolean => {
  try {
    return CvBuilderPersonalSchema.shape.phone.parse(phone) ? true : false
  } catch {
    return false
  }
}

export const validateDublinAddress = (address: string): boolean => {
  try {
    return CvBuilderPersonalSchema.shape.address.parse(address) ? true : false
  } catch {
    return false
  }
}

export const formatIrishPhone = (phone: string): string => {
  // Clean phone number and format it consistently
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('+353')) {
    const digits = cleaned.substring(4)
    if (digits.length === 8) {
      // Mobile format: +353 XX XXX XXXX
      return `+353 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`
    } else if (digits.length === 7 || digits.length === 9) {
      // Landline formats: +353 X XXX XXXX or +353 XX XXX XXXX
      const areaCode = digits.substring(0, digits.length - 7)
      const number = digits.substring(digits.length - 7)
      return `+353 ${areaCode} ${number.substring(0, 3)} ${number.substring(3)}`
    }
  }
  
  return phone // Return original if can't format
}

// ATS compliance utilities
export const atsCompliantSectionOrder = [
  'summary', 
  'experience', 
  'education', 
  'skills', 
  'certifications',
  'languages',
  'volunteer',
  'awards',
  'publications',
  'references'
] as const

export const isAtsCompliant = (document: CvBuilderDocument): { compliant: boolean; issues: string[] } => {
  const issues: string[] = []
  
  // Check section order
  const sectionTypes = document.sections.map(s => s.type)
  const expectedOrder = atsCompliantSectionOrder.filter(type => sectionTypes.includes(type))
  
  for (let i = 0; i < expectedOrder.length; i++) {
    const expectedType = expectedOrder[i]
    const actualIndex = sectionTypes.indexOf(expectedType)
    if (actualIndex !== i && actualIndex !== -1) {
      issues.push(`Section '${expectedType}' should appear earlier in the CV for better ATS parsing`)
    }
  }
  
  // Check bullet point length for experience
  document.sections.forEach(section => {
    if (section.type === 'experience') {
      section.items.forEach((exp, index) => {
        if (exp.bullets.length > 6) {
          issues.push(`Experience "${exp.company}" has too many bullet points (${exp.bullets.length}). Limit to 6 for ATS compliance.`)
        }
        exp.bullets.forEach((bullet, bulletIndex) => {
          if (bullet.length > 200) {
            issues.push(`Experience "${exp.company}", bullet ${bulletIndex + 1} is too long. Keep under 200 characters for ATS compliance.`)
          }
        })
      })
    }
  })
  
  return {
    compliant: issues.length === 0,
    issues
  }
}

// Default CV builder document
export const createDefaultCvBuilderDocument = (): CvBuilderDocument => ({
  id: crypto.randomUUID(),
  updatedAt: new Date().toISOString(),
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '+353 ',
    address: 'Dublin, Ireland'
  },
  sections: [
    { type: 'summary', markdown: '' },
    { type: 'experience', items: [] },
    { type: 'education', items: [] },
    { type: 'skills', items: [] },
    { type: 'certifications', items: [] },
    { type: 'languages', items: [] },
    { type: 'references', mode: 'on-request', items: [] }
  ]
})
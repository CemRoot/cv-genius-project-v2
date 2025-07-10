export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  linkedin?: string
  website?: string
  github?: string
  portfolio?: string
  summary?: string
  title?: string
  nationality?: string
  stamp?: string  // Irish work authorization stamp (e.g., "Stamp 4", "EU Citizen")
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  achievements: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  grade?: string
  description?: string
}

export interface Skill {
  id: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  category: 'Technical' | 'Software' | 'Soft' | 'Other'
}

export interface Language {
  id: string
  name: string
  level: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic'
  certification?: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  startDate: string
  endDate?: string
  current: boolean
  url?: string
  github?: string
  achievements: string[]
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  url?: string
  description?: string
}

export interface Interest {
  id: string
  name: string
  category?: 'Sports' | 'Arts' | 'Technology' | 'Volunteering' | 'Travel' | 'Other'
  description?: string
}

export interface Reference {
  id: string
  name: string
  position: string
  company: string
  email: string
  phone: string
  relationship: string
}

export interface CVSection {
  id: string
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'interests' | 'references'
  title: string
  visible: boolean
  order: number
}

export interface DesignSettings {
  margins: number // in inches
  sectionSpacing: 'tight' | 'normal' | 'relaxed' | 'spacious'
  headerSpacing: 'compact' | 'normal' | 'generous'
  fontFamily: string
  fontSize: number // in pt
  lineHeight: number
}

export interface CVData {
  id: string
  personal: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  languages?: Language[]
  projects?: Project[]
  certifications?: Certification[]
  interests?: Interest[]
  references?: Reference[]
  referencesDisplay?: 'available-on-request' | 'detailed'
  designSettings?: DesignSettings
  sections: CVSection[]
  template: string
  lastModified: string
  version: number
}

// Type alias for compatibility
export type CV = CVData

export interface ATSScore {
  overall: number
  keywordMatch: number
  formatting: number
  sections: number
  suggestions: string[]
  missingKeywords: string[]
}

export interface CoverLetterTemplate {
  id: string
  name: string
  description: string
  tone: 'Professional' | 'Creative' | 'Friendly' | 'Formal'
  template: string
}

export type CVTemplate = 'harvard' | 'modern' | 'creative' | 'executive' | 'graduate' | 'tech'
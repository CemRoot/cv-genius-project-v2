export interface CVTemplate {
  id: string
  name: string
  description: string
  image?: string
  category: 'professional' | 'creative' | 'modern' | 'executive' | 'technical'
  features: string[]
  isPremium?: boolean
  isDefault?: boolean
}

export const templates: Record<string, CVTemplate> = {
  harvard: {
    id: 'harvard',
    name: 'Harvard Professional',
    description: 'Classic and professional template inspired by Harvard Business School',
    category: 'professional',
    features: ['ATS-Optimized', 'Clean Layout', 'Professional'],
    isDefault: true
  },
  modern: {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean and contemporary design perfect for tech professionals',
    category: 'modern',
    features: ['Minimalist', 'Tech-Focused', 'Clean Typography']
  },
  executive: {
    id: 'executive',
    name: 'Executive Premium',
    description: 'Sophisticated design for senior professionals and executives',
    category: 'executive',
    features: ['Premium Design', 'Executive Style', 'Elegant Layout'],
    isPremium: true
  },
  creative: {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Stand out with a unique design perfect for creative professionals',
    category: 'creative',
    features: ['Creative Layout', 'Portfolio Ready', 'Eye-catching']
  },
  technical: {
    id: 'technical',
    name: 'Technical Expert',
    description: 'Optimized for technical roles with focus on skills and projects',
    category: 'technical',
    features: ['Skills Focused', 'Project Showcase', 'Technical Layout']
  },
  dublin: {
    id: 'dublin',
    name: 'Dublin Professional',
    description: 'Tailored for the Irish job market with local formatting standards',
    category: 'professional',
    features: ['Irish Market', 'EU Format', 'Dublin Optimized']
  },
  'dublin-tech': {
    id: 'dublin-tech',
    name: 'Dublin Tech Professional',
    description: 'Optimized for Dublin\'s thriving tech scene - perfect for Google, Meta, LinkedIn',
    category: 'modern',
    features: ['Dublin Tech Focus', 'ATS-Optimized', 'EU Format']
  },
  'irish-finance': {
    id: 'irish-finance',
    name: 'Irish Finance Expert',
    description: 'Tailored for IFSC roles - ideal for banking, fintech, and insurance',
    category: 'professional',
    features: ['IFSC Standard', 'Finance Focus', 'Regulatory Ready']
  },
  'dublin-pharma': {
    id: 'dublin-pharma',
    name: 'Dublin Pharma Professional',
    description: 'Perfect for Ireland\'s pharmaceutical and medical device industry',
    category: 'technical',
    features: ['Pharma Format', 'GMP Ready', 'Technical Skills']
  },
  'irish-graduate': {
    id: 'irish-graduate',
    name: 'Irish Graduate CV',
    description: 'Ideal for graduates from Trinity, UCD, DCU - follows Irish academic standards',
    category: 'professional',
    features: ['Graduate Friendly', 'Academic Focus', 'Entry Level']
  },
  'dublin-creative': {
    id: 'dublin-creative',
    name: 'Dublin Creative Industries',
    description: 'For creative professionals in Dublin\'s digital media and advertising sector',
    category: 'creative',
    features: ['Portfolio Ready', 'Creative Layout', 'Visual Impact']
  },
  'irish-healthcare': {
    id: 'irish-healthcare',
    name: 'HSE Healthcare Professional',
    description: 'Formatted for HSE and Irish healthcare sector applications',
    category: 'professional',
    features: ['HSE Format', 'Medical Focus', 'NMBI Ready']
  },
  'dublin-hospitality': {
    id: 'dublin-hospitality',
    name: 'Dublin Hospitality Pro',
    description: 'Perfect for Dublin\'s hospitality and tourism industry',
    category: 'modern',
    features: ['Service Focus', 'Multi-lingual', 'Tourism Ready']
  },
  'irish-construction': {
    id: 'irish-construction',
    name: 'Irish Construction & Engineering',
    description: 'Ideal for construction, engineering, and infrastructure roles in Ireland',
    category: 'technical',
    features: ['Safe Pass Ready', 'Technical Skills', 'Project Focus']
  },
  'dublin-startup': {
    id: 'dublin-startup',
    name: 'Dublin Startup Specialist',
    description: 'For the Dublin startup ecosystem - shows innovation and versatility',
    category: 'modern',
    features: ['Startup Ready', 'Multi-role', 'Innovation Focus'],
    isPremium: true
  },
  'irish-executive': {
    id: 'irish-executive',
    name: 'Irish Executive Leader',
    description: 'For C-suite and senior management positions in Irish companies',
    category: 'executive',
    features: ['Executive Level', 'Board Ready', 'Leadership Focus'],
    isPremium: true
  },
  'dublin-retail': {
    id: 'dublin-retail',
    name: 'Dublin Retail Professional',
    description: 'Optimized for retail management and customer service roles',
    category: 'professional',
    features: ['Retail Focus', 'Customer Service', 'Sales Metrics']
  },
  'irish-education': {
    id: 'irish-education',
    name: 'Irish Education Professional',
    description: 'For teachers and education professionals - Teaching Council compliant',
    category: 'professional',
    features: ['Teaching Council', 'Education Focus', 'Garda Vetting']
  }
}

export const templateCategories = {
  professional: { name: 'Professional', color: 'blue' },
  creative: { name: 'Creative', color: 'purple' },
  modern: { name: 'Modern', color: 'green' },
  executive: { name: 'Executive', color: 'orange' },
  technical: { name: 'Technical', color: 'gray' }
} as const

export function getTemplateById(id: string): CVTemplate | undefined {
  return templates[id]
}

export function getTemplatesByCategory(category: CVTemplate['category']): CVTemplate[] {
  return Object.values(templates).filter(template => template.category === category)
}

export function getFreeTemplates(): CVTemplate[] {
  return Object.values(templates).filter(template => !template.isPremium)
}

export function getPremiumTemplates(): CVTemplate[] {
  return Object.values(templates).filter(template => template.isPremium)
}
export interface SectionConfig {
  id: string
  label: string
  defaultVisible: boolean
  priority: 'essential' | 'important' | 'optional' | 'academic'
  order: number
}

export const CV_SECTION_ORDER: SectionConfig[] = [
  { id: 'personal', label: 'Personal Info', defaultVisible: true, priority: 'essential', order: 1 },
  { id: 'summary', label: 'Professional Summary', defaultVisible: true, priority: 'essential', order: 2 },
  { id: 'experience', label: 'Work Experience', defaultVisible: true, priority: 'essential', order: 3 },
  { id: 'education', label: 'Education', defaultVisible: true, priority: 'essential', order: 4 },
  { id: 'skills', label: 'Skills & Competencies', defaultVisible: true, priority: 'essential', order: 5 },
  { id: 'certifications', label: 'Certifications & Licenses', defaultVisible: true, priority: 'important', order: 6 },
  { id: 'languages', label: 'Languages', defaultVisible: false, priority: 'optional', order: 7 },
  { id: 'awards', label: 'Awards & Achievements', defaultVisible: false, priority: 'optional', order: 8 },
  { id: 'publications', label: 'Publications & Research', defaultVisible: false, priority: 'academic', order: 9 },
  { id: 'volunteer', label: 'Volunteer Experience', defaultVisible: false, priority: 'optional', order: 10 },
  { id: 'references', label: 'References', defaultVisible: false, priority: 'optional', order: 11 }
]

export function getOrderedSections(sectionVisibility?: Record<string, boolean>) {
  return CV_SECTION_ORDER
    .filter(section => {
      const isVisible = sectionVisibility?.[section.id] ?? section.defaultVisible
      return isVisible
    })
    .sort((a, b) => a.order - b.order)
}

export function getSectionConfig(sectionId: string): SectionConfig | undefined {
  return CV_SECTION_ORDER.find(section => section.id === sectionId)
}

export function getSectionLabel(sectionId: string): string {
  const config = getSectionConfig(sectionId)
  return config?.label || sectionId
}

export function groupSectionsByPriority() {
  const groups = {
    essential: CV_SECTION_ORDER.filter(s => s.priority === 'essential'),
    important: CV_SECTION_ORDER.filter(s => s.priority === 'important'),
    optional: CV_SECTION_ORDER.filter(s => s.priority === 'optional'),
    academic: CV_SECTION_ORDER.filter(s => s.priority === 'academic')
  }
  return groups
} 
'use client'

import React from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { PersonalInfoForm } from './forms/personal-info-form'
import { SummaryForm } from './forms/summary-form'
import { ExperienceForm } from './forms/experience-form'
import { EducationForm } from './forms/education-form'
import { SkillsForm } from './forms/skills-form'
import { CertificationsForm } from './forms/certifications-form'
import { LanguagesForm } from './forms/languages-form'
import { VolunteerForm } from './forms/volunteer-form'
import { AwardsForm } from './forms/awards-form'
import { PublicationsForm } from './forms/publications-form'
import { ReferencesForm } from './forms/references-form'

type SectionKey = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'volunteer' | 'awards' | 'publications' | 'references'

interface CvBuilderSidebarProps {
  activeSection: SectionKey
  onSectionChange: (section: SectionKey) => void
}

const sections = [
  { key: 'personal' as const, label: 'Personal Info', icon: '👤', description: 'Contact details' },
  { key: 'summary' as const, label: 'Summary', icon: '📝', description: 'Career overview' },
  { key: 'experience' as const, label: 'Experience', icon: '💼', description: 'Work history' },
  { key: 'education' as const, label: 'Education', icon: '🎓', description: 'Academic background' },
  { key: 'skills' as const, label: 'Skills', icon: '🔧', description: 'Technical skills' },
  { key: 'certifications' as const, label: 'Certifications', icon: '📜', description: 'Professional certs' },
  { key: 'languages' as const, label: 'Languages', icon: '🌍', description: 'Language skills' },
  { key: 'volunteer' as const, label: 'Volunteer', icon: '🤝', description: 'Community service' },
  { key: 'awards' as const, label: 'Awards', icon: '🏆', description: 'Achievements' },
  { key: 'publications' as const, label: 'Publications', icon: '📚', description: 'Published works' },
  { key: 'references' as const, label: 'References', icon: '📞', description: 'Professional refs' }
]

export function CvBuilderSidebar({ activeSection, onSectionChange }: CvBuilderSidebarProps) {
  const { document, toggleSectionVisibility } = useCvBuilder()
  const sectionVisibility = document.sectionVisibility || {}

  const handleToggleVisibility = (sectionKey: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent section change when clicking toggle
    const currentVisibility = sectionVisibility[sectionKey as keyof typeof sectionVisibility] ?? true
    toggleSectionVisibility(sectionKey, !currentVisibility)
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Section Navigation - Compact */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CV Sections</h3>
        <nav className="space-y-2">
          {sections.map((section) => {
            const isVisible = section.key === 'personal' ? true : (sectionVisibility[section.key as keyof typeof sectionVisibility] ?? true)
            
            return (
              <button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === section.key
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                } ${!isVisible && section.key !== 'personal' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                  
                  {/* Toggle switch for non-personal sections */}
                  {section.key !== 'personal' && (
                    <div className="flex items-center ml-2">
                      <button
                        onClick={(e) => handleToggleVisibility(section.key, e)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isVisible ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={isVisible}
                        aria-label={`Toggle ${section.label} visibility`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isVisible ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                  
                  {activeSection === section.key && (
                    <div className="flex items-center ml-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Active Section Content - Compact */}
      <div className="px-6 py-6">
        {activeSection === 'personal' && <PersonalInfoForm />}
        {activeSection === 'summary' && <SummaryForm />}
        {activeSection === 'experience' && <ExperienceForm />}
        {activeSection === 'education' && <EducationForm />}
        {activeSection === 'skills' && <SkillsForm />}
        {activeSection === 'certifications' && <CertificationsForm />}
        {activeSection === 'languages' && <LanguagesForm />}
        {activeSection === 'volunteer' && <VolunteerForm />}
        {activeSection === 'awards' && <AwardsForm />}
        {activeSection === 'publications' && <PublicationsForm />}
        {activeSection === 'references' && <ReferencesForm />}
      </div>
    </div>
  )
}
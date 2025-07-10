'use client'

import React from 'react'
import { PersonalInfoForm } from './forms/personal-info-form'
import { SummaryForm } from './forms/summary-form'
import { ExperienceForm } from './forms/experience-form'
import { EducationForm } from './forms/education-form'
import { SkillsForm } from './forms/skills-form'
import { ReferencesForm } from './forms/references-form'

interface CvBuilderSidebarProps {
  activeSection: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'references'
  onSectionChange: (section: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'references') => void
}

const sections = [
  { key: 'personal' as const, label: 'Personal Info', icon: '👤', description: 'Contact details and basic information' },
  { key: 'summary' as const, label: 'Professional Summary', icon: '📝', description: 'Brief overview of your career' },
  { key: 'experience' as const, label: 'Work Experience', icon: '💼', description: 'Your professional background' },
  { key: 'education' as const, label: 'Education', icon: '🎓', description: 'Academic qualifications' },
  { key: 'skills' as const, label: 'Skills', icon: '🔧', description: 'Technical and soft skills' },
  { key: 'references' as const, label: 'References', icon: '📞', description: 'Professional references' }
]

export function CvBuilderSidebar({ activeSection, onSectionChange }: CvBuilderSidebarProps) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Section Navigation - Compact */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CV Sections</h3>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeSection === section.key
                  ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{section.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
                {activeSection === section.key && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content - Compact */}
      <div className="px-6 py-6">
        {activeSection === 'personal' && <PersonalInfoForm />}
        {activeSection === 'summary' && <SummaryForm />}
        {activeSection === 'experience' && <ExperienceForm />}
        {activeSection === 'education' && <EducationForm />}
        {activeSection === 'skills' && <SkillsForm />}
        {activeSection === 'references' && <ReferencesForm />}
      </div>
    </div>
  )
}
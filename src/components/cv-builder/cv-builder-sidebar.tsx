'use client'

import React from 'react'
import { PersonalInfoForm } from './forms/personal-info-form'
import { SummaryForm } from './forms/summary-form'
import { ExperienceForm } from './forms/experience-form'
import { EducationForm } from './forms/education-form'
import { SkillsForm } from './forms/skills-form'

interface CvBuilderSidebarProps {
  activeSection: 'personal' | 'summary' | 'experience' | 'education' | 'skills'
  onSectionChange: (section: 'personal' | 'summary' | 'experience' | 'education' | 'skills') => void
}

const sections = [
  { key: 'personal' as const, label: 'Personal Info', icon: '👤', description: 'Contact details and basic information' },
  { key: 'summary' as const, label: 'Professional Summary', icon: '📝', description: 'Brief overview of your career' },
  { key: 'experience' as const, label: 'Work Experience', icon: '💼', description: 'Your professional background' },
  { key: 'education' as const, label: 'Education', icon: '🎓', description: 'Academic qualifications' },
  { key: 'skills' as const, label: 'Skills', icon: '🔧', description: 'Technical and soft skills' }
]

export function CvBuilderSidebar({ activeSection, onSectionChange }: CvBuilderSidebarProps) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CV Sections</h3>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeSection === section.key
                  ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{section.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-sm text-gray-500">{section.description}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <div className="p-6">
        {activeSection === 'personal' && <PersonalInfoForm />}
        {activeSection === 'summary' && <SummaryForm />}
        {activeSection === 'experience' && <ExperienceForm />}
        {activeSection === 'education' && <EducationForm />}
        {activeSection === 'skills' && <SkillsForm />}
      </div>
    </div>
  )
}
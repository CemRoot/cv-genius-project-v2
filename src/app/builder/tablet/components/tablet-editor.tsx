'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { ProfessionalSummaryForm } from '@/components/forms/professional-summary-form'
import { ExperienceForm } from '@/components/forms/experience-form'
import { EducationForm } from '@/components/forms/education-form'
import { SkillsForm } from '@/components/forms/skills-form'
import { LanguagesForm } from '@/components/forms/languages-form'
import { LinksForm } from '@/components/forms/links-form'
import { ResponsiveContainer } from '@/components/responsive/responsive-container'
import { useResponsive } from '@/hooks/use-responsive'

interface TabletEditorProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sectionComponents = {
  personal: PersonalInfoForm,
  summary: ProfessionalSummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  languages: LanguagesForm,
  links: LinksForm
}

export function TabletEditor({ activeSection, onSectionChange }: TabletEditorProps) {
  const { orientation } = useResponsive()
  const ActiveComponent = sectionComponents[activeSection as keyof typeof sectionComponents]

  if (!ActiveComponent) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Section not found</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer className="p-6" maxWidth="2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6">
            <ActiveComponent />
          </Card>

          {/* Section navigation buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                const sections = Object.keys(sectionComponents)
                const currentIndex = sections.indexOf(activeSection)
                if (currentIndex > 0) {
                  onSectionChange(sections[currentIndex - 1])
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Previous Section
            </button>

            <button
              onClick={() => {
                const sections = Object.keys(sectionComponents)
                const currentIndex = sections.indexOf(activeSection)
                if (currentIndex < sections.length - 1) {
                  onSectionChange(sections[currentIndex + 1])
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Next Section →
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </ResponsiveContainer>
  )
}
"use client"

import { useState, useEffect, useRef } from "react"
import { PersonalInfoForm } from "@/components/forms/personal-info-form"
import { ProfessionalSummaryForm } from "@/components/forms/professional-summary-form"
import { ExperienceForm } from "@/components/forms/experience-form"
import { EducationForm } from "@/components/forms/education-form"
import { SkillsForm } from "@/components/forms/skills-form"
import { LanguagesForm } from "@/components/forms/languages-form"
import { ProjectsForm } from "@/components/forms/projects-form"
import { CertificationsForm } from "@/components/forms/certifications-form"
import { InterestsForm } from "@/components/forms/interests-form"
import { ReferencesForm } from "@/components/forms/references-form"
import { DesignControls } from "@/components/cv-builder/design-controls/design-controls"
import { Button } from "@/components/ui/button"
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator"
import { Switch } from "@/components/ui/switch"
import { Plus, ChevronDown, ChevronRight, GripVertical, Eye, EyeOff, Settings } from "lucide-react"
import { useCVStore } from "@/store/cv-store"
import { useAutoSave } from "@/hooks/use-auto-save"
import { motion, AnimatePresence } from "framer-motion"

export function CVEditor() {
  const { currentCV, activeSection, setActiveSection, performAutoSave, autoSaveEnabled, autoSaveInterval, lastAutoSave, updateSection } = useCVStore()
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal', 'experience', 'references'])
  const [showSectionManager, setShowSectionManager] = useState(false)
  const sectionManagerRef = useRef<HTMLDivElement>(null)

  // Fix missing sections
  const fixMissingSections = () => {
    const requiredSections = [
      { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
      { id: '2', type: 'summary', title: 'Professional Summary', visible: false, order: 2 },
      { id: '3', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
      { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
      { id: '5', type: 'skills', title: 'Skills', visible: false, order: 5 },
      { id: '6', type: 'languages', title: 'Languages', visible: false, order: 6 },
      { id: '7', type: 'projects', title: 'Projects', visible: false, order: 7 },
      { id: '8', type: 'certifications', title: 'Certifications', visible: false, order: 8 },
      { id: '9', type: 'interests', title: 'Interests & Hobbies', visible: false, order: 9 },
      { id: '10', type: 'references', title: 'References', visible: false, order: 10 },
    ]
    
    // Check if we need to add missing sections
    requiredSections.forEach(reqSection => {
      const exists = currentCV.sections.find(s => s.type === reqSection.type)
      if (!exists) {
        // We would need a different approach here since we can't add sections this way
      }
    })
  }

  // Fix sections on component mount and when CV changes
  useEffect(() => {
    fixMissingSections()
    // Reset expanded sections when CV changes (e.g., from examples)
    const hasValidSections = currentCV.sections && currentCV.sections.length > 0
    if (hasValidSections) {
      setExpandedSections(['personal', 'experience'])
    }
  }, [currentCV.id])
  
  const { isSaving, lastSaved, saveCount, scheduleAutoSave } = useAutoSave({
    onSave: performAutoSave,
    delay: autoSaveInterval,
    enabled: autoSaveEnabled
  })

  // Close section manager when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionManagerRef.current && !sectionManagerRef.current.contains(event.target as Node)) {
        setShowSectionManager(false)
      }
    }

    if (showSectionManager) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSectionManager])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const toggleSectionVisibility = (sectionId: string, visible: boolean) => {
    const section = currentCV.sections.find(s => s.type === sectionId)
    if (section) {
      updateSection(section.id, { visible })
    }
  }

  const getSectionVisibility = (sectionType: string) => {
    const section = currentCV.sections.find(s => s.type === sectionType)
    return section?.visible ?? false
  }

  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      component: PersonalInfoForm,
      required: true
    },
    {
      id: 'summary',
      title: 'Professional Summary',
      component: ProfessionalSummaryForm,
      required: false
    },
    {
      id: 'experience',
      title: 'Work Experience',
      component: ExperienceForm,
      required: true
    },
    {
      id: 'education',
      title: 'Education',
      component: EducationForm,
      required: true
    },
    {
      id: 'skills',
      title: 'Skills',
      component: SkillsForm,
      required: false
    },
    {
      id: 'languages',
      title: 'Languages',
      component: LanguagesForm,
      required: false
    },
    {
      id: 'projects',
      title: 'Projects',
      component: ProjectsForm,
      required: false
    },
    {
      id: 'certifications',
      title: 'Certifications',
      component: CertificationsForm,
      required: false
    },
    {
      id: 'interests',
      title: 'Interests & Hobbies',
      component: InterestsForm,
      required: false
    },
    {
      id: 'references',
      title: 'References',
      component: ReferencesForm,
      required: false
    },
    {
      id: 'design',
      title: 'Design Controls',
      component: DesignControls,
      required: false
    }
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Edit Your CV</h2>
          <AutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            saveCount={saveCount}
          />
        </div>
        <div className="relative" ref={sectionManagerRef}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSectionManager(!showSectionManager)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Sections
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showSectionManager ? 'rotate-180' : ''}`} />
          </Button>
          
          {showSectionManager && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10 p-4">
              <h3 className="font-medium mb-3">Show/Hide CV Sections</h3>
              <div className="space-y-3">
                {sections.filter(s => !s.required && s.id !== 'design').map((section) => {
                  const isVisible = getSectionVisibility(section.id)
                  return (
                    <div key={section.id} className="flex items-center justify-between">
                      <label className="text-sm font-medium">{section.title}</label>
                      <Switch 
                        checked={isVisible}
                        onCheckedChange={(checked) => {
                          toggleSectionVisibility(section.id, checked)
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                Toggle sections on/off to customize your CV layout
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          // Always show required sections, check visibility for optional ones
          // Design Controls should always be visible
          const shouldShow = section.required || section.id === 'design' || getSectionVisibility(section.id)
          
          if (!shouldShow) {
            return null
          }
          
          const isExpanded = expandedSections.includes(section.id)
          const Component = section.component

          return (
            <motion.div
              key={section.id}
              layout
              className="border rounded-lg bg-card"
            >
              {/* Section Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {section.title}
                      {section.required && (
                        <span className="text-xs bg-cvgenius-purple/10 text-cvgenius-purple px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.id === 'personal' && 'Your contact details and basic information'}
                      {section.id === 'experience' && `${currentCV.experience.length} entries`}
                      {section.id === 'education' && `${currentCV.education.length} entries`}
                      {section.id === 'skills' && `${currentCV.skills.length} skills`}
                      {section.id === 'languages' && `${(currentCV.languages || []).length} languages`}
                      {section.id === 'projects' && `${(currentCV.projects || []).length} projects`}
                      {section.id === 'certifications' && `${(currentCV.certifications || []).length} certifications`}
                      {section.id === 'interests' && `${(currentCV.interests || []).length} interests`}
                      {section.id === 'summary' && 'Brief overview of your professional background'}
                      {section.id === 'design' && 'Control page layout and styling'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {section.id === activeSection && (
                    <div className="w-2 h-2 bg-cvgenius-purple rounded-full"></div>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </div>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t">
                      <Component />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">✅ Irish CV Tips</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Keep your CV to 2 pages maximum</li>
          <li>• Don't include a photo (GDPR compliance)</li>
          <li>• Mention your work authorization status</li>
          <li>• Use Irish date format (DD/MM/YYYY)</li>
        </ul>
      </div>
    </div>
  )
}
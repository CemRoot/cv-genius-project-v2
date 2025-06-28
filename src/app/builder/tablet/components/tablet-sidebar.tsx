'use client'

import { motion } from 'framer-motion'
import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages,
  Link,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCVStore } from '@/store/cv-store'

interface TabletSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isCollapsed: boolean
}

const sections = [
  {
    id: 'personal',
    title: 'Personal Info',
    icon: User,
    required: true
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    icon: FileText,
    required: false
  },
  {
    id: 'experience',
    title: 'Work Experience',
    icon: Briefcase,
    required: true
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    required: true
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: Award,
    required: true
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: Languages,
    required: false
  },
  {
    id: 'links',
    title: 'Links & Portfolio',
    icon: Link,
    required: false
  }
]

export function TabletSidebar({ activeSection, onSectionChange, isCollapsed }: TabletSidebarProps) {
  const { currentCV } = useCVStore()

  // Calculate completion for each section
  const getSectionCompletion = (sectionId: string): number => {
    if (!currentCV) return 0

    switch (sectionId) {
      case 'personal':
        const personalFields = ['fullName', 'email', 'phone', 'address']
        const filledPersonal = personalFields.filter(field => currentCV.personal?.[field as keyof typeof currentCV.personal])
        return (filledPersonal.length / personalFields.length) * 100

      case 'summary':
        return currentCV.personal?.summary ? 100 : 0

      case 'experience':
        return currentCV.experience && currentCV.experience.length > 0 ? 100 : 0

      case 'education':
        return currentCV.education && currentCV.education.length > 0 ? 100 : 0

      case 'skills':
        return currentCV.skills && currentCV.skills.length > 0 ? 100 : 0

      case 'languages':
        return currentCV.languages && currentCV.languages.length > 0 ? 100 : 0

      case 'links':
        const hasLinkedIn = currentCV.personal?.linkedin
        const hasWebsite = currentCV.personal?.website
        const hasGithub = currentCV.personal?.github
        const hasPortfolio = currentCV.personal?.portfolio
        
        const totalLinks = 4 // linkedin, website, github, portfolio
        const filledLinks = [hasLinkedIn, hasWebsite, hasGithub, hasPortfolio].filter(Boolean).length
        return filledLinks > 0 ? (filledLinks / totalLinks) * 100 : 0

      default:
        return 0
    }
  }

  // Calculate overall completion
  const overallCompletion = Math.round(
    sections.reduce((acc, section) => {
      const completion = getSectionCompletion(section.id)
      return acc + (section.required ? completion : completion * 0.5)
    }, 0) / sections.length
  )

  return (
    <div className="h-full flex flex-col">
      {/* Progress overview */}
      <div className="p-4 border-b">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">CV Completion</span>
          <span className="text-sm text-gray-600">{overallCompletion}%</span>
        </div>
        <Progress value={overallCompletion} className="h-2" />
      </div>

      {/* Section navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => {
          const completion = getSectionCompletion(section.id)
          const isActive = activeSection === section.id
          const Icon = section.icon

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                'w-full px-4 py-3 flex items-center gap-3 transition-colors relative',
                'hover:bg-gray-50',
                isActive && 'bg-blue-50 border-l-4 border-blue-500'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-blue-50"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center gap-3 flex-1">
                <div className={cn(
                  'p-2 rounded-lg',
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-medium text-sm',
                      isActive ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {section.title}
                    </span>
                    {section.required && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        Required
                      </Badge>
                    )}
                  </div>
                  
                  {/* Completion indicator */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          completion === 100 ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{completion}%</span>
                  </div>
                </div>

                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform',
                  isActive && 'rotate-90'
                )} />
              </div>
            </button>
          )
        })}
      </nav>

      {/* Tips section */}
      <div className="p-4 border-t bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Pro Tips</h3>
        <p className="text-xs text-gray-600">
          Complete all required sections for a professional CV. 
          Add optional sections to stand out!
        </p>
      </div>
    </div>
  )
}
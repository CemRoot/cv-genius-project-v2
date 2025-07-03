'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  FileText,
  Check,
  Home,
  Save,
  Settings2
} from 'lucide-react'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { ProfessionalSummaryForm } from '@/components/forms/professional-summary-form'
import { ExperienceForm } from '@/components/forms/experience-form'
import { EducationForm } from '@/components/forms/education-form'
import { SkillsForm } from '@/components/forms/skills-form'
import { useCVStore } from '@/store/cv-store'
import { useToast, createToastUtils } from '@/components/ui/toast'
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation'
import { useGestureNavigation } from '@/hooks/use-gesture-navigation'
import { ResponsiveHeading, ResponsiveText } from '@/components/responsive/responsive-text'
import { SafeAreaWrapper } from '@/components/responsive/adaptive-layout'
import { MobileSectionReorder } from '@/components/mobile/mobile-section-reorder'

const steps = [
  {
    id: 'personal',
    title: 'Personal Info',
    icon: User,
    description: 'Your basic information',
    component: PersonalInfoForm
  },
  {
    id: 'summary',
    title: 'Summary',
    icon: FileText,
    description: 'Professional overview',
    component: ProfessionalSummaryForm,
    optional: true
  },
  {
    id: 'experience',
    title: 'Experience',
    icon: Briefcase,
    description: 'Work history',
    component: ExperienceForm
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    description: 'Academic background',
    component: EducationForm
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: Award,
    description: 'Your expertise',
    component: SkillsForm,
    optional: true
  }
]

interface MobileWizardProps {
  templateId: string
  onBack: () => void
}

export function MobileWizard({ templateId, onBack }: MobileWizardProps) {
  const { currentCV, saveCV, sessionState, updateSessionState, setActiveSection } = useCVStore()
  
  // Initialize currentStep from sessionState or default to 0
  const [currentStep, setCurrentStep] = useState(sessionState.currentStep || 0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showSectionManager, setShowSectionManager] = useState(false)
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const router = useRouter()
  
  // Filter steps based on section visibility
  const visibleSteps = steps.filter(step => {
    // Personal info is always visible
    if (step.id === 'personal') return true
    
    // Find the corresponding section in currentCV.sections
    const section = currentCV.sections.find(s => s.type === step.id)
    
    // If section exists, check its visibility, otherwise default to showing it
    return section ? section.visible : true
  })
  
  // Update session state when currentStep changes
  useEffect(() => {
    updateSessionState({ 
      currentStep, 
      builderMode: 'wizard',
      selectedTemplateId: templateId 
    })
    
    // Also update the active section to match current step
    if (visibleSteps[currentStep]) {
      setActiveSection(visibleSteps[currentStep].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, templateId, visibleSteps])
  
  // Restore state on component mount
  useEffect(() => {
    if (sessionState.currentStep !== undefined && sessionState.builderMode === 'wizard') {
      setCurrentStep(sessionState.currentStep)
    }
  }, [])
  
  const progress = ((currentStep + 1) / visibleSteps.length) * 100
  const CurrentStepComponent = visibleSteps[currentStep]?.component || PersonalInfoForm

  // Swipe navigation
  const swipeNavigation = useSwipeNavigation({
    enabledDirections: { left: true, right: true, up: false, down: false },
    onSwipeComplete: (direction) => {
      if (direction === 'left' && currentStep < visibleSteps.length - 1) {
        handleNext()
      } else if (direction === 'right' && currentStep > 0) {
        handleBack()
      }
    },
    threshold: 50,
    velocity: 0.3
  })

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      await saveCV()
      toast.success('CV Created!', 'Your CV has been saved successfully')
      // Navigate to export page
      router.push('/export')
    } catch (error) {
      toast.error('Save Failed', 'Failed to save your CV. Please try again.')
    }
  }

  const handleSave = async () => {
    try {
      await saveCV()
      toast.success('Progress Saved', 'Your changes have been saved')
    } catch (error) {
      toast.error('Save Failed', 'Failed to save progress')
    }
  }

  // Auto-save on step change
  useEffect(() => {
    if (currentStep > 0) {
      handleSave()
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <Home className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Create Your CV</h1>
                <p className="text-xs text-gray-500">Template: {templateId}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSectionManager(true)}
                className="p-2"
              >
                <Settings2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="p-2"
              >
                <Save className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="px-4 py-6">
        <div className="flex justify-between mb-8">
          {visibleSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = completedSteps.has(index)

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index !== visibleSteps.length - 1 ? 'relative' : ''
                }`}
              >
                {/* Connection Line */}
                {index !== visibleSteps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}
                
                {/* Step Circle */}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                
                {/* Step Title (only for active) */}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-6 text-xs font-medium text-blue-600 whitespace-nowrap"
                  >
                    {step.title}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Current Step Info */}
        <Card className="p-6 mb-6 mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {visibleSteps[currentStep]?.title}
          </h2>
          <p className="text-gray-600">
            {visibleSteps[currentStep]?.description}
          </p>
          {visibleSteps[currentStep]?.optional && (
            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Optional - You can skip this
            </span>
          )}
        </Card>

        {/* Step Content */}
        <div ref={swipeNavigation.setSwipeElement}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              <CurrentStepComponent isMobile={true} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 h-12"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {visibleSteps[currentStep]?.optional && currentStep < visibleSteps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleNext}
              className="px-6"
            >
              Skip
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            className="flex-1 h-12"
          >
            {currentStep === visibleSteps.length - 1 ? (
              <>
                Complete
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {/* Swipe Hint */}
        <p className="text-center text-xs text-gray-500 mt-2">
          Swipe left or right to navigate
        </p>
      </div>
      
      {/* Mobile Section Manager Modal */}
      {showSectionManager && (
        <MobileSectionReorder 
          isOpen={showSectionManager}
          onClose={() => setShowSectionManager(false)}
          onSectionToggle={(sectionId: string) => {
            // Handle section toggle if needed
          }}
          expandedSections={[]}
        />
      )}
    </div>
  )
}
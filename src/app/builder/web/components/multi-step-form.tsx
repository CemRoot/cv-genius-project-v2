'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Save, FileText, User, Briefcase, GraduationCap, Award, FolderOpen, AlertCircle } from 'lucide-react'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { ProfessionalSummaryForm } from '@/components/forms/professional-summary-form'
import { ExperienceForm } from '@/components/forms/experience-form'
import { EducationForm } from '@/components/forms/education-form'
import { SkillsForm } from '@/components/forms/skills-form'
import { ProjectsForm } from '@/components/forms/projects-form'
import { CertificationsForm } from '@/components/forms/certifications-form'
import { LanguagesForm } from '@/components/forms/languages-form'
import { InterestsForm } from '@/components/forms/interests-form'
import { ReferencesForm } from '@/components/forms/references-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useCVStore } from '@/store/cv-store'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Step {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  optional?: boolean
}

const steps: Step[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Your contact details and basic information',
    icon: <User className="w-5 h-5" />,
    component: PersonalInfoForm
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    description: 'Brief overview of your career',
    icon: <FileText className="w-5 h-5" />,
    component: ProfessionalSummaryForm,
    optional: true
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Your employment history',
    icon: <Briefcase className="w-5 h-5" />,
    component: ExperienceForm
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Your academic background',
    icon: <GraduationCap className="w-5 h-5" />,
    component: EducationForm
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Your key competencies',
    icon: <Award className="w-5 h-5" />,
    component: SkillsForm,
    optional: true
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Notable projects you\'ve worked on',
    icon: <FolderOpen className="w-5 h-5" />,
    component: ProjectsForm,
    optional: true
  }
]

interface MultiStepFormProps {
  templateId: string
  onBack: () => void
}

export function MultiStepForm({ templateId, onBack }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [templateManager] = useState(() => new IrishCVTemplateManager())
  const { saveCV, currentCV } = useCVStore()
  
  // Initialize template manager with selected template
  useEffect(() => {
    if (templateId) {
      templateManager.selectTemplate(templateId)
      // Validate current data against template requirements
      validateCurrentData()
    }
  }, [templateId])
  
  const validateCurrentData = () => {
    try {
      const errors = templateManager.validateCV(currentCV)
      setValidationErrors(errors)
    } catch (error) {
      console.error('Validation error:', error)
    }
  }
  
  const progress = ((currentStep + 1) / steps.length) * 100
  const CurrentStepComponent = steps[currentStep].component

  const handleNext = () => {
    console.log('📍 Moving to next step from:', currentStep)
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
    // Re-validate after each step
    validateCurrentData()
  }

  const handlePrevious = () => {
    console.log('📍 Moving to previous step from:', currentStep)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
    // Ensure form components get fresh data when going back
    setTimeout(() => {
      console.log('🔄 Triggering form refresh after navigation')
    }, 100)
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  const handleSave = async () => {
    try {
      await saveCV()
      // Show success notification
    } catch (error) {
      console.error('Failed to save CV:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Change Template
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-lg font-semibold">Building Your CV</h2>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4 space-y-2">
            {steps.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = completedSteps.has(index)
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white shadow-sm border border-blue-200' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      isActive ? 'text-blue-600' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-sm ${
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </h3>
                        {step.optional && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}-${templateId}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {steps[currentStep].icon}
                      {steps[currentStep].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Show validation warnings if any */}
                    {validationErrors.length > 0 && currentStep === steps.length - 1 && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium mb-2">Template recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.map((error, idx) => (
                              <li key={idx} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    <CurrentStepComponent />
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {steps[currentStep].optional && (
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
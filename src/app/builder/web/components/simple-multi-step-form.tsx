'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Save, FileText, User, Briefcase, GraduationCap, Award, FolderOpen, ArrowLeft, Languages, Trophy, Heart, Users } from 'lucide-react'
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
import { useCVStore } from '@/store/cv-store'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

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
    description: 'Your technical and soft skills',
    icon: <Award className="w-5 h-5" />,
    component: SkillsForm
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Personal or professional projects',
    icon: <FolderOpen className="w-5 h-5" />,
    component: ProjectsForm,
    optional: true
  },
  {
    id: 'certifications',
    title: 'Certifications',
    description: 'Professional certifications and courses',
    icon: <Trophy className="w-5 h-5" />,
    component: CertificationsForm,
    optional: true
  },
  {
    id: 'languages',
    title: 'Languages',
    description: 'Languages you speak',
    icon: <Languages className="w-5 h-5" />,
    component: LanguagesForm,
    optional: true
  },
  {
    id: 'interests',
    title: 'Interests & Hobbies',
    description: 'Your personal interests',
    icon: <Heart className="w-5 h-5" />,
    component: InterestsForm,
    optional: true
  },
  {
    id: 'references',
    title: 'References',
    description: 'Professional references',
    icon: <Users className="w-5 h-5" />,
    component: ReferencesForm,
    optional: true
  }
]

interface SimpleMultiStepFormProps {
  templateId: string
  onBack: () => void
}

export function SimpleMultiStepForm({ templateId, onBack }: SimpleMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set<number>())
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const { currentCV, saveCV } = useCVStore()
  
  const progress = ((currentStep + 1) / steps.length) * 100
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }
  
  const handleSave = () => {
    saveCV()
    const newCompleted = new Set<number>()
    completedSteps.forEach(step => newCompleted.add(step))
    newCompleted.add(currentStep)
    setCompletedSteps(newCompleted)
  }
  
  const CurrentStepComponent = steps[currentStep].component
  
  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Modern Header */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="gap-1 sm:gap-2 hover:bg-gray-100 px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Templates</span>
              </Button>
              
              <div className="hidden sm:block h-8 w-px bg-gray-200" />
              
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Build Your CV</h1>
                <p className="hidden sm:block text-xs text-gray-500">Fill in your details step by step</p>
              </div>
            </div>
            
            <Button onClick={handleSave} size="sm" className="gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 px-3 sm:px-4">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
        
        {/* Modern Progress Bar */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={progress} className="h-1.5 bg-gray-200" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Modern Sidebar Navigation */}
        <div className="hidden lg:flex w-64 bg-white border-r overflow-hidden flex-shrink-0 flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 sticky top-0 bg-white pb-2">Progress Steps</h2>
            <div className="space-y-1">
              {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = completedSteps.has(index)
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-blue-50 border border-blue-200 shadow-sm" 
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Step Number or Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isActive && "bg-blue-600 text-white",
                        isCompleted && "bg-green-500 text-white",
                        !isActive && !isCompleted && "bg-gray-200 text-gray-600"
                      )}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={cn(
                            "font-medium text-sm truncate",
                            isActive ? "text-gray-900" : "text-gray-700"
                          )}>
                            {step.title}
                          </h3>
                          {step.optional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Completion Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Completion</span>
                <span className="text-xs font-semibold text-gray-900">{completedSteps.size} / {steps.length}</span>
              </div>
              <Progress value={(completedSteps.size / steps.length) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center">
              <div className="w-full max-w-4xl p-4 sm:p-6 lg:p-8">
                {/* Mobile Step Indicator */}
                <div className="lg:hidden mb-4">
                  <div className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                        {steps[currentStep].icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</p>
                        <h3 className="text-sm font-medium text-gray-900">{steps[currentStep].title}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Toggle mobile steps menu
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Desktop Step Header */}
                <div className="hidden lg:block mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {steps[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {steps[currentStep].title}
                    </h2>
                  </div>
                  <p className="text-gray-600">{steps[currentStep].description}</p>
                </div>
                
                {/* Error Messages */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {validationErrors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Form Component */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <CurrentStepComponent />
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <div className="bg-white border-t shadow-lg">
            <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2 px-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-4">
                  {steps[currentStep].optional && currentStep < steps.length - 1 && (
                    <Button
                      variant="ghost"
                      onClick={handleNext}
                      className="text-gray-600"
                    >
                      Skip this step
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="gap-2 px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
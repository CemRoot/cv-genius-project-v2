'use client'

import { useState, useEffect } from 'react'
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
  Upload,
  Loader2
} from 'lucide-react'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { ExperienceForm } from '@/components/forms/experience-form'
import { EducationForm } from '@/components/forms/education-form'
import { SkillsForm } from '@/components/forms/skills-form'
import { ProfessionalSummaryForm } from '@/components/forms/professional-summary-form'
import { useCVStore } from '@/store/cv-store'
import { useRouter } from 'next/navigation'
import { useToast, createToastUtils } from '@/components/ui/toast'

const steps = [
  {
    id: 'personal',
    title: 'Personal Info',
    icon: User,
    description: 'Your basic information'
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    icon: FileText,
    description: 'Brief overview of your career'
  },
  {
    id: 'experience',
    title: 'Work Experience',
    icon: Briefcase,
    description: 'Your employment history'
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    description: 'Your academic background'
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: Award,
    description: 'Your key competencies'
  }
]

interface MobileCVWizardProps {
  onComplete?: () => void
  initialData?: any
}

export function MobileCVWizard({ onComplete, initialData }: MobileCVWizardProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const { currentCV, updatePersonalInfo, saveCV } = useCVStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
      toast.success('CV Created Successfully', 'Your CV has been saved and is ready to use!')
      
      if (onComplete) {
        onComplete()
      } else {
        router.push('/builder')
      }
    } catch (error) {
      toast.error('Save Failed', 'Failed to save your CV. Please try again.')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Invalid file type', 'Please upload a PDF file')
      return
    }

    setUploadedFile(file)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to parse PDF')
      }

      const { text } = await response.json()

      // Analyze the CV content
      const analyzeResponse = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cvContent: text })
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze CV')
      }

      const cvData = await analyzeResponse.json()
      
      // Update personal info with extracted data
      updatePersonalInfo({
        fullName: cvData.name || '',
        email: cvData.email || '',
        phone: cvData.phone || '',
        address: cvData.location || 'Dublin, Ireland',
        summary: cvData.summary || ''
      })
      
      // TODO: Add methods to update experience, education, and skills
      // For now, we'll just update the personal info

      toast.success('CV Imported', 'Your information has been extracted successfully!')
      
      // Skip to review or complete
      setCurrentStep(steps.length - 1)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Import Failed', 'Failed to import your CV. Please fill the form manually.')
    } finally {
      setIsUploading(false)
    }
  }

  const renderStepContent = () => {
    const currentStepId = steps[currentStep].id

    switch (currentStepId) {
      case 'personal':
        return <PersonalInfoForm />
      case 'summary':
        return <ProfessionalSummaryForm />
      case 'experience':
        return <ExperienceForm />
      case 'education':
        return <EducationForm />
      case 'skills':
        return <SkillsForm />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">CV Wizard</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Quick Upload Option */}
      {currentStep === 0 && !uploadedFile && (
        <div className="px-4 py-4">
          <Card className="p-4 border-2 border-dashed border-blue-300 bg-blue-50">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Have an existing CV?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your PDF to auto-fill the information
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isUploading}
                  asChild
                >
                  <span>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CV
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Step Indicators */}
      <div className="px-4 py-6">
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index !== steps.length - 1 ? 'relative' : ''
                }`}
              >
                {/* Connection Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}
                
                {/* Step Circle */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white scale-110'
                      : isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step Title */}
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Current Step Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? (
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
      </div>
    </div>
  )
}

export default MobileCVWizard
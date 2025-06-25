'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'
import type { ExperienceLevel, StudentStatus, SchoolType, EducationDetails } from '@/contexts/cover-letter-context'
import { EXPERIENCE_LEVELS, STUDENT_STATUS_OPTIONS, SCHOOL_TYPES, DEGREE_SUGGESTIONS, FIELD_OF_STUDY_SUGGESTIONS } from './constants'
import { ProgressIndicator } from './progress-indicator'
import { Toast } from './toast'
import { NavigationGuard } from './navigation-guard'
import { useMobileKeyboard } from '@/components/mobile'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeWrapper } from './swipe-wrapper'

export default function ExperiencePage() {
  const router = useRouter()
  const { 
    state, 
    setExperienceLevel, 
    setStudentStatus, 
    setSchoolType, 
    setEducationDetails, 
    setCollegeGrad,
    setCurrentStep: setContextStep 
  } = useCoverLetter()
  
  const [currentStep, setCurrentStep] = useState<'experience' | 'student' | 'school' | 'education' | 'college-grad'>('experience')
  const [educationDetails, setLocalEducationDetails] = useState<EducationDetails>(
    state.educationDetails || { degreeType: '', fieldOfStudy: '' }
  )
  const [isLoading, setIsLoading] = useState(false)
  const [educationErrors, setEducationErrors] = useState<{ degreeType?: string; fieldOfStudy?: string }>({})
  const [showDegreeHints, setShowDegreeHints] = useState(false)
  const [showFieldHints, setShowFieldHints] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const hasInitialized = useRef(false)
  
  const { adjustedViewHeight, scrollActiveElementIntoView } = useMobileKeyboard()

  // Initialize current step from context on mount
  useEffect(() => {
    // Only update context step once on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true
      if (state.currentStep !== 'experience') {
        setContextStep('experience')
      }
    }
  }, [state.currentStep, setContextStep])

  // Sync local step with context step
  useEffect(() => {
    if (state.currentStep === 'experience') {
      setCurrentStep('experience')
    }
  }, [state.currentStep])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleExperienceSelect = useCallback(async (level: ExperienceLevel) => {
    setIsLoading(true)
    setExperienceLevel(level)
    setToast({ message: 'Experience level saved', type: 'success' })
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (level === 'no-experience' || level === 'less-than-3') {
      setCurrentStep('student')
    } else {
      // For other experience levels, go to creation mode selection
      setContextStep('choose-template')
      router.push('/cover-letter/choose-template')
    }
    setIsLoading(false)
  }, [router, setExperienceLevel, setContextStep])

  const handleStudentSelect = useCallback((status: StudentStatus) => {
    setStudentStatus(status)
    
    if (status === 'yes' || status === 'recent-graduate') {
      setCurrentStep('school')
    } else {
      setCurrentStep('college-grad')
    }
  }, [setStudentStatus])

  const handleSchoolSelect = useCallback((type: SchoolType) => {
    setSchoolType(type)
    
    if (type === 'college' || type === 'graduate-school') {
      setCurrentStep('education')
    } else {
      setContextStep('choose-template')
      router.push('/cover-letter/choose-template')
    }
  }, [router, setSchoolType, setContextStep])

  const handleEducationSubmit = useCallback(() => {
    const errors: { degreeType?: string; fieldOfStudy?: string } = {}
    
    if (!educationDetails.degreeType || educationDetails.degreeType.trim() === '') {
      errors.degreeType = 'Please enter your degree type'
    }
    
    if (!educationDetails.fieldOfStudy || educationDetails.fieldOfStudy.trim() === '') {
      errors.fieldOfStudy = 'Please enter your field of study'
    }
    
    if (Object.keys(errors).length > 0) {
      setEducationErrors(errors)
      return
    }
    
    setEducationDetails(educationDetails)
    setContextStep('choose-template')
    router.push('/cover-letter/choose-template')
  }, [educationDetails, router, setEducationDetails, setContextStep])

  const handleCollegeGradSelect = useCallback((isGrad: boolean) => {
    setCollegeGrad(isGrad)
    setContextStep('choose-template')
    router.push('/cover-letter/choose-template')
  }, [router, setCollegeGrad, setContextStep])

  // Handle swipe navigation
  const handleSwipeLeft = useCallback(() => {
    // Navigate forward based on current step
    if (currentStep === 'experience' && state.experienceLevel) {
      if (state.experienceLevel === 'no-experience' || state.experienceLevel === 'less-than-3') {
        setCurrentStep('student')
      } else {
        router.push('/cover-letter/choose-template')
      }
    }
  }, [currentStep, state.experienceLevel, router])

  const handleSwipeRight = useCallback(() => {
    // Navigate back based on current step
    if (currentStep === 'student') {
      setCurrentStep('experience')
    } else if (currentStep === 'school') {
      setCurrentStep('student')
    } else if (currentStep === 'education') {
      setCurrentStep('school')
    } else if (currentStep === 'college-grad') {
      setCurrentStep('student')
    }
  }, [currentStep])

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How long have you been working?</h2>
        <p className="text-gray-600">Help us tailor your cover letter to your experience level</p>
      </div>
      
      <div className={`grid gap-4 max-w-2xl mx-auto ${isMobile ? 'px-2' : ''}`}>
        {EXPERIENCE_LEVELS.map((option) => (
          <Card
            key={option.value}
            className={`${isMobile ? 'p-4' : 'p-6'} cursor-pointer hover:shadow-lg transition-all duration-200 border-2 
              ${state.experienceLevel === option.value ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}
              ${isMobile ? 'active:scale-95' : ''}
            `}
            onClick={() => handleExperienceSelect(option.value as ExperienceLevel)}
            role="button"
            tabIndex={0}
            aria-label={`Select ${option.label} experience level`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleExperienceSelect(option.value as ExperienceLevel)
              }
            }}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStudentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Are you a student?</h2>
        <p className="text-gray-600">This helps us understand your current situation</p>
      </div>
      
      <div className="grid gap-4 max-w-lg mx-auto">
        {STUDENT_STATUS_OPTIONS.map((option) => (
          <Card
            key={option.value}
            className={`p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 
              ${state.studentStatus === option.value ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}
            `}
            onClick={() => handleStudentSelect(option.value as StudentStatus)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('experience')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Experience Level</span>
        </Button>
      </div>
    </div>
  )

  const renderSchoolStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">What kind of school is it?</h2>
        <p className="text-gray-600">Tell us about your educational background</p>
      </div>
      
      <div className="grid gap-4 max-w-lg mx-auto">
        {SCHOOL_TYPES.map((option) => (
          <Card
            key={option.value}
            className={`p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 
              ${state.schoolType === option.value ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}
            `}
            onClick={() => handleSchoolSelect(option.value as SchoolType)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('student')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Status
        </Button>
      </div>
    </div>
  )

  const renderEducationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Education Details</h2>
        <p className="text-gray-600">Please provide your degree information</p>
      </div>
      
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree Type
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                ${educationErrors.degreeType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
              `}
              placeholder="e.g., Bachelor's, Master's, PhD"
              value={educationDetails.degreeType}
              onChange={(e) => {
                setLocalEducationDetails(prev => ({ ...prev, degreeType: e.target.value }))
                setEducationErrors(prev => ({ ...prev, degreeType: undefined }))
              }}
              onFocus={() => {
                setShowDegreeHints(true)
                if (isMobile) scrollActiveElementIntoView()
              }}
              onBlur={() => setTimeout(() => setShowDegreeHints(false), 200)}
            />
            {educationErrors.degreeType && (
              <p className="mt-1 text-sm text-red-600">{educationErrors.degreeType}</p>
            )}
            {showDegreeHints && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {DEGREE_SUGGESTIONS.filter(suggestion => 
                  suggestion.toLowerCase().includes(educationDetails.degreeType.toLowerCase())
                ).slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => {
                      setLocalEducationDetails(prev => ({ ...prev, degreeType: suggestion }))
                      setShowDegreeHints(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                ${educationErrors.fieldOfStudy ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
              `}
              placeholder="e.g., Computer Science, Business Administration"
              value={educationDetails.fieldOfStudy}
              onChange={(e) => {
                setLocalEducationDetails(prev => ({ ...prev, fieldOfStudy: e.target.value }))
                setEducationErrors(prev => ({ ...prev, fieldOfStudy: undefined }))
              }}
              onFocus={() => {
                setShowFieldHints(true)
                if (isMobile) scrollActiveElementIntoView()
              }}
              onBlur={() => setTimeout(() => setShowFieldHints(false), 200)}
            />
            {educationErrors.fieldOfStudy && (
              <p className="mt-1 text-sm text-red-600">{educationErrors.fieldOfStudy}</p>
            )}
            {showFieldHints && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {FIELD_OF_STUDY_SUGGESTIONS.filter(suggestion => 
                  suggestion.toLowerCase().includes(educationDetails.fieldOfStudy.toLowerCase())
                ).slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => {
                      setLocalEducationDetails(prev => ({ ...prev, fieldOfStudy: suggestion }))
                      setShowFieldHints(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('school')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <Button 
              onClick={handleEducationSubmit}
              disabled={!educationDetails.degreeType || !educationDetails.fieldOfStudy}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderCollegeGradStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Did you Graduate from college?</h2>
        <p className="text-gray-600">This helps us understand your educational background</p>
      </div>
      
      <div className="grid gap-4 max-w-lg mx-auto">
        {[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' }
        ].map((option) => (
          <Card
            key={option.value.toString()}
            className={`p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 
              ${state.collegeGrad === option.value ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'}
            `}
            onClick={() => handleCollegeGradSelect(option.value)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('student')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Status
        </Button>
      </div>
    </div>
  )

  return (
    <NavigationGuard>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cover Letter Builder
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Let's gather some information to create the perfect cover letter for you
            </p>
          </div>
        </div>
      </div>

      <ProgressIndicator 
        currentStep={currentStep}
        experienceLevel={state.experienceLevel}
        studentStatus={state.studentStatus}
        schoolType={state.schoolType}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ minHeight: isMobile ? adjustedViewHeight : 'auto' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Preparing next step...</p>
          </div>
        ) : (
          <SwipeWrapper
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            enabled={isMobile}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'experience' && renderExperienceStep()}
                {currentStep === 'student' && renderStudentStep()}
                {currentStep === 'school' && renderSchoolStep()}
                {currentStep === 'education' && renderEducationStep()}
                {currentStep === 'college-grad' && renderCollegeGradStep()}
              </motion.div>
            </AnimatePresence>
          </SwipeWrapper>
        )}
      </div>
      </div>
      </MainLayout>
    </NavigationGuard>
  )
}
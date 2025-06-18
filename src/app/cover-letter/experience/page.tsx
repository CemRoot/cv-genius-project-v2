'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type ExperienceLevel = 'no-experience' | 'less-than-3' | '3-5-years' | '5-10-years' | '10-plus-years'
type StudentStatus = 'yes' | 'no' | 'recent-graduate'
type SchoolType = 'high-school' | 'trade-school' | 'college' | 'graduate-school'

interface EducationDetails {
  degreeType: string
  fieldOfStudy: string
}

export default function ExperiencePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'experience' | 'student' | 'school' | 'education' | 'college-grad'>('experience')
  const [, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [, setStudentStatus] = useState<StudentStatus | null>(null)
  const [, setSchoolType] = useState<SchoolType | null>(null)
  const [educationDetails, setEducationDetails] = useState<EducationDetails>({ degreeType: '', fieldOfStudy: '' })
  const [, setCollegeGrad] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExperienceSelect = useCallback(async (level: ExperienceLevel) => {
    setIsLoading(true)
    setExperienceLevel(level)
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (level === 'no-experience' || level === 'less-than-3') {
      setCurrentStep('student')
    } else {
      // For other experience levels, go directly to template selection
      router.push('/cover-letter/choose-template')
    }
    setIsLoading(false)
  }, [router])

  const handleStudentSelect = useCallback((status: StudentStatus) => {
    setStudentStatus(status)
    
    if (status === 'yes' || status === 'recent-graduate') {
      setCurrentStep('school')
    } else {
      setCurrentStep('college-grad')
    }
  }, [])

  const handleSchoolSelect = useCallback((type: SchoolType) => {
    setSchoolType(type)
    
    if (type === 'college' || type === 'graduate-school') {
      setCurrentStep('education')
    } else {
      router.push('/cover-letter/choose-template')
    }
  }, [router])

  const handleEducationSubmit = useCallback(() => {
    if (educationDetails.degreeType && educationDetails.fieldOfStudy) {
      router.push('/cover-letter/choose-template')
    }
  }, [educationDetails, router])

  const handleCollegeGradSelect = useCallback((isGrad: boolean) => {
    setCollegeGrad(isGrad)
    router.push('/cover-letter/choose-template')
  }, [router])

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How long have you been working?</h2>
        <p className="text-gray-600">Help us tailor your cover letter to your experience level</p>
      </div>
      
      <div className="grid gap-4 max-w-2xl mx-auto">
        {[
          { value: 'no-experience', label: 'No Experience' },
          { value: 'less-than-3', label: 'Less Than 3 Years' },
          { value: '3-5-years', label: '3-5 Years' },
          { value: '5-10-years', label: '5-10 Years' },
          { value: '10-plus-years', label: '10+ Years' }
        ].map((option) => (
          <Card
            key={option.value}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
            onClick={() => handleExperienceSelect(option.value as ExperienceLevel)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
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
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'recent-graduate', label: 'Recent graduate' }
        ].map((option) => (
          <Card
            key={option.value}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
            onClick={() => handleStudentSelect(option.value as StudentStatus)}
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
          onClick={() => setCurrentStep('experience')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Experience Level
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
        {[
          { value: 'high-school', label: 'High school' },
          { value: 'trade-school', label: 'Trade school' },
          { value: 'college', label: 'College' },
          { value: 'graduate-school', label: 'Graduate school' }
        ].map((option) => (
          <Card
            key={option.value}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree Type
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bachelor's, Master's, PhD"
              value={educationDetails.degreeType}
              onChange={(e) => setEducationDetails(prev => ({ ...prev, degreeType: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Computer Science, Business Administration"
              value={educationDetails.fieldOfStudy}
              onChange={(e) => setEducationDetails(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
            />
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
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="transition-all duration-500 ease-in-out">
            {currentStep === 'experience' && renderExperienceStep()}
            {currentStep === 'student' && renderStudentStep()}
            {currentStep === 'school' && renderSchoolStep()}
            {currentStep === 'education' && renderEducationStep()}
            {currentStep === 'college-grad' && renderCollegeGradStep()}
          </div>
        )}
      </div>
    </div>
  )
}
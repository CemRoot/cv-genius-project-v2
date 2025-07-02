'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'
import { ChevronRight, SkipForward, User, Briefcase, GraduationCap, Target } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function BackgroundPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { setBackgroundInfo, setCurrentStep } = useCoverLetter()
  
  const [formData, setFormData] = useState({
    fullName: '',
    currentRole: '',
    yearsOfExperience: '',
    education: '',
    keySkills: '',
    careerGoals: '',
    achievements: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContinue = async () => {
    setIsLoading(true)
    
    try {
      // Save background info to context and localStorage
      const backgroundData = {
        ...formData,
        timestamp: new Date().toISOString()
      }
      
      setBackgroundInfo(backgroundData)
      localStorage.setItem('cover-letter-background', JSON.stringify(backgroundData))
      
      // Navigate to customize page
      setCurrentStep('customize')
      router.push('/cover-letter/customize')
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save background information. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Save minimal data
    const minimalData = {
      fullName: formData.fullName || 'Professional',
      skipped: true,
      timestamp: new Date().toISOString()
    }
    
    setBackgroundInfo(minimalData)
    localStorage.setItem('cover-letter-background', JSON.stringify(minimalData))
    
    // Navigate to customize page
    setCurrentStep('customize')
    router.push('/cover-letter/customize')
  }

  const isFormValid = formData.fullName.trim().length > 0

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tell us about yourself
              </h1>
              <p className="text-lg text-gray-600">
                Help our AI create a personalized cover letter by sharing your background
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Full Name - Required */}
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Smith"
                  className="w-full"
                  required
                />
              </div>

              {/* Current Role */}
              <div>
                <Label htmlFor="currentRole" className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Current Role/Title
                </Label>
                <Input
                  id="currentRole"
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager, Recent Graduate"
                  className="w-full"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <Label htmlFor="yearsOfExperience" className="mb-2">
                  Years of Experience
                </Label>
                <select
                  id="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="0">No experience (Student/New Graduate)</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <Label htmlFor="education" className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Education Background
                </Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="e.g., Bachelor's in Computer Science from Trinity College Dublin, Master's in Data Science"
                  rows={2}
                  className="w-full"
                />
              </div>

              {/* Key Skills */}
              <div>
                <Label htmlFor="keySkills" className="mb-2">
                  Key Skills & Expertise
                </Label>
                <Textarea
                  id="keySkills"
                  value={formData.keySkills}
                  onChange={(e) => handleInputChange('keySkills', e.target.value)}
                  placeholder="e.g., Python, Data Analysis, Project Management, Team Leadership"
                  rows={2}
                  className="w-full"
                />
              </div>

              {/* Career Goals */}
              <div>
                <Label htmlFor="careerGoals" className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                  Career Goals & Interests
                </Label>
                <Textarea
                  id="careerGoals"
                  value={formData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  placeholder="What type of role are you looking for? What excites you about your field?"
                  rows={2}
                  className="w-full"
                />
              </div>

              {/* Key Achievements */}
              <div>
                <Label htmlFor="achievements" className="mb-2">
                  Key Achievements
                </Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Notable accomplishments, projects, or recognition"
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> The more information you provide, the better our AI can personalize your cover letter. 
                  All fields except name are optional.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip for Now
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!isFormValid || isLoading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
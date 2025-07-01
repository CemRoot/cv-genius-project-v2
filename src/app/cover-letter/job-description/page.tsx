'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2, Building2, Briefcase, MapPin, AlertCircle } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function JobDescriptionPage() {
  const router = useRouter()
  const { setJobDescription: setContextJobDescription, setJobInfo } = useCoverLetter()
  const { addToast } = useToast()
  const [hasJobDescription, setHasJobDescription] = useState<boolean | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [showDescriptionForm, setShowDescriptionForm] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showManualInputDialog, setShowManualInputDialog] = useState(false)
  const [manualCompany, setManualCompany] = useState('')
  const [manualRole, setManualRole] = useState('')
  const [detectedInfo, setDetectedInfo] = useState<{
    company: string | null
    role: string | null
    location: string | null
  } | null>(null)

  const handleChoice = (hasDescription: boolean) => {
    setHasJobDescription(hasDescription)
    if (hasDescription) {
      setShowDescriptionForm(true)
    } else {
      // If no job description, go to strengths
      router.push('/cover-letter/strengths')
    }
  }

  const analyzeJobDescription = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/analyze-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription })
      })

      const result = await response.json()

      if (result.success && result.data) {
        const { company, role, location, confidence, isRecruitmentAgency } = result.data
        
        // Check if we need manual input
        // For recruitment agency postings, we always need manual input for company name
        const needsManualInput = !role || 
          confidence.role < 50 || 
          isRecruitmentAgency || 
          (!company && !isRecruitmentAgency)

        if (needsManualInput) {
          setDetectedInfo({ company, role, location })
          setManualCompany(company || '')
          setManualRole(role || '')
          setShowManualInputDialog(true)
        } else {
          // Auto-fill detected information
          const jobInfo = {
            targetCompany: company || 'your organisation',
            jobTitle: role || 'Desired Position',
            location: location || 'Dublin, Ireland'
          }
          
          localStorage.setItem('cover-letter-job-info', JSON.stringify(jobInfo))
          setJobInfo(jobInfo)
          
          addToast({
            type: 'success',
            title: 'Job Details Detected',
            description: `Company: ${company}, Role: ${role}`
          })
          
          proceedToNextStep()
        }
      } else {
        // AI couldn't analyze, show manual input
        setShowManualInputDialog(true)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        description: 'Unable to analyze job description. Please enter details manually.'
      })
      setShowManualInputDialog(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualInputConfirm = () => {
    if (!manualCompany || !manualRole) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please enter both company name and job role.'
      })
      return
    }

    const jobInfo = {
      targetCompany: manualCompany,
      jobTitle: manualRole,
      location: detectedInfo?.location || 'Dublin, Ireland'
    }
    
    localStorage.setItem('cover-letter-job-info', JSON.stringify(jobInfo))
    setJobInfo(jobInfo)
    
    setShowManualInputDialog(false)
    proceedToNextStep()
  }

  const proceedToNextStep = () => {
    if (jobDescription) {
      localStorage.setItem('cover-letter-job-description', jobDescription)
      setContextJobDescription(jobDescription)
    }
    router.push('/cover-letter/strengths')
  }

  const handleContinue = () => {
    if (hasJobDescription && jobDescription) {
      // Analyze job description with AI
      analyzeJobDescription()
    } else {
      // No job description, proceed normally
      router.push('/cover-letter/strengths')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Do you have a job description?
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showDescriptionForm ? (
          <div>
            <p className="text-center text-gray-600 mb-8">Previous Answer</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  hasJobDescription === true
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'hover:shadow-lg hover:border-blue-400'
                }`}
                onClick={() => handleChoice(true)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Yes</h3>
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer transition-all ${
                  hasJobDescription === false
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'hover:shadow-lg hover:border-blue-400'
                }`}
                onClick={() => handleChoice(false)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Not yet</h3>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Add job description
                </h2>
                <Label htmlFor="jobDescription" className="text-gray-600">
                  Paste details of the job description including requirements and responsibilities.
                </Label>
              </div>

              <div className="space-y-2">
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={10}
                  maxLength={5000}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {jobDescription.length} / 5000
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Powered with AI</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Don't have a job description?</strong> That's fine too. Whether you have the job description or not, 
                  our AI can write you an impactful and professional cover letter.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDescriptionForm(false)
                    setHasJobDescription(null)
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isAnalyzing || (hasJobDescription && !jobDescription)}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

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

      {/* Manual Input Dialog - Professional Design */}
      <Dialog open={showManualInputDialog} onOpenChange={setShowManualInputDialog}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white mb-1">
                  Complete Job Details
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {detectedInfo?.role ? 
                    "This appears to be posted by a recruitment agency. Please enter the company name you're applying to." :
                    "Help us personalize your cover letter by providing the company and role details."
                  }
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Company Input */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Company Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft, Apple"
                className="h-12 text-base px-4"
                autoFocus
              />
              {!detectedInfo?.company && detectedInfo?.role && (
                <p className="text-xs text-amber-600 italic">
                  💡 Tip: Since this is from a recruitment agency, enter the actual company name you're applying to
                </p>
              )}
            </div>

            {/* Role Input */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Job Position
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role"
                value={manualRole}
                onChange={(e) => setManualRole(e.target.value)}
                placeholder="e.g., Senior Python Developer, Software Engineer"
                className="h-12 text-base px-4"
              />
              {detectedInfo?.role && (
                <p className="text-xs text-gray-500 italic">
                  Detected: "{detectedInfo.role}" - Please verify or update
                </p>
              )}
            </div>

            {/* Location Info */}
            {detectedInfo?.location && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location Detected</p>
                  <p className="text-sm text-gray-600">{detectedInfo.location}</p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Providing accurate company and role information helps our AI create a more targeted and effective cover letter.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
            <Button
              variant="outline"
              onClick={() => setShowManualInputDialog(false)}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManualInputConfirm}
              disabled={!manualCompany.trim() || !manualRole.trim()}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </MainLayout>
  )
}
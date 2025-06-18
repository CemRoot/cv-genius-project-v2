'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'

export default function JobDescriptionPage() {
  const router = useRouter()
  const [hasJobDescription, setHasJobDescription] = useState<boolean | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [showDescriptionForm, setShowDescriptionForm] = useState(false)

  const handleChoice = (hasDescription: boolean) => {
    setHasJobDescription(hasDescription)
    if (hasDescription) {
      setShowDescriptionForm(true)
    } else {
      // If no job description, go to strengths
      router.push('/cover-letter/strengths')
    }
  }

  const handleContinue = () => {
    if (hasJobDescription && jobDescription) {
      // Save job description to localStorage
      localStorage.setItem('cover-letter-job-description', jobDescription)
    }
    
    // Continue to strengths
    router.push('/cover-letter/strengths')
  }

  return (
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
                  className="flex-1"
                >
                  Continue
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
    </div>
  )
}
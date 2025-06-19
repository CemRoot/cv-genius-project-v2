'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MainLayout } from '@/components/layout/main-layout'

export default function CustomizePage() {
  const router = useRouter()
  const [hasSpecificJob, setHasSpecificJob] = useState<boolean | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [showJobForm, setShowJobForm] = useState(false)

  const handleJobChoice = (hasJob: boolean) => {
    setHasSpecificJob(hasJob)
    if (hasJob) {
      setShowJobForm(true)
    } else {
      // If no specific job, go to strengths
      router.push('/cover-letter/strengths')
    }
  }

  const handleContinue = () => {
    if (hasSpecificJob && jobTitle && targetCompany) {
      // Save job info to localStorage
      const jobInfo = { jobTitle, targetCompany }
      localStorage.setItem('cover-letter-job-info', JSON.stringify(jobInfo))
      
      // Ask about job description
      router.push('/cover-letter/job-description')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Do you have a specific job in mind?
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Either way, our AI will craft a cover letter you can customize later.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showJobForm ? (
          <div className="grid grid-cols-2 gap-4">
            <Card
              className={`p-6 cursor-pointer transition-all ${
                hasSpecificJob === true
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:shadow-lg hover:border-blue-400'
              }`}
              onClick={() => handleJobChoice(true)}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yes</h3>
                <p className="text-sm text-gray-600">I have a specific position in mind</p>
              </div>
            </Card>

            <Card
              className={`p-6 cursor-pointer transition-all ${
                hasSpecificJob === false
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:shadow-lg hover:border-blue-400'
              }`}
              onClick={() => handleJobChoice(false)}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No</h3>
                <p className="text-sm text-gray-600">I want a general cover letter</p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What job are you applying for?
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Customer Service Representative"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="targetCompany">Target Company</Label>
                  <Input
                    id="targetCompany"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="ACME Technologies"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJobForm(false)
                    setHasSpecificJob(null)
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!jobTitle || !targetCompany}
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
    </MainLayout>
  )
}
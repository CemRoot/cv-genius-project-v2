'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2, ArrowRight } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'
import { useToast, createToastUtils } from '@/components/ui/toast'

export default function UploadResumePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const { updateCoverLetterData, setPersonalInfo } = useCoverLetter()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Invalid file type', 'Please upload a PDF file')
      return
    }

    setUploadedFile(file)
    setIsUploading(true)

    try {
      // Parse the PDF
      const formData = new FormData()
      formData.append('file', file)

      const parseResponse = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse PDF')
      }

      const { text } = await parseResponse.json()

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
      setExtractedData(cvData)

      // Update the cover letter context with extracted data
      updateCoverLetterData({
        personalInfo: {
          fullName: cvData.name || '',
          email: cvData.email || '',
          phone: cvData.phone || '',
          location: cvData.location || ''
        },
        experience: cvData.experience || [],
        skills: cvData.skills || [],
        education: cvData.education || [],
        extractedFromResume: true
      })

      toast.success('Resume uploaded successfully', 'Your information has been extracted. Click continue to proceed.')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', 'There was an error processing your resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleContinue = () => {
    if (!extractedData) {
      toast.error('No resume uploaded', 'Please upload your resume first')
      return
    }

    // Navigate to job description page
    router.push('/cover-letter/job-description')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Upload Your Resume
              </h1>
              <p className="text-lg text-gray-600">
                We'll extract your information to create a tailored cover letter
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!uploadedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload your resume
                </h3>
                <p className="text-gray-600">
                  Accepted format: PDF (Max size: 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {isUploading && (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  )}
                </div>

                {extractedData && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Extracted Information:
                    </h3>
                    <div className="grid gap-3">
                      {extractedData.name && (
                        <div className="p-3 bg-gray-50 rounded">
                          <span className="font-medium">Name:</span> {extractedData.name}
                        </div>
                      )}
                      {extractedData.email && (
                        <div className="p-3 bg-gray-50 rounded">
                          <span className="font-medium">Email:</span> {extractedData.email}
                        </div>
                      )}
                      {extractedData.phone && (
                        <div className="p-3 bg-gray-50 rounded">
                          <span className="font-medium">Phone:</span> {extractedData.phone}
                        </div>
                      )}
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded">
                          <span className="font-medium">Skills:</span> {extractedData.skills.slice(0, 5).join(', ')}
                          {extractedData.skills.length > 5 && ` +${extractedData.skills.length - 5} more`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedFile(null)
                      setExtractedData(null)
                      fileInputRef.current!.value = ''
                    }}
                  >
                    Upload Different Resume
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!extractedData || isUploading}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Creation Mode
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
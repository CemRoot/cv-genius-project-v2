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
  const [showTextInput, setShowTextInput] = useState(false)
  const [cvText, setCvText] = useState('')
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

      const responseData = await parseResponse.json()

      if (!parseResponse.ok || !responseData.success) {
        if (responseData.fallback) {
          // Show text input for manual entry
          setShowTextInput(true)
          toast.info('PDF Upload Unavailable', responseData.suggestion || 'Please paste your CV text below')
          return
        }
        throw new Error(responseData.error || 'Failed to parse PDF')
      }

      const { text } = responseData

      // Analyze the CV content
      const analyzeResponse = await fetch('/api/ai/analyze-cv-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cvContent: text })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        console.error('CV analysis failed:', errorData)
        throw new Error(errorData.error || 'Failed to analyze CV')
      }

      const cvData = await analyzeResponse.json()
      setExtractedData(cvData)

      // Parse the name into firstName and lastName
      const fullName = cvData.name || ''
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Debug CV data extraction
      console.log('🔍 CV Data extracted:', cvData)
      console.log('📧 Email:', cvData.email)
      console.log('📞 Phone:', cvData.phone)
      console.log('📍 Location:', cvData.location)
      console.log('👤 Name parsing:', { fullName, firstName, lastName })

      // Update the cover letter context with extracted data
      updateCoverLetterData({
        personalInfo: {
          firstName,
          lastName
        },
        resumeData: {
          personalInfo: {
            fullName: cvData.name || '',
            email: cvData.email || '',
            phone: cvData.phone || '',
            location: cvData.location || ''
          },
          experience: cvData.experience || [],
          skills: cvData.skills || [],
          education: cvData.education || [],
        },
        extractedFromResume: true
      })

      // Also update the personal info in context directly
      setPersonalInfo({ firstName, lastName })
      
      console.log('✅ Context updated with resume data')

      toast.success('Resume uploaded successfully', 'Your information has been extracted. Click continue to proceed.')
      
      // If AI extraction failed but we got a response, show a warning
      if (cvData.error) {
        toast.warning('AI Extraction Limited', cvData.error)
      }
      
      // Additional validation and fallback for missing contact info
      if (!cvData.email && !cvData.phone && !cvData.location) {
        console.warn('⚠️ No contact information extracted')
        toast.info('Contact Info Missing', 'Please verify your contact information in the next steps')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', error instanceof Error ? error.message : 'There was an error processing your resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!cvText.trim()) {
      toast.error('No CV text', 'Please paste your CV text')
      return
    }

    setIsUploading(true)
    try {
      // Analyze the CV content
      const analyzeResponse = await fetch('/api/ai/analyze-cv-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cvContent: cvText })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        console.error('CV analysis failed:', errorData)
        throw new Error(errorData.error || 'Failed to analyze CV')
      }

      const cvData = await analyzeResponse.json()
      setExtractedData(cvData)

      // Parse the name into firstName and lastName
      const fullName = cvData.name || ''
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Debug CV data extraction
      console.log('🔍 CV Data extracted:', cvData)
      console.log('📧 Email:', cvData.email)
      console.log('📞 Phone:', cvData.phone)
      console.log('📍 Location:', cvData.location)
      console.log('👤 Name parsing:', { fullName, firstName, lastName })

      // Update the cover letter context with extracted data
      updateCoverLetterData({
        personalInfo: {
          firstName,
          lastName
        },
        resumeData: {
          personalInfo: {
            fullName: cvData.name || '',
            email: cvData.email || '',
            phone: cvData.phone || '',
            location: cvData.location || ''
          },
          experience: cvData.experience || [],
          skills: cvData.skills || [],
          education: cvData.education || [],
        },
        extractedFromResume: true
      })

      // Also update the personal info in context directly
      setPersonalInfo({ firstName, lastName })
      
      console.log('✅ Context updated with resume data')

      toast.success('CV analyzed successfully', 'Your information has been extracted. Click continue to proceed.')
      
      // If AI extraction failed but we got a response, show a warning
      if (cvData.error) {
        toast.warning('AI Extraction Limited', cvData.error)
      }
      
      // Additional validation and fallback for missing contact info
      if (!cvData.email && !cvData.phone && !cvData.location) {
        console.warn('⚠️ No contact information extracted')
        toast.info('Contact Info Missing', 'Please verify your contact information in the next steps')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed', error instanceof Error ? error.message : 'There was an error analyzing your CV. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleContinue = () => {
    if (!extractedData && !cvText) {
      toast.error('No resume data', 'Please upload your resume or paste CV text first')
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

            {!uploadedFile && !showTextInput && !extractedData ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload your resume
                </h3>
                <p className="text-gray-600 mb-4">
                  Accepted format: PDF (Max size: 10MB)
                </p>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTextInput(true)
                  }}
                  className="mt-4"
                >
                  Or paste CV text instead
                </Button>
              </div>
            ) : showTextInput ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Paste your CV text
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTextInput(false)
                      setCvText('')
                    }}
                  >
                    Upload PDF instead
                  </Button>
                </div>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your entire CV text here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-4">
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!cvText.trim() || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze CV'
                    )}
                  </Button>
                </div>
                {extractedData && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-semibold mb-2">
                      ✓ CV analyzed successfully
                    </p>
                    <div className="space-y-1 text-sm text-green-700">
                      {extractedData.name && <p>Name: {extractedData.name}</p>}
                      {extractedData.email && <p>Email: {extractedData.email}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{uploadedFile?.name}</p>
                      <p className="text-sm text-gray-600">
                        {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
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

            {/* Show continue button when data is extracted via text input */}
            {showTextInput && extractedData && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleContinue}
                  className="flex items-center gap-2"
                >
                  Continue to Job Description
                  <ArrowRight className="w-4 h-4" />
                </Button>
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
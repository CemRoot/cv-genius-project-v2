'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Save, Wand2, RefreshCw, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'

export default function EditCoverLetterPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { state: contextState } = useCoverLetter()
  
  // States
  const [coverLetterText, setCoverLetterText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [aiInstructions, setAiInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingType, setLoadingType] = useState<'edit' | 'regenerate' | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Load cover letter from localStorage on mount
  useEffect(() => {
    const savedLetter = localStorage.getItem('generated-cover-letter')
    if (savedLetter) {
      setCoverLetterText(savedLetter)
      setOriginalText(savedLetter)
    } else {
      // Redirect back if no cover letter found
      router.push('/cover-letter/results')
    }
  }, [router])

  // Save functionality
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('generated-cover-letter', coverLetterText)
      // Set a flag to indicate we're coming from edit
      localStorage.setItem('cover-letter-edited', 'true')
      
      console.log('💾 Save Debug:')
      console.log('- Saved text length:', coverLetterText.length)
      console.log('- Flag set to:', localStorage.getItem('cover-letter-edited'))
      console.log('- Saved text preview:', coverLetterText.substring(0, 100) + '...')
      
      addToast({
        type: 'success',
        title: 'Saved!',
        description: 'Your cover letter has been saved successfully.'
      })

      // Navigate back to results
      router.push('/cover-letter/results')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save your cover letter. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // AI Text Improvement
  const handleAiEdit = async () => {
    if (!aiInstructions.trim()) {
      addToast({
        type: 'error',
        title: 'Instructions Required',
        description: 'Please provide instructions for how you want to improve the text.'
      })
      return
    }

    setIsLoading(true)
    setLoadingType('edit')
    
    try {
      const response = await fetch('/api/ai/edit-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentText: coverLetterText,
          instructions: aiInstructions,
          action: 'improve'
        })
      })

      const result = await response.json()

      if (result.success) {
        setCoverLetterText(result.improvedText)
        setAiInstructions('')
        
        addToast({
          type: 'success',
          title: 'Text Improved!',
          description: 'AI has successfully improved your cover letter.'
        })
      } else {
        throw new Error(result.error || 'Failed to improve text')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'AI Edit Failed',
        description: 'Failed to improve the text. Please try again.'
      })
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  // AI Regeneration
  const handleAiRegenerate = async () => {
    setIsLoading(true)
    setLoadingType('regenerate')
    
    try {
      // Get original data from localStorage
      const templateData = JSON.parse(localStorage.getItem('cover-letter-template-data') || '{}')
      const jobInfo = JSON.parse(localStorage.getItem('cover-letter-job-info') || '{}')
      const jobDescription = localStorage.getItem('cover-letter-job-description') || ''
      const strengths = JSON.parse(localStorage.getItem('cover-letter-strengths') || '[]')
      const workStyle = localStorage.getItem('cover-letter-work-style') || ''
      
      // Get user's actual contact info from context (same as results page)
      const resumeData = JSON.parse(localStorage.getItem('cover-letter-resume-data') || '{}')
      const userEmail = contextState.resumeData?.personalInfo?.email || resumeData.personalInfo?.email || templateData.personalInfo?.email || ''
      const userPhone = contextState.resumeData?.personalInfo?.phone || resumeData.personalInfo?.phone || templateData.personalInfo?.phone || ''
      const userAddress = contextState.resumeData?.personalInfo?.location || resumeData.personalInfo?.location || templateData.personalInfo?.location || 'Dublin, Ireland'
      
      console.log('🔄 Regenerate Debug:')
      console.log('- Context resume data:', contextState.resumeData?.personalInfo)
      console.log('- userEmail:', userEmail)
      console.log('- userPhone:', userPhone)
      console.log('- userAddress:', userAddress)

      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: 'basic',
          tone: 'formal',
          company: jobInfo.targetCompany || 'Company',
          position: jobInfo.jobTitle || 'Position',
          applicantName: `${contextState.personalInfo?.firstName || templateData.personalInfo?.firstName || 'CEM'} ${contextState.personalInfo?.lastName || templateData.personalInfo?.lastName || 'KOYLUOGLU'}`,
          background: `A dedicated professional with strength in ${strengths.join(', ')}`,
          achievements: strengths,
          jobDescription: jobDescription,
          customInstructions: `Working style: ${workStyle}`,
          includeAddress: true,
          userAddress: userAddress,
          userPhone: userPhone,
          userEmail: userEmail,
          currentDate: new Date().toLocaleDateString('en-IE', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          // Include resume data if available (same as results page)
          resumeData: contextState.resumeData
        })
      })

      const result = await response.json()

      if (result.success) {
        setCoverLetterText(result.coverLetter.content)
        
        addToast({
          type: 'success',
          title: 'New Cover Letter Generated!',
          description: 'AI has created a completely new cover letter for you.'
        })
      } else {
        throw new Error(result.error || 'Failed to regenerate')
      }
    } catch (error) {
      console.error('Regeneration error:', error)
      let errorMessage = 'Failed to generate new cover letter. Please try again.'
      
      // Check if it's a 503 error
      if (error instanceof Error && (error.message.includes('503') || error.message.includes('overloaded'))) {
        errorMessage = 'AI service is temporarily overloaded. Please try again in a few moments.'
      }
      
      addToast({
        type: 'error',
        title: 'Regeneration Failed',
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  // Reset to original
  const handleReset = () => {
    setCoverLetterText(originalText)
    addToast({
      type: 'info',
      title: 'Reset Complete',
      description: 'Cover letter has been reset to original version.'
    })
  }

  // Check for placeholder text
  const hasPlaceholders = () => {
    const placeholders = [
      'Your Target Company',
      'Company Name',
      'Desired Position',
      'your organisation',
      'your organization',
      'the company',
      'your company',
      'your firm',
      'the bank',
      'the organisation',
      'the organization'
    ]
    
    return placeholders.some(placeholder => 
      coverLetterText.toLowerCase().includes(placeholder.toLowerCase())
    )
  }

  // Highlight placeholders in text
  const highlightPlaceholders = (text: string) => {
    const placeholderPatterns = [
      'Your Target Company',
      'Company Name',
      'Desired Position',
      'your organisation',
      'your organization',
      'the company',
      'your company',
      'your firm',
      'the bank',
      'the organisation',
      'the organization'
    ]
    
    const pattern = new RegExp(`(${placeholderPatterns.join('|')})`, 'gi')
    const parts = text.split(pattern)
    
    return parts.map((part, index) => {
      if (placeholderPatterns.some(placeholder => 
        part.toLowerCase() === placeholder.toLowerCase()
      )) {
        return (
          <mark key={index} style={{ 
            backgroundColor: '#ffeb3b',
            fontWeight: 'bold',
            padding: '2px 4px',
            borderRadius: '2px'
          }}>
            {part}
          </mark>
        )
      }
      return part
    })
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Edit Cover Letter
                </h1>
                <p className="text-sm sm:text-lg text-gray-600">
                  Customize your cover letter manually or with AI assistance
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Text Editor - Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cover-letter-text" className="text-lg font-semibold">
                      Cover Letter Content
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-xs sm:text-sm"
                      >
                        {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="ml-1">{showPreview ? 'Edit' : 'Preview'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="text-xs sm:text-sm"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  
                  {/* Warning if placeholders detected */}
                  {hasPlaceholders() && (
                    <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                      <p className="text-yellow-800 text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Generic placeholders detected!
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Replace highlighted text like "Your Target Company" with actual company names. Toggle Preview to see highlighted placeholders.
                      </p>
                    </div>
                  )}
                  
                  {showPreview ? (
                    <div 
                      className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] p-4 border rounded-md bg-gray-50 overflow-auto"
                      style={{ fontFamily: 'serif', whiteSpace: 'pre-wrap' }}
                    >
                      {coverLetterText.split('\n').map((line, index) => (
                        <div key={index} className="text-sm sm:text-base leading-relaxed">
                          {line ? highlightPlaceholders(line) : <br />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      id="cover-letter-text"
                      value={coverLetterText}
                      onChange={(e) => setCoverLetterText(e.target.value)}
                      placeholder="Your cover letter content will appear here..."
                      className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] text-sm sm:text-base leading-relaxed resize-none"
                      style={{ fontFamily: 'serif' }}
                    />
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Tools - Sidebar */}
            <div className="space-y-6">
              
              {/* AI Text Improvement */}
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">AI Text Improvement</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Tell AI how you want to improve your existing cover letter
                  </p>
                  
                  <div className="space-y-3">
                    <Label htmlFor="ai-instructions">Your Instructions</Label>
                    <Textarea
                      id="ai-instructions"
                      value={aiInstructions}
                      onChange={(e) => setAiInstructions(e.target.value)}
                      placeholder="e.g., Make it more professional, add more technical details, make it shorter..."
                      className="min-h-[100px] text-sm resize-none"
                    />
                    
                    <Button
                      onClick={handleAiEdit}
                      disabled={isLoading || !aiInstructions.trim()}
                      className="w-full flex items-center justify-center gap-2"
                      size="sm"
                    >
                      {isLoading && loadingType === 'edit' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span>{isLoading && loadingType === 'edit' ? 'Improving...' : 'Improve Text'}</span>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* AI Regeneration */}
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-lg">AI Regeneration</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Create a completely new cover letter using your original information
                  </p>
                  
                  <Button
                    onClick={handleAiRegenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                  >
                    {isLoading && loadingType === 'regenerate' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>{isLoading && loadingType === 'regenerate' ? 'Generating...' : 'Generate New'}</span>
                  </Button>
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Editing Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use AI improvement for specific changes</li>
                  <li>• Generate new if you want fresh content</li>
                  <li>• Save regularly to prevent data loss</li>
                  <li>• Reset to return to original version</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
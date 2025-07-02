'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Download, FileText, Edit, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
// import { AdController } from '@/components/ads/ad-controller'
import { MainLayout } from '@/components/layout/main-layout'
import { useCoverLetter } from '@/contexts/cover-letter-context'
import { StyledCoverLetter } from '@/components/cover-letter/styled-cover-letter'

interface CollectedData {
  templateData: {
    selectedTemplate: string
    selectedColor: string
    personalInfo: {
      firstName: string
      lastName: string
    }
  }
  jobInfo: {
    targetCompany: string
    jobTitle: string
  }
  jobDescription: string
  strengths: string[]
  workStyle: string
  signature: {
    type: 'drawn' | 'uploaded' | null
    value: string
  }
  // Experience and education data
  experienceLevel?: string
  studentStatus?: string
  schoolType?: string
  educationDetails?: {
    degreeType: string
    fieldOfStudy: string
  }
  collegeGrad?: boolean
}

export default function ResultsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { state: contextState } = useCoverLetter()
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedLetter, setGeneratedLetter] = useState<string>('')
  const [collectedData, setCollectedData] = useState<CollectedData | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  // const [propPushTrigger, setPropPushTrigger] = useState(false)
  const [exportCount, setExportCount] = useState(0)
  const [mobileScale, setMobileScale] = useState(1)
  const [isFullView, setIsFullView] = useState(false)

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    // Format date consistently as DD/MM/YYYY
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    setCurrentDate(`${day}/${month}/${year}`)
  }, [])

  // Calculate scale for mobile view
  useEffect(() => {
    const calculateScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        if (width < 640) {
          // For mobile, calculate exact scale for 430px width
          const targetWidth = 430
          const documentWidth = 800 // A4 width in pixels
          const scale = targetWidth / documentWidth
          setMobileScale(isFullView ? 1 : scale * 0.95) // Slightly smaller to ensure full visibility
        } else if (width < 768) {
          setMobileScale(isFullView ? 1 : 0.7)
        } else {
          setMobileScale(1)
        }
      }
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [isFullView])


  // Separate effect for initial load to avoid dependency issues
  useEffect(() => {
    // Check if we have an edited cover letter
    const editedText = localStorage.getItem('generated-cover-letter')
    const isFromEdit = localStorage.getItem('cover-letter-edited') === 'true'
    const cachedJobDescription = localStorage.getItem('last-generated-job-description')
    const currentJobDescription = localStorage.getItem('cover-letter-job-description') || ''
    
    // Check if job description has changed since last generation
    const jobDescriptionChanged = cachedJobDescription !== currentJobDescription
    
    if (editedText && isFromEdit && !jobDescriptionChanged) {
      // Don't clear the edit flag immediately - keep it until user navigates away or generates new letter
      setGeneratedLetter(editedText)
      setIsGenerating(false)
      
      // Load collected data with better template/color handling
      const templateDataFromStorage = JSON.parse(localStorage.getItem('cover-letter-template-data') || '{}')
      
      // Prioritize context state over localStorage, with fallbacks
      const templateData = {
        selectedTemplate: contextState.selectedTemplate || templateDataFromStorage.selectedTemplate || 'dublin-professional',
        selectedColor: contextState.selectedColor || templateDataFromStorage.selectedColor || 'color1',
        personalInfo: contextState.personalInfo?.firstName ? contextState.personalInfo : templateDataFromStorage.personalInfo
      }
      
      
      const jobInfo = contextState.jobInfo?.targetCompany ? contextState.jobInfo : JSON.parse(localStorage.getItem('cover-letter-job-info') || '{}')
      const jobDescription = localStorage.getItem('cover-letter-job-description') || ''
      const strengths = contextState.strengths?.length > 0 ? contextState.strengths : JSON.parse(localStorage.getItem('cover-letter-strengths') || '[]')
      const workStyle = contextState.workStyle || localStorage.getItem('cover-letter-work-style') || ''
      const signature = JSON.parse(localStorage.getItem('cover-letter-signature') || '{}')

      const data: CollectedData = {
        templateData,
        jobInfo,
        jobDescription,
        strengths,
        workStyle,
        signature,
        experienceLevel: contextState.experienceLevel || undefined,
        studentStatus: contextState.studentStatus || undefined,
        schoolType: contextState.schoolType || undefined,
        educationDetails: contextState.educationDetails || undefined,
        collegeGrad: contextState.collegeGrad || undefined
      }
      
      
      setCollectedData(data)
    } else {
      // No edited text, generate new with improved data handling
      const templateDataFromStorage = JSON.parse(localStorage.getItem('cover-letter-template-data') || '{}')
      
      // Prioritize context state over localStorage, with fallbacks
      const templateData = {
        selectedTemplate: contextState.selectedTemplate || templateDataFromStorage.selectedTemplate || 'dublin-professional',
        selectedColor: contextState.selectedColor || templateDataFromStorage.selectedColor || 'color1',
        personalInfo: contextState.personalInfo?.firstName ? contextState.personalInfo : templateDataFromStorage.personalInfo
      }
      
      
      const jobInfo = contextState.jobInfo?.targetCompany ? contextState.jobInfo : JSON.parse(localStorage.getItem('cover-letter-job-info') || '{}')
      const jobDescription = localStorage.getItem('cover-letter-job-description') || ''
      const strengths = contextState.strengths?.length > 0 ? contextState.strengths : JSON.parse(localStorage.getItem('cover-letter-strengths') || '[]')
      const workStyle = contextState.workStyle || localStorage.getItem('cover-letter-work-style') || ''
      const signature = JSON.parse(localStorage.getItem('cover-letter-signature') || '{}')

      const data: CollectedData = {
        templateData,
        jobInfo,
        jobDescription,
        strengths,
        workStyle,
        signature,
        experienceLevel: contextState.experienceLevel || undefined,
        studentStatus: contextState.studentStatus || undefined,
        schoolType: contextState.schoolType || undefined,
        educationDetails: contextState.educationDetails || undefined,
        collegeGrad: contextState.collegeGrad || undefined
      }
      

      setCollectedData(data)
      
      const performGeneration = async () => {
        // Clear the edit flag when generating new letter
        localStorage.removeItem('cover-letter-edited')
        await generateCoverLetter(data)
      }
      
      performGeneration()
    }
  }, []) // Remove contextState dependency to prevent regeneration when context changes

  // Update localStorage when letter is generated (but not from localStorage)
  const updateLocalStorage = (letter: string) => {
    localStorage.setItem('generated-cover-letter', letter)
  }

  const generateCoverLetter = async (data: CollectedData) => {
    try {
      
      // Ensure we have valid personal info - prioritize context over localStorage
      const firstName = contextState.personalInfo?.firstName || data.templateData?.personalInfo?.firstName || 'John'
      const lastName = contextState.personalInfo?.lastName || data.templateData?.personalInfo?.lastName || 'Doe'
      const strengths = Array.isArray(data.strengths) ? data.strengths : []
      const workStyle = data.workStyle || 'professional'
      
      
      const requestBody = {
        template: getValidTemplate(data.templateData?.selectedTemplate),
        tone: getValidTone(workStyle),
        company: data.jobInfo?.targetCompany || 'Your Target Company',
        position: data.jobInfo?.jobTitle || 'Desired Position',
        jobSource: (data.jobInfo as any)?.jobSource || '',
        applicantName: `${firstName} ${lastName}`,
        background: strengths.length > 0 
          ? `A dedicated professional with ${strengths.length === 1 ? `strength in ${strengths[0]}` : `strengths in ${strengths.slice(0, -1).join(', ')} and ${strengths[strengths.length - 1]}`}`
          : 'A dedicated professional',
        achievements: strengths,
        jobDescription: data.jobDescription || '',
        customInstructions: `Working style: ${workStyle}`,
        includeAddress: true,
        userAddress: contextState.resumeData?.personalInfo?.location || 'Dublin, Ireland',
        userPhone: contextState.resumeData?.personalInfo?.phone || '+353 (0) 1 234 5678',
        userEmail: contextState.resumeData?.personalInfo?.email || '',
        currentDate: currentDate,
        // Include experience and education data
        experienceLevel: data.experienceLevel,
        studentStatus: data.studentStatus,
        schoolType: data.schoolType,
        educationDetails: data.educationDetails,
        collegeGrad: data.collegeGrad,
        // Include resume data if available
        resumeData: contextState.resumeData
      }
      
      
      
      
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      

      if (result.success) {
        const newLetter = result.coverLetter.content
        setGeneratedLetter(newLetter)
        updateLocalStorage(newLetter)
        // Save the job description used for this generation
        localStorage.setItem('last-generated-job-description', data.jobDescription || '')
      } else {
        throw new Error(result.error || 'Failed to generate cover letter')
      }
    } catch (error) {
      
      // Check if it's a rate limit error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('Rate limit exceeded')) {
        addToast({
          type: 'warning',
          title: 'AI Service Busy',
          description: 'Using high-quality backup template due to high demand'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Generation Failed',
          description: 'Failed to generate cover letter. Please try again.'
        })
      }
      
      // Use fallback template
      const fallbackLetter = generateFallbackLetter(data)
      setGeneratedLetter(fallbackLetter)
      updateLocalStorage(fallbackLetter)
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper functions for template and tone validation
  const getValidTemplate = (template: string) => {
    const validTemplates = ['basic', 'highPerformer', 'creative', 'graduate', 'careerChange', 'executive']
    return validTemplates.includes(template) ? template : 'basic'
  }

  const getValidTone = (workStyle: string) => {
    const validTones = ['formal', 'friendly', 'enthusiastic']
    // Map work styles to tones
    const toneMap: { [key: string]: string } = {
      'collaborative': 'friendly',
      'independent': 'formal',
      'leadership': 'enthusiastic',
      'analytical': 'formal',
      'creative': 'enthusiastic',
      'detail-oriented': 'formal'
    }
    const mappedTone = toneMap[workStyle?.toLowerCase()] || 'formal'
    return validTones.includes(mappedTone) ? mappedTone : 'formal'
  }

  const generateFallbackLetter = (data: CollectedData) => {
    // Prioritize context over localStorage for personal info
    const firstName = contextState.personalInfo?.firstName || data.templateData?.personalInfo?.firstName || 'John'
    const lastName = contextState.personalInfo?.lastName || data.templateData?.personalInfo?.lastName || 'Doe'
    const name = `${firstName} ${lastName}`
    
    // Ensure strengths is an array
    const strengths = Array.isArray(data.strengths) ? data.strengths : []
    const workStyle = data.workStyle || 'professional'
    
    let openingParagraph = ''
    let secondParagraph = ''
    
    if (data.experienceLevel === 'no') {
      openingParagraph = `I am writing to express my strong interest in the ${data.jobInfo.jobTitle || 'position'} at ${data.jobInfo.targetCompany || 'your company'}. As an enthusiastic ${data.studentStatus === 'yes' ? (data.schoolType === 'college' && data.educationDetails ? `${data.educationDetails.degreeType} student in ${data.educationDetails.fieldOfStudy}` : 'student') : (data.collegeGrad && data.educationDetails ? `recent graduate with a ${data.educationDetails.degreeType} in ${data.educationDetails.fieldOfStudy}` : 'candidate')}, I am eager to begin my professional journey with your organization.`
      
      const strengthsText = strengths.length > 0
        ? (strengths.length === 1 
          ? `My strength in ${strengths[0]}` 
          : `My strengths in ${strengths.slice(0, -1).join(', ')} and ${strengths[strengths.length - 1]}`)
        : 'My academic foundations and enthusiasm'
      
      secondParagraph = `While I may not have formal work experience, I bring fresh perspectives, strong academic foundations, and genuine enthusiasm for this field. ${strengthsText} ${strengths.length > 0 ? 'has' : 'have'} been developed through coursework, projects, and extracurricular activities. I am highly motivated to learn and grow within your organization.`
    } else {
      const strengthsText = strengths.length > 0
        ? (strengths.length === 1 
          ? ` with strength in ${strengths[0]}` 
          : ` with strengths in ${strengths.slice(0, -1).join(', ')} and ${strengths[strengths.length - 1]}`)
        : ''
      
      openingParagraph = `I am writing to express my interest in the ${data.jobInfo?.jobTitle || 'position'} at ${data.jobInfo?.targetCompany || 'your company'}. As a dedicated professional${strengthsText}, I believe I can contribute positively to your team.`
      
      const workStyleText = workStyle ? `${workStyle.toLowerCase()} ` : ''
      secondParagraph = `My working style reflects my ${workStyleText}approach. Throughout my career, I have consistently demonstrated these qualities through various projects and responsibilities.`
    }
    
    const userAddress = contextState.resumeData?.personalInfo?.location || 'Dublin, Ireland'
    const userPhone = contextState.resumeData?.personalInfo?.phone || '+353 (0) 1 234 5678'
    const userEmail = contextState.resumeData?.personalInfo?.email || ''

    return `${userAddress}
${userPhone}${userEmail ? `\n${userEmail}` : ''}
${currentDate}

Hiring Manager
${data.jobInfo?.targetCompany || 'Company Name'}
Dublin, Ireland

Dear Hiring Manager,

${openingParagraph}

${secondParagraph}

${data.jobDescription ? `Based on the job description provided, I am particularly excited about the opportunity to apply my skills in a role that aligns so well with my ${data.experienceLevel === 'no' ? 'interests and academic background' : 'experience and interests'}.` : 'I have enclosed my CV, which provides additional details about my qualifications and experience.'}

I would welcome the opportunity to discuss how my background and skills can contribute to ${data.jobInfo?.targetCompany || 'your organization'}'s continued success. I am available for interview at your convenience.

Thank you for considering my application. I look forward to hearing from you.

Yours sincerely,
${name}`
  }


  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Create a container for the StyledCoverLetter component
      const pdfContainer = document.createElement('div')
      pdfContainer.style.position = 'fixed'
      pdfContainer.style.top = '-10000px'
      pdfContainer.style.left = '0'
      pdfContainer.style.width = '794px'  // A4 width in pixels at 96 DPI
      pdfContainer.style.backgroundColor = '#ffffff'
      pdfContainer.style.overflow = 'visible'
      
      // Create a wrapper div with proper dimensions - no extra padding
      const wrapper = document.createElement('div')
      wrapper.style.width = '100%'
      wrapper.style.backgroundColor = '#ffffff'
      wrapper.style.boxSizing = 'border-box'
      
      // Create React root and render StyledCoverLetter
      const ReactDOM = (await import('react-dom/client')).default
      const root = ReactDOM.createRoot(wrapper)
      
      // Wait for React to render
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(StyledCoverLetter, {
            content: generatedLetter,
            templateId: collectedData?.templateData.selectedTemplate || 'dublin-professional',
            colorOption: collectedData?.templateData.selectedColor || 'color1',
            signature: collectedData?.signature,
            isPdfExport: true
          })
        )
        setTimeout(resolve, 1500) // Give more time for complete render
      })
      
      pdfContainer.appendChild(wrapper)
      document.body.appendChild(pdfContainer)

      // Get actual rendered dimensions
      const actualContentHeight = wrapper.scrollHeight
      const pageHeight = 1123 // A4 height in pixels at 96 DPI
      const pageWidth = 794 // A4 width in pixels at 96 DPI

      // Capture with html2canvas with proper dimensions
      const canvas = await html2canvas(wrapper, {
        useCORS: true,
        background: '#ffffff',
        logging: false,
        scale: 3, // Higher quality for better text rendering
        width: pageWidth,
        height: Math.max(actualContentHeight, pageHeight),
        windowWidth: pageWidth,
        windowHeight: Math.max(actualContentHeight, pageHeight),
        onclone: (clonedDoc) => {
          // Set willReadFrequently on cloned canvas elements to avoid performance warning
          const canvasElements = clonedDoc.querySelectorAll('canvas')
          canvasElements.forEach((canvas) => {
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (ctx) {
              // Context is now optimized for frequent reads
            }
          })
        }
      })
      
      // Clean up React and DOM
      root.unmount()
      document.body.removeChild(pdfContainer)
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Calculate dimensions with proper margins
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const margin = 10 // 10mm margins on all sides
      const contentWidth = pdfWidth - (2 * margin)
      
      // Calculate the aspect ratio
      const canvasAspectRatio = canvas.height / canvas.width
      const scaledContentHeight = contentWidth * canvasAspectRatio
      
      // Add the image to PDF without scaling or centering
      // Use full page dimensions
      pdf.addImage(
        canvas.toDataURL('image/PNG', 1.0),
        'PNG',
        0, // No left margin
        0, // No top margin
        pdfWidth, // Full width
        pdfHeight // Full height
      )
      
      // Save the PDF
      pdf.save(`Cover_Letter_${collectedData?.jobInfo.targetCompany || 'Document'}.pdf`)
        
        addToast({
          type: 'success',
          title: 'PDF Downloaded',
        description: 'Your cover letter has been downloaded as PDF with high quality.'
        })

        // Trigger monetization after first download
        setExportCount(prev => prev + 1)
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to export PDF. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToDOCX = async () => {
    setIsExporting(true)
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Letter content (includes header from AI generation)
            ...generatedLetter.split('\n').filter(line => line.trim()).map(line => 
              new Paragraph({
                text: line,
                spacing: { after: 200 }
              })
            ),
            
            // Signature space
            new Paragraph({
              text: '',
              spacing: { after: 300 }
            }),
            
            // Signature
            new Paragraph({
              children: [
                new TextRun({
                  text: collectedData?.signature ? '[Signature]' : `${collectedData?.templateData.personalInfo?.firstName} ${collectedData?.templateData.personalInfo?.lastName}`,
                  size: 24,
                  color: '000000'
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { before: 200 }
            })
          ]
        }]
      })

      const buffer = await Packer.toBlob(doc)
      saveAs(buffer, `Cover_Letter_${collectedData?.jobInfo.targetCompany || 'Document'}.docx`)
      
      addToast({
        type: 'success',
        title: 'DOCX Downloaded',
        description: 'Your cover letter has been downloaded as DOCX.'
      })

      // Trigger monetization after first download
      setExportCount(prev => prev + 1)
    } catch (error) {
      // Silently handle export errors in production
      if (process.env.NODE_ENV === 'development') {
        // Error logging disabled in production
      }
      addToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to export DOCX. Please try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isGenerating) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Generating Your Cover Letter</h2>
            <p className="text-gray-600">Our AI is crafting your personalized cover letter...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cover Letter is Ready!
            </h1>
            <p className="text-lg text-gray-600">
              Review your AI-generated cover letter below
            </p>
          </div>
        </div>
      </div>

      <div className="w-full sm:max-w-5xl mx-auto sm:px-6 lg:px-8 py-4 sm:py-12">
        {/* Warning if generic company name is detected */}
        {generatedLetter && (generatedLetter.includes('Your Target Company') || 
          generatedLetter.includes('your organisation') || 
          generatedLetter.includes('your organization')) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Important: Generic company references detected!
            </p>
            <p className="text-red-700 text-sm mt-1">
              Please click "Edit Cover Letter" to replace highlighted placeholders with actual company names before sending.
            </p>
          </div>
        )}
        
        {/* Mobile view toggle */}
        <div className="mb-4 flex justify-end sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullView(!isFullView)}
            className="flex items-center gap-2"
          >
            {isFullView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullView ? 'Fit to Screen' : 'Full Size'}
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/cover-letter/edit')}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Edit className="w-4 h-4" />
            Edit Cover Letter
          </Button>
            {localStorage.getItem('cover-letter-edited') === 'true' && (
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('cover-letter-edited')
                  window.location.reload()
                }}
                className="flex items-center gap-2 w-full sm:w-auto text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Letter
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Export PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToDOCX}
              className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
            >
              <Download className="w-4 h-4" />
              <span>Export DOCX</span>
            </Button>
          </div>
        </div>

        {/* Mobile responsive wrapper for cover letter preview */}
        <div className="w-full flex justify-center sm:block">
          <div 
            className="overflow-hidden"
            style={{
              height: typeof window !== 'undefined' && window.innerWidth < 768 ? '506px' : 'auto',
              width: typeof window !== 'undefined' && window.innerWidth < 768 ? '430px' : 'auto',
              position: 'relative'
            }}
          >
            <div 
              className="transition-transform duration-300"
              style={{
                transform: `scale(${mobileScale})`,
                transformOrigin: 'top left',
                width: mobileScale < 1 ? `${100 / mobileScale}%` : '100%',
                maxWidth: '800px'
              }}
            >
              <Card className="p-0 overflow-hidden" id="cover-letter-preview">
                <div className="bg-white" style={{
                  padding: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : '32px'
                }}>
            <StyledCoverLetter
              content={generatedLetter}
              templateId={collectedData?.templateData.selectedTemplate || 'dublin-professional'}
              colorOption={collectedData?.templateData.selectedColor}
              signature={collectedData?.signature}
            />
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/cover-letter/signature')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Signature</span>
          </Button>
          <Button
            onClick={() => router.push('/cover-letter')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]"
          >
            <FileText className="w-4 h-4" />
            <span>Start New Letter</span>
          </Button>
        </div>

        {/* Ad component temporarily disabled due to prop mismatch */}
      </div>
      </div>
    </MainLayout>
  )
}
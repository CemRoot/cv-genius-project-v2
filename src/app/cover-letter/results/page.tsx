'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Download, FileText, Edit, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import { AdController } from '@/components/ads/ad-controller'
import { MainLayout } from '@/components/layout/main-layout'

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
}

export default function ResultsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedLetter, setGeneratedLetter] = useState<string>('')
  const [collectedData, setCollectedData] = useState<CollectedData | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [propPushTrigger, setPropPushTrigger] = useState(false)
  const [exportCount, setExportCount] = useState(0)

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    // Format date consistently as DD/MM/YYYY
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    setCurrentDate(`${day}/${month}/${year}`)
  }, [])

  useEffect(() => {
    // Collect all data from localStorage
    const templateData = JSON.parse(localStorage.getItem('cover-letter-template-data') || '{}')
    const jobInfo = JSON.parse(localStorage.getItem('cover-letter-job-info') || '{}')
    const jobDescription = localStorage.getItem('cover-letter-job-description') || ''
    const strengths = JSON.parse(localStorage.getItem('cover-letter-strengths') || '[]')
    const workStyle = localStorage.getItem('cover-letter-work-style') || ''
    const signature = JSON.parse(localStorage.getItem('cover-letter-signature') || '{}')

    const data = {
      templateData,
      jobInfo,
      jobDescription,
      strengths,
      workStyle,
      signature
    }

    setCollectedData(data)
    
    const performGeneration = async () => {
      await generateCoverLetter(data)
    }
    
    performGeneration()
  }, []) // generateCoverLetter is stable as it doesn't depend on any state

  // Check for edited cover letter text on mount only
  useEffect(() => {
    const editedText = localStorage.getItem('generated-cover-letter')
    if (editedText) {
      setGeneratedLetter(editedText)
    }
  }, []) // Only run on mount

  // Update localStorage when letter is generated (but not from localStorage)
  const updateLocalStorage = (letter: string) => {
    localStorage.setItem('generated-cover-letter', letter)
  }

  const generateCoverLetter = async (data: CollectedData) => {
    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: getValidTemplate(data.templateData.selectedTemplate),
          tone: getValidTone(data.workStyle),
          company: data.jobInfo.targetCompany || 'Your Target Company',
          position: data.jobInfo.jobTitle || 'Desired Position',
          applicantName: `${data.templateData.personalInfo?.firstName} ${data.templateData.personalInfo?.lastName}`,
          background: `A dedicated professional with strength in ${data.strengths.length > 1 ? data.strengths.slice(0, -1).join(', ') + ', and ' + data.strengths.slice(-1) : data.strengths.join('')}`,
          achievements: data.strengths,
          jobDescription: data.jobDescription,
          customInstructions: `Working style: ${data.workStyle}`,
          includeAddress: true,
          userAddress: 'Dublin, Ireland',
          userPhone: '+353 (0) 1 234 5678',
          currentDate: currentDate
        })
      })

      const result = await response.json()

      if (result.success) {
        const newLetter = result.coverLetter.content
        setGeneratedLetter(newLetter)
        updateLocalStorage(newLetter)
      } else {
        throw new Error(result.error || 'Failed to generate cover letter')
      }
    } catch (error) {
      // Silently handle generation errors in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Generation error:', error)
      }
      addToast({
        type: 'error',
        title: 'Generation Failed',
        description: 'Failed to generate cover letter. Please try again.'
      })
      
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
    const name = `${data.templateData.personalInfo?.firstName} ${data.templateData.personalInfo?.lastName}`
    
    return `Dublin, Ireland
+353 (0) 1 234 5678
${currentDate}

Hiring Manager
${data.jobInfo.targetCompany || 'Company Name'}
Dublin, Ireland

Dear Hiring Manager,

I am writing to express my interest in the ${data.jobInfo.jobTitle || 'position'} at ${data.jobInfo.targetCompany || 'your company'}. As a dedicated professional with strength in ${data.strengths.length > 1 ? data.strengths.slice(0, -1).join(', ') + ', and ' + data.strengths.slice(-1) : data.strengths.join('')}, I believe I can contribute positively to your team.

My working style reflects my ${data.workStyle.toLowerCase()} approach. Throughout my career, I have consistently demonstrated these qualities through various projects and responsibilities.

${data.jobDescription ? `Based on the job description provided, I am particularly excited about the opportunity to apply my skills in a role that aligns so well with my experience and interests.` : 'I have enclosed my CV, which provides additional details about my qualifications and experience.'}

I would welcome the opportunity to discuss how my background and skills can contribute to ${data.jobInfo.targetCompany || 'your organization'}'s continued success. I am available for interview at your convenience.

Thank you for considering my application. I look forward to hearing from you.

Yours sincerely,

${name}`
  }

  const renderSignature = () => {
    if (!collectedData?.signature) {
      // Default signature if none provided
      return (
        <div style={{ color: 'black', fontFamily: 'serif', fontSize: '16px' }}>
          {`${collectedData?.templateData.personalInfo?.firstName} ${collectedData?.templateData.personalInfo?.lastName}`}
        </div>
      )
    }

    if (collectedData.signature.type === 'drawn' || collectedData.signature.type === 'uploaded') {
      return (
        <img 
          src={collectedData.signature.value} 
          alt="Signature" 
          style={{ 
            maxHeight: '50px', 
            marginTop: '5px',
            filter: 'contrast(1.2)' // Improve contrast
          }}
        />
      )
    }
    return null
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const letterElement = document.getElementById('cover-letter-preview')
      if (letterElement) {
        // Store original styles
        const originalStyles = {
          width: letterElement.style.width,
          maxWidth: letterElement.style.maxWidth,
          minWidth: letterElement.style.minWidth,
          transform: letterElement.style.transform,
          padding: letterElement.style.padding
        }

        // Apply fixed dimensions for consistent PDF export
        letterElement.style.width = '794px' // A4 width in pixels
        letterElement.style.maxWidth = '794px'
        letterElement.style.minWidth = '794px'
        letterElement.style.transform = 'none'
        letterElement.style.padding = '40px'
        
        // Hide edit buttons during export
        const editButtons = letterElement.querySelectorAll('.no-export')
        editButtons.forEach(btn => (btn as HTMLElement).style.display = 'none')
        
        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Mobile-optimized canvas options
        const dpr = window.devicePixelRatio || 1
        const isMobile = window.innerWidth < 768
        
        const canvas = await html2canvas(letterElement, {
          scale: isMobile ? Math.max(dpr * 1.5, 2) : 2,
          width: 794, // Fixed A4 width
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          removeContainer: true,
          logging: false,
          letterRendering: true,
          foreignObjectRendering: false, // Better mobile compatibility
          ignoreElements: (element) => {
            return element.classList.contains('no-export') || element.classList.contains('print:hidden')
          }
        })
        
        // Restore original styles
        Object.assign(letterElement.style, originalStyles)
        
        // Restore edit buttons after export
        editButtons.forEach(btn => (btn as HTMLElement).style.display = '')
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        
        // Calculate proper scaling to maintain aspect ratio
        const canvasAspectRatio = canvas.height / canvas.width
        let finalWidth = pdfWidth
        let finalHeight = pdfWidth * canvasAspectRatio
        let xOffset = 0
        let yOffset = 0
        
        // If height exceeds page, scale down proportionally
        if (finalHeight > pdfHeight) {
          finalHeight = pdfHeight
          finalWidth = pdfHeight / canvasAspectRatio
          xOffset = (pdfWidth - finalWidth) / 2 // Center horizontally
        } else {
          // Center vertically if content doesn't fill the page
          yOffset = (pdfHeight - finalHeight) / 2
        }
        
        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight)
        pdf.save(`Cover_Letter_${collectedData?.jobInfo.targetCompany || 'Document'}.pdf`)
        
        addToast({
          type: 'success',
          title: 'PDF Downloaded',
          description: 'Your cover letter has been downloaded as PDF.'
        })

        // Trigger monetization after first download
        setExportCount(prev => prev + 1)
        if (exportCount === 0) {
          setTimeout(() => {
            setPropPushTrigger(true)
          }, 1500)
        }
      }
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
      if (exportCount === 0) {
        setTimeout(() => {
          setPropPushTrigger(true)
        }, 1500)
      }
    } catch (error) {
      // Silently handle export errors in production
      if (process.env.NODE_ENV === 'development') {
        console.error('DOCX export error:', error)
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/cover-letter/edit')}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Edit className="w-4 h-4" />
            Edit Cover Letter
          </Button>
          
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

        <Card className="p-4 sm:p-8" id="cover-letter-preview">
          <div className="space-y-6 font-serif">
            {/* Letter content - this contains the header already */}
            <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {generatedLetter}
            </div>

            {/* Signature */}
            <div className="mt-8">
              <div style={{ color: 'black', fontFamily: 'serif' }}>
                {renderSignature()}
              </div>
            </div>
          </div>
        </Card>

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

        {/* PropPush - Cover Letter Download Triggered Notification */}
        <AdController 
          type="propush" 
          trigger={propPushTrigger}
          onTrigger={() => {
            setTimeout(() => setPropPushTrigger(false), 5000)
          }}
          delay={2000}
        />
      </div>
      </div>
    </MainLayout>
  )
}
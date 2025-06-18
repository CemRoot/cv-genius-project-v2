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
    type: 'typed' | 'drawn' | 'uploaded' | null
    value: string
    font?: string
    align?: 'left' | 'center' | 'right'
    color?: string
    size?: 'small' | 'large'
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedLetter, setGeneratedLetter] = useState<string>('')
  const [collectedData, setCollectedData] = useState<CollectedData | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [propPushTrigger, setPropPushTrigger] = useState(false)
  const [exportCount, setExportCount] = useState(0)

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-IE'))
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

  const generateCoverLetter = async (data: CollectedData) => {
    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: data.templateData.selectedTemplate || 'basic',
          tone: data.workStyle,
          company: data.jobInfo.targetCompany || 'Your Target Company',
          position: data.jobInfo.jobTitle || 'Desired Position',
          applicantName: `${data.templateData.personalInfo?.firstName} ${data.templateData.personalInfo?.lastName}`,
          background: `A dedicated professional with strengths in ${data.strengths.join(', ')}`,
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
        setGeneratedLetter(result.coverLetter.content)
      } else {
        throw new Error(result.error || 'Failed to generate cover letter')
      }
    } catch (error) {
      console.error('Generation error:', error)
      addToast({
        type: 'error',
        title: 'Generation Failed',
        description: 'Failed to generate cover letter. Please try again.'
      })
      
      // Use fallback template
      setGeneratedLetter(generateFallbackLetter(data))
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackLetter = (data: CollectedData) => {
    const name = `${data.templateData.personalInfo?.firstName} ${data.templateData.personalInfo?.lastName}`
    
    return `${name}
Dublin, Ireland
+353 (0) 1 234 5678
${currentDate}

${data.jobInfo.targetCompany || 'Company Name'}
Dublin, Ireland

Dear Hiring Manager,

I am writing to express my interest in the ${data.jobInfo.jobTitle || 'position'} at ${data.jobInfo.targetCompany || 'your company'}. As a dedicated professional with strengths in ${data.strengths.join(', ')}, I believe I can contribute positively to your team.

My working style reflects my ${data.workStyle.toLowerCase()} approach. Throughout my career, I have consistently demonstrated these qualities through various projects and responsibilities.

${data.jobDescription ? `Based on the job description provided, I am particularly excited about the opportunity to apply my skills in a role that aligns so well with my experience and interests.` : ''}

I would welcome the opportunity to discuss how my background and skills can contribute to ${data.jobInfo.targetCompany || 'your organization'}'s continued success.

Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.

Sincerely,
${name}`
  }

  const renderSignature = () => {
    if (!collectedData?.signature) return null

    if (collectedData.signature.type === 'typed') {
      return (
        <div 
          style={{
            fontFamily: collectedData.signature.font,
            fontSize: collectedData.signature.size === 'large' ? '24px' : '18px',
            color: collectedData.signature.color,
            textAlign: collectedData.signature.align
          }}
        >
          {collectedData.signature.value}
        </div>
      )
    } else if (collectedData.signature.type === 'drawn' || collectedData.signature.type === 'uploaded') {
      return (
        <img 
          src={collectedData.signature.value} 
          alt="Signature" 
          style={{ maxHeight: '60px', marginTop: '10px' }}
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
        const canvas = await html2canvas(letterElement)
        const imgData = canvas.toDataURL('image/png')
        
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Cover_Letter_${collectedData?.jobInfo.targetCompany || 'Document'}.pdf`)
        
        addToast({
          type: 'success',
          title: 'PDF Downloaded',
          description: 'Your cover letter has been downloaded as PDF.'
        })
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
            // Header with contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${collectedData?.templateData.personalInfo?.firstName} ${collectedData?.templateData.personalInfo?.lastName}`,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: "Dublin, Ireland",
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "+353 (0) 1 234 5678",
              spacing: { after: 300 }
            }),
            new Paragraph({
              text: currentDate,
              spacing: { after: 400 }
            }),
            
            // Company info
            new Paragraph({
              text: collectedData?.jobInfo.targetCompany || 'Company Name',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Dublin, Ireland",
              spacing: { after: 400 }
            }),
            
            // Letter content
            ...generatedLetter.split('\n').map(line => 
              new Paragraph({
                text: line,
                spacing: { after: 200 }
              })
            ),
            
            // Signature
            new Paragraph({
              children: [
                new TextRun({
                  text: collectedData?.signature.value || `${collectedData?.templateData.personalInfo?.firstName} ${collectedData?.templateData.personalInfo?.lastName}`,
                  italics: collectedData?.signature.type === 'typed',
                  size: collectedData?.signature.size === 'large' ? 28 : 24
                })
              ],
              alignment: collectedData?.signature.align === 'center' 
                ? AlignmentType.CENTER 
                : collectedData?.signature.align === 'right' 
                  ? AlignmentType.RIGHT 
                  : AlignmentType.LEFT,
              spacing: { before: 400 }
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
    } catch (error) {
      console.error('DOCX export error:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Generating Your Cover Letter</h2>
          <p className="text-gray-600">Our AI is crafting your personalized cover letter...</p>
        </div>
      </div>
    )
  }

  return (
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
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="flex items-center gap-2"
          >
            {showContactInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showContactInfo ? 'Hide' : 'Show'} Contact Info
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={exportToDOCX}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export DOCX
            </Button>
          </div>
        </div>

        <Card className="p-8" id="cover-letter-preview">
          <div className="space-y-6 font-serif">
            {/* Header with contact info */}
            {showContactInfo && (
              <div className="text-sm">
                <div className="font-semibold">
                  {collectedData?.templateData.personalInfo?.firstName} {collectedData?.templateData.personalInfo?.lastName}
                </div>
                <div>Dublin, Ireland</div>
                <div>+353 (0) 1 234 5678</div>
                <div className="mt-4">{currentDate}</div>
              </div>
            )}

            {/* Letter content */}
            <div className="whitespace-pre-wrap leading-relaxed">
              {generatedLetter}
            </div>

            {/* Signature */}
            <div className="mt-8">
              {renderSignature()}
            </div>
          </div>
        </Card>

        <div className="mt-8 flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/cover-letter/signature')}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Signature
          </Button>
          <Button
            onClick={() => router.push('/cover-letter')}
            className="flex items-center gap-2"
          >
            Start New Letter
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCVStore } from '@/store/cv-store'
import { 
  Download, 
  FileText, 
  File, 
  Eye, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowLeft
} from 'lucide-react'
import { saveAs } from 'file-saver'
import { generateCVPDF, validateCVForPDF } from '@/lib/pdf-export-service'

type ExportFormat = 'pdf' | 'docx' | 'txt'

interface ExportProgress {
  format: ExportFormat
  progress: number
  status: 'idle' | 'generating' | 'complete' | 'error'
  error?: string
}


interface ExportManagerProps {
  isMobile?: boolean
}

const exportFormats = [
  {
    id: 'pdf' as const,
    name: 'PDF',
    description: 'Universal format, maintains formatting',
    icon: FileText,
    recommended: true,
    compatibility: 'Excellent ATS compatibility'
  },
  {
    id: 'docx' as const,
    name: 'Word Document',
    description: 'Editable format for further customization',
    icon: File,
    recommended: false,
    compatibility: 'Good ATS compatibility'
  },
  {
    id: 'txt' as const,
    name: 'Plain Text',
    description: 'Simple text format',
    icon: FileText,
    recommended: false,
    compatibility: 'Basic ATS compatibility'
  }
]

export function ExportManager({ isMobile = false }: ExportManagerProps) {
  const { currentCV } = useCVStore()
  const [exportProgress, setExportProgress] = useState<Record<ExportFormat, ExportProgress>>({
    pdf: { format: 'pdf', progress: 0, status: 'idle' },
    docx: { format: 'docx', progress: 0, status: 'idle' },
    txt: { format: 'txt', progress: 0, status: 'idle' }
  })
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const [showSettings, setShowSettings] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState<string>('')

  // Update progress state
  const updateProgress = (format: ExportFormat, updates: Partial<ExportProgress>) => {
    setExportProgress(prev => ({
      ...prev,
      [format]: { ...prev[format], ...updates }
    }))
  }

  // Function to generate PDF using React-PDF renderer
  const generatePDF = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    try {
      console.log('🖨️ Starting React-PDF generation...')
      
      // Validate CV data before export
      const validation = validateCVForPDF(currentCV)
      if (!validation.isValid) {
        console.warn('⚠️ CV validation warnings:', validation.errors)
        // Continue with generation but log warnings
      }
      
      // Generate PDF using React-PDF renderer for perfect consistency
      const pdfBlob = await generateCVPDF(currentCV, {
        quality: 'high',
        enableOptimization: true
      })
      
      console.log('✅ PDF generated successfully with React-PDF')
      
      return pdfBlob
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateDOCX = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    console.log('Generating DOCX with CV data:', currentCV.id)
    
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: currentCV,
          format: 'docx'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'DOCX generation failed')
      }

      const blob = await response.blob()
      console.log('✅ DOCX generated successfully')
      return blob
    } catch (error) {
      console.error('❌ DOCX generation failed:', error)
      throw new Error(`DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateTXT = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    // Simple text conversion
    const txtContent = `
${currentCV.personal.fullName}
${currentCV.personal.email}
${currentCV.personal.phone}
${currentCV.personal.address}

${currentCV.personal.summary ? `SUMMARY\n${currentCV.personal.summary}\n\n` : ''}

EXPERIENCE
${currentCV.experience.map(exp => `
${exp.position} at ${exp.company}
${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
${exp.description}
${exp.achievements?.map(ach => `• ${ach}`).join('\n') || ''}
`).join('\n')}

EDUCATION
${currentCV.education.map(edu => `
${edu.degree} - ${edu.institution}
${edu.startDate} - ${edu.endDate}
${edu.grade ? `Grade: ${edu.grade}` : ''}
${edu.description || ''}
`).join('\n')}

SKILLS
${currentCV.skills.map(skill => skill.name).join(', ')}
    `.trim()

    return new Blob([txtContent], { type: 'text/plain' })
  }

  const handleExport = async (format: ExportFormat) => {
    if (!currentCV) {
      console.error('No CV data available')
      return
    }

    updateProgress(format, { status: 'generating', progress: 0 })
    
    try {
      let blob: Blob
      let filename: string
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        updateProgress(format, { progress: prev => Math.min(prev + 10, 90) })
      }, 100)

      switch (format) {
        case 'pdf':
          blob = await generatePDF()
          filename = `${currentCV.personal.fullName || 'cv'}-export.pdf`
          break
        case 'docx':
          blob = await generateDOCX()
          filename = `${currentCV.personal.fullName || 'cv'}-export.docx`
          break
        case 'txt':
          blob = await generateTXT()
          filename = `${currentCV.personal.fullName || 'cv'}-export.txt`
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      clearInterval(progressInterval)
      updateProgress(format, { status: 'complete', progress: 100 })

      // Download the file
      saveAs(blob, filename)
      
      // Reset progress after a delay
      setTimeout(() => {
        updateProgress(format, { status: 'idle', progress: 0 })
      }, 2000)

    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error)
      updateProgress(format, { 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Export failed' 
      })
      
      // Reset error state after a delay
      setTimeout(() => {
        updateProgress(format, { status: 'idle', progress: 0, error: undefined })
      }, 3000)
    }
  }

  // Calculate estimated file size
  useEffect(() => {
    if (currentCV) {
      const textLength = JSON.stringify(currentCV).length
      const estimatedKB = Math.round(textLength / 100) // Rough estimate
      setEstimatedSize(`~${estimatedKB}KB`)
    }
  }, [currentCV])

  const getStatusIcon = (status: ExportProgress['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ExportProgress['status']) => {
    switch (status) {
      case 'generating':
        return 'bg-blue-500'
      case 'complete':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  if (!currentCV) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No CV Data Available</h3>
        <p className="text-gray-600">Please create or load a CV before exporting.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export CV</h2>
          <p className="text-gray-600">Choose your preferred format and download</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Estimated Size</label>
                <p className="text-sm text-gray-600">{estimatedSize}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Quality</label>
                <p className="text-sm text-gray-600">High quality PDF generation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportFormats.map((format) => {
          const progress = exportProgress[format.id]
          const IconComponent = format.icon
          
          return (
            <Card 
              key={format.id} 
              className={`relative transition-all duration-200 ${
                selectedFormat === format.id 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{format.name}</CardTitle>
                  </div>
                  {format.recommended && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <CardDescription>{format.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-xs text-gray-500">
                  {format.compatibility}
                </div>
                
                {progress.status === 'generating' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating...</span>
                      <span>{progress.progress}%</span>
                    </div>
                    <Progress 
                      value={progress.progress} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {progress.status === 'error' && (
                  <div className="text-sm text-red-600">
                    {progress.error}
                  </div>
                )}
                
                <Button 
                  onClick={() => handleExport(format.id)}
                  disabled={progress.status === 'generating'}
                  className="w-full"
                  variant={selectedFormat === format.id ? 'default' : 'outline'}
                >
                  {getStatusIcon(progress.status)}
                  <span className="ml-2">
                    {progress.status === 'generating' ? 'Generating...' : 
                     progress.status === 'complete' ? 'Download Again' : 
                     `Export ${format.name}`}
                  </span>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Export All Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export All Formats</h3>
              <p className="text-sm text-gray-600">Download PDF, DOCX, and TXT in one go</p>
            </div>
            <Button
              onClick={() => {
                handleExport('pdf')
                setTimeout(() => handleExport('docx'), 500)
                setTimeout(() => handleExport('txt'), 1000)
              }}
              disabled={Object.values(exportProgress).some(p => p.status === 'generating')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
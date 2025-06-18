"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { motion, AnimatePresence } from 'framer-motion'
import { useCVStore } from '@/store/cv-store'
import { pdf } from '@react-pdf/renderer'
import { HarvardTemplate } from './pdf-templates'
import { useRouter } from 'next/navigation'
import { AdController } from '@/components/ads/ad-controller'

type ExportFormat = 'pdf' | 'docx' | 'txt'

interface ExportProgress {
  format: ExportFormat
  progress: number
  status: 'idle' | 'generating' | 'complete' | 'error'
  error?: string
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
    recommended: true,
    compatibility: 'Highest ATS compatibility'
  },
  {
    id: 'txt' as const,
    name: 'Plain Text',
    description: 'Simple text format for online applications',
    icon: FileText,
    recommended: false,
    compatibility: 'Good for ATS, loses formatting'
  }
]

export function ExportManager() {
  const { currentCV } = useCVStore()
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['pdf'])
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [propPushTrigger, setPropPushTrigger] = useState(false)
  const [downloadCount, setDownloadCount] = useState(0)
  const router = useRouter()

  const handleFormatToggle = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  const generatePDF = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    const doc = <HarvardTemplate data={currentCV} />
    const blob = await pdf(doc).toBlob()
    return blob
  }

  const generateDOCX = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    console.log('Generating DOCX with CV data:', currentCV.id)
    
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData: currentCV,
          template: "harvard"
        })
      })
      
      console.log('DOCX API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('DOCX API error:', errorText)
        throw new Error(`DOCX generation failed: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('DOCX blob generated, size:', blob.size)
      return blob
    } catch (error) {
      console.error('DOCX generation error:', error)
      throw new Error(`DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateTXT = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    let content = `${currentCV.personal.fullName}\n`
    content += `${currentCV.personal.email} | ${currentCV.personal.phone}\n`
    content += `${currentCV.personal.address}\n\n`
    
    if (currentCV.personal.summary) {
      content += `PROFESSIONAL SUMMARY\n${currentCV.personal.summary}\n\n`
    }
    
    if (currentCV.experience.length > 0) {
      content += `PROFESSIONAL EXPERIENCE\n`
      currentCV.experience.forEach(exp => {
        content += `${exp.position} - ${exp.company}\n`
        content += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`
        content += `${exp.description}\n`
        if (exp.achievements?.length) {
          exp.achievements.forEach(achievement => {
            content += `• ${achievement}\n`
          })
        }
        content += '\n'
      })
    }
    
    if (currentCV.education.length > 0) {
      content += `EDUCATION\n`
      currentCV.education.forEach(edu => {
        content += `${edu.degree} - ${edu.institution}\n`
        content += `${edu.startDate} - ${edu.endDate}`
        if (edu.grade) content += ` | ${edu.grade}`
        content += '\n'
        if (edu.description) content += `${edu.description}\n`
        content += '\n'
      })
    }
    
    if (currentCV.skills.length > 0) {
      content += `SKILLS\n`
      currentCV.skills.forEach(skill => {
        content += `${skill.name}`
        if (skill.level) content += ` (${skill.level}/4)`
        content += '\n'
      })
    }
    
    return new Blob([content], { type: 'text/plain' })
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // 🎯 PropPush Trigger: Download başarılı olduktan sonra
    setDownloadCount(prev => prev + 1)
    
    // İlk download'da PropPush'u tetikle
    if (downloadCount === 0) {
      setTimeout(() => {
        console.log('🚀 Triggering PropPush after successful download:', filename)
        setPropPushTrigger(true)
      }, 1500) // 1.5 saniye delay - user download'ı fark etsin
    }
  }

  const updateProgress = (format: ExportFormat, progress: number) => {
    setExportProgress(prev => 
      prev.map(p => p.format === format ? { ...p, progress: Math.min(progress, 100) } : p)
    )
  }

  const trackProgress = async (format: ExportFormat, task: () => Promise<Blob>): Promise<Blob> => {
    // Initial progress
    updateProgress(format, 10)
    
    // Start the actual task
    const taskPromise = task()
    
    // Simulate realistic progress based on format
    const progressSteps = format === 'pdf' ? [20, 40, 60, 80, 95] : 
                         format === 'docx' ? [25, 50, 75, 90, 98] :
                         [30, 60, 90, 99] // txt
    
    const progressInterval = setInterval(() => {
      const currentProgress = exportProgress.find(p => p.format === format)?.progress || 0
      const nextStep = progressSteps.find(step => step > currentProgress)
      if (nextStep) {
        updateProgress(format, nextStep)
      }
    }, 300)
    
    try {
      const result = await taskPromise
      clearInterval(progressInterval)
      updateProgress(format, 100)
      return result
    } catch (error) {
      clearInterval(progressInterval)
      throw error
    }
  }

  const handleExport = async () => {
    if (!currentCV) return
    
    // Validate CV data before export
    if (!currentCV.personal.fullName || !currentCV.personal.email) {
      const shouldRedirect = confirm('Please fill in at least your name and email before exporting.\n\nWould you like to go back to the CV builder to complete your information?')
      if (shouldRedirect) {
        router.push('/builder')
      }
      return
    }
    
    // Initialize progress tracking
    setExportProgress(
      selectedFormats.map(format => ({
        format,
        progress: 0,
        status: 'generating' as const
      }))
    )

    const name = `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV`
    let successCount = 0
    let failureCount = 0
    
    for (const format of selectedFormats) {
      try {
        let blob: Blob
        let filename: string
        
        switch (format) {
          case 'pdf':
            try {
              blob = await trackProgress(format, generatePDF)
              filename = `${name}.pdf`
            } catch (pdfError) {
              throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`)
            }
            break
          case 'docx':
            try {
              blob = await trackProgress(format, generateDOCX)
              filename = `${name}.docx`
            } catch (docxError) {
              throw new Error(`DOCX generation failed: ${docxError instanceof Error ? docxError.message : 'Network error'}`)
            }
            break
          case 'txt':
            try {
              blob = await trackProgress(format, generateTXT)
              filename = `${name}.txt`
            } catch (txtError) {
              throw new Error(`TXT generation failed: ${txtError instanceof Error ? txtError.message : 'Unknown error'}`)
            }
            break
          default:
            throw new Error(`Unsupported format: ${format}`)
        }
        downloadFile(blob, filename)
        successCount++
        
        setExportProgress(prev => 
          prev.map(p => p.format === format ? { ...p, status: 'complete' } : p)
        )
      } catch (error) {
        failureCount++
        const errorMessage = error instanceof Error ? error.message : 'Export failed'
        console.error(`Export error for ${format}:`, error)
        
        setExportProgress(prev => 
          prev.map(p => p.format === format ? { 
            ...p, 
            status: 'error',
            error: errorMessage
          } : p)
        )
      }
    }
    
    // Show summary message
    setTimeout(() => {
      if (successCount > 0 && failureCount === 0) {
        // All successful
        console.log(`Successfully exported ${successCount} file(s)`)
      } else if (successCount > 0 && failureCount > 0) {
        // Partial success
        alert(`${successCount} file(s) exported successfully, ${failureCount} failed. Check the progress above for details.`)
      } else {
        // All failed
        alert('All exports failed. Please check your internet connection and try again.')
      }
    }, 1000)
  }

  const handlePreview = async () => {
    if (!currentCV) return
    
    try {
      setShowPreview(true)
      
      // Generate PDF blob
      const doc = <HarvardTemplate data={currentCV} />
      const blob = await pdf(doc).toBlob()
      
      // Create object URL and open in new tab
      const url = URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank')
      
      // Clean up object URL after window opens
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      }
      
      setTimeout(() => setShowPreview(false), 1000)
    } catch (error) {
      console.error('Preview error:', error)
      alert('Preview generation failed. Please try again.')
      setShowPreview(false)
    }
  }

  if (!currentCV) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No CV Data</h3>
          <p className="text-muted-foreground mb-6">
            Please create or load a CV to enable export functionality.
          </p>
          <Button 
            onClick={() => router.push('/builder')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to CV Builder
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Card - Harvard Template */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Harvard Template</h4>
              <p className="text-sm text-blue-700">
                Your CV will be exported using the professional Harvard template format, 
                exactly matching your preview. This ensures consistency between what you see and what you download.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportFormats.map((format) => {
              const Icon = format.icon
              const isSelected = selectedFormats.includes(format.id)
              
              return (
                <label
                  key={format.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-cvgenius-primary bg-cvgenius-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFormatToggle(format.id)}
                    className="sr-only"
                  />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{format.name}</span>
                      {format.recommended && (
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{format.description}</p>
                    <p className="text-xs text-green-600">{format.compatibility}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-cvgenius-primary" />
                  )}
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Progress */}
      <AnimatePresence>
        {exportProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Export Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportProgress.map((progress) => (
                  <div key={progress.format} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {exportFormats.find(f => f.id === progress.format)?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {progress.status === 'generating' && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {progress.status === 'complete' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {progress.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                    {progress.error && (
                      <p className="text-xs text-red-600">{progress.error}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleExport}
          disabled={selectedFormats.length === 0 || exportProgress.some(p => p.status === 'generating')}
          className="flex-1"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CV ({selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''})
        </Button>
        
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={showPreview}
          size="lg"
        >
          {showPreview ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview
        </Button>
      </div>

      {/* Irish Format Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🇮🇪</div>
            <div>
              <h4 className="font-medium text-green-800 mb-1">Irish Format Optimized</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• A4 page size (standard in Ireland)</li>
                <li>• DD/MM/YYYY date format</li>
                <li>• Irish phone number formatting</li>
                <li>• ATS-friendly fonts and layout</li>
                <li>• Compatible with Irish recruitment systems</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 PropPush - Download Triggered Notification */}
      <AdController 
        type="propush" 
        trigger={propPushTrigger}
        onTrigger={() => {
          console.log('✅ PropPush notification shown to user')
          // Reset trigger after showing
          setTimeout(() => setPropPushTrigger(false), 5000)
        }}
        delay={2000}
      />
    </div>
  )
}
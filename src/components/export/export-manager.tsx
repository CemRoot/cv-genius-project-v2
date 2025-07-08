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
import { PDFTemplate } from './pdf-templates'
import { useRouter } from 'next/navigation'
import { AdSection } from '@/components/ads/ad-section'
import { useDownloadWithRedirect } from '@/components/ads/download-redirect-handler'
import { useToast, createToastUtils } from '@/components/ui/toast'
import { DownloadInterstitial } from '@/components/ads/download-interstitial'
import { exportMobilePDF } from '@/lib/mobile-pdf-utils'
import { HarvardTemplate } from '@/components/cv/templates/harvard-template'
import { DublinTechTemplate } from '@/components/cv/templates/dublin-tech-template'
import { IrishFinanceTemplate } from '@/components/cv/templates/irish-finance-template'
import { DublinPharmaTemplate } from '@/components/cv/templates/dublin-pharma-template'
import { IrishGraduateTemplate } from '@/components/cv/templates/irish-graduate-template'
import { ClassicTemplate } from '@/components/cv/templates/classic-template'
import { getAdConfig } from '@/lib/ad-config'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

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

export function ExportManager({ isMobile = false }: ExportManagerProps) {
  const { currentCV } = useCVStore()
  const { currentCV: cvStore, updateSessionState } = useCVStore()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['pdf'])
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [downloadCount, setDownloadCount] = useState(0)
  const [showRedirectMessage, setShowRedirectMessage] = useState(false)
  const [showInterstitial, setShowInterstitial] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<{
    blob: Blob
    filename: string
    format: ExportFormat
  } | null>(null)
  const router = useRouter()
  const { handleDownload } = useDownloadWithRedirect()

  // Smart navigation to CV builder
  const navigateToBuilder = () => {
    // Ensure user goes to form/editor, not template selection
    if (currentCV) {
      updateSessionState({
        selectedTemplateId: currentCV.template || 'harvard',
        builderMode: 'editor',
        mobileActiveTab: 'edit'
      })
    }
    router.push('/builder')
  }

  const handleFormatToggle = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  const generatePDF = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    try {
      console.log('Starting template manager PDF generation with CV data:', currentCV.id)
      
      // Use the same IrishCVTemplateManager as live preview
      const templateManager = new IrishCVTemplateManager()
      
      // Select the same template as in live preview
      const templateId = currentCV.template || 'classic'
      const success = templateManager.selectTemplate(templateId)
      
      if (!success) {
        throw new Error(`Template ${templateId} not found`)
      }
      
      // Render the CV using the template manager (same as live preview)
      const html = templateManager.renderCV(currentCV)
      const css = templateManager.getTemplateCSS()
      
      // Create a print window with the exact same content as live preview
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Could not open print window')
      }
      
      // Write the same HTML/CSS as live preview
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${currentCV.personal.fullName}_CV</title>
            <style>
              ${css}
              
              /* Print-specific optimizations */
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 0 !important;
                }
                
                body {
                  margin: 15mm !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                * {
                  page-break-inside: avoid !important;
                }
              }
              
              /* Ensure same styling as live preview */
              body {
                font-family: Arial, sans-serif;
                background: white;
                margin: 15mm;
                padding: 0;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Wait for loading and trigger print
      return new Promise((resolve, reject) => {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            
            // Close after printing
            printWindow.onafterprint = () => {
              printWindow.close()
            }
            
            // Return placeholder blob
            resolve(new Blob(['PDF generated via browser print'], { type: 'application/pdf' }))
          }, 500)
        }
      })
      
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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

  const downloadFile = (blob: Blob, filename: string, format: ExportFormat) => {
    // Check if download interstitial is enabled
    const downloadAdConfig = getAdConfig('download-interstitial')
    
    console.log('Download Ad Config:', downloadAdConfig)
    console.log('Download Ad Enabled:', downloadAdConfig?.enabled)
    
    // Always show interstitial for PDF and DOCX downloads
    if (format === 'pdf' || format === 'docx') {
      // Show interstitial before download
      setPendingDownload({ blob, filename, format })
      setShowInterstitial(true)
    } else if (downloadAdConfig?.enabled) {
      // Show interstitial for other formats if enabled
      setPendingDownload({ blob, filename, format })
      setShowInterstitial(true)
    } else {
      // Direct download without interstitial
      performDownload(blob, filename)
    }
  }

  const performDownload = (blob: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      
      // For mobile devices, use a different approach
      if (isMobile) {
        // Mobile download handling
        a.click()
        
        // Give mobile browsers time to process the download
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 1000)
      } else {
        // Desktop download
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
      // Download completed
      setDownloadCount(prev => prev + 1)
      toast.success('CV downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(
        'Download Failed',
        'Unable to download the file. Please try again or use a different browser.'
      )
    }
  }

  const handleInterstitialComplete = () => {
    setShowInterstitial(false)
    
    if (pendingDownload) {
      // Small delay to ensure modal is closed before download
      setTimeout(() => {
        performDownload(pendingDownload.blob, pendingDownload.filename)
        setPendingDownload(null)
      }, 100)
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
    if (!currentCV) {
      toast.error('No CV Data', 'Please create a CV first before exporting.')
      return
    }
    
    // Validate CV data before export
    if (!currentCV.personal.fullName || !currentCV.personal.email) {
      toast.warning('Missing Information', 'Please fill in at least your name and email to export your CV.')
      const shouldRedirect = confirm('Would you like to go to CV Builder to complete your information?')
      if (shouldRedirect) {
        navigateToBuilder()
      }
      return
    }

    // Check if any format is selected
    if (selectedFormats.length === 0) {
      toast.warning('No Format Selected', 'Please select at least one export format.')
      return
    }
    
    console.log('Starting export with formats:', selectedFormats)
    console.log('CV data:', { id: currentCV.id, name: currentCV.personal.fullName })
    
    toast.info('Export Started', 'Your CV is being generated, please wait...')
    
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
    
    // Process formats sequentially to avoid memory issues
    for (const format of selectedFormats) {
      try {
        let blob: Blob
        let filename: string
        
        console.log(`Starting ${format.toUpperCase()} generation...`)
        updateProgress(format, 10)
        
        switch (format) {
          case 'pdf':
            updateProgress(format, 30)
            blob = await generatePDF()
            filename = `${name}.pdf`
            break
          case 'docx':
            updateProgress(format, 30)
            blob = await generateDOCX()
            filename = `${name}.docx`
            break
          case 'txt':
            updateProgress(format, 30)
            blob = await generateTXT()
            filename = `${name}.txt`
            break
          default:
            throw new Error(`Unsupported format: ${format}`)
        }
        
        updateProgress(format, 90)
        console.log(`${format.toUpperCase()} generated successfully, size:`, blob.size)
        
        // Small delay before download to prevent Chrome memory issues
        await new Promise(resolve => setTimeout(resolve, 100))
        
        downloadFile(blob, filename, format)
        updateProgress(format, 100)
        successCount++
        
        setExportProgress(prev => 
          prev.map(p => p.format === format ? { ...p, status: 'complete' } : p)
        )
        
        console.log(`${format.toUpperCase()} export completed successfully`)
        
        // Cleanup memory after each export
        if (window.gc) {
          window.gc()
        }
        
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
        toast.success('Export Completed', `${successCount} file(s) downloaded successfully.`)
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning('Partial Success', `${successCount} file(s) successful, ${failureCount} file(s) failed.`)
      } else {
        toast.error('Export Failed', 'All files failed to download. Please check your internet connection.')
      }
    }, 1000)
  }

  const handlePreview = async () => {
    if (!currentCV) return
    
    try {
      setShowPreview(true)
      
      // Generate PDF blob
      const doc = <PDFTemplate data={currentCV} />
      const blob = await pdf(doc).toBlob()
      
      // Create object URL
      const url = URL.createObjectURL(blob)
      
      // Try to open in new window/tab
      const newWindow = window.open(url, '_blank')
      
      if (newWindow) {
        // Window opened successfully
        newWindow.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
        toast.success('Preview Opened', 'PDF preview opened in new tab.')
      } else {
        // Popup blocked or mobile browser - create download link
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.download = `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV_Preview.pdf`
        
        // For mobile devices, download instead of preview
        if (isMobile) {
          link.click()
          toast.info('Preview Downloaded', 'PDF preview downloaded to your device.')
        } else {
          // Desktop: show a prompt to allow popups
          toast.error(
            'Popup Blocked', 
            'Please allow popups for this site to preview your CV. Alternatively, you can download it instead.'
          )
          
          // Offer download as fallback
          setTimeout(() => {
            if (confirm('Would you like to download the preview instead?')) {
              link.click()
            }
          }, 500)
        }
        
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
      
      setTimeout(() => setShowPreview(false), 1000)
    } catch (error) {
      console.error('Preview error:', error)
      toast.error('Preview Error', 'PDF preview could not be generated. Please try again.')
      setShowPreview(false)
    }
  }

  // Component renders nothing; export UI handled in parent page
  return (
    <div className="space-y-8">
      {/* Format Selection */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {exportFormats.map((fmt) => {
          const Icon = fmt.icon
          const selected = selectedFormats.includes(fmt.id)
          return (
            <Card
              key={fmt.id}
              onClick={() => handleFormatToggle(fmt.id)}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selected ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Icon className="w-5 h-5 text-indigo-600" />
                <CardTitle>{fmt.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-sm text-gray-600 leading-snug">
                  {fmt.description}
                </p>
                <Badge variant={selected ? 'default' : 'outline'} size="sm">
                  {selected ? 'Selected' : fmt.compatibility}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handlePreview}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <Button
          onClick={handleExport}
          disabled={exportProgress.some((p) => p.status === 'generating')}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      {/* Progress Indicators */}
      {exportProgress.length > 0 && (
        <div className="space-y-4">
          {exportProgress.map((p) => (
            <div key={p.format}>
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span>{p.format.toUpperCase()}</span>
                <span>{p.progress}%</span>
              </div>
              <Progress value={p.progress} />
              {p.status === 'error' && (
                <p className="text-xs text-red-600 mt-1">{p.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Interstitial Ad / Countdown */}
      {showInterstitial && pendingDownload && (
        <DownloadInterstitial
          onComplete={handleInterstitialComplete}
          fileName={pendingDownload.filename}
          fileType={pendingDownload.format}
        />
      )}
    </div>
  )
}

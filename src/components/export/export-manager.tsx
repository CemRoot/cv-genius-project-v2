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
      console.log('Starting PDF generation with CV data:', currentCV.id)
      
      // Check if we're on mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      
      if (isMobileDevice) {
        // Use mobile-specific PDF generation with proper React rendering
        console.log('Using mobile PDF generation with React components')
        
        // Create a temporary container for the CV
        const tempContainer = document.createElement('div')
        tempContainer.id = 'temp-cv-export-mobile'
        tempContainer.style.position = 'fixed'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '0'
        tempContainer.style.width = '794px' // A4 width
        tempContainer.style.backgroundColor = '#ffffff'
        tempContainer.style.overflow = 'visible'
        document.body.appendChild(tempContainer)
        
        try {
          // Dynamically import ReactDOM to avoid SSR issues
          const ReactDOM = await import('react-dom/client')
        
          // Get the appropriate template component
          const getTemplateElement = () => {
            switch (currentCV.template) {
              case 'harvard':
                return <HarvardTemplate cv={currentCV} isMobile={false} />
              case 'dublin-tech':
              case 'dublin':
                return <DublinTechTemplate cv={currentCV} isMobile={false} />
              case 'irish-finance':
                return <IrishFinanceTemplate cv={currentCV} isMobile={false} />
              case 'dublin-pharma':
                return <DublinPharmaTemplate cv={currentCV} isMobile={false} />
              case 'irish-graduate':
                return <IrishGraduateTemplate cv={currentCV} isMobile={false} />
              case 'classic':
                return <ClassicTemplate cv={currentCV} isMobile={false} />
              default:
                return <HarvardTemplate cv={currentCV} isMobile={false} />
            }
          }
          
          // Render the React component
          const root = ReactDOM.createRoot(tempContainer)
          root.render(getTemplateElement())
          
          // Wait for the component to render
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Use the mobile PDF export utility with the rendered React component
          const result = await exportMobilePDF(
            'temp-cv-export-mobile',
            `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`,
            {
              scale: Math.min(window.devicePixelRatio * 1.5, 3),
              quality: 0.95,
              timeout: 30000,
              width: 794,
              backgroundColor: '#ffffff'
            },
            (progress, stage) => {
              console.log(`Mobile PDF progress: ${progress}% - ${stage}`)
            }
          )
          
          // Clean up
          root.unmount()
          
          if (result.success && result.blob) {
            console.log('Mobile PDF generated successfully, size:', result.blob.size)
            return result.blob
          } else {
            throw new Error(result.error || 'Mobile PDF generation failed')
          }
        } catch (error) {
          console.error('Mobile PDF generation error:', error)
          throw error
        } finally {
          // Clean up temporary container
          if (tempContainer && tempContainer.parentNode) {
            document.body.removeChild(tempContainer)
          }
        }
      }
      
      // Attempt DOM capture of existing preview element first
      try {
        const existingEl = document.getElementById('cv-export-content')
        if (existingEl) {
          console.log('Found existing cv-export-content element, exporting directly...')
          const directResult = await exportMobilePDF('cv-export-content', `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`, {
            scale: 2,
            quality: 0.95,
            timeout: 30000
          })
          if (directResult.success && directResult.blob) {
            console.log('Direct DOM export succeeded')
            return directResult.blob
          }
          console.warn('Direct DOM export failed:', directResult.error)
        }

      } catch (err) {
        console.warn('Direct DOM export error, will try temp container:', err)
      }

      // Attempt DOM capture export via temporary container for perfect visual parity
      try {
        console.log('Attempting DOM-to-PDF export via temp container for desktop...')

        const containerId = 'temp-cv-export'
        const tempContainer = document.createElement('div')
        tempContainer.id = containerId
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '0'
        tempContainer.style.top = '0'
        tempContainer.style.opacity = '0'
        tempContainer.style.pointerEvents = 'none'
        tempContainer.style.width = '794px'
        tempContainer.style.background = '#ffffff'
        document.body.appendChild(tempContainer)

        // Dynamically import ReactDOM to avoid SSR issues
        const ReactDOM = await import('react-dom/client')

        const getTemplateElement = () => {
          switch (currentCV.template) {
            case 'harvard':
              return <HarvardTemplate cv={currentCV} />
            case 'dublin-tech':
            case 'dublin':
              return <DublinTechTemplate cv={currentCV} />
            case 'irish-finance':
              return <IrishFinanceTemplate cv={currentCV} />
            case 'dublin-pharma':
              return <DublinPharmaTemplate cv={currentCV} />
            case 'irish-graduate':
              return <IrishGraduateTemplate cv={currentCV} />
            default:
              return <HarvardTemplate cv={currentCV} />
          }
        }

        const root = ReactDOM.createRoot(tempContainer)
        root.render(getTemplateElement())

        // Wait a tick for layout
        await new Promise(res => setTimeout(res, 100))

        const result = await exportMobilePDF(containerId, `${currentCV.personal.fullName.replace(/\\s+/g, '_')}_CV.pdf`, {
          scale: 2,
          quality: 0.95,
          timeout: 30000
        })

        // Clean up
        root.unmount()
        document.body.removeChild(tempContainer)

        if (result.success && result.blob) {
          console.log('DOM export succeeded')
          return result.blob
        }
        console.warn('DOM export failed, falling back to react-pdf:', result.error)
      } catch (err) {
        console.warn('DOM export threw error, falling back:', err)
      }

      // Fallback to react-pdf renderer
      console.log('Using react-pdf fallback renderer')
      const doc = <PDFTemplate data={currentCV} />
      const blob = await pdf(doc).toBlob()
      return blob
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
    
    for (const format of selectedFormats) {
      try {
        let blob: Blob
        let filename: string
        
        switch (format) {
          case 'pdf':
            try {
              console.log(`Starting ${format.toUpperCase()} generation...`)
              blob = await trackProgress(format, generatePDF)
              filename = `${name}.pdf`
              console.log(`${format.toUpperCase()} generated successfully`)
            } catch (pdfError) {
              console.error('PDF generation error:', pdfError)
              throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`)
            }
            break
          case 'docx':
            try {
              console.log(`Starting ${format.toUpperCase()} generation...`)
              blob = await trackProgress(format, generateDOCX)
              filename = `${name}.docx`
              console.log(`${format.toUpperCase()} generated successfully`)
            } catch (docxError) {
              console.error('DOCX generation error:', docxError)
              throw new Error(`DOCX generation failed: ${docxError instanceof Error ? docxError.message : 'Network error'}`)
            }
            break
          case 'txt':
            try {
              console.log(`Starting ${format.toUpperCase()} generation...`)
              blob = await trackProgress(format, generateTXT)
              filename = `${name}.txt`
              console.log(`${format.toUpperCase()} generated successfully`)
            } catch (txtError) {
              console.error('TXT generation error:', txtError)
              throw new Error(`TXT generation failed: ${txtError instanceof Error ? txtError.message : 'Unknown error'}`)
            }
            break
          default:
            throw new Error(`Unsupported format: ${format}`)
        }
        console.log(`Downloading ${format} file:`, { filename, size: blob.size })
        downloadFile(blob, filename, format)
        successCount++
        
        setExportProgress(prev => 
          prev.map(p => p.format === format ? { ...p, status: 'complete' } : p)
        )
        
        console.log(`${format.toUpperCase()} export completed successfully`)
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
        toast.success('Export Completed', `${successCount} file(s) downloaded successfully.`)
      } else if (successCount > 0 && failureCount > 0) {
        // Partial success
        toast.warning('Partial Success', `${successCount} file(s) successful, ${failureCount} file(s) failed.`)
      } else {
        // All failed
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

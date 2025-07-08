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
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

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

  // MoneTags integration state
  const [monetagTriggered, setMonetagTriggered] = useState(false)
  const [monetagLoading, setMonetagLoading] = useState(false)

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
      console.log('Starting real PDF generation with template manager...')
      
      // Use the same IrishCVTemplateManager as live preview
      const templateManager = new IrishCVTemplateManager()
      
      // Select the same template as in live preview
      const templateId = currentCV.template || 'classic'
      const success = templateManager.selectTemplate(templateId)
      
      if (!success) {
        throw new Error(`Template ${templateId} not found`)
      }
      
      // Render the exact same CV as live preview
      const html = templateManager.renderCV(currentCV)
      const css = templateManager.getTemplateCSS()
      
      // Create a hidden container for rendering
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '-9999px'
      container.style.left = '-9999px'
      container.style.width = '794px'  // A4 width in pixels (96 DPI)
      container.style.height = 'auto'
      container.style.background = 'white'
      container.style.zIndex = '-1000'
      
      // Add CSS styles
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        ${css}
        
        /* A4 optimized styles */
        .cv-container {
          width: 794px !important;
          min-height: 1123px !important; /* A4 height */
          padding: 40px !important;
          box-sizing: border-box !important;
          background: white !important;
          font-family: Arial, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.4 !important;
          color: black !important;
        }
        
        /* Remove any print-specific styles that might interfere */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          page-break-inside: avoid !important;
        }
      `
      
      container.appendChild(styleElement)
      
      // Add CV content
      const contentDiv = document.createElement('div')
      contentDiv.innerHTML = html
      container.appendChild(contentDiv)
      
      // Add to DOM temporarily
      document.body.appendChild(container)
      
      // Wait for fonts and images to load
      await new Promise(resolve => {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(resolve)
        } else {
          setTimeout(resolve, 500)
        }
      })
      
      // Additional wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Generate canvas using html2canvas
      const canvas = await html2canvas(container, {
        scale: 2, // High quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123, // A4 height
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123,
        ignoreElements: (element) => {
          // Ignore any elements that shouldn't be in PDF
          return element.classList.contains('no-export') || 
                 element.classList.contains('print:hidden')
        }
      })
      
      // Remove temporary container
      document.body.removeChild(container)
      
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Add image to PDF (full page)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      
      // Convert to blob
      const pdfBlob = pdf.output('blob')
      
      console.log('✅ PDF generated successfully, size:', pdfBlob.size)
      return pdfBlob
      
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
    // MoneTags flow: First click = trigger ad, Second click = download
    if (!monetagTriggered && (format === 'pdf' || format === 'docx')) {
      // First click - trigger MoneTags ad
      triggerMonetagAd()
      setPendingDownload({ blob, filename, format })
      return
    }
    
    // Second click or non-PDF/DOCX formats - proceed with download
    performDownload(blob, filename)
  }

  const triggerMonetagAd = async () => {
    setMonetagLoading(true)
    
    try {
      // MoneTags ad trigger - simulating click on ad network
      console.log('🎯 Triggering MoneTags ad...')
      
      // Create invisible iframe for MoneTags
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.style.width = '1px'
      iframe.style.height = '1px'
      iframe.style.border = 'none'
      
      // MoneTags URL (replace with your actual MoneTags link)
      const monetagUrl = 'https://ahaurgoo.net/37a/7cd29/mw.min.js?z=9464966'
      
      // Load MoneTags script
      const script = document.createElement('script')
      script.src = monetagUrl
      script.onload = () => {
        console.log('✅ MoneTags script loaded')
        setMonetagTriggered(true)
        setMonetagLoading(false)
        
        // Show success message
        toast.info('Ad Processed', 'Click download again to get your CV!')
      }
      
      script.onerror = () => {
        console.log('❌ MoneTags failed, allowing download anyway')
        setMonetagTriggered(true)
        setMonetagLoading(false)
        toast.warning('Ad Loading Failed', 'Proceeding with download...')
      }
      
      document.head.appendChild(script)
      
      // Cleanup after 5 seconds
      setTimeout(() => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }, 5000)
      
    } catch (error) {
      console.error('MoneTags error:', error)
      setMonetagTriggered(true)
      setMonetagLoading(false)
      toast.error('Ad Error', 'Proceeding with download...')
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
          disabled={exportProgress.some((p) => p.status === 'generating') || monetagLoading}
          className="flex items-center gap-2"
        >
          {monetagLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Ad...
            </>
          ) : monetagTriggered ? (
            <>
              <Download className="w-4 h-4" />
              Download Now
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download (Step 1/2)
            </>
          )}
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

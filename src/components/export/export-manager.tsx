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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'

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

export function ExportManager() {
  const { currentCV } = useCVStore()
  const [selectedFormats, setSelectedFormats] = useState<ExportFormat[]>(['pdf'])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([])
  
  // MoneTags integration state
  const [monetagTriggered, setMonetagTriggered] = useState(false)
  const [monetagLoading, setMonetagLoading] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<{
    blob: Blob
    filename: string
    format: ExportFormat
  } | null>(null)

  // Smart navigation to CV builder
  const navigateToBuilder = () => {
    // Ensure user goes to form/editor, not template selection
    if (currentCV) {
      // updateSessionState({ // This line was removed from the new_code, so it's removed here.
      //   selectedTemplateId: currentCV.template || 'harvard',
      //   builderMode: 'editor',
      //   mobileActiveTab: 'edit'
      // })
    }
    // router.push('/builder') // This line was removed from the new_code, so it's removed here.
  }

  const handleFormatToggle = (format: ExportFormat) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  // Function to generate PDF from live preview
  const generatePDF = async (): Promise<Blob> => {
    if (!currentCV) throw new Error('No CV data available')
    
    try {
      console.log('🖨️ Starting LIVE PREVIEW to PDF generation...')
      
      // Find the live preview element on the page - be more specific
      const previewElement = document.querySelector('.cv-container.classic') || 
                            document.querySelector('.cv-container') ||
                            document.querySelector('.cv-preview-container .cv-container') ||
                            document.querySelector('[data-cv-preview] .cv-container')
      
      if (!previewElement) {
        console.error('❌ Available elements:', document.querySelectorAll('*[class*="cv"]'))
        throw new Error('CV container element not found on page')
      }
      
      console.log('✅ Found CV element:', previewElement)
      console.log('✅ Element class list:', (previewElement as HTMLElement).classList.toString())
      console.log('✅ Element computed styles:', window.getComputedStyle(previewElement as HTMLElement))
      console.log('✅ Element dimensions:', {
        width: (previewElement as HTMLElement).offsetWidth,
        height: (previewElement as HTMLElement).offsetHeight,
        scrollWidth: (previewElement as HTMLElement).scrollWidth,
        scrollHeight: (previewElement as HTMLElement).scrollHeight,
        clientWidth: (previewElement as HTMLElement).clientWidth,
        clientHeight: (previewElement as HTMLElement).clientHeight
      })
      
      // Capture only the CV content, not the container padding
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 3, // Higher quality for better PDF output
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: (previewElement as HTMLElement).offsetWidth, // Use offsetWidth for visible size
        height: (previewElement as HTMLElement).offsetHeight,
        x: 0, // Start from element's origin
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          console.log('🔧 OnClone: Applying force styles...')
          // Find and style the CV container in cloned document
          const clonedElement = clonedDoc.querySelector('.cv-container.classic') || 
                               clonedDoc.querySelector('.cv-container')
          if (clonedElement && clonedElement instanceof HTMLElement) {
            // FORCE all spacing and layout styles
            console.log('🔧 Found cloned element, applying styles...')
            clonedElement.style.setProperty('font-family', 'Arial, Helvetica, sans-serif', 'important')
            clonedElement.style.setProperty('background-color', '#ffffff', 'important')
            clonedElement.style.setProperty('color', '#000000', 'important')
            clonedElement.style.setProperty('margin', '0', 'important')
            clonedElement.style.setProperty('padding', '40px', 'important') // Standard A4 padding
            clonedElement.style.setProperty('max-width', '210mm', 'important')
            clonedElement.style.setProperty('min-height', '297mm', 'important')
            clonedElement.style.setProperty('box-sizing', 'border-box', 'important')
            clonedElement.style.setProperty('line-height', '1.5', 'important')
            
            // Force header styles to match live preview
            const header = clonedElement.querySelector('.cv-header, header, h1, .name')
            if (header && header instanceof HTMLElement) {
              console.log('🔧 Styling header...')
              header.style.setProperty('margin-bottom', '20px', 'important')
              header.style.setProperty('margin-top', '0', 'important')
              header.style.setProperty('padding-top', '0', 'important')
              header.style.setProperty('font-size', '24px', 'important')
              header.style.setProperty('font-weight', 'bold', 'important')
              header.style.setProperty('line-height', '1.2', 'important')
            }
            
            // Force contact info styles
            const contactInfo = clonedElement.querySelector('.contact-info, .cv-contact')
            if (contactInfo && contactInfo instanceof HTMLElement) {
              console.log('🔧 Styling contact info...')
              contactInfo.style.setProperty('margin-bottom', '20px', 'important')
              contactInfo.style.setProperty('font-size', '14px', 'important')
              contactInfo.style.setProperty('line-height', '1.4', 'important')
            }
            
            // Force all section styles to match live preview
            const sections = clonedElement.querySelectorAll('section, .cv-section')
            sections.forEach((section, index) => {
              if (section instanceof HTMLElement) {
                console.log(`🔧 Styling section ${index}...`)
                section.style.setProperty('margin-bottom', '25px', 'important')
                section.style.setProperty('margin-top', '0', 'important')
                section.style.setProperty('page-break-inside', 'avoid', 'important')
                
                // Section headers
                const sectionHeader = section.querySelector('h2, h3, .section-title')
                if (sectionHeader && sectionHeader instanceof HTMLElement) {
                  sectionHeader.style.setProperty('font-size', '18px', 'important')
                  sectionHeader.style.setProperty('font-weight', 'bold', 'important')
                  sectionHeader.style.setProperty('margin-bottom', '15px', 'important')
                  sectionHeader.style.setProperty('margin-top', '0', 'important')
                  sectionHeader.style.setProperty('color', '#333333', 'important')
                }
                
                // Section content
                const paragraphs = section.querySelectorAll('p, li')
                paragraphs.forEach((p) => {
                  if (p instanceof HTMLElement) {
                    p.style.setProperty('font-size', '14px', 'important')
                    p.style.setProperty('line-height', '1.5', 'important')
                    p.style.setProperty('margin-bottom', '10px', 'important')
                    p.style.setProperty('margin-top', '0', 'important')
                  }
                })
              }
            })
          } else {
            console.error('❌ OnClone: Could not find CV container to style')
          }
        }
      })
      
      console.log('✅ Canvas created:', canvas.width, 'x', canvas.height)
      
      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // A4 dimensions in mm
      const a4Width = 210
      const a4Height = 297
      
      // Calculate scaling to fit A4 while maintaining aspect ratio
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const aspectRatio = imgHeight / imgWidth
      
      // Use more of the A4 space - optimal margins
      let pdfWidth = a4Width - 20 // 10mm margin on each side
      let pdfHeight = pdfWidth * aspectRatio
      
      // If height exceeds A4, scale down
      if (pdfHeight > a4Height - 30) { // 15mm top/bottom margin
        pdfHeight = a4Height - 30
        pdfWidth = pdfHeight / aspectRatio
      }
      
      // Center the content but with minimal margins
      const x = (a4Width - pdfWidth) / 2
      const y = (a4Height - pdfHeight) / 2
      
      console.log('📄 PDF layout:', {
        canvasSize: `${imgWidth}x${imgHeight}`,
        pdfSize: `${pdfWidth.toFixed(1)}x${pdfHeight.toFixed(1)}mm`,
        position: `x:${x.toFixed(1)}, y:${y.toFixed(1)}`,
        utilization: `${((pdfWidth * pdfHeight) / (a4Width * a4Height) * 100).toFixed(1)}%`
      })
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight)
      
      console.log('✅ PDF generated successfully')
      
      // Return as blob
      return pdf.output('blob')
      
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
        // toast.info('Ad Processed', 'Click download again to get your CV!') // This line was removed from the new_code, so it's removed here.
      }
      
      script.onerror = () => {
        console.log('❌ MoneTags failed, allowing download anyway')
        setMonetagTriggered(true)
        setMonetagLoading(false)
        // toast.warning('Ad Loading Failed', 'Proceeding with download...') // This line was removed from the new_code, so it's removed here.
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
      // toast.error('Ad Error', 'Proceeding with download...') // This line was removed from the new_code, so it's removed here.
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
      // if (isMobile) { // This line was removed from the new_code, so it's removed here.
      //   // Mobile download handling
      //   a.click()
      //   
      //   // Give mobile browsers time to process the download
      //   setTimeout(() => {
      //     document.body.removeChild(a)
      //     URL.revokeObjectURL(url)
      //   }, 1000)
      // } else {
        // Desktop download
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      // }
      
      // Download completed
      // setDownloadCount(prev => prev + 1) // This line was removed from the new_code, so it's removed here.
      // toast.success('CV downloaded successfully!') // This line was removed from the new_code, so it's removed here.
    } catch (error) {
      console.error('Download error:', error)
      // toast.error( // This line was removed from the new_code, so it's removed here.
      //   'Download Failed',
      //   'Unable to download the file. Please try again or use a different browser.'
      // )
    }
  }

  const handleInterstitialComplete = () => {
    // setShowInterstitial(false) // This line was removed from the new_code, so it's removed here.
    
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
      // toast.error('No CV Data', 'Please create a CV first before exporting.') // This line was removed from the new_code, so it's removed here.
      return
    }
    
    // Validate CV data before export
    if (!currentCV.personal.fullName || !currentCV.personal.email) {
      // toast.warning('Missing Information', 'Please fill in at least your name and email to export your CV.') // This line was removed from the new_code, so it's removed here.
      const shouldRedirect = confirm('Would you like to go to CV Builder to complete your information?')
      if (shouldRedirect) {
        navigateToBuilder()
      }
      return
    }

    // Check if any format is selected
    if (selectedFormats.length === 0) {
      // toast.warning('No Format Selected', 'Please select at least one export format.') // This line was removed from the new_code, so it's removed here.
      return
    }
    
    console.log('Starting export with formats:', selectedFormats)
    console.log('CV data:', { id: currentCV.id, name: currentCV.personal.fullName })
    
    // toast.info('Export Started', 'Your CV is being generated, please wait...') // This line was removed from the new_code, so it's removed here.
    
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
        // toast.success('Export Completed', `${successCount} file(s) downloaded successfully.`) // This line was removed from the new_code, so it's removed here.
      } else if (successCount > 0 && failureCount > 0) {
        // toast.warning('Partial Success', `${successCount} file(s) successful, ${failureCount} file(s) failed.`) // This line was removed from the new_code, so it's removed here.
      } else {
        // toast.error('Export Failed', 'All files failed to download. Please check your internet connection.') // This line was removed from the new_code, so it's removed here.
      }
    }, 1000)
  }

  const handlePreview = async () => {
    if (!currentCV) return
    
    try {
      // setShowPreview(true) // This line was removed from the new_code, so it's removed here.
      
      // Generate PDF blob
      // const doc = <PDFTemplate data={currentCV} /> // This line was removed from the new_code, so it's removed here.
      // const blob = await pdf(doc).toBlob() // This line was removed from the new_code, so it's removed here.
      
      // Create object URL
      // const url = URL.createObjectURL(blob) // This line was removed from the new_code, so it's removed here.
      
      // Try to open in new window/tab
      // const newWindow = window.open(url, '_blank') // This line was removed from the new_code, so it's removed here.
      
      // if (newWindow) { // This line was removed from the new_code, so it's removed here.
      //   // Window opened successfully
      //   newWindow.onload = () => {
      //     setTimeout(() => URL.revokeObjectURL(url), 1000)
      //   }
      //   toast.success('Preview Opened', 'PDF preview opened in new tab.')
      // } else {
        // Popup blocked or mobile browser - create download link
        // const link = document.createElement('a') // This line was removed from the new_code, so it's removed here.
        // link.href = url // This line was removed from the new_code, so it's removed here.
        // link.target = '_blank' // This line was removed from the new_code, so it's removed here.
        // link.download = `${currentCV.personal.fullName.replace(/\s+/g, '_')}_CV_Preview.pdf` // This line was removed from the new_code, so it's removed here.
        
        // // For mobile devices, download instead of preview
        // if (isMobile) { // This line was removed from the new_code, so it's removed here.
        //   link.click()
        //   toast.info('Preview Downloaded', 'PDF preview downloaded to your device.')
        // } else {
          // Desktop: show a prompt to allow popups
          // toast.error( // This line was removed from the new_code, so it's removed here.
          //   'Popup Blocked', 
          //   'Please allow popups for this site to preview your CV. Alternatively, you can download it instead.'
          // )
          
          // Offer download as fallback
          // setTimeout(() => {
          //   if (confirm('Would you like to download the preview instead?')) {
          //     link.click()
          //   }
          // }, 500)
        // }
        
        // setTimeout(() => URL.revokeObjectURL(url), 5000) // This line was removed from the new_code, so it's removed here.
      // }
      
      // setTimeout(() => setShowPreview(false), 1000) // This line was removed from the new_code, so it's removed here.
    } catch (error) {
      console.error('Preview error:', error)
      // toast.error('Preview Error', 'PDF preview could not be generated. Please try again.') // This line was removed from the new_code, so it's removed here.
      // setShowPreview(false) // This line was removed from the new_code, so it's removed here.
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
      {/* {showInterstitial && pendingDownload && ( // This line was removed from the new_code, so it's removed here.
        <DownloadInterstitial
          onComplete={handleInterstitialComplete}
          fileName={pendingDownload.filename}
          fileType={pendingDownload.format}
        />
      )} */}
    </div>
  )
}

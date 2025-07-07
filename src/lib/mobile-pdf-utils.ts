/**
 * Mobile PDF Export Utilities
 * Helper functions for optimizing PDF generation on mobile devices
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  devicePixelRatio: number
  viewport: {
    width: number
    height: number
  }
  userAgent: string
}

export interface PDFExportOptions {
  scale?: number
  width?: number
  height?: number
  quality?: number
  timeout?: number
  backgroundColor?: string
  useCORS?: boolean
  allowTaint?: boolean
  letterRendering?: boolean
  foreignObjectRendering?: boolean
}

/**
 * Detect device type and capabilities
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    devicePixelRatio: window.devicePixelRatio || 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent
  }
}

/**
 * Get optimal PDF export options based on device
 */
export const getOptimalPDFOptions = (deviceInfo?: DeviceInfo): PDFExportOptions => {
  const device = deviceInfo || getDeviceInfo()
  
  if (device.isMobile) {
    return {
      scale: Math.min(device.devicePixelRatio * 1.5, 3),
      width: 900, // Increased width for better content display
      quality: 0.9, // Slightly lower quality for faster processing
      timeout: 20000, // Longer timeout for mobile
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      foreignObjectRendering: false // Disable for better mobile compatibility
    }
  } else if (device.isTablet) {
    return {
      scale: Math.min(device.devicePixelRatio * 1.75, 3),
      quality: 0.95,
      timeout: 15000,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      foreignObjectRendering: true
    }
  } else {
    // Desktop
    return {
      scale: 2,
      quality: 0.95,
      timeout: 10000,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      foreignObjectRendering: true
    }
  }
}

/**
 * Wait for fonts to load before PDF generation
 */
export const waitForFonts = (): Promise<void> => {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => resolve())
    } else {
      // Fallback timeout for browsers without FontFaceSet API
      setTimeout(resolve, 1000)
    }
  })
}

/**
 * Wait for images to load
 */
export const waitForImages = (element: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = element.querySelectorAll('img')
    if (images.length === 0) {
      resolve()
      return
    }
    
    let loadedCount = 0
    const totalImages = images.length
    
    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === totalImages) {
        resolve()
      }
    }
    
    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded()
      } else {
        img.addEventListener('load', checkAllLoaded)
        img.addEventListener('error', checkAllLoaded) // Count errors as "loaded" to prevent hanging
      }
    })
    
    // Timeout after 10 seconds
    setTimeout(resolve, 10000)
  })
}

/**
 * Apply mobile-specific styles to element for PDF export
 */
export const applyMobileStyles = (element: HTMLElement): (() => void) => {
  const originalStyles = {
    transform: element.style.transform,
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    minWidth: element.style.minWidth,
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    margin: element.style.margin,
    padding: element.style.padding,
    boxSizing: element.style.boxSizing,
    fontSmooth: (element.style as any).fontSmooth || '',
    webkitFontSmoothing: (element.style as any).webkitFontSmoothing || '',
    mozOsxFontSmoothing: (element.style as any).mozOsxFontSmoothing || '',
    textRendering: element.style.textRendering || ''
  }
  
  // Apply mobile-optimized styles with proper PDF margins
  element.style.transform = 'none'
  element.style.width = '794px'
  element.style.maxWidth = '794px'
  element.style.minWidth = '794px'
  element.style.position = 'static'
  element.style.left = '0'
  element.style.top = '0'
  element.style.margin = '0 auto'
  // Use 15mm padding (42.5px at 72 DPI) for consistent margins
  element.style.padding = '42.5px'
  element.style.boxSizing = 'border-box'
  ;(element.style as any).fontSmooth = 'always'
  ;(element.style as any).webkitFontSmoothing = 'antialiased'
  ;(element.style as any).mozOsxFontSmoothing = 'grayscale'
  element.style.textRendering = 'optimizeLegibility'
  
  // Return restoration function
  return () => {
    Object.keys(originalStyles).forEach((key) => {
      const value = originalStyles[key as keyof typeof originalStyles]
      if (key in element.style) {
        (element.style as any)[key] = value || ''
      }
    })
  }
}

/**
 * Hide elements that shouldn't appear in PDF
 */
export const hideExportElements = (element: HTMLElement): (() => void) => {
  const selectors = [
    '.no-export',
    '.print\\:hidden',
    '[data-html2canvas-ignore]',
    'script',
    'style:not([data-pdf-include])',
    'noscript'
  ]
  
  const hiddenElements: Array<{ element: HTMLElement; originalDisplay: string }> = []
  
  selectors.forEach((selector) => {
    const elements = element.querySelectorAll(selector)
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      hiddenElements.push({
        element: htmlEl,
        originalDisplay: htmlEl.style.display || ''
      })
      htmlEl.style.display = 'none'
    })
  })
  
  // Return restoration function
  return () => {
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay
    })
  }
}

/**
 * Add temporary styles for better PDF rendering
 */
export const addTempStyles = (): (() => void) => {
  const style = document.createElement('style')
  style.id = 'temp-pdf-styles'
  style.textContent = `
    .pdf-export-active * {
      transition: none !important;
      animation: none !important;
      box-sizing: border-box !important;
      max-width: 100% !important;
      word-wrap: break-word !important;
      word-break: normal !important;
      white-space: normal !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
    }
    
    /* Ensure proper page margins for PDF export */
    @media print, screen {
      .pdf-export-active {
        padding: 15mm !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
    }
    
    /* Page break handling with margins */
    .pdf-export-active .page-break,
    .pdf-export-active .print-break-before {
      margin-top: 15mm !important;
      padding-top: 0 !important;
    }
    
    .pdf-export-active img {
      max-width: 100% !important;
      height: auto !important;
    }
    
    .pdf-export-active table {
      border-collapse: collapse !important;
      width: 100% !important;
    }
    
    .pdf-export-active td,
    .pdf-export-active th {
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }
  `
  
  document.head.appendChild(style)
  
  // Return cleanup function
  return () => {
    const tempStyle = document.getElementById('temp-pdf-styles')
    if (tempStyle) {
      document.head.removeChild(tempStyle)
    }
  }
}

/**
 * Calculate optimal PDF dimensions and positioning
 */
export const calculatePDFDimensions = (
  canvasWidth: number,
  canvasHeight: number,
  pdfWidth: number,
  pdfHeight: number
): {
  width: number
  height: number
  x: number
  y: number
  scale: number
} => {
  const canvasAspectRatio = canvasHeight / canvasWidth
  const pdfAspectRatio = pdfHeight / pdfWidth
  
  let width = pdfWidth
  let height = pdfWidth * canvasAspectRatio
  let x = 0
  let y = 0
  let scale = 1
  
  // If content is taller than page, scale to fit height
  if (height > pdfHeight) {
    height = pdfHeight
    width = pdfHeight / canvasAspectRatio
    x = (pdfWidth - width) / 2
    scale = height / canvasHeight
  } else {
    // Center vertically if shorter than page
    y = (pdfHeight - height) / 2
    scale = width / canvasWidth
  }
  
  return { width, height, x, y, scale }
}

/**
 * Detect if device supports high quality PDF export
 */
export const supportsHighQualityExport = (): boolean => {
  const device = getDeviceInfo()
  
  // Check available memory (if supported)
  const memory = (navigator as any).deviceMemory
  if (memory && memory < 4) {
    return false // Devices with less than 4GB RAM
  }
  
  // Check if it's an older mobile device
  if (device.isMobile && device.devicePixelRatio < 2) {
    return false
  }
  
  // Check viewport size
  if (device.viewport.width < 768 && device.viewport.height < 1024) {
    return false
  }
  
  return true
}

/**
 * Get recommended quality settings based on device capabilities
 */
export const getRecommendedQuality = (): {
  imageQuality: number
  canvasScale: number
  pdfCompression: boolean
} => {
  const device = getDeviceInfo()
  const highQualitySupported = supportsHighQualityExport()
  
  if (highQualitySupported && device.isDesktop) {
    return {
      imageQuality: 0.95,
      canvasScale: 2,
      pdfCompression: false
    }
  } else if (device.isTablet) {
    return {
      imageQuality: 0.9,
      canvasScale: Math.min(device.devicePixelRatio * 1.5, 2.5),
      pdfCompression: true
    }
  } else {
    // Mobile or low-spec device
    return {
      imageQuality: 0.85,
      canvasScale: Math.min(device.devicePixelRatio * 1.2, 2),
      pdfCompression: true
    }
  }
}

/**
 * Progress tracking for PDF generation
 */
export class PDFExportProgress {
  private callbacks: Array<(progress: number, stage: string) => void> = []
  
  onProgress(callback: (progress: number, stage: string) => void) {
    this.callbacks.push(callback)
  }
  
  updateProgress(progress: number, stage: string) {
    this.callbacks.forEach(callback => callback(progress, stage))
  }
  
  async track<T>(promise: Promise<T>, stage: string, weight = 1): Promise<T> {
    this.updateProgress(0, stage)
    
    const result = await promise
    
    this.updateProgress(100 * weight, stage)
    return result
  }
}

/**
 * Comprehensive mobile PDF export function
 */
export const exportMobilePDF = async (
  elementId: string,
  filename: string,
  options: Partial<PDFExportOptions> = {},
  onProgress?: (progress: number, stage: string) => void
): Promise<{ success: boolean; error?: string; blob?: Blob }> => {
  const progress = new PDFExportProgress()
  if (onProgress) {
    progress.onProgress(onProgress)
  }
  
  try {
    progress.updateProgress(5, 'Initializing')
    
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }
    
    const device = getDeviceInfo()
    const optimalOptions = { ...getOptimalPDFOptions(device), ...options }
    
    progress.updateProgress(10, 'Preparing element')
    
    // Apply mobile styles and hide unwanted elements
    const restoreStyles = applyMobileStyles(element)
    const restoreElements = hideExportElements(element)
    const removeTempStyles = addTempStyles()
    
    // Add export class for CSS targeting
    element.classList.add('pdf-export-active')
    
    try {
      progress.updateProgress(20, 'Loading fonts and images')
      
      // Wait for resources to load
      await Promise.all([
        waitForFonts(),
        waitForImages(element)
      ])
      
      progress.updateProgress(40, 'Generating canvas')
      
      // Generate canvas with html2canvas
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(element, {
        scale: optimalOptions.scale,
        width: optimalOptions.width,
        height: optimalOptions.height,
        backgroundColor: optimalOptions.backgroundColor,
        useCORS: optimalOptions.useCORS,
        allowTaint: optimalOptions.allowTaint,
        // @ts-ignore – html2canvas exposes letterRendering though not yet in its TypeScript defs
        letterRendering: (optimalOptions as any).letterRendering,
        foreignObjectRendering: optimalOptions.foreignObjectRendering,
        imageTimeout: optimalOptions.timeout,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement && device.isMobile) {
            clonedElement.style.width = `${optimalOptions.width}px`
            clonedElement.style.maxWidth = `${optimalOptions.width}px`
            clonedElement.style.transform = 'none'
            clonedElement.style.position = 'static'
            clonedElement.style.boxSizing = 'border-box'
          }
        }
      })
      
      progress.updateProgress(70, 'Creating PDF')
      
      // Create PDF
      const jsPDF = (await import('jspdf')).default
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const dimensions = calculatePDFDimensions(
        canvas.width,
        canvas.height,
        pdfWidth,
        pdfHeight
      )
      
      // Fill background with white to prevent any transparency rendering as black in some PDF viewers
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')

      const imgData = canvas.toDataURL('image/jpeg', optimalOptions.quality)
      pdf.addImage(imgData, 'JPEG', dimensions.x, dimensions.y, dimensions.width, dimensions.height)
      
      progress.updateProgress(90, 'Saving file')
      
      // Save PDF
      pdf.save(filename)
      
      progress.updateProgress(100, 'Complete')
      
      return { success: true, blob: pdf.output('blob') }
      
    } finally {
      // Cleanup
      element.classList.remove('pdf-export-active')
      restoreStyles()
      restoreElements()
      removeTempStyles()
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { success: false, error: errorMessage }
  }
}
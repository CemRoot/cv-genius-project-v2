# Mobile PDF Export Solutions for html2canvas and jsPDF

## Enhanced html2canvas Configuration for Mobile

```javascript
const exportToPDFMobile = async () => {
  setIsExporting(true)
  try {
    const letterElement = document.getElementById('cover-letter-preview')
    if (letterElement) {
      // Mobile-specific preparation
      const originalTransform = letterElement.style.transform
      const originalWidth = letterElement.style.width
      const originalMaxWidth = letterElement.style.maxWidth
      
      // Temporarily set fixed dimensions for consistent rendering
      letterElement.style.transform = 'none'
      letterElement.style.width = '794px' // A4 width in pixels at 96 DPI
      letterElement.style.maxWidth = '794px'
      
      // Hide edit buttons during export
      const editButtons = letterElement.querySelectorAll('.no-export')
      editButtons.forEach(btn => (btn as HTMLElement).style.display = 'none')
      
      // Mobile-optimized canvas options
      const canvas = await html2canvas(letterElement, {
        scale: window.devicePixelRatio || 2, // Use device pixel ratio for optimal scaling
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        logging: false,
        width: 794, // Fixed A4 width
        height: letterElement.scrollHeight,
        // Mobile-specific options
        letterRendering: true,
        foreignObjectRendering: false, // Disable for better mobile compatibility
        imageTimeout: 15000, // Longer timeout for mobile
        onclone: (clonedDoc) => {
          // Fix mobile-specific styling issues in cloned document
          const clonedElement = clonedDoc.getElementById('cover-letter-preview')
          if (clonedElement) {
            clonedElement.style.position = 'static'
            clonedElement.style.left = '0'
            clonedElement.style.top = '0'
            clonedElement.style.transform = 'none'
            clonedElement.style.margin = '0'
            clonedElement.style.padding = '20px'
            clonedElement.style.boxSizing = 'border-box'
          }
        },
        ignoreElements: (element) => {
          return element.classList.contains('no-export') || 
                 element.classList.contains('print:hidden') ||
                 element.tagName === 'SCRIPT' ||
                 element.tagName === 'STYLE'
        }
      })
      
      // Restore original styles
      letterElement.style.transform = originalTransform
      letterElement.style.width = originalWidth
      letterElement.style.maxWidth = originalMaxWidth
      editButtons.forEach(btn => (btn as HTMLElement).style.display = '')
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      
      // Enhanced PDF creation with proper dimensions
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate proper scaling to maintain aspect ratio
      const canvasAspectRatio = canvas.height / canvas.width
      const pdfAspectRatio = pdfHeight / pdfWidth
      
      let finalWidth = pdfWidth
      let finalHeight = pdfWidth * canvasAspectRatio
      let xOffset = 0
      let yOffset = 0
      
      // Center the content if it doesn't fill the page
      if (finalHeight < pdfHeight) {
        yOffset = (pdfHeight - finalHeight) / 2
      } else if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight
        finalWidth = pdfHeight / canvasAspectRatio
        xOffset = (pdfWidth - finalWidth) / 2
      }
      
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight)
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
```

## CSS Optimizations for Mobile PDF Export

```css
/* Add these styles to ensure consistent PDF rendering */
@media print, (max-width: 768px) {
  #cover-letter-preview {
    /* Force desktop-like layout for PDF export */
    width: 794px !important;
    max-width: 794px !important;
    min-height: 1123px; /* A4 height */
    margin: 0 auto;
    padding: 40px;
    box-sizing: border-box;
    transform: none !important;
    
    /* Ensure text doesn't break awkwardly */
    word-wrap: break-word;
    word-break: normal;
    white-space: normal;
    
    /* Fix font rendering issues */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  
  /* Ensure all text elements maintain proper alignment */
  #cover-letter-preview * {
    box-sizing: border-box;
    max-width: 100%;
  }
  
  /* Fix signature alignment issues */
  #cover-letter-preview .signature-container {
    display: block;
    text-align: left;
    margin-top: 20px;
  }
  
  /* Prevent elements from being cut off */
  #cover-letter-preview .no-page-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
```

## React Hook for Mobile-Aware PDF Export

```javascript
import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const useMobilePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  
  const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }
  
  const waitForFonts = () => {
    return new Promise((resolve) => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resolve)
      } else {
        setTimeout(resolve, 1000) // Fallback timeout
      }
    })
  }
  
  const exportToPDF = useCallback(async (elementId, filename = 'document.pdf') => {
    setIsExporting(true)
    
    try {
      // Wait for fonts to load
      await waitForFonts()
      
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const isMobile = detectMobile()
      
      // Mobile-specific adjustments
      if (isMobile) {
        // Temporarily disable animations and transitions
        const style = document.createElement('style')
        style.textContent = `
          * {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
        `
        document.head.appendChild(style)
        
        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const canvas = await html2canvas(element, {
          scale: Math.min(window.devicePixelRatio * 1.5, 3), // Adaptive scaling
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width
          height: element.scrollHeight,
          letterRendering: true,
          foreignObjectRendering: false,
          imageTimeout: 20000,
          onclone: (clonedDoc) => {
            // Apply mobile fixes to cloned document
            const clonedElement = clonedDoc.getElementById(elementId)
            if (clonedElement) {
              clonedElement.style.width = '794px'
              clonedElement.style.maxWidth = '794px'
              clonedElement.style.margin = '0'
              clonedElement.style.transform = 'none'
            }
          }
        })
        
        // Remove temporary styles
        document.head.removeChild(style)
        
        // Create PDF with proper centering
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * pdfWidth) / canvas.width
        
        // Center vertically if content is shorter than page
        const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0
        
        pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, Math.min(imgHeight, pdfHeight))
        pdf.save(filename)
        
      } else {
        // Desktop export (your existing logic)
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(filename)
      }
      
    } catch (error) {
      console.error('PDF export failed:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])
  
  return { exportToPDF, isExporting }
}
```

## Alternative Solution: Using Puppeteer (Server-Side)

For the most reliable mobile PDF generation, consider implementing server-side rendering:

```javascript
// API route: /api/generate-pdf
import puppeteer from 'puppeteer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  try {
    const { html, options = {} } = req.body
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set mobile viewport for consistent rendering
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2
    })
    
    // Set content and wait for fonts
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Generate PDF with proper margins and formatting
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },
      ...options
    })
    
    await browser.close()
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf')
    res.send(pdf)
    
  } catch (error) {
    console.error('PDF generation failed:', error)
    res.status(500).json({ message: 'PDF generation failed' })
  }
}
```

## Key Takeaways

1. **Mobile Detection**: Always detect mobile devices and apply specific configurations
2. **Fixed Dimensions**: Use fixed pixel dimensions (794px for A4 width) to ensure consistent rendering
3. **Scale Adaptation**: Use `window.devicePixelRatio` for adaptive scaling on different devices
4. **CSS Fixes**: Apply temporary CSS fixes during export to prevent layout issues
5. **Font Loading**: Wait for fonts to load before generating PDFs
6. **Centering Logic**: Implement proper centering calculations for content alignment
7. **Server-Side Alternative**: Consider Puppeteer for production-grade PDF generation

These solutions address the main mobile PDF export issues: alignment problems, scaling inconsistencies, and responsive layout challenges.
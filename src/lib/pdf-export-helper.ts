import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const exportCoverLetterToPDF = async (
  elementId: string,
  fileName: string = 'Cover_Letter.pdf'
) => {
  try {
    // Get the element
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }

    // Create a temporary container with A4 dimensions
    const printContainer = document.createElement('div')
    printContainer.style.position = 'fixed'
    printContainer.style.left = '-9999px'
    printContainer.style.top = '0'
    printContainer.style.width = '210mm'
    printContainer.style.minHeight = '297mm'
    printContainer.style.padding = '20mm 15mm'
    printContainer.style.backgroundColor = '#ffffff'
    printContainer.style.boxSizing = 'border-box'
    printContainer.style.overflow = 'visible'
    
    // Clone the content
    const clone = element.cloneNode(true) as HTMLElement
    
    // Remove Card wrapper and get the actual content
    const innerContent = clone.querySelector('div > div') || clone.querySelector('div') || clone
    
    // Remove no-export elements
    innerContent.querySelectorAll('.no-export').forEach(el => el.remove())
    
    printContainer.appendChild(innerContent)
    document.body.appendChild(printContainer)
    
    // Force reflow and wait for styles
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 100)
      })
    })
    
    // Capture with html2canvas
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc, element) => {
        // Ensure all inline styles are preserved
        const allElements = element.querySelectorAll('*') as NodeListOf<HTMLElement>
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el)
          // Preserve important styles
          if (computedStyle.color) el.style.color = computedStyle.color
          if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            el.style.backgroundColor = computedStyle.backgroundColor
          }
          if (computedStyle.fontSize) el.style.fontSize = computedStyle.fontSize
          if (computedStyle.fontWeight) el.style.fontWeight = computedStyle.fontWeight
          if (computedStyle.lineHeight) el.style.lineHeight = computedStyle.lineHeight
        })
      }
    })
    
    // Remove temporary container
    document.body.removeChild(printContainer)
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate dimensions
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = 297
    
    // Add pages as needed
    let heightLeft = imgHeight
    let position = 0
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    
    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // Save PDF
    pdf.save(fileName)
    
    return true
  } catch (error) {
    console.error('PDF Export Error:', error)
    throw error
  }
}
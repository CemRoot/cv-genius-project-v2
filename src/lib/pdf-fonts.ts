import { Font } from '@react-pdf/renderer'

let fontsRegistered = false

export const registerPDFFonts = async () => {
  if (fontsRegistered) return
  
  try {
    // Use simpler, more reliable font registration
    // These fonts are built into most PDF viewers
    Font.register({
      family: 'Times-Roman',
      src: 'data:font/truetype;charset=utf-8;base64,', // Fallback
    })
    
    Font.register({
      family: 'Helvetica',
      src: 'data:font/truetype;charset=utf-8;base64,', // Fallback
    })
    
    fontsRegistered = true
    console.log('PDF fonts registered successfully')
  } catch (error) {
    console.warn('Font registration skipped, using system fonts')
    fontsRegistered = true // Continue anyway
  }
}

// Map font family names to PDF-compatible names
export const getFontFamilyForPDF = (fontFamily: string): string => {
  // Simple and reliable font mapping
  const fontMap: { [key: string]: string } = {
    // Serif fonts
    'Times New Roman': 'Times-Roman',
    'Georgia': 'Times-Roman',
    'Source Serif Pro': 'Times-Roman',
    'Source Serif 4': 'Times-Roman',
    'Merriweather': 'Times-Roman',
    'Playfair Display': 'Times-Roman',
    
    // Sans-serif fonts  
    'Arial': 'Helvetica',
    'Calibri': 'Helvetica',
    'Inter': 'Helvetica',
    'Roboto': 'Helvetica',
    'Open Sans': 'Helvetica',
    'Lato': 'Helvetica',
    'Montserrat': 'Helvetica',
    'Rubik': 'Helvetica'
  }
  
  return fontMap[fontFamily] || 'Helvetica'
}
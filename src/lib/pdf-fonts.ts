// PDF font utilities for React-PDF
// Standard PDF fonts (Helvetica, Times-Roman) don't need registration

let fontsRegistered = false

export const registerPDFFonts = async () => {
  if (fontsRegistered) return
  
  // Standard PDF fonts are available by default in React-PDF:
  // - Helvetica (sans-serif)
  // - Times-Roman (serif)
  // - Courier (monospace)
  // No registration needed for these fonts
  
  fontsRegistered = true
  console.log('PDF fonts ready - using standard PDF fonts')
}

// Map font family names to PDF-compatible standard fonts
export const getFontFamilyForPDF = (fontFamily: string): string => {
  const fontMap: { [key: string]: string } = {
    // Serif fonts -> Times-Roman
    'Times New Roman': 'Times-Roman',
    'Georgia': 'Times-Roman',
    'Source Serif Pro': 'Times-Roman',
    'Source Serif 4': 'Times-Roman',
    'Merriweather': 'Times-Roman',
    'Playfair Display': 'Times-Roman',
    
    // Sans-serif fonts -> Helvetica
    'Arial': 'Helvetica',
    'Calibri': 'Helvetica',
    'Inter': 'Helvetica',
    'Roboto': 'Helvetica',
    'Open Sans': 'Helvetica',
    'Lato': 'Helvetica',
    'Montserrat': 'Helvetica',
    'Rubik': 'Helvetica',
    
    // Monospace fonts -> Courier
    'Courier New': 'Courier',
    'Consolas': 'Courier',
    'Monaco': 'Courier'
  }
  
  // Default to Helvetica for unmapped fonts
  return fontMap[fontFamily] || 'Helvetica'
}
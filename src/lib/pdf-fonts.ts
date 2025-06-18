import { Font } from '@react-pdf/renderer'

// Professional Google Fonts WOFF2 URLs for CV/Resume applications
// These are the best alternatives to Times New Roman and Arial available on Google Fonts
const FONT_URLS = {
  // Times New Roman alternatives (Serif fonts)
  'Source Serif 4': {
    normal: 'https://fonts.gstatic.com/s/sourceserif4/v8/vEFy2_tTDB4M7-auWDN0ahZJW1ge5HjoQALF5xwg.woff2',
    bold: 'https://fonts.gstatic.com/s/sourceserif4/v8/vEF12_tTDB4M7-auWDN0ahZJW1gexVtcgAL-9f6L8q0.woff2'
  },
  'Merriweather': {
    normal: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZM.woff2',
    bold: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2'
  },
  'Playfair Display': {
    normal: 'https://fonts.gstatic.com/s/playfairdisplay/v39/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2',
    bold: 'https://fonts.gstatic.com/s/playfairdisplay/v39/nuFiD-vYSZviVYUb_rj3ij__anPXJOvxgEM86xRbOwKaUI5-FKSVSKtt.woff2'
  },
  
  // Arial alternatives (Sans-serif fonts)
  'Inter': {
    normal: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ8.woff2',
    bold: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9XibO0.woff2'
  },
  'Roboto': {
    normal: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    bold: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2'
  },
  'Open Sans': {
    normal: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.woff2',
    bold: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4taVQUwaEQbjA_J1U.woff2'
  },
  'Lato': {
    normal: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.woff2',
    bold: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2'
  },
  'Montserrat': {
    normal: 'https://fonts.gstatic.com/s/montserrat/v30/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2',
    bold: 'https://fonts.gstatic.com/s/montserrat/v30/JTUSjIg1_i6t8kCHKm459W1hyyTh89ZNpQ.woff2'
  }
}

let fontsRegistered = false

export const registerPDFFonts = async () => {
  if (fontsRegistered) return
  
  try {
    // Register each font family with normal and bold weights
    for (const [fontFamily, weights] of Object.entries(FONT_URLS)) {
      Font.register({
        family: fontFamily,
        fonts: [
          { 
            src: weights.normal, 
            fontWeight: 'normal',
            fontStyle: 'normal' 
          },
          { 
            src: weights.bold, 
            fontWeight: 'bold',
            fontStyle: 'normal' 
          }
        ]
      })
    }
    
    fontsRegistered = true
    console.log('PDF fonts registered successfully')
  } catch (error) {
    console.error('Error registering PDF fonts:', error)
    // Fallback to system fonts if registration fails
  }
}

// Map font family names to PDF-compatible names
export const getFontFamilyForPDF = (fontFamily: string): string => {
  // If custom fonts are registered, use the exact name
  if (fontsRegistered && FONT_URLS[fontFamily as keyof typeof FONT_URLS]) {
    return fontFamily
  }
  
  // Fallback mapping for system fonts and best alternatives
  const fontMap: { [key: string]: string } = {
    // System fonts (not available on Google Fonts)
    'Times New Roman': fontsRegistered ? 'Source Serif 4' : 'Times-Roman',
    'Arial': fontsRegistered ? 'Inter' : 'Helvetica',
    'Georgia': fontsRegistered ? 'Source Serif 4' : 'Times-Roman',
    'Calibri': fontsRegistered ? 'Inter' : 'Helvetica',
    
    // Professional Google Fonts (available)
    'Source Serif 4': fontsRegistered ? 'Source Serif 4' : 'Times-Roman',
    'Merriweather': fontsRegistered ? 'Merriweather' : 'Times-Roman',
    'Playfair Display': fontsRegistered ? 'Playfair Display' : 'Times-Roman',
    'Inter': fontsRegistered ? 'Inter' : 'Helvetica',
    'Roboto': fontsRegistered ? 'Roboto' : 'Helvetica',
    'Open Sans': fontsRegistered ? 'Open Sans' : 'Helvetica',
    'Lato': fontsRegistered ? 'Lato' : 'Helvetica',
    'Montserrat': fontsRegistered ? 'Montserrat' : 'Helvetica',
    
    // Legacy support
    'Rubik': fontsRegistered ? 'Montserrat' : 'Helvetica'
  }
  
  return fontMap[fontFamily] || (fontsRegistered ? 'Inter' : 'Helvetica')
}
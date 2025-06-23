/**
 * Utility functions for cleaning text extracted from PDFs
 */

/**
 * Clean text extracted from PDF to fix common issues
 * @param text - Raw text extracted from PDF
 * @returns Cleaned text
 */
export function cleanPDFText(text: string): string {
  if (!text) return ''

  return text
    // Fix common ligature issues
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    .replace(/ﬆ/g, 'st')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    
    // Fix special quotes and apostrophes
    .replace(/[''`]/g, "'")
    .replace(/[""„"]/g, '"')
    
    // Fix dashes and hyphens
    .replace(/[–—―]/g, '-')
    .replace(/­/g, '') // Remove soft hyphens
    
    // Fix spaces
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u200C/g, '') // Zero-width non-joiner
    .replace(/\u200D/g, '') // Zero-width joiner
    .replace(/\uFEFF/g, '') // Zero-width no-break space
    
    // Fix specific broken words first (most important)
    .replace(/\b(Arti)\s+(fi)\s+(cial)\b/gi, 'Artificial')
    .replace(/\b(Intel)\s+(li)\s+(gence)\b/gi, 'Intelligence')
    .replace(/\b(signifi)\s+(cant)\b/gi, 'significant')
    .replace(/\b(proffi)\s+(cient)\b/gi, 'proficient')
    .replace(/\b(profi)\s+(cient)\b/gi, 'proficient')
    .replace(/\b(effi)\s+(cient)\b/gi, 'efficient')
    .replace(/\b(speci)\s+(fi)\s+(c)\b/gi, 'specific')
    .replace(/\b(scientifi)\s+(c)\b/gi, 'scientific')
    
    // Fix broken words from PDF extraction - ligature patterns
    .replace(/(\w+)\s+(fi)\s+(\w+)/g, (match, p1, p2, p3) => {
      // Common ligature breaks in technical terms
      const combined = p1 + p2 + p3
      const technicalWords = [
        'artificial', 'scientific', 'specific', 'proficient', 
        'efficient', 'certificate', 'classification', 'configuration',
        'notification', 'verification', 'identification', 'qualification'
      ]
      
      if (technicalWords.some(word => word.toLowerCase() === combined.toLowerCase())) {
        return combined
      }
      return match
    })
    
    // Generic broken word pattern
    .replace(/(\w+)\s+([a-z]{1,2})\s+(\w+)/g, (match, p1, p2, p3) => {
      // Common PDF extraction patterns where words are broken
      const patterns = [
        'fi', 'fl', 'ff', 'ffi', 'ffl', 'st', 'th', 'ti', 'tt', 'li', 'ct', 'nt'
      ]
      
      if (patterns.includes(p2.toLowerCase())) {
        const combined = p1 + p2 + p3
        // Check if the combined word seems valid
        if (combined.length <= 20 && /^[A-Za-z]+$/.test(combined)) {
          return combined
        }
      }
      return match
    })
    
    // Fix spacing around punctuation
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])\s{2,}/g, '$1 ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    
    // Remove excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, '  ')
    .replace(/^\s+|\s+$/gm, '') // Trim each line
    
    // Fix common OCR errors
    .replace(/\b0(?=[A-Za-z])/g, 'O') // 0 -> O at word boundaries
    .replace(/\b(?<=[A-Za-z])0\b/g, 'O') // 0 -> O at word end
    .replace(/\b1(?=[A-Za-z])/g, 'I') // 1 -> I at word boundaries
    .replace(/\brn\b/g, 'm') // Common OCR error
    
    .trim()
}

/**
 * Check if text needs cleaning based on common PDF extraction issues
 * @param text - Text to check
 * @returns true if text likely needs cleaning
 */
export function needsPDFCleaning(text: string): boolean {
  const indicators = [
    /ﬁ|ﬂ|ﬀ|ﬃ|ﬄ/, // Ligatures
    /[''""„"]/, // Special quotes
    /\u00A0|\u200B/, // Special spaces
    /\w+\s+[a-z]{1,2}\s+\w+/, // Broken words
    /\s{3,}/, // Excessive spaces
  ]
  
  return indicators.some(pattern => pattern.test(text))
}

/**
 * Extract and clean email addresses from text
 * @param text - Text to extract emails from
 * @returns Array of cleaned email addresses
 */
export function extractEmails(text: string): string[] {
  const emailRegex = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/gi
  const matches = text.match(emailRegex) || []
  return [...new Set(matches.map(email => email.toLowerCase()))]
}

/**
 * Extract and clean phone numbers from text
 * @param text - Text to extract phone numbers from
 * @returns Array of cleaned phone numbers
 */
export function extractPhoneNumbers(text: string): string[] {
  // Irish phone number patterns
  const phoneRegex = /(?:\+353|0)\s*\d{1,2}\s*\d{3,4}\s*\d{4}/g
  const matches = text.match(phoneRegex) || []
  return [...new Set(matches.map(phone => phone.replace(/\s+/g, ' ').trim()))]
}
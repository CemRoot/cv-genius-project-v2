import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Irish-specific formatting utilities
export const irishDefaults = {
  dateFormat: 'DD/MM/YYYY',
  phoneFormat: '+353',
  addressFormat: 'Dublin',
  noPhoto: true, // GDPR compliance
  pageLimit: 2,
  sections: ['Personal', 'Summary', 'Experience', 'Education', 'Skills'],
  keywords: ['EU work authorization', 'Stamp 4', 'PPS Number eligible']
} as const

export function formatIrishPhone(phone: string): string {
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '')
  
  // If it starts with 353, format as international
  if (cleaned.startsWith('353')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`
  }
  
  // If it starts with 0, replace with +353
  if (cleaned.startsWith('0')) {
    return `+353 ${cleaned.slice(1, 3)} ${cleaned.slice(3)}`
  }
  
  return phone
}

// Text cleaning utilities for PDF copy-paste
export function cleanPdfText(text: string): string {
  if (!text) return text
  
  return text
    // Fix specific broken words from the example
    .replace(/\bIaman\b/gi, 'I am an')
    .replace(/\bwhois\b/gi, 'who is')
    .replace(/\bpursuinga\b/gi, 'pursuing a')
    .replace(/\bdegreein\b/gi, 'degree in')
    .replace(/\batthe\b/gi, 'at the')
    .replace(/\bpossessarobust\b/gi, 'possess a robust')
    .replace(/\bhavinggained\b/gi, 'having gained')
    .replace(/\bexperiencein\b/gi, 'experience in')
    .replace(/\bAsthe\b/gi, 'As the')
    .replace(/\bfounderofa\b/gi, 'founder of a')
    .replace(/\bIwas\b/gi, 'I was')
    .replace(/\bforthe\b/gi, 'for the')
    .replace(/\bofan\b/gi, 'of an')
    .replace(/\bthatwas\b/gi, 'that was')
    .replace(/\bterminatedasa\b/gi, 'terminated as a')
    .replace(/\bresultof\b/gi, 'result of')
    .replace(/\bobstaclesin\b/gi, 'obstacles in')
    .replace(/\bI aspireto\b/gi, 'I aspire to')
    .replace(/\benhancemyprofi\b/gi, 'enhance my profi')
    .replace(/\bciencyinartificial\b/gi, 'ciency in artificial')
    .replace(/\bassistance\b/gi, 'assistance')
    .replace(/\bwellasto\b/gi, 'well as to')
    .replace(/\bparticipatein\b/gi, 'participate in')
    .replace(/\bprojectsthathavea\b/gi, 'projects that have a')
    .replace(/\bimpactonthefield\b/gi, 'impact on the field')
    // Fix broken words with specific patterns
    .replace(/\b(Arti)\s+(fical)\b/gi, 'Artificial')
    .replace(/\b(Intel)\s+(ligence)\b/gi, 'Intelligence') 
    .replace(/\b(signifi)\s+(cant)\b/gi, 'significant')
    .replace(/\b(Mana)\s+(gement)\b/gi, 'Management')
    .replace(/\b(Deve)\s+(lopment)\b/gi, 'Development')
    .replace(/\b(Res)\s+(ponsible)\b/gi, 'Responsible')
    .replace(/\b(Expe)\s+(rience)\b/gi, 'Experience')
    .replace(/\b(Commu)\s+(nication)\b/gi, 'Communication')
    .replace(/\b(Colla)\s+(boration)\b/gi, 'Collaboration')
    .replace(/\b(Orga)\s+(nization)\b/gi, 'Organization')
    .replace(/\b(Imple)\s+(mentation)\b/gi, 'Implementation')
    .replace(/\b(Techno)\s+(logy)\b/gi, 'Technology')
    .replace(/\b(Profes)\s+(sional)\b/gi, 'Professional')
    .replace(/\b(Analy)\s+(sis)\b/gi, 'Analysis')
    .replace(/\b(Strate)\s+(gic)\b/gi, 'Strategic')
    .replace(/\b(Creati)\s+(vity)\b/gi, 'Creativity')
    .replace(/\b(Innova)\s+(tion)\b/gi, 'Innovation')
    // Fix common concatenated words only in English patterns
    .replace(/\b([a-z]+)a([A-Z][a-z]+)\b/g, '$1 a $2') // "pursinga" -> "pursuing a"
    .replace(/\b([a-z]+)the([A-Z][a-z]+)\b/g, '$1 the $2') // "atthe" -> "at the"
    .replace(/\b([a-z]+)in([A-Z][a-z]+)\b/g, '$1 in $2') // "degreein" -> "degree in"  
    .replace(/\b([a-z]+)of([A-Z][a-z]+)\b/g, '$1 of $2') // "resultof" -> "result of"
    .replace(/\b([a-z]+)to([A-Z][a-z]+)\b/g, '$1 to $2') // "aspireto" -> "aspire to"
    // Generic pattern for words broken in the middle
    .replace(/\b([A-Za-z]{3,})\s+([a-z]{2,6})\b/g, (match, word1, word2) => {
      // Common word ending patterns
      const endings = ['tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ical', 'inal', 'ance', 'ence', 'ive', 'ing', 'ed', 'er', 'est', 'ly', 'ty', 'cy', 'ry', 'fy', 'ize', 'ise', 'age', 'ful', 'less', 'ward', 'wise']
      
      // Check if word2 looks like a word ending
      if (endings.some(ending => word2.endsWith(ending) || word2 === ending)) {
        return `${word1}${word2}`
      }
      
      // Check if combined word is likely correct (basic heuristic)
      const combined = word1 + word2
      if (combined.length > 8 && word2.length >= 3 && word2.length <= 6) {
        return combined
      }
      
      return match
    })
    // Fix common PDF extraction issues
    .replace(/\bfi\b/g, 'fi') // Fix fi ligature
    .replace(/\bfl\b/g, 'fl') // Fix fl ligature  
    .replace(/\bffi\b/g, 'ffi') // Fix ffi ligature
    .replace(/\bffl\b/g, 'ffl') // Fix ffl ligature
    // Fix hyphenated words split across lines
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    // Remove excessive whitespace but preserve intentional spaces
    .replace(/[ \t]+/g, ' ')
    // Clean up multiple newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}

// Validate and format text input (only for PDF paste, not for regular text)
export function formatTextInput(text: string): string {
  // Only apply PDF cleaning if we detect obvious PDF issues
  if (hasObviousPdfIssues(text)) {
    return cleanPdfText(text)
      // Ensure proper sentence spacing
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Fix common abbreviations
      .replace(/\bi\.e\.\s*/gi, 'i.e. ')
      .replace(/\be\.g\.\s*/gi, 'e.g. ')
      .trim()
  }
  
  // For normal text, just do basic cleanup
  return text
    .replace(/\s+/g, ' ') // Fix multiple spaces
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim()
}

// Check if text has obvious PDF extraction issues
function hasObviousPdfIssues(text: string): boolean {
  // Don't apply PDF cleaning to Turkish text (contains Turkish characters)
  if (/[çğıöşüÇĞIÖŞÜ]/.test(text)) {
    return false
  }
  
  // Check for obvious English PDF extraction patterns only
  const pdfPatterns = [
    /\b(Arti)\s+(fical)\b/i, // Broken word with space
    /\b(Intel)\s+(ligence)\b/i,
    /\bfi\b/, // Ligature issues (but not if surrounded by letters)
    /\bfl\b/,
    /\b\w+-\s*\n\s*\w+\b/, // Hyphenated line breaks
    // Check for common concatenated English words from PDF
    /\bIaman\b/i,
    /\bwhois\b/i,
    /\bpursuinga\b/i,
    /\batthe\b/i,
    /\bexperiencein\b/i,
    /\bresponsiblefor\b/i,
  ]
  
  // Require at least 2 patterns to be confident it's PDF text
  const matchCount = pdfPatterns.filter(pattern => pattern.test(text)).length
  return matchCount >= 2
}
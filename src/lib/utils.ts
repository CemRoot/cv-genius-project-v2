import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cleanPDFText } from "@/lib/pdf-text-cleaner"

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
  // Use the enhanced PDF text cleaner to ensure consistency
  return cleanPDFText(text)
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
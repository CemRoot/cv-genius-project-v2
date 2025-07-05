// Irish CV formatting utilities

export const irishPhoneRegex = /^(\+353|00353|0)([1-9][0-9]{8})$/
export const dublinPostcodeRegex = /^D\d{2}W?\d{4}$/i

/**
 * Format a phone number for Irish display (DD/MM/YYYY)
 */
export function formatIrishDate(date: string | Date): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return typeof date === 'string' ? date : ''
    }

    return dateObj.toLocaleDateString('en-IE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return date.toString()
  }
}

/**
 * Format a phone number for Irish standards
 * Converts various formats to +353 XX XXX XXXX
 */
export function formatIrishPhone(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Handle different input formats
  let nationalNumber = ''
  
  if (digitsOnly.startsWith('353')) {
    // Already has country code
    nationalNumber = digitsOnly.slice(3)
  } else if (digitsOnly.startsWith('0')) {
    // Starts with 0 (national format)
    nationalNumber = digitsOnly.slice(1)
  } else if (digitsOnly.length === 9) {
    // Just the 9-digit number
    nationalNumber = digitsOnly
  } else {
    // Return original if we can't parse it
    return phone
  }
  
  // Validate Irish mobile/landline format
  if (nationalNumber.length !== 9) {
    return phone
  }
  
  // Format as +353 XX XXX XXXX
  const areaCode = nationalNumber.slice(0, 2)
  const firstPart = nationalNumber.slice(2, 5)
  const secondPart = nationalNumber.slice(5)
  
  return `+353 ${areaCode} ${firstPart} ${secondPart}`
}

/**
 * Validate Irish phone number
 */
export function isValidIrishPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '')
  return irishPhoneRegex.test(cleaned)
}

/**
 * Format Dublin postcode
 */
export function formatDublinPostcode(postcode: string): string {
  if (!postcode) return ''
  
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase()
  
  // Check if it matches Dublin postcode format
  if (dublinPostcodeRegex.test(cleaned)) {
    return cleaned
  }
  
  // Try to format if it looks like a Dublin postcode
  if (/^D\d{2}/.test(cleaned)) {
    return cleaned
  }
  
  return postcode
}

/**
 * Get Irish county list
 */
export const irishCounties = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
]

/**
 * Format Irish address
 */
export function formatIrishAddress(address: string): string {
  if (!address) return ''
  
  // Basic formatting - capitalize county names
  let formatted = address
  
  irishCounties.forEach(county => {
    const regex = new RegExp(`\\b${county}\\b`, 'gi')
    formatted = formatted.replace(regex, county)
  })
  
  return formatted
}

/**
 * Irish grading system mapping
 */
export const irishGrades = {
  'First Class Honours': { min: 70, description: 'First Class Honours (70%+)' },
  '2:1': { min: 60, description: 'Second Class Honours, Grade 1 (60-69%)' },
  '2:2': { min: 50, description: 'Second Class Honours, Grade 2 (50-59%)' },
  'Third Class': { min: 40, description: 'Third Class Honours (40-49%)' },
  'Pass': { min: 35, description: 'Pass (35-39%)' }
}

/**
 * Convert percentage to Irish grade
 */
export function percentageToIrishGrade(percentage: number): string {
  if (percentage >= 70) return 'First Class Honours'
  if (percentage >= 60) return '2:1'
  if (percentage >= 50) return '2:2'
  if (percentage >= 40) return 'Third Class'
  if (percentage >= 35) return 'Pass'
  return 'Fail'
}

/**
 * Common Irish institutions
 */
export const irishInstitutions = [
  'Trinity College Dublin',
  'University College Dublin',
  'University College Cork',
  'NUI Galway',
  'Dublin City University',
  'Maynooth University',
  'University of Limerick',
  'Technological University Dublin',
  'Cork Institute of Technology',
  'Waterford Institute of Technology',
  'Institute of Technology Carlow',
  'Athlone Institute of Technology',
  'Letterkenny Institute of Technology',
  'Dundalk Institute of Technology'
]

/**
 * Format work authorization status for Ireland
 */
export function getWorkAuthorizationText(isEuCitizen: boolean, hasStampPermission?: string): string {
  if (isEuCitizen) {
    return 'Authorized to work in Ireland (EU Citizen)'
  }
  
  if (hasStampPermission) {
    return `Authorized to work in Ireland (${hasStampPermission})`
  }
  
  return 'Work authorization required'
}

/**
 * Irish CV length calculator (approximate)
 */
export function estimatePageCount(text: string): number {
  // Rough estimation based on character count
  // Average: 2500-3000 characters per page in CV format
  const charCount = text.length
  const avgCharsPerPage = 2750
  
  return Math.ceil(charCount / avgCharsPerPage)
}

/**
 * Irish business holidays (for scheduling interviews etc)
 */
export const irishPublicHolidays2024 = [
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-03-17', name: "St. Patrick's Day" },
  { date: '2024-03-29', name: 'Good Friday' },
  { date: '2024-04-01', name: 'Easter Monday' },
  { date: '2024-05-06', name: 'May Bank Holiday' },
  { date: '2024-06-03', name: 'June Bank Holiday' },
  { date: '2024-08-05', name: 'August Bank Holiday' },
  { date: '2024-10-28', name: 'October Bank Holiday' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: "St. Stephen's Day" }
]
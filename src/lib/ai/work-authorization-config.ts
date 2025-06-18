// Comprehensive work authorization keywords and configurations for global users

export const WORK_AUTHORIZATION = {
  // Irish Immigration Stamps
  irishStamps: {
    stamp1: ['stamp 1', 'stamp1', 'permission to remain', 'non-eea worker'],
    stamp1a: ['stamp 1a', 'stamp1a', 'accountancy trainee'],
    stamp1g: ['stamp 1g', 'stamp1g', 'graduate scheme', 'graduate programme'],
    stamp2: ['stamp 2', 'stamp2', 'study permission', 'student visa'],
    stamp2a: ['stamp 2a', 'stamp2a', 'study and work'],
    stamp3: ['stamp 3', 'stamp3', 'non-eea family member'],
    stamp4: ['stamp 4', 'stamp4', 'long-term residence', 'permanent residence'],
    stamp5: ['stamp 5', 'stamp5', 'eu treaty rights'],
    stamp6: ['stamp 6', 'stamp6', 'dual citizen', 'dual citizenship']
  },

  // Work Permit Types
  workPermits: {
    critical: ['critical skills permit', 'critical skills employment permit', 'csep'],
    general: ['general employment permit', 'gep', 'work permit'],
    ict: ['intra-company transfer', 'ict permit'],
    researcher: ['researcher permit', 'scientific researcher'],
    sport: ['sport and cultural permit'],
    exchange: ['exchange agreement permit']
  },

  // EU/EEA Status
  euStatus: {
    citizen: ['eu citizen', 'eea citizen', 'european citizen', 'eu national', 'eea national'],
    resident: ['eu resident', 'eea resident', 'long-term eu resident'],
    family: ['eu family member', 'eea family member']
  },

  // Global Status Terms
  globalStatus: {
    sponsorship: ['visa sponsorship required', 'sponsorship needed', 'requires sponsorship'],
    noSponsorship: ['no sponsorship required', 'no visa required', 'authorised to work'],
    pending: ['visa pending', 'work authorization pending', 'application in progress'],
    student: ['student visa', 'f1 visa', 'tier 4 visa', 'study permit'],
    refugee: ['refugee status', 'asylum seeker', 'humanitarian protection'],
    spouse: ['spouse visa', 'partner visa', 'family reunification']
  },

  // Student Work Rights
  studentRights: {
    ireland: ['20 hours per week', 'part-time work allowed', 'casual work permit'],
    postStudy: ['stay back visa', 'graduate work permit', 'post-study work'],
    internship: ['internship visa', 'training visa', 'placement visa']
  },

  // Language Levels for Work Authorization
  languageRequirements: {
    english: {
      native: ['native english speaker', 'native speaker', 'first language english'],
      fluent: ['fluent english', 'fluent in english', 'advanced english'],
      professional: ['professional english', 'business english', 'working proficiency'],
      intermediate: ['intermediate english', 'conversational english'],
      basic: ['basic english', 'elementary english']
    },
    certifications: ['ielts', 'toefl', 'cambridge english', 'pte academic', 'oet']
  },

  // Common phrases for work authorization
  phrases: {
    authorized: [
      'authorised to work in ireland',
      'eligible to work in the eu',
      'no work restrictions',
      'full work rights',
      'unrestricted work permission'
    ],
    restricted: [
      'work authorization pending',
      'limited work hours',
      'conditional work permission',
      'subject to work restrictions'
    ],
    seeking: [
      'seeking sponsorship',
      'open to sponsorship',
      'willing to relocate with sponsorship',
      'visa application support needed'
    ]
  }
}

// Function to detect work authorization status from CV text
export function detectWorkAuthorization(cvText: string): {
  status: 'authorized' | 'restricted' | 'unknown' | 'pending'
  details: string[]
  suggestions: string[]
} {
  const text = cvText.toLowerCase()
  const details: string[] = []
  const suggestions: string[] = []
  
  // Check for explicit authorization
  const authorizedTerms = [
    ...WORK_AUTHORIZATION.euStatus.citizen,
    ...WORK_AUTHORIZATION.irishStamps.stamp4,
    ...WORK_AUTHORIZATION.phrases.authorized
  ]
  
  const restrictedTerms = [
    ...WORK_AUTHORIZATION.globalStatus.sponsorship,
    ...WORK_AUTHORIZATION.phrases.restricted,
    ...WORK_AUTHORIZATION.studentRights.ireland
  ]
  
  const pendingTerms = [
    ...WORK_AUTHORIZATION.globalStatus.pending,
    ...WORK_AUTHORIZATION.phrases.seeking
  ]

  let status: 'authorized' | 'restricted' | 'unknown' | 'pending' = 'unknown'
  
  // Check authorization level
  if (authorizedTerms.some(term => text.includes(term))) {
    status = 'authorized'
    details.push('Full work authorization detected')
  } else if (restrictedTerms.some(term => text.includes(term))) {
    status = 'restricted'
    details.push('Work restrictions or sponsorship requirements detected')
  } else if (pendingTerms.some(term => text.includes(term))) {
    status = 'pending'
    details.push('Work authorization application in progress')
  }

  // Generate suggestions based on status
  if (status === 'unknown') {
    suggestions.push('Consider adding your work authorization status clearly')
    suggestions.push('If you\'re an EU citizen, mention "EU citizen - no visa required"')
    suggestions.push('If you need sponsorship, state "Open to visa sponsorship"')
  }

  if (status === 'restricted') {
    suggestions.push('Be upfront about sponsorship requirements early in applications')
    suggestions.push('Highlight your unique skills that justify sponsorship costs')
  }

  return { status, details, suggestions }
}

// Function to suggest work authorization improvements
export function suggestWorkAuthImprovements(
  cvText: string, 
  targetLocation: string = 'ireland'
): string[] {
  const suggestions: string[] = []
  const { status } = detectWorkAuthorization(cvText)
  
  if (status === 'unknown') {
    switch (targetLocation.toLowerCase()) {
      case 'ireland':
        suggestions.push('Add: "EU citizen - authorised to work in Ireland" or "Visa sponsorship required"')
        break
      case 'uk':
        suggestions.push('Add: "Right to work in the UK" or "Visa sponsorship required"')
        break
      case 'usa':
        suggestions.push('Add: "Authorised to work in the US" or "H1-B sponsorship required"')
        break
      default:
        suggestions.push('Clearly state your work authorization status for target country')
    }
  }

  // Language suggestions
  const text = cvText.toLowerCase()
  if (!WORK_AUTHORIZATION.languageRequirements.english.native.some(term => text.includes(term))) {
    if (!WORK_AUTHORIZATION.languageRequirements.certifications.some(cert => text.includes(cert))) {
      suggestions.push('Consider mentioning your English proficiency level')
      suggestions.push('Add language certifications if you have them (IELTS, TOEFL, etc.)')
    }
  }

  return suggestions
}

// Get work authorization keywords for ATS optimization
export function getWorkAuthKeywords(location: string = 'ireland'): string[] {
  const keywords: string[] = []
  
  // Add location-specific keywords
  switch (location.toLowerCase()) {
    case 'ireland':
      keywords.push(
        ...WORK_AUTHORIZATION.euStatus.citizen,
        ...WORK_AUTHORIZATION.irishStamps.stamp4,
        ...WORK_AUTHORIZATION.workPermits.critical
      )
      break
    case 'uk':
      keywords.push('right to work in uk', 'british citizen', 'settled status', 'pre-settled status')
      break
    case 'usa':
      keywords.push('authorized to work in us', 'us citizen', 'green card holder', 'h1-b visa')
      break
    case 'canada':
      keywords.push('authorized to work in canada', 'canadian citizen', 'permanent resident', 'work permit')
      break
    case 'australia':
      keywords.push('authorized to work in australia', 'australian citizen', 'permanent resident', '457 visa')
      break
  }
  
  // Add universal terms
  keywords.push(
    ...WORK_AUTHORIZATION.phrases.authorized,
    ...WORK_AUTHORIZATION.languageRequirements.english.fluent
  )
  
  return keywords
}
export const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.7,      // Default for balanced creativity/accuracy
  topP: 0.9,            // Response diversity
  topK: 40,             // Token selection
  maxOutputTokens: 2048,
  
  // Context-specific configurations
  contexts: {
    coverLetter: { 
      temperature: 0.7,      // Creative but professional
      maxOutputTokens: 2048,
      topP: 0.9 
    },
    cvOptimization: { 
      temperature: 0.3,      // More factual, less creative
      maxOutputTokens: 1500,
      topP: 0.8 
    },
    keywordExtraction: { 
      temperature: 0.2,      // Very precise and factual
      maxOutputTokens: 1000,
      topP: 0.7 
    },
    jobAnalysis: {
      temperature: 0.4,      // Analytical but flexible
      maxOutputTokens: 1500,
      topP: 0.8
    },
    cvAnalysis: {
      temperature: 0.5,      // Balanced for feedback
      maxOutputTokens: 2000,
      topP: 0.85
    }
  },

  // Safety settings for professional content
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ]
}

// Helper function to get context-specific config
export function getContextConfig(context: keyof typeof GEMINI_CONFIG.contexts) {
  const baseConfig = {
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    topP: GEMINI_CONFIG.topP,
    topK: GEMINI_CONFIG.topK,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
    safetySettings: GEMINI_CONFIG.safetySettings
  }

  const contextConfig = GEMINI_CONFIG.contexts[context]
  
  return {
    ...baseConfig,
    ...contextConfig
  }
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxRequests: 10,      // requests per window
  windowMs: 60000,      // 1 minute window
  message: 'Too many requests. Please try again in a minute.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}

// Language detection patterns
export const LANGUAGE_PATTERNS = {
  english: {
    variants: ['british', 'american', 'irish', 'international'],
    spellings: {
      british: ['colour', 'organisation', 'centre', 'realise'],
      american: ['color', 'organization', 'center', 'realize'],
      irish: ['colour', 'organisation', 'centre', 'realise'] // Same as British
    }
  }
}
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { getContextConfig } from './ai/gemini-config'
import { NextResponse } from 'next/server'

// Server-side only Gemini client
if (typeof window !== 'undefined') {
  throw new Error('Gemini client should only be used on the server side')
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!API_KEY && process.env.NODE_ENV !== 'development') {
  console.warn('GEMINI_API_KEY environment variable is not set')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// Utility function to check API key configuration
export function validateApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return NextResponse.json(
      { 
        error: 'AI service not configured', 
        message: 'Please set your GEMINI_API_KEY in .env.local file to use AI features.',
        setup: 'Get your API key from https://makersuite.google.com/app/apikey'
      },
      { status: 503 }
    )
  }
  return null // API key is valid
}

// Model configurations with context-aware settings
export const models = {
  geminiPro: genAI?.getGenerativeModel({ model: 'gemini-2.0-flash' }),
  geminiProVision: genAI?.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

// Safety settings for professional content
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Generation config for consistent responses
export const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
}

// Legacy prompt templates (deprecated - use GLOBAL_PROMPTS instead)
// Kept for backward compatibility during migration
export const promptTemplates = {
  analyzeCV: 'DEPRECATED: Use GLOBAL_PROMPTS.analyzeCv instead',
  analyzeJob: 'DEPRECATED: Use GLOBAL_PROMPTS.analyzeJob instead', 
  generateCoverLetter: 'DEPRECATED: Use GLOBAL_PROMPTS.generateCoverLetter instead',
  optimizeKeywords: 'DEPRECATED: Use GLOBAL_PROMPTS.optimizeCv instead',
  extractKeywords: 'DEPRECATED: Use GLOBAL_PROMPTS.extractKeywords instead'
}

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10
  
  const userLimits = rateLimitStore.get(userId)
  
  if (!userLimits || now > userLimits.resetTime) {
    // Reset or create new limit window
    const resetTime = now + windowMs
    rateLimitStore.set(userId, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (userLimits.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: userLimits.resetTime }
  }
  
  userLimits.count += 1
  return { allowed: true, remaining: maxRequests - userLimits.count, resetTime: userLimits.resetTime }
}

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate content with context-aware configuration and retry logic
export async function generateContent(prompt: string, options?: {
  model?: 'gemini-2.0-flash'
  context?: 'coverLetter' | 'cvOptimization' | 'keywordExtraction' | 'jobAnalysis' | 'cvAnalysis' | 'cvExtraction'
  temperature?: number
  maxTokens?: number
  retryAttempts?: number
}) {
  const maxRetries = options?.retryAttempts ?? 3
  let lastError: Error | null = null
  
  // Retry with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (!genAI) {
        throw new Error('Gemini client not initialized - GEMINI_API_KEY missing')
      }
      
      const model = models.geminiPro
      
      if (!model) {
        throw new Error('Gemini model not available')
      }

      // Get context-specific configuration
      const contextConfig = options?.context ? getContextConfig(options.context) : generationConfig
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? contextConfig.temperature,
          maxOutputTokens: options?.maxTokens ?? contextConfig.maxOutputTokens,
          topK: contextConfig.topK,
          topP: contextConfig.topP,
        },
        safetySettings,
      })

      const response = await result.response
      return {
        success: true,
        content: response.text(),
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Gemini API Error (attempt ${attempt + 1}/${maxRetries}):`, error)
      
      // Check if it's a 503 overload error
      const errorMessage = lastError.message
      const isOverloaded = errorMessage.includes('503') || 
                          errorMessage.includes('overloaded') || 
                          errorMessage.includes('Service Unavailable')
      
      // If it's the last attempt or not a retryable error, return error
      if (attempt === maxRetries - 1 || !isOverloaded) {
        return {
          success: false,
          error: isOverloaded 
            ? 'AI service is temporarily overloaded. Please try again in a few moments.'
            : errorMessage,
          isOverloaded,
          content: null,
          usage: null
        }
      }
      
      // Calculate exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.pow(2, attempt) * 1000
      console.log(`Retrying in ${backoffMs}ms due to overload...`)
      await wait(backoffMs)
    }
  }
  
  // This should never be reached, but just in case
  return {
    success: false,
    error: lastError?.message || 'Unknown error occurred',
    isOverloaded: false,
    content: null,
    usage: null
  }
}

// Utility to replace template variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let filled = template
  for (const [key, value] of Object.entries(variables)) {
    filled = filled.replace(new RegExp(`{${key}}`, 'g'), value || '')
  }
  return filled
}
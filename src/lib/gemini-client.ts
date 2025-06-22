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

// Generate content with context-aware configuration
export async function generateContent(prompt: string, options?: {
  model?: 'gemini-2.0-flash'
  context?: 'coverLetter' | 'cvOptimization' | 'keywordExtraction' | 'jobAnalysis' | 'cvAnalysis'
  temperature?: number
  maxTokens?: number
}) {
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
    console.error('Gemini API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      content: null,
      usage: null
    }
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
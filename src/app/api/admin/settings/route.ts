import { NextRequest, NextResponse } from 'next/server'

interface AISettings {
  temperature: number
  topP: number
  maxTokens: number
  model: string
  systemPrompt: string
}

interface ContextAISettings {
  coverLetter: AISettings
  cvAnalysis: AISettings
  cvOptimization: AISettings
  jobAnalysis: AISettings
  keywordExtraction: AISettings
}

// Persistent AI settings management
class AISettingsManager {
  private static contextSettings: ContextAISettings | null = null
  private static readonly ENV_KEY = 'ADMIN_AI_SETTINGS'

  private static getDefaultSettings(): ContextAISettings {
    return {
      coverLetter: {
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 2048,
        model: 'gemini-2.0-flash',
        systemPrompt: 'You are a professional cover letter writing assistant specialized for the Irish job market. Create compelling, personalized cover letters that highlight relevant experience and skills while maintaining a professional Irish business tone.'
      },
      cvAnalysis: {
        temperature: 0.5,
        topP: 0.85,
        maxTokens: 2000,
        model: 'gemini-2.0-flash',
        systemPrompt: 'You are a CV analysis expert for the Irish job market. Provide constructive feedback on CVs, highlighting strengths, areas for improvement, and alignment with Irish hiring practices and ATS systems.'
      },
      cvOptimization: {
        temperature: 0.3,
        topP: 0.8,
        maxTokens: 1500,
        model: 'gemini-2.0-flash',
        systemPrompt: 'You are a CV optimization specialist. Focus on improving CV content for ATS compatibility and Irish job market standards. Provide factual, precise suggestions for better keyword usage and formatting.'
      },
      jobAnalysis: {
        temperature: 0.4,
        topP: 0.8,
        maxTokens: 1500,
        model: 'gemini-2.0-flash',
        systemPrompt: 'You are a job description analysis expert. Extract key requirements, skills, and qualifications from job postings. Identify important keywords and company culture indicators for the Irish job market.'
      },
      keywordExtraction: {
        temperature: 0.2,
        topP: 0.7,
        maxTokens: 1000,
        model: 'gemini-2.0-flash',
        systemPrompt: 'You are a keyword extraction specialist. Extract relevant industry keywords, skills, and phrases from job descriptions and CVs. Focus on ATS-friendly terms and Irish job market terminology.'
      }
    }
  }

  static loadSettings(): ContextAISettings {
    if (this.contextSettings) return this.contextSettings

    try {
      // Try to load from environment variable first (Vercel compatible)
      const envSettings = process.env[this.ENV_KEY]
      if (envSettings) {
        this.contextSettings = JSON.parse(envSettings)
        console.log('🤖 AI settings loaded from environment')
        return this.contextSettings!
      }

      // Fallback to file system for local development
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        const fs = require('fs')
        const path = require('path')
        const SETTINGS_FILE = path.join(process.cwd(), '.ai-settings.json')
        
        if (fs.existsSync(SETTINGS_FILE)) {
          const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
          this.contextSettings = JSON.parse(data)
          console.log('🤖 AI settings loaded from file')
          return this.contextSettings!
        }
      }
    } catch (error) {
      console.error('Error loading AI settings:', error)
    }

    // Default settings
    this.contextSettings = this.getDefaultSettings()
    console.log('🤖 Using default AI settings')
    return this.contextSettings
  }

  static saveSettings(settings: ContextAISettings): void {
    this.contextSettings = settings

    try {
      const settingsJson = JSON.stringify(settings)

      // For local development, save to file
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        const fs = require('fs')
        const path = require('path')
        const SETTINGS_FILE = path.join(process.cwd(), '.ai-settings.json')
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
        console.log('💾 AI settings saved to file (development)')
      }

      // Note: For Vercel production, you need to manually update environment variable
      console.log('💾 AI settings updated (restart required for Vercel)')
      console.log('⚠️  For production persistence, set ADMIN_AI_SETTINGS environment variable to:', settingsJson)
      
    } catch (error) {
      console.error('Error saving AI settings:', error)
    }
  }

  static updateContext(context: keyof ContextAISettings, settings: AISettings): void {
    const currentSettings = this.loadSettings()
    currentSettings[context] = settings
    this.saveSettings(currentSettings)
  }
}

// Load settings on module initialization
const contextSettings = AISettingsManager.loadSettings()

// Legacy single settings for backward compatibility
let currentSettings: AISettings = contextSettings.coverLetter

export async function GET() {
  const currentContextSettings = AISettingsManager.loadSettings()
  return NextResponse.json({
    success: true,
    settings: currentSettings, // Legacy single settings
    contextSettings: currentContextSettings // New context-specific settings
  })
}

export async function POST(request: NextRequest) {
  try {
    // Authentication is handled by middleware, admin info is in headers
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Check if this is context-specific settings update
    if (body.contextSettings && body.activeContext) {
      const { contextSettings: newContextSettings, activeContext } = body as {
        contextSettings: ContextAISettings
        activeContext: keyof ContextAISettings
      }

      // Validate the specific context being updated
      const contextToUpdate = newContextSettings[activeContext]
      const validationResult = validateAISettings(contextToUpdate)
      
      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        )
      }

      // Update the specific context
      const updatedContextSettings = {
        temperature: Number(contextToUpdate.temperature),
        topP: Number(contextToUpdate.topP),
        maxTokens: Number(contextToUpdate.maxTokens),
        model: contextToUpdate.model,
        systemPrompt: contextToUpdate.systemPrompt
      }

      // Update using AISettingsManager for persistence
      AISettingsManager.updateContext(activeContext, updatedContextSettings)

      // Update legacy settings if cover letter context was updated
      if (activeContext === 'coverLetter') {
        currentSettings = updatedContextSettings
      }

      console.log(`🔧 Admin (${adminEmail}): ${activeContext} AI Settings updated:`, updatedContextSettings)

      // Get updated settings to return
      const updatedSettings = AISettingsManager.loadSettings()

      return NextResponse.json({
        success: true,
        message: `${activeContext} settings updated successfully`,
        contextSettings: updatedSettings,
        activeContext: activeContext
      })
    }
    
    // Legacy single settings update (for backward compatibility)
    const settings: AISettings = body
    const validationResult = validateAISettings(settings)
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Update legacy settings
    currentSettings = {
      temperature: Number(settings.temperature),
      topP: Number(settings.topP),
      maxTokens: Number(settings.maxTokens),
      model: settings.model,
      systemPrompt: settings.systemPrompt
    }

    console.log(`🔧 Admin (${adminEmail}): Legacy AI Settings updated:`, currentSettings)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: currentSettings
    })

  } catch (error) {
    console.error('Admin Settings API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to validate AI settings
function validateAISettings(settings: AISettings): { isValid: boolean; error?: string } {
  if (settings.temperature < 0 || settings.temperature > 1) {
    return { isValid: false, error: 'Temperature must be between 0 and 1' }
  }

  if (settings.topP < 0 || settings.topP > 1) {
    return { isValid: false, error: 'Top-P must be between 0 and 1' }
  }

  if (settings.maxTokens < 100 || settings.maxTokens > 8192) {
    return { isValid: false, error: 'Max tokens must be between 100 and 8192' }
  }

  if (!settings.model || typeof settings.model !== 'string') {
    return { isValid: false, error: 'Model must be specified' }
  }

  if (!settings.systemPrompt || typeof settings.systemPrompt !== 'string') {
    return { isValid: false, error: 'System prompt must be specified' }
  }

  return { isValid: true }
}

// Export functions to get settings for other API routes
export function getCurrentAISettings(): AISettings {
  return currentSettings
}

export function getContextAISettings(): ContextAISettings {
  return AISettingsManager.loadSettings()
}

export function getContextSpecificSettings(context: keyof ContextAISettings): AISettings {
  const settings = AISettingsManager.loadSettings()
  return settings[context]
}
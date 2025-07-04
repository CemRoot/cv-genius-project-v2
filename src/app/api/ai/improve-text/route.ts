import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit } from '@/lib/gemini-client'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'
import { safeReadJSON, getDataFilePath } from '@/lib/safe-file-ops'

// Configuration for AI processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

// Load CV Builder prompts from admin settings
async function loadCVBuilderPrompts() {
  const promptsPath = getDataFilePath('cv-builder-prompts.json')
  return await safeReadJSON(promptsPath, getDefaultPrompts())
}

// Default prompts extracted to separate function
function getDefaultPrompts() {
  return {
    textImprovement: {
      systemPrompt: 'You are a CV text improvement bot. Your ONLY job is to take the provided text and return an improved version. DO NOT ask questions. DO NOT provide explanations. DO NOT give advice. DO NOT request more information. ONLY return the improved text. If you cannot improve the text, return it unchanged.',
      prompts: {
        general: `Improve this CV text while preserving its original meaning and language.

Original text: "{text}"
Text type: {type}

Instructions:
- Fix grammar and spelling errors only
- Improve sentence structure and flow
- Make it more professional and clear
- DO NOT change the language or add content
- DO NOT merge words together
- Preserve the original tone and meaning
- Keep the same length approximately
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`,
        professionalSummary: `Improve this professional summary text.

Original text: "{text}"

Instructions:
- Fix grammar and spelling errors
- Make it more impactful and professional
- Keep it concise (2-3 sentences)
- DO NOT change the language
- DO NOT add new information
- Focus on highlighting key strengths
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`,
        experience: `Improve this work experience text.

Original text: "{text}"

Instructions:
- Fix grammar and spelling errors
- Use strong action verbs
- Make achievements more quantifiable where possible
- Keep it professional and clear
- DO NOT change the language
- DO NOT add fake information
- Preserve the original meaning
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`,
        skills: `Improve this skills text.

Original text: "{text}"

Instructions:
- Fix grammar and spelling errors
- Make it concise and clear
- Use industry-standard terminology
- DO NOT change the language
- DO NOT add new skills
- Keep the original skills mentioned
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`,
        education: `Improve this education text.

Original text: "{text}"

Instructions:
- Fix grammar and spelling errors
- Format consistently
- Make it clear and professional
- DO NOT change the language
- DO NOT add fake information
- Keep all original details
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`
      }
    },
    settings: {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxTokens: 1500
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { 
          error: 'AI service not configured', 
          message: 'Please set your GEMINI_API_KEY in .env.local file to use AI features.',
          setup: 'Get your API key from https://makersuite.google.com/app/apikey'
        },
        { status: 503 }
      )
    }

    // Get user ID for rate limiting (in production, use actual user auth)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    
    // Check rate limit
    const rateLimit = checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { text, type }: { text: string; type: string } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Load admin-configured prompts
    const cvPrompts = await loadCVBuilderPrompts()
    
    // Select appropriate prompt based on type
    let selectedPrompt = cvPrompts.textImprovement.prompts.general
    
    switch (type) {
      case 'professionalSummary':
      case 'professional_summary':
      case 'summary':
        selectedPrompt = cvPrompts.textImprovement.prompts.professionalSummary
        break
      case 'experience':
      case 'workExperience':
      case 'work_experience':
        selectedPrompt = cvPrompts.textImprovement.prompts.experience
        break
      case 'skills':
      case 'technicalSkills':
      case 'technical_skills':
        selectedPrompt = cvPrompts.textImprovement.prompts.skills
        break
      case 'education':
        selectedPrompt = cvPrompts.textImprovement.prompts.education
        break
      default:
        selectedPrompt = cvPrompts.textImprovement.prompts.general
    }

    // Build the complete prompt with system prompt and specific instructions
    const systemPrompt = cvPrompts.textImprovement.systemPrompt
    
    // Replace placeholders in the selected prompt
    const filledPrompt = selectedPrompt
      .replace('{text}', text)
      .replace('{type}', type)
    
    const prompt = `${systemPrompt}

${filledPrompt}`

    // Debug log for troubleshooting
    console.log('AI Text Improvement Request:', {
      type,
      textLength: text.length,
      promptType: type === 'experience' ? 'experience' : 
                  type === 'professional_summary' ? 'professionalSummary' : 
                  type === 'skills' ? 'skills' : 
                  type === 'education' ? 'education' : 'general'
    })

    // Generate AI response using admin-configured settings
    const result = await generateContent(prompt, {
      context: 'cvOptimization',
      maxTokens: cvPrompts.settings.maxTokens || 1500,
      temperature: cvPrompts.settings.temperature || 0.3
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to improve text', details: result.error },
        { status: 500 }
      )
    }

    // Return the improved text
    return NextResponse.json({
      success: true,
      improvedText: result.content?.trim() || text,
      usage: result.usage,
      promptUsed: type, // For debugging which prompt was used
      adminConfigured: true // Indicates admin prompts were used
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Text Improvement API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import fs from 'fs/promises'
import path from 'path'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

// Load admin prompts
async function loadAdminPrompts() {
  try {
    const promptsFile = path.join(process.cwd(), 'data', 'cover-letter-prompts.json')
    const data = await fs.readFile(promptsFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Return default prompts if file doesn't exist
    return {
      editing: {
        systemPrompt: 'You are a professional cover letter editor.',
        improvementPrompt: 'Improve the following cover letter based on the user\'s specific instructions.'
      },
      settings: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxTokens: 2048
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
      console.error('API Key validation failed')
      return apiKeyError
    }

    // Get user ID for rate limiting
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

    const { currentText, instructions, action } = await request.json()

    if (!currentText || !instructions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Load admin prompts
    const adminPrompts = await loadAdminPrompts()
    
    let prompt = ''
    
    if (action === 'improve') {
      prompt = `${adminPrompts.editing.systemPrompt}

${adminPrompts.editing.improvementPrompt}

CURRENT COVER LETTER:
${currentText}

USER INSTRUCTIONS:
${instructions}

Please improve the cover letter according to the user's instructions while:
1. Maintaining the professional tone and structure
2. Keeping all important information intact
3. Ensuring the letter remains focused and relevant
4. Making the requested improvements without changing the core message
5. Keeping the same length unless specifically asked to shorten or expand

Return only the improved cover letter text, no additional commentary or formatting.`
    } else {
      // For other actions like regenerate (handled elsewhere)
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Generate improved text using centralized client with retry
    const result = await generateContent(prompt, {
      context: 'coverLetter',
      temperature: adminPrompts.settings.temperature || 0.7,
      maxTokens: adminPrompts.settings.maxTokens || 2048,
      retryAttempts: 3 // Enable retry for 503 errors
    })

    if (!result.success) {
      console.error('AI generation failed:', result.error)
      
      // Return appropriate error based on the failure type
      if (result.isOverloaded) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'AI service is temporarily overloaded. Please try again in a few moments.',
            isOverloaded: true
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to improve cover letter. Please try again.'
        },
        { status: 500 }
      )
    }

    const improvedText = result.content

    if (!improvedText) {
      throw new Error('No response from AI')
    }

    return NextResponse.json({
      success: true,
      improvedText: improvedText.trim(),
      originalLength: currentText.length,
      improvedLength: improvedText.length
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('AI Edit Error:', error)
    
    // Return a user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to improve cover letter. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
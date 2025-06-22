import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { 
          success: false,
          error: 'AI service not configured', 
          message: 'Please set your GEMINI_API_KEY in .env.local file to use AI features.',
          setup: 'Get your API key from https://makersuite.google.com/app/apikey'
        },
        { status: 503 }
      )
    }

    const { currentText, instructions, action } = await request.json()

    if (!currentText || !instructions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

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

    // Generate improved text using admin settings
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: adminPrompts.settings.temperature || 0.7,
        topK: adminPrompts.settings.topK || 40,
        topP: adminPrompts.settings.topP || 0.95,
        maxOutputTokens: adminPrompts.settings.maxTokens || 2048,
      },
    })

    const response = await result.response
    const improvedText = response.text()

    if (!improvedText) {
      throw new Error('No response from AI')
    }

    return NextResponse.json({
      success: true,
      improvedText: improvedText.trim(),
      originalLength: currentText.length,
      improvedLength: improvedText.length
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
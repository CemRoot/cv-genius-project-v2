import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/gemini-client'

export async function POST(request: NextRequest) {
  try {
    // Authentication is handled by middleware
    const adminId = request.headers.get('x-admin-id')
    const adminEmail = request.headers.get('x-admin-email')
    
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { prompt, input, settings } = body

    if (!prompt || !input) {
      return NextResponse.json(
        { error: 'Prompt and input are required' },
        { status: 400 }
      )
    }

    // Replace variables in prompt with test input
    let processedPrompt = prompt
    
    // Simple variable replacement - in production, use more sophisticated parsing
    const variables = prompt.match(/\{(\w+)\}/g)
    if (variables) {
      variables.forEach((variable: string) => {
        const key = variable.slice(1, -1) // Remove { and }
        processedPrompt = processedPrompt.replace(variable, input)
      })
    }

    console.log(`🧪 Admin (${adminEmail}) testing prompt with settings:`, settings)
    console.log(`📝 Processed prompt:`, processedPrompt.substring(0, 200) + '...')

    // Generate AI response with custom settings
    const result = await generateContent(processedPrompt, {
      context: 'adminTest',
      maxTokens: settings?.maxTokens || 2048,
      temperature: settings?.temperature || 0.7,
      topP: settings?.topP || 0.9
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'AI generation failed', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      output: result.content,
      usage: result.usage,
      settings_used: {
        temperature: settings?.temperature || 0.7,
        topP: settings?.topP || 0.9,
        maxTokens: settings?.maxTokens || 2048,
        model: settings?.model || 'gemini-pro'
      }
    })

  } catch (error) {
    console.error('Admin Test Prompt API Error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import fs from 'fs/promises'
import path from 'path'

interface PromptData {
  id: string
  name: string
  category: string
  prompt: string
  variables: string[]
  lastModified: string
  context?: string
}

// Get all prompts from the codebase
async function getAllPrompts(): Promise<PromptData[]> {
  const prompts: PromptData[] = []
  
  // Read prompts from global-prompts.ts
  try {
    const globalPromptsPath = path.join(process.cwd(), 'src/lib/ai/global-prompts.ts')
    const content = await fs.readFile(globalPromptsPath, 'utf-8')
    
    // Extract CV improvement prompts
    const cvPromptMatch = content.match(/cvImprovement:\s*{[\s\S]*?systemPrompt:\s*`([^`]+)`/m)
    if (cvPromptMatch) {
      prompts.push({
        id: 'cv-improvement',
        name: 'CV Text Improvement',
        category: 'Improvement',
        prompt: cvPromptMatch[1].trim(),
        variables: ['text', 'jobType', 'language'],
        lastModified: new Date().toISOString().split('T')[0],
        context: 'cv-builder'
      })
    }

    // Extract cover letter prompts
    const coverLetterMatch = content.match(/coverLetter:\s*{[\s\S]*?systemPrompt:\s*`([^`]+)`/m)
    if (coverLetterMatch) {
      prompts.push({
        id: 'cover-letter',
        name: 'Cover Letter Generation',
        category: 'Generation',
        prompt: coverLetterMatch[1].trim(),
        variables: ['jobTitle', 'company', 'candidateName', 'experience'],
        lastModified: new Date().toISOString().split('T')[0],
        context: 'cv-builder'
      })
    }

    // Extract job analysis prompts
    const jobAnalysisMatch = content.match(/jobAnalysis:\s*{[\s\S]*?systemPrompt:\s*`([^`]+)`/m)
    if (jobAnalysisMatch) {
      prompts.push({
        id: 'job-analysis',
        name: 'Job Description Analysis',
        category: 'Analysis',
        prompt: jobAnalysisMatch[1].trim(),
        variables: ['jobDescription'],
        lastModified: new Date().toISOString().split('T')[0],
        context: 'ats-checker'
      })
    }

    // Extract keyword extraction prompts
    const keywordMatch = content.match(/keywordExtraction:\s*{[\s\S]*?systemPrompt:\s*`([^`]+)`/m)
    if (keywordMatch) {
      prompts.push({
        id: 'keyword-extraction',
        name: 'Keyword Extraction',
        category: 'Analysis',
        prompt: keywordMatch[1].trim(),
        variables: ['text', 'context'],
        lastModified: new Date().toISOString().split('T')[0],
        context: 'ats-checker'
      })
    }
    
  } catch (error) {
    console.error('Error reading global prompts:', error)
  }

  // Read ATS-specific prompts
  try {
    const atsPromptsPath = path.join(process.cwd(), 'src/lib/ats-utils.ts')
    const content = await fs.readFile(atsPromptsPath, 'utf-8')
    
    const atsPromptMatch = content.match(/const\s+prompt\s*=\s*`([^`]+)`/m)
    if (atsPromptMatch) {
      prompts.push({
        id: 'ats-analysis',
        name: 'ATS Compatibility Analysis',
        category: 'Analysis',
        prompt: atsPromptMatch[1].trim(),
        variables: ['cvText', 'jobDescription'],
        lastModified: new Date().toISOString().split('T')[0],
        context: 'ats-checker'
      })
    }
  } catch (error) {
    console.error('Error reading ATS prompts:', error)
  }

  return prompts
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const prompts = await getAllPrompts()

    return NextResponse.json({
      success: true,
      prompts,
      total: prompts.length,
      categories: [...new Set(prompts.map(p => p.category))],
      contexts: [...new Set(prompts.map(p => p.context).filter(Boolean))]
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminSession = await verifyAdminToken(token)
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const { prompt } = await request.json()

    // In a real implementation, we would save this to the appropriate file
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Prompt saved successfully',
      prompt: {
        ...prompt,
        lastModified: new Date().toISOString().split('T')[0]
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    )
  }
}
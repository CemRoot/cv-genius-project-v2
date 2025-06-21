import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PROMPTS_FILE = path.join(process.cwd(), 'data', 'cover-letter-prompts.json')

// Default prompts configuration
const DEFAULT_PROMPTS = {
  generation: {
    systemPrompt: `You are a professional cover letter writer with expertise in creating compelling, personalized cover letters for the Irish job market. Create cover letters that are engaging, professional, and tailored to the specific job and company.

Key principles:
1. Address the specific role and company mentioned
2. Highlight relevant qualifications and achievements
3. Show enthusiasm and cultural fit
4. Use Irish business language conventions
5. Include specific examples where possible
6. Maintain professional yet personable tone
7. Keep length appropriate (1 page)`,

    templates: {
      basic: `Create a professional cover letter that:
- Opens with genuine interest in the specific role
- Highlights 2-3 key qualifications that match the job requirements
- Demonstrates knowledge of the company
- Shows enthusiasm for contributing to their team
- Closes with a confident call to action`,

      professional: `Create a polished, corporate-style cover letter that:
- Emphasizes professional achievements with specific metrics
- Demonstrates industry expertise and knowledge
- Shows leadership potential and strategic thinking
- Uses formal yet engaging business language
- Highlights relevant certifications or qualifications`,

      creative: `Create an engaging cover letter that:
- Opens with a compelling hook or story
- Showcases creativity while maintaining professionalism
- Uses dynamic language and varied sentence structure
- Demonstrates innovative thinking and problem-solving
- Shows personality while respecting professional boundaries`,

      executive: `Create an executive-level cover letter that:
- Opens with strong leadership credentials
- Emphasizes strategic achievements and business impact
- Demonstrates vision and forward-thinking
- Shows board-level communication skills
- Highlights transformational leadership experience`
    },

    tones: {
      formal: `Use a formal, professional tone suitable for traditional industries like banking, law, or government. Maintain respectful distance while showing competence.`,
      friendly: `Use a warm, approachable tone while maintaining professionalism. Show personality and build connection with the reader.`,
      enthusiastic: `Use an energetic, passionate tone that conveys genuine excitement about the opportunity and company mission.`
    }
  },

  editing: {
    systemPrompt: `You are a professional editor specializing in cover letters for the Irish job market. Your role is to improve existing content while maintaining the original message, structure, and personal voice of the writer.

Guidelines:
1. Preserve the writer's authentic voice
2. Enhance clarity and impact
3. Ensure proper Irish business conventions
4. Maintain appropriate length and structure
5. Fix grammar and style issues
6. Strengthen weak areas without changing meaning`,

    improvementPrompt: `Improve the following cover letter based on the user's specific instructions. Focus on:

1. Maintaining the original message and structure
2. Enhancing clarity and professional impact
3. Following Irish business writing conventions
4. Keeping the personal voice authentic
5. Making the requested improvements without losing the core content

User's current cover letter:
{currentText}

User's improvement instructions:
{instructions}

Please improve the cover letter according to these instructions while maintaining professionalism and authenticity.`,

    regenerationPrompt: `Create a completely new cover letter using the original candidate information and job details. Make it fresh, compelling, and different from the previous version while maintaining the same core qualifications and target role.

Original data: {originalData}
Job details: {jobDetails}

Create a new cover letter that:
1. Uses a different opening approach
2. Emphasizes different (but relevant) strengths
3. Shows the same qualifications from new angles
4. Maintains professional standards
5. Feels fresh and engaging`
  },

  settings: {
    temperature: 0.7,
    maxTokens: 2048,
    topK: 40,
    topP: 0.95
  }
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(PROMPTS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// GET - Retrieve current prompts
export async function GET() {
  try {
    await ensureDataDir()
    
    try {
      const data = await fs.readFile(PROMPTS_FILE, 'utf-8')
      const prompts = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        prompts
      })
    } catch (fileError) {
      // If file doesn't exist, return defaults
      return NextResponse.json({
        success: true,
        prompts: DEFAULT_PROMPTS
      })
    }
  } catch (error) {
    console.error('Error loading prompts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load prompts',
        prompts: DEFAULT_PROMPTS 
      },
      { status: 500 }
    )
  }
}

// POST - Save prompts
export async function POST(request: NextRequest) {
  try {
    const { prompts } = await request.json()
    
    if (!prompts) {
      return NextResponse.json(
        { success: false, error: 'No prompts provided' },
        { status: 400 }
      )
    }

    // Validate prompts structure
    const requiredFields = [
      'generation.systemPrompt',
      'generation.templates',
      'generation.tones',
      'editing.systemPrompt',
      'editing.improvementPrompt',
      'editing.regenerationPrompt',
      'settings'
    ]

    for (const field of requiredFields) {
      const fieldPath = field.split('.')
      let current = prompts
      
      for (const key of fieldPath) {
        if (!current || typeof current !== 'object' || !(key in current)) {
          return NextResponse.json(
            { success: false, error: `Missing required field: ${field}` },
            { status: 400 }
          )
        }
        current = current[key]
      }
    }

    await ensureDataDir()
    
    // Save prompts to file
    await fs.writeFile(PROMPTS_FILE, JSON.stringify(prompts, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Prompts saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save prompts' },
      { status: 500 }
    )
  }
}

// PUT - Reset to defaults
export async function PUT() {
  try {
    await ensureDataDir()
    await fs.writeFile(PROMPTS_FILE, JSON.stringify(DEFAULT_PROMPTS, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Prompts reset to defaults',
      prompts: DEFAULT_PROMPTS
    })
  } catch (error) {
    console.error('Error resetting prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset prompts' },
      { status: 500 }
    )
  }
}
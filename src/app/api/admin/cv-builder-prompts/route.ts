import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for Edge Runtime
let inMemoryPrompts: any = null

// Authentication helper
function checkAuth(request: NextRequest) {
  const adminId = request.headers.get('x-admin-id')
  const adminRole = request.headers.get('x-admin-role')
  
  if (!adminId || adminRole !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  return null
}

// Default CV Builder prompts configuration
const DEFAULT_CV_PROMPTS = {
  textImprovement: {
    systemPrompt: `You are a professional text improvement specialist for CV content. Your expertise is in enhancing CV text while preserving the original meaning, tone, and language.

Key principles:
1. Maintain the original language (Turkish stays Turkish, English stays English)
2. Preserve the professional tone and meaning
3. Fix grammar and spelling errors only
4. Improve sentence structure and flow
5. Make text more professional and clear
6. Do NOT add new content or merge concepts
7. Keep the same approximate length
8. Focus on clarity and ATS compatibility`,

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

      professionalSummary: `Improve this professional summary while maintaining its core message and language.

Original summary: "{text}"

Instructions:
- Enhance clarity and professional impact
- Keep the same key achievements and skills mentioned
- Maintain the original language
- Use active voice where appropriate
- Ensure ATS-friendly language
- Keep the same approximate length (2-3 sentences)
- DO NOT add new qualifications or experiences

Return only the improved summary text, nothing else.`,

      experience: `Improve this work experience description while preserving all original information.

Original experience: "{text}"
Position context: {type}

Instructions:
- Enhance action verbs and impact statements
- Improve clarity and professional tone
- Maintain all original responsibilities and achievements
- Keep the original language
- Use bullet-point friendly structure
- Focus on quantifiable results where mentioned
- DO NOT add new responsibilities or achievements

Return only the improved experience text, nothing else.`,

      skills: `Improve this skills section while maintaining the original skill set.

Original skills: "{text}"
Skills category: {type}

Instructions:
- Organize skills more professionally
- Use industry-standard terminology
- Maintain the original language
- Keep all mentioned skills
- Improve formatting for ATS compatibility
- Group related skills appropriately
- DO NOT add new skills not mentioned

Return only the improved skills text, nothing else.`,

      education: `Improve this education entry while preserving all original information.

Original education: "{text}"

Instructions:
- Enhance professional presentation
- Maintain all original qualifications and dates
- Keep the original language
- Use standard academic formatting
- Improve clarity and completeness
- Focus on ATS-friendly presentation
- DO NOT add new qualifications or details

Return only the improved education text, nothing else.`
    }
  },

  analysisPrompts: {
    contentAnalysis: `Analyze this CV content for quality and completeness:

CV Content: "{text}"
Section: {type}

Provide analysis in JSON format:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Focus on:
- Content quality and relevance
- ATS compatibility
- Professional presentation
- Irish job market standards
- Missing elements that could improve impact`,

    atsCompatibility: `Analyze this CV text for ATS (Applicant Tracking System) compatibility:

CV Text: "{text}"
Content Type: {type}

Check for:
1. Keyword density and relevance
2. Clear section headers
3. Readable formatting
4. Industry-standard terminology
5. Quantifiable achievements

Return JSON:
{
  "atsScore": 0-100,
  "issues": ["issue1", "issue2"],
  "improvements": ["fix1", "fix2"],
  "keywords": ["missing_keyword1", "missing_keyword2"]
}`
  },

  settings: {
    temperature: 0.3,  // Lower for more consistent improvements
    maxTokens: 1500,
    topK: 20,         // More focused vocabulary
    topP: 0.8         // Less randomness for consistent quality
  }
}

// Load prompts from memory or environment
function loadPrompts() {
  // Try environment variable first (Vercel compatible)
  const envPrompts = process.env.CV_BUILDER_PROMPTS
  if (envPrompts) {
    try {
      return JSON.parse(envPrompts)
    } catch (e) {
      console.error('Failed to parse CV_BUILDER_PROMPTS from env:', e)
    }
  }
  
  // Use in-memory cache
  if (inMemoryPrompts) {
    return inMemoryPrompts
  }
  
  // Return defaults
  return DEFAULT_CV_PROMPTS
}

// Save prompts to memory
function savePrompts(prompts: any) {
  inMemoryPrompts = prompts
  console.log('💾 CV Builder prompts saved (in-memory)')
  console.log('⚠️  For production persistence, set CV_BUILDER_PROMPTS env var to:', JSON.stringify(prompts))
}

// GET - Retrieve current CV Builder prompts
export async function GET(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    const prompts = loadPrompts()
    
    return NextResponse.json({
      success: true,
      prompts
    })
  } catch (error) {
    console.error('Error loading CV Builder prompts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load CV Builder prompts',
        prompts: DEFAULT_CV_PROMPTS 
      },
      { status: 500 }
    )
  }
}

// POST - Save CV Builder prompts
export async function POST(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request)
  if (authError) return authError

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
      'textImprovement.systemPrompt',
      'textImprovement.prompts.general',
      'textImprovement.prompts.professionalSummary',
      'textImprovement.prompts.experience',
      'textImprovement.prompts.skills',
      'textImprovement.prompts.education',
      'analysisPrompts.contentAnalysis',
      'analysisPrompts.atsCompatibility',
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

    // Save prompts to memory
    savePrompts(prompts)
    
    return NextResponse.json({
      success: true,
      message: 'CV Builder prompts saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving CV Builder prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save CV Builder prompts' },
      { status: 500 }
    )
  }
}

// PUT - Reset to defaults
export async function PUT(request: NextRequest) {
  // Check authentication
  const authError = checkAuth(request)
  if (authError) return authError

  try {
    // Reset to defaults
    savePrompts(DEFAULT_CV_PROMPTS)
    
    return NextResponse.json({
      success: true,
      message: 'CV Builder prompts reset to defaults',
      prompts: DEFAULT_CV_PROMPTS
    })
  } catch (error) {
    console.error('Error resetting CV Builder prompts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset CV Builder prompts' },
      { status: 500 }
    )
  }
} 
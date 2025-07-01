import { NextRequest, NextResponse } from 'next/server'
import { generateContent, validateApiKey, checkRateLimit } from '@/lib/gemini-client'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

// Configuration for AI processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

export async function POST(request: NextRequest) {
  try {
    // Validate API authentication
    const authResult = await validateAiApiRequest(request)
    if (!authResult.valid) {
      return createApiErrorResponse(
        authResult.error!,
        authResult.status!,
        authResult.retryAfter
      )
    }
    
    // Validate API key
    const apiKeyValidation = validateApiKey()
    if (apiKeyValidation) {
      return apiKeyValidation
    }

    const { cvText, targetIndustry = 'general' } = await request.json()

    if (!cvText || typeof cvText !== 'string') {
      return NextResponse.json(
        { error: 'CV text is required' },
        { status: 400 }
      )
    }

    if (cvText.length < 100) {
      return NextResponse.json(
        { error: 'CV text is too short (minimum 100 characters)' },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitCheck = checkRateLimit(clientId)
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitCheck.resetTime 
        },
        { status: 429 }
      )
    }

    // Industry-specific enhancement instructions
    const industryInstructions = {
      technology: 'Focus on technical skills, programming languages, frameworks, and software development methodologies. Use industry-standard terminology.',
      finance: 'Emphasize analytical skills, financial knowledge, compliance awareness, and quantitative achievements. Use finance-specific terminology.',
      healthcare: 'Highlight medical qualifications, patient care experience, clinical skills, and healthcare certifications. Use medical terminology appropriately.',
      marketing: 'Focus on campaign management, digital marketing skills, content creation, and measurable marketing results. Use marketing terminology.',
      engineering: 'Emphasize technical expertise, project management, problem-solving skills, and engineering achievements. Use engineering terminology.',
      consulting: 'Highlight analytical thinking, client management, strategic planning, and consulting methodologies. Use business terminology.',
      general: 'Focus on transferable skills, achievements, and professional growth. Use clear, professional language.'
    }

    const industryInstruction = industryInstructions[targetIndustry as keyof typeof industryInstructions] || industryInstructions.general

    const improvePrompt = `
You are a professional CV enhancement specialist with expertise in ATS (Applicant Tracking System) optimization for the Irish job market. 

CRITICAL FORMATTING RULE: You MUST output ONLY clean, plain text without ANY formatting symbols. Do NOT use:
- ** for bold (write in CAPITAL LETTERS instead for headings)
- * for bullet points (use • or - only)
- _ for italics 
- | pipe characters (critical for Irish work authorization)
- # for headings
- Any markdown syntax

Your task is to improve and restructure the following CV text to make it more professional, ATS-friendly, and compelling.

INDUSTRY FOCUS: ${targetIndustry.toUpperCase()}
${industryInstruction}

🇮🇪 IRISH MARKET CRITICAL REQUIREMENTS:
1. WORK AUTHORIZATION: If any work authorization information exists (STAMP1, STAMP2, EU Citizen, Work Permit, etc.), preserve it EXACTLY as written and make it clearly visible
2. LOCATION: Emphasize Irish location (Dublin, Cork, etc.) if present
3. CONTACT FORMAT: Use proper Irish phone format (+353) if updating phone numbers
4. WORK AUTHORIZATION EXAMPLES TO PRESERVE:
   - STAMP1, STAMP2, STAMP3, STAMP4, STAMP5, STAMP6 (with pipe characters like "STAMP2| Master Student")
   - "EU Citizen", "EU National", "Non-EU", "Non-EEA"
   - "Work Permit", "Employment Permit", "Critical Skills Permit"
   - "Right to Work", "Visa Required", "No Visa Required"
   - "Irish Citizen", "UK Citizen", "British Citizen"

CRITICAL CONTENT RULES:
1. DO NOT DUPLICATE any sections or information
2. DO NOT add extra contact information sections if one already exists
3. DO NOT repeat the same information multiple times
4. Keep the CV concise and avoid redundancy
5. If contact information exists at the top, do NOT add it again at the bottom
6. PRESERVE work authorization information exactly as written (including pipe characters)

ENHANCEMENT REQUIREMENTS:
1. Fix All Text Issues: Correct any broken words, ligature problems, spacing issues, and formatting errors
2. Improve Structure: Organize content into clear, professional sections with proper headings
3. Enhance Readability: Use bullet points, proper spacing, and professional formatting
4. Optimize for ATS: Ensure keywords are properly formatted and sections are clearly defined
5. Preserve All Information: Do not add or remove any factual information, dates, or experiences - but avoid duplicating existing content
6. Professional Language: Improve grammar, sentence structure, and professional tone
7. Contact Information: Keep contact details in ONE place only (at the top) - do NOT duplicate
8. Quantify Achievements: Highlight measurable results and specific accomplishments
9. Skills Section: Organize technical and soft skills clearly
10. Industry Alignment: Use terminology appropriate for the ${targetIndustry} industry
11. Irish Market Optimization: Preserve and highlight Irish work authorization status

FORMATTING GUIDELINES:
- Use clear section headings (e.g., CONTACT INFORMATION, PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS)
- Use bullet points for responsibilities and achievements
- Maintain consistent date formatting
- Ensure proper spacing and line breaks
- Keep contact information at the top ONLY - do not repeat it elsewhere
- Preserve work authorization exactly as written (e.g., "STAMP2| Master Student")

CRITICAL ATS FORMATTING RULES:
- DO NOT use any markdown formatting (**, *, _, #, etc.)
- DO NOT use asterisks (*) or double asterisks (**) for bold text
- Use PLAIN TEXT ONLY - no special characters for formatting
- For emphasis, use CAPITAL LETTERS for section headings only
- Use simple bullet points (• or -) for lists
- EXCEPTION: Preserve pipe characters (|) ONLY in work authorization context (e.g., "STAMP2| Master Student")
- Output should be clean, plain text that ATS systems can easily parse

CRITICAL: DO NOT DUPLICATE CONTENT OR ADD REDUNDANT SECTIONS. Keep the enhanced CV concise and avoid repetition.

ORIGINAL CV TEXT:
${cvText}

Please return the enhanced, professionally formatted CV text that maintains all original information while being optimized for ATS systems and ${targetIndustry} industry standards. Remember: NO DUPLICATES, NO REDUNDANCY.

FINAL REMINDER: Return ONLY plain text - no asterisks, no bold markers, no markdown formatting. Use CAPITAL LETTERS for section headings only. DO NOT DUPLICATE any sections or information.
`

    const result = await generateContent(improvePrompt, {
      context: 'cvOptimization',
      temperature: 0.1, // Very low temperature for precise ATS formatting
      maxTokens: 4000
    })

    if (!result.success || !result.content) {
      return NextResponse.json(
        { 
          error: 'Failed to enhance CV text. Please try again.',
          details: result.error 
        },
        { status: 500 }
      )
    }

    const enhancedText = result.content.trim()
    const originalWordCount = cvText.trim().split(/\s+/).length
    const enhancedWordCount = enhancedText.split(/\s+/).length

    return NextResponse.json({
      success: true,
      originalText: cvText,
      enhancedText: enhancedText,
      improvements: {
        originalWordCount,
        enhancedWordCount,
        targetIndustry,
        enhancementApplied: true,
        processingTime: new Date().toISOString()
      },
      usage: result.usage
    })

  } catch (error) {
    console.error('CV text improvement error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error while enhancing CV text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
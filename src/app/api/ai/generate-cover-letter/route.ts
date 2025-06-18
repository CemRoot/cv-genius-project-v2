import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit } from '@/lib/gemini-client'
import { LANGUAGE_ADAPTATIONS } from '@/lib/ai/global-prompts'

// Cover letter template definitions
const coverLetterTemplates = {
  basic: 'Basic',
  highPerformer: 'High Performer', 
  creative: 'Creative',
  graduate: 'Graduate',
  careerChange: 'Career Change',
  executive: 'Executive'
} as const

type CoverLetterTemplate = keyof typeof coverLetterTemplates

const toneOptions = {
  formal: 'Formal',
  friendly: 'Friendly', 
  enthusiastic: 'Enthusiastic'
} as const

type CoverLetterTone = keyof typeof toneOptions

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { 
      template,
      tone,
      company,
      position,
      applicantName,
      background,
      achievements,
      jobRequirements,
      jobDescription,
      customInstructions,
      includeAddress,
      userAddress,
      userPhone,
      currentDate
    }: {
      template: CoverLetterTemplate
      tone: CoverLetterTone
      company: string
      position: string
      applicantName: string
      background: string
      achievements?: string[]
      jobRequirements?: string
      jobDescription?: string
      customInstructions?: string
      includeAddress?: boolean
      userAddress?: string
      userPhone?: string
      currentDate?: string
    } = body

    // Validation
    if (!template || !coverLetterTemplates[template]) {
      return NextResponse.json(
        { error: 'Valid template is required' },
        { status: 400 }
      )
    }

    if (!tone || !toneOptions[tone]) {
      return NextResponse.json(
        { error: 'Valid tone is required' },
        { status: 400 }
      )
    }

    if (!company || !position || !applicantName || !background) {
      return NextResponse.json(
        { error: 'Company, position, applicant name, and background are required' },
        { status: 400 }
      )
    }

    // Create a simplified CV-like structure from form data
    const simplifiedCVData = {
      personal: {
        fullName: applicantName,
        summary: background
      },
      experience: achievements ? achievements.map((achievement, index) => ({
        id: `exp-${index}`,
        description: achievement,
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        achievements: [achievement]
      })) : []
    }

    // Generate Irish format cover letter prompt
    const headerInfo = includeAddress && userAddress ? `
Your Address:
${userAddress}${userPhone ? '\n' + userPhone : ''}

Date: ${currentDate || new Date().toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' })}

` : `Date: ${currentDate || new Date().toLocaleDateString('en-IE', { day: '2-digit', month: '2-digit', year: 'numeric' })}

`

    // Enhanced prompt with job description analysis
    const jobAnalysisSection = jobDescription ? `
JOB DESCRIPTION ANALYSIS:
${jobDescription}

ANALYSIS REQUIREMENTS:
1. Extract key skills and requirements from the job description
2. Identify must-have vs nice-to-have qualifications
3. Note company culture indicators and values
4. Find keywords for ATS optimization
5. Understand the role's core responsibilities
6. Identify what the employer values most
7. Extract company location if mentioned (otherwise default to Dublin, Ireland)
8. Look for specific contact person name if mentioned
9. Identify where the job was advertised (website, LinkedIn, etc.)
` : ''

    const prompt = `You are a professional cover letter writer specializing in Irish business correspondence format. Create a cover letter following the exact Irish/UK business letter structure.

INFORMATION PROVIDED:
Position: ${position}
Company: ${company}
Applicant Name: ${applicantName}
Background: ${background}
Key Achievements: ${achievements?.join(', ') || 'None provided'}
Job Requirements: ${jobRequirements || 'Not specified'}
${jobAnalysisSection}Template Style: ${template}
Tone: ${tone}
Custom Instructions: ${customInstructions || 'None'}

MANDATORY IRISH FORMAT STRUCTURE:
${headerInfo}
Hiring Manager
${company}
Dublin, Ireland

Dear Sir/Madam,

OPENING PARAGRAPH: Identify yourself as an applicant, state the exact position applying for, and mention where you learned about the vacancy.

SECOND PARAGRAPH: Explain why you are interested in this work and this organisation. Briefly mention your academic background, relevant qualifications, and related work experience that qualify you for the position. Summarise your talents and how they might benefit the employer.

THIRD PARAGRAPH: Refer to the fact that you have enclosed your CV, and draw attention to any further points of relevance to your application.

FINAL PARAGRAPH: Reiterate your interest and indicate your availability for interview. Close with a confident statement that encourages a positive response.

${includeAddress && userAddress ? 'Yours sincerely' : 'Yours faithfully'} (use "sincerely" if addressing by name, "faithfully" if Dear Sir/Madam)

[Signature space]

${applicantName.toUpperCase()}

CRITICAL FORMATTING RULES:
- DO NOT include placeholder text like "[Company Address if available]" or "[Name]"
- Use "Hiring Manager" if contact name is unknown
- Use "${company}" as the company name
- Use "Dublin, Ireland" as the default company address
- The header format is EXACTLY as shown above - no brackets, no placeholders
- Start the letter with the formatted header, then Dear Sir/Madam

REQUIREMENTS:
- Follow the exact 4-paragraph structure above
- Use ${tone} tone throughout
- Adapt content to ${template} style
- Use British English spelling (organisation, colour, realise, etc.)
- Keep to 250-400 words
- Be specific about the position and company
- Include relevant achievements naturally
- Professional but ${tone === 'enthusiastic' ? 'energetic' : tone === 'friendly' ? 'warm' : 'formal'} tone

${jobDescription ? `
JOB DESCRIPTION TARGETING INSTRUCTIONS:
- Analyze the job description thoroughly before writing
- Match the candidate's background to specific requirements mentioned
- Use keywords and phrases from the job description naturally
- Address the core responsibilities mentioned in the job posting
- Highlight achievements that relate to the job requirements
- Show understanding of the company's needs and values
- Reference specific qualifications or skills mentioned in the posting
- Demonstrate how the candidate solves the company's specific challenges
- Use industry terminology and language style matching the job description
` : ''}

EXAMPLE OF CORRECT FORMAT (DO NOT COPY CONTENT, ONLY FORMAT):
Dublin, Ireland
17/06/2025

Hiring Manager
Tech Company Ltd
Dublin, Ireland

Dear Sir/Madam,

[Your opening paragraph here...]

[Your second paragraph here...]

[Your third paragraph here...]

[Your final paragraph here...]

Yours faithfully,

[Signature space]

JOHN SMITH

Write the complete cover letter following this exact Irish business format. Do not add explanations or comments. NO BRACKETS or PLACEHOLDER TEXT.`

    // Generate AI response with context-aware configuration
    const result = await generateContent(prompt, {
      context: 'coverLetter',
      maxTokens: 2048
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate cover letter', details: result.error },
        { status: 500 }
      )
    }

    // Get the generated cover letter (already in proper Irish format)
    let coverLetter = result.content || ''
    
    // Apply minimal post-processing for British English (backup)
    coverLetter = LANGUAGE_ADAPTATIONS.toBritishEnglish(coverLetter)
    
    // The proper closing should already be included from the prompt

    return NextResponse.json({
      success: true,
      coverLetter: {
        content: coverLetter,
        template,
        tone,
        wordCount: coverLetter.split(/\s+/).length,
        metadata: {
          company,
          position,
          applicantName,
          generatedAt: new Date().toISOString()
        }
      },
      usage: result.usage
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Cover Letter Generation API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
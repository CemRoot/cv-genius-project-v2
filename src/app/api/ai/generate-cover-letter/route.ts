import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { LANGUAGE_ADAPTATIONS } from '@/lib/ai/global-prompts'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'
import { loadCoverLetterPrompts, getTemplatePrompt, getTonePrompt } from '@/lib/cover-letter-prompts-loader'

// Configuration for AI processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

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
    // Validate API authentication
    const authResult = await validateAiApiRequest(request)
    if (!authResult.valid) {
      return createApiErrorResponse(
        authResult.error!,
        authResult.status!,
        authResult.retryAfter
      )
    }
    
    // Check if Gemini API key is configured
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    // Get user ID for rate limiting (now with API key prefix)
    const apiKey = request.headers.get('x-api-key') || 'anonymous'
    const userId = `api:${apiKey}`
    
    // Additional rate limit check for Gemini API
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
      jobSource,
      applicantName,
      background,
      achievements,
      jobRequirements,
      jobDescription,
      customInstructions,
      includeAddress,
      userAddress,
      userPhone,
      userEmail,
      currentDate,
      // Experience and education data
      experienceLevel,
      studentStatus,
      schoolType,
      educationDetails,
      collegeGrad
    }: {
      template: CoverLetterTemplate
      tone: CoverLetterTone
      company: string
      position: string
      jobSource?: string
      applicantName: string
      background: string
      achievements?: string[]
      jobRequirements?: string
      jobDescription?: string
      customInstructions?: string
      includeAddress?: boolean
      userAddress?: string
      userPhone?: string
      userEmail?: string
      currentDate?: string
      // Experience and education data
      experienceLevel?: string
      studentStatus?: string
      schoolType?: string
      educationDetails?: { degreeType: string; fieldOfStudy: string }
      collegeGrad?: boolean
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
    
    // Additional validation to prevent "undefined undefined"
    if (applicantName.includes('undefined')) {
      console.error('Invalid applicant name:', applicantName)
      return NextResponse.json(
        { error: 'Invalid applicant name provided' },
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

    // Create personalized contact info
    const contactInfo = {
      name: simplifiedCVData.personal.fullName || 'Your Name',
      email: userEmail || 'your.email@example.com',
      phone: userPhone || 'Your Phone Number',
      address: userAddress || 'Your Address'
    }

    // Generate Irish format cover letter prompt with contact info
    const contactLines = []
    if (userEmail) contactLines.push(userEmail)
    if (userPhone && userPhone !== '+353 (0) 1 234 5678') contactLines.push(userPhone)
    if (userAddress && userAddress !== 'Dublin, Ireland') contactLines.push(userAddress)
    
    // Format date properly for Irish format
    const formattedDate = currentDate || new Date().toLocaleDateString('en-IE', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })

    // Build experience context for AI
    let experienceContext = ''
    if (experienceLevel === 'no') {
      experienceContext = `
APPLICANT PROFILE: Entry-level candidate with no prior work experience.
`
      if (studentStatus === 'yes') {
        if (schoolType === 'high-school') {
          experienceContext += `Currently a high school student seeking first opportunity.
`
        } else if (schoolType === 'college' && educationDetails) {
          experienceContext += `Currently pursuing ${educationDetails.degreeType} in ${educationDetails.fieldOfStudy}.
`
        }
      } else if (collegeGrad && educationDetails) {
        experienceContext += `Recent graduate with ${educationDetails.degreeType} in ${educationDetails.fieldOfStudy}.
`
      }
      experienceContext += `TONE GUIDANCE: Focus on enthusiasm, willingness to learn, academic achievements, relevant coursework, internships, volunteer work, or transferable skills from school projects.\n`
    } else if (experienceLevel === 'entry') {
      experienceContext = `
APPLICANT PROFILE: Entry-level professional with 1-2 years of experience.
TONE GUIDANCE: Balance enthusiasm with emerging professionalism. Highlight early career achievements and growth potential.
`
    } else if (experienceLevel === 'mid') {
      experienceContext = `
APPLICANT PROFILE: Mid-level professional with 3-7 years of experience.
TONE GUIDANCE: Professional and confident tone. Focus on proven track record and specific achievements.
`
    } else if (experienceLevel === 'senior') {
      experienceContext = `
APPLICANT PROFILE: Senior professional with 8+ years of experience.
TONE GUIDANCE: Executive and authoritative tone. Emphasize leadership, strategic thinking, and impact on business outcomes.
`
    } else if (experienceLevel === 'executive') {
      experienceContext = `
APPLICANT PROFILE: Executive-level leader with extensive experience.
TONE GUIDANCE: Strategic and visionary tone. Focus on organizational transformation, leadership philosophy, and business growth.
`
    }

    // Try to extract company info from job description if company name is generic
    let actualCompany = company
    let extractedFromDescription = false
    
    if (jobDescription && (company === 'Your Target Company' || !company || company.toLowerCase().includes('target'))) {
      // Look for patterns like "My client is [company description]" which indicates recruitment agency
      const clientMatch = jobDescription.match(/(?:my client|our client|the client|this client)\s+(?:is|are)\s+(?:a|an|one of)?\s*([^.]+?)(?:\.|,)/i)
      if (clientMatch) {
        actualCompany = 'your organisation' // Generic reference when posted by recruiter
        extractedFromDescription = true
      } else {
        // Try to extract company name from job description
        const companyPatterns = [
          /(?:join|at|with)\s+([A-Z][a-zA-Z\s&.-]+?)(?:\s+(?:is|as|in|for|to)|[,.]|$)/i,
          /([A-Z][a-zA-Z\s&.-]+?)\s+(?:is looking|seeks|requires|needs)/i,
          /(?:company|organization|firm|business):\s*([A-Z][a-zA-Z\s&.-]+?)(?:[,.]|$)/i
        ]
        
        for (const pattern of companyPatterns) {
          const match = jobDescription.match(pattern)
          if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
            actualCompany = match[1].trim()
            extractedFromDescription = true
            break
          }
        }
      }
    }

    // Load admin-managed prompts
    const adminPrompts = await loadCoverLetterPrompts()
    const templatePrompt = getTemplatePrompt(adminPrompts, template)
    const tonePrompt = getTonePrompt(adminPrompts, tone)
    
    // Enhanced prompt with job description analysis
    const jobAnalysisSection = jobDescription ? `
CRITICAL: YOU MUST USE THE FOLLOWING JOB DESCRIPTION TO CREATE THE COVER LETTER:
===========================================================================
${jobDescription}
===========================================================================

MANDATORY JOB DESCRIPTION ANALYSIS AND USAGE:
1. THIS IS THE ACTUAL JOB THE APPLICANT IS APPLYING FOR - USE IT!
2. Extract ALL key skills, technologies, and requirements mentioned
3. The cover letter MUST reference specific requirements from THIS job description
4. Use the EXACT job title from the description: "${position}"
5. Reference specific technologies/skills mentioned (e.g., if it mentions Python, FastAPI, LangChain, etc., include these)
6. Match the tone and language style used in the job description
7. Address the specific responsibilities mentioned
8. Show how the applicant's background aligns with THESE specific requirements
9. DO NOT use generic phrases - be specific to THIS job
10. If recruitment agency posting, refer to "your organisation" instead of specific company name
${extractedFromDescription ? '11. Note: This appears to be posted by a recruitment agency, so refer to the company generically' : ''}

CRITICAL REMINDER: The cover letter MUST be about the "${position}" position described above, NOT any other job!
` : ''

    const prompt = `${adminPrompts.generation.systemPrompt}

INFORMATION PROVIDED:
Position: ${position}
Company: ${actualCompany}
Applicant Name: ${applicantName}
Background: ${background}
Key Achievements: ${achievements?.join(', ') || 'None provided'}
Job Requirements: ${jobRequirements || 'Not specified'}
${experienceContext}${jobAnalysisSection}Template Style: ${template}
Template Guidance: ${templatePrompt}

Tone: ${tone}
Tone Guidance: ${tonePrompt}

Custom Instructions: ${customInstructions || 'None'}

MANDATORY IRISH FORMAT - YOU MUST GENERATE THE LETTER IN THIS EXACT FORMAT:

STEP 1: Start with sender's details (applicant info) at the top:
${applicantName}
${userAddress || 'Dublin, Ireland'}
${userPhone || ''}
${userEmail || ''}

STEP 2: Add blank line, then date:
${formattedDate}

STEP 3: Add blank line, then recipient's details:
Hiring Manager
${actualCompany}
Dublin, Ireland

STEP 4: Add blank line, then salutation:
Dear Hiring Manager,

OPENING PARAGRAPH: ${jobDescription ? `CRITICAL: You MUST write about the "${position}" position from the job description provided above. Reference the ACTUAL job, not a generic position.` : ''} Identify yourself as an applicant, state the exact position applying for. ${jobSource ? `Mention that you learned about the vacancy through ${jobSource}.` : (jobDescription ? 'If the job source is not clear from the job description, write "as advertised" instead of using brackets or placeholders.' : 'Mention that you learned about the position through their careers page.')}

SECOND PARAGRAPH: ${jobDescription ? `CRITICAL: Reference SPECIFIC skills/technologies from the job description (e.g., if it mentions Python, FastAPI, Azure, GenAI, etc., you MUST mention how your background relates to these).` : ''} Explain why you are interested in this work and this organisation. ${experienceLevel === 'no' ? 'Focus on your academic background, coursework, projects, and enthusiasm for the field. Emphasize your eagerness to learn and contribute.' : 'Briefly mention your academic background, relevant qualifications, and related work experience that qualify you for the position.'} Summarise your talents and how they might benefit the employer. Use proper grammar - if mentioning multiple strengths, use "strengths in [area1], [area2], and [area3]" or if a single area "strength in [area]".

THIRD PARAGRAPH: Refer to the fact that you have enclosed your CV, and draw attention to any further points of relevance to your application. ${experienceLevel === 'no' ? 'Highlight relevant coursework, academic projects, volunteer work, or extracurricular activities that demonstrate your potential.' : ''}

FINAL PARAGRAPH: Reiterate your interest and indicate your availability for interview. Close with a confident statement that encourages a positive response.

Yours sincerely,

${applicantName}

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
1. SENDER FIRST: Start with ${applicantName} and their contact info at the TOP
2. DATE SECOND: Then the date after a blank line
3. RECIPIENT THIRD: Then "Hiring Manager" and company details after another blank line
4. SALUTATION FOURTH: Then "Dear Hiring Manager," after another blank line
5. NO PLACEHOLDERS: Never use brackets [] or placeholder text
6. NO SIGNATURES IN HEADER: The applicant name appears ONLY at the top and after "Yours sincerely" at the end
7. EXACT ORDER: You MUST follow the order shown above - sender info FIRST, not after "Hiring Manager"

WRONG FORMAT (DO NOT DO THIS):
Hiring Manager
[Applicant Name]
[Address]

CORRECT FORMAT (DO THIS):
${applicantName}
${userAddress || 'Dublin, Ireland'}
${userPhone || ''}
${userEmail || ''}

${formattedDate}

Hiring Manager
${actualCompany}
Dublin, Ireland

Dear Hiring Manager,

REQUIREMENTS:
- Follow the exact 4-paragraph structure above
- Use ${tone} tone throughout
- Adapt content to ${template} style
- CRITICAL: Adjust language and examples based on experience level:
  * No experience: Focus on potential, learning ability, academic achievements
  * Entry level: Highlight early wins and growth trajectory
  * Mid level: Emphasize proven results and leadership potential
  * Senior/Executive: Focus on strategic impact and organizational value
- Use British English spelling (organisation, colour, realise, etc.)
- Keep to 250-400 words
- Be specific about the position and company
- Include relevant achievements naturally
- Professional but ${tone === 'enthusiastic' ? 'energetic' : tone === 'friendly' ? 'warm' : 'formal'} tone

${jobDescription ? `
FINAL CRITICAL INSTRUCTIONS FOR JOB DESCRIPTION USAGE:
======================================================
YOU HAVE BEEN PROVIDED WITH A SPECIFIC JOB DESCRIPTION ABOVE. YOU MUST:

1. Write about the EXACT job: "${position}" at "${actualCompany}"
2. Reference SPECIFIC requirements from the job description provided:
   - If it mentions Python, FastAPI, LangChain, Azure, etc. - USE THESE TERMS
   - If it mentions "Generative AI", "RAG", "prompt engineering" - REFERENCE THESE
   - Match the technical language and terminology used
3. DO NOT write a generic cover letter - it MUST be tailored to THIS specific job
4. The opening paragraph MUST mention the exact position title
5. The second paragraph MUST reference specific skills/technologies from the job description
6. Show how the applicant's background matches the SPECIFIC requirements listed

ABSOLUTELY DO NOT:
- Write about healthcare, MEG, or any other company/industry not mentioned in the job description
- Use generic phrases like "your company" without context
- Ignore the technical requirements listed in the job description
- Create a cover letter for a different position

THE JOB DESCRIPTION PROVIDED IS THE SINGLE MOST IMPORTANT INPUT - USE IT!
` : ''}

EXAMPLE OF CORRECT FORMAT (DO NOT COPY CONTENT, ONLY FORMAT):
John Smith
123 Main Street, Dublin 2
+353 87 123 4567
john.smith@email.com

17 June 2025

Hiring Manager
Tech Company Ltd
Dublin, Ireland

Dear Hiring Manager,

[Your opening paragraph here...]

[Your second paragraph here...]

[Your third paragraph here...]

[Your final paragraph here...]

Yours sincerely,

John Smith

FINAL INSTRUCTIONS:
- Generate the letter starting with ${applicantName} at the very top
- The FIRST line of your output must be: ${applicantName}
- Follow the exact format structure shown above
- Do not add any explanations before or after the letter
- The letter must start with sender details, NOT with "Hiring Manager"

Write the complete cover letter now, starting with the applicant's name and contact details at the top.`

    // Generate AI response with admin-configured settings
    const result = await generateContent(prompt, {
      context: 'coverLetter',
      maxTokens: adminPrompts.aiSettings.maxTokens,
      temperature: adminPrompts.aiSettings.temperature,
      topK: adminPrompts.aiSettings.topK,
      topP: adminPrompts.aiSettings.topP
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate cover letter', details: result.error },
        { status: 500 }
      )
    }

    // Get the generated cover letter
    let coverLetter = result.content || ''
    
    // Apply British English conversion
    coverLetter = LANGUAGE_ADAPTATIONS.toBritishEnglish(coverLetter)
    
    // Clean up any potential "undefined" text
    coverLetter = coverLetter.replace(/undefined\s*undefined\s*$/gi, '').trim()
    
    // Debug: Log the start of the letter
    console.log('📝 Letter starts with:', coverLetter.substring(0, 100))
    console.log('📝 Checking for applicant name at start:', coverLetter.startsWith(applicantName))
    
    // CRITICAL: Fix format if AI ignored our instructions
    // Check if the letter doesn't start with applicant name (meaning it's in wrong format)
    const formatFixNeeded = !coverLetter.startsWith(applicantName) || 
                           coverLetter.startsWith('Hiring Manager') || 
                           coverLetter.includes('Hiring Manager\n\n' + applicantName) ||
                           coverLetter.includes('Hiring Manager\n' + applicantName)
    
    if (formatFixNeeded) {
      console.log('⚠️ Format fix needed - AI placed content in wrong order')
      
      // Extract the letter body (everything after "Dear Hiring Manager,")
      const letterBodyMatch = coverLetter.match(/Dear Hiring Manager,[\s\S]*/)
      const letterBody = letterBodyMatch ? letterBodyMatch[0] : coverLetter
      
      // Rebuild the letter in correct format
      coverLetter = `${applicantName}
${userAddress || 'Dublin, Ireland'}
${userPhone || ''}
${userEmail || ''}

${formattedDate}

Hiring Manager
${actualCompany}
Dublin, Ireland

${letterBody}`
      
      console.log('✅ Format fixed - sender details moved to top')
    }
    
    // Ensure no duplicate information
    coverLetter = coverLetter
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim()

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
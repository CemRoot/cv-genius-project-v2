import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

// Configuration for AI processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
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

    const body = await request.json()
    const { cvContent } = body

    if (!cvContent || typeof cvContent !== 'string') {
      return NextResponse.json(
        { error: 'CV content is required as text' },
        { status: 400 }
      )
    }

    console.log('📄 Raw CV content length:', cvContent.length)
    console.log('📄 First 500 characters of CV:', cvContent.substring(0, 500))
    console.log('📄 Last 200 characters of CV:', cvContent.substring(Math.max(0, cvContent.length - 200)))
    
    // Additional debug logging for better troubleshooting
    console.log('🔍 Checking for email patterns...')
    const debugEmailMatches = cvContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)
    console.log('📧 Found emails in raw text:', debugEmailMatches || 'None found')
    
    console.log('🔍 Checking for phone patterns...')
    const debugPhoneMatches = cvContent.match(/[\+\d][\d\s\-\(\)\.]{8,20}/g)
    console.log('📞 Found potential phones in raw text:', debugPhoneMatches || 'None found')

    // Create an improved prompt with structured approach
    const prompt = `You are an expert CV/Resume parser. Extract personal and professional information from the following CV text.

TASK: Parse the CV and extract ALL information, especially personal contact details which are critical.

FIRST, scan the ENTIRE document for contact information which can appear in various formats:
- Headers/Top section: Name, Email, Phone, Location/Address
- Contact section: May use symbols like • | / between items
- Footer: Sometimes contact info repeats at bottom
- Within text: Email/phone might appear in cover letter sections

COMMON PATTERNS TO RECOGNIZE:
📧 EMAIL patterns:
  - Standard: name@domain.com, firstname.lastname@company.ie
  - With dots/numbers: john.doe123@email.com
  - Special domains: @gmail.com, @yahoo.com, @outlook.com, @icloud.com
  - Irish domains: @domain.ie, @company.ie

📱 PHONE patterns:
  - Irish: +353 87 123 4567, +353-87-1234567, 087 123 4567, (087) 1234567
  - International: +1-555-123-4567, +44 20 7946 0958
  - Various formats: 555.123.4567, 555-123-4567, (555) 123-4567
  - With extensions: +1-555-123-4567 ext. 1234

📍 LOCATION patterns:
  - Full: Dublin, Ireland | Cork, IE | Galway, County Galway
  - Postal codes: Dublin 2, D02 F2K3
  - Address lines: 123 Main Street, Dublin 4

STEP BY STEP EXTRACTION:
1. First locate and extract the person's FULL NAME (usually at the very top in larger text)
2. Then find EMAIL (look for @ symbol anywhere in the document)
3. Find PHONE NUMBER (look for digit patterns, may include country codes)
4. Find LOCATION/ADDRESS (city, country, or full address)
5. Extract work experience, education, and skills

OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "name": "[Extract full name from top of CV]",
  "email": "[Extract email with @ symbol]",
  "phone": "[Extract phone with all digits/symbols as shown]",
  "location": "[Extract city, country or address]",
  "linkedin": "[LinkedIn URL if present]",
  "website": "[Personal website or portfolio URL if present]",
  "professionalTitle": "[Current job title or professional designation]",
  "workAuthorization": "[Work permit status if mentioned - e.g. 'EU Citizen', 'Stamp 4', 'Critical Skills']",
  "summary": "[Professional summary if present]",
  "experience": [
    {
      "title": "[Job title]",
      "company": "[Company name]",
      "location": "[Job location if mentioned]",
      "startDate": "[Start date or year]",
      "endDate": "[End date or year, or 'Present' if current]",
      "current": [true if currently working there, false otherwise],
      "description": "[Main responsibilities and achievements]"
    }
  ],
  "education": [
    {
      "degree": "[Degree/certification]",
      "institution": "[School/University name]",
      "startDate": "[Start year if available]",
      "endDate": "[End year or graduation year]",
      "description": "[Additional details like GPA, honors, relevant coursework]"
    }
  ],
  "skills": ["[skill1]", "[skill2]", "[skill3]"]
}

CRITICAL RULES:
- If you find contact info ANYWHERE in the document, include it
- Do NOT skip email/phone even if formatting is unusual
- Do NOT return empty strings for name/email/phone if they exist in the text
- Check the ENTIRE document, not just the beginning
- Phone numbers may have spaces, dashes, parentheses - include AS IS
- Email MUST include the @ symbol and full domain

CV TEXT TO ANALYZE:
${cvContent}

Remember: Extract ALL contact information found. Return ONLY the JSON object, no markdown or extra text.`

    // Generate AI response with retry
    const result = await generateContent(prompt, {
      context: 'cvExtraction',
      maxTokens: 4096, // Increased for better extraction
      temperature: 0.0, // Zero temperature for most deterministic extraction
      retryAttempts: 3 // Enable retry for 503 errors
    })

    if (!result.success) {
      console.error('AI generation failed:', result.error)
      console.log('🔧 Using enhanced fallback extraction due to AI failure')
      
      // Enhanced fallback extraction when AI is unavailable
      const fallbackData = extractCVDataManually(cvContent)
      
      return NextResponse.json(
        {
          success: true,
          ...fallbackData,
          warning: result.isOverloaded 
            ? 'AI service is temporarily overloaded. Using enhanced pattern matching for extraction.'
            : 'AI service temporarily unavailable. Using enhanced pattern matching for extraction.'
        },
        {
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    // Try to parse JSON response
    let cvData
    try {
      // Clean the response to remove any markdown formatting
      const cleanedContent = result.content?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}'
      cvData = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Return a basic structure if parsing fails
      cvData = {
        name: '',
        email: '',
        phone: '',
        location: '',
        experience: [],
        education: [],
        skills: [],
        error: 'Could not fully parse CV content'
      }
    }

    // Enhanced fallback extraction with better patterns
    console.log('🔍 Applying enhanced fallback extraction...')
    
    // Enhanced email regex - captures more email formats with better boundary detection
    if (!cvData.email || cvData.email === '') {
      // First try with word boundaries to avoid capturing partial emails
      const emailWithBoundaryRegex = /\b([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,})\b/gi
      let emailMatches = cvContent.match(emailWithBoundaryRegex)
      
      // If no matches with word boundaries, try without (but validate more strictly)
      if (!emailMatches || emailMatches.length === 0) {
        const emailRegex = /([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,})/gi
        emailMatches = cvContent.match(emailRegex)
      }
      
      if (emailMatches && emailMatches.length > 0) {
        // Validate and clean the email
        const email = emailMatches[0].toLowerCase().trim()
        
        // Additional validation to ensure it's a complete email
        if (email.includes('@') && email.includes('.') && !email.endsWith('.')) {
          cvData.email = email
          console.log('📧 Fallback found email:', cvData.email)
        }
      }
    }
    
    // Enhanced phone regex - better international support
    if (!cvData.phone || cvData.phone === '') {
      // Try multiple phone patterns
      const phonePatterns = [
        // Irish mobile: 087 123 4567, +353 87 123 4567
        /(?:\+353|0)[\s-]?8[3-9][\s-]?\d{3}[\s-]?\d{4}/g,
        // Irish landline: 01 234 5678, +353 1 234 5678
        /(?:\+353|0)[\s-]?[1-9][\s-]?\d{3}[\s-]?\d{4}/g,
        // International format with country code
        /\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g,
        // US format: (555) 123-4567, 555-123-4567
        /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
        // General number pattern
        /[\+\d][\d\s\-\(\)\.]{9,20}/g
      ]
      
      let foundPhone = null
      for (const pattern of phonePatterns) {
        const matches = cvContent.match(pattern)
        if (matches && matches.length > 0) {
          // Validate it has enough digits
          const digitCount = matches[0].replace(/\D/g, '').length
          if (digitCount >= 7 && digitCount <= 15) {
            foundPhone = matches[0].trim()
            break
          }
        }
      }
      
      if (foundPhone) {
        cvData.phone = foundPhone
        console.log('📞 Fallback found phone:', cvData.phone)
      }
    }
    
    // Enhanced location extraction
    if (!cvData.location || cvData.location === '') {
      // Try multiple location patterns
      const locationPatterns = [
        // Irish cities and counties
        /(Dublin|Cork|Galway|Limerick|Waterford|Kilkenny|Sligo|Derry|Belfast)[\s,]*(?:Ireland|IE|Éire)?/gi,
        // City, Country format
        /([A-Z][a-zA-Z\s]+),\s*(?:Ireland|IE|United Kingdom|UK|USA|US)/gi,
        // Dublin postal codes
        /Dublin\s*\d{1,2}/gi,
        // General city, state/country
        /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*),\s*[A-Z]{2,}/g
      ]
      
      for (const pattern of locationPatterns) {
        const matches = cvContent.match(pattern)
        if (matches && matches.length > 0) {
          cvData.location = matches[0]
          console.log('📍 Fallback found location:', cvData.location)
          break
        }
      }
    }
    
    // Extract name if missing
    if (!cvData.name || cvData.name === '') {
      // Look for name patterns at the beginning of the CV
      const firstLines = cvContent.split('\n').slice(0, 10).join('\n')
      
      // Pattern for full names (2-4 words starting with capitals)
      const namePattern = /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})/m
      const nameMatch = firstLines.match(namePattern)
      
      if (nameMatch) {
        cvData.name = nameMatch[1]
        console.log('👤 Fallback found name:', cvData.name)
      }
    }
    
    // Log final extraction status
    console.log('📊 Final extraction results:', {
      hasName: !!cvData.name,
      hasEmail: !!cvData.email,
      hasPhone: !!cvData.phone,
      hasLocation: !!cvData.location,
      experienceCount: cvData.experience?.length || 0,
      skillsCount: cvData.skills?.length || 0
    })

    return NextResponse.json(
      {
        success: true,
        ...cvData
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    )

  } catch (error) {
    console.error('CV analysis error:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred while analyzing the CV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Enhanced manual extraction function
function extractCVDataManually(cvContent: string) {
  console.log('🔧 Running enhanced manual CV extraction...')
  
  const data = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    professionalTitle: '',
    workAuthorization: '',
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[]
  }
  
  // Extract name - look at first few lines
  const lines = cvContent.split('\n').map(line => line.trim()).filter(line => line)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    // Check if line contains a name pattern (2-4 capitalized words)
    if (/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/.test(line)) {
      data.name = line
      console.log('✓ Found name:', data.name)
      break
    }
  }
  
  // Extract email with multiple patterns
  const emailPatterns = [
    /\b([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,})\b/gi,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ]
  
  for (const pattern of emailPatterns) {
    const matches = cvContent.match(pattern)
    if (matches && matches.length > 0) {
      // Clean and extract just the email part
      const emailMatch = matches[0].match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
      if (emailMatch) {
        data.email = emailMatch[1].toLowerCase()
        console.log('✓ Found email:', data.email)
        break
      }
    }
  }
  
  // Extract phone with comprehensive patterns
  const phonePatterns = [
    // Irish formats
    /(?:Phone|Mobile|Tel)[:\s]*([+]?353[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/gi,
    /(?:Phone|Mobile|Tel)[:\s]*(0[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/gi,
    /\b([+]?353[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4})\b/g,
    /\b(0[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4})\b/g,
    // International formats
    /(?:Phone|Mobile|Tel)[:\s]*([+]?[0-9]{1,3}[\s-]?[0-9]{1,4}[\s-]?[0-9]{3,4}[\s-]?[0-9]{3,4})/gi,
    /\b([+]?[0-9]{1,3}[\s-]?[(]?[0-9]{1,4}[)]?[\s-]?[0-9]{3,4}[\s-]?[0-9]{3,4})\b/g
  ]
  
  for (const pattern of phonePatterns) {
    const matches = cvContent.match(pattern)
    if (matches && matches.length > 0) {
      // Extract just the phone number part
      const phoneMatch = matches[0].match(/([+]?[0-9][\s\-()0-9.]+[0-9])/)
      if (phoneMatch) {
        const phone = phoneMatch[1].trim()
        // Validate phone has enough digits
        const digitCount = phone.replace(/\D/g, '').length
        if (digitCount >= 7 && digitCount <= 15) {
          data.phone = phone
          console.log('✓ Found phone:', data.phone)
          break
        }
      }
    }
  }
  
  // Extract location
  const locationPatterns = [
    /(?:Location|Address|Based in)[:\s]*([A-Za-z\s,]+(?:Ireland|IE|UK|USA?))/gi,
    /(Dublin|Cork|Galway|Limerick|Waterford)[\s,]*(?:Ireland|IE)?/gi,
    /([A-Z][a-zA-Z\s]+),\s*(Ireland|IE|UK|USA|United States)/gi
  ]
  
  for (const pattern of locationPatterns) {
    const matches = cvContent.match(pattern)
    if (matches && matches.length > 0) {
      // Clean location string
      const location = matches[0].replace(/(?:Location|Address|Based in)[:\s]*/i, '').trim()
      if (location.length > 3) {
        data.location = location
        console.log('✓ Found location:', data.location)
        break
      }
    }
  }
  
  // Extract LinkedIn
  const linkedinPatterns = [
    /(?:linkedin\.com\/in\/|linkedin:)[\/\s]*([a-zA-Z0-9\-]+)/gi,
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+/gi
  ]
  
  for (const pattern of linkedinPatterns) {
    const matches = cvContent.match(pattern)
    if (matches && matches.length > 0) {
      data.linkedin = matches[0]
      console.log('✓ Found LinkedIn:', data.linkedin)
      break
    }
  }
  
  // Extract website
  const websitePatterns = [
    /(?:website|portfolio|github)[:\s]*(https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi,
    /https?:\/\/(?!linkedin)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g
  ]
  
  for (const pattern of websitePatterns) {
    const matches = cvContent.match(pattern)
    if (matches && matches.length > 0) {
      data.website = matches[0]
      console.log('✓ Found website:', data.website)
      break
    }
  }
  
  // Extract skills
  const skillsMatch = cvContent.match(/(?:Skills|Technologies|Expertise)[:\s]*([^\n]+(?:\n[^\n]+)*)/i)
  if (skillsMatch) {
    const skillsText = skillsMatch[1]
    // Split by common delimiters
    const skills = skillsText.split(/[,;•|]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30)
      .slice(0, 10)
    
    if (skills.length > 0) {
      data.skills = skills
      console.log('✓ Found skills:', skills.length)
    }
  }
  
  // Extract summary (first paragraph after name/contact info)
  const summaryPatterns = [
    /(?:Summary|Profile|About|Objective)[:\s]*([^\n]+(?:\n[^\n]+){0,3})/i,
    /\n\n([A-Z][^.!?]+[.!?](?:\s+[A-Z][^.!?]+[.!?]){0,2})/
  ]
  
  for (const pattern of summaryPatterns) {
    const match = cvContent.match(pattern)
    if (match) {
      const summary = match[1].trim()
      if (summary.length > 50 && summary.length < 500) {
        data.summary = summary
        console.log('✓ Found summary')
        break
      }
    }
  }
  
  // If no summary found, use first meaningful paragraph
  if (!data.summary) {
    const paragraphs = cvContent.split(/\n\n+/).filter(p => p.trim().length > 50)
    if (paragraphs.length > 0) {
      data.summary = paragraphs[0].substring(0, 300) + '...'
    }
  }
  
  console.log('✅ Manual extraction completed:', {
    hasName: !!data.name,
    hasEmail: !!data.email,
    hasPhone: !!data.phone,
    hasLocation: !!data.location,
    hasSummary: !!data.summary,
    skillsCount: data.skills.length
  })
  
  return data
}
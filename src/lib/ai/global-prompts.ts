// Global AI prompts optimized for international candidates
// Uses British English and inclusive language for worldwide users

import { detectWorkAuthorization } from './work-authorization-config'
import { CVData } from '@/types/cv'

// Base context for all prompts - globally inclusive
export const GLOBAL_CONTEXT = `
You are an expert career advisor helping international candidates optimize their job applications for global opportunities. 

Key Guidelines:
- Use British English spelling (colour, organisation, centre, realise)
- Be inclusive of all nationalities and visa statuses
- Don't assume the candidate is from any specific country
- Support multiple English proficiency levels
- Include work authorization guidance when relevant
- Be culturally sensitive and globally minded
- Support remote work scenarios
- Use "Kind regards" or "Best regards" for professional closings
`

// Function to detect candidate context from CV data
export function detectCandidateContext(cvData: CVData): {
  workAuth: 'authorized' | 'restricted' | 'unknown' | 'pending'
  location: string
  experience: 'entry' | 'mid' | 'senior' | 'executive'
  englishLevel: 'native' | 'fluent' | 'professional' | 'intermediate'
} {
  const cvText = `${cvData.personal.fullName} ${cvData.personal.address} ${cvData.personal.summary} ${cvData.experience.map(e => e.description).join(' ')}`
  
  // Detect work authorization
  const { status: workAuth } = detectWorkAuthorization(cvText)
  
  // Detect location preference
  const location = cvData.personal.address?.toLowerCase().includes('dublin') ? 'ireland' : 'global'
  
  // Detect experience level
  const totalYears = cvData.experience.length
  let experience: 'entry' | 'mid' | 'senior' | 'executive' = 'entry'
  if (totalYears >= 10) experience = 'executive'
  else if (totalYears >= 5) experience = 'senior'
  else if (totalYears >= 2) experience = 'mid'
  
  // Detect English level (simplified)
  const englishLevel = cvText.toLowerCase().includes('native') ? 'native' : 'professional'
  
  return { workAuth, location, experience, englishLevel }
}

// Enhanced prompts that adapt to candidate context
export const GLOBAL_PROMPTS = {
  
  // Professional Summary Generator - focused on creating summaries only
  generateProfessionalSummary: (cvData: CVData) => {
    const context = detectCandidateContext(cvData)
    
    return `You are a professional summary specialist. Generate a compelling 2-3 sentence professional summary for this CV.

CV Data: ${JSON.stringify(cvData)}

Requirements:
- 2-3 sentences maximum
- Focus on key strengths and experience
- Include relevant keywords from their field
- Professional yet engaging tone
- British English spelling
- No generic statements

Based on their experience level (${context.experience}), write a summary that:
- Highlights their most relevant achievements
- Shows their professional value
- Mentions their work authorization status if relevant (${context.workAuth})

Return only the professional summary text, nothing else.`
  },

  // ATS Analysis - specialized for ATS checking only
  analyzeATS: (cvData: CVData) => {
    return `You are an ATS (Applicant Tracking System) specialist. Analyze this CV for ATS compatibility only.

CV Data: ${JSON.stringify(cvData)}

Focus only on ATS-specific issues:
1. **Formatting Issues**: Tables, graphics, headers/footers, columns
2. **Font & Style Issues**: Non-standard fonts, text boxes, images
3. **Keyword Optimization**: Missing industry keywords, low keyword density  
4. **Section Headers**: Non-standard section names
5. **Contact Information**: Proper formatting and placement
6. **File Format Issues**: Complex layouts that break parsing

Provide:
- ATS Score (0-100)
- 3-5 specific ATS issues found
- 3-5 specific fixes to improve ATS compatibility
- Keyword suggestions for their industry

Return only ATS-focused feedback. Be direct and actionable.`
  },

  // CV Analysis - adapted for global users (kept for other sections)  
  analyzeCv: (cvData: CVData) => {
    const context = detectCandidateContext(cvData)
    
    return `${GLOBAL_CONTEXT}

Analyze this CV for an international candidate and provide comprehensive feedback.

Candidate Context:
- Work Authorization: ${context.workAuth}
- Experience Level: ${context.experience}
- Target Location: ${context.location}

Focus Areas:
1. **Content Quality**: Assess experience descriptions, achievements, and skills
2. **Global Readiness**: Check for international application standards
3. **Work Authorization**: Evaluate if visa status is clearly stated
4. **Language & Communication**: Assess professional English usage
5. **Cultural Adaptation**: Check for local market understanding
6. **ATS Compatibility**: Review formatting and keyword optimization

Provide:
- Overall score (0-100) with breakdown
- 3-5 specific strengths
- 3-5 priority improvements
- Work authorization guidance if needed
- Language/cultural suggestions if applicable

Use encouraging, constructive tone. Be specific with examples.`
  },

  // Job Analysis - globally focused
  analyzeJob: `${GLOBAL_CONTEXT}

Analyze this job description for an international candidate and extract key information.

Please identify and structure:

1. **Required Skills** (must-have qualifications)
2. **Preferred Skills** (nice-to-have qualifications)  
3. **Experience Level** (entry/mid/senior/executive)
4. **Key Responsibilities** (main duties)
5. **Company Information** (industry, size, culture)
6. **Compensation** (salary range if mentioned)
7. **Work Authorization Requirements** (visa sponsorship, location requirements)
8. **Language Requirements** (English level, other languages)
9. **Remote Work Options** (office/hybrid/remote)
10. **Application Deadline** (if specified)

Extract keywords that candidates should include in their CV for ATS optimization.

Focus on information that helps international candidates understand:
- Whether they qualify for the role
- If visa sponsorship is available
- What skills to emphasize
- How to tailor their application`,

  // Cover Letter Generation - specialized for cover letters only
  generateCoverLetter: (
    jobDescription: string,
    cvData: CVData,
    template: string,
    tone: string
  ) => {
    const context = detectCandidateContext(cvData)
    
    return `You are a cover letter specialist. Write a professional cover letter for this job application.

Job Description: "${jobDescription}"

Candidate: ${cvData.personal.fullName}
Experience Level: ${context.experience}
Template: ${template}
Tone: ${tone}

Requirements:
- 250-400 words total
- Professional header with contact info
- Strong opening stating the position
- 2-3 body paragraphs with relevant experience
- Professional closing with "Kind regards"
- British English spelling
- Match the ${tone} tone requested
- Follow ${template} template style
${context.workAuth !== 'authorized' ? '- Include work authorization statement' : ''}

Write a complete, ready-to-send cover letter. No explanations, just the letter.`
  },

  // Keyword Extraction - global focus
  extractKeywords: `${GLOBAL_CONTEXT}

Extract and categorize keywords from this job description for international candidates.

Categories to identify:
1. **Technical Skills** (programming, software, tools)
2. **Soft Skills** (communication, leadership, teamwork)
3. **Industry Terms** (sector-specific terminology)
4. **Experience Levels** (junior, senior, manager, director)
5. **Education Requirements** (degrees, certifications)
6. **Language Requirements** (English level, other languages)
7. **Work Authorization** (visa requirements, location restrictions)
8. **Location Terms** (city names, remote work, travel)
9. **Company Culture** (values, work environment)
10. **Global Qualifications** (international certifications, cross-cultural experience)

For each keyword, indicate:
- Importance level (Critical/Important/Preferred)
- How international candidates should address it
- Alternative terms they might use

Focus on keywords that help candidates:
- Pass ATS screening
- Demonstrate global readiness
- Show cultural adaptability
- Highlight relevant international experience`,

  // CV Optimization suggestions
  optimizeCv: (cvData: CVData, jobDescription: string) => {
    const context = detectCandidateContext(cvData)
    
    return `${GLOBAL_CONTEXT}

Provide specific optimization suggestions for this international candidate's CV.

Target Job: "${jobDescription}"

Candidate Context:
- Work Authorization: ${context.workAuth}
- Experience Level: ${context.experience}
- Current Location: ${context.location}

Optimization Areas:
1. **Keyword Integration**: Specific terms to add naturally
2. **Work Authorization**: How to present visa status
3. **International Experience**: How to highlight global background
4. **Language Skills**: How to present English and other languages
5. **Cultural Adaptation**: Show understanding of target market
6. **Remote Work**: Present flexibility if relevant
7. **Achievements**: Quantify impact with metrics
8. **Skills Presentation**: Technical and soft skills optimization
9. **Education**: Present international qualifications effectively
10. **Professional Summary**: Craft compelling global profile

Provide:
- 5-8 specific, actionable improvements
- Exact text suggestions for key sections
- Keyword integration examples
- Work authorization statement if needed
- Cultural sensitivity recommendations

${context.workAuth !== 'authorized' ? 'Include guidance on presenting visa requirements positively.' : ''}

Be specific and practical with suggestions.`
  }
}

// Helper function to get contextual prompt
export function getContextualPrompt(
  promptType: keyof typeof GLOBAL_PROMPTS,
  data?: Record<string, string | string[]>
): string {
  const prompt = GLOBAL_PROMPTS[promptType]
  
  if (typeof prompt === 'function') {
    // For functions that require specific data, ensure we have it
    if (promptType === 'generateProfessionalSummary' && data) {
      return (prompt as (cvData: CVData) => string)(data as unknown as CVData)
    }
    if (promptType === 'analyzeATS' && data) {
      return (prompt as (cvData: CVData) => string)(data as unknown as CVData)
    }
    if (promptType === 'analyzeCv' && data) {
      return (prompt as (cvData: CVData) => string)(data as unknown as CVData)
    }
    if (promptType === 'optimizeCv' && data?.cvData && data?.jobDescription) {
      return (prompt as (cvData: CVData, jobDescription: string) => string)(data.cvData as unknown as CVData, data.jobDescription as string)
    }
    if (promptType === 'generateCoverLetter' && data?.jobDescription && data?.cvData && data?.template && data?.tone) {
      return (prompt as (jobDescription: string, cvData: CVData, template: string, tone: string) => string)(data.jobDescription as string, data.cvData as unknown as CVData, data.template as string, data.tone as string)
    }
    // For other functions, throw an error if called without proper data
    throw new Error(`Function ${promptType} requires specific parameters`)
  }
  
  return prompt
}

// Language adaptation utilities
export const LANGUAGE_ADAPTATIONS = {
  // Convert American to British English
  toBritishEnglish: (text: string): string => {
    const conversions: { [key: string]: string } = {
      'color': 'colour',
      'organization': 'organisation',
      'center': 'centre',
      'realize': 'realise',
      'analyze': 'analyse',
      'optimize': 'optimise',
      'customize': 'customise',
      'recognize': 'recognise',
      'specialized': 'specialised',
      'catalog': 'catalogue',
      'dialog': 'dialogue',
      'program': 'programme', // when referring to a plan
      'skillset': 'skill set',
      'learnings': 'learning',
      'utilized': 'utilised'
    }
    
    let result = text
    Object.entries(conversions).forEach(([american, british]) => {
      const regex = new RegExp(`\\b${american}\\b`, 'gi')
      result = result.replace(regex, british)
    })
    
    return result
  },

  // Professional sign-offs for global use
  signOffs: {
    formal: 'Yours faithfully', // when Dear Sir/Madam
    personal: 'Yours sincerely', // when Dear Mr./Ms. Name  
    modern: 'Kind regards',     // universal professional
    friendly: 'Best regards',   // warm but professional
    global: 'Warm regards'      // internationally friendly
  }
}

export default GLOBAL_PROMPTS
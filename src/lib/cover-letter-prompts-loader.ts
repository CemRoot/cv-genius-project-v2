import fs from 'fs/promises'
import path from 'path'

interface CoverLetterPromptsConfig {
  generation: {
    systemPrompt: string
    templates: {
      basic: string
      professional: string
      creative: string
      executive: string
      highPerformer?: string
      graduate?: string
      careerChange?: string
    }
    tones: {
      formal: string
      friendly: string
      enthusiastic: string
    }
  }
  editing?: {
    systemPrompt: string
    improvementPrompt: string
    regenerationPrompt: string
  }
  aiSettings: {
    temperature: number
    maxTokens: number
    topK: number
    topP: number
  }
}

// Default prompts if file doesn't exist
const DEFAULT_PROMPTS: CoverLetterPromptsConfig = {
  generation: {
    systemPrompt: `You are a professional cover letter writer specializing in Irish business correspondence format. Create a cover letter following the exact Irish/UK business letter structure.

CRITICAL INSTRUCTION: When a job description is provided, you MUST analyze it thoroughly and create a cover letter specifically tailored to that exact job. DO NOT create generic cover letters or reference jobs not mentioned in the provided job description.`,
    templates: {
      basic: `Create a professional cover letter that opens with genuine interest in the specific role and highlights 2-3 key qualifications.`,
      professional: `Create a polished, corporate-style cover letter that emphasizes professional achievements with specific metrics.`,
      creative: `Create an engaging cover letter that opens with a compelling hook while maintaining professionalism.`,
      executive: `Create an executive-level cover letter that opens with strong leadership credentials and strategic achievements.`,
      highPerformer: `Create a high-performer cover letter that showcases exceptional achievements and quantifiable results.`,
      graduate: `Create a graduate-focused cover letter that emphasizes education, potential, and enthusiasm for learning.`,
      careerChange: `Create a career-change cover letter that effectively translates transferable skills to the new industry.`
    },
    tones: {
      formal: `Use a formal, professional tone suitable for traditional industries.`,
      friendly: `Use a warm, approachable tone while maintaining professionalism.`,
      enthusiastic: `Use an energetic, passionate tone that conveys genuine excitement.`
    }
  },
  aiSettings: {
    temperature: 0.7,
    maxTokens: 2048,
    topK: 40,
    topP: 0.95
  }
}

export async function loadCoverLetterPrompts(): Promise<CoverLetterPromptsConfig> {
  try {
    const promptsPath = path.join(process.cwd(), 'data', 'cover-letter-prompts.json')
    const data = await fs.readFile(promptsPath, 'utf-8')
    const parsed = JSON.parse(data)
    
    // Handle both old and new formats
    if (parsed.generation) {
      // New format from admin panel
      return {
        ...DEFAULT_PROMPTS,
        ...parsed
      }
    } else if (parsed.prompts) {
      // Old format - convert to new
      return DEFAULT_PROMPTS
    }
    
    return DEFAULT_PROMPTS
  } catch (error) {
    console.log('Using default cover letter prompts')
    return DEFAULT_PROMPTS
  }
}

export function getTemplatePrompt(prompts: CoverLetterPromptsConfig, template: string): string {
  const templateKey = template as keyof typeof prompts.generation.templates
  return prompts.generation.templates[templateKey] || prompts.generation.templates.basic
}

export function getTonePrompt(prompts: CoverLetterPromptsConfig, tone: string): string {
  const toneKey = tone as keyof typeof prompts.generation.tones
  return prompts.generation.tones[toneKey] || prompts.generation.tones.formal
}
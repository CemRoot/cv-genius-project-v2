"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'

interface RealTimeATSOptions {
  enabled?: boolean
  debounceMs?: number
  minTextLength?: number
  autoAnalyze?: boolean
  onScoreChange?: (score: number) => void
  onSuggestionsChange?: (suggestions: string[]) => void
}

interface RealTimeScore {
  overall: number
  keywords: number
  format: number
  sections: number
  timestamp: number
}

interface LiveSuggestion {
  id: string
  type: 'keyword' | 'format' | 'section' | 'critical'
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  position?: number
}

export function useRealTimeATS(
  cvText: string,
  jobDescription?: string,
  options: RealTimeATSOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 500,
    minTextLength = 100,
    autoAnalyze = true,
    onScoreChange,
    onSuggestionsChange
  } = options

  const [realTimeScore, setRealTimeScore] = useState<RealTimeScore | null>(null)
  const [liveSuggestions, setLiveSuggestions] = useState<LiveSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [keywordMatches, setKeywordMatches] = useState<string[]>([])
  const [missingKeywords, setMissingKeywords] = useState<string[]>([])
  const [formatIssues, setFormatIssues] = useState<string[]>([])
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout>()
  const lastAnalysisRef = useRef<string>('')

  // Quick keyword analysis for real-time feedback
  const analyzeKeywordsRealTime = useCallback((text: string, jobDesc: string) => {
    const textLower = text.toLowerCase()
    const jobLower = jobDesc.toLowerCase()
    
    // Basic keyword extraction from job description
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
    const jobKeywords = jobLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 20) // Top 20 keywords
    
    const matched = jobKeywords.filter(keyword => textLower.includes(keyword))
    const missing = jobKeywords.filter(keyword => !textLower.includes(keyword))
    
    const keywordScore = jobKeywords.length > 0 ? (matched.length / jobKeywords.length) * 100 : 0
    
    return {
      score: keywordScore,
      matched,
      missing: missing.slice(0, 5) // Top 5 missing
    }
  }, [])

  // Quick format analysis
  const analyzeFormatRealTime = useCallback((text: string) => {
    const issues: string[] = []
    let score = 100

    // Check for email
    if (!/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text)) {
      issues.push('Missing email address')
      score -= 20
    }

    // Check for phone
    if (!/[\+]?[1-9]?[\d\s\-\(\)]{10,}/.test(text)) {
      issues.push('Missing phone number')
      score -= 15
    }

    // Check for problematic characters
    if (/[●◆▪▫■□◦‣⁃]/.test(text)) {
      issues.push('Contains special bullet characters')
      score -= 10
    }

    // Check length
    const wordCount = text.split(/\s+/).length
    if (wordCount < 150) {
      issues.push('CV appears too short')
      score -= 15
    } else if (wordCount > 1000) {
      issues.push('CV may be too long')
      score -= 5
    }

    return {
      score: Math.max(0, score),
      issues
    }
  }, [])

  // Quick section analysis
  const analyzeSectionsRealTime = useCallback((text: string) => {
    const textLower = text.toLowerCase()
    const requiredSections = ['experience', 'skills', 'education']
    const foundSections: string[] = []
    let score = 0

    requiredSections.forEach(section => {
      if (textLower.includes(section) || 
          (section === 'experience' && (textLower.includes('work') || textLower.includes('employment'))) ||
          (section === 'skills' && (textLower.includes('technical') || textLower.includes('competencies'))) ||
          (section === 'education' && (textLower.includes('qualifications') || textLower.includes('academic')))) {
        foundSections.push(section)
        score += 33
      }
    })

    return {
      score: Math.round(score),
      foundSections,
      missingSections: requiredSections.filter(section => !foundSections.includes(section))
    }
  }, [])

  // Generate live suggestions based on analysis
  const generateLiveSuggestions = useCallback((
    keywordAnalysis: any,
    formatAnalysis: any,
    sectionAnalysis: any
  ): LiveSuggestion[] => {
    const suggestions: LiveSuggestion[] = []

    // Critical suggestions
    if (!formatAnalysis.issues.includes('Missing email address') === false) {
      suggestions.push({
        id: 'email',
        type: 'critical',
        message: 'Add your email address',
        priority: 'critical'
      })
    }

    if (!formatAnalysis.issues.includes('Missing phone number') === false) {
      suggestions.push({
        id: 'phone',
        type: 'critical',
        message: 'Add your phone number',
        priority: 'critical'
      })
    }

    // Section suggestions
    sectionAnalysis.missingSections.forEach((section: string) => {
      suggestions.push({
        id: `section_${section}`,
        type: 'section',
        message: `Add ${section} section`,
        priority: 'high'
      })
    })

    // Keyword suggestions
    if (keywordAnalysis.missing.length > 0) {
      suggestions.push({
        id: 'keywords',
        type: 'keyword',
        message: `Consider adding: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`,
        priority: keywordAnalysis.score < 30 ? 'high' : 'medium'
      })
    }

    // Format suggestions
    if (formatAnalysis.issues.length > 0) {
      formatAnalysis.issues.forEach((issue: string, index: number) => {
        suggestions.push({
          id: `format_${index}`,
          type: 'format',
          message: issue,
          priority: 'medium'
        })
      })
    }

    return suggestions.slice(0, 8) // Limit to 8 suggestions
  }, [])

  // Debounced analysis function
  const debouncedAnalysis = useCallback(
    debounce(async (text: string, jobDesc: string) => {
      if (!enabled || text === lastAnalysisRef.current) return
      
      lastAnalysisRef.current = text
      setIsAnalyzing(true)

      try {
        // Perform quick real-time analysis
        const keywordAnalysis = analyzeKeywordsRealTime(text, jobDesc)
        const formatAnalysis = analyzeFormatRealTime(text)
        const sectionAnalysis = analyzeSectionsRealTime(text)

        // Calculate overall score
        const overallScore = Math.round(
          (keywordAnalysis.score * 0.4) +
          (formatAnalysis.score * 0.3) +
          (sectionAnalysis.score * 0.3)
        )

        const score: RealTimeScore = {
          overall: overallScore,
          keywords: Math.round(keywordAnalysis.score),
          format: formatAnalysis.score,
          sections: sectionAnalysis.score,
          timestamp: Date.now()
        }

        // Generate suggestions
        const suggestions = generateLiveSuggestions(keywordAnalysis, formatAnalysis, sectionAnalysis)

        // Update state
        setRealTimeScore(score)
        setKeywordMatches(keywordAnalysis.matched)
        setMissingKeywords(keywordAnalysis.missing)
        setFormatIssues(formatAnalysis.issues)
        setLiveSuggestions(suggestions)

        // Call callbacks
        onScoreChange?.(overallScore)
        onSuggestionsChange?.(suggestions.map(s => s.message))

      } catch (error) {
        console.error('Real-time ATS analysis error:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }, debounceMs),
    [enabled, analyzeKeywordsRealTime, analyzeFormatRealTime, analyzeSectionsRealTime, generateLiveSuggestions, onScoreChange, onSuggestionsChange]
  )

  // Trigger analysis when text changes
  useEffect(() => {
    if (!enabled || !autoAnalyze) return

    if (cvText.length >= minTextLength) {
      debouncedAnalysis(cvText, jobDescription || '')
    } else {
      // Clear analysis if text is too short
      setRealTimeScore(null)
      setLiveSuggestions([])
      setKeywordMatches([])
      setMissingKeywords([])
      setFormatIssues([])
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [cvText, jobDescription, enabled, autoAnalyze, minTextLength, debouncedAnalysis])

  // Manual trigger function
  const triggerAnalysis = useCallback(() => {
    if (cvText.length >= minTextLength) {
      debouncedAnalysis(cvText, jobDescription || '')
    }
  }, [cvText, jobDescription, minTextLength, debouncedAnalysis])

  // Get suggestions by priority
  const getSuggestionsByPriority = useCallback((priority: LiveSuggestion['priority']) => {
    return liveSuggestions.filter(s => s.priority === priority)
  }, [liveSuggestions])

  // Get score change from previous
  const getScoreChange = useCallback(() => {
    // This would compare with previous score in a real implementation
    return 0
  }, [])

  return {
    // State
    realTimeScore,
    liveSuggestions,
    isAnalyzing,
    keywordMatches,
    missingKeywords,
    formatIssues,
    
    // Computed values
    hasScore: realTimeScore !== null,
    isGoodScore: realTimeScore ? realTimeScore.overall >= 70 : false,
    criticalIssues: getSuggestionsByPriority('critical'),
    highPriorityIssues: getSuggestionsByPriority('high'),
    
    // Actions
    triggerAnalysis,
    clearAnalysis: () => {
      setRealTimeScore(null)
      setLiveSuggestions([])
      setKeywordMatches([])
      setMissingKeywords([])
      setFormatIssues([])
    },
    
    // Utilities
    getSuggestionsByPriority,
    getScoreChange
  }
}
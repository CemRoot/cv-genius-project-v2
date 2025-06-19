'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCVStore } from '@/store/cv-store'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatTextInput } from '@/lib/utils'
import { Sparkles, Wand2, MessageSquare } from 'lucide-react'

const professionalSummarySchema = z.object({
  summary: z.string().max(500, 'Professional summary must be less than 500 characters').optional()
})

type ProfessionalSummaryFormData = z.infer<typeof professionalSummarySchema>

interface ProfessionalSummaryFormProps {
  isMobile?: boolean
}

export function ProfessionalSummaryForm({ isMobile = false }: ProfessionalSummaryFormProps) {
  const { currentCV, updatePersonalInfo } = useCVStore()
  const isInitialMount = useRef(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isMobileView = isMobile || isMobileDevice
  const [questionnaireData, setQuestionnaireData] = useState({
    experienceYears: '',
    currentRole: '',
    keySkills: '',
    careerGoals: '',
    achievements: ''
  })

  // Safely get the summary with null checks
  const currentSummary = currentCV?.personal?.summary || ''
  
  
  // Clean existing broken text on mount - run only once
  useEffect(() => {
    if (isInitialMount.current && currentSummary) {
      const cleanedSummary = formatTextInput(currentSummary)
      if (cleanedSummary !== currentSummary) {
        updatePersonalInfo({ summary: cleanedSummary })
      }
    }
  }, []) // Run only once on mount

  const {
    register,
    watch,
    setValue,
    formState: { isDirty }
  } = useForm<ProfessionalSummaryFormData>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: {
      summary: currentSummary
    },
    mode: 'onChange' // Enable real-time validation and updates
  })
  

  const watchedFields = watch()

  // Update store data with debouncing - memoized to prevent re-renders
  const updateStoreData = useCallback((data: ProfessionalSummaryFormData) => {
    updatePersonalInfo({
      summary: data.summary || ''
    })
  }, [updatePersonalInfo])

  // Show AI questionnaire
  const showAIQuestionnaire = () => {
    setShowQuestionnaire(true)
  }

  // Generate summary with questionnaire data
  const generateAISummaryWithData = async () => {
    setIsGenerating(true)
    setShowQuestionnaire(false)
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cvData: currentCV,
          questionnaireData: questionnaireData
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.summary) {
          // Use AI-generated summary
          setValue('summary', result.summary, { shouldTouch: true, shouldDirty: true })
          updateStoreData({ summary: result.summary })
        } else {
          // Smart fallback based on CV data
          const name = currentCV?.personal?.fullName || 'professional'
          const aiSummary = `I am a dedicated ${name.split(' ')[0] || 'professional'} with a strong background in my field. My experience combines technical expertise with excellent problem-solving abilities, enabling me to deliver high-quality results in challenging environments. I am passionate about continuous learning and contributing to team success through effective collaboration and innovative thinking.`
          setValue('summary', aiSummary)
          updateStoreData({ summary: aiSummary })
        }
      } else {
        // Log the error for debugging
        const errorData = await response.json().catch(() => null)
        console.error('AI API Error:', response.status, errorData)
        
        // Fallback if API fails
        const fallbackSummary = "I am a dedicated professional with proven expertise in my field. My background combines strong technical skills with excellent communication abilities, making me well-suited for challenging roles that require both analytical thinking and collaborative teamwork."
        setValue('summary', fallbackSummary)
        updateStoreData({ summary: fallbackSummary })
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      // Provide fallback summary even if API fails
      const fallbackSummary = "I am a results-driven professional with a passion for excellence and innovation. My diverse skill set and commitment to continuous improvement enable me to contribute effectively to any team or project."
      setValue('summary', fallbackSummary)
      updateStoreData({ summary: fallbackSummary })
    } finally {
      setIsGenerating(false)
    }
  }

  // AI Improve function
  const improveWithAI = async () => {
    if (!watchedFields.summary) return
    
    setIsGenerating(true)
    try {
      // Send to AI for improvement
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: watchedFields.summary,
          type: 'professional_summary'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.improvedText) {
          setValue('summary', result.improvedText, { shouldTouch: true, shouldDirty: true })
          updateStoreData({ summary: result.improvedText })
        }
      } else {
        // Simple grammar improvements only - no aggressive cleaning
        const improved = watchedFields.summary
          .replace(/\bi\b/g, 'I')
          .replace(/\bim\b/g, "I'm")
          .replace(/\bcant\b/g, "can't")
          .replace(/\bdont\b/g, "don't")
          .replace(/\s+/g, ' ') // Only fix multiple spaces
          .trim()
        
        setValue('summary', improved)
        updateStoreData({ summary: improved })
      }
    } catch (error) {
      console.error('AI improvement failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Initialize form value once on mount
  useEffect(() => {
    if (isInitialMount.current && currentCV?.personal?.summary) {
      setValue('summary', currentCV.personal.summary, { shouldTouch: false, shouldDirty: false })
    }
  }, [setValue, currentCV?.personal?.summary]) // Include all dependencies

  // Debounced auto-save effect
  useEffect(() => {
    if (isDirty && !isInitialMount.current) {
      const timeoutId = setTimeout(() => {
        updateStoreData(watchedFields)
      }, 300) // Debounce updates
      
      return () => clearTimeout(timeoutId)
    }
  }, [watchedFields, isDirty, updateStoreData])

  // Track initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [])

  // Safety check - don't render if currentCV is not available
  if (!currentCV) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading professional summary form...
      </div>
    )
  }

  return (
    <div className={`${isMobileView ? 'space-y-4 p-0' : 'space-y-4 p-4'}`}>
      {/* Mobile Header */}
      {isMobileView && (
        <div className="px-4 py-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg mx-4">
          <h4 className="font-medium text-purple-900 text-sm">Professional Summary</h4>
          <p className="text-purple-700 text-xs mt-1">Brief overview of your background and goals</p>
        </div>
      )}
      <div className={`${isMobileView ? 'space-y-3 px-4' : 'space-y-2'}`}>
        <Label htmlFor="summary" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
          Professional Summary
        </Label>
        <div className={`${isMobileView ? 'space-y-3' : 'flex items-center justify-between'}`}>
          <p className={`text-sm ${isMobileView ? 'text-gray-600' : 'text-muted-foreground'}`}>
            Write a brief overview of your professional background, key skills, and career objectives.
          </p>
          <div className={`flex gap-2 ${isMobileView ? 'mt-2' : ''}`}>
            <Button
              type="button"
              variant="outline"
              size={isMobileView ? "default" : "sm"}
              onClick={showAIQuestionnaire}
              disabled={isGenerating}
              className={`${isMobileView ? 'flex-1 touch-manipulation' : 'text-xs'}`}
            >
              <MessageSquare className={`${isMobileView ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1'}`} />
              {isGenerating ? 'Generating...' : 'AI Generate'}
            </Button>
            {watchedFields.summary && (
              <Button
                type="button"
                variant="outline"
                size={isMobileView ? "default" : "sm"}
                onClick={improveWithAI}
                disabled={isGenerating}
                className={`${isMobileView ? 'flex-1 touch-manipulation' : 'text-xs'}`}
              >
                <Wand2 className={`${isMobileView ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1'}`} />
                AI Improve
              </Button>
            )}
          </div>
        </div>
        <Textarea
          id="summary"
          {...register('summary')}
          placeholder="I am a dedicated professional with expertise in..."
          className={`${isMobileView ? 'min-h-[140px] text-base' : 'min-h-[120px]'} resize-none`}
          maxLength={500}
          onPaste={(e) => {
            // Get the pasted text directly from clipboard
            const pastedText = e.clipboardData.getData('text/plain')
            
            // Prevent default paste behavior
            e.preventDefault()
            
            // Get current cursor position
            const target = e.currentTarget
            const start = target.selectionStart
            const end = target.selectionEnd
            
            // Get current value
            const currentValue = target.value
            
            // Clean the pasted text
            const cleanedText = formatTextInput(pastedText)
            
            // Insert cleaned text at cursor position
            const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end)
            
            // Update form and store
            setValue('summary', newValue)
            updateStoreData({ summary: newValue })
            
            // Set cursor position after pasted text
            setTimeout(() => {
              target.selectionStart = target.selectionEnd = start + cleanedText.length
            }, 0)
          }}
        />
        <div className="text-xs text-muted-foreground text-right">
          {watchedFields.summary?.length || 0}/500 characters
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Writing Tips:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Start with your professional title or area of expertise</li>
          <li>• Mention years of experience and key skills</li>
          <li>• Include 1-2 major achievements or qualifications</li>
          <li>• End with your career goals or what you're seeking</li>
          <li>• Use active voice and powerful action words</li>
        </ul>
      </div>

      {/* AI Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">AI Professional Summary Generator</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Answer a few questions to help AI create a personalized professional summary for you.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="experienceYears" className="text-sm font-medium">
                  How many years of experience do you have?
                </Label>
                <input
                  id="experienceYears"
                  type="text"
                  placeholder="e.g., 5 years, Fresh graduate, 10+ years"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={questionnaireData.experienceYears}
                  onChange={(e) => setQuestionnaireData({...questionnaireData, experienceYears: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="currentRole" className="text-sm font-medium">
                  What is your current or target role?
                </Label>
                <input
                  id="currentRole"
                  type="text"
                  placeholder="e.g., Software Developer, Marketing Manager"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={questionnaireData.currentRole}
                  onChange={(e) => setQuestionnaireData({...questionnaireData, currentRole: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="keySkills" className="text-sm font-medium">
                  What are your key skills?
                </Label>
                <input
                  id="keySkills"
                  type="text"
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={questionnaireData.keySkills}
                  onChange={(e) => setQuestionnaireData({...questionnaireData, keySkills: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="careerGoals" className="text-sm font-medium">
                  What are your career goals?
                </Label>
                <input
                  id="careerGoals"
                  type="text"
                  placeholder="e.g., Lead a development team, Work in fintech"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={questionnaireData.careerGoals}
                  onChange={(e) => setQuestionnaireData({...questionnaireData, careerGoals: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="achievements" className="text-sm font-medium">
                  Key achievement or strength?
                </Label>
                <input
                  id="achievements"
                  type="text"
                  placeholder="e.g., Increased sales by 30%, Led team of 10"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={questionnaireData.achievements}
                  onChange={(e) => setQuestionnaireData({...questionnaireData, achievements: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={generateAISummaryWithData}
                disabled={isGenerating}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuestionnaire(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
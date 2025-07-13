'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, RefreshCw, CheckCircle } from 'lucide-react'

interface AiSummaryGeneratorProps {
  currentValue: string
  onValueChange: (value: string) => void
  personalData: {
    fullName?: string
    title?: string
    email?: string
    phone?: string
    address?: string
    linkedin?: string
    website?: string
  }
  className?: string
}

export function AiSummaryGenerator({
  currentValue,
  onValueChange,
  personalData,
  className = ''
}: AiSummaryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [showQuestions, setShowQuestions] = useState(false)
  const [questionnaire, setQuestionnaire] = useState({
    experienceYears: '',
    currentRole: '',
    keySkills: '',
    careerGoals: '',
    achievements: ''
  })

  const generateSummary = async (useQuestionnaire = false) => {
    setIsGenerating(true)
    
    try {
      // Create CV data structure for API
      const cvData = {
        personal: {
          fullName: personalData.fullName || 'Professional',
          title: personalData.title || '',
          email: personalData.email || '',
          phone: personalData.phone || '',
          address: personalData.address || '',
          linkedin: personalData.linkedin || '',
          website: personalData.website || '',
          summary: currentValue
        },
        experience: [], // Empty for now - can be enhanced later
        education: [],
        skills: [],
        sections: []
      }

      const requestBody: any = { cvData }
      
      if (useQuestionnaire) {
        requestBody.questionnaireData = questionnaire
      }

      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `user-${Date.now()}` // Simple user ID for rate limiting
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate summary')
      }

      const data = await response.json()
      
      if (data.success && data.summary) {
        setGeneratedSummary(data.summary)
      } else {
        throw new Error('Invalid response from AI service')
      }

    } catch (error) {
      console.error('AI Summary Generation Error:', error)
      alert(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const applySummary = () => {
    onValueChange(generatedSummary)
    setGeneratedSummary('')
  }

  const isQuestionnaireComplete = Object.values(questionnaire).every(value => value.trim() !== '')

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
            Summary
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
              className="text-xs"
              disabled={isGenerating}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Assistant
            </Button>
          </div>
        </div>

        <Textarea
          id="summary"
          value={currentValue}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Brief overview of your professional background and key achievements..."
          rows={4}
          className="transition-colors resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />

        <p className="text-xs text-gray-500 mt-1">
          💡 2-3 sentences highlighting your experience and value proposition
        </p>
      </div>

      {/* AI Assistant Panel */}
      {showQuestions && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-purple-900">AI Summary Generator</h4>
              <Badge variant="secondary" className="text-xs">Powered by Gemini AI</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-purple-700">Years of Experience</Label>
                <input
                  type="text"
                  value={questionnaire.experienceYears}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, experienceYears: e.target.value }))}
                  placeholder="e.g., 5+ years"
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-purple-700">Current/Target Role</Label>
                <input
                  type="text"
                  value={questionnaire.currentRole}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, currentRole: e.target.value }))}
                  placeholder="e.g., Senior Software Developer"
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-purple-700">Key Skills</Label>
                <input
                  type="text"
                  value={questionnaire.keySkills}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, keySkills: e.target.value }))}
                  placeholder="e.g., React, Node.js, AWS"
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-purple-700">Career Goals</Label>
                <input
                  type="text"
                  value={questionnaire.careerGoals}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, careerGoals: e.target.value }))}
                  placeholder="e.g., Lead technical teams"
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs text-purple-700">Key Achievement</Label>
                <input
                  type="text"
                  value={questionnaire.achievements}
                  onChange={(e) => setQuestionnaire(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="e.g., Reduced app load time by 40%"
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => generateSummary(true)}
                disabled={isGenerating || !isQuestionnaireComplete}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Summary
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => generateSummary(false)}
                disabled={isGenerating}
                className="text-purple-600 border-purple-200"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Quick Generate
              </Button>
            </div>

            {!isQuestionnaireComplete && (
              <p className="text-xs text-purple-600">
                💡 Fill in all fields for the best personalized summary, or use "Quick Generate" for a basic version.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Summary Preview */}
      {generatedSummary && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-900">AI Generated Summary</h4>
            </div>
            
            <div className="bg-white border border-green-200 rounded p-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {generatedSummary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={applySummary}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Use This Summary
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => generateSummary(isQuestionnaireComplete)}
                disabled={isGenerating}
                className="text-green-600 border-green-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setGeneratedSummary('')}
                className="text-gray-500"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
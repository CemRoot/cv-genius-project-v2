'use client'

import React, { useState, useEffect } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderSectionSchema } from '@/types/cv-builder'
import { z } from 'zod'

export function SummaryForm() {
  const { document, updateSummary } = useCvBuilder()
  const [error, setError] = useState<string>()
  const [touched, setTouched] = useState(false)
  const [charCount, setCharCount] = useState(0)

  // Find the summary section
  const summarySection = document.sections.find(s => s.type === 'summary')
  const summaryText = summarySection?.type === 'summary' ? summarySection.markdown : ''

  // Update character count when summary changes
  useEffect(() => {
    setCharCount(summaryText.length)
  }, [summaryText])

  const validateSummary = (value: string): string | undefined => {
    try {
      const summarySchema = z.object({
        type: z.literal('summary'),
        markdown: CvBuilderSectionSchema.options[0].shape.markdown
      })
      summarySchema.parse({ type: 'summary', markdown: value })
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Invalid summary'
    }
  }

  const handleSummaryChange = (value: string) => {
    updateSummary(value)
    setTouched(true)
    
    const validationError = validateSummary(value)
    setError(validationError)
  }

  const getCharCountColor = () => {
    if (charCount < 50) return 'text-red-600'
    if (charCount > 1000) return 'text-red-600'
    if (charCount > 800) return 'text-amber-600'
    return 'text-green-600'
  }

  const getSummaryTips = () => [
    'Start with your years of experience and key expertise',
    'Mention 2-3 of your most relevant skills or achievements',
    'Include keywords from Dublin job postings in your field',
    'Keep it conversational but professional',
    'Avoid first-person pronouns (I, me, my)',
    'End with what you\'re looking for or can offer'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Professional Summary
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Write a compelling 3-4 sentence summary that highlights your experience and value proposition for Dublin employers.
        </p>
      </div>

      <div className="space-y-4">
        {/* Summary Textarea */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary *
          </label>
          <div className="relative">
            <textarea
              id="summary"
              rows={6}
              value={summaryText}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder="e.g., Experienced Software Developer with 5+ years building scalable web applications. Proven track record in React, Node.js, and cloud technologies with a focus on user experience. Seeking to leverage technical expertise and collaborative approach to drive innovation at a forward-thinking Dublin tech company."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                error && touched
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {/* Character Count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1">
              <span className={getCharCountColor()}>
                {charCount}
              </span>
              <span className="text-gray-400">/1000</span>
            </div>
          </div>
          
          {error && touched && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          
          {/* Character count guidance */}
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Minimum 50 characters, recommended 200-600 characters
            </span>
            <span className={`font-medium ${getCharCountColor()}`}>
              {charCount < 50 && 'Too short'}
              {charCount >= 50 && charCount <= 600 && 'Good length'}
              {charCount > 600 && charCount <= 800 && 'Getting long'}
              {charCount > 800 && charCount <= 1000 && 'Very long'}
              {charCount > 1000 && 'Too long'}
            </span>
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Writing Tips for Dublin CVs</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {getSummaryTips().map((tip, index) => (
            <li key={index}>• {tip}</li>
          ))}
        </ul>
      </div>

      {/* Industry-Specific Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">📝 Industry Examples</h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-700">Tech/Software:</p>
            <p className="text-gray-600 italic">
              "Full-stack developer with 6+ years experience in fintech and e-commerce. 
              Expert in React, Python, and AWS with a track record of delivering scalable solutions. 
              Passionate about clean code and agile methodologies."
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700">Finance/Banking:</p>
            <p className="text-gray-600 italic">
              "Senior Financial Analyst with 8+ years in investment banking and corporate finance. 
              Skilled in financial modeling, risk assessment, and regulatory compliance. 
              Proven ability to drive strategic decision-making in Ireland's financial sector."
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700">Healthcare/Pharma:</p>
            <p className="text-gray-600 italic">
              "Registered Nurse with 5+ years in acute care and patient management. 
              Experienced in electronic health records and quality improvement initiatives. 
              Committed to delivering compassionate care in Dublin's healthcare system."
            </p>
          </div>
        </div>
      </div>

      {/* ATS Keywords Reminder */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              ATS Optimization Tip
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Include keywords from job descriptions you're targeting. Dublin employers often use ATS systems 
                that scan for specific skills, technologies, and experience levels mentioned in your summary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {!error && touched && charCount >= 50 && charCount <= 1000 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Professional summary looks great!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
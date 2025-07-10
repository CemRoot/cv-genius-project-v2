'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderExperience, CvBuilderExperienceSchema } from '@/types/cv-builder'
import { z } from 'zod'

interface ExperienceFormState {
  company: string
  role: string
  start: string
  end?: string
  bullets: string[]
}

const createEmptyExperience = (): ExperienceFormState => ({
  company: '',
  role: '',
  start: '',
  end: '',
  bullets: ['']
})

export function ExperienceForm() {
  const { document, addExperience, updateExperience, removeExperience } = useCvBuilder()
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<ExperienceFormState>(createEmptyExperience())
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get experience section
  const experienceSection = document.sections.find(s => s.type === 'experience')
  const experiences = experienceSection?.type === 'experience' ? experienceSection.items : []

  const validateForm = (data: ExperienceFormState): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    try {
      // Create a proper experience object for validation
      const experienceData: CvBuilderExperience = {
        company: data.company,
        role: data.role,
        start: data.start,
        end: data.end || undefined,
        bullets: data.bullets.filter(b => b.trim() !== '')
      }
      
      CvBuilderExperienceSchema.parse(experienceData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
      }
    }

    return errors
  }

  const handleSubmit = () => {
    const validationErrors = validateForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      const experienceData: CvBuilderExperience = {
        company: formData.company,
        role: formData.role,
        start: formData.start,
        end: formData.end || undefined,
        bullets: formData.bullets.filter(b => b.trim() !== '')
      }

      if (editingIndex !== null) {
        updateExperience(editingIndex, experienceData)
      } else {
        addExperience(experienceData)
      }

      // Reset form
      setFormData(createEmptyExperience())
      setShowForm(false)
      setEditingIndex(null)
      setErrors({})
    }
  }

  const handleEdit = (index: number) => {
    const exp = experiences[index]
    setFormData({
      company: exp.company,
      role: exp.role,
      start: exp.start,
      end: exp.end || '',
      bullets: exp.bullets.length > 0 ? exp.bullets : ['']
    })
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData(createEmptyExperience())
    setShowForm(false)
    setEditingIndex(null)
    setErrors({})
  }

  const addBulletPoint = () => {
    setFormData(prev => ({
      ...prev,
      bullets: [...prev.bullets, '']
    }))
  }

  const updateBulletPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      bullets: prev.bullets.map((bullet, i) => i === index ? value : bullet)
    }))
  }

  const removeBulletPoint = (index: number) => {
    if (formData.bullets.length > 1) {
      setFormData(prev => ({
        ...prev,
        bullets: prev.bullets.filter((_, i) => i !== index)
      }))
    }
  }

  const formatDateForInput = (dateStr: string) => {
    if (dateStr === 'Present') return ''
    return dateStr
  }

  const generateCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Work Experience
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Add your professional experience in reverse chronological order (most recent first).
        </p>
      </div>

      {/* Existing Experience List */}
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.start} - {exp.end || 'Present'}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {exp.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Add Experience Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add Work Experience
        </button>
      )}

      {/* Experience Form */}
      {showForm && (
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit' : 'Add'} Work Experience
          </h4>

          <div className="space-y-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g., Accenture Ireland"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Senior Software Developer"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="month"
                  value={formData.start}
                  onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start && <p className="mt-1 text-sm text-red-600">{errors.start}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="space-y-2">
                  <input
                    type="month"
                    value={formatDateForInput(formData.end || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                    disabled={formData.end === 'Present'}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end ? 'border-red-300' : 'border-gray-300'
                    } ${formData.end === 'Present' ? 'bg-gray-100' : ''}`}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.end === 'Present'}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        end: e.target.checked ? 'Present' : generateCurrentMonth()
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Current position</span>
                  </label>
                </div>
                {errors.end && <p className="mt-1 text-sm text-red-600">{errors.end}</p>}
              </div>
            </div>

            {/* Achievements/Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Achievements & Responsibilities *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Use bullet points to describe your achievements. Start with action verbs and quantify results when possible.
              </p>
              
              <div className="space-y-2">
                {formData.bullets.map((bullet, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <textarea
                      value={bullet}
                      onChange={(e) => updateBulletPoint(index, e.target.value)}
                      placeholder={`e.g., ${index === 0 ? 'Developed and maintained 5+ web applications using React and Node.js, serving 10,000+ daily users' : 'Led cross-functional team of 4 developers to deliver project 2 weeks ahead of schedule'}`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    {formData.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBulletPoint(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formData.bullets.length < 6 && (
                <button
                  type="button"
                  onClick={addBulletPoint}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add another achievement
                </button>
              )}

              {errors.bullets && <p className="mt-1 text-sm text-red-600">{errors.bullets}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Experience
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Dublin CV Experience Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Start bullet points with strong action verbs (Developed, Led, Implemented, Improved)</li>
          <li>• Quantify achievements with numbers, percentages, or timeframes</li>
          <li>• Focus on results and impact, not just responsibilities</li>
          <li>• Include relevant technologies and tools used</li>
          <li>• Mention any Dublin-specific experience or Irish market knowledge</li>
          <li>• Keep each bullet point to 1-2 lines for ATS compliance</li>
        </ul>
      </div>
    </div>
  )
}
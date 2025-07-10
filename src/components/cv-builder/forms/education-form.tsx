'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderEducation, CvBuilderEducationSchema } from '@/types/cv-builder'
import { z } from 'zod'

interface EducationFormState {
  institution: string
  degree: string
  field: string
  start: string
  end?: string
  grade?: string
}

const createEmptyEducation = (): EducationFormState => ({
  institution: '',
  degree: '',
  field: '',
  start: '',
  end: '',
  grade: ''
})

export function EducationForm() {
  const { document, addEducation, updateEducation, removeEducation } = useCvBuilder()
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<EducationFormState>(createEmptyEducation())
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get education section
  const educationSection = document.sections.find(s => s.type === 'education')
  const educations = educationSection?.type === 'education' ? educationSection.items : []

  const validateForm = (data: EducationFormState): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    try {
      const educationData: CvBuilderEducation = {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        start: data.start,
        end: data.end || undefined,
        grade: data.grade || undefined
      }
      
      CvBuilderEducationSchema.parse(educationData)
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
      const educationData: CvBuilderEducation = {
        institution: formData.institution,
        degree: formData.degree,
        field: formData.field,
        start: formData.start,
        end: formData.end || undefined,
        grade: formData.grade || undefined
      }

      if (editingIndex !== null) {
        updateEducation(editingIndex, educationData)
      } else {
        addEducation(educationData)
      }

      // Reset form
      setFormData(createEmptyEducation())
      setShowForm(false)
      setEditingIndex(null)
      setErrors({})
    }
  }

  const handleEdit = (index: number) => {
    const edu = educations[index]
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      start: edu.start,
      end: edu.end || '',
      grade: edu.grade || ''
    })
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData(createEmptyEducation())
    setShowForm(false)
    setEditingIndex(null)
    setErrors({})
  }

  const formatDateForInput = (dateStr: string) => {
    if (dateStr === 'Present') return ''
    return dateStr
  }

  const generateCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const getIrishInstitutions = () => [
    'Trinity College Dublin (TCD)',
    'University College Dublin (UCD)',
    'Dublin City University (DCU)',
    'National University of Ireland Galway (NUIG)',
    'University College Cork (UCC)',
    'University of Limerick (UL)',
    'Maynooth University',
    'Technological University Dublin (TUD)',
    'Cork Institute of Technology (CIT)',
    'Institute of Technology Carlow',
    'Griffith College Dublin',
    'Dublin Business School'
  ]

  const getCommonDegrees = () => [
    'Bachelor of Arts (BA)',
    'Bachelor of Science (BSc)',
    'Bachelor of Engineering (BE)',
    'Bachelor of Business Studies (BBS)',
    'Bachelor of Commerce (BCom)',
    'Bachelor of Computer Science (BCS)',
    'Master of Arts (MA)',
    'Master of Science (MSc)',
    'Master of Engineering (ME)',
    'Master of Business Administration (MBA)',
    'PhD (Doctor of Philosophy)',
    'Higher Certificate',
    'Higher Diploma',
    'Professional Certificate',
    'Level 8 Honours Degree',
    'Level 9 Masters Degree',
    'Level 10 Doctoral Degree'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Education
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Add your educational background in reverse chronological order (most recent first).
        </p>
      </div>

      {/* Existing Education List */}
      <div className="space-y-4">
        {educations.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">{edu.field}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>{edu.start} - {edu.end || 'Present'}</span>
                  {edu.grade && <span>Grade: {edu.grade}</span>}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Education Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add Education
        </button>
      )}

      {/* Education Form */}
      {showForm && (
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit' : 'Add'} Education
          </h4>

          <div className="space-y-4">
            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <input
                type="text"
                list="irish-institutions"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g., Trinity College Dublin"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.institution ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id="irish-institutions">
                {getIrishInstitutions().map(institution => (
                  <option key={institution} value={institution} />
                ))}
              </datalist>
              {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Qualification *
              </label>
              <input
                type="text"
                list="common-degrees"
                value={formData.degree}
                onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g., Bachelor of Science (BSc)"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.degree ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id="common-degrees">
                {getCommonDegrees().map(degree => (
                  <option key={degree} value={degree} />
                ))}
              </datalist>
              {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree}</p>}
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study *
              </label>
              <input
                type="text"
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                placeholder="e.g., Computer Science, Business Studies, Engineering"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.field ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.field && <p className="mt-1 text-sm text-red-600">{errors.field}</p>}
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
                    <span className="text-sm text-gray-600">Currently studying</span>
                  </label>
                </div>
                {errors.end && <p className="mt-1 text-sm text-red-600">{errors.end}</p>}
              </div>
            </div>

            {/* Grade (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade/Result (Optional)
              </label>
              <input
                type="text"
                value={formData.grade || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="e.g., First Class Honours, 2:1, 3.8 GPA, Distinction"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.grade ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Only include if achieved a strong grade (2:1 or above, Distinction, etc.)
              </p>
              {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
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
              {editingIndex !== null ? 'Update' : 'Add'} Education
            </button>
          </div>
        </div>
      )}

      {/* Irish Education System Guide */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">🎓 Irish Education System Guide</h4>
        <div className="text-sm text-green-700 space-y-2">
          <p><strong>NFQ Levels (National Framework of Qualifications):</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Level 6: Higher Certificate, Advanced Certificate</li>
            <li>Level 7: Ordinary Bachelor Degree</li>
            <li>Level 8: Honours Bachelor Degree, Higher Diploma</li>
            <li>Level 9: Masters Degree, Postgraduate Diploma</li>
            <li>Level 10: Doctoral Degree (PhD)</li>
          </ul>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Dublin Education Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• List education in reverse chronological order (most recent first)</li>
          <li>• Include full official institution names for Irish universities</li>
          <li>• Specify NFQ level for Irish qualifications when relevant</li>
          <li>• Include grade only if it's strong (2:1 or above)</li>
          <li>• For international qualifications, consider adding Irish equivalent</li>
          <li>• Include relevant coursework or final year projects if they align with the job</li>
        </ul>
      </div>
    </div>
  )
}
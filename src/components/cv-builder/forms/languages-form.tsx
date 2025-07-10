'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderLanguage } from '@/types/cv-builder'

const proficiencyLevels = [
  { value: 'native' as const, label: 'Native', description: 'Mother tongue' },
  { value: 'fluent' as const, label: 'Fluent', description: 'Full professional proficiency' },
  { value: 'professional' as const, label: 'Professional', description: 'Professional working proficiency' },
  { value: 'intermediate' as const, label: 'Intermediate', description: 'Limited working proficiency' },
  { value: 'basic' as const, label: 'Basic', description: 'Elementary proficiency' }
]

export function LanguagesForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'languages')
  const languages = section?.type === 'languages' ? section : { type: 'languages' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newLanguage, setNewLanguage] = useState<Partial<CvBuilderLanguage>>({
    name: '',
    proficiency: 'intermediate',
    certification: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateLanguage = (lang: Partial<CvBuilderLanguage>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!lang.name?.trim()) newErrors.name = 'Language name is required'
    if (!lang.proficiency) newErrors.proficiency = 'Proficiency level is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddLanguage = () => {
    if (validateLanguage(newLanguage)) {
      const updatedLanguages = [...languages.items, newLanguage as CvBuilderLanguage]
      updateSection('languages', { ...languages, items: updatedLanguages })
      setNewLanguage({
        name: '',
        proficiency: 'intermediate',
        certification: ''
      })
      setErrors({})
    }
  }

  const handleEditLanguage = (index: number) => {
    const lang = languages.items[index]
    setEditingIndex(index)
    setNewLanguage(lang)
  }

  const handleUpdateLanguage = () => {
    if (editingIndex !== null && validateLanguage(newLanguage)) {
      const updatedLanguages = [...languages.items]
      updatedLanguages[editingIndex] = newLanguage as CvBuilderLanguage
      updateSection('languages', { ...languages, items: updatedLanguages })
      setEditingIndex(null)
      setNewLanguage({
        name: '',
        proficiency: 'intermediate',
        certification: ''
      })
      setErrors({})
    }
  }

  const handleDeleteLanguage = (index: number) => {
    const updatedLanguages = languages.items.filter((_, i) => i !== index)
    updateSection('languages', { ...languages, items: updatedLanguages })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages</h3>
        <p className="text-sm text-gray-600 mb-4">
          List the languages you speak and your proficiency level
        </p>
      </div>

      {/* Existing Languages */}
      {languages.items.length > 0 && (
        <div className="space-y-3">
          {languages.items.map((lang, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
              <div className="pr-20">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{lang.name}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    lang.proficiency === 'native' ? 'bg-green-100 text-green-800' :
                    lang.proficiency === 'fluent' ? 'bg-blue-100 text-blue-800' :
                    lang.proficiency === 'professional' ? 'bg-indigo-100 text-indigo-800' :
                    lang.proficiency === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proficiencyLevels.find(p => p.value === lang.proficiency)?.label}
                  </span>
                </div>
                {lang.certification && (
                  <div className="text-sm text-gray-600 mt-1">
                    Certification: {lang.certification}
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditLanguage(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLanguage(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Language Form */}
      {(languages.items.length < 8 || editingIndex !== null) && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            {editingIndex !== null ? 'Edit Language' : 'Add Language'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language *
              </label>
              <input
                type="text"
                value={newLanguage.name || ''}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., English, Irish, Spanish"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level *
              </label>
              <select
                value={newLanguage.proficiency || 'intermediate'}
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value as CvBuilderLanguage['proficiency'] })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.proficiency ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {proficiencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
              {errors.proficiency && (
                <p className="mt-1 text-sm text-red-600">{errors.proficiency}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification (Optional)
              </label>
              <input
                type="text"
                value={newLanguage.certification || ''}
                onChange={(e) => setNewLanguage({ ...newLanguage, certification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., IELTS 8.5, TOEFL 115, DELF B2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Include any language certifications or test scores
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewLanguage({
                    name: '',
                    proficiency: 'intermediate',
                    certification: ''
                  })
                  setErrors({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingIndex !== null ? handleUpdateLanguage : handleAddLanguage}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Language' : 'Add Language'}
            </button>
          </div>
        </div>
      )}

      {languages.items.length >= 8 && editingIndex === null && (
        <div className="text-sm text-gray-500 italic">
          Maximum 8 languages allowed
        </div>
      )}
    </div>
  )
}
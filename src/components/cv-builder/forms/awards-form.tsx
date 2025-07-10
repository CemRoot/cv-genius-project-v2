'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderAward } from '@/types/cv-builder'

export function AwardsForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'awards')
  const awards = section?.type === 'awards' ? section : { type: 'awards' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newAward, setNewAward] = useState<Partial<CvBuilderAward>>({
    name: '',
    issuer: '',
    date: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAward = (award: Partial<CvBuilderAward>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!award.name?.trim()) newErrors.name = 'Award name is required'
    if (!award.issuer?.trim()) newErrors.issuer = 'Issuer is required'
    if (!award.date) {
      newErrors.date = 'Date is required'
    } else if (!/^\d{4}-\d{2}$/.test(award.date)) {
      newErrors.date = 'Date must be in YYYY-MM format'
    }
    
    if (award.description && award.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDateForDisplay = (date: string): string => {
    if (!date || !/^\d{4}-\d{2}$/.test(date)) return date
    const [year, month] = date.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  const handleAddAward = () => {
    if (validateAward(newAward)) {
      const updatedAwards = [...awards.items, newAward as CvBuilderAward]
      updateSection('awards', { ...awards, items: updatedAwards })
      setNewAward({
        name: '',
        issuer: '',
        date: '',
        description: ''
      })
      setErrors({})
    }
  }

  const handleEditAward = (index: number) => {
    const award = awards.items[index]
    setEditingIndex(index)
    setNewAward(award)
  }

  const handleUpdateAward = () => {
    if (editingIndex !== null && validateAward(newAward)) {
      const updatedAwards = [...awards.items]
      updatedAwards[editingIndex] = newAward as CvBuilderAward
      updateSection('awards', { ...awards, items: updatedAwards })
      setEditingIndex(null)
      setNewAward({
        name: '',
        issuer: '',
        date: '',
        description: ''
      })
      setErrors({})
    }
  }

  const handleDeleteAward = (index: number) => {
    const updatedAwards = awards.items.filter((_, i) => i !== index)
    updateSection('awards', { ...awards, items: updatedAwards })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Awards & Achievements</h3>
        <p className="text-sm text-gray-600 mb-4">
          Highlight your professional awards and notable achievements
        </p>
      </div>

      {/* Existing Awards */}
      {awards.items.length > 0 && (
        <div className="space-y-3">
          {awards.items.map((award, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
              <div className="pr-20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{award.name}</div>
                    <div className="text-sm text-gray-600">
                      {award.issuer} • {formatDateForDisplay(award.date)}
                    </div>
                    {award.description && (
                      <div className="text-sm text-gray-700 mt-2">{award.description}</div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditAward(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAward(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Award Form */}
      {(awards.items.length < 6 || editingIndex !== null) && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            {editingIndex !== null ? 'Edit Award' : 'Add Award'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award Name *
              </label>
              <input
                type="text"
                value={newAward.name || ''}
                onChange={(e) => setNewAward({ ...newAward, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Employee of the Year"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  value={newAward.issuer || ''}
                  onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.issuer ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Tech Company Ltd"
                />
                {errors.issuer && (
                  <p className="mt-1 text-sm text-red-600">{errors.issuer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Received *
                </label>
                <input
                  type="month"
                  value={newAward.date || ''}
                  onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().slice(0, 7)}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newAward.description || ''}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                rows={2}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Brief description of the award or achievement..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {newAward.description?.length || 0}/200 characters
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewAward({
                    name: '',
                    issuer: '',
                    date: '',
                    description: ''
                  })
                  setErrors({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingIndex !== null ? handleUpdateAward : handleAddAward}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Award' : 'Add Award'}
            </button>
          </div>
        </div>
      )}

      {awards.items.length >= 6 && editingIndex === null && (
        <div className="text-sm text-gray-500 italic">
          Maximum 6 awards allowed
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderVolunteer } from '@/types/cv-builder'

export function VolunteerForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'volunteer')
  const volunteer = section?.type === 'volunteer' ? section : { type: 'volunteer' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newVolunteer, setNewVolunteer] = useState<Partial<CvBuilderVolunteer>>({
    organization: '',
    role: '',
    start: '',
    end: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateVolunteer = (vol: Partial<CvBuilderVolunteer>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!vol.organization?.trim()) newErrors.organization = 'Organization name is required'
    if (!vol.role?.trim()) newErrors.role = 'Role is required'
    if (!vol.start) {
      newErrors.start = 'Start date is required'
    } else if (!/^\d{4}-\d{2}$/.test(vol.start)) {
      newErrors.start = 'Start date must be in YYYY-MM format'
    }
    
    if (vol.end && vol.end !== 'Present' && !/^\d{4}-\d{2}$/.test(vol.end)) {
      newErrors.end = 'End date must be in YYYY-MM format or "Present"'
    }
    
    if (vol.end && vol.start && vol.end !== 'Present' && vol.end < vol.start) {
      newErrors.end = 'End date must be after start date'
    }
    
    if (!vol.description?.trim()) {
      newErrors.description = 'Description is required'
    } else if (vol.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (vol.description.length > 300) {
      newErrors.description = 'Description must be less than 300 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDateForDisplay = (date: string): string => {
    if (!date || date === 'Present') return date
    if (!/^\d{4}-\d{2}$/.test(date)) return date
    const [year, month] = date.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  const handleAddVolunteer = () => {
    if (validateVolunteer(newVolunteer)) {
      const updatedVolunteer = [...volunteer.items, newVolunteer as CvBuilderVolunteer]
      updateSection('volunteer', { ...volunteer, items: updatedVolunteer })
      setNewVolunteer({
        organization: '',
        role: '',
        start: '',
        end: '',
        description: ''
      })
      setErrors({})
    }
  }

  const handleEditVolunteer = (index: number) => {
    const vol = volunteer.items[index]
    setEditingIndex(index)
    setNewVolunteer(vol)
  }

  const handleUpdateVolunteer = () => {
    if (editingIndex !== null && validateVolunteer(newVolunteer)) {
      const updatedVolunteer = [...volunteer.items]
      updatedVolunteer[editingIndex] = newVolunteer as CvBuilderVolunteer
      updateSection('volunteer', { ...volunteer, items: updatedVolunteer })
      setEditingIndex(null)
      setNewVolunteer({
        organization: '',
        role: '',
        start: '',
        end: '',
        description: ''
      })
      setErrors({})
    }
  }

  const handleDeleteVolunteer = (index: number) => {
    const updatedVolunteer = volunteer.items.filter((_, i) => i !== index)
    updateSection('volunteer', { ...volunteer, items: updatedVolunteer })
  }

  const handleEndDateChange = (value: string) => {
    if (value === 'current') {
      setNewVolunteer({ ...newVolunteer, end: 'Present' })
    } else {
      setNewVolunteer({ ...newVolunteer, end: value })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteer Experience</h3>
        <p className="text-sm text-gray-600 mb-4">
          Include any volunteer work or community service
        </p>
      </div>

      {/* Existing Volunteer Experiences */}
      {volunteer.items.length > 0 && (
        <div className="space-y-3">
          {volunteer.items.map((vol, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
              <div className="pr-20">
                <div className="font-medium text-gray-900">{vol.role}</div>
                <div className="text-sm text-gray-600">{vol.organization}</div>
                <div className="text-sm text-gray-500">
                  {formatDateForDisplay(vol.start)} – {formatDateForDisplay(vol.end || 'Present')}
                </div>
                <div className="text-sm text-gray-700 mt-2">{vol.description}</div>
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditVolunteer(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteVolunteer(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Volunteer Form */}
      {(volunteer.items.length < 5 || editingIndex !== null) && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            {editingIndex !== null ? 'Edit Volunteer Experience' : 'Add Volunteer Experience'}
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  value={newVolunteer.organization || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, organization: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.organization ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Dublin Food Bank"
                />
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <input
                  type="text"
                  value={newVolunteer.role || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Volunteer Coordinator"
                />
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="month"
                  value={newVolunteer.start || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, start: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().slice(0, 7)}
                />
                {errors.start && (
                  <p className="mt-1 text-sm text-red-600">{errors.start}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="month"
                    value={newVolunteer.end === 'Present' ? '' : newVolunteer.end || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    disabled={newVolunteer.end === 'Present'}
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.end ? 'border-red-300' : 'border-gray-300'
                    } ${newVolunteer.end === 'Present' ? 'bg-gray-100' : ''}`}
                    min={newVolunteer.start || undefined}
                    max={new Date().toISOString().slice(0, 7)}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newVolunteer.end === 'Present'}
                      onChange={(e) => handleEndDateChange(e.target.checked ? 'current' : '')}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Current</span>
                  </label>
                </div>
                {errors.end && (
                  <p className="mt-1 text-sm text-red-600">{errors.end}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={newVolunteer.description || ''}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your volunteer work and impact..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {newVolunteer.description?.length || 0}/300 characters
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewVolunteer({
                    organization: '',
                    role: '',
                    start: '',
                    end: '',
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
              onClick={editingIndex !== null ? handleUpdateVolunteer : handleAddVolunteer}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </div>
      )}

      {volunteer.items.length >= 5 && editingIndex === null && (
        <div className="text-sm text-gray-500 italic">
          Maximum 5 volunteer experiences allowed
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderReference } from '@/types/cv-builder'
import { formatIrishPhone, validateIrishPhone } from '@/types/cv-builder'

export function ReferencesForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'references')
  const references = section?.type === 'references' ? section : { type: 'references' as const, mode: 'on-request' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newReference, setNewReference] = useState<Partial<CvBuilderReference>>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    relationship: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleModeChange = (mode: 'on-request' | 'detailed') => {
    updateSection('references', { ...references, mode })
  }

  const validateReference = (ref: Partial<CvBuilderReference>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!ref.name?.trim()) newErrors.name = 'Name is required'
    if (!ref.title?.trim()) newErrors.title = 'Title is required'
    if (!ref.company?.trim()) newErrors.company = 'Company is required'
    if (!ref.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email)) {
      newErrors.email = 'Invalid email format'
    }
    // Phone is optional, but if provided, must be valid
    if (ref.phone && ref.phone.trim() && ref.phone !== '+353 ' && !validateIrishPhone(ref.phone)) {
      newErrors.phone = 'Phone must be in Irish format (+353 XX XXX XXXX)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddReference = () => {
    if (validateReference(newReference)) {
      const updatedReferences = [...references.items, newReference as CvBuilderReference]
      updateSection('references', { ...references, items: updatedReferences })
      setNewReference({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: ''
      })
      setErrors({})
    }
  }

  const handleEditReference = (index: number) => {
    const ref = references.items[index]
    setEditingIndex(index)
    setNewReference(ref)
  }

  const handleUpdateReference = () => {
    if (editingIndex !== null && validateReference(newReference)) {
      const updatedReferences = [...references.items]
      updatedReferences[editingIndex] = newReference as CvBuilderReference
      updateSection('references', { ...references, items: updatedReferences })
      setEditingIndex(null)
      setNewReference({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: ''
      })
      setErrors({})
    }
  }

  const handleDeleteReference = (index: number) => {
    const updatedReferences = references.items.filter((_, i) => i !== index)
    updateSection('references', { ...references, items: updatedReferences })
  }

  const handlePhoneChange = (value: string) => {
    // If the field is empty, keep it empty
    if (!value.trim()) {
      setNewReference({ ...newReference, phone: '' })
      if (errors.phone) {
        setErrors({ ...errors, phone: '' })
      }
      return
    }
    
    let formattedPhone = value
    
    if (!value.startsWith('+353')) {
      formattedPhone = '+353 ' + value.replace(/[^\d]/g, '')
    }
    
    if (value.length > (newReference.phone?.length || 0) && validateIrishPhone(value)) {
      formattedPhone = formatIrishPhone(value)
    }
    
    setNewReference({ ...newReference, phone: formattedPhone })
    if (errors.phone && validateIrishPhone(formattedPhone)) {
      setErrors({ ...errors, phone: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">References</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how to handle references on your CV
        </p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="radio"
            name="referenceMode"
            value="on-request"
            checked={references.mode === 'on-request'}
            onChange={() => handleModeChange('on-request')}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">References available upon request</div>
            <div className="text-sm text-gray-500">
              Standard practice in Ireland - shows "References available upon request"
            </div>
          </div>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="radio"
            name="referenceMode"
            value="detailed"
            checked={references.mode === 'detailed'}
            onChange={() => handleModeChange('detailed')}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">Include reference details</div>
            <div className="text-sm text-gray-500">
              Add up to 4 professional references with contact information
            </div>
          </div>
        </label>
      </div>

      {/* Reference Details Form */}
      {references.mode === 'detailed' && (
        <div className="space-y-6 mt-6">
          {/* Existing References */}
          {references.items.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Your References</h4>
              {references.items.map((ref, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
                  <div className="pr-20">
                    <div className="font-medium text-gray-900">{ref.name}</div>
                    <div className="text-sm text-gray-600">{ref.title} at {ref.company}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {ref.email}
                      {ref.phone && ` • ${ref.phone}`}
                      {ref.relationship && ` • ${ref.relationship}`}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 space-x-2">
                    <button
                      onClick={() => handleEditReference(index)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReference(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Reference Form */}
          {(references.items.length < 4 || editingIndex !== null) && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                {editingIndex !== null ? 'Edit Reference' : 'Add Reference'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newReference.name || ''}
                    onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newReference.title || ''}
                    onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Senior Manager"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={newReference.company || ''}
                    onChange={(e) => setNewReference({ ...newReference, company: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tech Company Ltd"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newReference.email || ''}
                    onChange={(e) => setNewReference({ ...newReference, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="john.smith@company.ie"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newReference.phone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+353 XX XXX XXXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReference.relationship || ''}
                    onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Former Manager"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                {editingIndex !== null && (
                  <button
                    onClick={() => {
                      setEditingIndex(null)
                      setNewReference({
                        name: '',
                        title: '',
                        company: '',
                        email: '',
                        phone: '+353 ',
                        relationship: ''
                      })
                      setErrors({})
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={editingIndex !== null ? handleUpdateReference : handleAddReference}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingIndex !== null ? 'Update Reference' : 'Add Reference'}
                </button>
              </div>
            </div>
          )}

          {references.items.length >= 4 && editingIndex === null && (
            <div className="text-sm text-gray-500 italic">
              Maximum 4 references allowed
            </div>
          )}
        </div>
      )}
    </div>
  )
}
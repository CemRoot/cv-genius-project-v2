'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderPublication } from '@/types/cv-builder'

export function PublicationsForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'publications')
  const publications = section?.type === 'publications' ? section : { type: 'publications' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newPublication, setNewPublication] = useState<Partial<CvBuilderPublication>>({
    title: '',
    publication: '',
    date: '',
    url: '',
    authors: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePublication = (pub: Partial<CvBuilderPublication>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!pub.title?.trim()) newErrors.title = 'Title is required'
    if (!pub.publication?.trim()) newErrors.publication = 'Publication name is required'
    if (!pub.date) {
      newErrors.date = 'Publication date is required'
    } else if (!/^\d{4}-\d{2}$/.test(pub.date)) {
      newErrors.date = 'Date must be in YYYY-MM format'
    }
    
    if (pub.url && !/^https?:\/\/.+/.test(pub.url)) {
      newErrors.url = 'URL must start with http:// or https://'
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

  const handleAddPublication = () => {
    if (validatePublication(newPublication)) {
      const updatedPublications = [...publications.items, newPublication as CvBuilderPublication]
      updateSection('publications', { ...publications, items: updatedPublications })
      setNewPublication({
        title: '',
        publication: '',
        date: '',
        url: '',
        authors: ''
      })
      setErrors({})
    }
  }

  const handleEditPublication = (index: number) => {
    const pub = publications.items[index]
    setEditingIndex(index)
    setNewPublication(pub)
  }

  const handleUpdatePublication = () => {
    if (editingIndex !== null && validatePublication(newPublication)) {
      const updatedPublications = [...publications.items]
      updatedPublications[editingIndex] = newPublication as CvBuilderPublication
      updateSection('publications', { ...publications, items: updatedPublications })
      setEditingIndex(null)
      setNewPublication({
        title: '',
        publication: '',
        date: '',
        url: '',
        authors: ''
      })
      setErrors({})
    }
  }

  const handleDeletePublication = (index: number) => {
    const updatedPublications = publications.items.filter((_, i) => i !== index)
    updateSection('publications', { ...publications, items: updatedPublications })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Publications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add your academic papers, articles, or other publications
        </p>
      </div>

      {/* Existing Publications */}
      {publications.items.length > 0 && (
        <div className="space-y-3">
          {publications.items.map((pub, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 relative">
              <div className="pr-20">
                <div className="font-medium text-gray-900">"{pub.title}"</div>
                <div className="text-sm text-gray-600 mt-1">
                  {pub.publication} • {formatDateForDisplay(pub.date)}
                </div>
                {pub.authors && (
                  <div className="text-sm text-gray-500 mt-1">
                    Authors: {pub.authors}
                  </div>
                )}
                {pub.url && (
                  <div className="text-sm mt-1">
                    <a 
                      href={pub.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      View Publication
                    </a>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditPublication(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePublication(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Publication Form */}
      {(publications.items.length < 10 || editingIndex !== null) && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            {editingIndex !== null ? 'Edit Publication' : 'Add Publication'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newPublication.title || ''}
                onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Machine Learning Applications in Healthcare"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journal/Conference *
                </label>
                <input
                  type="text"
                  value={newPublication.publication || ''}
                  onChange={(e) => setNewPublication({ ...newPublication, publication: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.publication ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., IEEE Conference on AI"
                />
                {errors.publication && (
                  <p className="mt-1 text-sm text-red-600">{errors.publication}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Date *
                </label>
                <input
                  type="month"
                  value={newPublication.date || ''}
                  onChange={(e) => setNewPublication({ ...newPublication, date: e.target.value })}
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
                Authors (Optional)
              </label>
              <input
                type="text"
                value={newPublication.authors || ''}
                onChange={(e) => setNewPublication({ ...newPublication, authors: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Smith, J., Doe, A., et al."
              />
              <p className="mt-1 text-xs text-gray-500">
                List co-authors if applicable
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL (Optional)
              </label>
              <input
                type="url"
                value={newPublication.url || ''}
                onChange={(e) => setNewPublication({ ...newPublication, url: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.url ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/publication"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Link to online version or DOI
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewPublication({
                    title: '',
                    publication: '',
                    date: '',
                    url: '',
                    authors: ''
                  })
                  setErrors({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingIndex !== null ? handleUpdatePublication : handleAddPublication}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Publication' : 'Add Publication'}
            </button>
          </div>
        </div>
      )}

      {publications.items.length >= 10 && editingIndex === null && (
        <div className="text-sm text-gray-500 italic">
          Maximum 10 publications allowed
        </div>
      )}
    </div>
  )
}
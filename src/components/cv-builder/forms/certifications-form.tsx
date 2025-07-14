'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { CvBuilderCertification } from '@/types/cv-builder'

export function CertificationsForm() {
  const { document, updateSection } = useCvBuilder()
  const section = document.sections.find(s => s.type === 'certifications')
  const certifications = section?.type === 'certifications' ? section : { type: 'certifications' as const, items: [] }
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newCertification, setNewCertification] = useState<Partial<CvBuilderCertification>>({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCertification = (cert: Partial<CvBuilderCertification>): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!cert.name?.trim()) newErrors.name = 'Certification name is required'
    if (!cert.issuer?.trim()) newErrors.issuer = 'Issuer is required'
    if (!cert.date) {
      newErrors.date = 'Issue date is required'
    } else if (!/^\d{4}-\d{2}$/.test(cert.date)) {
      newErrors.date = 'Date must be in YYYY-MM format'
    }
    
    if (cert.expiryDate && !/^\d{4}-\d{2}$/.test(cert.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in YYYY-MM format'
    }
    
    if (cert.expiryDate && cert.date && cert.expiryDate <= cert.date) {
      newErrors.expiryDate = 'Expiry date must be after issue date'
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

  const isExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false
    const now = new Date()
    const [year, month] = expiryDate.split('-').map(Number)
    const expiry = new Date(year, month - 1)
    return expiry < now
  }

  const handleAddCertification = () => {
    if (validateCertification(newCertification)) {
      const updatedCertifications = [...certifications.items, newCertification as CvBuilderCertification]
      updateSection('certifications', { ...certifications, items: updatedCertifications })
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: ''
      })
      setErrors({})
    }
  }

  const handleEditCertification = (index: number) => {
    const cert = certifications.items[index]
    setEditingIndex(index)
    setNewCertification(cert)
  }

  const handleUpdateCertification = () => {
    if (editingIndex !== null && validateCertification(newCertification)) {
      const updatedCertifications = [...certifications.items]
      updatedCertifications[editingIndex] = newCertification as CvBuilderCertification
      updateSection('certifications', { ...certifications, items: updatedCertifications })
      setEditingIndex(null)
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: ''
      })
      setErrors({})
    }
  }

  const handleDeleteCertification = (index: number) => {
    const updatedCertifications = certifications.items.filter((_, i) => i !== index)
    updateSection('certifications', { ...certifications, items: updatedCertifications })
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center">
          📜 Important: Certifications & Licenses
        </h3>
        <p className="text-sm text-red-700 mb-2 font-medium">
          This section is crucial for ATS systems and recruiters. Add your professional certifications and licenses to stand out.
        </p>
        <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
          <strong>⚠️ Note:</strong> This section significantly impacts your CV's ATS score and keyword matching
        </div>
      </div>

      {/* Existing Certifications */}
      {certifications.items.length > 0 && (
        <div className="space-y-3">
          {certifications.items.map((cert, index) => (
            <div key={index} className="bg-red-50 border-2 border-red-200 rounded-lg p-4 relative shadow-sm hover:shadow-md transition-shadow">
              <div className="pr-20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-red-800 text-lg">{cert.name}</div>
                    <div className="text-sm text-red-700 font-medium">{cert.issuer}</div>
                    <div className="text-sm text-red-600 mt-1">
                      Issued: {formatDateForDisplay(cert.date)}
                      {cert.expiryDate && (
                        <span className={isExpired(cert.expiryDate) ? 'text-red-800 font-bold' : 'text-red-600'}>
                          {' • '}Expires: {formatDateForDisplay(cert.expiryDate)}
                          {isExpired(cert.expiryDate) && ' (EXPIRED)'}
                        </span>
                      )}
                    </div>
                    {cert.credentialId && (
                      <div className="text-sm text-red-600 font-mono bg-red-100 px-2 py-1 rounded mt-1 inline-block">
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>
                  {isExpired(cert.expiryDate) && (
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-red-200 text-red-800 border border-red-300">
                      ⚠️ EXPIRED
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditCertification(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-bold bg-red-100 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCertification(index)}
                  className="text-red-700 hover:text-red-900 text-sm font-bold bg-red-200 px-2 py-1 rounded hover:bg-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Certification Form */}
      {(certifications.items.length < 10 || editingIndex !== null) && (
        <div className="border-t-4 border-red-500 pt-6 bg-red-25">
          <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
            {editingIndex !== null ? '✏️ Edit Certification' : '➕ Add New Certification'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-red-800 mb-1">
                Certification Name * <span className="text-red-600">(Required)</span>
              </label>
              <input
                type="text"
                value={newCertification.name || ''}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className={`w-full px-3 py-2 border-2 rounded-md focus:ring-red-500 focus:border-red-500 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-red-300'
                }`}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-800 font-bold bg-red-100 px-2 py-1 rounded">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-red-800 mb-1">
                Issuing Organization * <span className="text-red-600">(Required)</span>
              </label>
              <input
                type="text"
                value={newCertification.issuer || ''}
                onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                className={`w-full px-3 py-2 border-2 rounded-md focus:ring-red-500 focus:border-red-500 ${
                  errors.issuer ? 'border-red-500 bg-red-50' : 'border-red-300'
                }`}
                placeholder="e.g., Amazon Web Services"
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-800 font-bold bg-red-100 px-2 py-1 rounded">{errors.issuer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-red-800 mb-1">
                Credential ID (Optional)
              </label>
              <input
                type="text"
                value={newCertification.credentialId || ''}
                onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                className="w-full px-3 py-2 border-2 border-red-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., ABC123XYZ"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-red-800 mb-1">
                Issue Date * <span className="text-red-600">(Required)</span>
              </label>
              <input
                type="month"
                value={newCertification.date || ''}
                onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                className={`w-full px-3 py-2 border-2 rounded-md focus:ring-red-500 focus:border-red-500 ${
                  errors.date ? 'border-red-500 bg-red-50' : 'border-red-300'
                }`}
                max={new Date().toISOString().slice(0, 7)}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-800 font-bold bg-red-100 px-2 py-1 rounded">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-red-800 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="month"
                value={newCertification.expiryDate || ''}
                onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                className={`w-full px-3 py-2 border-2 rounded-md focus:ring-red-500 focus:border-red-500 ${
                  errors.expiryDate ? 'border-red-500 bg-red-50' : 'border-red-300'
                }`}
                min={newCertification.date || undefined}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-800 font-bold bg-red-100 px-2 py-1 rounded">{errors.expiryDate}</p>
              )}
              <p className="mt-1 text-xs text-red-700 font-medium">
                Leave blank if certification doesn't expire
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {editingIndex !== null && (
              <button
                onClick={() => {
                  setEditingIndex(null)
                  setNewCertification({
                    name: '',
                    issuer: '',
                    date: '',
                    expiryDate: '',
                    credentialId: ''
                  })
                  setErrors({})
                }}
                className="px-6 py-2 text-sm font-bold text-red-700 bg-red-100 border-2 border-red-300 rounded-md hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingIndex !== null ? handleUpdateCertification : handleAddCertification}
              className="px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"
            >
              {editingIndex !== null ? '✅ Update Certification' : '➕ Add Certification'}
            </button>
          </div>
        </div>
      )}

      {certifications.items.length >= 10 && editingIndex === null && (
        <div className="text-sm text-red-700 font-bold bg-red-100 p-3 rounded border border-red-300">
          ⚠️ Maximum 10 certifications allowed
        </div>
      )}
    </div>
  )
}
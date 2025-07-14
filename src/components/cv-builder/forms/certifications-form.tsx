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
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Certifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your professional certifications and licenses
        </p>
      </div>

      {/* Existing Certifications */}
      {certifications.items.length > 0 && (
        <div className="space-y-3">
          {certifications.items.map((cert, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-4 relative">
              <div className="pr-20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-foreground">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Issued: {formatDateForDisplay(cert.date)}
                      {cert.expiryDate && (
                        <span className={isExpired(cert.expiryDate) ? 'text-destructive' : ''}>
                          {' • '}Expires: {formatDateForDisplay(cert.expiryDate)}
                          {isExpired(cert.expiryDate) && ' (Expired)'}
                        </span>
                      )}
                    </div>
                    {cert.credentialId && (
                      <div className="text-sm text-muted-foreground">
                        Credential ID: {cert.credentialId}
                      </div>
                    )}
                  </div>
                  {isExpired(cert.expiryDate) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                      Expired
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 space-x-2">
                <button
                  onClick={() => handleEditCertification(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCertification(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
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
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">
            {editingIndex !== null ? 'Edit Certification' : 'Add Certification'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Certification Name *
              </label>
              <input
                type="text"
                value={newCertification.name || ''}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={newCertification.issuer || ''}
                onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.issuer ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Amazon Web Services"
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-600">{errors.issuer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Credential ID (Optional)
              </label>
              <input
                type="text"
                value={newCertification.credentialId || ''}
                onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ABC123XYZ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Issue Date *
              </label>
              <input
                type="month"
                value={newCertification.date || ''}
                onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
                max={new Date().toISOString().slice(0, 7)}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="month"
                value={newCertification.expiryDate || ''}
                onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                }`}
                min={newCertification.date || undefined}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank if certification doesn't expire
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
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
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
            )}
            <button
              onClick={editingIndex !== null ? handleUpdateCertification : handleAddCertification}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update Certification' : 'Add Certification'}
            </button>
          </div>
        </div>
      )}

      {certifications.items.length >= 10 && editingIndex === null && (
        <div className="text-sm text-muted-foreground italic">
          Maximum 10 certifications allowed
        </div>
      )}
    </div>
  )
}
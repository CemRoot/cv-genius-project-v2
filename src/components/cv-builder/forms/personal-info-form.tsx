'use client'

import React, { useState } from 'react'
import { useCvBuilder } from '@/contexts/cv-builder-context'
import { 
  CvBuilderPersonalSchema, 
  validateIrishPhone, 
  validateDublinAddress, 
  formatIrishPhone 
} from '@/types/cv-builder'
import { z } from 'zod'

interface ValidationErrors {
  fullName?: string
  title?: string
  email?: string
  phone?: string
  address?: string
}

export function PersonalInfoForm() {
  const { document, updatePersonal } = useCvBuilder()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const personal = document.personal

  const validateField = (field: keyof typeof personal, value: string): string | undefined => {
    try {
      const fieldSchema = CvBuilderPersonalSchema.shape[field]
      fieldSchema.parse(value)
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Invalid value'
    }
  }

  const handleFieldChange = (field: keyof typeof personal, value: string) => {
    // Update the context
    updatePersonal({ [field]: value })

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }))

    // Validate the field and update errors
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))

    // Special handling for phone formatting
    if (field === 'phone' && !error && value.length > 8) {
      const formatted = formatIrishPhone(value)
      if (formatted !== value) {
        updatePersonal({ phone: formatted })
      }
    }
  }

  const handleBlur = (field: keyof typeof personal) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, personal[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const getFieldError = (field: keyof typeof personal): string | undefined => {
    return touched[field] ? errors[field] : undefined
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Enter your contact details using Dublin/Irish formatting conventions.
        </p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={personal.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder="e.g., John O'Connor"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('fullName') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {getFieldError('fullName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('fullName')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your full legal name as it appears on official documents
          </p>
        </div>

        {/* Professional Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Professional Title *
          </label>
          <input
            type="text"
            id="title"
            value={personal.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            placeholder="e.g., Senior Software Developer"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('title') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {getFieldError('title') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your current job title or the position you're targeting
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={personal.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="e.g., john.oconnor@email.com"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('email') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use a professional email address
          </p>
        </div>

        {/* Irish Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              value={personal.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+353 87 123 4567"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('phone') 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {validateIrishPhone(personal.phone) && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Irish format: +353 XX XXX XXXX</p>
            <p>• Mobile: +353 8X XXX XXXX or +353 9X XXX XXXX</p>
            <p>• Dublin landline: +353 1 XXX XXXX</p>
          </div>
        </div>

        {/* Dublin Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            id="address"
            rows={3}
            value={personal.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="e.g., 123 Main Street, Dublin 2, Ireland"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              getFieldError('address') 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {getFieldError('address') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('address')}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            <p>Must include Dublin and Ireland for ATS compliance</p>
            <p>Examples:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Dublin 1, Ireland</li>
              <li>Ballsbridge, Dublin 4, Ireland</li>
              <li>123 O'Connell Street, Dublin 1, Ireland</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Please fix the following issues:
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => error && touched[field] && (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {Object.keys(errors).length === 0 && Object.values(touched).some(Boolean) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Personal information is valid and Dublin-formatted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Dublin CV Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use your full legal name, including Irish prefixes (O', Mc, etc.)</li>
          <li>• Include your Dublin postal code (Dublin 1, Dublin 2, etc.)</li>
          <li>• Phone numbers should use the +353 international format</li>
          <li>• Consider adding your LinkedIn profile for Irish recruiters</li>
        </ul>
      </div>
    </div>
  )
}
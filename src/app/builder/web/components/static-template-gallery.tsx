'use client'

import React from 'react'

interface Template {
  id: string
  name: string
  description: string
  preview: string
  tags: string[]
}

const templates: Template[] = [
  {
    id: 'dublin-classic',
    name: 'Dublin Classic',
    description: 'Traditional CV format popular with Dublin employers. Clean, professional layout with emphasis on experience.',
    preview: '/api/placeholder/300/400',
    tags: ['ATS-Friendly', 'Professional', 'Dublin Standard']
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Modern minimal design perfect for tech roles in Dublin. Highlights skills and projects prominently.',
    preview: '/api/placeholder/300/400',
    tags: ['Tech', 'Modern', 'Skills-Focused']
  },
  {
    id: 'finance-executive',
    name: 'Finance Executive',
    description: 'Executive-level template designed for finance and business roles in Dublin\'s IFSC.',
    preview: '/api/placeholder/300/400',
    tags: ['Executive', 'Finance', 'IFSC']
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Eye-catching design for creative professionals while maintaining ATS compatibility.',
    preview: '/api/placeholder/300/400',
    tags: ['Creative', 'Design', 'Portfolio']
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Academic CV format for university and research positions in Dublin.',
    preview: '/api/placeholder/300/400',
    tags: ['Academic', 'Research', 'University']
  },
  {
    id: 'graduate-entry',
    name: 'Graduate Entry',
    description: 'Perfect for new graduates entering the Dublin job market. Focuses on education and potential.',
    preview: '/api/placeholder/300/400',
    tags: ['Graduate', 'Entry-Level', 'Student']
  }
]

interface StaticTemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
}

export function StaticTemplateGallery({ onSelectTemplate }: StaticTemplateGalleryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CV Template Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our collection of ATS-friendly CV templates designed specifically for Dublin job market.
            All templates follow Irish formatting standards and are optimized for applicant tracking systems.
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['All', 'ATS-Friendly', 'Professional', 'Tech', 'Finance', 'Creative', 'Academic', 'Graduate'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Template Preview */}
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  {/* Placeholder for template preview */}
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">{template.name}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded">
                    Dublin Ready
                  </span>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectTemplate(template.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Need More Customization?
            </h2>
            <p className="text-gray-600 mb-6">
              Try our interactive Dublin CV Builder for step-by-step guidance, real-time ATS optimization, 
              and Dublin-specific formatting assistance.
            </p>
            <a
              href="/cv-builder"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Try Interactive Builder
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            All Templates Include
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ATS Compatible</h3>
              <p className="text-sm text-gray-600">Passes through tracking systems</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Dublin Format</h3>
              <p className="text-sm text-gray-600">Irish standards & conventions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">PDF Export</h3>
              <p className="text-sm text-gray-600">High-quality download ready</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Fast Setup</h3>
              <p className="text-sm text-gray-600">Ready in minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
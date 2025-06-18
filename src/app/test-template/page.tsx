'use client'

import { useState, useEffect } from 'react'
import { dublinTemplateManager } from '@/lib/cover-letter-templates-new'

export default function TestTemplatePage() {
  const [templateHTML, setTemplateHTML] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const sampleContent = {
        name: 'John O\'Sullivan',
        title: 'Software Developer', 
        email: 'john@example.com',
        phone: '+353 1 234 5678',
        address: 'Dublin 2, Ireland',
        date: new Date().toLocaleDateString(),
        salutation: 'Dear Hiring Manager',
        opening: 'I am writing to express my interest in this position.',
        body: ['This is the first paragraph.', 'This is the second paragraph.'],
        closing: 'Thank you for your consideration.',
        signature: 'John O\'Sullivan'
      }

      console.log('Testing template generation...')
      const html = dublinTemplateManager.generateHTML('dublin-professional', sampleContent)
      console.log('Generated HTML:', html)
      setTemplateHTML(html)
    } catch (err) {
      console.error('Template generation error:', err)
      setError(err.message || 'Unknown error')
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Template Generation Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">HTML Length: {templateHTML.length}</h2>
      </div>
      
      <div className="border p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Preview:</h3>
        <div 
          style={{ 
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            width: '200%',
            height: '200%',
            border: '1px solid #ccc'
          }}
          dangerouslySetInnerHTML={{ __html: templateHTML }}
        />
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Raw HTML:</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
          {templateHTML}
        </pre>
      </div>
    </div>
  )
}
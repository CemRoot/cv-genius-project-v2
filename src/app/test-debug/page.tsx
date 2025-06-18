'use client'

import { useState, useEffect } from 'react'
import { dublinTemplateManager } from '@/lib/cover-letter-templates-new'

export default function TestDebugPage() {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const testResults: any[] = []
    
    // Test all templates with baseTemplate
    const templates = dublinTemplateManager.getAllTemplates()
    console.log('🚀 Testing', templates.length, 'templates')
    
    const sampleContent = {
      name: 'Test User',
      title: 'Software Developer',
      email: 'test@example.com', 
      phone: '+353 1 234 5678',
      address: 'Dublin, Ireland',
      date: new Date().toLocaleDateString(),
      salutation: 'Dear Hiring Manager',
      opening: 'I am writing to express my interest in this position.',
      body: ['First paragraph of the cover letter.', 'Second paragraph with more details.'],
      closing: 'Thank you for your consideration.',
      signature: 'Test User'
    }

    templates.forEach(template => {
      console.log(`\n🎯 Testing template: ${template.name}`)
      console.log(`🔗 Base template: ${template.baseTemplate || 'none'}`)
      
      try {
        const html = dublinTemplateManager.generateHTML(template.id, sampleContent)
        const result = {
          id: template.id,
          name: template.name,
          baseTemplate: template.baseTemplate,
          htmlLength: html.length,
          hasHtml: html.length > 0,
          error: null,
          preview: html.substring(0, 200)
        }
        
        console.log(`✅ ${template.name}: ${html.length} characters`)
        testResults.push(result)
        
      } catch (error) {
        console.error(`❌ ${template.name}: ${error}`)
        testResults.push({
          id: template.id,
          name: template.name,
          baseTemplate: template.baseTemplate,
          htmlLength: 0,
          hasHtml: false,
          error: error.message,
          preview: ''
        })
      }
    })
    
    setResults(testResults)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Template Debug Results</h1>
      
      <div className="space-y-4">
        {results.map(result => (
          <div 
            key={result.id} 
            className={`border rounded p-4 ${result.hasHtml ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{result.name}</h3>
              <span className={`px-2 py-1 rounded text-sm ${result.hasHtml ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {result.hasHtml ? '✅ Working' : '❌ Failed'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <p><strong>ID:</strong> {result.id}</p>
              <p><strong>Base Template:</strong> {result.baseTemplate || 'none'}</p>
              <p><strong>HTML Length:</strong> {result.htmlLength} characters</p>
              {result.error && <p className="text-red-600"><strong>Error:</strong> {result.error}</p>}
            </div>
            
            {result.hasHtml && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">HTML Preview:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">{result.preview}...</code>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p>Working templates: {results.filter(r => r.hasHtml).length} / {results.length}</p>
        <p>Failed templates: {results.filter(r => !r.hasHtml).length} / {results.length}</p>
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { dublinTemplateManager } from '@/lib/cover-letter-templates-new'

export default function TestTemplatesPage() {
  useEffect(() => {
    // Test template manager
    console.log('🎯 Testing Dublin Template Manager...')
    
    // Get all templates
    const allTemplates = dublinTemplateManager.getAllTemplates()
    console.log('📊 Total templates:', allTemplates.length)
    console.log('📋 Template IDs:', allTemplates.map(t => t.id))
    
    // Test specific template retrieval
    const testIds = ['dublin-professional', 'trinity-modern', 'corporate-dublin']
    
    testIds.forEach(id => {
      console.log(`\n🔍 Testing template: ${id}`)
      const template = dublinTemplateManager.getTemplate(id)
      
      if (template) {
        console.log(`✅ Found: ${template.name}`)
        console.log(`   Base template: ${template.baseTemplate || 'none'}`)
        console.log(`   Category: ${template.category}`)
        console.log(`   Has styles: ${!!template.styles}`)
        
        // Test HTML generation
        const testContent = {
          name: 'Test User',
          title: 'Developer',
          email: 'test@test.com',
          phone: '123-456-7890',
          address: 'Dublin',
          date: new Date().toLocaleDateString(),
          salutation: 'Dear Hiring Manager',
          opening: 'Test opening.',
          body: ['Test body 1.', 'Test body 2.'],
          closing: 'Test closing.',
          signature: 'Test User'
        }
        
        const html = dublinTemplateManager.generateHTML(id, testContent)
        console.log(`   HTML length: ${html.length}`)
        console.log(`   HTML preview: ${html.substring(0, 100)}...`)
      } else {
        console.log(`❌ Not found: ${id}`)
      }
    })
    
    // List all available template keys
    console.log('\n📋 All available templates:')
    allTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.id})`)
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Template Test Page</h1>
      <p>Check browser console for template test results</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="font-mono text-sm">Open Developer Tools → Console to see test results</p>
      </div>
    </div>
  )
}
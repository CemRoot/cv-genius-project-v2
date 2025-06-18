#!/usr/bin/env node

// Cover Letter Template System Test Script
// Run with: npx tsx src/scripts/test-templates.ts

import { templateManager, CoverLetterContent } from '../lib/cover-letter-templates'

// Test data
const sampleData: CoverLetterContent = {
  name: 'John Doe',
  title: 'Frontend Developer',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  address: 'San Francisco, CA',
  recipient: {
    name: 'Jane Smith',
    title: 'Hiring Manager',
    company: 'Tech Corp',
    address: '123 Tech Street, SF, CA 94105'
  },
  date: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  salutation: 'Dear Ms. Smith',
  opening: 'I am writing to express my strong interest in the Frontend Developer position at Tech Corp. After reviewing the position requirements, I believe that my qualifications and experience make me an ideal candidate.',
  body: [
    'With over 5 years of experience in modern web development, I have successfully delivered numerous projects using React, TypeScript, and Node.js. My expertise includes responsive design, performance optimization, and creating user-centric interfaces.',
    'In my current role at StartupXYZ, I have led the development of a customer dashboard that serves over 100,000 users daily. I implemented a micro-frontend architecture that improved page load times by 40% and reduced development cycle time by 30%.',
    'I am particularly drawn to Tech Corp because of your commitment to innovation and your focus on creating products that make a real impact. Your recent work on accessibility features aligns perfectly with my passion for inclusive design.'
  ],
  closing: 'Thank you for considering my application. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to Tech Corp\'s continued success. I look forward to hearing from you.',
  signature: 'Sincerely,\nJohn Doe'
}

async function testTemplates() {
  console.log('🧪 Cover Letter Template System Test\n')
  
  // Test 1: Get all templates
  console.log('📋 Testing template retrieval...')
  const allTemplates = templateManager.getAllTemplates()
  console.log(`✅ Found ${allTemplates.length} templates`)
  
  // Test 2: Get recommended templates
  const recommendedTemplates = templateManager.getRecommendedTemplates()
  console.log(`⭐ Found ${recommendedTemplates.length} recommended templates`)
  
  // Test 3: Get templates by category
  const categories = templateManager.getTemplateCategories()
  console.log(`📂 Available categories: ${categories.join(', ')}`)
  
  // Test 4: Search templates
  const searchResults = templateManager.searchTemplates('modern')
  console.log(`🔍 Search for "modern": ${searchResults.length} results`)
  
  // Test 5: Generate HTML for each template
  console.log('\n🎨 Testing HTML generation for each template...')
  for (const template of allTemplates.slice(0, 5)) { // Test first 5 templates
    try {
      const html = templateManager.generateHTML(template.id, sampleData)
      const css = templateManager.generateCSS(template.id)
      
      console.log(`✅ ${template.name} (${template.id}): HTML ${html.length} chars, CSS ${css.length} chars`)
      
      // Save sample output for manual inspection
      if (template.id === 'cascade') {
        const fs = await import('fs')
        const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Test - ${template.name}</title>
  <style>${css}</style>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      background: #f5f5f5; 
      font-family: Arial, sans-serif;
    }
    .preview-container {
      max-width: 8.5in;
      background: white;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="preview-container">
    ${html}
  </div>
</body>
</html>`
        
        fs.writeFileSync(`template-${template.id}-test.html`, fullHTML)
        console.log(`   📄 Sample saved as template-${template.id}-test.html`)
      }
    } catch (error) {
      console.log(`❌ ${template.name} (${template.id}): ERROR - ${error}`)
    }
  }
  
  // Test 6: Test template configurations
  console.log('\n⚙️  Testing template configurations...')
  for (const template of allTemplates) {
    const issues = []
    
    if (!template.name) issues.push('missing name')
    if (!template.category) issues.push('missing category')
    if (!template.styles.colors.primary) issues.push('missing primary color')
    if (!template.layout) issues.push('missing layout')
    
    if (issues.length > 0) {
      console.log(`⚠️  ${template.id}: ${issues.join(', ')}`)
    }
  }
  
  // Test 7: Performance test
  console.log('\n⚡ Performance test...')
  const startTime = Date.now()
  for (let i = 0; i < 100; i++) {
    templateManager.generateHTML('cascade', sampleData)
  }
  const endTime = Date.now()
  console.log(`✅ Generated 100 templates in ${endTime - startTime}ms (avg: ${(endTime - startTime) / 100}ms per template)`)
  
  // Test 8: Template features summary
  console.log('\n📊 Template Summary:')
  const byCategory = allTemplates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} templates`)
  })
  
  const recommendedCount = allTemplates.filter(t => t.recommended).length
  console.log(`   Recommended: ${recommendedCount}/${allTemplates.length} templates`)
  
  console.log('\n🎉 All tests completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Check template-cascade-test.html in your browser')
  console.log('   2. Start the dev server: npm run dev')
  console.log('   3. Visit: http://localhost:3000/cover-letter/choose-template')
  console.log('   4. Test the template selection interface')
}

// Run tests
testTemplates().catch(console.error)
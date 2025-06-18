// Quick template debug test
const { dublinTemplateManager } = require('./src/lib/cover-letter-templates-new');

const testData = {
  name: 'Test User',
  title: 'Developer',
  email: 'test@test.com',
  phone: '123-456-7890', 
  address: 'Dublin',
  date: '2025-01-01',
  salutation: 'Dear Hiring Manager',
  opening: 'Test opening paragraph.',
  body: ['Test body paragraph 1.', 'Test body paragraph 2.'],
  closing: 'Test closing paragraph.',
  signature: 'Test Signature'
};

console.log('🔍 Testing Dublin Template Manager...');
console.log('Available templates:', dublinTemplateManager.getAllTemplates().map(t => t.id));

const html = dublinTemplateManager.generateHTML('dublin-professional', testData);
console.log('✅ HTML Generated Length:', html.length);
console.log('📋 HTML Preview (first 300 chars):', html.substring(0, 300));

if (html.length === 0) {
  console.log('❌ No HTML generated!');
} else {
  console.log('✅ HTML generated successfully');
}
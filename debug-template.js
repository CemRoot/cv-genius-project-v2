// Simple template debug test
console.log('🔍 Starting template debug...');

// Test simple data
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

// Manual template HTML creation test
const testHTML = `
  <div class="cover-letter-wrapper template-cascade" style="display: table; width: 100%; table-layout: fixed; min-height: 792px; font-family: 'Century Gothic', sans-serif; font-size: 10px; line-height: 15px;">
    <div class="sidebar" style="display: table-cell; width: 154px; background: #102a73; color: white; padding: 15px; vertical-align: top;">
      <h2 class="name" style="font-size: 27px; line-height: 33px; font-weight: bold; margin-bottom: 10px;">${testData.name}</h2>
      <p class="title" style="margin-bottom: 15px;">${testData.title}</p>
      <div class="contact">
        <p style="margin: 4px 0;">${testData.email}</p>
        <p style="margin: 4px 0;">${testData.phone}</p>
        <p style="margin: 4px 0;">${testData.address}</p>
      </div>
    </div>
    <div class="main-content" style="display: table-cell; padding: 15px; letter-spacing: 0.2px; vertical-align: top;">
      <div class="date" style="text-align: right; margin-bottom: 15px;">${testData.date}</div>
      <p class="salutation" style="margin-bottom: 15px;">${testData.salutation}</p>
      <p class="opening" style="margin-bottom: 12px;">${testData.opening}</p>
      <p class="body-paragraph" style="margin-bottom: 12px;">${testData.body[0]}</p>
      <p class="body-paragraph" style="margin-bottom: 12px;">${testData.body[1]}</p>
      <p class="closing" style="margin-bottom: 20px;">${testData.closing}</p>
      <div class="signature">
        <p style="margin-bottom: 30px;">Yours sincerely,</p>
        <p style="font-weight: bold;">${testData.signature}</p>
      </div>
    </div>
  </div>
`;

console.log('✅ Test HTML generated, length:', testHTML.length);
console.log('📋 Test HTML preview:', testHTML.substring(0, 200));

// Create a preview element
const previewContainer = document.createElement('div');
previewContainer.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  height: 400px;
  background: white;
  border: 2px solid red;
  z-index: 9999;
  overflow: hidden;
  transform: scale(0.3);
  transform-origin: top left;
`;

previewContainer.innerHTML = testHTML;
document.body.appendChild(previewContainer);

console.log('🎯 Manual test template added to page');
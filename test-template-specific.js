// Test specific template HTML generation
fetch('http://localhost:3000/api/cover-letter-templates')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', data.success);
    console.log('📊 Templates count:', data.templates.length);
    
    // Find Dublin Professional template
    const dublinPro = data.templates.find(t => t.id === 'dublin-professional');
    if (dublinPro) {
      console.log('🎯 Found Dublin Professional:', dublinPro.name);
      console.log('🔗 Base template:', dublinPro.baseTemplate);
      console.log('🎨 Has sidebar style:', !!dublinPro.styles.sidebar);
      console.log('🎨 Has mainContent style:', !!dublinPro.styles.mainContent);
    }
    
    // Find Trinity Modern template  
    const trinityModern = data.templates.find(t => t.id === 'trinity-modern');
    if (trinityModern) {
      console.log('🎯 Found Trinity Modern:', trinityModern.name);
      console.log('🔗 Base template:', trinityModern.baseTemplate);
      console.log('🎨 Has nameSection style:', !!trinityModern.styles.nameSection);
    }
    
    // Show first few templates
    console.log('📋 First 3 templates:');
    data.templates.slice(0, 3).forEach(t => {
      console.log(`  - ${t.name} (${t.id}) -> base: ${t.baseTemplate || 'none'}`);
    });
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
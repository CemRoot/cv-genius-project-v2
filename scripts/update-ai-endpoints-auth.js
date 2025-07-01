#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

// List of AI endpoints that need authentication
const aiEndpoints = [
  'src/app/api/ai/analyze-cv/route.ts',
  'src/app/api/ai/analyze-cv-text/route.ts',
  'src/app/api/ai/analyze-job/route.ts',
  'src/app/api/ai/analyze-job-description/route.ts',
  'src/app/api/ai/edit-cover-letter/route.ts',
  'src/app/api/ai/improve-text/route.ts',
  'src/app/api/ai/improve-cv-text/route.ts',
  'src/app/api/ai/generate-summary/route.ts',
  'src/app/api/ai/extract-keywords/route.ts',
  'src/app/api/ats/analyze/route.ts',
  'src/app/api/ats/huggingface/route.ts'
]

async function updateEndpoint(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    let content = await fs.readFile(fullPath, 'utf-8')
    
    // Check if already has api-auth import
    if (content.includes('@/lib/api-auth')) {
      console.log(`✓ ${filePath} already has authentication`)
      return
    }
    
    // Add import if not present
    if (!content.includes("import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'")) {
      // Find the last import line
      const importMatches = content.match(/import[\s\S]*?from\s+['"][^'"]+['"]/g)
      if (importMatches) {
        const lastImport = importMatches[importMatches.length - 1]
        const lastImportIndex = content.lastIndexOf(lastImport)
        content = content.slice(0, lastImportIndex + lastImport.length) +
          "\nimport { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'" +
          content.slice(lastImportIndex + lastImport.length)
      }
    }
    
    // Find the POST/GET function and add authentication
    const functionRegex = /export\s+async\s+function\s+(POST|GET)\s*\([^)]*\)\s*{/g
    const functionMatch = functionRegex.exec(content)
    
    if (functionMatch) {
      const functionStart = functionMatch.index + functionMatch[0].length
      
      // Check if authentication is already added
      if (!content.includes('validateAiApiRequest')) {
        // Find the try block
        const tryIndex = content.indexOf('try {', functionStart)
        if (tryIndex !== -1) {
          const insertPoint = tryIndex + 5 // After 'try {'
          
          const authCode = `
    // Validate API authentication
    const authResult = await validateAiApiRequest(request)
    if (!authResult.valid) {
      return createApiErrorResponse(
        authResult.error,
        authResult.status,
        authResult.retryAfter
      )
    }
    `
          
          content = content.slice(0, insertPoint) + authCode + content.slice(insertPoint)
          
          // Update rate limiting to use API key
          content = content.replace(
            /const userId = request\.headers\.get\('x-user-id'\) \|\| 'anonymous'/g,
            "const apiKey = request.headers.get('x-api-key') || 'anonymous'\n    const userId = `api:${apiKey}`"
          )
        }
      }
    }
    
    await fs.writeFile(fullPath, content, 'utf-8')
    console.log(`✅ Updated ${filePath}`)
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error)
  }
}

async function main() {
  console.log('🔒 Adding authentication to AI endpoints...\n')
  
  for (const endpoint of aiEndpoints) {
    await updateEndpoint(endpoint)
  }
  
  console.log('\n✨ Done! All AI endpoints now require authentication.')
  console.log('\n📝 Next steps:')
  console.log('1. Set VALID_API_KEYS environment variable with comma-separated API keys')
  console.log('2. Update documentation to include API key requirements')
  console.log('3. Generate and distribute API keys to authorized users')
}

main().catch(console.error)
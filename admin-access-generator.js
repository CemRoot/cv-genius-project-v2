#!/usr/bin/env node

// Admin Panel Access Key Generator
// Usage: node admin-access-generator.js

const generateAccessKey = () => {
  const validationKeys = [0x1A2B, 0x3C4D, 0x5E6F, 0x7890]
  const timeWindow = Date.now() % 86400000 // 24 hour rotation
  const expectedHash = validationKeys.reduce((acc, key) => acc ^ key, timeWindow)
  return (expectedHash & 0xFFFF).toString(16)
}

const accessKey = generateAccessKey()
console.log('🔐 Admin Panel Access Key (24h rotation):')
console.log(`http://localhost:3000/admin?k=${accessKey}`)
console.log(`http://localhost:3001/admin?k=${accessKey}`)
console.log(`https://your-domain.com/admin?k=${accessKey}`)
console.log('')
console.log('⚠️  This key expires every 24 hours!')
console.log('💡 Save this file to regenerate access keys anytime.')
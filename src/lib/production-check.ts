// Production Readiness Check
// This file helps ensure the application is properly configured for production

interface ProductionCheckResult {
  isReady: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

export function checkProductionReadiness(): ProductionCheckResult {
  const warnings: string[] = []
  const errors: string[] = []
  const recommendations: string[] = []

  // Environment Variables Check
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ]

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (!value || value === `your_${envVar.toLowerCase().replace('_', '_')}_here`) {
      errors.push(`Missing or placeholder value for ${envVar}`)
    }
  }

  // Optional but recommended environment variables
  const recommendedEnvVars = [
    'HUGGINGFACE_API_KEY',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'ADMIN_IP_WHITELIST'
  ]

  for (const envVar of recommendedEnvVars) {
    if (!process.env[envVar]) {
      recommendations.push(`Consider setting ${envVar} for enhanced functionality`)
    }
  }

  // Development-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_TELEMETRY_DISABLED !== '1') {
      recommendations.push('Consider disabling Next.js telemetry in production')
    }

    if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      warnings.push('APP_URL still points to localhost in production')
    }
  }

  // Security checks
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('JWT_SECRET must be changed from default value')
  }

  if (process.env.NEXTAUTH_SECRET === 'your_secret_key_here') {
    errors.push('NEXTAUTH_SECRET must be changed from default value')
  }

  return {
    isReady: errors.length === 0,
    warnings,
    errors,
    recommendations
  }
}

// Development helper function
export function logProductionChecks(): void {
  if (process.env.NODE_ENV === 'development') {
    const result = checkProductionReadiness()
    
    if (!result.isReady) {
      console.warn('⚠️  Production readiness issues found:')
      result.errors.forEach(error => console.error('❌', error))
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => console.warn('⚠️ ', warning))
    }
    
    if (result.recommendations.length > 0) {
      result.recommendations.forEach(rec => console.info('💡', rec))
    }
    
    if (result.isReady && result.warnings.length === 0 && result.recommendations.length === 0) {
      console.log('✅ Production ready!')
    }
  }
}

export default checkProductionReadiness 
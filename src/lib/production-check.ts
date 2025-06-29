// Production Readiness Check
// This file helps ensure the application is properly configured for production

import { validateEnvironment } from './env-validation'

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

  // Use the new environment validation system
  const envValidation = validateEnvironment()
  
  // Add validation errors and warnings
  errors.push(...envValidation.errors)
  warnings.push(...envValidation.warnings)

  // Additional production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Check for localhost URLs
    if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      errors.push('NEXT_PUBLIC_APP_URL still points to localhost in production')
    }

    // Check telemetry
    if (process.env.NEXT_TELEMETRY_DISABLED !== '1') {
      recommendations.push('Consider setting NEXT_TELEMETRY_DISABLED=1 in production')
    }

    // Check for development features
    if (process.env.FORCE_ENV_VALIDATION === 'true') {
      warnings.push('FORCE_ENV_VALIDATION is enabled in production - this may impact performance')
    }
  }

  // Vercel-specific recommendations
  if (process.env.VERCEL) {
    if (!process.env.VERCEL_TOKEN) {
      recommendations.push('Consider setting VERCEL_TOKEN for automatic environment sync')
    }
    
    recommendations.push('Remember to set all environment variables in Vercel Dashboard')
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
/**
 * Runtime Environment Variable Validation
 * Ensures all required environment variables are properly set in production
 */

interface EnvVar {
  name: string
  required: boolean
  sensitive?: boolean
  pattern?: RegExp
  minLength?: number
  description?: string
}

const envVars: EnvVar[] = [
  // Security Keys
  {
    name: 'JWT_SECRET',
    required: true,
    sensitive: true,
    minLength: 32,
    description: 'JWT token signing secret (min 32 chars)'
  },
  {
    name: 'PASSWORD_ENCRYPTION_KEY',
    required: true,
    sensitive: true,
    pattern: /^[a-f0-9]{64}$/,
    description: '64-character hex string for password encryption'
  },
  {
    name: 'AUDIT_ENCRYPTION_KEY',
    required: true,
    sensitive: true,
    pattern: /^[a-f0-9]{64}$/,
    description: '64-character hex string for audit log encryption'
  },
  
  // Admin Authentication
  {
    name: 'ADMIN_USERNAME',
    required: true,
    sensitive: true,
    minLength: 4,
    description: 'Admin panel username'
  },
  {
    name: 'ADMIN_PWD_HASH_B64',
    required: true,
    sensitive: true,
    pattern: /^[A-Za-z0-9+/]+=*$/,
    description: 'Base64 encoded bcrypt hash of admin password'
  },
  {
    name: 'ADMIN_IP_WHITELIST',
    required: false,
    description: 'Comma-separated list of whitelisted IPs for admin access'
  },
  
  // Admin Keys
  {
    name: 'ADMIN_KEY_1',
    required: true,
    sensitive: true,
    minLength: 16,
    description: 'Admin security key 1'
  },
  {
    name: 'ADMIN_KEY_2',
    required: true,
    sensitive: true,
    minLength: 16,
    description: 'Admin security key 2'
  },
  {
    name: 'ADMIN_KEY_3',
    required: true,
    sensitive: true,
    minLength: 16,
    description: 'Admin security key 3'
  },
  {
    name: 'ADMIN_KEY_4',
    required: true,
    sensitive: true,
    minLength: 16,
    description: 'Admin security key 4'
  },
  
  // API Keys
  {
    name: 'NEXT_PUBLIC_GEMINI_API_KEY',
    required: true,
    sensitive: true,
    pattern: /^AIza[A-Za-z0-9_-]{35}$/,
    description: 'Google Gemini API key'
  },
  {
    name: 'VERCEL_TOKEN',
    required: false,
    sensitive: true,
    description: 'Vercel API token for environment sync'
  },
  
  // Application Settings
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    pattern: /^https?:\/\/.+$/,
    description: 'Full application URL'
  },
  {
    name: 'NEXT_PUBLIC_SITE_NAME',
    required: false,
    description: 'Site name for branding'
  },
  
  // Advertisement Configuration
  {
    name: 'NEXT_PUBLIC_ADSENSE_CLIENT',
    required: false,
    pattern: /^ca-pub-\d+$/,
    description: 'Google AdSense publisher ID'
  },
  {
    name: 'NEXT_PUBLIC_MONETAG_ZONE_TOP',
    required: false,
    pattern: /^\d+$/,
    description: 'Monetag top banner zone ID'
  },
  {
    name: 'NEXT_PUBLIC_MONETAG_ZONE_SIDEBAR',
    required: false,
    pattern: /^\d+$/,
    description: 'Monetag sidebar zone ID'
  },
  {
    name: 'NEXT_PUBLIC_MONETAG_ZONE_BOTTOM',
    required: false,
    pattern: /^\d+$/,
    description: 'Monetag bottom banner zone ID'
  },
  {
    name: 'NEXT_PUBLIC_MONETAG_ZONE_STICKY',
    required: false,
    pattern: /^\d+$/,
    description: 'Monetag sticky ad zone ID'
  }
]

class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private errors: string[] = []
  private warnings: string[] = []
  
  private constructor() {}
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }
  
  validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    this.errors = []
    this.warnings = []
    
    // Skip validation in development unless explicitly requested
    if (process.env.NODE_ENV === 'development' && process.env.FORCE_ENV_VALIDATION !== 'true') {
      return { isValid: true, errors: [], warnings: [] }
    }
    
    envVars.forEach(envVar => {
      const value = process.env[envVar.name]
      
      // Check if required variable exists
      if (envVar.required && !value) {
        this.errors.push(`Missing required environment variable: ${envVar.name} - ${envVar.description || ''}`)
        return
      }
      
      // Skip further validation if not set and not required
      if (!value) return
      
      // Check minimum length
      if (envVar.minLength && value.length < envVar.minLength) {
        this.errors.push(
          `${envVar.name} must be at least ${envVar.minLength} characters long (current: ${value.length})`
        )
      }
      
      // Check pattern
      if (envVar.pattern && !envVar.pattern.test(value)) {
        this.errors.push(
          `${envVar.name} has invalid format. ${envVar.description || ''}`
        )
      }
      
      // Check for placeholder values in production
      if (process.env.NODE_ENV === 'production') {
        const placeholderPatterns = [
          /your-/i,
          /change-this/i,
          /replace-/i,
          /example/i,
          /placeholder/i,
          /todo/i,
          /xxx/i,
          /123456/,
          /abcdef/i
        ]
        
        if (placeholderPatterns.some(pattern => pattern.test(value))) {
          this.errors.push(
            `${envVar.name} appears to contain a placeholder value in production!`
          )
        }
      }
    })
    
    // Additional security checks
    if (process.env.NODE_ENV === 'production') {
      // Check if admin password hash is the default one
      const adminHash = process.env.ADMIN_PWD_HASH_B64
      if (adminHash) {
        const decodedHash = Buffer.from(adminHash, 'base64').toString()
        // Check if it's the default hash from the code
        if (decodedHash === '$2b$10$Tqa0S3UvitFTWIpNp0HjPuT5wfPjIHp3nTS.0TVby4WH9OcyTY2j.') {
          this.errors.push('CRITICAL: Default admin password hash detected in production!')
        }
      }
      
      // Warn if no IP whitelist in production
      if (!process.env.ADMIN_IP_WHITELIST) {
        this.warnings.push('No IP whitelist configured for admin panel - consider adding ADMIN_IP_WHITELIST')
      }
    }
    
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    }
  }
  
  /**
   * Throws an error if validation fails - use this in critical paths
   */
  validateOrThrow(): void {
    const { isValid, errors, warnings } = this.validate()
    
    if (!isValid) {
      console.error('🚨 Environment Validation Failed:')
      errors.forEach(error => console.error(`  ❌ ${error}`))
      if (warnings.length > 0) {
        console.warn('⚠️  Warnings:')
        warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
      }
      
      throw new Error(`Environment validation failed with ${errors.length} error(s)`)
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Environment Validation Warnings:')
      warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`))
    }
  }
  
  /**
   * Get a safe version of environment variables for logging (sensitive values masked)
   */
  getSafeEnvInfo(): Record<string, string> {
    const safeInfo: Record<string, string> = {}
    
    envVars.forEach(envVar => {
      const value = process.env[envVar.name]
      if (value) {
        if (envVar.sensitive) {
          // Show only first and last 2 characters for sensitive values
          if (value.length > 4) {
            safeInfo[envVar.name] = `${value.substring(0, 2)}...${value.substring(value.length - 2)}`
          } else {
            safeInfo[envVar.name] = '***'
          }
        } else {
          safeInfo[envVar.name] = value
        }
      } else {
        safeInfo[envVar.name] = '(not set)'
      }
    })
    
    return safeInfo
  }
}

export default EnvironmentValidator

// Export for use in other modules
export const validateEnvironment = () => {
  const validator = EnvironmentValidator.getInstance()
  return validator.validate()
}

export const validateEnvironmentOrThrow = () => {
  const validator = EnvironmentValidator.getInstance()
  validator.validateOrThrow()
}
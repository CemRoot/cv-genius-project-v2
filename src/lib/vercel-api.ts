interface VercelEnvVar {
  key: string
  value: string
  type: 'encrypted' | 'plain'
  target: ('production' | 'preview' | 'development')[]
}

export class VercelAPI {
  private static readonly BASE_URL = 'https://api.vercel.com'
  
  /**
   * Update environment variable in Vercel project
   */
  static async updateEnvironmentVariable(
    key: string, 
    value: string,
    target: ('production' | 'preview' | 'development')[] = ['production']
  ): Promise<{ success: boolean; message: string }> {
    const token = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    
    if (!token || !projectId) {
      return {
        success: false,
        message: 'Vercel API credentials not configured. Please set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.'
      }
    }
    
    try {
      // Check if environment variable exists
      const existingEnvVars = await this.getEnvironmentVariables()
      if (!existingEnvVars.success) {
        return existingEnvVars
      }
      
      const existingVar = existingEnvVars.data?.find((env: any) => env.key === key)
      
      if (existingVar) {
        // Update existing variable
        const response = await fetch(`${this.BASE_URL}/v9/projects/${projectId}/env/${existingVar.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: value,
            target: target
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to update environment variable')
        }
        
        return {
          success: true,
          message: `Successfully updated ${key} environment variable in Vercel`
        }
      } else {
        // Create new variable
        const response = await fetch(`${this.BASE_URL}/v10/projects/${projectId}/env`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: key,
            value: value,
            type: 'encrypted',
            target: target
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to create environment variable')
        }
        
        return {
          success: true,
          message: `Successfully created ${key} environment variable in Vercel`
        }
      }
    } catch (error) {
      console.error('Vercel API Error:', error)
      return {
        success: false,
        message: `Vercel API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
  
  /**
   * Get all environment variables for the project
   */
  static async getEnvironmentVariables(): Promise<{ success: boolean; data?: any; message: string }> {
    const token = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    
    if (!token || !projectId) {
      return {
        success: false,
        message: 'Vercel API credentials not configured'
      }
    }
    
    try {
      const response = await fetch(`${this.BASE_URL}/v9/projects/${projectId}/env`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch environment variables')
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data.envs,
        message: 'Successfully fetched environment variables'
      }
    } catch (error) {
      console.error('Vercel API Error:', error)
      return {
        success: false,
        message: `Failed to fetch environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
  
  /**
   * Update admin password hash in Vercel
   */
  static async updateAdminPasswordHash(newPasswordHash: string): Promise<{ success: boolean; message: string }> {
    return this.updateEnvironmentVariable('ADMIN_PASSWORD_HASH', newPasswordHash, ['production'])
  }
  
  /**
   * Check if Vercel API is configured
   */
  static isConfigured(): boolean {
    return !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
  }
  
  /**
   * Get configuration status for admin panel
   */
  static getConfigurationStatus(): {
    hasToken: boolean
    hasProjectId: boolean
    isReady: boolean
    instructions: string
  } {
    const hasToken = !!process.env.VERCEL_TOKEN
    const hasProjectId = !!process.env.VERCEL_PROJECT_ID
    const isReady = hasToken && hasProjectId
    
    let instructions = ''
    if (!hasToken && !hasProjectId) {
      instructions = 'Please set both VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables'
    } else if (!hasToken) {
      instructions = 'Please set VERCEL_TOKEN environment variable'
    } else if (!hasProjectId) {
      instructions = 'Please set VERCEL_PROJECT_ID environment variable'
    } else {
      instructions = 'Vercel API is properly configured for automatic password updates'
    }
    
    return {
      hasToken,
      hasProjectId,
      isReady,
      instructions
    }
  }
}

export default VercelAPI 
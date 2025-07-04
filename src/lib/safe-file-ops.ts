// Safe file operations that work in both development and production

export interface FileOpsResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Safely read a JSON file (development only)
 * Returns default value in production or on error
 */
export async function safeReadJSON<T>(
  filePath: string,
  defaultValue: T
): Promise<T> {
  if (isProduction) {
    return defaultValue
  }

  try {
    const fs = await import('fs/promises')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return defaultValue
  }
}

/**
 * Safely write a JSON file (development only)
 * No-op in production
 */
export async function safeWriteJSON<T>(
  filePath: string,
  data: T
): Promise<FileOpsResult<void>> {
  if (isProduction) {
    return { success: true }
  }

  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if a file exists (development only)
 * Always returns false in production
 */
export async function safeFileExists(filePath: string): Promise<boolean> {
  if (isProduction) {
    return false
  }

  try {
    const fs = await import('fs')
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Get the file path for data storage
 * Returns empty string in production
 */
export function getDataFilePath(filename: string): string {
  if (isProduction) {
    return ''
  }

  try {
    const path = require('path')
    return path.join(process.cwd(), 'data', filename)
  } catch (error) {
    return ''
  }
}
// Shared maintenance storage for production and development
import fs from 'fs/promises'
import path from 'path'

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance-settings.json')

export interface MaintenanceSettings {
  globalMaintenance: boolean
  sections: Array<{
    id: string
    name: string
    path: string
    isInMaintenance: boolean
    message: string
    estimatedTime: string
  }>
}

// Default settings
export const defaultSettings: MaintenanceSettings = {
  globalMaintenance: false,
  sections: [
    {
      id: 'cv-builder',
      name: 'CV Builder',
      path: '/builder',
      isInMaintenance: false,
      message: 'We are currently performing maintenance on the CV Builder.',
      estimatedTime: '30 minutes'
    },
    {
      id: 'ats-check',
      name: 'ATS Check',
      path: '/ats-check',
      isInMaintenance: false,
      message: 'ATS Check is undergoing scheduled maintenance.',
      estimatedTime: '45 minutes'
    },
    {
      id: 'cover-letter',
      name: 'Cover Letters',
      path: '/cover-letter',
      isInMaintenance: false,
      message: 'The Cover Letter Generator is temporarily unavailable.',
      estimatedTime: '1 hour'
    },
    {
      id: 'templates',
      name: 'Templates',
      path: '/templates',
      isInMaintenance: false,
      message: 'Template gallery is being updated.',
      estimatedTime: '15 minutes'
    },
    {
      id: 'examples',
      name: 'Examples',
      path: '/examples',
      isInMaintenance: false,
      message: 'CV Examples section is being updated.',
      estimatedTime: '30 minutes'
    },
    {
      id: 'career-guide',
      name: 'Career Guide',
      path: '/guides',
      isInMaintenance: false,
      message: 'Career Guide is temporarily offline for improvements.',
      estimatedTime: '1 hour'
    }
  ]
}

// In-memory storage for production
let inMemorySettings: MaintenanceSettings | null = null

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'

// Load maintenance settings
export async function loadSettings(): Promise<MaintenanceSettings> {
  // In production, use in-memory storage
  if (isProduction) {
    return inMemorySettings || defaultSettings
  }
  
  // In development, use file system
  try {
    const data = await fs.readFile(MAINTENANCE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return default settings
    return defaultSettings
  }
}

// Save maintenance settings
export async function saveSettings(settings: MaintenanceSettings): Promise<void> {
  // In production, only save to memory
  if (isProduction) {
    inMemorySettings = settings
    return
  }
  
  // In development, save to file system
  try {
    const dir = path.dirname(MAINTENANCE_FILE)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(MAINTENANCE_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('Error saving settings to file:', error)
    // Even in development, fall back to memory if file write fails
    inMemorySettings = settings
  }
}
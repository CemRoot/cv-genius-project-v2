import { CVData } from '@/types/cv'

const STORAGE_KEYS = {
  CV_DATA: 'cvgenius-cv-data',
  CV_LIST: 'cvgenius-cv-list',
  SETTINGS: 'cvgenius-settings',
  AUTO_SAVE: 'cvgenius-auto-save',
  DRAFT: 'cvgenius-draft'
} as const

export interface StorageSettings {
  autoSave: boolean
  autoSaveInterval: number
  defaultTemplate: string
  language: string
}

// Safe localStorage operations with error handling
export const storage = {
  // Get item from localStorage
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null
    
    try {  
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error)
      return defaultValue || null
    }
  },

  // Set item in localStorage
  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error)
      // Handle quota exceeded or other storage errors
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, attempting cleanup...')
        storage.cleanup()
        // Try again after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError)
          return false
        }
      }
      return false
    }
  },

  // Remove item from localStorage
  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error)
      return false
    }
  },

  // Clear all CVGenius data
  clear: (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  },

  // Cleanup old or invalid data
  cleanup: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      // Remove old CV data (older than 30 days)
      const cvList = storage.get<{ id: string; lastModified: string }[]>(STORAGE_KEYS.CV_LIST, [])
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      if (cvList) {
        const validCVs = cvList.filter(cv => {
          const lastModified = new Date(cv.lastModified)
          return lastModified > thirtyDaysAgo
        })
        
        if (validCVs.length !== cvList.length) {
          storage.set(STORAGE_KEYS.CV_LIST, validCVs)
          
          // Remove old CV data files
          cvList.forEach(cv => {
            if (!validCVs.some(valid => valid.id === cv.id)) {
              localStorage.removeItem(`${STORAGE_KEYS.CV_DATA}-${cv.id}`)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  },

  // Get storage usage info
  getUsage: () => {
    if (typeof window === 'undefined') return { used: 0, available: 0, percentage: 0 }
    
    try {
      const used = new Blob(Object.values(localStorage)).size
      const available = 5 * 1024 * 1024 // Approximate localStorage limit (5MB)
      const percentage = (used / available) * 100
      
      return { used, available, percentage }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

// CV-specific storage operations
export const cvStorage = {
  // Save CV data
  saveCV: (cv: CVData): boolean => {
    const success = storage.set(`${STORAGE_KEYS.CV_DATA}-${cv.id}`, cv)
    
    if (success) {
      // Update CV list
      const cvList = storage.get<{ id: string; name: string; lastModified: string }[]>(STORAGE_KEYS.CV_LIST, []) || []
      const existingIndex = cvList.findIndex(item => item.id === cv.id)
      
      const cvSummary = {
        id: cv.id,
        name: cv.personal.fullName || 'Untitled CV',
        lastModified: cv.lastModified
      }
      
      if (existingIndex >= 0) {
        cvList[existingIndex] = cvSummary
      } else {
        cvList.push(cvSummary)
      }
      
      storage.set(STORAGE_KEYS.CV_LIST, cvList)
    }
    
    return success
  },

  // Load CV data
  loadCV: (id: string): CVData | null => {
    return storage.get<CVData>(`${STORAGE_KEYS.CV_DATA}-${id}`)
  },

  // Get list of all CVs
  getCVList: (): { id: string; name: string; lastModified: string }[] => {
    return storage.get<{ id: string; name: string; lastModified: string }[]>(STORAGE_KEYS.CV_LIST, []) || []
  },

  // Delete CV
  deleteCV: (id: string): boolean => {
    const success = storage.remove(`${STORAGE_KEYS.CV_DATA}-${id}`)
    
    if (success) {
      // Update CV list
      const cvList = storage.get<{ id: string; name: string; lastModified: string }[]>(STORAGE_KEYS.CV_LIST, []) || []
      const filteredList = cvList.filter(cv => cv.id !== id)
      storage.set(STORAGE_KEYS.CV_LIST, filteredList)
    }
    
    return success
  },

  // Save draft (auto-save)
  saveDraft: (cv: CVData): boolean => {
    return storage.set(STORAGE_KEYS.DRAFT, cv)
  },

  // Load draft
  loadDraft: (): CVData | null => {
    return storage.get<CVData>(STORAGE_KEYS.DRAFT)
  },

  // Clear draft
  clearDraft: (): boolean => {
    return storage.remove(STORAGE_KEYS.DRAFT)
  }
}

// Settings storage
export const settingsStorage = {
  // Get settings
  getSettings: (): StorageSettings => {
    return storage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, {
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      defaultTemplate: 'harvard',
      language: 'en-IE'
    }) || {
      autoSave: true,
      autoSaveInterval: 30000,
      defaultTemplate: 'harvard',
      language: 'en-IE'
    }
  },

  // Save settings
  saveSettings: (settings: Partial<StorageSettings>): boolean => {
    const currentSettings = settingsStorage.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    return storage.set(STORAGE_KEYS.SETTINGS, newSettings)
  },

  // Reset settings to defaults
  resetSettings: (): boolean => {
    return storage.remove(STORAGE_KEYS.SETTINGS)
  }
}

// Export data for backup
export const exportData = (): string => {
  const cvList = cvStorage.getCVList()
  const allCVs = cvList.map(cv => cvStorage.loadCV(cv.id)).filter(Boolean)
  const settings = settingsStorage.getSettings()
  
  return JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    cvs: allCVs,
    settings
  }, null, 2)
}

// Import data from backup
export const importData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data)
    
    if (!parsed.version || !parsed.cvs) {
      throw new Error('Invalid backup format')
    }
    
    // Clear existing data
    storage.clear()
    
    // Import CVs
    parsed.cvs.forEach((cv: CVData) => {
      cvStorage.saveCV(cv)
    })
    
    // Import settings
    if (parsed.settings) {
      settingsStorage.saveSettings(parsed.settings)
    }
    
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}
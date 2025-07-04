import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface MaintenanceSection {
  id: string
  name: string
  path: string
  isInMaintenance: boolean
  message?: string
  estimatedTime?: string
}

interface MaintenanceStore {
  sections: MaintenanceSection[]
  globalMaintenance: boolean
  setSectionMaintenance: (sectionId: string, isInMaintenance: boolean, message?: string, estimatedTime?: string) => void
  setGlobalMaintenance: (isInMaintenance: boolean) => void
  getSectionStatus: (path: string) => MaintenanceSection | undefined
  isPathInMaintenance: (path: string) => boolean
  initializeSections: () => void
}

const defaultSections: MaintenanceSection[] = [
  {
    id: 'cv-builder',
    name: 'CV Builder',
    path: '/builder',
    isInMaintenance: false,
    message: 'We are currently performing maintenance on the CV Builder. We apologize for any inconvenience.',
    estimatedTime: '30 minutes'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Generator',
    path: '/cover-letter',
    isInMaintenance: false,
    message: 'The Cover Letter Generator is temporarily unavailable for maintenance.',
    estimatedTime: '1 hour'
  },
  {
    id: 'ats-analyzer',
    name: 'ATS Analyzer',
    path: '/ats-analyzer',
    isInMaintenance: false,
    message: 'ATS Analyzer is undergoing scheduled maintenance.',
    estimatedTime: '45 minutes'
  },
  {
    id: 'wizard',
    name: 'CV Wizard',
    path: '/wizard',
    isInMaintenance: false,
    message: 'CV Wizard is temporarily offline for improvements.',
    estimatedTime: '2 hours'
  },
  {
    id: 'templates',
    name: 'Templates',
    path: '/templates',
    isInMaintenance: false,
    message: 'Template gallery is being updated.',
    estimatedTime: '15 minutes'
  }
]

export const useMaintenanceStore = create<MaintenanceStore>()(
  persist(
    (set, get) => ({
      sections: defaultSections,
      globalMaintenance: false,

      setSectionMaintenance: (sectionId, isInMaintenance, message, estimatedTime) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, isInMaintenance, message: message || section.message, estimatedTime: estimatedTime || section.estimatedTime }
              : section
          ),
        })),

      setGlobalMaintenance: (isInMaintenance) =>
        set({ globalMaintenance: isInMaintenance }),

      getSectionStatus: (path) => {
        const state = get()
        return state.sections.find((section) => path.startsWith(section.path))
      },

      isPathInMaintenance: (path) => {
        const state = get()
        if (state.globalMaintenance) return true
        
        const section = state.getSectionStatus(path)
        return section?.isInMaintenance || false
      },

      initializeSections: () => {
        const state = get()
        if (state.sections.length === 0) {
          set({ sections: defaultSections })
        }
      },
    }),
    {
      name: 'maintenance-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
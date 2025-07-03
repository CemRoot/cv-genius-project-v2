import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CVData, PersonalInfo, Experience, Education, Skill, Language, Project, Certification, Interest, Reference, CVSection, DesignSettings } from '@/types/cv'
import { offlineStorage, syncManager } from '@/lib/offline-storage'

// Fallback UUID generator for environments where crypto.randomUUID is not available
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback to timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

interface CVStore {
  // Current CV data
  currentCV: CVData
  
  // UI state - these should persist across refreshes
  isLoading: boolean
  activeSection: string
  previewMode: boolean
  
  // Session state - these should persist during the current session
  sessionState: {
    selectedTemplateId?: string
    currentStep?: number
    mobileActiveTab?: string
    lastActiveSection?: string
    builderMode?: 'wizard' | 'form' | 'editor'
  }
  
  // Auto-save state
  autoSaveEnabled: boolean
  autoSaveInterval: number // in milliseconds
  lastAutoSave: string | null
  
  // History state
  history: CVData[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  
  // Actions
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  addExperience: (experience: Omit<Experience, 'id'>) => void
  updateExperience: (id: string, experience: Partial<Experience>) => void
  removeExperience: (id: string) => void
  reorderExperience: (fromIndex: number, toIndex: number) => void
  
  addEducation: (education: Omit<Education, 'id'>) => void
  updateEducation: (id: string, education: Partial<Education>) => void
  removeEducation: (id: string) => void
  
  addSkill: (skill: Omit<Skill, 'id'>) => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  removeSkill: (id: string) => void
  
  updateLanguages: (languages: Language[]) => void
  addLanguage: (language: Omit<Language, 'id'>) => void
  updateLanguage: (id: string, language: Partial<Language>) => void
  removeLanguage: (id: string) => void
  
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, project: Partial<Project>) => void
  removeProject: (id: string) => void
  
  addCertification: (certification: Omit<Certification, 'id'>) => void
  updateCertification: (id: string, certification: Partial<Certification>) => void
  removeCertification: (id: string) => void
  
  addInterest: (interest: Omit<Interest, 'id'>) => void
  updateInterest: (id: string, interest: Partial<Interest>) => void
  removeInterest: (id: string) => void
  
  addReference: (reference: Omit<Reference, 'id'>) => void
  updateReference: (id: string, reference: Partial<Reference>) => void
  removeReference: (id: string) => void
  
  updateSection: (id: string, updates: Partial<CVSection>) => void
  reorderSections: (fromIndex: number, toIndex: number) => void
  toggleSectionVisibility: (id: string) => void
  moveSectionUp: (id: string) => void
  moveSectionDown: (id: string) => void
  resetToDefaultSections: () => void
  
  setTemplate: (template: string) => void
  setActiveSection: (section: string) => void
  setPreviewMode: (preview: boolean) => void
  updateDesignSettings: (settings: DesignSettings) => void
  
  // Session state management
  updateSessionState: (updates: Partial<CVStore['sessionState']>) => void
  clearSessionState: () => void
  
  // CV management
  setCurrentCV: (cv: CVData) => void
  saveCV: () => void
  loadCV: (id: string) => void
  createNewCV: () => void
  deleteCurrentCV: () => void
  exportCV: (format: 'pdf' | 'docx' | 'json') => Promise<void>
  
  // Auto-save
  enableAutoSave: () => void
  disableAutoSave: () => void
  setAutoSaveInterval: (interval: number) => void
  performAutoSave: () => void
  
  // History
  undo: () => void
  redo: () => void
  clearHistory: () => void

  setReferencesDisplay: (display: 'available-on-request' | 'detailed') => void
}

const createDefaultCV = (): CVData => ({
  id: generateId(),
  personal: {
    fullName: '',
    email: '',
    phone: '',
    address: 'Dublin, Ireland',
    linkedin: '',
    website: '',
    summary: ''
  },
  sections: [
    { id: '1', type: 'personal', title: 'Personal Information', visible: true, order: 1 },
    { id: '2', type: 'summary', title: 'Professional Summary', visible: true, order: 2 },
    { id: '3', type: 'experience', title: 'Work Experience', visible: true, order: 3 },
    { id: '4', type: 'education', title: 'Education', visible: true, order: 4 },
    { id: '5', type: 'skills', title: 'Skills', visible: false, order: 5 },
    { id: '6', type: 'languages', title: 'Languages', visible: false, order: 6 },
    { id: '7', type: 'projects', title: 'Projects', visible: false, order: 7 },
    { id: '8', type: 'certifications', title: 'Certifications', visible: false, order: 8 },
    { id: '9', type: 'interests', title: 'Interests & Hobbies', visible: false, order: 9 },
    { id: '10', type: 'references', title: 'References', visible: false, order: 10 },
  ],
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  interests: [],
  references: [],
  referencesDisplay: 'available-on-request',
  template: 'harvard',
  designSettings: {
    margins: 0.5,
    sectionSpacing: 'normal',
    headerSpacing: 'normal',
    fontFamily: 'Source Serif Pro',
    fontSize: 10,
    lineHeight: 1.2
  },
  lastModified: new Date().toISOString(),
  version: 1
})

// Helper to save CV offline when changes are made
const saveOfflineIfNeeded = async (cv: CVData) => {
  if (!navigator.onLine) {
    await offlineStorage.saveCV(cv)
    syncManager.addToSyncQueue(cv.id)
  }
}

export const useCVStore = create<CVStore>()(
  persist(
    (set, get) => ({
      currentCV: createDefaultCV(),
      isLoading: false,
      activeSection: 'personal',
      previewMode: false,
      sessionState: {
        selectedTemplateId: undefined,
        currentStep: 0,
        mobileActiveTab: 'edit',
        lastActiveSection: 'personal',
        builderMode: 'editor'
      },
      autoSaveEnabled: true,
      autoSaveInterval: 30000, // 30 seconds default
      lastAutoSave: null,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      
      updatePersonalInfo: (info) => set((state) => {
        const newPersonalInfo = { ...state.currentCV.personal, ...info }
        
        const newCV = {
          ...state.currentCV,
          personal: newPersonalInfo,
          lastModified: new Date().toISOString()
        }
        
        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(state.currentCV) // Save current state before change
        
        // Save to offline storage if needed
        saveOfflineIfNeeded(newCV)
        
        return {
          currentCV: newCV,
          history: newHistory.slice(-20), // Keep last 20 states
          historyIndex: Math.min(newHistory.length - 1, 19),
          canUndo: true,
          canRedo: false
        }
      }),
      
      addExperience: (experience) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          experience: [...state.currentCV.experience, { ...experience, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateExperience: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          experience: state.currentCV.experience.map(exp => 
            exp.id === id ? { ...exp, ...updates } : exp
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeExperience: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          experience: state.currentCV.experience.filter(exp => exp.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      reorderExperience: (fromIndex, toIndex) => set((state) => {
        const experience = [...state.currentCV.experience]
        const [moved] = experience.splice(fromIndex, 1)
        experience.splice(toIndex, 0, moved)
        return {
          currentCV: {
            ...state.currentCV,
            experience,
            lastModified: new Date().toISOString()
          }
        }
      }),
      
      addEducation: (education) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          education: [...state.currentCV.education, { ...education, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateEducation: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          education: state.currentCV.education.map(edu => 
            edu.id === id ? { ...edu, ...updates } : edu
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeEducation: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          education: state.currentCV.education.filter(edu => edu.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      addSkill: (skill) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          skills: [...state.currentCV.skills, { ...skill, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateSkill: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          skills: state.currentCV.skills.map(skill => 
            skill.id === id ? { ...skill, ...updates } : skill
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeSkill: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          skills: state.currentCV.skills.filter(skill => skill.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      updateLanguages: (languages) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          languages,
          lastModified: new Date().toISOString()
        }
      })),
      
      addLanguage: (language) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          languages: [...(state.currentCV.languages || []), { ...language, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateLanguage: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          languages: (state.currentCV.languages || []).map(lang => 
            lang.id === id ? { ...lang, ...updates } : lang
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeLanguage: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          languages: (state.currentCV.languages || []).filter(lang => lang.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      addProject: (project) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          projects: [...(state.currentCV.projects || []), { ...project, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateProject: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          projects: (state.currentCV.projects || []).map(project => 
            project.id === id ? { ...project, ...updates } : project
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeProject: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          projects: (state.currentCV.projects || []).filter(project => project.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      addCertification: (certification) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          certifications: [...(state.currentCV.certifications || []), { ...certification, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateCertification: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          certifications: (state.currentCV.certifications || []).map(cert => 
            cert.id === id ? { ...cert, ...updates } : cert
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeCertification: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          certifications: (state.currentCV.certifications || []).filter(cert => cert.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      addInterest: (interest) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          interests: [...(state.currentCV.interests || []), { ...interest, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateInterest: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          interests: (state.currentCV.interests || []).map(interest => 
            interest.id === id ? { ...interest, ...updates } : interest
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeInterest: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          interests: (state.currentCV.interests || []).filter(interest => interest.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      addReference: (reference) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          references: [...(state.currentCV.references || []), { ...reference, id: generateId() }],
          lastModified: new Date().toISOString()
        }
      })),
      
      updateReference: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          references: (state.currentCV.references || []).map(reference => 
            reference.id === id ? { ...reference, ...updates } : reference
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      removeReference: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          references: (state.currentCV.references || []).filter(reference => reference.id !== id),
          lastModified: new Date().toISOString()
        }
      })),
      
      setReferencesDisplay: (display: 'available-on-request' | 'detailed') => set((state) => ({
        currentCV: {
          ...state.currentCV,
          referencesDisplay: display,
          lastModified: new Date().toISOString()
        }
      })),
      
      updateSection: (id, updates) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          sections: state.currentCV.sections.map(section => 
            section.id === id ? { ...section, ...updates } : section
          ),
          lastModified: new Date().toISOString()
        }
      })),
      
      reorderSections: (fromIndex, toIndex) => set((state) => {
        const sections = [...state.currentCV.sections]
        const [moved] = sections.splice(fromIndex, 1)
        sections.splice(toIndex, 0, moved)
        // Update order numbers
        sections.forEach((section, index) => {
          section.order = index + 1
        })
        return {
          currentCV: {
            ...state.currentCV,
            sections,
            lastModified: new Date().toISOString()
          }
        }
      }),

      toggleSectionVisibility: (id) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          sections: state.currentCV.sections.map(section => 
            section.id === id ? { ...section, visible: !section.visible } : section
          ),
          lastModified: new Date().toISOString()
        }
      })),

      moveSectionUp: (id) => set((state) => {
        const sections = [...state.currentCV.sections]
        const currentIndex = sections.findIndex(s => s.id === id)
        if (currentIndex > 0) {
          const newIndex = currentIndex - 1
          const [moved] = sections.splice(currentIndex, 1)
          sections.splice(newIndex, 0, moved)
          // Update order numbers
          sections.forEach((section, index) => {
            section.order = index + 1
          })
        }
        return {
          currentCV: {
            ...state.currentCV,
            sections,
            lastModified: new Date().toISOString()
          }
        }
      }),

      moveSectionDown: (id) => set((state) => {
        const sections = [...state.currentCV.sections]
        const currentIndex = sections.findIndex(s => s.id === id)
        if (currentIndex < sections.length - 1) {
          const newIndex = currentIndex + 1
          const [moved] = sections.splice(currentIndex, 1)
          sections.splice(newIndex, 0, moved)
          // Update order numbers
          sections.forEach((section, index) => {
            section.order = index + 1
          })
        }
        return {
          currentCV: {
            ...state.currentCV,
            sections,
            lastModified: new Date().toISOString()
          }
        }
      }),

      resetToDefaultSections: () => set((state) => ({
        currentCV: {
          ...state.currentCV,
          sections: [
            { id: generateId(), type: 'summary', title: 'Summary', visible: true, order: 1 },
            { id: generateId(), type: 'skills', title: 'Skills', visible: true, order: 2 },
            { id: generateId(), type: 'experience', title: 'Experience', visible: true, order: 3 },
            { id: generateId(), type: 'education', title: 'Education', visible: true, order: 4 },
            { id: generateId(), type: 'projects', title: 'Projects', visible: true, order: 5 },
            { id: generateId(), type: 'certifications', title: 'Certifications', visible: true, order: 6 },
            { id: generateId(), type: 'languages', title: 'Languages', visible: true, order: 7 },
            { id: generateId(), type: 'interests', title: 'Interests', visible: true, order: 8 },
            { id: generateId(), type: 'references', title: 'References', visible: true, order: 9 }
          ],
          lastModified: new Date().toISOString()
        }
      })),
      
      setTemplate: (template) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          template,
          lastModified: new Date().toISOString()
        }
      })),
      
      setActiveSection: (section) => set((state) => ({ 
        activeSection: section,
        sessionState: { ...state.sessionState, lastActiveSection: section }
      })),
      
      setPreviewMode: (preview) => set({ previewMode: preview }),
      
      updateDesignSettings: (settings) => set((state) => ({
        currentCV: {
          ...state.currentCV,
          designSettings: settings,
          lastModified: new Date().toISOString()
        }
      })),
      
      setCurrentCV: (cv) => set({ 
        currentCV: {
          ...cv,
          lastModified: new Date().toISOString()
        },
        activeSection: 'personal',
        previewMode: false
      }),
      
      saveCV: () => {
        // Save to localStorage is handled by persist middleware
        const state = get()
      },
      
      loadCV: (id) => {
        // Implementation would load from localStorage
      },
      
      createNewCV: () => set({
        currentCV: createDefaultCV(),
        activeSection: 'personal',
        previewMode: false,
        history: [],
        historyIndex: -1,
        canUndo: false,
        canRedo: false
      }),
      
      deleteCurrentCV: () => {
        // Clear localStorage
        localStorage.removeItem('cvgenius-storage')
        
        // Reset to a new empty CV
        set({
          currentCV: createDefaultCV(),
          activeSection: 'personal',
          previewMode: false,
          history: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false
        })
      },
      
      exportCV: async (format) => {
        // Implementation for export functionality
      },
      
      enableAutoSave: () => set({ autoSaveEnabled: true }),
      
      disableAutoSave: () => set({ autoSaveEnabled: false }),
      
      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
      
      performAutoSave: () => {
        const state = get()
        if (state.autoSaveEnabled) {
          // Save to localStorage (handled by persist middleware)
          set({ lastAutoSave: new Date().toISOString() })
        }
      },
      
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          return {
            currentCV: state.history[newIndex],
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true
          }
        }
        return state
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1
          return {
            currentCV: state.history[newIndex],
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < state.history.length - 1
          }
        }
        return state
      }),
      
      clearHistory: () => set({
        history: [],
        historyIndex: -1,
        canUndo: false,
        canRedo: false
      }),

      updateSessionState: (updates) => set((state) => ({
        sessionState: { ...state.sessionState, ...updates }
      })),

      clearSessionState: () => set({
        sessionState: {}
      })
    }),
    {
      name: 'cvgenius-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentCV: state.currentCV, 
        activeSection: state.activeSection,
        previewMode: state.previewMode,
        sessionState: state.sessionState 
      })
    }
  )
)
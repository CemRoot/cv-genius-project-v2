'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { 
  CvBuilderDocument, 
  CvBuilderDocumentSchema, 
  createDefaultCvBuilderDocument,
  CvBuilderSection,
  CvBuilderPersonal,
  CvBuilderExperience,
  CvBuilderEducation
} from '@/types/cv-builder'
import { useGeneratePdf } from '@/hooks/use-generate-pdf'

// Action types for CV builder state management
type CvBuilderAction = 
  | { type: 'LOAD_DOCUMENT'; payload: CvBuilderDocument }
  | { type: 'UPDATE_PERSONAL'; payload: Partial<CvBuilderPersonal> }
  | { type: 'UPDATE_SECTION'; payload: { index: number; section: CvBuilderSection } }
  | { type: 'ADD_SECTION'; payload: CvBuilderSection }
  | { type: 'REMOVE_SECTION'; payload: number }
  | { type: 'REORDER_SECTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'ADD_EXPERIENCE'; payload: CvBuilderExperience }
  | { type: 'UPDATE_EXPERIENCE'; payload: { index: number; experience: CvBuilderExperience } }
  | { type: 'REMOVE_EXPERIENCE'; payload: number }
  | { type: 'ADD_EDUCATION'; payload: CvBuilderEducation }
  | { type: 'UPDATE_EDUCATION'; payload: { index: number; education: CvBuilderEducation } }
  | { type: 'REMOVE_EDUCATION'; payload: number }
  | { type: 'UPDATE_SKILLS'; payload: string[] }
  | { type: 'UPDATE_SUMMARY'; payload: string }
  | { type: 'RESET_DOCUMENT' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

interface CvBuilderState {
  document: CvBuilderDocument
  isSaving: boolean
  hasUnsavedChanges: boolean
  error: string | null
  lastSaved: Date | null
}

interface CvBuilderContextType extends CvBuilderState {
  updatePersonal: (personal: Partial<CvBuilderPersonal>) => void
  updateSection: (type: string, section: CvBuilderSection) => void
  addSection: (section: CvBuilderSection) => void
  removeSection: (index: number) => void
  reorderSections: (fromIndex: number, toIndex: number) => void
  addExperience: (experience: CvBuilderExperience) => void
  updateExperience: (index: number, experience: CvBuilderExperience) => void
  removeExperience: (index: number) => void
  addEducation: (education: CvBuilderEducation) => void
  updateEducation: (index: number, education: CvBuilderEducation) => void
  removeEducation: (index: number) => void
  updateSkills: (skills: string[]) => void
  updateSummary: (summary: string) => void
  saveDocument: () => Promise<void>
  loadDocument: (documentId?: string) => Promise<void>
  resetDocument: () => void
  exportToPdf: () => Promise<boolean>
  downloadPdf: (filename?: string) => Promise<boolean>
  // PDF generation state
  pdfGeneration: {
    isGenerating: boolean
    progress: number
    error: string | null
    stage: string
  }
}

const CvBuilderContext = createContext<CvBuilderContextType | undefined>(undefined)

// Local storage keys
const STORAGE_KEY = 'cvbuilder_document'
const AUTOSAVE_KEY = 'cvbuilder_autosave'

// Reducer for managing CV builder state
function cvBuilderReducer(state: CvBuilderState, action: CvBuilderAction): CvBuilderState {
  switch (action.type) {
    case 'LOAD_DOCUMENT':
      return {
        ...state,
        document: action.payload,
        hasUnsavedChanges: false,
        error: null
      }

    case 'UPDATE_PERSONAL':
      return {
        ...state,
        document: {
          ...state.document,
          personal: { ...state.document.personal, ...action.payload },
          updatedAt: new Date().toISOString()
        },
        hasUnsavedChanges: true
      }

    case 'UPDATE_SECTION':
      const updatedSections = [...state.document.sections]
      updatedSections[action.payload.index] = action.payload.section
      return {
        ...state,
        document: {
          ...state.document,
          sections: updatedSections,
          updatedAt: new Date().toISOString()
        },
        hasUnsavedChanges: true
      }

    case 'ADD_SECTION':
      return {
        ...state,
        document: {
          ...state.document,
          sections: [...state.document.sections, action.payload],
          updatedAt: new Date().toISOString()
        },
        hasUnsavedChanges: true
      }

    case 'REMOVE_SECTION':
      return {
        ...state,
        document: {
          ...state.document,
          sections: state.document.sections.filter((_, index) => index !== action.payload),
          updatedAt: new Date().toISOString()
        },
        hasUnsavedChanges: true
      }

    case 'REORDER_SECTIONS':
      const reorderedSections = [...state.document.sections]
      const [movedSection] = reorderedSections.splice(action.payload.fromIndex, 1)
      reorderedSections.splice(action.payload.toIndex, 0, movedSection)
      return {
        ...state,
        document: {
          ...state.document,
          sections: reorderedSections,
          updatedAt: new Date().toISOString()
        },
        hasUnsavedChanges: true
      }

    case 'ADD_EXPERIENCE':
      const experienceSection = state.document.sections.find(s => s.type === 'experience')
      if (experienceSection && experienceSection.type === 'experience') {
        const sectionIndex = state.document.sections.indexOf(experienceSection)
        const updatedExpSections = [...state.document.sections]
        updatedExpSections[sectionIndex] = {
          ...experienceSection,
          items: [...experienceSection.items, action.payload]
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedExpSections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'UPDATE_EXPERIENCE':
      const expSection = state.document.sections.find(s => s.type === 'experience')
      if (expSection && expSection.type === 'experience') {
        const sectionIndex = state.document.sections.indexOf(expSection)
        const updatedExpItems = [...expSection.items]
        updatedExpItems[action.payload.index] = action.payload.experience
        const updatedExpSectionsList = [...state.document.sections]
        updatedExpSectionsList[sectionIndex] = {
          ...expSection,
          items: updatedExpItems
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedExpSectionsList,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'REMOVE_EXPERIENCE':
      const remExpSection = state.document.sections.find(s => s.type === 'experience')
      if (remExpSection && remExpSection.type === 'experience') {
        const sectionIndex = state.document.sections.indexOf(remExpSection)
        const filteredExpItems = remExpSection.items.filter((_, index) => index !== action.payload)
        const updatedRemExpSections = [...state.document.sections]
        updatedRemExpSections[sectionIndex] = {
          ...remExpSection,
          items: filteredExpItems
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedRemExpSections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'ADD_EDUCATION':
      const educationSection = state.document.sections.find(s => s.type === 'education')
      if (educationSection && educationSection.type === 'education') {
        const sectionIndex = state.document.sections.indexOf(educationSection)
        const updatedEduSections = [...state.document.sections]
        updatedEduSections[sectionIndex] = {
          ...educationSection,
          items: [...educationSection.items, action.payload]
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedEduSections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'UPDATE_EDUCATION':
      const eduSection = state.document.sections.find(s => s.type === 'education')
      if (eduSection && eduSection.type === 'education') {
        const sectionIndex = state.document.sections.indexOf(eduSection)
        const updatedEduItems = [...eduSection.items]
        updatedEduItems[action.payload.index] = action.payload.education
        const updatedEduSectionsList = [...state.document.sections]
        updatedEduSectionsList[sectionIndex] = {
          ...eduSection,
          items: updatedEduItems
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedEduSectionsList,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'REMOVE_EDUCATION':
      const remEduSection = state.document.sections.find(s => s.type === 'education')
      if (remEduSection && remEduSection.type === 'education') {
        const sectionIndex = state.document.sections.indexOf(remEduSection)
        const filteredEduItems = remEduSection.items.filter((_, index) => index !== action.payload)
        const updatedRemEduSections = [...state.document.sections]
        updatedRemEduSections[sectionIndex] = {
          ...remEduSection,
          items: filteredEduItems
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedRemEduSections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'UPDATE_SKILLS':
      const skillsSection = state.document.sections.find(s => s.type === 'skills')
      if (skillsSection && skillsSection.type === 'skills') {
        const sectionIndex = state.document.sections.indexOf(skillsSection)
        const updatedSkillsSections = [...state.document.sections]
        updatedSkillsSections[sectionIndex] = {
          ...skillsSection,
          items: action.payload
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedSkillsSections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'UPDATE_SUMMARY':
      const summarySection = state.document.sections.find(s => s.type === 'summary')
      if (summarySection && summarySection.type === 'summary') {
        const sectionIndex = state.document.sections.indexOf(summarySection)
        const updatedSummarySections = [...state.document.sections]
        updatedSummarySections[sectionIndex] = {
          ...summarySection,
          markdown: action.payload
        }
        return {
          ...state,
          document: {
            ...state.document,
            sections: updatedSummarySections,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        }
      }
      return state

    case 'RESET_DOCUMENT':
      return {
        ...state,
        document: createDefaultCvBuilderDocument(),
        hasUnsavedChanges: false,
        error: null
      }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    default:
      return state
  }
}

export function CvBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cvBuilderReducer, {
    document: createDefaultCvBuilderDocument(),
    isSaving: false,
    hasUnsavedChanges: false,
    error: null,
    lastSaved: null
  })

  // PDF generation hook
  const {
    isGenerating: pdfIsGenerating,
    progress: pdfProgress,
    error: pdfError,
    stage: pdfStage,
    generatePdf,
    downloadPdf: downloadPdfHook,
    reset: resetPdfState
  } = useGeneratePdf()

  // Auto-save to localStorage
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state.document))
        } catch (error) {
          console.error('Failed to auto-save to localStorage:', error)
        }
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [state.document, state.hasUnsavedChanges])

  // Load document from localStorage on mount
  useEffect(() => {
    try {
      const savedDocument = localStorage.getItem(AUTOSAVE_KEY)
      if (savedDocument) {
        const parsed = JSON.parse(savedDocument)
        // Validate the document structure
        const validated = CvBuilderDocumentSchema.parse(parsed)
        dispatch({ type: 'LOAD_DOCUMENT', payload: validated })
      }
    } catch (error) {
      console.error('Failed to load auto-saved document:', error)
      // Don't show error to user for auto-save failures
    }
  }, [])

  const updatePersonal = useCallback((personal: Partial<CvBuilderPersonal>) => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: personal })
  }, [])

  const updateSection = useCallback((type: string, section: CvBuilderSection) => {
    const index = state.document.sections.findIndex(s => s.type === type)
    if (index !== -1) {
      dispatch({ type: 'UPDATE_SECTION', payload: { index, section } })
    } else {
      dispatch({ type: 'ADD_SECTION', payload: section })
    }
  }, [state.document.sections])

  const addSection = useCallback((section: CvBuilderSection) => {
    dispatch({ type: 'ADD_SECTION', payload: section })
  }, [])

  const removeSection = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_SECTION', payload: index })
  }, [])

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_SECTIONS', payload: { fromIndex, toIndex } })
  }, [])

  const addExperience = useCallback((experience: CvBuilderExperience) => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: experience })
  }, [])

  const updateExperience = useCallback((index: number, experience: CvBuilderExperience) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', payload: { index, experience } })
  }, [])

  const removeExperience = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_EXPERIENCE', payload: index })
  }, [])

  const addEducation = useCallback((education: CvBuilderEducation) => {
    dispatch({ type: 'ADD_EDUCATION', payload: education })
  }, [])

  const updateEducation = useCallback((index: number, education: CvBuilderEducation) => {
    dispatch({ type: 'UPDATE_EDUCATION', payload: { index, education } })
  }, [])

  const removeEducation = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_EDUCATION', payload: index })
  }, [])

  const updateSkills = useCallback((skills: string[]) => {
    dispatch({ type: 'UPDATE_SKILLS', payload: skills })
  }, [])

  const updateSummary = useCallback((summary: string) => {
    dispatch({ type: 'UPDATE_SUMMARY', payload: summary })
  }, [])

  const saveDocument = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', payload: true })
    try {
      // Validate document before saving
      CvBuilderDocumentSchema.parse(state.document)
      
      // Save to localStorage (in future: API call)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.document))
      
      // Clear autosave since we have a manual save
      localStorage.removeItem(AUTOSAVE_KEY)
      
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save document'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.document])

  const loadDocument = useCallback(async (documentId?: string) => {
    try {
      // For now, load from localStorage (in future: API call)
      const savedDocument = localStorage.getItem(STORAGE_KEY)
      if (savedDocument) {
        const parsed = JSON.parse(savedDocument)
        const validated = CvBuilderDocumentSchema.parse(parsed)
        dispatch({ type: 'LOAD_DOCUMENT', payload: validated })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load document'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    }
  }, [])

  const resetDocument = useCallback(() => {
    dispatch({ type: 'RESET_DOCUMENT' })
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(AUTOSAVE_KEY)
  }, [])

  const exportToPdf = useCallback(async (): Promise<boolean> => {
    try {
      const result = await generatePdf(state.document)
      return result.success
    } catch (error) {
      console.error('PDF export error:', error)
      return false
    }
  }, [generatePdf, state.document])

  const downloadPdf = useCallback(async (filename?: string): Promise<boolean> => {
    try {
      // Generate filename based on CV data
      const defaultFilename = `${state.document.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`
      const finalFilename = filename || defaultFilename
      
      return await downloadPdfHook(state.document, finalFilename)
    } catch (error) {
      console.error('PDF download error:', error)
      return false
    }
  }, [downloadPdfHook, state.document])

  const contextValue: CvBuilderContextType = {
    ...state,
    updatePersonal,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
    updateSummary,
    saveDocument,
    loadDocument,
    resetDocument,
    exportToPdf,
    downloadPdf,
    pdfGeneration: {
      isGenerating: pdfIsGenerating,
      progress: pdfProgress,
      error: pdfError,
      stage: pdfStage
    }
  }

  return (
    <CvBuilderContext.Provider value={contextValue}>
      {children}
    </CvBuilderContext.Provider>
  )
}

export function useCvBuilder() {
  const context = useContext(CvBuilderContext)
  if (context === undefined) {
    throw new Error('useCvBuilder must be used within a CvBuilderProvider')
  }
  return context
}
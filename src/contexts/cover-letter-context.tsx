'use client'

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

export type ExperienceLevel = 'no-experience' | 'less-than-3' | '3-5-years' | '5-10-years' | '10-plus-years'
export type StudentStatus = 'yes' | 'no' | 'recent-graduate'
export type SchoolType = 'high-school' | 'trade-school' | 'college' | 'graduate-school'
export type ColorOption = 'color1' | 'color2' | 'color3' | 'color4' | 'color5' | 'color6' | 'color7' | 'color8'

export interface EducationDetails {
  degreeType: string
  fieldOfStudy: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
}

export interface CoverLetterState {
  experienceLevel: ExperienceLevel | null
  studentStatus: StudentStatus | null
  schoolType: SchoolType | null
  educationDetails: EducationDetails | null
  collegeGrad: boolean | null
  personalInfo: PersonalInfo
  selectedTemplate: string | null
  selectedColor: ColorOption
  currentStep: string
  // New fields for enhanced flow
  creationMode: 'create' | 'upload' | null
  jobInfo: {
    hasSpecificJob: boolean | null
    jobTitle: string
    targetCompany: string
  }
  jobDescription: string
  strengths: string[]
  workStyle: string
  signature: {
    type: 'typed' | 'drawn' | 'uploaded' | null
    value: string
    font?: string
    align?: 'left' | 'center' | 'right'
    color?: string
    size?: 'small' | 'large'
  }
}

type CoverLetterAction =
  | { type: 'SET_EXPERIENCE_LEVEL'; payload: ExperienceLevel }
  | { type: 'SET_STUDENT_STATUS'; payload: StudentStatus }
  | { type: 'SET_SCHOOL_TYPE'; payload: SchoolType }
  | { type: 'SET_EDUCATION_DETAILS'; payload: EducationDetails }
  | { type: 'SET_COLLEGE_GRAD'; payload: boolean }
  | { type: 'SET_PERSONAL_INFO'; payload: PersonalInfo }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: string }
  | { type: 'SET_SELECTED_COLOR'; payload: ColorOption }
  | { type: 'SET_CURRENT_STEP'; payload: string }
  | { type: 'SET_CREATION_MODE'; payload: 'create' | 'upload' }
  | { type: 'SET_JOB_INFO'; payload: { hasSpecificJob?: boolean; jobTitle?: string; targetCompany?: string } }
  | { type: 'SET_JOB_DESCRIPTION'; payload: string }
  | { type: 'SET_STRENGTHS'; payload: string[] }
  | { type: 'SET_WORK_STYLE'; payload: string }
  | { type: 'SET_SIGNATURE'; payload: any }
  | { type: 'RESET_STATE' }

const STORAGE_KEY = 'cover-letter-data'

const loadFromStorage = (): CoverLetterState => {
  if (typeof window === 'undefined') return getInitialState()
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...getInitialState(), ...JSON.parse(stored) } : getInitialState()
  } catch {
    return getInitialState()
  }
}

const saveToStorage = (state: CoverLetterState) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

const getInitialState = (): CoverLetterState => ({
  experienceLevel: null,
  studentStatus: null,
  schoolType: null,
  educationDetails: null,
  collegeGrad: null,
  personalInfo: { firstName: '', lastName: '' },
  selectedTemplate: null,
  selectedColor: 'color1',
  currentStep: 'landing',
  // New fields
  creationMode: null,
  jobInfo: {
    hasSpecificJob: null,
    jobTitle: '',
    targetCompany: ''
  },
  jobDescription: '',
  strengths: [],
  workStyle: '',
  signature: {
    type: null,
    value: '',
    font: 'Mrs Saint Delafield',
    align: 'left',
    color: 'black',
    size: 'small'
  }
})

const initialState: CoverLetterState = getInitialState()

function coverLetterReducer(state: CoverLetterState, action: CoverLetterAction): CoverLetterState {
  let newState: CoverLetterState
  
  switch (action.type) {
    case 'SET_EXPERIENCE_LEVEL':
      newState = { ...state, experienceLevel: action.payload }
      break
    case 'SET_STUDENT_STATUS':
      newState = { ...state, studentStatus: action.payload }
      break
    case 'SET_SCHOOL_TYPE':
      newState = { ...state, schoolType: action.payload }
      break
    case 'SET_EDUCATION_DETAILS':
      newState = { ...state, educationDetails: action.payload }
      break
    case 'SET_COLLEGE_GRAD':
      newState = { ...state, collegeGrad: action.payload }
      break
    case 'SET_PERSONAL_INFO':
      newState = { ...state, personalInfo: action.payload }
      break
    case 'SET_SELECTED_TEMPLATE':
      newState = { ...state, selectedTemplate: action.payload }
      break
    case 'SET_SELECTED_COLOR':
      newState = { ...state, selectedColor: action.payload }
      break
    case 'SET_CURRENT_STEP':
      newState = { ...state, currentStep: action.payload }
      break
    case 'SET_CREATION_MODE':
      newState = { ...state, creationMode: action.payload }
      break
    case 'SET_JOB_INFO':
      newState = { ...state, jobInfo: { ...state.jobInfo, ...action.payload } }
      break
    case 'SET_JOB_DESCRIPTION':
      newState = { ...state, jobDescription: action.payload }
      break
    case 'SET_STRENGTHS':
      newState = { ...state, strengths: action.payload }
      break
    case 'SET_WORK_STYLE':
      newState = { ...state, workStyle: action.payload }
      break
    case 'SET_SIGNATURE':
      newState = { ...state, signature: { ...state.signature, ...action.payload } }
      break
    case 'RESET_STATE':
      newState = getInitialState()
      break
    default:
      return state
  }
  
  saveToStorage(newState)
  return newState
}

interface CoverLetterContextType {
  state: CoverLetterState
  dispatch: React.Dispatch<CoverLetterAction>
  setExperienceLevel: (level: ExperienceLevel) => void
  setStudentStatus: (status: StudentStatus) => void
  setSchoolType: (type: SchoolType) => void
  setEducationDetails: (details: EducationDetails) => void
  setCollegeGrad: (isGrad: boolean) => void
  setPersonalInfo: (info: PersonalInfo) => void
  setSelectedTemplate: (template: string) => void
  setSelectedColor: (color: ColorOption) => void
  setCurrentStep: (step: string) => void
  setCreationMode: (mode: 'create' | 'upload') => void
  setJobInfo: (info: { hasSpecificJob?: boolean; jobTitle?: string; targetCompany?: string }) => void
  setJobDescription: (description: string) => void
  setStrengths: (strengths: string[]) => void
  setWorkStyle: (style: string) => void
  setSignature: (signature: any) => void
  resetState: () => void
}

const CoverLetterContext = createContext<CoverLetterContextType | undefined>(undefined)

export function CoverLetterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(coverLetterReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const storedState = loadFromStorage()
    if (JSON.stringify(storedState) !== JSON.stringify(initialState)) {
      // Restore each field from storage
      if (storedState.experienceLevel) dispatch({ type: 'SET_EXPERIENCE_LEVEL', payload: storedState.experienceLevel })
      if (storedState.studentStatus) dispatch({ type: 'SET_STUDENT_STATUS', payload: storedState.studentStatus })
      if (storedState.schoolType) dispatch({ type: 'SET_SCHOOL_TYPE', payload: storedState.schoolType })
      if (storedState.educationDetails) dispatch({ type: 'SET_EDUCATION_DETAILS', payload: storedState.educationDetails })
      if (storedState.collegeGrad !== null) dispatch({ type: 'SET_COLLEGE_GRAD', payload: storedState.collegeGrad })
      if (storedState.personalInfo.firstName || storedState.personalInfo.lastName) dispatch({ type: 'SET_PERSONAL_INFO', payload: storedState.personalInfo })
      if (storedState.selectedTemplate) dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: storedState.selectedTemplate })
      if (storedState.selectedColor) dispatch({ type: 'SET_SELECTED_COLOR', payload: storedState.selectedColor })
      if (storedState.currentStep) dispatch({ type: 'SET_CURRENT_STEP', payload: storedState.currentStep })
    }
  }, [])

  const contextValue: CoverLetterContextType = {
    state,
    dispatch,
    setExperienceLevel: (level: ExperienceLevel) => 
      dispatch({ type: 'SET_EXPERIENCE_LEVEL', payload: level }),
    setStudentStatus: (status: StudentStatus) => 
      dispatch({ type: 'SET_STUDENT_STATUS', payload: status }),
    setSchoolType: (type: SchoolType) => 
      dispatch({ type: 'SET_SCHOOL_TYPE', payload: type }),
    setEducationDetails: (details: EducationDetails) => 
      dispatch({ type: 'SET_EDUCATION_DETAILS', payload: details }),
    setCollegeGrad: (isGrad: boolean) => 
      dispatch({ type: 'SET_COLLEGE_GRAD', payload: isGrad }),
    setPersonalInfo: (info: PersonalInfo) => 
      dispatch({ type: 'SET_PERSONAL_INFO', payload: info }),
    setSelectedTemplate: (template: string) => 
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template }),
    setSelectedColor: (color: ColorOption) => 
      dispatch({ type: 'SET_SELECTED_COLOR', payload: color }),
    setCurrentStep: (step: string) => 
      dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    setCreationMode: (mode: 'create' | 'upload') => 
      dispatch({ type: 'SET_CREATION_MODE', payload: mode }),
    setJobInfo: (info: { hasSpecificJob?: boolean; jobTitle?: string; targetCompany?: string }) => 
      dispatch({ type: 'SET_JOB_INFO', payload: info }),
    setJobDescription: (description: string) => 
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: description }),
    setStrengths: (strengths: string[]) => 
      dispatch({ type: 'SET_STRENGTHS', payload: strengths }),
    setWorkStyle: (style: string) => 
      dispatch({ type: 'SET_WORK_STYLE', payload: style }),
    setSignature: (signature: any) => 
      dispatch({ type: 'SET_SIGNATURE', payload: signature }),
    resetState: () => dispatch({ type: 'RESET_STATE' })
  }

  return (
    <CoverLetterContext.Provider value={contextValue}>
      {children}
    </CoverLetterContext.Provider>
  )
}

export function useCoverLetter() {
  const context = useContext(CoverLetterContext)
  if (context === undefined) {
    throw new Error('useCoverLetter must be used within a CoverLetterProvider')
  }
  return context
}
import { useEffect, useState } from 'react'
import { useCVStore } from '@/store/cv-store'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

export function useCVPageCount(templateId?: string) {
  const [pageCount, setPageCount] = useState(1)
  const currentCV = useCVStore((state) => state.currentCV)
  
  useEffect(() => {
    if (!currentCV || !templateId) {
      setPageCount(1)
      return
    }

    // Calculate approximate page count based on content
    const calculatePageCount = () => {
      let contentLength = 0
      
      // Personal info section (always visible)
      if (currentCV.personal.fullName) contentLength += 150
      if (currentCV.personal.summary) contentLength += currentCV.personal.summary.length * 2
      
      // Experience section
      currentCV.experience.forEach(exp => {
        contentLength += 300 // Base space for each experience
        contentLength += (exp.description?.length || 0) * 1.5
        contentLength += exp.achievements.length * 80
      })
      
      // Education section
      currentCV.education.forEach(edu => {
        contentLength += 200 // Base space for each education
      })
      
      // Skills section
      if (currentCV.skills.length > 0) {
        contentLength += 100 + (currentCV.skills.length * 20)
      }
      
      // Projects section
      currentCV.projects?.forEach(project => {
        contentLength += 200
        contentLength += (project.description?.length || 0)
      })
      
      // Languages section
      if (currentCV.languages?.length > 0) {
        contentLength += 100 + (currentCV.languages.length * 30)
      }
      
      // Certifications section
      if (currentCV.certifications?.length > 0) {
        contentLength += 100 + (currentCV.certifications.length * 50)
      }
      
      // Interests section
      if (currentCV.interests?.length > 0) {
        contentLength += 100 + (currentCV.interests.length * 30)
      }
      
      // References section
      if (currentCV.references?.length > 0) {
        contentLength += 100 + (currentCV.references.length * 150)
      }
      
      // Approximate characters per page (adjusted for formatting)
      // Reduced to match actual A4 page capacity with margins
      const CHARS_PER_PAGE = 2800
      
      // Calculate pages with a minimum of 1
      const calculatedPages = Math.max(1, Math.ceil(contentLength / CHARS_PER_PAGE))
      setPageCount(calculatedPages)
    }

    calculatePageCount()
  }, [currentCV, templateId])

  return pageCount
}
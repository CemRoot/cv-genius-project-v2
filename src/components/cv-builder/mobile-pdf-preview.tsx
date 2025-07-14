'use client'

import dynamic from 'next/dynamic'
import { PDFTemplate } from '@/components/export/pdf-templates-core'
import { cvTemplates } from '@/lib/cv-templates/templates-data'
import { X } from 'lucide-react'

// Test kodunu kaldırdık - artık sadece gerçek PDFTemplate kullanılacak

// PDFViewer'ı sadece client-side'da yüklenecek şekilde dinamik olarak import et
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false, // Sunucuda render etmeyi engelle
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading Preview...</p>
        </div>
      </div>
    )
  }
)

interface MobilePDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  cvData: any
  template: any
}

export default function MobilePDFPreviewModal({ isOpen, onClose, cvData, template }: MobilePDFPreviewModalProps) {
  if (!isOpen) return null

  // Hata ayıklama için veri kontrolü
  console.log("🔍 Mobile Preview Modal is rendering with cvData:", cvData)
  console.log("🔍 Template data:", template)

  // Template prop'u direkt olarak kullan - Context'ten doğru veri geliyor
  console.log('🔍 Template Prop Debug:', template)

  // --- YENİ KORUMA KALKANI ---
  // Eğer veri hazır değilse, yükleniyor ekranı göster.
  if (!cvData) {
    return (
      <div className="lg:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex flex-col">
        <div className="bg-white p-4 flex justify-between items-center shadow-lg flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">CV Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 transition-colors p-1"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading CV data...</p>
          </div>
        </div>
      </div>
    )
  }
  // --- KORUMA KALKANI SONU ---

  // Convert CV Builder data to PDF format
  const experienceSection = cvData.sections.find((s: any) => s.type === 'experience')
  const educationSection = cvData.sections.find((s: any) => s.type === 'education')
  const skillsSection = cvData.sections.find((s: any) => s.type === 'skills')
  const languagesSection = cvData.sections.find((s: any) => s.type === 'languages')
  
  const transformedExperience = experienceSection?.items?.map((exp: any) => ({
    id: exp.id || `exp-${Math.random()}`,
    company: exp.company,
    position: exp.role,
    location: exp.location || '',
    startDate: exp.start,
    endDate: exp.end || '',
    current: exp.end === 'Present' || !exp.end,
    description: exp.bullets?.join(' • ') || '',
    role: exp.role,
    start: exp.start,
    end: exp.end
  })) || []
  
  const transformedEducation = educationSection?.items?.map((edu: any) => ({
    id: edu.id || `edu-${Math.random()}`,
    institution: edu.institution,
    degree: edu.degree,
    field: edu.field,
    location: edu.location || '',
    startDate: edu.start,
    endDate: edu.end || '',
    current: edu.end === 'Present' || !edu.end,
    grade: edu.grade,
    start: edu.start,
    end: edu.end
  })) || []
  
  const transformedLanguages = languagesSection?.items?.map((lang: any) => ({
    id: lang.id || `lang-${Math.random()}`,
    name: lang.name,
    level: lang.proficiency,
    certification: lang.certification,
    proficiency: lang.proficiency
  })) || []

  const cvDataForPDF = {
    id: cvData.id,
    personal: {
      fullName: cvData.personal.fullName,
      email: cvData.personal.email,
      phone: cvData.personal.phone,
      address: cvData.personal.address,
      linkedin: cvData.personal.linkedin,
      website: cvData.personal.website,
      title: cvData.personal.title,
      summary: cvData.sections.find((s: any) => s.type === 'summary')?.markdown,
      stamp: cvData.personal.workPermit
    },
    experience: transformedExperience,
    education: transformedEducation,
    skills: skillsSection?.items || [],
    languages: transformedLanguages,
    sections: cvData.sections,
    sectionVisibility: cvData.sectionVisibility || {},
    template: template?.id || 'classic'
  }

  return (
    <div className="lg:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex flex-col">
      {/* 1. Header (flex-shrink-0) */}
      <div className="bg-white p-4 flex justify-between items-center shadow-lg flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">CV Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-700 hover:text-gray-900 transition-colors p-1"
          aria-label="Close preview"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* 2. PDF Konteyneri (flex-1) - En Kritik Kısım! */}
      <div className="flex-1 w-full bg-white overflow-hidden">
        <div className="w-full h-full">
          <PDFViewer width="100%" height="100%" showToolbar={true}>
            {/* Gerçek PDFTemplate - template?.id ile güvenli fallback */}
            <PDFTemplate data={cvDataForPDF} template={template?.id || 'classic'} />
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}
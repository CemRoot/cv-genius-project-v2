import React from 'react'
import type { CVData } from '@/types/cv'

// Client-side only PDF template wrapper
export const PDFTemplate: React.FC<{ data: CVData; template?: string }> = ({ data, template }) => {
  // Ensure this only runs on client-side
  if (typeof window === 'undefined') {
    console.error('PDFTemplate attempted to render on server-side')
    return null
  }
  
  // Dynamic import wrapper - this will be handled by the PDF service
  return null
}

// Export placeholder functions for backward compatibility
export function ModernTemplate({ data }: { data: CVData }) {
  return null
}

export function ClassicTemplate({ data }: { data: CVData }) {
  return null
}

export function CreativeTemplate({ data }: { data: CVData }) {
  return null
}

export function HarvardTemplate({ data }: { data: CVData }) {
  return null
}

export function StockholmTemplate({ data }: { data: CVData }) {
  return null
}

export function DublinProfessionalTemplate({ data }: { data: CVData }) {
  return null
}

export function LondonTemplate({ data }: { data: CVData }) {
  return null
}

export function DublinTechTemplate({ data }: { data: CVData }) {
  return null
}

export function IrishFinanceTemplate({ data }: { data: CVData }) {
  return null
}

export function DublinPharmaTemplate({ data }: { data: CVData }) {
  return null
}
'use client'

import { useState } from 'react'
import { StaticTemplateGallery } from '../builder/web/components/static-template-gallery'

export default function BuilderSimplePage() {
  const [selected, setSelected] = useState<string | null>(null)
  
  if (selected) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Selected Template: {selected}</h1>
          <button 
            onClick={() => setSelected(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Templates
          </button>
          <div className="mt-8 p-8 bg-white rounded-lg shadow">
            <p>Template ID: {selected}</p>
            <p className="mt-4 text-green-600">✅ Templates are working correctly!</p>
          </div>
        </div>
      </div>
    )
  }
  
  return <StaticTemplateGallery onSelectTemplate={setSelected} />
}
'use client'

import { TemplateThumbnail } from '@/components/cv/template-thumbnail'

export function TemplateGalleryDebug() {
  const templates = ['classic', 'dublin-tech', 'irish-finance', 'dublin-pharma']
  
  return (
    <div className="p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Template Debug View</h1>
      <div className="grid grid-cols-2 gap-4">
        {templates.map(templateId => (
          <div key={templateId} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">{templateId}</h3>
            <div className="aspect-[210/297] bg-gray-200 border-2 border-red-500">
              <TemplateThumbnail templateId={templateId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
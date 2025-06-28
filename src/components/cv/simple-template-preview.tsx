'use client'

interface SimpleTemplatePreviewProps {
  templateId: string
}

const templateColors: Record<string, { bg: string; accent: string; text: string }> = {
  'classic': { bg: 'bg-white', accent: 'bg-black', text: 'text-black' },
  'dublin-tech': { bg: 'bg-white', accent: 'bg-blue-600', text: 'text-white' },
  'irish-finance': { bg: 'bg-white', accent: 'bg-green-800', text: 'text-white' },
  'dublin-pharma': { bg: 'bg-white', accent: 'bg-teal-600', text: 'text-white' },
  'irish-graduate': { bg: 'bg-white', accent: 'bg-indigo-600', text: 'text-white' },
  'dublin-creative': { bg: 'bg-white', accent: 'bg-purple-600', text: 'text-white' },
  'irish-healthcare': { bg: 'bg-white', accent: 'bg-blue-700', text: 'text-white' },
  'dublin-hospitality': { bg: 'bg-white', accent: 'bg-orange-600', text: 'text-white' },
  'irish-construction': { bg: 'bg-white', accent: 'bg-yellow-700', text: 'text-white' },
  'dublin-startup': { bg: 'bg-white', accent: 'bg-pink-600', text: 'text-white' },
  'irish-executive': { bg: 'bg-white', accent: 'bg-gray-800', text: 'text-white' },
  'dublin-retail': { bg: 'bg-white', accent: 'bg-red-600', text: 'text-white' },
  'irish-education': { bg: 'bg-white', accent: 'bg-emerald-600', text: 'text-white' }
}

export function SimpleTemplatePreview({ templateId }: SimpleTemplatePreviewProps) {
  const colors = templateColors[templateId] || { bg: 'bg-white', accent: 'bg-gray-600', text: 'text-white' }
  
  return (
    <div className={`w-full h-full ${colors.bg} p-3 flex flex-col`}>
      {/* Header */}
      <div className={`${colors.accent} ${colors.text} p-3 rounded-t-md mb-2`}>
        <div className="h-3 bg-white/30 rounded w-3/4 mb-1"></div>
        <div className="h-2 bg-white/20 rounded w-1/2"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Section 1 */}
        <div className="border-l-4 border-gray-300 pl-2">
          <div className={`h-2 ${colors.accent} rounded w-1/3 mb-1 opacity-80`}></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
            <div className="h-1 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        {/* Section 2 */}
        <div className="border-l-4 border-gray-300 pl-2">
          <div className={`h-2 ${colors.accent} rounded w-1/4 mb-1 opacity-80`}></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        
        {/* Section 3 */}
        <div className="border-l-4 border-gray-300 pl-2">
          <div className={`h-2 ${colors.accent} rounded w-2/5 mb-1 opacity-80`}></div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-1 bg-gray-200 rounded"></div>
            <div className="h-1 bg-gray-200 rounded"></div>
            <div className="h-1 bg-gray-200 rounded"></div>
            <div className="h-1 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="h-1 bg-gray-300 rounded w-1/4"></div>
          <div className="h-1 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  )
}
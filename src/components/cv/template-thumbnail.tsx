'use client'

interface TemplateThumbnailProps {
  templateId: string
}

const templateStyles: Record<string, { primary: string; secondary: string; accent: string }> = {
  'classic': { primary: 'bg-black', secondary: 'bg-white', accent: 'text-black' },
  'dublin-tech': { primary: 'bg-blue-600', secondary: 'bg-gray-100', accent: 'text-blue-600' },
  'irish-finance': { primary: 'bg-green-800', secondary: 'bg-gray-50', accent: 'text-green-800' },
  'dublin-pharma': { primary: 'bg-teal-600', secondary: 'bg-teal-50', accent: 'text-teal-600' },
  'irish-graduate': { primary: 'bg-indigo-600', secondary: 'bg-indigo-50', accent: 'text-indigo-600' },
  'dublin-creative': { primary: 'bg-purple-600', secondary: 'bg-purple-50', accent: 'text-purple-600' },
  'irish-healthcare': { primary: 'bg-blue-700', secondary: 'bg-blue-50', accent: 'text-blue-700' },
  'dublin-hospitality': { primary: 'bg-orange-600', secondary: 'bg-orange-50', accent: 'text-orange-600' },
  'irish-construction': { primary: 'bg-yellow-700', secondary: 'bg-yellow-50', accent: 'text-yellow-700' },
  'dublin-startup': { primary: 'bg-pink-600', secondary: 'bg-pink-50', accent: 'text-pink-600' },
  'irish-executive': { primary: 'bg-gray-800', secondary: 'bg-gray-100', accent: 'text-gray-800' },
  'dublin-retail': { primary: 'bg-red-600', secondary: 'bg-red-50', accent: 'text-red-600' },
  'irish-education': { primary: 'bg-emerald-600', secondary: 'bg-emerald-50', accent: 'text-emerald-600' }
}

export function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
  const style = templateStyles[templateId] || { primary: 'bg-gray-600', secondary: 'bg-gray-100', accent: 'text-gray-600' }
  
  // Different layouts based on template
  if (templateId === 'classic') {
    return (
      <div className="w-full h-full bg-white p-4 border">
        {/* Header - Centered Name */}
        <div className="text-center mb-4 border-b border-black pb-2">
          <div className="h-4 bg-black rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-2 bg-gray-400 rounded w-1/2 mx-auto mb-2"></div>
          <div className="flex justify-center gap-2 text-xs">
            <div className="h-1 bg-gray-300 rounded w-8"></div>
            <div className="w-1 text-center">•</div>
            <div className="h-1 bg-gray-300 rounded w-8"></div>
            <div className="w-1 text-center">•</div>
            <div className="h-1 bg-gray-300 rounded w-8"></div>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="mb-3">
          <div className="h-2 bg-black rounded w-1/4 mb-2 mx-auto border-b border-black"></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-5/6"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
        
        {/* Skills Section */}
        <div className="mb-3">
          <div className="h-2 bg-black rounded w-1/6 mb-2 mx-auto border-b border-black"></div>
          <div className="space-y-1">
            <div className="flex">
              <div className="h-1 bg-black rounded w-1/4 mr-2"></div>
              <div className="h-1 bg-gray-200 rounded flex-1"></div>
            </div>
            <div className="flex">
              <div className="h-1 bg-black rounded w-1/4 mr-2"></div>
              <div className="h-1 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
        
        {/* Experience Section */}
        <div>
          <div className="h-2 bg-black rounded w-1/3 mb-2 mx-auto border-b border-black"></div>
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-1.5 bg-black rounded w-3/4 mb-1"></div>
                <div className="h-1 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-1 bg-gray-300 rounded w-8"></div>
              </div>
            </div>
            <div className="space-y-0.5 ml-1">
              <div className="h-0.5 bg-gray-200 rounded w-full"></div>
              <div className="h-0.5 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-tech') {
    return (
      <div className="w-full h-full bg-white flex border-l-4 border-blue-600">
        {/* Left Sidebar */}
        <div className={`w-2/5 ${style.primary} p-3 text-white flex flex-col`}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2"></div>
            <div className="h-3 bg-white/90 rounded w-3/4 mx-auto mb-1"></div>
            <div className="h-2 bg-white/70 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="h-2 bg-white/80 rounded w-1/2 mb-1"></div>
              <div className="h-1 bg-white/60 rounded w-full"></div>
              <div className="h-1 bg-white/60 rounded w-4/5"></div>
            </div>
            <div>
              <div className="h-2 bg-white/80 rounded w-2/3 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-1 bg-white/60 rounded w-full"></div>
                <div className="h-1 bg-white/60 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Content */}
        <div className="w-3/5 p-3 space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <div className="h-4 bg-blue-600 rounded w-2/3 mb-1"></div>
            <div className="h-2 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div>
            <div className="h-2 bg-blue-600 rounded w-1/3 mb-1"></div>
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          <div>
            <div className="h-2 bg-blue-600 rounded w-1/4 mb-1"></div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-finance') {
    return (
      <div className="w-full h-full bg-white p-4">
        {/* Traditional Header */}
        <div className="text-center border-b-2 border-green-800 pb-3 mb-4">
          <div className="h-4 bg-green-800 rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-2 bg-gray-400 rounded w-1/2 mx-auto mb-1"></div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="h-1 bg-gray-300 rounded w-8"></div>
            <div className="h-1 bg-gray-300 rounded w-8"></div>
            <div className="h-1 bg-gray-300 rounded w-8"></div>
          </div>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-2">
            <div className="border-l-3 border-green-800 pl-2">
              <div className="h-2 bg-green-800 rounded w-1/2 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-1 bg-gray-200 rounded w-full"></div>
                <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                <div className="h-1 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
            <div className="border-l-3 border-green-800 pl-2">
              <div className="h-2 bg-green-800 rounded w-2/3 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-1 bg-gray-200 rounded w-full"></div>
                <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="bg-green-50 p-2 rounded">
              <div className="h-1.5 bg-green-800 rounded w-3/4 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-5/6"></div>
                <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
              </div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="h-1.5 bg-green-800 rounded w-2/3 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-pharma') {
    return (
      <div className="w-full h-full bg-teal-50 p-4">
        {/* Medical Header with Cross */}
        <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-0.5 bg-white"></div>
              <div className="w-0.5 h-2 bg-white absolute"></div>
            </div>
            <div className="h-3 bg-teal-600 rounded w-1/2"></div>
          </div>
          <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
          <div className="flex gap-2">
            <div className="h-1 bg-teal-400 rounded w-12"></div>
            <div className="h-1 bg-teal-400 rounded w-16"></div>
          </div>
        </div>
        
        {/* Clean Medical Sections */}
        <div className="space-y-2">
          <div className="bg-white rounded p-2 border-l-4 border-teal-600">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
              <div className="h-2 bg-teal-600 rounded w-1/3"></div>
            </div>
            <div className="space-y-0.5 ml-3">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          
          <div className="bg-white rounded p-2 border-l-4 border-teal-600">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
              <div className="h-2 bg-teal-600 rounded w-2/5"></div>
            </div>
            <div className="space-y-0.5 ml-3">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          
          <div className="bg-white rounded p-2 border-l-4 border-teal-600">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
              <div className="h-2 bg-teal-600 rounded w-1/4"></div>
            </div>
            <div className="grid grid-cols-2 gap-1 ml-3">
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-graduate') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        {/* Modern Young Header */}
        <div className="bg-white rounded-lg p-3 shadow-lg mb-3 border-t-4 border-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-indigo-600 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-400 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="h-1 bg-indigo-300 rounded-full w-6"></div>
            <div className="h-1 bg-purple-300 rounded-full w-8"></div>
            <div className="h-1 bg-indigo-300 rounded-full w-4"></div>
          </div>
        </div>
        
        {/* Fresh Graduate Sections */}
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-2 border-l-4 border-indigo-400">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded"></div>
              <div className="h-2 bg-indigo-600 rounded w-2/5"></div>
            </div>
            <div className="space-y-0.5 ml-2">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2 border-l-4 border-purple-400">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded"></div>
              <div className="h-2 bg-indigo-600 rounded w-1/3"></div>
            </div>
            <div className="space-y-0.5 ml-2">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
              <div className="h-2 bg-indigo-600 rounded w-1/4 ml-1"></div>
            </div>
            <div className="grid grid-cols-3 gap-1 ml-1">
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-creative') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 p-3 relative overflow-hidden">
        {/* Creative Geometric Background */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-purple-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 bg-pink-200 transform rotate-45 opacity-40"></div>
        
        {/* Artistic Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded w-3/4 mb-1"></div>
              <div className="h-1.5 bg-orange-400 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Creative Layout */}
          <div className="space-y-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-purple-200">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded w-1/3 ml-1"></div>
              </div>
              <div className="space-y-0.5">
                <div className="h-1 bg-gray-300 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-4/5"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/60 rounded p-1.5 border border-pink-200">
                <div className="h-1.5 bg-pink-500 rounded w-2/3 mb-1"></div>
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="bg-white/60 rounded p-1.5 border border-orange-200">
                <div className="h-1.5 bg-orange-500 rounded w-3/4 mb-1"></div>
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-purple-200">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 bg-purple-600 transform rotate-45"></div>
                <div className="w-1.5 h-1.5 bg-pink-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-orange-600 transform rotate-45"></div>
                <div className="h-1.5 bg-gradient-to-r from-purple-600 to-orange-600 rounded w-1/4 ml-1"></div>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                <div className="h-0.5 bg-purple-200 rounded"></div>
                <div className="h-0.5 bg-pink-200 rounded"></div>
                <div className="h-0.5 bg-orange-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-healthcare') {
    return (
      <div className="w-full h-full bg-white p-4">
        <div className="flex items-center gap-3 border-b-2 border-blue-700 pb-3 mb-3">
          <div className={`w-12 h-12 ${style.primary} rounded`}></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-gray-100 rounded w-full"></div>
          <div className="h-2 bg-gray-100 rounded w-5/6"></div>
          <div className="h-2 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-hospitality') {
    return (
      <div className="w-full h-full bg-white p-4">
        <div className={`${style.secondary} p-3 rounded mb-3`}>
          <div className="h-4 bg-gray-400 rounded w-3/4"></div>
          <div className="h-2 bg-gray-300 rounded w-1/2 mt-1"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`h-4 ${style.primary} rounded`}></div>
          <div className={`h-4 ${style.primary} rounded`}></div>
          <div className={`h-4 ${style.primary} rounded`}></div>
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-gray-100 rounded w-full"></div>
          <div className="h-2 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-construction') {
    return (
      <div className="w-full h-full bg-white p-4 border-l-4 border-yellow-700">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${style.primary} rounded`}></div>
            <div className="h-2 bg-gray-100 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${style.primary} rounded`}></div>
            <div className="h-2 bg-gray-100 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${style.primary} rounded`}></div>
            <div className="h-2 bg-gray-100 rounded flex-1"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-startup') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 p-3 relative overflow-hidden">
        {/* Tech Background Elements */}
        <div className="absolute top-1 right-1 w-6 h-6 border border-pink-400 rounded transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-1 left-1 w-4 h-4 bg-purple-400 rounded opacity-20"></div>
        <div className="absolute top-1/2 right-2 w-2 h-2 bg-pink-400 rounded-full opacity-40"></div>
        
        {/* Modern Dark Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl mb-2 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded w-2/3 mb-1"></div>
              <div className="h-1.5 bg-gray-400 rounded w-1/2"></div>
            </div>
            <div className="w-4 h-4 border-2 border-pink-400 rounded transform rotate-45"></div>
          </div>
          <div className="flex gap-1">
            <div className="h-1 bg-pink-300 rounded-full w-4"></div>
            <div className="h-1 bg-purple-300 rounded-full w-6"></div>
            <div className="h-1 bg-pink-300 rounded-full w-3"></div>
          </div>
        </div>
        
        {/* Startup Sections */}
        <div className="space-y-1.5">
          <div className="bg-white/90 rounded-lg p-2 border border-pink-200 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded"></div>
              <div className="h-2 bg-pink-600 rounded w-2/5"></div>
            </div>
            <div className="space-y-0.5">
              <div className="h-1 bg-gray-300 rounded w-full"></div>
              <div className="h-1 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/85 rounded-lg p-1.5 border border-purple-200">
              <div className="h-1.5 bg-purple-500 rounded w-3/4 mb-1"></div>
              <div className="h-0.5 bg-gray-300 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="bg-white/85 rounded-lg p-1.5 border border-pink-200">
              <div className="h-1.5 bg-pink-500 rounded w-2/3 mb-1"></div>
              <div className="h-0.5 bg-gray-300 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
          
          <div className="bg-white/90 rounded-lg p-2 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <div className="h-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded w-1/4 ml-1"></div>
            </div>
            <div className="grid grid-cols-4 gap-0.5">
              <div className="h-0.5 bg-pink-200 rounded"></div>
              <div className="h-0.5 bg-purple-200 rounded"></div>
              <div className="h-0.5 bg-pink-200 rounded"></div>
              <div className="h-0.5 bg-purple-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-executive') {
    return (
      <div className="w-full h-full bg-gray-50 p-4">
        {/* Executive Header with Gold Accent */}
        <div className="bg-white p-3 shadow-sm border-t-4 border-yellow-600 mb-3">
          <div className="text-center">
            <div className="h-4 bg-gray-900 rounded w-3/5 mx-auto mb-2"></div>
            <div className="h-2 bg-gray-600 rounded w-2/5 mx-auto mb-2"></div>
            <div className="h-1 bg-yellow-600 rounded w-1/3 mx-auto"></div>
          </div>
          <div className="flex justify-center gap-3 mt-3">
            <div className="h-1 bg-gray-400 rounded w-8"></div>
            <div className="h-1 bg-gray-400 rounded w-10"></div>
            <div className="h-1 bg-gray-400 rounded w-8"></div>
          </div>
        </div>
        
        {/* Executive Content */}
        <div className="space-y-2">
          <div className="bg-white p-2 border-l-4 border-gray-900 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-gray-900 rounded"></div>
              <div className="h-2 bg-gray-900 rounded w-2/5"></div>
            </div>
            <div className="space-y-0.5 ml-1">
              <div className="h-1 bg-gray-300 rounded w-full"></div>
              <div className="h-1 bg-gray-300 rounded w-5/6"></div>
              <div className="h-1 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 border border-gray-200 shadow-sm">
              <div className="h-2 bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
              </div>
            </div>
            <div className="bg-white p-2 border border-gray-200 shadow-sm">
              <div className="h-2 bg-gray-700 rounded w-2/3 mb-1"></div>
              <div className="space-y-0.5">
                <div className="h-0.5 bg-gray-300 rounded w-full"></div>
                <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 border-l-4 border-yellow-600 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <div className="h-2 bg-gray-900 rounded w-1/3"></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'dublin-retail') {
    return (
      <div className="w-full h-full bg-red-50 p-4">
        {/* Retail Header with Badge */}
        <div className="bg-white rounded-lg p-3 shadow-md mb-3 border-b-4 border-red-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-red-600 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-400 rounded w-1/2"></div>
            </div>
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
              <div className="h-1 bg-white rounded w-4"></div>
            </div>
          </div>
        </div>
        
        {/* Customer-Focused Sections */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded p-2 border border-red-200 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="h-2 bg-red-600 rounded w-3/4"></div>
              </div>
              <div className="space-y-0.5">
                <div className="h-1 bg-gray-200 rounded w-full"></div>
                <div className="h-1 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
            <div className="bg-white rounded p-2 border border-red-200 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="h-2 bg-red-600 rounded w-2/3"></div>
              </div>
              <div className="space-y-0.5">
                <div className="h-1 bg-gray-200 rounded w-full"></div>
                <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded p-2 border-l-4 border-red-600 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <div className="h-2 bg-red-600 rounded w-2/5"></div>
            </div>
            <div className="space-y-0.5">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-5/6"></div>
              <div className="h-1 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          
          <div className="bg-red-100 rounded p-2 border border-red-300">
            <div className="flex justify-between items-center mb-1">
              <div className="h-1.5 bg-red-600 rounded w-1/3"></div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-0.5">
              <div className="h-0.5 bg-red-300 rounded"></div>
              <div className="h-0.5 bg-red-300 rounded"></div>
              <div className="h-0.5 bg-red-300 rounded"></div>
              <div className="h-0.5 bg-red-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (templateId === 'irish-education') {
    return (
      <div className="w-full h-full bg-white p-4">
        <div className={`border-2 border-emerald-600 rounded p-3 mb-3`}>
          <div className="h-3 bg-gray-300 rounded w-3/4 mx-auto mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${style.primary} rounded-full`}></div>
            <div className="h-2 bg-gray-200 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${style.primary} rounded-full`}></div>
            <div className="h-2 bg-gray-200 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${style.primary} rounded-full`}></div>
            <div className="h-2 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    )
  }

  // Default layout for other templates
  return (
    <div className="w-full h-full bg-white p-4">
      <div className={`h-12 ${style.primary} rounded mb-3 opacity-80`}></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
        <div className="mt-3 space-y-1">
          <div className="h-2 bg-gray-100 rounded w-full"></div>
          <div className="h-2 bg-gray-100 rounded w-full"></div>
          <div className="h-2 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    </div>
  )
}
'use client'

export function CvBuilderLoading() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar Skeleton */}
        <div className="w-96 border-r border-gray-200 p-6">
          <div className="space-y-6">
            {/* Section Navigation */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Preview Area Skeleton */}
        <div className="flex-1 bg-gray-100 p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
            {/* Header */}
            <div className="space-y-3 mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Sections */}
            {[1, 2, 3].map((section) => (
              <div key={section} className="mb-8">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((line) => (
                    <div key={line} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
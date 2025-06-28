export default function TestTemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">CV Templates Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Classic Template - FEATURED */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow relative">
          {/* Featured Badge */}
          <div className="absolute top-2 right-2 z-10 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            RECOMMENDED
          </div>
          
          <div className="aspect-[210/297] bg-gray-100 p-4">
            <div className="bg-white h-full border border-gray-400 p-4">
              {/* Header Section */}
              <div className="text-center mb-3 pb-3 border-b border-gray-300">
                <div className="bg-black h-6 rounded w-3/4 mx-auto mb-2"></div>
                <div className="bg-gray-400 h-3 rounded w-1/2 mx-auto mb-2"></div>
                <div className="flex justify-center gap-2">
                  <div className="bg-gray-300 h-2 rounded w-16"></div>
                  <div className="bg-gray-300 h-2 rounded w-16"></div>
                  <div className="bg-gray-300 h-2 rounded w-16"></div>
                </div>
              </div>
              
              {/* Summary Section */}
              <div className="mb-3">
                <div className="bg-black h-3 rounded w-1/4 mb-2"></div>
                <div className="space-y-1">
                  <div className="bg-gray-200 h-1.5 rounded"></div>
                  <div className="bg-gray-200 h-1.5 rounded w-11/12"></div>
                  <div className="bg-gray-200 h-1.5 rounded w-10/12"></div>
                </div>
              </div>
              
              {/* Experience Section */}
              <div className="mb-3">
                <div className="bg-black h-3 rounded w-1/3 mb-2"></div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="bg-gray-600 h-2 rounded w-2/5"></div>
                      <div className="bg-gray-400 h-2 rounded w-1/4"></div>
                    </div>
                    <div className="bg-gray-300 h-1.5 rounded w-1/3 mb-1"></div>
                    <div className="space-y-0.5 ml-2">
                      <div className="bg-gray-200 h-1 rounded w-full"></div>
                      <div className="bg-gray-200 h-1 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills Section */}
              <div>
                <div className="bg-black h-3 rounded w-1/5 mb-2"></div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-gray-200 h-1.5 rounded"></div>
                  <div className="bg-gray-200 h-1.5 rounded"></div>
                  <div className="bg-gray-200 h-1.5 rounded"></div>
                  <div className="bg-gray-200 h-1.5 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50">
            <h3 className="font-bold text-xl mb-1">Classic Professional</h3>
            <p className="text-gray-700 text-sm mb-3">The gold standard for Irish job applications. ATS-optimized and recruiter-approved.</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">✓ ATS-Friendly</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">✓ Universal Format</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">✓ Professional</span>
            </div>
          </div>
        </div>
        
        {/* Dublin Tech Template */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
          <div className="aspect-[210/297] bg-gray-100 p-4">
            <div className="bg-white h-full border-2 border-blue-300 p-3">
              <div className="bg-blue-600 h-8 rounded mb-2"></div>
              <div className="bg-blue-300 h-4 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="bg-blue-100 h-2 rounded"></div>
                <div className="bg-blue-100 h-2 rounded w-5/6"></div>
                <div className="bg-blue-100 h-2 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg">Dublin Tech Professional</h3>
            <p className="text-gray-600 text-sm">Perfect for Dublin tech scene</p>
          </div>
        </div>
        
        {/* Irish Finance Template */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
          <div className="aspect-[210/297] bg-gray-100 p-4">
            <div className="bg-white h-full border-2 border-green-300 p-3">
              <div className="bg-green-800 h-8 rounded mb-2"></div>
              <div className="bg-green-300 h-4 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="bg-green-100 h-2 rounded"></div>
                <div className="bg-green-100 h-2 rounded w-5/6"></div>
                <div className="bg-green-100 h-2 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg">Irish Finance Expert</h3>
            <p className="text-gray-600 text-sm">Tailored for IFSC roles</p>
          </div>
        </div>
      </div>
    </div>
  )
}
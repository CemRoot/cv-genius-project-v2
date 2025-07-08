'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCVStore } from '@/store/cv-store'

export default function ExportPage() {
  const { currentCV, updateSessionState } = useCVStore()
  const router = useRouter()

  const handleBackToBuilder = () => {
    // Ensure user goes to form/editor, not template selection
    if (currentCV) {
      updateSessionState({
        selectedTemplateId: currentCV.template || 'harvard',
        builderMode: 'editor',
        mobileActiveTab: 'edit'
      })
    }
    router.push('/builder')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-h-[44px] touch-manipulation"
                onClick={handleBackToBuilder}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to CV Builder
              </Button>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Export Your CV
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Maintenance Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Settings className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Export Feature Temporarily Unavailable
          </h2>
          
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            We're currently upgrading our export functionality to provide you with an even better experience. 
            This feature will be back online soon.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Expected return: Soon</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            In the meantime, you can continue building and editing your CV. All your work is automatically saved.
          </p>
          
          <Button 
            onClick={handleBackToBuilder}
            className="flex items-center gap-2 mx-auto"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Building Your CV
          </Button>
        </div>
      </div>
    </div>
  )
}
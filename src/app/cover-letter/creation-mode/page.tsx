'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Upload } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'

export default function CreationModePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<'create' | 'upload' | null>(null)

  const handleModeSelect = (mode: 'create' | 'upload') => {
    setSelectedMode(mode)
    
    if (mode === 'create') {
      router.push('/cover-letter/customize')
    } else {
      router.push('/cover-letter/upload-resume')
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How do you want to start your cover letter?
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Letter Option */}
          <button
            onClick={() => handleModeSelect('create')}
            className={`group relative p-8 rounded-lg border-2 transition-all ${
              selectedMode === 'create'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-lg bg-white'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedMode === 'create' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'
              }`}>
                <FileText className={`w-8 h-8 ${
                  selectedMode === 'create' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Create a new letter
                </h3>
                <p className="text-gray-600">
                  Walk me through each step.
                </p>
              </div>
            </div>
          </button>

          {/* Upload from Resume Option */}
          <button
            onClick={() => handleModeSelect('upload')}
            className={`group relative p-8 rounded-lg border-2 transition-all ${
              selectedMode === 'upload'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-lg bg-white'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedMode === 'upload' ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'
              }`}>
                <Upload className={`w-8 h-8 ${
                  selectedMode === 'upload' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload from resume
                </h3>
                <p className="text-gray-600">
                  Create my cover letter with info from an existing resume.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Template Selection
          </Button>
        </div>
      </div>
      </div>
    </MainLayout>
  )
}
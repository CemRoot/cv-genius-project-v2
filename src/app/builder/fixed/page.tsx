'use client'

import { useState } from 'react'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FixedBuilderPage() {
  const [showForm, setShowForm] = useState(true)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">CV Builder</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              {showForm ? (
                <PersonalInfoForm />
              ) : (
                <p>Loading form...</p>
              )}
            </Card>
          </div>
          
          {/* Preview Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">CV Preview</h2>
              <div className="bg-gray-50 rounded p-4 min-h-[400px]">
                <p className="text-gray-500 text-center mt-20">
                  Your CV preview will appear here as you fill out the form
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
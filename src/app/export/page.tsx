import { ExportManager } from '@/components/export/export-manager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Link href="/builder">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to CV Builder
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Export Your CV
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download your professionally formatted CV in multiple formats optimized for the Irish job market.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExportManager />
      </div>
    </div>
  )
}
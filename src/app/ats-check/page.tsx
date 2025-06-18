import { ATSAnalyzer } from '@/components/ats/ats-analyzer'

export default function ATSCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ATS Compatibility Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analyze your CV for Applicant Tracking System (ATS) compatibility and get 
              optimization recommendations for the Irish job market.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ATSAnalyzer />
      </div>
    </div>
  )
}
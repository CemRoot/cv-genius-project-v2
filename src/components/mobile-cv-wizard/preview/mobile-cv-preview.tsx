'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCVStore } from '@/store/cv-store'
import { Eye, Download, Share2 } from 'lucide-react'

export function MobileCVPreview() {
  const { currentCV } = useCVStore()

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Preview</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {/* Personal Info */}
        {currentCV.personalInfo && (
          <div>
            <h4 className="font-semibold text-gray-900">
              {currentCV.personalInfo.fullName || 'Your Name'}
            </h4>
            <p className="text-gray-600">
              {currentCV.personalInfo.title || 'Professional Title'}
            </p>
            <p className="text-gray-500 text-xs">
              {currentCV.personalInfo.email} | {currentCV.personalInfo.phone}
            </p>
          </div>
        )}

        {/* Professional Summary */}
        {currentCV.professionalSummary && (
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Summary</h5>
            <p className="text-gray-600 text-xs line-clamp-3">
              {currentCV.professionalSummary}
            </p>
          </div>
        )}

        {/* Experience Preview */}
        {currentCV.experience && currentCV.experience.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Experience</h5>
            <p className="text-gray-600 text-xs">
              {currentCV.experience.length} position(s) added
            </p>
          </div>
        )}

        {/* Education Preview */}
        {currentCV.education && currentCV.education.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Education</h5>
            <p className="text-gray-600 text-xs">
              {currentCV.education.length} degree(s) added
            </p>
          </div>
        )}

        {/* Skills Preview */}
        {currentCV.skills && currentCV.skills.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Skills</h5>
            <div className="flex flex-wrap gap-1">
              {currentCV.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {currentCV.skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{currentCV.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
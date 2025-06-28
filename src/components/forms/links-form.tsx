'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link, Globe, Github, Linkedin, FileText } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import { ResponsiveInput } from '@/components/responsive/responsive-form'
import { ResponsiveText, ResponsiveHeading } from '@/components/responsive/responsive-text'

export function LinksForm() {
  const { currentCV, updatePersonalInfo } = useCVStore()

  if (!currentCV) return null

  const { linkedin, website, github, portfolio } = currentCV.personalInfo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <ResponsiveHeading level={3}>Links & Portfolio</ResponsiveHeading>
          <ResponsiveText size="sm" className="text-gray-600 mt-1">
            Add links to showcase your professional online presence
          </ResponsiveText>
        </div>
        <Link className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* LinkedIn */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Linkedin className="w-5 h-5 text-blue-600 mt-2" />
            <div className="flex-1">
              <ResponsiveInput
                label="LinkedIn Profile"
                value={linkedin || ''}
                onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourname"
                type="url"
                helperText="Your professional LinkedIn profile URL"
              />
            </div>
          </div>
        </Card>

        {/* Website */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-green-600 mt-2" />
            <div className="flex-1">
              <ResponsiveInput
                label="Personal Website"
                value={website || ''}
                onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                placeholder="https://yourwebsite.com"
                type="url"
                helperText="Your personal or professional website"
              />
            </div>
          </div>
        </Card>

        {/* GitHub */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Github className="w-5 h-5 text-gray-800 mt-2" />
            <div className="flex-1">
              <ResponsiveInput
                label="GitHub Profile"
                value={github || ''}
                onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                placeholder="https://github.com/yourusername"
                type="url"
                helperText="Showcase your code repositories (for developers)"
              />
            </div>
          </div>
        </Card>

        {/* Portfolio */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-purple-600 mt-2" />
            <div className="flex-1">
              <ResponsiveInput
                label="Portfolio"
                value={portfolio || ''}
                onChange={(e) => updatePersonalInfo({ portfolio: e.target.value })}
                placeholder="https://yourportfolio.com"
                type="url"
                helperText="Your creative portfolio or work samples"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <h4 className="font-medium text-sm mb-2">Pro Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• LinkedIn is essential for most professional roles</li>
          <li>• GitHub is crucial for software developers and engineers</li>
          <li>• Portfolio links are great for designers, writers, and creatives</li>
          <li>• Make sure all links are active and professional</li>
        </ul>
      </Card>
    </div>
  )
}
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Target, Briefcase, MapPin, Euro, Clock, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface JobAnalysis {
  requiredSkills: string[]
  preferredSkills: string[]
  experienceLevel: string
  keyResponsibilities: string[]
  companyInfo: string
  salaryRange: string
  keywords: string[]
  locationRequirements: string[]
  workArrangement: string
  applicationDeadline: string
  rawResponse?: string
}

export function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeJob = async () => {
    if (jobDescription.trim().length < 50) {
      setError('Job description must be at least 50 characters long')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job description')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-cvgenius-primary" />
            Job Description Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paste the complete job posting for best results</span>
              <span>{jobDescription.length} characters</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={analyzeJob}
              disabled={isAnalyzing || jobDescription.trim().length < 50}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze Job
                </>
              )}
            </Button>
            
            {analysis && (
              <Button 
                variant="outline"
                onClick={clearAnalysis}
                size="lg"
              >
                Clear
              </Button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <Target className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Job Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.experienceLevel && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Experience:</strong> {analysis.experienceLevel}
                      </span>
                    </div>
                  )}
                  
                  {analysis.salaryRange && analysis.salaryRange !== 'Not specified' && (
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Salary:</strong> {analysis.salaryRange}
                      </span>
                    </div>
                  )}
                  
                  {analysis.workArrangement && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Work Type:</strong> {analysis.workArrangement}
                      </span>
                    </div>
                  )}
                  
                  {analysis.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Deadline:</strong> {analysis.applicationDeadline}
                      </span>
                    </div>
                  )}
                </div>
                
                {analysis.companyInfo && analysis.companyInfo !== 'Not specified' && (
                  <div className="pt-3 border-t">
                    <h4 className="font-medium mb-2">Company Information</h4>
                    <p className="text-sm text-muted-foreground">{analysis.companyInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Skills */}
            {analysis.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Target className="h-5 w-5" />
                    Required Skills & Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.requiredSkills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="destructive" className="text-xs">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferred Skills */}
            {analysis.preferredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Users className="h-5 w-5" />
                    Preferred Skills & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.preferredSkills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Responsibilities */}
            {analysis.keyResponsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Key Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.keyResponsibilities.map((responsibility, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{responsibility}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* ATS Keywords */}
            {analysis.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    ATS Keywords Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Make sure these keywords appear in your CV for better ATS matching
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Location Requirements */}
            {analysis.locationRequirements && analysis.locationRequirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location & Work Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {analysis.locationRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-blue-600">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
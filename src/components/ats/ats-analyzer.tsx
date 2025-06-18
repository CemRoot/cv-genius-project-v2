"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle, Target, FileText, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ATSAnalysis {
  overallScore: number
  keywordDensity: {
    total: number
    matched: number
    missing: string[]
    density: { [key: string]: number }
  }
  formatScore: number
  sectionScore: number
  suggestions: string[]
  strengths: string[]
  warnings: string[]
  details: {
    contactInfo: { score: number; issues: string[] }
    experience: { score: number; issues: string[] }
    skills: { score: number; issues: string[] }
    education: { score: number; issues: string[] }
    formatting: { score: number; issues: string[] }
  }
}

export function ATSAnalyzer() {
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeATS = useCallback(async () => {
    if (!cvText.trim() || cvText.length < 100) {
      setError('CV text must be at least 100 characters long')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          cvText: cvText.trim(),
          jobDescription: jobDescription.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ATS analysis failed')
      }

      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        throw new Error('ATS analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze CV for ATS compatibility')
    } finally {
      setIsAnalyzing(false)
    }
  }, [cvText, jobDescription])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle
    if (score >= 60) return AlertTriangle
    return XCircle
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
            <Target className="h-5 w-5 text-cvgenius-primary" />
            ATS Compatibility Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cvText">Your CV Content</Label>
            <Textarea
              id="cvText"
              placeholder="Paste your CV text here for ATS analysis..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Copy and paste your CV content</span>
              <span>{cvText.length} characters</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description to check keyword matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include job description for keyword matching analysis
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={analyzeATS}
              disabled={isAnalyzing || cvText.trim().length < 100}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing ATS Compatibility...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze ATS Compatibility
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
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* ATS Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  ATS Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)} mb-2`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-2xl text-muted-foreground mb-4">out of 100</div>
                  <Progress value={analysis.overallScore} className="w-full h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.keywordDensity.matched / analysis.keywordDensity.total * 100)}`}>
                      {Math.round(analysis.keywordDensity.matched / analysis.keywordDensity.total * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Keywords</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.formatScore)}`}>
                      {analysis.formatScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Format</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.sectionScore)}`}>
                      {analysis.sectionScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Sections</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.strengths.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Strengths</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            {jobDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Keyword Matching Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.keywordDensity.density).map(([keyword, density]) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword} ({density}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {analysis.keywordDensity.missing.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordDensity.missing.map((keyword, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Section Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysis.details).map(([section, data]) => {
                    const Icon = getScoreIcon(data.score)
                    return (
                      <div key={section} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Icon className={`h-5 w-5 mt-0.5 ${getScoreColor(data.score)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{section.replace(/([A-Z])/g, ' $1')}</h4>
                            <span className={`text-sm font-medium ${getScoreColor(data.score)}`}>
                              {data.score}/100
                            </span>
                          </div>
                          {data.issues.length > 0 && (
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {data.issues.map((issue, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions and Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <TrendingUp className="h-5 w-5" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.warnings.map((warning, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Tips for Irish Market */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🇮🇪 ATS Best Practices for Irish Market</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Use standard section headings (Experience, Skills, Education)</li>
            <li>• Include relevant keywords from job descriptions naturally</li>
            <li>• Avoid graphics, tables, and complex formatting</li>
            <li>• Use standard fonts like Arial, Calibri, or Times New Roman</li>
            <li>• Include your Eircode and mobile number clearly</li>
            <li>• Use bullet points for achievements and responsibilities</li>
            <li>• Save as .docx or .pdf when submitting</li>
            <li>• Include both technical and soft skills sections</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
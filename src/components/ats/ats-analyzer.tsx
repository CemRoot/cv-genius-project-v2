"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle, Target, FileText, TrendingUp, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileCVUpload } from './mobile-cv-upload'

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
  irishMarketScore?: number
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
  atsSystemScores?: Record<string, number>
  rejectionRisk?: 'low' | 'medium' | 'high' | 'critical'
  industryAlignment?: number
  parsing?: {
    success: boolean
    extractedData: Record<string, any>
    parsingErrors: string[]
  }
  simulation?: {
    passed: boolean
    stage: string
    feedback: string[]
    nextSteps: string[]
  }
  report?: {
    summary: string
    keyFindings: string[]
    priorityActions: string[]
    score: number
    timestamp: string
  }
  formatValidation?: {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }
}

interface ATSAnalyzerProps {
  isMobile?: boolean
}

export function ATSAnalyzer({ isMobile = false }: ATSAnalyzerProps) {
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedATS, setSelectedATS] = useState<string>('auto')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'enterprise'>('enterprise')
  const [showFileUpload, setShowFileUpload] = useState(false)

  const atsOptions = [
    { value: 'auto', label: '🤖 Auto Detection', description: 'Tests against most common ATS systems' },
    { value: 'strict', label: '🔴 Strict Control', description: 'Applies strictest ATS parsing rules' },
    { value: 'moderate', label: '🟡 Moderate Level', description: 'Standard ATS compatibility check' },
    { value: 'flexible', label: '🟢 Flexible', description: 'Basic ATS compatibility check' }
  ]

  const industryOptions = [
    { value: 'technology', label: '💻 Technology', description: 'Software, IT, Engineering' },
    { value: 'finance', label: '💰 Finance', description: 'Banking, Accounting, Insurance' },
    { value: 'healthcare', label: '🏥 Healthcare', description: 'Medical, Nursing, Pharmacy' },
    { value: 'general', label: '📋 General', description: 'All industries' }
  ]

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
          jobDescription: jobDescription.trim(),
          analysisMode,
          targetATS: selectedATS,
          industry: selectedIndustry
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
  }, [cvText, jobDescription, analysisMode, selectedATS, selectedIndustry])

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
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
            <Target className="h-5 w-5 text-cvgenius-primary" />
            Professional ATS Compatibility Analyzer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enterprise-grade ATS analysis with real-time simulation and industry-specific insights
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Analysis Mode</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="basic"
                  name="analysisMode"
                  value="basic"
                  checked={analysisMode === 'basic'}
                  onChange={(e) => setAnalysisMode(e.target.value as 'basic' | 'enterprise')}
                  className="h-4 w-4"
                />
                <Label htmlFor="basic" className="text-sm">Basic Analysis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="enterprise"
                  name="analysisMode"
                  value="enterprise"
                  checked={analysisMode === 'enterprise'}
                  onChange={(e) => setAnalysisMode(e.target.value as 'basic' | 'enterprise')}
                  className="h-4 w-4"
                />
                <Label htmlFor="enterprise" className="text-sm font-medium text-cvgenius-primary">
                  Enterprise Analysis (Recommended)
                </Label>
              </div>
            </div>
          </div>

          {analysisMode === 'enterprise' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="atsSystem" className="flex items-center gap-2 text-base font-medium">
                    <Target className="h-5 w-5" />
                    ATS Control Level
                  </Label>
                  <p className="text-sm text-gray-600">Select how strictly your CV will be evaluated</p>
                  <select
                    id="atsSystem"
                    value={selectedATS}
                    onChange={(e) => setSelectedATS(e.target.value)}
                    className="w-full p-3 text-sm border rounded-md bg-white focus:ring-2 focus:ring-cvgenius-primary"
                  >
                    {atsOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {atsOptions.find(opt => opt.value === selectedATS)?.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {atsOptions.find(opt => opt.value === selectedATS)?.description}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="industry" className="flex items-center gap-2 text-base font-medium">
                    <FileText className="h-5 w-5" />
                    Target Industry
                  </Label>
                  <p className="text-sm text-gray-600">Select which industry to optimize your CV for</p>
                  <select
                    id="industry"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full p-3 text-sm border rounded-md bg-white focus:ring-2 focus:ring-cvgenius-primary"
                  >
                    {industryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {industryOptions.find(opt => opt.value === selectedIndustry)?.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {industryOptions.find(opt => opt.value === selectedIndustry)?.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="cvText" className="text-base font-medium">CV Content</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            </div>

            {/* File Upload Section */}
            {showFileUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <MobileCVUpload
                  onTextExtracted={(text, fileName) => {
                    setCvText(text)
                    setShowFileUpload(false)
                    if (fileName) {
                      setError(null)
                    }
                  }}
                  onError={(error) => {
                    setError(error)
                  }}
                />
              </motion.div>
            )}

            <Textarea
              id="cvText"
              placeholder="Paste your CV text here or upload PDF above for professional ATS analysis..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paste CV text or upload PDF file</span>
              <span className={cvText.length < 100 ? 'text-red-500' : ''}>
                {cvText.length} characters {cvText.length < 100 && '(minimum 100)'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description (Recommended)</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description to check keyword matching and ATS alignment..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Including job description enables advanced keyword matching and ATS simulation
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
                  {analysisMode === 'enterprise' ? 'Running Enterprise Analysis...' : 'Analyzing ATS Compatibility...'}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  {analysisMode === 'enterprise' ? 'Run Enterprise Analysis' : 'Analyze ATS Compatibility'}
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

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Professional ATS Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)} mb-2`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-2xl text-muted-foreground mb-4">out of 100</div>
                  <Progress value={analysis.overallScore} className="w-full h-3" />
                  
                  {analysis.rejectionRisk && (
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.rejectionRisk)}`}>
                        Rejection Risk: {analysis.rejectionRisk.toUpperCase()}
                      </span>
                    </div>
                  )}
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
                      {analysis.industryAlignment || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Industry Fit</div>
                  </div>
                </div>
              </CardContent>
                          </Card>

             {/* ATS System Scores */}
             {analysis.atsSystemScores && Object.keys(analysis.atsSystemScores).length > 0 && (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Target className="h-5 w-5 text-purple-600" />
                     ATS System Compatibility Scores
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {Object.entries(analysis.atsSystemScores).map(([system, score]) => (
                       <div key={system} className="flex items-center justify-between p-3 border rounded-lg">
                         <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                           <span className="font-medium capitalize">{system}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                             {score}%
                           </span>
                           <span className="text-sm text-muted-foreground">
                             {score >= 70 ? 'Pass' : 'Needs Work'}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* ATS Simulation Results */}
             {analysis.simulation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    ATS Processing Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {analysis.simulation.passed ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {analysis.simulation.passed ? 'Passed ATS Screening' : 'Failed ATS Screening'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Stopped at: {analysis.simulation.stage.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {analysis.simulation.feedback.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">ATS Feedback:</h4>
                        <ul className="space-y-1">
                          {analysis.simulation.feedback.map((feedback, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{feedback}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysis.simulation.nextSteps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommended Next Steps:</h4>
                        <ul className="space-y-1">
                          {analysis.simulation.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">→</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
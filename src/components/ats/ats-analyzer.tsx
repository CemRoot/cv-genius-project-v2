"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle, Target, FileText, TrendingUp, Upload, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileCVUpload } from './mobile-cv-upload'

interface ATSAnalysis {
  overallScore: number
  keywords: {
    total: number
    matched: number
    found: string[]
    missing: string[]
    density: number
  }
  formatScore: number
  sectionScore?: number
  keywordScore?: number
  structureScore?: number
  irishMarketScore?: number
  suggestions?: string[]
  strengths?: string[]
  warnings?: string[]
  recommendations?: string[]
  details?: {
    contactInfo: { score: number; issues: string[] }
    experience: { score: number; issues: string[] }
    skills: { score: number; issues: string[] }
    education: { score: number; issues: string[] }
    formatting: { score: number; issues: string[] }
  }
  structure?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  format?: {
    score: number
    issues: string[]
    warnings: string[]
  }
  aiAnalysis?: {
    keywordAnalysis: any
    contentAnalysis: any
    atsCompatibility: any
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
    systemResults?: {
      workday: 'PASS' | 'REVIEW' | 'FAIL'
      taleo: 'PASS' | 'REVIEW' | 'FAIL'
      greenhouse: 'PASS' | 'REVIEW' | 'FAIL'
      bamboohr: 'PASS' | 'REVIEW' | 'FAIL'
    }
    worstPerformer?: string
    averageScore?: number
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analysisMode = 'enterprise' // Always use enterprise mode
  const [showFileUpload, setShowFileUpload] = useState(false)

  const industryOptions = [
    { value: 'technology', label: '💻 Technology', description: 'Software, IT, Engineering, DevOps' },
    { value: 'finance', label: '💰 Finance', description: 'Banking, Accounting, Insurance, FinTech' },
    { value: 'healthcare', label: '🏥 Healthcare', description: 'Medical, Nursing, Pharmacy, MedTech' },
    { value: 'marketing', label: '📢 Marketing', description: 'Digital Marketing, PR, Content, SEO' },
    { value: 'sales', label: '🎯 Sales', description: 'Business Development, Account Management' },
    { value: 'hr', label: '👥 Human Resources', description: 'Recruitment, Training, Talent Management' },
    { value: 'legal', label: '⚖️ Legal', description: 'Law, Compliance, Legal Affairs' },
    { value: 'consulting', label: '💼 Consulting', description: 'Management, Strategy, Business Analysis' },
    { value: 'education', label: '🎓 Education', description: 'Teaching, Training, Academic Research' },
    { value: 'engineering', label: '🔧 Engineering', description: 'Mechanical, Civil, Chemical, Industrial' },
    { value: 'manufacturing', label: '🏭 Manufacturing', description: 'Production, Quality, Supply Chain' },
    { value: 'retail', label: '🛍️ Retail', description: 'Store Management, Customer Service, E-commerce' },
    { value: 'hospitality', label: '🏨 Hospitality', description: 'Hotels, Tourism, Food Service' },
    { value: 'logistics', label: '🚚 Logistics', description: 'Supply Chain, Transportation, Warehousing' },
    { value: 'media', label: '📺 Media', description: 'Journalism, Broadcasting, Content Creation' },
    { value: 'research', label: '🔬 Research', description: 'R&D, Scientific Research, Data Analysis' },
    { value: 'nonprofit', label: '🤝 Non-Profit', description: 'Charity, NGO, Social Services' },
    { value: 'government', label: '🏛️ Government', description: 'Public Service, Administration, Policy' },
    { value: 'general', label: '📋 General', description: 'All industries / Not specified' }
  ]

  // Helper function to extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    // This is a placeholder - in production, you'd use a proper PDF/DOCX parser
    // For now, we'll just return a message
    return 'File uploaded: ' + file.name + '\n\nPlease paste your CV text below for analysis.'
  }

  const analyzeATS = useCallback(async () => {
    if (!cvText.trim() || cvText.length < 100) {
      setError('CV text must be at least 100 characters long')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Get file data if uploaded
      const fileData = (window as any).uploadedFileData
      const fileName = (window as any).uploadedFileName
      const fileSize = (window as any).uploadedFileSize

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
          targetATS: 'auto', // Always use auto-detection
          industry: selectedIndustry,
          fileData: fileData || null,
          fileName: fileName || null,
          fileSize: fileSize || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ATS analysis failed')
      }

      // Check if the response has the expected analysis data structure
      if (data.overallScore !== undefined && data.keywordScore !== undefined) {
        setAnalysis(data)
      } else {
        throw new Error('ATS analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze CV for ATS compatibility')
    } finally {
      setIsAnalyzing(false)
    }
  }, [cvText, jobDescription, analysisMode, selectedIndustry])

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

  // Clear analysis when switching modes (removed since we only have enterprise mode)

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
          {/* File Upload Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Upload className="h-5 w-5" />
                Upload CV File (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
              >
                {showFileUpload ? 'Hide' : 'Show'} Upload
              </Button>
            </div>
            {showFileUpload && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Upload your PDF or DOCX file for enhanced parsing detection and format analysis
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = async (event) => {
                        const text = await extractTextFromFile(file)
                        setCvText(text)
                        // Store file data for enhanced analysis
                        const windowGlobal = window as any
                        windowGlobal.uploadedFileData = event.target?.result
                        windowGlobal.uploadedFileName = file.name
                        windowGlobal.uploadedFileSize = file.size
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cvgenius-primary file:text-white hover:file:bg-cvgenius-primary/90"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOCX, DOC (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Enterprise Analysis Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="industry" className="flex items-center gap-2 text-base font-medium">
                    <FileText className="h-5 w-5" />
                    Target Industry
                  </Label>
                  <p className="text-sm text-gray-600">Select your industry for specialized ATS optimization</p>
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
                
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Enterprise ATS Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Automatically tests your CV against major ATS systems used by Irish employers:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• <strong>Workday</strong> - Used by multinational corporations</li>
                    <li>• <strong>Oracle Taleo</strong> - Enterprise recruitment platform</li>
                    <li>• <strong>Greenhouse</strong> - Tech company favorite</li>
                    <li>• <strong>BambooHR</strong> - SME and startup choice</li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>PDF/DOCX Support:</strong> Upload your CV file for advanced parsing detection
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                  selectedIndustry={selectedIndustry}
                  autoImprove={true}
                />
              </motion.div>
            )}

            <Textarea
              id="cvText"
              placeholder="Paste your CV text here or upload PDF above for professional ATS analysis..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={8}
              className="resize-none touch-manipulation"
              style={{ minHeight: '200px' }}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Paste CV text or upload PDF file</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600">✅ Auto-AI optimization enabled</span>
                <span className={cvText.length < 100 ? 'text-red-500' : ''}>
                  {cvText.length} characters {cvText.length < 100 && '(minimum 100)'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">
              Job Description 
              <span className="text-amber-500 ml-1">(Recommended)</span>
              <span className="text-xs font-normal text-muted-foreground ml-2">- For specific job matching</span>
            </Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description to check keyword matching and ATS alignment..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none touch-manipulation"
              style={{ minHeight: '120px' }}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {jobDescription.trim().length === 0 ? (
                  <span className="text-amber-600">
                    💡 Without job description: General ATS compatibility check based on {selectedIndustry} industry
                  </span>
                ) : jobDescription.trim().length < 50 ? (
                  <span className="text-amber-500">
                    ⚠️ Add more details for better analysis (minimum 50 characters)
                  </span>
                ) : (
                  <span className="text-green-600">
                    ✅ Job-specific keyword matching enabled
                  </span>
                )}
              </p>
              <span className={`text-xs ${jobDescription.trim().length === 0 ? 'text-muted-foreground' : jobDescription.trim().length < 50 ? 'text-amber-500' : 'text-green-600'}`}>
                {jobDescription.length} characters
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={analyzeATS}
              disabled={isAnalyzing || cvText.trim().length < 100}
              className="flex-1"
              size="lg"
              title={
                cvText.trim().length < 100 
                  ? "CV text must be at least 100 characters" 
                  : jobDescription.trim().length === 0
                  ? "Analyze general ATS compatibility for " + selectedIndustry + " industry"
                  : jobDescription.trim().length < 50 
                  ? "Add more job description details for better analysis" 
                  : "Analyze CV against specific job requirements"
              }
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
            {/* Enhanced Format Analysis - Show if available */}
            {(analysis as any).enhancedFormatAnalysis && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    PDF/DOCX Parsing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Parsing Success Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Parsing Success Rate</span>
                        <span className={`text-sm font-bold ${getScoreColor((analysis as any).enhancedFormatAnalysis.parsingSuccessRate)}`}>
                          {(analysis as any).enhancedFormatAnalysis.parsingSuccessRate}%
                        </span>
                      </div>
                      <Progress value={(analysis as any).enhancedFormatAnalysis.parsingSuccessRate} className="h-2" />
                    </div>

                    {/* Format Issues */}
                    {(analysis as any).enhancedFormatAnalysis.parsingIssues && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {(analysis as any).enhancedFormatAnalysis.parsingIssues.hasTables && (
                          <Badge variant="destructive">Tables Detected</Badge>
                        )}
                        {(analysis as any).enhancedFormatAnalysis.parsingIssues.hasMultiColumn && (
                          <Badge variant="destructive">Multi-Column</Badge>
                        )}
                        {(analysis as any).enhancedFormatAnalysis.parsingIssues.hasScannedContent && (
                          <Badge variant="destructive">Scanned PDF</Badge>
                        )}
                        {(analysis as any).enhancedFormatAnalysis.parsingIssues.hasComplexFormatting && (
                          <Badge variant="secondary">Complex Format</Badge>
                        )}
                        {(analysis as any).enhancedFormatAnalysis.parsingIssues.layoutComplexity === 'complex' && (
                          <Badge variant="secondary">Complex Layout</Badge>
                        )}
                      </div>
                    )}

                    {/* Warnings */}
                    {(analysis as any).enhancedFormatAnalysis.warnings && (analysis as any).enhancedFormatAnalysis.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-orange-700">Format Warnings:</h4>
                        <ul className="space-y-1">
                          {(analysis as any).enhancedFormatAnalysis.warnings.map((warning: string, index: number) => (
                            <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parsing Errors - Show if available */}
            {(analysis as any).parsingErrors && (analysis as any).parsingErrors.length > 0 && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Parsing Errors Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analysis as any).parsingErrors.map((error: any, index: number) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                          <Badge variant={error.type === 'critical' ? 'destructive' : error.type === 'error' ? 'secondary' : 'outline'}>
                            {error.type.toUpperCase()}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{error.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{error.impact}</p>
                            {error.line && (
                              <p className="text-xs text-muted-foreground mt-1">Line: {error.line}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Analysis - Show if CV was rejected */}
            {(analysis as any).rejected && (analysis as any).rejectionAnalysis && (
              <Card className="border-2 border-red-500 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-6 w-6" />
                    CV Rejected by ATS
                  </CardTitle>
                  <p className="text-sm text-red-600 mt-2">
                    Rejection Stage: <strong>{(analysis as any).rejectionAnalysis.rejectionStage}</strong>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Rejection Reasons:</h4>
                      <ul className="space-y-2">
                        {(analysis as any).rejectionAnalysis.reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">How to Fix:</h4>
                      <ul className="space-y-2">
                        {(analysis as any).rejectionAnalysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                      <p className="text-sm font-medium text-yellow-800">
                        {(analysis as any).rejectionAnalysis.fixable 
                          ? '✨ Good news: These issues can be fixed!'
                          : '⚠️ This document needs to be recreated from scratch.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.keywords.matched / analysis.keywords.total * 100)}`}>
                      {Math.round(analysis.keywords.matched / analysis.keywords.total * 100)}%
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
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.sectionScore || analysis.structureScore || 0)}`}>
                      {analysis.sectionScore || analysis.structureScore || 0}
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

             {/* Enhanced Enterprise ATS Analysis */}
             {analysis.atsSystemScores && (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Building className="h-5 w-5 text-purple-600" />
                     Enterprise ATS Analysis
                     <Badge variant="outline" className="ml-2">Research-Based</Badge>
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                     Automatically tests your CV against major ATS systems used by Irish employers
                   </p>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {/* Workday */}
                     <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/30">
                       <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${analysis.atsSystemScores.workday >= 70 ? 'bg-green-500' : analysis.atsSystemScores.workday >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                           <div>
                             <span className="font-medium">Workday</span>
                             <p className="text-xs text-muted-foreground">Used by multinational corporations</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.workday)}`}>
                             {analysis.atsSystemScores.workday}%
                           </span>
                           <p className="text-xs">
                             {analysis.simulation?.systemResults?.workday ? (
                               <Badge variant={analysis.simulation.systemResults.workday === 'PASS' ? 'default' : analysis.simulation.systemResults.workday === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                                 {analysis.simulation.systemResults.workday}
                               </Badge>
                             ) : (
                               <span className={getScoreColor(analysis.atsSystemScores.workday)}>
                                 {analysis.atsSystemScores.workday >= 70 ? 'PASS' : analysis.atsSystemScores.workday >= 45 ? 'REVIEW' : 'FAIL'}
                               </span>
                             )}
                           </p>
                         </div>
                       </div>
                       <p className="text-xs text-muted-foreground">
                         Advanced NLP & contextual keyword matching - focuses on professional context
                       </p>
                     </div>

                     {/* Oracle Taleo */}
                     <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-50/30">
                       <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${analysis.atsSystemScores.taleo >= 60 ? 'bg-green-500' : analysis.atsSystemScores.taleo >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                           <div>
                             <span className="font-medium">Oracle Taleo</span>
                             <p className="text-xs text-muted-foreground">Enterprise recruitment platform</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.taleo)}`}>
                             {analysis.atsSystemScores.taleo}%
                           </span>
                           <p className="text-xs">
                             {analysis.simulation?.systemResults?.taleo ? (
                               <Badge variant={analysis.simulation.systemResults.taleo === 'PASS' ? 'default' : analysis.simulation.systemResults.taleo === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                                 {analysis.simulation.systemResults.taleo}
                               </Badge>
                             ) : (
                               <span className={getScoreColor(analysis.atsSystemScores.taleo)}>
                                 {analysis.atsSystemScores.taleo >= 60 ? 'PASS' : analysis.atsSystemScores.taleo >= 40 ? 'REVIEW' : 'FAIL'}
                               </span>
                             )}
                           </p>
                         </div>
                       </div>
                       <p className="text-xs text-muted-foreground">
                         4-criteria scoring (Profile/Education/Experience/Skills) + boolean logic
                       </p>
                     </div>

                     {/* Greenhouse */}
                     <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-50/30">
                       <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${analysis.atsSystemScores.greenhouse >= 70 ? 'bg-green-500' : analysis.atsSystemScores.greenhouse >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                           <div>
                             <span className="font-medium">Greenhouse</span>
                             <p className="text-xs text-muted-foreground">Tech company favorite</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.greenhouse)}`}>
                             {analysis.atsSystemScores.greenhouse}%
                           </span>
                           <p className="text-xs">
                             {analysis.simulation?.systemResults?.greenhouse ? (
                               <Badge variant={analysis.simulation.systemResults.greenhouse === 'PASS' ? 'default' : analysis.simulation.systemResults.greenhouse === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                                 {analysis.simulation.systemResults.greenhouse}
                               </Badge>
                             ) : (
                               <span className={getScoreColor(analysis.atsSystemScores.greenhouse)}>
                                 {analysis.atsSystemScores.greenhouse >= 70 ? 'PASS' : analysis.atsSystemScores.greenhouse >= 50 ? 'REVIEW' : 'FAIL'}
                               </span>
                             )}
                           </p>
                         </div>
                       </div>
                       <p className="text-xs text-muted-foreground">
                         Tech-focused scoring with emphasis on projects, GitHub links & skills
                       </p>
                     </div>

                     {/* BambooHR */}
                     <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-50/30">
                       <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${analysis.atsSystemScores.bamboohr >= 65 ? 'bg-green-500' : analysis.atsSystemScores.bamboohr >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                           <div>
                             <span className="font-medium">BambooHR</span>
                             <p className="text-xs text-muted-foreground">SME and startup choice</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.bamboohr)}`}>
                             {analysis.atsSystemScores.bamboohr}%
                           </span>
                           <p className="text-xs">
                             {analysis.simulation?.systemResults?.bamboohr ? (
                               <Badge variant={analysis.simulation.systemResults.bamboohr === 'PASS' ? 'default' : analysis.simulation.systemResults.bamboohr === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                                 {analysis.simulation.systemResults.bamboohr}
                               </Badge>
                             ) : (
                               <span className={getScoreColor(analysis.atsSystemScores.bamboohr)}>
                                 {analysis.atsSystemScores.bamboohr >= 65 ? 'PASS' : analysis.atsSystemScores.bamboohr >= 45 ? 'REVIEW' : 'FAIL'}
                               </span>
                             )}
                           </p>
                         </div>
                       </div>
                       <p className="text-xs text-muted-foreground">
                         Skills-heavy scoring with cultural fit & teamwork emphasis
                       </p>
                     </div>

                     {/* Overall Summary */}
                     {analysis.simulation?.averageScore && (
                       <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                         <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-medium">Overall ATS Performance</h4>
                             <p className="text-sm text-muted-foreground">
                               Average across all major systems
                             </p>
                           </div>
                           <div className="text-right">
                             <span className={`text-2xl font-bold ${getScoreColor(analysis.simulation.averageScore)}`}>
                               {analysis.simulation.averageScore}%
                             </span>
                             <p className="text-sm">
                               <Badge variant={analysis.simulation.riskLevel === 'low' ? 'default' : analysis.simulation.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                                 {analysis.simulation.riskLevel?.toUpperCase()} RISK
                               </Badge>
                             </p>
                           </div>
                         </div>
                         
                         {analysis.simulation.worstPerformer && (
                           <div className="mt-3 pt-3 border-t">
                             <p className="text-sm text-muted-foreground">
                               <span className="font-medium">Weakest System:</span> {analysis.simulation.worstPerformer}
                               {analysis.simulation.worstPerformer === 'workday' && ' (needs better contextual language)'}
                               {analysis.simulation.worstPerformer === 'taleo' && ' (needs exact keyword matches)'}
                               {analysis.simulation.worstPerformer === 'greenhouse' && ' (needs stronger tech content)'}
                               {analysis.simulation.worstPerformer === 'bamboohr' && ' (needs better cultural fit indicators)'}
                             </p>
                           </div>
                         )}
                       </div>
                     )}
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
                        {analysis.keywords.found.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {analysis.keywords.missing.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.missing.map((keyword: string, index: number) => (
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
                  {Object.entries(analysis.details || {}).map(([section, data]) => {
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
              {(analysis.strengths && analysis.strengths.length > 0) && (
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

              {((analysis.suggestions && analysis.suggestions.length > 0) || (analysis.recommendations && analysis.recommendations.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <TrendingUp className="h-5 w-5" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(analysis.suggestions || analysis.recommendations || []).map((suggestion, index) => (
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

            {((analysis.warnings && analysis.warnings.length > 0) || (analysis.format?.warnings && analysis.format.warnings.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysis.warnings || analysis.format?.warnings || []).map((warning, index) => (
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
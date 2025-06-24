"use client"

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle, Target, FileText, TrendingUp, Upload, Camera, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMobileFileUpload } from '@/hooks/use-mobile-file-upload'
import { useMobileKeyboard } from '@/hooks/mobile-hooks'
import { MobileInput } from '@/components/ui/mobile-input'
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

interface MobileATSAnalyzerProps {
  isMobile?: boolean
}

export function MobileATSAnalyzer({ isMobile = true }: MobileATSAnalyzerProps) {
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('general')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analysisMode = 'enterprise' // Always use enterprise mode
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const { isVisible: isKeyboardOpen, adjustedViewHeight } = useMobileKeyboard()

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mobile file upload hook
  const {
    files,
    uploading,
    error: uploadError,
    addFiles,
    clearFiles,
    fileInputProps,
    dragProps,
    startCamera,
    capturePhoto,
    isCameraActive
  } = useMobileFileUpload(undefined, {
    accept: '.pdf,.doc,.docx,.txt',
    multiple: false,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    enableCamera: false, // Disabled for document upload
    onFileSelect: handleFileSelect
  })

  // Extract text from uploaded file
  async function handleFileSelect(selectedFiles: File[]) {
    if (selectedFiles.length === 0) return
    
    const file = selectedFiles[0]
    try {
      const text = await extractTextFromFile(file)
      setCvText(text)
      setShowFileUpload(false)
    } catch (err) {
      setError(`Failed to extract text from file: ${err}`)
    }
  }

  // Simple text extraction (in production, use proper PDF/DOCX parsers)
  async function extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (file.type === 'text/plain') {
          resolve(result)
        } else {
          // For PDF/DOCX, you'd use proper parsers here
          // For now, just return filename as placeholder
          resolve(`Content from ${file.name} - Please paste CV text manually for best results.`)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }


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

  const analyzeATS = useCallback(async () => {
    if (!cvText.trim() || cvText.length < 100) {
      setError('CV text must be at least 100 characters long')
      return
    }

    // Require job description on mobile for better analysis
    if (isMobile && !jobDescription.trim()) {
      setError('Job description is required for accurate ATS analysis')
      // Focus the job description field
      const jobDescField = document.getElementById('job-description')
      if (jobDescField) {
        jobDescField.scrollIntoView({ behavior: 'smooth', block: 'center' })
        jobDescField.focus({ preventScroll: true })
      }
      return
    }

    // Performance optimization: Warn for very large CVs on mobile
    if (isMobile && cvText.length > 8000) {
      const proceed = window.confirm(
        'Your CV is quite large. This may take longer to analyze on mobile. Continue?'
      )
      if (!proceed) return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Optimize payload for mobile
      const optimizedCvText = isMobile && cvText.length > 10000 
        ? cvText.substring(0, 10000) + '...' 
        : cvText.trim()

      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'mobile-user',
          'User-Agent': navigator.userAgent
        },
        body: JSON.stringify({
          cvText: optimizedCvText,
          jobDescription: jobDescription.trim(),
          analysisMode,
          targetATS: 'auto', // Always use auto-detection
          industry: selectedIndustry
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
      let errorMessage = 'Failed to analyze CV for ATS compatibility'
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a shorter CV.'
        } else {
          errorMessage = err.message
        }
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.'
      }
      
      setError(errorMessage)
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
    setExpandedSection(null)
  }

  // Clear analysis when switching modes (removed since we only have enterprise mode)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Mobile-optimized viewport
  const containerStyle = isMobile && isKeyboardOpen 
    ? { height: adjustedViewHeight, overflow: 'auto' } 
    : {}

  return (
    <div className="space-y-4 p-4" style={containerStyle}>
      {/* Mobile-first Input Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-cvgenius-primary" />
            Mobile ATS Analyzer
            {!isOnline && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                Offline
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick ATS compatibility check optimized for mobile
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enterprise Analysis Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-3">
                <label htmlFor="target-industry" className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Target Industry
                </label>
                <p className="text-sm text-gray-600">Select your industry for specialized ATS optimization</p>
                <div className="relative">
                  <select
                    id="target-industry"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full p-4 text-base border-2 rounded-lg bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-cvgenius-primary focus:border-cvgenius-primary touch-manipulation"
                    style={{ minHeight: '48px' }}
                    aria-describedby="industry-description"
                  >
                    {industryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {industryOptions.find(opt => opt.value === selectedIndustry)?.description && (
                  <p id="industry-description" className="text-sm text-gray-500 bg-white p-2 rounded-md border">
                    {industryOptions.find(opt => opt.value === selectedIndustry)?.description}
                  </p>
                )}
                <div className="mt-3 p-3 bg-white rounded-md border">
                  <p className="text-sm text-gray-700">
                    <strong>Enterprise Analysis:</strong> Tests compatibility with major ATS systems (Workday, Taleo, Greenhouse, BambooHR) used by Irish employers.
                  </p>
                </div>
              </div>
            </div>

          {/* CV Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="cv-content" className="text-base font-medium">CV Content</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="flex items-center gap-2 text-sm px-3 py-2"
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
                className="mt-2"
              >
                <MobileCVUpload
                  onTextExtracted={(text, fileName) => {
                    setCvText(text)
                    setShowFileUpload(false)
                    if (fileName) {
                      setError(null) // Clear any previous errors
                      // Show success message
                      const successDiv = document.createElement('div')
                      successDiv.className = 'text-green-600 text-sm mt-2'
                      successDiv.textContent = `✓ Successfully extracted text from ${fileName}`
                      setTimeout(() => successDiv.remove(), 3000)
                    }
                  }}
                  onError={(error) => {
                    setError(error)
                    setShowFileUpload(false) // Close upload on error
                  }}
                  selectedIndustry={selectedIndustry}
                  autoImprove={true}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg"
                />
                <div className="flex justify-between mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(false)}
                    className="text-gray-500"
                  >
                    Cancel Upload
                  </Button>
                  <span className="text-xs text-gray-500">
                    PDF, DOC, DOCX supported (max 5MB)
                  </span>
                </div>
              </motion.div>
            )}

            <textarea
              id="cv-content"
              placeholder="Paste your CV text here or upload PDF above..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={6}
              className="w-full p-4 text-base border-2 rounded-lg resize-none focus:ring-2 focus:ring-cvgenius-primary focus:border-cvgenius-primary touch-manipulation"
              style={{ minHeight: '140px' }}
              aria-describedby="cv-content-help"
            />
            <div id="cv-content-help" className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Paste CV text or upload PDF file</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600">✅ Auto-AI optimization enabled</span>
                <span className={cvText.length < 100 ? 'text-red-500' : ''}>
                  {cvText.length} characters {cvText.length < 100 && '(minimum 100)'}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <label htmlFor="job-description" className="text-base font-medium">
              Job Description <span className="text-red-500">*</span>
              <span className="text-sm font-normal text-gray-600 ml-2">(Required for accurate analysis)</span>
            </label>
            <textarea
              id="job-description"
              placeholder="Paste job description to improve keyword matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onFocus={(e) => {
                // Prevent auto-scroll on mobile
                if (isMobile) {
                  e.preventDefault()
                  const element = e.target
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element.focus({ preventScroll: true })
                  }, 100)
                }
              }}
              required
              rows={4}
              className="w-full p-4 text-base border-2 rounded-lg resize-none focus:ring-2 focus:ring-cvgenius-primary focus:border-cvgenius-primary touch-manipulation"
              style={{ minHeight: '120px' }}
              aria-describedby="job-description-help"
              aria-required="true"
            />
            <p id="job-description-help" className="text-sm text-gray-600">
              Adding job description provides more detailed analysis and keyword suggestions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={analyzeATS}
              disabled={isAnalyzing || cvText.trim().length < 100 || !isOnline}
              className="flex-1 h-12"
              size="lg"
              aria-label={isAnalyzing ? 'Analysis in progress' : 'Start ATS analysis'}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {analysisMode === 'enterprise' ? 'Running Enterprise Analysis...' : 'Analyzing ATS Compatibility...'}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  {analysisMode === 'enterprise' ? 'Run Enterprise Analysis' : 'Analyze ATS Compatibility'}
                </>
              )}
            </Button>
            
            {analysis && (
              <Button 
                variant="outline"
                onClick={clearAnalysis}
                size="lg"
                className="h-12 px-6"
                aria-label="Clear analysis results"
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

      {/* Mobile-Optimized Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
            role="region"
            aria-label="ATS Analysis Results"
          >
            {/* Score Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)} mb-2`}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">ATS Score</div>
                  <Progress value={analysis.overallScore} className="w-full h-2 mb-4" />
                  
                  {analysis.rejectionRisk && (
                    <Badge className={getRiskColor(analysis.rejectionRisk)}>
                      Risk: {analysis.rejectionRisk.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className={`text-xl font-bold ${getScoreColor(analysis.keywords.matched / analysis.keywords.total * 100)}`}>
                      {Math.round(analysis.keywords.matched / analysis.keywords.total * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Keywords</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className={`text-xl font-bold ${getScoreColor(analysis.formatScore)}`}>
                      {analysis.formatScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Format</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise ATS Analysis - Mobile Optimized */}
            {analysis.atsSystemScores && (
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleSection('enterprise')}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-purple-600" />
                      Enterprise ATS Analysis
                      <Badge variant="outline" className="ml-2 text-xs">Research-Based</Badge>
                    </div>
                    <span className="text-sm">
                      {expandedSection === 'enterprise' ? '−' : '+'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSection === 'enterprise' && (
                  <CardContent>
                    <div className="space-y-3">
                      {/* Workday - Mobile Compact */}
                      <div className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/30">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.atsSystemScores.workday >= 70 ? 'bg-green-500' : analysis.atsSystemScores.workday >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-medium text-sm">Workday</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.workday)}`}>
                              {analysis.atsSystemScores.workday}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Multinational corporations</p>
                        {analysis.simulation?.systemResults?.workday && (
                          <Badge variant={analysis.simulation.systemResults.workday === 'PASS' ? 'default' : analysis.simulation.systemResults.workday === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                            {analysis.simulation.systemResults.workday}
                          </Badge>
                        )}
                      </div>

                      {/* Oracle Taleo - Mobile Compact */}
                      <div className="p-3 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-50/30">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.atsSystemScores.taleo >= 60 ? 'bg-green-500' : analysis.atsSystemScores.taleo >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-medium text-sm">Oracle Taleo</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.taleo)}`}>
                              {analysis.atsSystemScores.taleo}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Enterprise platform</p>
                        {analysis.simulation?.systemResults?.taleo && (
                          <Badge variant={analysis.simulation.systemResults.taleo === 'PASS' ? 'default' : analysis.simulation.systemResults.taleo === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                            {analysis.simulation.systemResults.taleo}
                          </Badge>
                        )}
                      </div>

                      {/* Greenhouse - Mobile Compact */}
                      <div className="p-3 border rounded-lg bg-gradient-to-r from-green-50 to-green-50/30">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.atsSystemScores.greenhouse >= 70 ? 'bg-green-500' : analysis.atsSystemScores.greenhouse >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-medium text-sm">Greenhouse</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.greenhouse)}`}>
                              {analysis.atsSystemScores.greenhouse}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Tech companies</p>
                        {analysis.simulation?.systemResults?.greenhouse && (
                          <Badge variant={analysis.simulation.systemResults.greenhouse === 'PASS' ? 'default' : analysis.simulation.systemResults.greenhouse === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                            {analysis.simulation.systemResults.greenhouse}
                          </Badge>
                        )}
                      </div>

                      {/* BambooHR - Mobile Compact */}
                      <div className="p-3 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-50/30">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.atsSystemScores.bamboohr >= 65 ? 'bg-green-500' : analysis.atsSystemScores.bamboohr >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-medium text-sm">BambooHR</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreColor(analysis.atsSystemScores.bamboohr)}`}>
                              {analysis.atsSystemScores.bamboohr}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">SME & startups</p>
                        {analysis.simulation?.systemResults?.bamboohr && (
                          <Badge variant={analysis.simulation.systemResults.bamboohr === 'PASS' ? 'default' : analysis.simulation.systemResults.bamboohr === 'REVIEW' ? 'secondary' : 'destructive'} className="text-xs">
                            {analysis.simulation.systemResults.bamboohr}
                          </Badge>
                        )}
                      </div>

                      {/* Mobile Summary */}
                      {analysis.simulation?.averageScore && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">Overall Performance</h4>
                              <p className="text-xs text-muted-foreground">
                                Average: {analysis.simulation.averageScore}%
                              </p>
                            </div>
                            <Badge variant={analysis.simulation.riskLevel === 'low' ? 'default' : analysis.simulation.riskLevel === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                              {analysis.simulation.riskLevel?.toUpperCase()} RISK
                            </Badge>
                          </div>
                          
                          {analysis.simulation.worstPerformer && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Focus on:</span> {analysis.simulation.worstPerformer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Expandable Sections */}
            {analysis.strengths.length > 0 && (
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleSection('strengths')}
                >
                  <CardTitle className="flex items-center justify-between text-green-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Strengths ({analysis.strengths.length})
                    </div>
                    <span className="text-sm">
                      {expandedSection === 'strengths' ? '−' : '+'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSection === 'strengths' && (
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )}

            {analysis.suggestions.length > 0 && (
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleSection('suggestions')}
                >
                  <CardTitle className="flex items-center justify-between text-blue-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Suggestions ({analysis.suggestions.length})
                    </div>
                    <span className="text-sm">
                      {expandedSection === 'suggestions' ? '−' : '+'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSection === 'suggestions' && (
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )}

            {analysis.warnings.length > 0 && (
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleSection('warnings')}
                >
                  <CardTitle className="flex items-center justify-between text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Critical Issues ({analysis.warnings.length})
                    </div>
                    <span className="text-sm">
                      {expandedSection === 'warnings' ? '−' : '+'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSection === 'warnings' && (
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Mobile Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">🇮🇪 Mobile ATS Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use simple bullet points (• or -)</li>
                  <li>• Include Irish location and work status</li>
                  <li>• Keep formatting minimal for mobile compatibility</li>
                  <li>• Use standard section headings</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
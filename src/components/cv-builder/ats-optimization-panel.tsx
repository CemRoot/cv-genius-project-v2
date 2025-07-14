"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Target, 
  Zap, 
  Eye,
  ChevronDown,
  ChevronUp,
  Bot,
  FileCheck,
  Lightbulb,
  Shield,
  Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ATSCVOptimizer, ATSOptimizationResult } from '@/lib/ats-cv-optimizer'
import { CvBuilderDocument } from '@/types/cv-builder'

interface ATSOptimizationPanelProps {
  cvData: CvBuilderDocument
  jobDescription?: string
  industry?: string
  onOptimizationChange?: (suggestions: string[]) => void
}

export function ATSOptimizationPanel({ 
  cvData, 
  jobDescription, 
  industry = 'technology',
  onOptimizationChange 
}: ATSOptimizationPanelProps) {
  const [optimization, setOptimization] = useState<ATSOptimizationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [selectedTab, setSelectedTab] = useState('overview')

  // Extract keywords from job description
  const extractJobKeywords = useCallback((jobDesc: string): string[] => {
    if (!jobDesc) return []
    
    const commonKeywords = [
      'experience', 'skills', 'knowledge', 'proficiency', 'expertise',
      'management', 'development', 'analysis', 'communication', 'leadership'
    ]
    
    const words = jobDesc.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonKeywords.includes(word))
    
    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word)
  }, [])

  // Perform ATS analysis
  const analyzeATS = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      const jobKeywords = jobDescription ? extractJobKeywords(jobDescription) : []
      const optimizer = new ATSCVOptimizer(cvData, { jobKeywords, industry })
      const result = optimizer.analyzeATS()
      
      setOptimization(result)
      
      // Notify parent of high-priority suggestions
      if (onOptimizationChange) {
        const criticalSuggestions = result.recommendations
          .filter(r => r.priority === 'critical' || r.priority === 'high')
          .slice(0, 3)
          .map(r => r.solution)
        onOptimizationChange(criticalSuggestions)
      }
    } catch (error) {
      console.error('ATS analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [cvData, jobDescription, industry, extractJobKeywords, onOptimizationChange])

  // Auto-analyze when CV data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeATS()
    }, 1000) // Debounce analysis

    return () => clearTimeout(timer)
  }, [analyzeATS])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-800'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle
    if (score >= 60) return AlertTriangle
    return XCircle
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-800 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
          <Bot className="h-12 w-12 text-blue-600 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-ping" />
          </div>
        </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Analyzing ATS Compatibility</h3>
              <p className="text-sm text-gray-600 mt-1">Checking your CV against ATS requirements...</p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!optimization) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">ATS Analysis Ready</h3>
            <p className="text-sm text-gray-600 mt-1">Add content to your CV to see ATS compatibility analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">ATS Optimization</CardTitle>
        </div>
          <Button variant="outline" size="sm" onClick={analyzeATS}>
            <Zap className="h-4 w-4 mr-1" />
            Re-analyze
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overall ATS Score</h3>
            <Badge className={`${getRiskColor(optimization.rejectionRisk)} px-3 py-1`}>
              {optimization.rejectionRisk.toUpperCase()} RISK
            </Badge>
          </div>
          
          {!jobDescription && (
            <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 mb-3">
              <span className="font-medium">Note:</span> Basic ATS analysis based on general requirements. Add a job description for targeted optimization.
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Compatibility Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(optimization.overallScore)}`}>
                  {optimization.overallScore}%
                </span>
              </div>
              <Progress 
                value={optimization.overallScore} 
                className="h-3"
              />
            </div>
            <div className="flex-shrink-0">
              {React.createElement(getScoreIcon(optimization.overallScore), {
                className: `h-8 w-8 ${getScoreColor(optimization.overallScore)}`
              })}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {optimization.warnings.length > 0 && (
          <div className="space-y-2">
            {optimization.warnings.slice(0, 3).map((warning, index) => (
              <Alert key={index} className={`border-l-4 ${warning.severity === 'error' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {warning.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="systems">ATS Systems</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Top Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                Priority Recommendations
              </h4>
              <div className="space-y-2">
                {optimization.recommendations.slice(0, 5).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.category.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{rec.solution}</p>
                        <p className="text-xs text-gray-600 mt-1">{rec.impact}</p>
                      </div>
                      {rec.autoFixable && (
                        <Button size="sm" variant="outline" className="ml-2">
                          Auto Fix
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {optimization.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-green-500" />
                  Strengths
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {optimization.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <h4 className="font-semibold text-gray-900">Section Analysis</h4>
            <div className="space-y-3">
              {Object.entries(optimization.sections).map(([sectionName, analysis]) => (
                <div key={sectionName}>
                  <button 
                    className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => toggleSection(sectionName)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${analysis.atsCompliant ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium capitalize">{sectionName}</span>
                      <Badge variant="outline" className={getScoreColor(analysis.score)}>
                        {analysis.score}%
                      </Badge>
                    </div>
                    {expandedSections[sectionName] ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  
                  {expandedSections[sectionName] && (
                    <div className="mt-2 p-3 bg-white border rounded-lg">
                      {analysis.issues.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-red-700 mb-2">Issues:</h5>
                          <ul className="text-sm text-red-600 space-y-1">
                            {analysis.issues.map((issue, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.suggestions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-blue-700 mb-2">Suggestions:</h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Keyword Performance</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Found Keywords</span>
                      <Badge className="bg-green-100 text-green-800">
                        {optimization.keywords.relevantKeywords.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {optimization.keywords.relevantKeywords.slice(0, 10).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-green-700 border-green-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-800">Missing Keywords</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {optimization.keywords.missingKeywords.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {optimization.keywords.missingKeywords.slice(0, 8).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-orange-700 border-orange-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Keyword Metrics</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Keyword Density</span>
                      <span className="text-lg font-bold text-blue-600">
                        {optimization.keywords.density.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, optimization.keywords.density * 10)} 
                      className="h-2 mt-2"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      {optimization.keywords.overOptimization ? 'Warning: Possible over-optimization' : 'Good keyword distribution'}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800">Contextual Placement</span>
                      <span className="text-lg font-bold text-purple-600">
                        {optimization.keywords.contextualPlacement}%
                      </span>
                    </div>
                    <Progress 
                      value={optimization.keywords.contextualPlacement} 
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="systems" className="space-y-4">
            <h4 className="font-semibold text-gray-900">ATS System Compatibility</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(optimization.compatibility).map(([system, score]) => (
                <div key={system} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium capitalize text-gray-900">{system}</h5>
                    <Badge className={`${getScoreColor(score)} border`}>
                      {score}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={score} 
                    className="h-2 mb-2"
                  />
                  
                  <p className="text-xs text-gray-600">
                    {score >= 80 ? 'Excellent compatibility' : 
                     score >= 60 ? 'Good compatibility' : 
                     score >= 40 ? 'Needs improvement' : 
                     'Poor compatibility'}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">System Notes</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Workday:</strong> Focuses on contextual keyword matching and experience relevance</li>
                <li>• <strong>Greenhouse:</strong> Tech-friendly with smart parsing for technical roles</li>
                <li>• <strong>Lever:</strong> Emphasizes recent experience and portfolio links</li>
                <li>• <strong>iCIMS:</strong> Strong education and certification requirements</li>
                <li>• <strong>Taleo:</strong> Basic keyword matching with complete contact info requirements</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 
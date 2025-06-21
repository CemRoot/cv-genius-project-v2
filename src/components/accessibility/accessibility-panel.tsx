'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  Smartphone, 
  Brain,
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import {
  runAccessibilityTests,
  generateAccessibilityReport,
  type AccessibilityReport,
  type AccessibilityTestResult,
  type AccessibilityIssue
} from '@/lib/accessibility-testing'

interface AccessibilityPanelProps {
  onClose?: () => void
}

const CATEGORY_ICONS = {
  visual: Eye,
  keyboard: Keyboard,
  'screen-reader': Volume2,
  mobile: Smartphone,
  cognitive: Brain
}

const SEVERITY_COLORS = {
  critical: 'destructive',
  serious: 'destructive',
  moderate: 'secondary',
  minor: 'outline'
} as const

export default function AccessibilityPanel({ onClose }: AccessibilityPanelProps) {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())

  const runTests = async () => {
    setLoading(true)
    try {
      const newReport = await generateAccessibilityReport()
      setReport(newReport)
    } catch (error) {
      console.error('Failed to run accessibility tests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleTest = (testId: string) => {
    const newExpanded = new Set(expandedTests)
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId)
    } else {
      newExpanded.add(testId)
    }
    setExpandedTests(newExpanded)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConformanceColor = (level: string) => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'AA':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'A':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  if (loading && !report) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Running Accessibility Tests...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Accessibility Test Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Unable to run accessibility tests. Please try again.
          </p>
          <Button onClick={runTests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Tests
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Accessibility Report</CardTitle>
              <CardDescription>
                WCAG 2.1 compliance analysis for CVGenius mobile experience
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={runTests} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Testing...' : 'Retest'}
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Score */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(report.overall.score)}`}>
                {report.overall.score}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <Progress value={report.overall.score} className="mt-2" />
            </div>
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getConformanceColor(report.overall.conformanceLevel)}`}>
                WCAG {report.overall.conformanceLevel}
              </div>
              <div className="text-sm text-gray-600 mt-2">Conformance Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {Object.values(report.categories).reduce((sum, cat) => sum + cat.totalIssues, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
          </div>

          <p className="text-center text-gray-700 bg-gray-50 p-4 rounded-lg">
            {report.overall.summary}
          </p>
        </CardContent>
      </Card>

      {/* Device & Mobile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Touch Target Size</span>
                <Badge variant={report.mobile.touchTargetSize ? 'default' : 'destructive'}>
                  {report.mobile.touchTargetSize ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Gesture Alternatives</span>
                <Badge variant={report.mobile.gestureAlternatives ? 'default' : 'destructive'}>
                  {report.mobile.gestureAlternatives ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Orientation Support</span>
                <Badge variant={report.mobile.orientationSupport ? 'default' : 'destructive'}>
                  {report.mobile.orientationSupport ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Zoom Support</span>
                <Badge variant={report.mobile.zoomSupport ? 'default' : 'destructive'}>
                  {report.mobile.zoomSupport ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mobile Device</span>
                <Badge variant={report.device.mobile ? 'default' : 'secondary'}>
                  {report.device.mobile ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Screen Reader</span>
                <Badge variant={report.device.screenReader ? 'default' : 'secondary'}>
                  {report.device.screenReader ? 'Available' : 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reduced Motion</span>
                <Badge variant={report.device.reducedMotion ? 'default' : 'secondary'}>
                  {report.device.reducedMotion ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">High Contrast</span>
                <Badge variant={report.device.highContrast ? 'default' : 'secondary'}>
                  {report.device.highContrast ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(report.categories).map(([category, data]) => {
          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
          const isExpanded = expandedCategories.has(category)

          return (
            <Card key={category}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    <div>
                      <CardTitle className="capitalize">{category.replace('-', ' ')}</CardTitle>
                      <CardDescription>
                        {data.criticalIssues > 0 && (
                          <span className="text-red-600 font-medium">
                            {data.criticalIssues} critical issues
                          </span>
                        )}
                        {data.criticalIssues === 0 && data.totalIssues > 0 && (
                          <span className="text-yellow-600">
                            {data.totalIssues} issues found
                          </span>
                        )}
                        {data.totalIssues === 0 && (
                          <span className="text-green-600">All tests passed</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-semibold ${getScoreColor(data.score)}`}>
                      {Math.round(data.score)}%
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {data.tests.map((test) => {
                      const isTestExpanded = expandedTests.has(test.testId)
                      
                      return (
                        <div key={test.testId} className="border rounded-lg">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleTest(test.testId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {test.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <div>
                                  <div className="font-medium">{test.testId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                  <div className="text-sm text-gray-600">
                                    WCAG {test.wcagLevel} • Score: {test.score}%
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {test.issues.length > 0 && (
                                  <Badge variant="secondary">
                                    {test.issues.length} issues
                                  </Badge>
                                )}
                                {isTestExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </div>
                          </div>
                          
                          {isTestExpanded && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                              {test.issues.length > 0 ? (
                                <div className="space-y-3 mt-4">
                                  <h4 className="font-medium text-red-700">Issues Found:</h4>
                                  {test.issues.map((issue, index) => (
                                    <div key={index} className="bg-white p-3 rounded border">
                                      <div className="flex items-start gap-3">
                                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                          issue.severity === 'critical' || issue.severity === 'serious' 
                                            ? 'text-red-500' 
                                            : 'text-yellow-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={SEVERITY_COLORS[issue.severity]} size="sm">
                                              {issue.severity}
                                            </Badge>
                                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                              {issue.element}
                                            </code>
                                          </div>
                                          <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                                          <p className="text-xs text-blue-600 mb-1">
                                            WCAG {issue.wcagCriteria}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            💡 {issue.suggestion}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded text-sm">
                                  ✅ All checks passed for this test
                                </div>
                              )}
                              
                              {test.recommendations.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {test.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Enable High Contrast</div>
                <div className="text-sm text-gray-600">Improve visual accessibility</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Reduce Motion</div>
                <div className="text-sm text-gray-600">Minimize animations and transitions</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Increase Font Size</div>
                <div className="text-sm text-gray-600">Make text easier to read</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Keyboard Navigation</div>
                <div className="text-sm text-gray-600">Navigate without mouse</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
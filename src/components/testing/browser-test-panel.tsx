'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  Zap,
  Monitor,
  Smartphone,
  Info,
  RefreshCw
} from 'lucide-react'
import {
  testBrowserCompatibility,
  checkBrowserVersion,
  runPerformanceBenchmark,
  generateCompatibilityReport,
  CompatibilityResult,
  BrowserInfo,
  BROWSER_FEATURES
} from '@/lib/browser-compatibility'

interface PerformanceResult {
  canvasPerformance: number
  jsPerformance: number
  memoryUsage: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export function BrowserTestPanel() {
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null)
  const [performanceResult, setPerformanceResult] = useState<PerformanceResult | null>(null)
  const [isTestingCompatibility, setIsTestingCompatibility] = useState(false)
  const [isTestingPerformance, setIsTestingPerformance] = useState(false)
  const [hasRunInitialTest, setHasRunInitialTest] = useState(false)

  // Run initial compatibility test on mount
  useEffect(() => {
    if (!hasRunInitialTest) {
      runCompatibilityTest()
      setHasRunInitialTest(true)
    }
  }, [hasRunInitialTest])

  const runCompatibilityTest = async () => {
    setIsTestingCompatibility(true)
    try {
      const result = await testBrowserCompatibility()
      setCompatibilityResult(result)
    } catch (error) {
      console.error('Compatibility test failed:', error)
    } finally {
      setIsTestingCompatibility(false)
    }
  }

  const runPerformanceTest = async () => {
    setIsTestingPerformance(true)
    try {
      const result = await runPerformanceBenchmark()
      setPerformanceResult(result)
    } catch (error) {
      console.error('Performance test failed:', error)
    } finally {
      setIsTestingPerformance(false)
    }
  }

  const downloadReport = () => {
    if (!compatibilityResult) return

    const report = generateCompatibilityReport(compatibilityResult)
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `browser-compatibility-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSupportBadgeVariant = (support: string) => {
    switch (support) {
      case 'full': return 'default'
      case 'partial': return 'secondary'
      case 'unsupported': return 'destructive'
      default: return 'outline'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600'
      case 'B': return 'text-blue-600'
      case 'C': return 'text-yellow-600'
      case 'D': return 'text-orange-600'
      case 'F': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getBrowserIcon = (browserName: string) => {
    // In a real app, you'd use actual browser icons
    return <Globe className="h-5 w-5" />
  }

  const getDeviceIcon = (mobile: boolean) => {
    return mobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />
  }

  if (!compatibilityResult && isTestingCompatibility) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Testing Browser Compatibility...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-pulse text-muted-foreground mb-2">
                Analyzing browser features and capabilities
              </div>
              <Progress value={undefined} className="w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!compatibilityResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Browser Compatibility Test</CardTitle>
          <CardDescription>
            Test your browser's compatibility with CVGenius features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runCompatibilityTest} disabled={isTestingCompatibility}>
            <Globe className="h-4 w-4 mr-2" />
            Run Compatibility Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { browser, overallSupport, criticalIssues, recommendations, score } = compatibilityResult
  const versionCheck = checkBrowserVersion(browser)

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getBrowserIcon(browser.name)}
            Browser Compatibility Report
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your browser's CVGenius compatibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getDeviceIcon(browser.mobile)}
              <div>
                <div className="font-medium">{browser.name} {browser.version}</div>
                <div className="text-sm text-muted-foreground">{browser.engine}</div>
              </div>
            </div>
            <div>
              <div className="font-medium">{browser.os}</div>
              <div className="text-sm text-muted-foreground">
                {browser.mobile ? 'Mobile Device' : 'Desktop Device'}
              </div>
            </div>
            <div>
              <Badge variant={getSupportBadgeVariant(overallSupport)} className="mb-1">
                {overallSupport}
              </Badge>
              <div className="text-sm text-muted-foreground">Overall Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{score}/100</div>
              <div className="text-sm text-muted-foreground">Compatibility Score</div>
            </div>
          </div>

          {/* Version Check */}
          <div className={`p-3 rounded-lg ${
            versionCheck.recommended ? 'bg-green-50 dark:bg-green-900/20' :
            versionCheck.meets ? 'bg-yellow-50 dark:bg-yellow-900/20' :
            'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-start gap-2">
              {versionCheck.recommended ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : versionCheck.meets ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <div className="font-medium">{versionCheck.message}</div>
              </div>
            </div>
          </div>

          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                    Critical Issues Found
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {criticalIssues.slice(0, 3).map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                    {criticalIssues.length > 3 && (
                      <li>• and {criticalIssues.length - 3} more issues...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Recommendations
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={runCompatibilityTest} disabled={isTestingCompatibility}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingCompatibility ? 'animate-spin' : ''}`} />
              Retest Compatibility
            </Button>
            <Button onClick={runPerformanceTest} disabled={isTestingPerformance} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              {isTestingPerformance ? 'Testing...' : 'Test Performance'}
            </Button>
            <Button onClick={downloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Feature Support</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Support Details</CardTitle>
              <CardDescription>
                Detailed breakdown of browser feature compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BROWSER_FEATURES.map((feature) => {
                  const isSupported = browser.features[feature.name]
                  return (
                    <div key={feature.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {isSupported ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{feature.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {feature.name}
                            {!isSupported && feature.fallback && (
                              <span className="text-yellow-600"> • {feature.fallback}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isSupported ? 'default' : 'destructive'}>
                          {isSupported ? 'Supported' : 'Missing'}
                        </Badge>
                        {feature.required && (
                          <Badge variant="outline">Required</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Benchmark
              </CardTitle>
              <CardDescription>
                Browser performance analysis for CVGenius features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!performanceResult ? (
                <div className="text-center py-8">
                  <Button onClick={runPerformanceTest} disabled={isTestingPerformance}>
                    <Zap className="h-4 w-4 mr-2" />
                    {isTestingPerformance ? 'Running Benchmark...' : 'Run Performance Test'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getGradeColor(performanceResult.overallGrade)}`}>
                        {performanceResult.overallGrade}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Grade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceResult.canvasPerformance.toFixed(1)}ms</div>
                      <div className="text-sm text-muted-foreground">Canvas Rendering</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceResult.jsPerformance.toFixed(1)}ms</div>
                      <div className="text-sm text-muted-foreground">JavaScript Execution</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{performanceResult.memoryUsage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Canvas Performance</span>
                        <span>{performanceResult.canvasPerformance.toFixed(1)}ms</span>
                      </div>
                      <Progress 
                        value={Math.min(100, Math.max(0, 100 - (performanceResult.canvasPerformance / 5)))} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>JavaScript Performance</span>
                        <span>{performanceResult.jsPerformance.toFixed(1)}ms</span>
                      </div>
                      <Progress 
                        value={Math.min(100, Math.max(0, 100 - performanceResult.jsPerformance))} 
                        className="h-2"
                      />
                    </div>
                    {performanceResult.memoryUsage > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Efficiency</span>
                          <span>{performanceResult.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, Math.max(0, 100 - performanceResult.memoryUsage))} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={runPerformanceTest} disabled={isTestingPerformance} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isTestingPerformance ? 'animate-spin' : ''}`} />
                    Rerun Benchmark
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your CVGenius experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <div className="text-lg font-medium">Your browser is optimally configured!</div>
                    <div className="text-muted-foreground">
                      All features should work perfectly with CVGenius.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          {recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* General tips */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-3">General Optimization Tips</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• Keep your browser updated for the latest features and security patches</div>
                    <div>• Close unnecessary tabs to free up memory</div>
                    <div>• Enable hardware acceleration for better graphics performance</div>
                    <div>• Clear browser cache regularly to avoid conflicts</div>
                    <div>• Use a stable internet connection for best experience</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BrowserTestPanel
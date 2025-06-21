'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Filter
} from 'lucide-react'
import {
  TestDevice,
  TestScenario,
  TestResult,
  generateTestMatrix,
  analyzeTestResults,
  getAutomatableTests,
  getManualTests,
  ALL_TEST_DEVICES,
  ALL_TEST_SCENARIOS
} from '@/lib/mobile-testing'

interface TestRunnerProps {
  onTestComplete?: (results: TestResult[]) => void
}

export function TestRunner({ onTestComplete }: TestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTest, setCurrentTest] = useState<{device: TestDevice, scenario: TestScenario} | null>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [progress, setProgress] = useState(0)
  const [selectedTests, setSelectedTests] = useState<Array<{device: TestDevice, scenario: TestScenario}>>([])
  const [filter, setFilter] = useState<{
    category: string
    priority: string
    automatable: string
  }>({
    category: 'all',
    priority: 'all',
    automatable: 'all'
  })

  const testMatrix = generateTestMatrix()
  const automatableTests = getAutomatableTests()
  const manualTests = getManualTests()

  // Filter tests based on current filter settings
  const filteredTests = testMatrix.filter(({device, scenario}) => {
    if (filter.category !== 'all' && scenario.category !== filter.category) return false
    if (filter.priority !== 'all' && scenario.priority !== filter.priority) return false
    if (filter.automatable !== 'all') {
      const isAutomatable = scenario.automatable
      if (filter.automatable === 'yes' && !isAutomatable) return false
      if (filter.automatable === 'no' && isAutomatable) return false
    }
    return true
  })

  // Initialize selected tests
  useEffect(() => {
    setSelectedTests(filteredTests)
  }, [])

  // Simulate automated test execution
  const runAutomatedTest = useCallback(async (device: TestDevice, scenario: TestScenario): Promise<TestResult> => {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

    // Simulate test results with some realistic failure rates
    const shouldPass = Math.random() > 0.1 // 90% pass rate for simulation
    
    const result: TestResult = {
      deviceId: device.name,
      scenarioId: scenario.id,
      status: shouldPass ? 'pass' : 'fail',
      issues: shouldPass ? [] : [`Issue on ${device.name}: ${scenario.name} failed`],
      performanceMetrics: scenario.category === 'performance' ? {
        loadTime: Math.random() * 3000 + 500,
        firstContentfulPaint: Math.random() * 2000 + 200,
        largestContentfulPaint: Math.random() * 4000 + 1000,
        interactionToNextPaint: Math.random() * 200 + 50,
        cumulativeLayoutShift: Math.random() * 0.3
      } : undefined,
      timestamp: new Date(),
      tester: 'Automated'
    }

    return result
  }, [])

  // Start test execution
  const startTests = useCallback(async () => {
    if (selectedTests.length === 0) return

    setIsRunning(true)
    setIsPaused(false)
    setResults([])
    setProgress(0)

    const newResults: TestResult[] = []

    for (let i = 0; i < selectedTests.length; i++) {
      if (isPaused) {
        setIsRunning(false)
        return
      }

      const test = selectedTests[i]
      setCurrentTest(test)

      if (test.scenario.automatable) {
        try {
          const result = await runAutomatedTest(test.device, test.scenario)
          newResults.push(result)
        } catch (error) {
          newResults.push({
            deviceId: test.device.name,
            scenarioId: test.scenario.id,
            status: 'fail',
            issues: ['Test execution failed'],
            timestamp: new Date(),
            tester: 'Automated'
          })
        }
      } else {
        // For manual tests, create a placeholder result
        newResults.push({
          deviceId: test.device.name,
          scenarioId: test.scenario.id,
          status: 'skip',
          issues: ['Manual testing required'],
          timestamp: new Date(),
          tester: 'Manual Required'
        })
      }

      setResults([...newResults])
      setProgress(((i + 1) / selectedTests.length) * 100)
    }

    setIsRunning(false)
    setCurrentTest(null)
    onTestComplete?.(newResults)
  }, [selectedTests, isPaused, runAutomatedTest, onTestComplete])

  // Pause/Resume tests
  const togglePause = useCallback(() => {
    setIsPaused(!isPaused)
  }, [isPaused])

  // Stop tests
  const stopTests = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentTest(null)
  }, [])

  // Export results
  const exportResults = useCallback(() => {
    const analysis = analyzeTestResults(results)
    const exportData = {
      summary: analysis,
      results,
      timestamp: new Date().toISOString(),
      testMatrix: selectedTests.length
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cvgenius-test-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results, selectedTests])

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'phone': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Smartphone className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'skip': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const analysis = results.length > 0 ? analyzeTestResults(results) : null

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Testing Matrix
          </CardTitle>
          <CardDescription>
            Comprehensive testing framework for CVGenius mobile optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="all">All Categories</option>
                <option value="core">Core</option>
                <option value="mobile">Mobile</option>
                <option value="accessibility">Accessibility</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Automatable</label>
              <select 
                className="w-full mt-1 p-2 border rounded"
                value={filter.automatable}
                onChange={(e) => setFilter(prev => ({ ...prev, automatable: e.target.value }))}
              >
                <option value="all">All Tests</option>
                <option value="yes">Automated Only</option>
                <option value="no">Manual Only</option>
              </select>
            </div>
          </div>

          {/* Test Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredTests.length}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTests.filter(t => t.scenario.automatable).length}
              </div>
              <div className="text-sm text-muted-foreground">Automated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTests.filter(t => !t.scenario.automatable).length}
              </div>
              <div className="text-sm text-muted-foreground">Manual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredTests.filter(t => t.scenario.priority === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={startTests} disabled={selectedTests.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                Start Tests
              </Button>
            ) : (
              <>
                <Button onClick={togglePause} variant="outline">
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopTests} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            {results.length > 0 && (
              <Button onClick={exportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              {currentTest && (
                <div className="text-sm text-muted-foreground">
                  Running: {currentTest.scenario.name} on {currentTest.device.name}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {(results.length > 0 || analysis) && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="devices">By Device</TabsTrigger>
            <TabsTrigger value="scenarios">By Scenario</TabsTrigger>
          </TabsList>

          {analysis && (
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analysis.passRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Pass Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {analysis.criticalIssues.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {results.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Tests Run</div>
                    </div>
                  </div>

                  {analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.criticalIssues.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-600">Critical Issues</h3>
                      <ul className="space-y-1">
                        {analysis.criticalIssues.map((issue, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.scenarioId}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {getDeviceIcon(ALL_TEST_DEVICES.find(d => d.name === result.deviceId)?.category || 'phone')}
                            {result.deviceId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                        {result.performanceMetrics && (
                          <Badge variant="outline">
                            {result.performanceMetrics.loadTime.toFixed(0)}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Results by Device</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ALL_TEST_DEVICES.map(device => {
                    const deviceResults = results.filter(r => r.deviceId === device.name)
                    if (deviceResults.length === 0) return null

                    const passRate = (deviceResults.filter(r => r.status === 'pass').length / deviceResults.length) * 100

                    return (
                      <div key={device.name} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.category)}
                            <span className="font-medium">{device.name}</span>
                            <Badge variant="outline">{device.os}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{passRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">
                              {deviceResults.filter(r => r.status === 'pass').length}/{deviceResults.length}
                            </div>
                          </div>
                        </div>
                        <Progress value={passRate} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card>
              <CardHeader>
                <CardTitle>Results by Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ALL_TEST_SCENARIOS.map(scenario => {
                    const scenarioResults = results.filter(r => r.scenarioId === scenario.id)
                    if (scenarioResults.length === 0) return null

                    const passRate = (scenarioResults.filter(r => r.status === 'pass').length / scenarioResults.length) * 100

                    return (
                      <div key={scenario.id} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-sm text-muted-foreground">{scenario.description}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={scenario.priority === 'critical' ? 'destructive' : 'outline'}>
                                {scenario.priority}
                              </Badge>
                              <Badge variant="outline">{scenario.category}</Badge>
                              {scenario.automatable && <Badge variant="outline">Auto</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{passRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">
                              {scenarioResults.filter(r => r.status === 'pass').length}/{scenarioResults.length}
                            </div>
                          </div>
                        </div>
                        <Progress value={passRate} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default TestRunner
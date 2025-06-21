'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  FlaskConical,
  Play,
  Pause,
  Square,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Share,
  Zap,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  MapPin,
  Activity
} from 'lucide-react'
import {
  MobileABTesting,
  type ABTest,
  type ABVariant,
  type ABTestResults,
  type ABTargetAudience,
  type ABMetric
} from '@/lib/ab-testing'

interface ABTestPanelProps {
  userId: string
  userName: string
  onTestSelect?: (test: ABTest) => void
  onVariantAssign?: (testId: string, variantId: string) => void
}

export default function ABTestPanel({
  userId,
  userName,
  onTestSelect,
  onVariantAssign
}: ABTestPanelProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'results' | 'settings'>('overview')
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [assignments, setAssignments] = useState<Map<string, string>>(new Map())

  const abTestingRef = useRef<MobileABTesting | null>(null)

  // Initialize A/B testing system
  useEffect(() => {
    const abTesting = new MobileABTesting(userId, {
      localStorage: true,
      touchTracking: true,
      performanceMetrics: true,
      networkAware: true,
      deviceSpecific: true,
      gestureAnalytics: true,
      batteryOptimization: true,
      offlineCapability: true
    })

    abTestingRef.current = abTesting
    loadTests()
    loadAssignments()
    detectDeviceInfo()

    return () => {
      abTesting.destroy()
    }
  }, [userId])

  const loadTests = () => {
    if (abTestingRef.current) {
      const allTests = abTestingRef.current.getActiveTests()
      setTests(allTests)
    }
  }

  const loadAssignments = () => {
    if (abTestingRef.current) {
      const userAssignments = abTestingRef.current.getUserAssignments()
      setAssignments(userAssignments)
    }
  }

  const detectDeviceInfo = () => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)
      
      setDeviceInfo({
        type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      })
    }
  }

  const handleCreateTest = async (testData: any) => {
    if (!abTestingRef.current) return

    try {
      const test = await abTestingRef.current.createTest({
        name: testData.name,
        description: testData.description,
        hypothesis: testData.hypothesis,
        status: 'draft',
        type: testData.type,
        variants: testData.variants,
        trafficAllocation: testData.trafficAllocation,
        targetAudience: testData.targetAudience,
        metrics: testData.metrics,
        startDate: new Date(),
        config: {
          confidenceLevel: 95,
          minimumSampleSize: 100,
          maximumDuration: 30,
          autoStop: true,
          autoStopThreshold: 95,
          cookieDuration: 30,
          ignoreReturningUsers: false,
          mobileOnly: true,
          enableDebugMode: false
        },
        createdBy: userId
      })

      loadTests()
      setShowCreateForm(false)
      setSelectedTest(test)
    } catch (error) {
      console.error('Failed to create test:', error)
    }
  }

  const handleStartTest = async (testId: string) => {
    if (!abTestingRef.current) return

    try {
      await abTestingRef.current.startTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to start test:', error)
    }
  }

  const handleStopTest = async (testId: string) => {
    if (!abTestingRef.current) return

    try {
      await abTestingRef.current.stopTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to stop test:', error)
    }
  }

  const handleGetVariant = async (testId: string) => {
    if (!abTestingRef.current) return

    try {
      const variantId = await abTestingRef.current.getVariant(testId)
      if (variantId) {
        setAssignments(prev => new Map(prev.set(testId, variantId)))
        onVariantAssign?.(testId, variantId)
      }
    } catch (error) {
      console.error('Failed to get variant:', error)
    }
  }

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (abTestingRef.current) {
      abTestingRef.current.track(eventName, properties)
    }
  }

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'archived': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: ABTest['type']) => {
    switch (type) {
      case 'ui': return <Smartphone className="h-4 w-4" />
      case 'flow': return <Activity className="h-4 w-4" />
      case 'content': return <Edit className="h-4 w-4" />
      case 'performance': return <Zap className="h-4 w-4" />
      case 'feature': return <Settings className="h-4 w-4" />
      default: return <FlaskConical className="h-4 w-4" />
    }
  }

  const renderTestCard = (test: ABTest) => {
    const assignment = assignments.get(test.id)
    const assignedVariant = assignment ? test.variants.find(v => v.id === assignment) : null

    return (
      <Card 
        key={test.id} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedTest?.id === test.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => {
          setSelectedTest(test)
          onTestSelect?.(test)
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(test.type)}
              <div>
                <CardTitle className="text-sm font-medium">{test.name}</CardTitle>
                <CardDescription className="text-xs">{test.description}</CardDescription>
              </div>
            </div>
            <Badge className={`text-xs ${getStatusColor(test.status)}`}>
              {test.status}
            </Badge>
          </div>

          {/* Assignment Info */}
          {assignedVariant && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <div className="text-xs font-medium text-blue-700">
                Assigned: {assignedVariant.name}
              </div>
              <div className="text-xs text-blue-600">
                Weight: {assignedVariant.weight}%
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Variants */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Variants:</div>
            <div className="flex flex-wrap gap-1">
              {test.variants.map((variant) => (
                <Badge 
                  key={variant.id} 
                  variant={variant.isControl ? "default" : "outline"}
                  className="text-xs"
                >
                  {variant.name} ({variant.weight}%)
                </Badge>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-3 space-y-1">
            <div className="text-xs font-medium text-gray-700">Primary Metric:</div>
            <div className="text-xs text-gray-600">
              {test.metrics.find(m => m.isPrimary)?.name || 'No primary metric'}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            {test.status === 'draft' && (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartTest(test.id)
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            
            {test.status === 'running' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStopTest(test.id)
                  }}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
                
                {!assignment && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGetVariant(test.id)
                    }}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Join
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCreateForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      hypothesis: '',
      type: 'ui' as ABTest['type'],
      trafficAllocation: 100,
      variants: [
        { id: 'control', name: 'Control', weight: 50, isControl: true, config: {} },
        { id: 'variant', name: 'Variant A', weight: 50, isControl: false, config: {} }
      ],
      targetAudience: {
        include: [],
        exclude: [],
        percentage: 100
      },
      metrics: [
        {
          id: 'conversion',
          name: 'Conversion Rate',
          type: 'conversion' as const,
          eventName: 'cv_download',
          isPrimary: true,
          description: 'CV download completion',
          expectedDirection: 'increase' as const,
          minimumDetectableEffect: 5
        }
      ]
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New A/B Test
          </CardTitle>
          <CardDescription>
            Design and configure a new mobile A/B test for CVGenius
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Test Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="CV Builder Mobile Optimization"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select 
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ABTest['type'] }))}
              >
                <option value="ui">UI/UX</option>
                <option value="flow">User Flow</option>
                <option value="content">Content</option>
                <option value="performance">Performance</option>
                <option value="feature">Feature</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Test mobile CV builder with improved touch interactions"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Hypothesis</label>
            <Textarea
              value={formData.hypothesis}
              onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
              placeholder="By improving touch interactions, we expect to increase mobile CV completion rate by 15%"
              rows={2}
            />
          </div>

          {/* Traffic Allocation */}
          <div>
            <label className="text-sm font-medium">Traffic Allocation (%)</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.trafficAllocation}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                trafficAllocation: parseInt(e.target.value) || 100 
              }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => handleCreateTest(formData)}
              disabled={!formData.name || !formData.description}
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Create Test
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTestResults = () => {
    if (!selectedTest?.results) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="font-medium">No results available</div>
              <div className="text-sm mt-1">Start the test to see results</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    const results = selectedTest.results

    return (
      <div className="space-y-4">
        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Results: {selectedTest.name}
            </CardTitle>
            <CardDescription>
              {results.status === 'significant' ? (
                <span className="text-green-600 font-medium">Statistically Significant</span>
              ) : (
                <span className="text-gray-600">Not Yet Significant</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.totalSessions}</div>
                <div className="text-xs text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.totalConversions}</div>
                <div className="text-xs text-gray-600">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{results.confidenceLevel}%</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{results.pValue.toFixed(3)}</div>
                <div className="text-xs text-gray-600">P-Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variant Results */}
        <Card>
          <CardHeader>
            <CardTitle>Variant Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.variants.map((variant) => {
                const testVariant = selectedTest.variants.find(v => v.id === variant.variantId)
                return (
                  <div key={variant.variantId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{testVariant?.name || variant.variantId}</div>
                      <div className="flex gap-2">
                        {variant.isWinner && (
                          <Badge className="bg-green-100 text-green-700">Winner</Badge>
                        )}
                        {testVariant?.isControl && (
                          <Badge variant="outline">Control</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{variant.sessions}</div>
                        <div className="text-gray-600">Sessions</div>
                      </div>
                      <div>
                        <div className="font-medium">{variant.conversions}</div>
                        <div className="text-gray-600">Conversions</div>
                      </div>
                      <div>
                        <div className="font-medium">{(variant.conversionRate * 100).toFixed(2)}%</div>
                        <div className="text-gray-600">Conv. Rate</div>
                      </div>
                      <div>
                        <div className={`font-medium ${variant.lift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(1)}%
                        </div>
                        <div className="text-gray-600">Lift</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Mobile A/B Testing Dashboard
              </CardTitle>
              <CardDescription>
                Manage and monitor mobile optimization experiments for CVGenius
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Test
              </Button>
              <Button variant="outline" size="sm" onClick={loadTests}>
                <Activity className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Device Info */}
          {deviceInfo && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">Current Device</div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  {deviceInfo.type === 'mobile' && <Smartphone className="h-3 w-3" />}
                  {deviceInfo.type === 'tablet' && <Tablet className="h-3 w-3" />}
                  {deviceInfo.type === 'desktop' && <Monitor className="h-3 w-3" />}
                  {deviceInfo.type}
                </div>
                <div>{deviceInfo.screenSize}</div>
                <div>{deviceInfo.connection}</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'results', label: 'Results', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(id as any)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tests.length}</div>
                  <div className="text-xs text-gray-600">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tests.filter(t => t.status === 'running').length}
                  </div>
                  <div className="text-xs text-gray-600">Running</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{assignments.size}</div>
                  <div className="text-xs text-gray-600">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {tests.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {/* Tests List */}
              <div className="grid md:grid-cols-2 gap-4">
                {tests.map(renderTestCard)}
                
                {tests.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="font-medium">No A/B tests yet</div>
                    <div className="text-sm mt-1">Create your first mobile optimization test</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && renderCreateForm()}
          {activeTab === 'results' && renderTestResults()}
          
          {activeTab === 'settings' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="font-medium">A/B Test Settings</div>
                  <div className="text-sm mt-1">Configure global testing preferences</div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
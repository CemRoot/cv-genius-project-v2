'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Flag,
  ToggleLeft,
  ToggleRight,
  Settings,
  Users,
  Target,
  Clock,
  BarChart3,
  Activity,
  Eye,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Zap,
  Code,
  Smartphone,
  Monitor,
  Globe,
  Percent,
  Hash,
  Type,
  Braces
} from 'lucide-react'
import {
  MobileFeatureFlags,
  type FeatureFlag,
  type FlagEvaluation,
  type EvaluationContext
} from '@/lib/feature-flags'

interface FeatureFlagPanelProps {
  userId: string
  userName: string
  environment?: 'development' | 'staging' | 'production'
  onFlagChange?: (flagKey: string, value: any) => void
}

export default function FeatureFlagPanel({
  userId,
  userName,
  environment = 'production',
  onFlagChange
}: FeatureFlagPanelProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [evaluations, setEvaluations] = useState<FlagEvaluation[]>([])
  const [context, setContext] = useState<EvaluationContext | null>(null)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'evaluations' | 'context'>('overview')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [testValues, setTestValues] = useState<Map<string, any>>(new Map())

  const featureFlagsRef = useRef<MobileFeatureFlags | null>(null)

  // Initialize feature flags
  useEffect(() => {
    const featureFlags = new MobileFeatureFlags(userId, {
      cacheEnabled: true,
      cacheDuration: 15,
      evaluationTimeout: 500,
      fallbackMode: 'default',
      offlineSupport: true,
      realTimeUpdates: true,
      analytics: true,
      debugMode: environment !== 'production'
    })

    featureFlagsRef.current = featureFlags

    // Set up event listeners
    featureFlags.addEventListener('flagEvaluated', handleFlagEvaluated)
    featureFlags.addEventListener('flagCreated', handleFlagCreated)
    featureFlags.addEventListener('flagUpdated', handleFlagUpdated)
    featureFlags.addEventListener('flagDeleted', handleFlagDeleted)

    loadData()

    return () => {
      featureFlags.destroy()
    }
  }, [userId, environment])

  const loadData = () => {
    if (featureFlagsRef.current) {
      setFlags(featureFlagsRef.current.getFlags())
      setEvaluations(featureFlagsRef.current.getEvaluations())
      setContext(featureFlagsRef.current.getContext())
    }
  }

  const handleFlagEvaluated = (data: { flagKey: string; value: any; evaluation: FlagEvaluation }) => {
    setEvaluations(prev => [data.evaluation, ...prev.slice(0, 99)]) // Keep last 100
    onFlagChange?.(data.flagKey, data.value)
  }

  const handleFlagCreated = (data: { flag: FeatureFlag }) => {
    setFlags(prev => [data.flag, ...prev])
  }

  const handleFlagUpdated = (data: { flagKey: string; flag: FeatureFlag }) => {
    setFlags(prev => prev.map(f => f.key === data.flagKey ? data.flag : f))
  }

  const handleFlagDeleted = (data: { flagKey: string }) => {
    setFlags(prev => prev.filter(f => f.key !== data.flagKey))
    if (selectedFlag?.key === data.flagKey) {
      setSelectedFlag(null)
    }
  }

  const handleToggleFlag = async (flagKey: string) => {
    if (!featureFlagsRef.current) return

    const flag = flags.find(f => f.key === flagKey)
    if (!flag) return

    try {
      await featureFlagsRef.current.updateFlag(flagKey, {
        enabled: !flag.enabled
      })
    } catch (error) {
      console.error('Failed to toggle flag:', error)
    }
  }

  const handleUpdateRollout = async (flagKey: string, percentage: number) => {
    if (!featureFlagsRef.current) return

    try {
      await featureFlagsRef.current.updateFlag(flagKey, {
        rolloutPercentage: percentage
      })
    } catch (error) {
      console.error('Failed to update rollout:', error)
    }
  }

  const handleTestFlag = async (flagKey: string) => {
    if (!featureFlagsRef.current) return

    try {
      const value = await featureFlagsRef.current.evaluate(flagKey)
      setTestValues(prev => new Map(prev.set(flagKey, value)))
    } catch (error) {
      console.error('Failed to test flag:', error)
    }
  }

  const handleCreateFlag = async (flagData: any) => {
    if (!featureFlagsRef.current) return

    try {
      await featureFlagsRef.current.createFlag({
        name: flagData.name,
        description: flagData.description,
        key: flagData.key,
        type: flagData.type,
        defaultValue: flagData.defaultValue,
        currentValue: flagData.currentValue,
        enabled: true,
        rolloutPercentage: flagData.rolloutPercentage,
        targetAudience: {
          include: [],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [],
        status: 'active',
        environment,
        createdBy: userId,
        dependencies: [],
        tags: flagData.tags
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create flag:', error)
    }
  }

  const getStatusColor = (status: FeatureFlag['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'disabled': return 'text-red-600 bg-red-50'
      case 'archived': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getTypeIcon = (type: FeatureFlag['type']) => {
    switch (type) {
      case 'boolean': return <ToggleLeft className="h-4 w-4" />
      case 'string': return <Type className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'json': return <Braces className="h-4 w-4" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const renderFlagCard = (flag: FeatureFlag) => {
    const testValue = testValues.get(flag.key)

    return (
      <Card 
        key={flag.key} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedFlag?.key === flag.key ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedFlag(flag)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getTypeIcon(flag.type)}
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">{flag.name}</CardTitle>
                <CardDescription className="text-xs">{flag.description}</CardDescription>
                <div className="text-xs text-gray-500 mt-1">
                  Key: <code className="bg-gray-100 px-1 rounded">{flag.key}</code>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`text-xs ${getStatusColor(flag.status)}`}>
                {flag.status}
              </Badge>
              <Button
                variant={flag.enabled ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFlag(flag.key)
                }}
              >
                {flag.enabled ? (
                  <ToggleRight className="h-3 w-3" />
                ) : (
                  <ToggleLeft className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Current Value */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Current Value:</div>
            <div className="text-sm bg-gray-50 p-2 rounded">
              {typeof flag.currentValue === 'object' 
                ? JSON.stringify(flag.currentValue, null, 2)
                : String(flag.currentValue)
              }
            </div>
          </div>

          {/* Rollout Percentage */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-700">Rollout:</div>
              <div className="text-xs text-gray-600">{flag.rolloutPercentage}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${flag.rolloutPercentage}%` }}
              />
            </div>
          </div>

          {/* Test Value */}
          {testValue !== undefined && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <div className="text-xs font-medium text-green-700">Test Result:</div>
              <div className="text-xs text-green-600">
                {typeof testValue === 'object' 
                  ? JSON.stringify(testValue)
                  : String(testValue)
                }
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-medium">{flag.metrics.evaluations}</div>
              <div className="text-xs text-gray-600">Evals</div>
            </div>
            <div>
              <div className="text-sm font-medium">{flag.metrics.uniqueUsers}</div>
              <div className="text-xs text-gray-600">Users</div>
            </div>
            <div>
              <div className="text-sm font-medium">{flag.metrics.performanceMs.toFixed(1)}ms</div>
              <div className="text-xs text-gray-600">Perf</div>
            </div>
          </div>

          {/* Tags */}
          {flag.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {flag.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                handleTestFlag(flag.key)
              }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Test
            </Button>
            <Input
              type="number"
              min="0"
              max="100"
              className="text-xs h-8"
              placeholder="0-100"
              onBlur={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  handleUpdateRollout(flag.key, value)
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCreateForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      key: '',
      type: 'boolean' as FeatureFlag['type'],
      defaultValue: false,
      currentValue: false,
      rolloutPercentage: 0,
      tags: [] as string[]
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Feature Flag
          </CardTitle>
          <CardDescription>
            Add a new feature flag for mobile optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Flag Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mobile Voice Input"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Flag Key</label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="mobile_voice_input"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enable voice input for CV sections on mobile devices"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select 
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FeatureFlag['type'] }))}
              >
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Default Value</label>
              <Input
                value={String(formData.defaultValue)}
                onChange={(e) => {
                  let value: any = e.target.value
                  if (formData.type === 'boolean') value = value === 'true'
                  if (formData.type === 'number') value = Number(value)
                  if (formData.type === 'json') {
                    try { value = JSON.parse(value) } catch {}
                  }
                  setFormData(prev => ({ ...prev, defaultValue: value }))
                }}
                placeholder={formData.type === 'boolean' ? 'false' : 'value'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rollout %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.rolloutPercentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  rolloutPercentage: parseInt(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input
              placeholder="mobile, experimental, voice"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => handleCreateFlag(formData)}
              disabled={!formData.name || !formData.key}
            >
              <Flag className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEvaluations = () => {
    return (
      <div className="space-y-4">
        {evaluations.map((evaluation, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm">{evaluation.flagId}</div>
                  <div className="text-xs text-gray-600">
                    User: {evaluation.userId} • {evaluation.timestamp.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reason: {evaluation.reason}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    {typeof evaluation.value === 'object' 
                      ? JSON.stringify(evaluation.value)
                      : String(evaluation.value)
                    }
                  </div>
                  <Badge variant={evaluation.matched ? "default" : "secondary"} className="text-xs mt-1">
                    {evaluation.matched ? 'Matched' : 'Default'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {evaluations.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <div className="font-medium">No evaluations yet</div>
                <div className="text-sm mt-1">Test some flags to see evaluations</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderContext = () => {
    if (!context) return null

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Device Type</div>
                <div className="text-sm text-gray-600">{context.deviceInfo.type}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Platform</div>
                <div className="text-sm text-gray-600">{context.deviceInfo.platform}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Browser</div>
                <div className="text-sm text-gray-600">{context.deviceInfo.browser}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Version</div>
                <div className="text-sm text-gray-600">{context.deviceInfo.version}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">User ID</div>
                <div className="text-sm text-gray-600 font-mono">{context.userId}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Session ID</div>
                <div className="text-sm text-gray-600 font-mono">{context.sessionId}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {context.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Location Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium">Country</div>
                  <div className="text-sm text-gray-600">{context.location.country}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">City</div>
                  <div className="text-sm text-gray-600">{context.location.city}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Timezone</div>
                  <div className="text-sm text-gray-600">{context.location.timezone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
                <Flag className="h-5 w-5" />
                Feature Flag Management
              </CardTitle>
              <CardDescription>
                Control and monitor feature rollouts for CVGenius mobile
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Flag
              </Button>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Environment Badge */}
          <div className="mt-3">
            <Badge variant={environment === 'production' ? 'default' : 'secondary'}>
              {environment}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'flags', label: 'Flags', icon: Flag },
              { id: 'evaluations', label: 'Evaluations', icon: Activity },
              { id: 'context', label: 'Context', icon: Settings }
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
                  <div className="text-2xl font-bold text-blue-600">{flags.length}</div>
                  <div className="text-xs text-gray-600">Total Flags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {flags.filter(f => f.enabled).length}
                  </div>
                  <div className="text-xs text-gray-600">Enabled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{evaluations.length}</div>
                  <div className="text-xs text-gray-600">Evaluations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {flags.filter(f => f.status === 'active').length}
                  </div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
              </div>

              {/* Recent Flags */}
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Flags</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {flags.slice(0, 4).map(renderFlagCard)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-4">
              {showCreateForm && renderCreateForm()}
              
              <div className="grid md:grid-cols-2 gap-4">
                {flags.map(renderFlagCard)}
                
                {flags.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    <Flag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="font-medium">No feature flags yet</div>
                    <div className="text-sm mt-1">Create your first feature flag</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && renderEvaluations()}
          {activeTab === 'context' && renderContext()}
        </CardContent>
      </Card>
    </div>
  )
}
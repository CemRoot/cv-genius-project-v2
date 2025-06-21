'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Search,
  TrendingUp,
  MapPin,
  Smartphone,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Globe,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Lightbulb,
  Award,
  Activity,
  Users,
  Gauge,
  Star,
  Flag,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import {
  MobileSEOOptimizer,
  type MobileSEOAudit,
  type SEOMetrics,
  type SEOIssue,
  type SEORecommendation
} from '@/lib/mobile-seo'

interface SEODashboardProps {
  url?: string
  dublinFocus?: boolean
  onAuditComplete?: (audit: MobileSEOAudit) => void
}

export default function SEODashboard({
  url,
  dublinFocus = true,
  onAuditComplete
}: SEODashboardProps) {
  const [currentAudit, setCurrentAudit] = useState<MobileSEOAudit | null>(null)
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'issues' | 'recommendations' | 'keywords'>('overview')
  const [coreWebVitals, setCoreWebVitals] = useState<Map<string, number>>(new Map())

  const seoOptimizerRef = useRef<MobileSEOOptimizer | null>(null)

  // Initialize SEO optimizer
  useEffect(() => {
    const optimizer = new MobileSEOOptimizer({
      dublinFocus,
      localBusinessOptimization: true,
      mobileFirstIndexing: true,
      coreWebVitalsOptimization: true,
      structuredDataEnabled: true,
      ampOptimization: false,
      pwaOptimization: true,
      performanceTracking: true
    })

    seoOptimizerRef.current = optimizer

    // Load initial data
    loadMetrics()
    loadCoreWebVitals()

    return () => {
      optimizer.destroy()
    }
  }, [dublinFocus])

  const loadMetrics = () => {
    if (seoOptimizerRef.current) {
      const currentMetrics = seoOptimizerRef.current.getMetrics()
      setMetrics(currentMetrics)
    }
  }

  const loadCoreWebVitals = () => {
    if (seoOptimizerRef.current) {
      const vitals = seoOptimizerRef.current.getCoreWebVitals()
      setCoreWebVitals(vitals)
    }
  }

  const runSEOAudit = async () => {
    if (!seoOptimizerRef.current) return

    setIsLoading(true)
    try {
      const audit = await seoOptimizerRef.current.performSEOAudit(url)
      setCurrentAudit(audit)
      setMetrics(audit.metrics)
      onAuditComplete?.(audit)
    } catch (error) {
      console.error('SEO audit failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const getCWVStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1500 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const getCWVColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const renderOverview = () => {
    if (!currentAudit) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="font-medium">No SEO audit data</div>
              <div className="text-sm mt-1">Run an audit to see SEO metrics</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-4xl font-bold ${getScoreColor(currentAudit.score)}`}>
                  {currentAudit.score}
                </div>
                <div className="text-sm text-gray-600">Overall SEO Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentAudit.dublinRelevance)}`}>
                  {Math.round(currentAudit.dublinRelevance)}
                </div>
                <div className="text-sm text-gray-600">Dublin Relevance</div>
              </div>
            </div>
            <Progress value={currentAudit.score} className="mt-4" />
          </CardContent>
        </Card>

        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>
              Mobile performance metrics affecting search rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* LCP */}
              <div className="text-center">
                <div className={`text-xl font-bold ${getCWVColor(getCWVStatus('lcp', currentAudit.metrics.coreWebVitals.lcp))}`}>
                  {formatDuration(currentAudit.metrics.coreWebVitals.lcp)}
                </div>
                <div className="text-sm text-gray-600">LCP</div>
                <Badge className={`text-xs mt-1 ${getCWVColor(getCWVStatus('lcp', currentAudit.metrics.coreWebVitals.lcp))}`}>
                  {getCWVStatus('lcp', currentAudit.metrics.coreWebVitals.lcp)}
                </Badge>
              </div>

              {/* FID */}
              <div className="text-center">
                <div className={`text-xl font-bold ${getCWVColor(getCWVStatus('fid', currentAudit.metrics.coreWebVitals.fid))}`}>
                  {formatDuration(currentAudit.metrics.coreWebVitals.fid)}
                </div>
                <div className="text-sm text-gray-600">FID</div>
                <Badge className={`text-xs mt-1 ${getCWVColor(getCWVStatus('fid', currentAudit.metrics.coreWebVitals.fid))}`}>
                  {getCWVStatus('fid', currentAudit.metrics.coreWebVitals.fid)}
                </Badge>
              </div>

              {/* CLS */}
              <div className="text-center">
                <div className={`text-xl font-bold ${getCWVColor(getCWVStatus('cls', currentAudit.metrics.coreWebVitals.cls))}`}>
                  {currentAudit.metrics.coreWebVitals.cls.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">CLS</div>
                <Badge className={`text-xs mt-1 ${getCWVColor(getCWVStatus('cls', currentAudit.metrics.coreWebVitals.cls))}`}>
                  {getCWVStatus('cls', currentAudit.metrics.coreWebVitals.cls)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentAudit.metrics.mobileUsability.mobileScore}
                </div>
                <div className="text-xs text-gray-600">Mobile Score</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentAudit.metrics.performance.pagespeedMobile}
                </div>
                <div className="text-xs text-gray-600">PageSpeed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentAudit.issues.filter(i => i.type === 'critical').length}
                </div>
                <div className="text-xs text-gray-600">Critical Issues</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentAudit.recommendations.length}
                </div>
                <div className="text-xs text-gray-600">Recommendations</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderPerformance = () => {
    if (!metrics) return null

    return (
      <div className="space-y-4">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Mobile Load Time</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(metrics.performance.mobileLoadTime)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Resource Optimization</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(metrics.performance.resourceOptimization)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Cache Efficiency</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(metrics.performance.cacheEfficiency)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">PageSpeed Mobile</div>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.performance.pagespeedMobile}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Web Vitals Details */}
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.coreWebVitals).map(([metric, value]) => {
                const status = getCWVStatus(metric, value)
                return (
                  <div key={metric} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{metric.toUpperCase()}</div>
                      <div className="text-sm text-gray-600">
                        {metric === 'lcp' && 'Largest Contentful Paint'}
                        {metric === 'fid' && 'First Input Delay'}
                        {metric === 'cls' && 'Cumulative Layout Shift'}
                        {metric === 'fcp' && 'First Contentful Paint'}
                        {metric === 'ttfb' && 'Time to First Byte'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(value)}</div>
                      <Badge className={`text-xs ${getCWVColor(status)}`}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Usability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Usability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'textReadability', label: 'Text Readability', value: metrics.mobileUsability.textReadability },
                { key: 'tapTargetSize', label: 'Tap Target Size', value: metrics.mobileUsability.tapTargetSize },
                { key: 'viewportConfigured', label: 'Viewport Configured', value: metrics.mobileUsability.viewportConfigured },
                { key: 'contentSizing', label: 'Content Sizing', value: metrics.mobileUsability.contentSizing }
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="text-sm">{label}</div>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderIssues = () => {
    if (!currentAudit?.issues.length) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <div className="font-medium">No issues found</div>
              <div className="text-sm mt-1">Your site is performing well!</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {currentAudit.issues.map((issue) => (
          <Card key={issue.id} className={`border-l-4 ${
            issue.type === 'critical' ? 'border-red-500' : 
            issue.type === 'warning' ? 'border-yellow-500' : 
            'border-blue-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{issue.title}</CardTitle>
                  <CardDescription className="text-xs">{issue.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    issue.type === 'critical' ? 'destructive' : 
                    issue.type === 'warning' ? 'secondary' : 
                    'outline'
                  }>
                    {issue.type}
                  </Badge>
                  <Badge variant="outline">
                    {issue.impact} impact
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-700">
                <strong>Fix:</strong> {issue.fix}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {issue.category}
                </Badge>
                <div className="text-xs text-gray-500">
                  Priority: {issue.priority}/10
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderRecommendations = () => {
    if (!currentAudit?.recommendations.length) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="font-medium">No recommendations</div>
              <div className="text-sm mt-1">Your SEO is optimized!</div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {currentAudit.recommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{recommendation.title}</CardTitle>
                  <CardDescription className="text-xs">{recommendation.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    recommendation.effort === 'low' ? 'default' : 
                    recommendation.effort === 'medium' ? 'secondary' : 
                    'destructive'
                  }>
                    {recommendation.effort} effort
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Implementation:</strong> {recommendation.implementation}
                </div>
                <div>
                  <strong>Expected Impact:</strong> {recommendation.expectedImpact}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {recommendation.category}
                </Badge>
                <div className="text-xs text-gray-500">
                  Priority: {recommendation.priority}/10
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderKeywords = () => {
    if (!seoOptimizerRef.current) return null

    const dublinKeywords = seoOptimizerRef.current.getDublinKeywords()

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dublin Job Keywords
            </CardTitle>
            <CardDescription>
              Targeted keywords for Dublin job market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dublinKeywords).map(([category, keywords]) => (
                <div key={category}>
                  <div className="font-medium text-sm mb-2 capitalize">{category}</div>
                  <div className="flex flex-wrap gap-1">
                    {keywords.slice(0, 10).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentAudit && (
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Dublin Keyword Ranking</div>
                  <div className="text-sm font-medium">
                    {Math.round(currentAudit.metrics.localSEO.dublinKeywordRanking)}%
                  </div>
                </div>
                <Progress value={currentAudit.metrics.localSEO.dublinKeywordRanking} />

                <div className="flex items-center justify-between">
                  <div className="text-sm">Local Business Visibility</div>
                  <div className="text-sm font-medium">
                    {Math.round(currentAudit.metrics.localSEO.localBusinessVisibility)}%
                  </div>
                </div>
                <Progress value={currentAudit.metrics.localSEO.localBusinessVisibility} />
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
                <Search className="h-5 w-5" />
                Mobile SEO Dashboard
              </CardTitle>
              <CardDescription>
                Dublin-focused mobile SEO optimization and monitoring
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runSEOAudit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Running...' : 'Run Audit'}
              </Button>
              {currentAudit && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Audit Info */}
          {currentAudit && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">Last Audit</div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div>URL: {currentAudit.url}</div>
                <div>Device: {currentAudit.deviceType}</div>
                <div>{currentAudit.timestamp.toLocaleString()}</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'issues', label: 'Issues', icon: AlertTriangle },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'keywords', label: 'Keywords', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(id as any)}
                className="whitespace-nowrap"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'issues' && renderIssues()}
          {activeTab === 'recommendations' && renderRecommendations()}
          {activeTab === 'keywords' && renderKeywords()}
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Eye, 
  EyeOff, 
  Settings, 
  Save, 
  RefreshCw,
  Monitor,
  Smartphone,
  Layout,
  Loader2,
  Info,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Globe,
  Timer,
  Target,
  TrendingUp,
  Zap,
  Code,
  ExternalLink
} from 'lucide-react'
import ClientAdminAuth from '@/lib/client-admin-auth'
import { AdConfig } from '@/lib/ad-config'
import { useToast } from '@/hooks/use-toast'
import { formatRevenue, formatNumber, calculateCTR } from '@/lib/ad-performance'

interface AdminAdSettings {
  enableAds: boolean
  mobileAds: boolean
  testMode: boolean
  monetagPopup: boolean
  monetagPush: boolean
  monetagNative: boolean
  lastUpdated: string
}

interface AdSlotConfig extends AdConfig {
  performance?: {
    impressions: number
    clicks: number
    revenue: number
    ctr: number
  }
}

const AD_PLATFORMS = {
  adsense: { name: 'Google AdSense', color: 'blue' },
  monetag: { name: 'Monetag', color: 'purple' },
  propellerads: { name: 'PropellerAds', color: 'green' },
  custom: { name: 'Custom', color: 'gray' }
}

const AD_POSITIONS = {
  header: { name: 'Header', icon: Layout },
  sidebar: { name: 'Sidebar', icon: Layout },
  content: { name: 'Content', icon: Layout },
  footer: { name: 'Footer', icon: Layout },
  floating: { name: 'Floating', icon: Zap },
  interstitial: { name: 'Interstitial', icon: Monitor },
  download: { name: 'Download', icon: Target }
}

export default function AdsManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [adSettings, setAdSettings] = useState<AdminAdSettings>({
    enableAds: true,
    mobileAds: true,
    testMode: false,
    monetagPopup: false,
    monetagPush: false,
    monetagNative: false,
    lastUpdated: new Date().toISOString()
  })
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AdSlotConfig | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [performancePeriod, setPerformancePeriod] = useState<'today' | 'week' | 'month'>('week')
  const [loadingPerformance, setLoadingPerformance] = useState(false)

  useEffect(() => {
    loadAdSettings()
    loadPerformanceData()
  }, [])

  const loadAdSettings = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdSettings(data.settings)
          setAdSlots(data.adConfigs || [])
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ad settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPerformanceData = async () => {
    setLoadingPerformance(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest(
        `/api/admin/ads/performance?view=overview&period=${performancePeriod}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPerformanceData(data.overview)
          
          // Merge performance data with ad slots
          if (data.overview.topPerformingAds) {
            setAdSlots(prev => prev.map(slot => {
              const perf = data.overview.topPerformingAds.find((p: any) => p.adSlotId === slot.id)
              if (perf) {
                return {
                  ...slot,
                  performance: {
                    impressions: 0, // Will be loaded separately
                    clicks: 0,
                    revenue: perf.revenue,
                    ctr: perf.ctr
                  }
                }
              }
              return slot
            }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setLoadingPerformance(false)
    }
  }

  const saveGlobalSetting = async (key: keyof AdminAdSettings, value: boolean) => {
    setSaving(true)
    const previousValue = adSettings[key]
    
    // Optimistic update
    setAdSettings(prev => ({ ...prev, [key]: value }))
    
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          setting: key, 
          enabled: value,
          settings: { ...adSettings, [key]: value }
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: `${key} ${value ? 'enabled' : 'disabled'}`
          })
        } else {
          setAdSettings(prev => ({ ...prev, [key]: previousValue }))
          throw new Error(data.error)
        }
      } else {
        setAdSettings(prev => ({ ...prev, [key]: previousValue }))
        throw new Error('Failed to update setting')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateAdSlot = async (slotId: string, updates: Partial<AdSlotConfig>) => {
    setSaving(true)
    
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, updates })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdSlots(prev => prev.map(slot => 
            slot.id === slotId ? { ...slot, ...updates } : slot
          ))
          toast({
            title: "Success",
            description: "Ad slot updated successfully"
          })
          return true
        }
      }
      throw new Error('Failed to update ad slot')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad slot",
        variant: "destructive"
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const toggleAdSlot = async (slotId: string, enabled: boolean) => {
    await updateAdSlot(slotId, { enabled })
  }

  const getEnabledSlotsCount = () => {
    return adSlots.filter(slot => slot.enabled).length
  }

  const getSlotsByType = (type: string) => {
    return adSlots.filter(slot => slot.type === type)
  }

  const getSlotsByPlatform = (platform: string) => {
    return adSlots.filter(slot => slot.settings?.platform === platform)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Advanced Ad Management</h1>
          <p className="text-gray-600">Control all ad placements and monetization settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={loadAdSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Ad Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEnabledSlotsCount()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {adSlots.length} total
            </p>
            <Progress value={(getEnabledSlotsCount() / adSlots.length) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ad Networks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(AD_PLATFORMS).map(([key, platform]) => {
                const count = getSlotsByPlatform(key).filter(s => s.enabled).length
                return count > 0 ? (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {platform.name}: {count}
                  </Badge>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mobile Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {adSettings.mobileAds ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Enabled</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Disabled</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getSlotsByType('mobile').filter(s => s.enabled).length} mobile ads active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Test Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={adSettings.testMode ? "default" : "secondary"}>
                {adSettings.testMode ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {adSettings.testMode ? 'Showing test ads' : 'Live ads active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slots">Ad Slots</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Ad Controls</CardTitle>
              <CardDescription>Master switches for ad functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">All Advertisements</p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all ads globally
                    </p>
                  </div>
                  <Switch
                    checked={adSettings.enableAds}
                    onCheckedChange={(checked) => saveGlobalSetting('enableAds', checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Mobile Ads</p>
                    <p className="text-sm text-muted-foreground">
                      Show ads on mobile devices
                    </p>
                  </div>
                  <Switch
                    checked={adSettings.mobileAds}
                    onCheckedChange={(checked) => saveGlobalSetting('mobileAds', checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Show test ads instead of live ads
                    </p>
                  </div>
                  <Switch
                    checked={adSettings.testMode}
                    onCheckedChange={(checked) => saveGlobalSetting('testMode', checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Auto-Optimization</p>
                    <p className="text-sm text-muted-foreground">
                      AI-powered ad placement optimization
                    </p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common ad management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => {
                  adSlots.forEach(slot => toggleAdSlot(slot.id, false))
                  toast({ title: "All ads disabled" })
                }}
              >
                <span className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Disable All Ads
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => {
                  adSlots.forEach(slot => {
                    if (slot.type === 'mobile') {
                      toggleAdSlot(slot.id, false)
                    }
                  })
                  toast({ title: "Mobile ads disabled" })
                }}
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Disable Mobile Ads Only
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => saveGlobalSetting('testMode', true)}
              >
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Enable Test Mode
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Slots Tab */}
        <TabsContent value="slots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Ad Slot Management</CardTitle>
              <CardDescription>Configure each ad placement individually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(AD_POSITIONS).map(([posKey, position]) => {
                  const slots = adSlots.filter(slot => 
                    slot.position === posKey || 
                    (posKey === 'floating' && slot.settings?.mobilePosition === 'floating') ||
                    (posKey === 'interstitial' && slot.type === 'interstitial')
                  )
                  
                  if (slots.length === 0) return null

                  return (
                    <div key={posKey} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <position.icon className="w-4 h-4" />
                        {position.name} Ads
                      </div>
                      {slots.map(slot => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{slot.name}</p>
                              {slot.settings?.platform && (
                                <Badge variant="secondary" className="text-xs">
                                  {AD_PLATFORMS[slot.settings.platform]?.name || slot.settings.platform}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>ID: {slot.id}</span>
                              {slot.zone && <span>Zone: {slot.zone}</span>}
                              {slot.settings?.size && <span>Size: {slot.settings.size}</span>}
                              {slot.settings?.delay && (
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {slot.settings.delay / 1000}s delay
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSlot(slot)
                                setShowConfigDialog(true)
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Switch
                              checked={slot.enabled}
                              onCheckedChange={(checked) => toggleAdSlot(slot.id, checked)}
                              disabled={saving}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google AdSense */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Google AdSense
                </CardTitle>
                <CardDescription>Display advertising network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Publisher ID</Label>
                  <Input value="ca-pub-1742989559393752" readOnly />
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Active Ad Slots</p>
                  {getSlotsByPlatform('adsense').map(slot => (
                    <div key={slot.id} className="flex items-center justify-between py-2">
                      <span className="text-sm">{slot.name}</span>
                      <Switch
                        checked={slot.enabled}
                        onCheckedChange={(checked) => toggleAdSlot(slot.id, checked)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monetag */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Monetag
                </CardTitle>
                <CardDescription>Alternative monetization network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration</AlertTitle>
                  <AlertDescription>
                    Monetag zones are configured via environment variables
                  </AlertDescription>
                </Alert>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Popup Zone</p>
                      <p className="text-sm text-muted-foreground">Zone: 9469379</p>
                    </div>
                    <Switch 
                      checked={adSettings.monetagPopup} 
                      onCheckedChange={(checked) => saveGlobalSetting('monetagPopup', checked)}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Zone: 9469382</p>
                    </div>
                    <Switch 
                      checked={adSettings.monetagPush} 
                      onCheckedChange={(checked) => saveGlobalSetting('monetagPush', checked)}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Native Ads</p>
                      <p className="text-sm text-muted-foreground">Zone: 9469381</p>
                    </div>
                    <Switch 
                      checked={adSettings.monetagNative} 
                      onCheckedChange={(checked) => saveGlobalSetting('monetagNative', checked)}
                      disabled={saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Ad Configuration</CardTitle>
              <CardDescription>Optimize ads for mobile devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="space-y-1">
                  <p className="font-medium">Mobile Ads Master Switch</p>
                  <p className="text-sm text-muted-foreground">
                    Control all mobile advertisements
                  </p>
                </div>
                <Switch
                  checked={adSettings.mobileAds}
                  onCheckedChange={(checked) => saveGlobalSetting('mobileAds', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Mobile Ad Slots</p>
                {getSlotsByType('mobile').map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{slot.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{slot.settings?.width}x{slot.settings?.height}</span>
                        {slot.settings?.mobilePosition && (
                          <Badge variant="outline" className="text-xs">
                            {slot.settings.mobilePosition}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={slot.enabled && adSettings.mobileAds}
                      onCheckedChange={(checked) => toggleAdSlot(slot.id, checked)}
                      disabled={saving || !adSettings.mobileAds}
                    />
                  </div>
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Mobile Optimization</AlertTitle>
                <AlertDescription>
                  Mobile ads are automatically sized and positioned for optimal user experience
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Fine-tune ad behavior and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Ad Refresh Interval</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No refresh</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often ads should refresh (if supported)
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Viewability Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="50" className="w-20" />
                    <span className="text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum percentage of ad that must be visible
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Ad Density Control</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Better UX</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="high">High - Max Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Restricted Pages</p>
                <p className="text-xs text-muted-foreground">
                  Pages where ads should never appear
                </p>
                <div className="space-y-2">
                  {['/admin', '/builder', '/export', '/ats-check'].map(page => (
                    <div key={page} className="flex items-center gap-2">
                      <Badge variant="outline">{page}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>Technical details for troubleshooting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{new Date(adSettings.lastUpdated).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Ad Slots:</span>
                  <span>{adSlots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Slots:</span>
                  <span>{getEnabledSlotsCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Mode:</span>
                  <span>{adSettings.testMode ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ad Performance Analytics</CardTitle>
                  <CardDescription>Track impressions, clicks, revenue, and CTR</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={performancePeriod} onValueChange={(value: any) => {
                    setPerformancePeriod(value)
                    loadPerformanceData()
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPerformanceData}
                    disabled={loadingPerformance}
                  >
                    {loadingPerformance ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPerformance ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : performanceData ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceData.total?.formattedRevenue || '$0.00'}
                        </div>
                        {performanceData.period?.growth && (
                          <p className={`text-xs mt-1 ${
                            parseFloat(performanceData.period.growth.revenue) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {performanceData.period.growth.revenue} vs previous
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Impressions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceData.total?.formattedImpressions || '0'}
                        </div>
                        {performanceData.period?.growth && (
                          <p className={`text-xs mt-1 ${
                            parseFloat(performanceData.period.growth.impressions) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {performanceData.period.growth.impressions} vs previous
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Clicks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceData.total?.formattedClicks || '0'}
                        </div>
                        {performanceData.period?.growth && (
                          <p className={`text-xs mt-1 ${
                            parseFloat(performanceData.period.growth.clicks) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {performanceData.period.growth.clicks} vs previous
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Average CTR</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {performanceData.total?.ctr?.toFixed(2) || '0.00'}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click-through rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Performing Ads */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top Performing Ad Slots</CardTitle>
                      <CardDescription>Based on revenue generation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {performanceData.topPerformingAds && performanceData.topPerformingAds.length > 0 ? (
                        <div className="space-y-3">
                          {performanceData.topPerformingAds.map((ad: any, index: number) => {
                            const slot = adSlots.find(s => s.id === ad.adSlotId)
                            return (
                              <div key={ad.adSlotId} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center gap-3">
                                  <div className="text-lg font-bold text-muted-foreground">
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{slot?.name || ad.adSlotId}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>CTR: {ad.formattedCTR}</span>
                                      <span>Revenue: {ad.formattedRevenue}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {slot?.settings?.platform || 'Unknown'}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No performance data available yet</p>
                          <p className="text-xs mt-1">Ad metrics will appear here once ads start generating impressions</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Period Comparison */}
                  {performanceData.period && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Period Comparison</CardTitle>
                        <CardDescription>Current vs Previous {performancePeriod}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Revenue</span>
                                  <span className="font-medium">{performanceData.period.current?.formattedRevenue || '$0.00'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">CTR</span>
                                  <span className="font-medium">{performanceData.period.current?.ctr?.toFixed(2) || '0.00'}%</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Previous Period</p>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Revenue</span>
                                  <span className="font-medium">{performanceData.period.previous?.formattedRevenue || '$0.00'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">CTR</span>
                                  <span className="font-medium">{performanceData.period.previous?.ctr?.toFixed(2) || '0.00'}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data Available</AlertTitle>
                  <AlertDescription>
                    Performance tracking will begin once ads start receiving impressions
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tracking</CardTitle>
              <CardDescription>How ad performance is measured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ad performance is automatically tracked when users view and interact with ads. 
                    Metrics are updated in real-time and stored locally.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Impressions</Badge>
                    <span className="text-sm text-muted-foreground">Counted when an ad is displayed to a user</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Clicks</Badge>
                    <span className="text-sm text-muted-foreground">Tracked when a user clicks on an ad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Revenue</Badge>
                    <span className="text-sm text-muted-foreground">Estimated based on ad network rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">CTR</Badge>
                    <span className="text-sm text-muted-foreground">Click-through rate (clicks ÷ impressions × 100)</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reset Performance Data</p>
                    <p className="text-sm text-muted-foreground">Clear all historical performance metrics</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to reset all performance data? This action cannot be undone.')) {
                        try {
                          const response = await ClientAdminAuth.makeAuthenticatedRequest(
                            '/api/admin/ads/performance',
                            { method: 'DELETE' }
                          )
                          if (response.ok) {
                            toast({
                              title: "Success",
                              description: "Performance data has been reset"
                            })
                            loadPerformanceData()
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to reset performance data",
                            variant: "destructive"
                          })
                        }
                      }
                    }}
                  >
                    Reset All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Ad Slot: {selectedSlot?.name}</DialogTitle>
            <DialogDescription>
              Adjust settings for this specific ad placement
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot ID</Label>
                  <Input value={selectedSlot.id} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={selectedSlot.type} readOnly />
                </div>
              </div>

              {selectedSlot.settings?.delay !== undefined && (
                <div className="space-y-2">
                  <Label>Display Delay (ms)</Label>
                  <Input 
                    type="number" 
                    value={selectedSlot.settings.delay} 
                    onChange={(e) => {
                      const newDelay = parseInt(e.target.value)
                      setSelectedSlot({
                        ...selectedSlot,
                        settings: { ...selectedSlot.settings, delay: newDelay }
                      })
                    }}
                  />
                </div>
              )}

              {selectedSlot.settings?.cooldown !== undefined && (
                <div className="space-y-2">
                  <Label>Cooldown Period (ms)</Label>
                  <Input 
                    type="number" 
                    value={selectedSlot.settings.cooldown} 
                    onChange={(e) => {
                      const newCooldown = parseInt(e.target.value)
                      setSelectedSlot({
                        ...selectedSlot,
                        settings: { ...selectedSlot.settings, cooldown: newCooldown }
                      })
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedSlot.enabled ? 'enabled' : 'disabled'}
                  onValueChange={(value) => {
                    setSelectedSlot({ ...selectedSlot, enabled: value === 'enabled' })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Some settings may require environment variables to be configured on the server
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (selectedSlot) {
                  const success = await updateAdSlot(selectedSlot.id, selectedSlot)
                  if (success) {
                    setShowConfigDialog(false)
                  }
                }
              }}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
            <DialogDescription>
              Preview how ads will appear to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className={`mx-auto ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Preview Mode</AlertTitle>
                  <AlertDescription>
                    This is a simulation of ad placements. Actual ads may vary based on user context and ad network availability.
                  </AlertDescription>
                </Alert>

                <div className="mt-4 space-y-4">
                  {/* Header Ad */}
                  {adSlots.find(s => s.position === 'header' && s.enabled) && (
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center rounded">
                      <p className="text-sm font-medium text-blue-600">Header Banner Ad</p>
                      <p className="text-xs text-blue-500">728x90</p>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="h-96 bg-white border rounded p-4">
                        <p className="text-sm text-gray-600">Main Content Area</p>
                        {/* Inline Ad */}
                        {adSlots.find(s => s.type === 'inline' && s.enabled) && (
                          <div className="border-2 border-dashed border-green-300 bg-green-50 p-6 text-center rounded mt-4">
                            <p className="text-sm font-medium text-green-600">Inline Content Ad</p>
                            <p className="text-xs text-green-500">Responsive</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sidebar */}
                    {previewDevice === 'desktop' && (
                      <div className="w-80">
                        {adSlots.find(s => s.type === 'sidebar' && s.enabled) && (
                          <div className="border-2 border-dashed border-purple-300 bg-purple-50 p-8 text-center rounded">
                            <p className="text-sm font-medium text-purple-600">Sidebar Ad</p>
                            <p className="text-xs text-purple-500">300x300</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile Ads */}
                  {previewDevice === 'mobile' && adSettings.mobileAds && (
                    <>
                      {adSlots.find(s => s.settings?.mobilePosition === 'top' && s.enabled) && (
                        <div className="border-2 border-dashed border-orange-300 bg-orange-50 p-4 text-center rounded">
                          <p className="text-sm font-medium text-orange-600">Mobile Top Banner</p>
                          <p className="text-xs text-orange-500">320x50</p>
                        </div>
                      )}
                      {adSlots.find(s => s.settings?.mobilePosition === 'bottom' && s.enabled) && (
                        <div className="fixed bottom-0 left-0 right-0 border-2 border-dashed border-red-300 bg-red-50 p-4 text-center">
                          <p className="text-sm font-medium text-red-600">Mobile Bottom Banner</p>
                          <p className="text-xs text-red-500">320x50</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
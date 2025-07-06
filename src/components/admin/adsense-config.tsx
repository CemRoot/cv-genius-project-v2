'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Info,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'
import { ClientAdminAuth } from '@/lib/admin-auth'
import { useToast, createToastUtils } from '@/components/ui/toast'

interface AdSenseConfig {
  sidebarSlot: string
  inlineSlot: string
  footerSlot: string
  stickySlot: string
  lastUpdated: string
}

export default function AdSenseConfiguration() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasVercelIntegration, setHasVercelIntegration] = useState(false)
  const [config, setConfig] = useState<AdSenseConfig>({
    sidebarSlot: '',
    inlineSlot: '',
    footerSlot: '',
    stickySlot: '',
    lastUpdated: ''
  })
  const [originalConfig, setOriginalConfig] = useState<AdSenseConfig>(config)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads/config')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConfig(data.config)
          setOriginalConfig(data.config)
          setHasVercelIntegration(data.hasVercelIntegration)
        }
      }
    } catch (error) {
      toast.error("Error", "Failed to load AdSense configuration")
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOriginalConfig(config)
          toast.success("Success", data.message)
          
          if (data.note) {
            toast.info("Note", data.note)
          }
        } else {
          throw new Error(data.error)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save configuration')
      }
    } catch (error: any) {
      toast.error("Error", error.message || "Failed to save AdSense configuration")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(config) !== JSON.stringify(originalConfig)
  }

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied", `${name} copied to clipboard`)
  }

  const validateSlotId = (value: string) => {
    if (!value) return true
    return /^\d{10}$/.test(value)
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
      <Card>
        <CardHeader>
          <CardTitle>AdSense Configuration</CardTitle>
          <CardDescription>
            Manage your Google AdSense ad slot IDs. Changes are saved to Vercel environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <Badge variant={hasVercelIntegration ? "default" : "secondary"}>
              {hasVercelIntegration ? 'Vercel Integration Active' : 'Local Storage Only'}
            </Badge>
            {config.lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(config.lastUpdated).toLocaleString()}
              </span>
            )}
          </div>

          {!hasVercelIntegration && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Vercel Integration Required</AlertTitle>
              <AlertDescription>
                To save AdSense configuration permanently, ensure VERCEL_TOKEN and VERCEL_PROJECT_ID 
                are set in your environment variables.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Publisher ID */}
          <div className="space-y-2">
            <Label>Publisher ID</Label>
            <div className="flex items-center gap-2">
              <Input value="ca-pub-1742989559393752" readOnly className="font-mono" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('ca-pub-1742989559393752', 'Publisher ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is your AdSense publisher ID configured in the environment
            </p>
          </div>

          <Separator />

          {/* Ad Slot IDs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ad Slot IDs</h3>
            <p className="text-sm text-muted-foreground">
              Enter the 10-digit slot IDs from your AdSense account for each ad placement.
            </p>

            {/* Sidebar Slot */}
            <div className="space-y-2">
              <Label htmlFor="sidebarSlot">Sidebar Ad (300x300)</Label>
              <Input
                id="sidebarSlot"
                placeholder="e.g., 1234567890"
                value={config.sidebarSlot}
                onChange={(e) => setConfig({ ...config, sidebarSlot: e.target.value })}
                className={`font-mono ${!validateSlotId(config.sidebarSlot) ? 'border-red-500' : ''}`}
              />
              {!validateSlotId(config.sidebarSlot) && (
                <p className="text-xs text-red-500">Must be a 10-digit number</p>
              )}
            </div>

            {/* Inline Slot */}
            <div className="space-y-2">
              <Label htmlFor="inlineSlot">Inline Content Ad (Responsive)</Label>
              <Input
                id="inlineSlot"
                placeholder="e.g., 0987654321"
                value={config.inlineSlot}
                onChange={(e) => setConfig({ ...config, inlineSlot: e.target.value })}
                className={`font-mono ${!validateSlotId(config.inlineSlot) ? 'border-red-500' : ''}`}
              />
              {!validateSlotId(config.inlineSlot) && (
                <p className="text-xs text-red-500">Must be a 10-digit number</p>
              )}
            </div>

            {/* Footer Slot */}
            <div className="space-y-2">
              <Label htmlFor="footerSlot">Footer Banner (728x90)</Label>
              <Input
                id="footerSlot"
                placeholder="e.g., 1122334455"
                value={config.footerSlot}
                onChange={(e) => setConfig({ ...config, footerSlot: e.target.value })}
                className={`font-mono ${!validateSlotId(config.footerSlot) ? 'border-red-500' : ''}`}
              />
              {!validateSlotId(config.footerSlot) && (
                <p className="text-xs text-red-500">Must be a 10-digit number</p>
              )}
            </div>

            {/* Sticky Slot */}
            <div className="space-y-2">
              <Label htmlFor="stickySlot">Sticky Sidebar (160x600)</Label>
              <Input
                id="stickySlot"
                placeholder="e.g., 5544332211"
                value={config.stickySlot}
                onChange={(e) => setConfig({ ...config, stickySlot: e.target.value })}
                className={`font-mono ${!validateSlotId(config.stickySlot) ? 'border-red-500' : ''}`}
              />
              {!validateSlotId(config.stickySlot) && (
                <p className="text-xs text-red-500">Must be a 10-digit number</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={saveConfig}
                disabled={saving || !hasChanges()}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={loadConfig}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload
              </Button>
            </div>
            {hasChanges() && (
              <Badge variant="secondary" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>How to Get Ad Slot IDs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <a 
                href="https://www.google.com/adsense" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Go to Google AdSense
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Navigate to <strong>Ads → By ad unit</strong></li>
            <li>Create new ad units for each placement type:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Display ad 300x300 for sidebar</li>
                <li>Display ad Responsive for inline content</li>
                <li>Display ad 728x90 for footer</li>
                <li>Display ad 160x600 for sticky sidebar</li>
              </ul>
            </li>
            <li>Copy the <strong>data-ad-slot</strong> value from each ad code</li>
            <li>Paste the 10-digit slot IDs above and save</li>
          </ol>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              After saving, you may need to redeploy your application on Vercel for the changes 
              to take effect. The ads will start showing once Google approves your site.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status Check */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium">ads.txt File</p>
              <p className="text-sm text-muted-foreground">
                Available at{' '}
                <a 
                  href="/ads.txt" 
                  target="_blank" 
                  className="text-blue-600 hover:underline"
                >
                  /ads.txt
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium">AdSense Script</p>
              <p className="text-sm text-muted-foreground">
                Auto-loaded on pages with ads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {config.sidebarSlot || config.inlineSlot || config.footerSlot || config.stickySlot ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">Ad Slot Configuration</p>
              <p className="text-sm text-muted-foreground">
                {config.sidebarSlot || config.inlineSlot || config.footerSlot || config.stickySlot
                  ? 'At least one slot configured'
                  : 'No slots configured yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
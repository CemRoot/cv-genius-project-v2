'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle, Wrench, Globe, Loader2, Save, Eye, Monitor } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface MaintenanceSection {
  id: string
  name: string
  path: string
  isInMaintenance: boolean
  message: string
  estimatedTime: string
}

interface MaintenanceSettings {
  globalMaintenance: boolean
  sections: MaintenanceSection[]
}

export function MaintenanceToggleManagement() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    globalMaintenance: false,
    sections: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewSection, setPreviewSection] = useState<MaintenanceSection | null>(null)
  const { addToast } = useToast()

  // Load maintenance settings
  useEffect(() => {
    fetchMaintenanceSettings()
  }, [])

  const fetchMaintenanceSettings = async () => {
    try {
      const response = await fetch('/api/admin/maintenance')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading maintenance settings:', error)
      addToast({
        type: 'error',
        title: 'Failed to load maintenance settings'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAllSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Maintenance settings saved successfully'
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error)
      addToast({
        type: 'error',
        title: 'Failed to save maintenance settings'
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleSectionMaintenance = (sectionId: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, isInMaintenance: !section.isInMaintenance }
          : section
      )
    }))
  }

  const toggleGlobalMaintenance = () => {
    setSettings(prev => ({
      ...prev,
      globalMaintenance: !prev.globalMaintenance
    }))
  }

  const updateSectionMessage = (sectionId: string, message: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, message }
          : section
      )
    }))
  }

  const updateSectionTime = (sectionId: string, estimatedTime: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, estimatedTime }
          : section
      )
    }))
  }

  const MaintenancePagePreview = ({ section }: { section: MaintenanceSection }) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <svg className="w-64 h-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 700">
          <circle cx="292.61" cy="213" r="213" fill="#f2f2f2"></circle>
          <path fill="#2f2e41" d="M0 51.14c0 77.5 48.62 140.21 108.7 140.21"></path>
          <path fill="#03c39d" d="M108.7 191.35c0-78.37 54.26-141.78 121.3-141.78M39.38 58.17c0 73.61 31 133.18 69.32 133.18"></path>
          <path fill="#2f2e41" d="M108.7 191.35c0-100.14 62.71-181.17 140.2-181.17"></path>
          <circle cx="316.61" cy="538" r="79" fill="#2f2e41"></circle>
          <circle cx="318.61" cy="518" r="27" fill="#fff"></circle>
          <circle cx="318.61" cy="518" r="9" fill="#3f3d56"></circle>
          <rect width="513.25" height="357.52" x="578.43" y="212.69" fill="#2f2e41" rx="18.05"></rect>
          <path fill="#3f3d56" d="M595.7 231.78h478.71v267.84H595.7z"></path>
          <circle cx="835.06" cy="223.29" r="3.03" fill="#f2f2f2"></circle>
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {window.location.hostname} is temporarily unavailable.
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
        {section.message}
      </p>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        We'll be back shortly.
      </p>
      
      <div className="border rounded-lg p-4 max-w-md mx-auto bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Maintenance Details</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Section:</strong> {section.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Estimated time:</strong> {section.estimatedTime}
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const activeMaintenance = settings.sections.filter(s => s.isInMaintenance).length

  return (
    <div className="space-y-6">
      {/* Global Maintenance Alert */}
      {settings.globalMaintenance && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Global Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            The entire site is currently in maintenance mode. All sections are inaccessible to users.
          </AlertDescription>
        </Alert>
      )}

      {/* Design Preview Info */}
      <Alert>
        <Monitor className="h-4 w-4" />
        <AlertTitle>New Simple Maintenance Page Design</AlertTitle>
        <AlertDescription>
          Your maintenance pages now feature a clean, minimal design inspired by modern maintenance pages. 
          The design automatically adapts to dark/light mode and is fully responsive for mobile devices.
        </AlertDescription>
      </Alert>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Control Center
              </CardTitle>
              <CardDescription>
                Toggle maintenance mode for individual sections with on/off switches
              </CardDescription>
            </div>
            <Button 
              onClick={saveAllSettings} 
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold">{settings.sections.length}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">In Maintenance</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeMaintenance}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Operational</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{settings.sections.length - activeMaintenance}</p>
            </div>
          </div>

          {/* Global Maintenance Toggle */}
          <div className="border rounded-lg p-4 mb-6 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="global-maintenance" className="text-base font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Global Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode for the entire site (overrides individual sections)
                </p>
              </div>
              <Switch
                checked={settings.globalMaintenance}
                onCheckedChange={toggleGlobalMaintenance}
                className="data-[state=checked]:bg-red-600"
                disabled={saving}
              />
            </div>
          </div>

          {/* Section Controls */}
          <div className="space-y-4">
            {settings.sections.map((section) => (
              <Card key={section.id} className={section.isInMaintenance ? 'border-orange-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {section.name}
                        {section.isInMaintenance && (
                          <Badge variant="destructive" className="ml-2">
                            Maintenance Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Path: {section.path}</CardDescription>
                    </div>
                    <Switch
                      checked={section.isInMaintenance}
                      onCheckedChange={() => toggleSectionMaintenance(section.id)}
                      disabled={settings.globalMaintenance || saving}
                    />
                  </div>
                </CardHeader>
                {section.isInMaintenance && !settings.globalMaintenance && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`${section.id}-message`}>Maintenance Message</Label>
                      <Textarea
                        id={`${section.id}-message`}
                        value={section.message}
                        onChange={(e) => updateSectionMessage(section.id, e.target.value)}
                        className="mt-2"
                        rows={3}
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${section.id}-time`}>Estimated Downtime</Label>
                      <Input
                        id={`${section.id}-time`}
                        value={section.estimatedTime}
                        onChange={(e) => updateSectionTime(section.id, e.target.value)}
                        className="mt-2"
                        placeholder="e.g., 30 minutes, 2 hours"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewSection(section)}
                            disabled={saving}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Preview Design
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Maintenance Page Preview - {section.name}</DialogTitle>
                          </DialogHeader>
                          <MaintenancePagePreview section={section} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(section.path, '_blank')}
                        disabled={saving}
                      >
                        Visit Section
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
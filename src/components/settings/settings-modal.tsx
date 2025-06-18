'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Settings, Palette, Save, Download, Clock } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'

interface AppSettings {
  autoSaveEnabled: boolean
  autoSaveInterval: number // in seconds
  defaultExportFormat: 'pdf' | 'docx'
  defaultTemplate: string
}

const defaultSettings: AppSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 30,
  defaultExportFormat: 'pdf',
  defaultTemplate: 'harvard'
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentCV, setTemplate, enableAutoSave, disableAutoSave, autoSaveEnabled, setAutoSaveInterval } = useCVStore()
  
  // Load settings from localStorage
  const loadSettings = (): AppSettings => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cvgenius-settings')
        if (saved) {
          return { ...defaultSettings, ...JSON.parse(saved) }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return {
      ...defaultSettings,
      autoSaveEnabled,
      defaultTemplate: currentCV?.template || 'harvard'
    }
  }

  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  // Reload settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings())
    }
  }, [isOpen])

  const handleSave = () => {
    console.log('Settings handleSave called with:', settings)
    console.log('Current CV template:', currentCV?.template)
    
    // Update auto-save settings
    if (settings.autoSaveEnabled) {
      console.log('Enabling auto-save with interval:', settings.autoSaveInterval * 1000)
      enableAutoSave()
      setAutoSaveInterval(settings.autoSaveInterval * 1000) // Convert to milliseconds
    } else {
      console.log('Disabling auto-save')
      disableAutoSave()
    }

    // Update template if changed
    if (settings.defaultTemplate !== currentCV?.template) {
      console.log('Changing template from', currentCV?.template, 'to', settings.defaultTemplate)
      setTemplate(settings.defaultTemplate)
    }

    // Save to localStorage
    localStorage.setItem('cvgenius-settings', JSON.stringify(settings))
    console.log('Settings saved to localStorage')
    
    onClose()
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-cvgenius-primary" />
              Settings
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  CV Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Template</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { 
                        id: 'harvard', 
                        name: 'Harvard', 
                        desc: 'Classic Academic Style',
                        preview: '📄 Traditional, professional layout with clean typography'
                      },
                      { 
                        id: 'modern', 
                        name: 'Modern', 
                        desc: 'Clean & Professional',
                        preview: '✨ Minimalist design with modern spacing (Coming Soon)'
                      },
                      { 
                        id: 'creative', 
                        name: 'Creative', 
                        desc: 'Stand Out Design',
                        preview: '🎨 Eye-catching design for creative roles (Coming Soon)'
                      },
                      { 
                        id: 'executive', 
                        name: 'Executive', 
                        desc: 'Senior Leadership',
                        preview: '💼 Sophisticated layout for C-level positions (Coming Soon)'
                      },
                      { 
                        id: 'graduate', 
                        name: 'Graduate', 
                        desc: 'Entry Level',
                        preview: '🎓 Optimized for new graduates (Coming Soon)'
                      },
                      { 
                        id: 'tech', 
                        name: 'Tech', 
                        desc: 'Developer Focused',
                        preview: '💻 Technical layout for developers (Coming Soon)'
                      }
                    ].map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          settings.defaultTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${template.id !== 'harvard' ? 'opacity-50' : ''}`}
                        onClick={() => {
                          if (template.id === 'harvard') {
                            setSettings(prev => ({ ...prev, defaultTemplate: template.id }))
                          }
                        }}
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{template.desc}</div>
                        <div className="text-xs text-gray-500">{template.preview}</div>
                        {template.id === 'harvard' && (
                          <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ Available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Choose your preferred CV template. You can change this anytime.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Auto-save Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Auto-save
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Auto-save</Label>
                    <p className="text-sm text-gray-500">
                      Automatically save your CV as you work
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSaveEnabled}
                    onCheckedChange={(checked: boolean) => 
                      setSettings(prev => ({ ...prev, autoSaveEnabled: checked }))
                    }
                  />
                </div>

                {settings.autoSaveEnabled && (
                  <div className="space-y-2">
                    <Label>Auto-save Interval</Label>
                    <Select 
                      value={settings.autoSaveInterval.toString()} 
                      onValueChange={(value: string) => 
                        setSettings(prev => ({ ...prev, autoSaveInterval: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 seconds</SelectItem>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every 1 minute</SelectItem>
                        <SelectItem value="120">Every 2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Format Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select 
                    value={settings.defaultExportFormat} 
                    onValueChange={(value: 'pdf' | 'docx') => 
                      setSettings(prev => ({ ...prev, defaultExportFormat: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF - Best for viewing and printing</SelectItem>
                      <SelectItem value="docx">Word (DOCX) - Editable format</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Your preferred format when clicking the quick export button.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Settings Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Auto-save helps prevent data loss while you work</li>
                <li>• PDF format is recommended for most job applications</li>
                <li>• Harvard template works well for traditional industries</li>
                <li>• Modern template is great for tech and creative roles</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
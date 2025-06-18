'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings, Palette, Save, Download, Clock, X } from 'lucide-react'
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

export function SettingsModalSimple({ isOpen, onClose }: SettingsModalProps) {
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
    // Update auto-save settings
    if (settings.autoSaveEnabled) {
      enableAutoSave()
      setAutoSaveInterval(settings.autoSaveInterval * 1000) // Convert to milliseconds
    } else {
      disableAutoSave()
    }

    // Update template if changed
    if (settings.defaultTemplate !== currentCV?.template) {
      setTemplate(settings.defaultTemplate)
    }

    // Save to localStorage
    localStorage.setItem('cvgenius-settings', JSON.stringify(settings))
    
    onClose()
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[70vh] overflow-y-auto my-auto">
        <div className="p-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 border-b pb-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              Settings
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {/* Template Selection */}
            <div className="border rounded-md p-2">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">CV Template</h3>
              </div>
              
              <select 
                value={settings.defaultTemplate}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultTemplate: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="harvard">Harvard - Classic Academic</option>
                <option value="modern">Modern - Clean & Professional</option>
                <option value="creative">Creative - Stand Out Design</option>
                <option value="executive">Executive - Senior Leadership</option>
                <option value="graduate">Graduate - Entry Level</option>
                <option value="tech">Tech - Developer Focused</option>
              </select>
            </div>

            {/* Auto-save Preferences */}
            <div className="border rounded-md p-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Auto-save</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Auto-save</span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSaveEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoSaveEnabled: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`relative w-9 h-5 transition-colors duration-200 ease-in-out rounded-full ${
                      settings.autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                        settings.autoSaveEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {settings.autoSaveEnabled && (
                  <select
                    value={settings.autoSaveInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSaveInterval: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={15}>Every 15 seconds</option>
                    <option value={30}>Every 30 seconds</option>
                    <option value={60}>Every 1 minute</option>
                    <option value={120}>Every 2 minutes</option>
                  </select>
                )}
              </div>
            </div>

            {/* Export Format Defaults */}
            <div className="border rounded-md p-2">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Export Format</h3>
              </div>
              
              <select
                value={settings.defaultExportFormat}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultExportFormat: e.target.value as 'pdf' | 'docx' }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pdf">PDF - Best for viewing and printing</option>
                <option value="docx">Word (DOCX) - Editable format</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-3 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Type, Maximize2, AlignJustify, Space } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'

export interface DesignSettings {
  margins: number // in inches
  sectionSpacing: 'tight' | 'normal' | 'relaxed' | 'spacious'
  headerSpacing: 'compact' | 'normal' | 'generous'
  fontFamily: string
  fontSize: number // in pt
  lineHeight: number
}

const defaultSettings: DesignSettings = {
  margins: 0.5,
  sectionSpacing: 'normal',
  headerSpacing: 'normal',
  fontFamily: 'Times New Roman',
  fontSize: 10,
  lineHeight: 1.2
}

export function DesignControls() {
  const { currentCV, updateDesignSettings } = useCVStore()
  const [settings, setSettings] = useState<DesignSettings>(
    currentCV?.designSettings || defaultSettings
  )

  // Sync local state with CV store changes
  useEffect(() => {
    if (currentCV?.designSettings) {
      setSettings(currentCV.designSettings)
    }
  }, [currentCV?.designSettings])

  const handleUpdate = (updates: Partial<DesignSettings>) => {
    const newSettings = { ...settings, ...updates }
    console.log('Design settings updated:', newSettings)
    console.log('Current CV before update:', currentCV.designSettings)
    setSettings(newSettings)
    updateDesignSettings(newSettings)
    console.log('Update function called with:', newSettings)
    
    // Force a re-render by updating the state immediately
    setTimeout(() => {
      setSettings(newSettings)
    }, 0)
  }

  const marginOptions = [0.5, 0.75, 1, 1.25, 1.5]
  const fontOptions = [
    // Professional serif fonts (Times New Roman alternatives)
    'Source Serif 4', 'Merriweather', 'Playfair Display',
    // Professional sans-serif fonts (Arial alternatives) 
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    // System fonts (fallback)
    'Times New Roman', 'Arial', 'Calibri'
  ]
  const fontSizeOptions = [10, 11, 12, 13]
  const lineHeightOptions = [1, 1.15, 1.3, 1.5]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5" />
          Design Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page Length Warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Real-time Page Detection</h4>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            The Preview panel now shows accurate page count. Use controls below to fit your CV within 2 pages.
          </p>
        </div>

        {/* Page Margins */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Page Margins ({settings.margins} inches)
          </Label>
          <div className="flex gap-2">
            {marginOptions.map((margin) => (
              <Button
                key={margin}
                variant={settings.margins === margin ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdate({ margins: margin })}
                className="flex-1"
              >
                {margin}"
              </Button>
            ))}
          </div>
        </div>

        {/* Section Spacing */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Space className="h-4 w-4" />
            Section Spacing
          </Label>
          <Select 
            value={settings.sectionSpacing} 
            onValueChange={(value: 'tight' | 'normal' | 'relaxed' | 'spacious') => handleUpdate({ sectionSpacing: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tight">Tight (Save space)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Header Spacing */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Header Spacing
          </Label>
          <Select 
            value={settings.headerSpacing} 
            onValueChange={(value: 'compact' | 'normal' | 'generous') => handleUpdate({ headerSpacing: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact (Tight header)</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="generous">Generous (More space)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Style
          </Label>
          <Select 
            value={settings.fontFamily} 
            onValueChange={(value: string) => handleUpdate({ fontFamily: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Font Size ({settings.fontSize}pt)</Label>
          <div className="flex gap-2">
            {fontSizeOptions.map((size) => (
              <Button
                key={size}
                variant={settings.fontSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdate({ fontSize: size })}
                className="flex-1"
              >
                {size}pt
              </Button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlignJustify className="h-4 w-4" />
            Line Height ({settings.lineHeight})
          </Label>
          <div className="flex gap-2">
            {lineHeightOptions.map((height) => (
              <Button
                key={height}
                variant={settings.lineHeight === height ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdate({ lineHeight: height })}
                className="flex-1"
              >
                {height}
              </Button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => handleUpdate(defaultSettings)}
        >
          Reset to Defaults
        </Button>

        {/* Page Fit Helper */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Use smaller margins and "Tight" spacing to fit more content. 
            Recommended for 2-page limit: 0.5" margins, 11pt font, 1.15 line height.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
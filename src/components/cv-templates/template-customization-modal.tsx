'use client'

import React, { useState } from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color-picker'
import { X, Save, RotateCcw, Eye, EyeOff } from 'lucide-react'

interface TemplateCustomizationModalProps {
  template: CvTemplate
  isOpen: boolean
  onClose: () => void
  onSave: (customizedTemplate: CvTemplate) => void
}

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Helvetica', label: 'Helvetica (Classic)' },
  { value: 'Georgia', label: 'Georgia (Elegant)' },
  { value: 'Times New Roman', label: 'Times New Roman (Traditional)' },
  { value: 'Arial', label: 'Arial (Simple)' },
  { value: 'Montserrat', label: 'Montserrat (Professional)' },
  { value: 'Lato', label: 'Lato (Warm)' },
  { value: 'Playfair Display', label: 'Playfair Display (Sophisticated)' }
]

export function TemplateCustomizationModal({
  template,
  isOpen,
  onClose,
  onSave
}: TemplateCustomizationModalProps) {
  const [customTemplate, setCustomTemplate] = useState<CvTemplate>(template)
  const [showPreview, setShowPreview] = useState(true)

  if (!isOpen) return null

  const handleStyleChange = (key: keyof CvTemplate['styling'], value: any) => {
    setCustomTemplate({
      ...customTemplate,
      styling: {
        ...customTemplate.styling,
        [key]: value
      }
    })
  }

  const handleSectionToggle = (sectionId: string) => {
    setCustomTemplate({
      ...customTemplate,
      defaultData: {
        ...customTemplate.defaultData,
        sections: customTemplate.defaultData.sections?.map(section =>
          section.id === sectionId
            ? { ...section, visible: !section.visible }
            : section
        )
      }
    })
  }

  const handleReset = () => {
    setCustomTemplate(template)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Customization Panel */}
        <div className="w-1/2 p-6 overflow-y-auto border-r">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Customize Template</h2>
              <p className="text-gray-600">{template.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs defaultValue="style" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>Customize fonts and text styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={customTemplate.styling.fontFamily}
                      onValueChange={(value) => handleStyleChange('fontFamily', value)}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="header-style">Header Style</Label>
                    <Select
                      value={customTemplate.styling.headerStyle}
                      onValueChange={(value) => handleStyleChange('headerStyle', value)}
                    >
                      <SelectTrigger id="header-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colors</CardTitle>
                  <CardDescription>Set primary and secondary colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary-color"
                        type="color"
                        value={customTemplate.styling.primaryColor}
                        onChange={(e) => handleStyleChange('primaryColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={customTemplate.styling.primaryColor}
                        onChange={(e) => handleStyleChange('primaryColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={customTemplate.styling.secondaryColor}
                        onChange={(e) => handleStyleChange('secondaryColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={customTemplate.styling.secondaryColor}
                        onChange={(e) => handleStyleChange('secondaryColor', e.target.value)}
                        placeholder="#666666"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout</CardTitle>
                  <CardDescription>Choose the overall layout structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={customTemplate.styling.layout}
                    onValueChange={(value) => handleStyleChange('layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-column">Single Column</SelectItem>
                      <SelectItem value="two-column">Two Column</SelectItem>
                      <SelectItem value="modern-grid">Modern Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Section Visibility</CardTitle>
                  <CardDescription>Toggle which sections appear in your CV</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customTemplate.defaultData.sections?.map(section => (
                    <div key={section.id} className="flex items-center justify-between">
                      <Label htmlFor={`section-${section.id}`} className="flex-1 cursor-pointer">
                        {section.title}
                      </Label>
                      <Switch
                        id={`section-${section.id}`}
                        checked={section.visible}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Tags</CardTitle>
                  <CardDescription>Manage template categories and tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customTemplate.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button onClick={() => onSave(customTemplate)} className="flex-1 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Apply Customizations
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>

          {showPreview && (
            <div className="bg-white rounded-lg shadow-lg p-8 transform scale-75 origin-top">
              <div className="aspect-[210/297] overflow-hidden">
                {/* Template Preview Component would go here */}
                <div className="text-center text-gray-500 py-20">
                  <p>Template preview with customizations</p>
                  <p className="text-sm mt-2">Font: {customTemplate.styling.fontFamily}</p>
                  <p className="text-sm">Layout: {customTemplate.styling.layout}</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div 
                      className="w-12 h-12 rounded"
                      style={{ backgroundColor: customTemplate.styling.primaryColor }}
                    />
                    <div 
                      className="w-12 h-12 rounded"
                      style={{ backgroundColor: customTemplate.styling.secondaryColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
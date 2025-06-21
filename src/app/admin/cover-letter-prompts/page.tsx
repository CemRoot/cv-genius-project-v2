'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, RefreshCw, FileText, Wand2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface PromptConfig {
  generation: {
    systemPrompt: string
    templates: {
      basic: string
      professional: string
      creative: string
      executive: string
    }
    tones: {
      formal: string
      friendly: string
      enthusiastic: string
    }
  }
  editing: {
    systemPrompt: string
    improvementPrompt: string
    regenerationPrompt: string
  }
  settings: {
    temperature: number
    maxTokens: number
    topK: number
    topP: number
  }
}

export default function CoverLetterPromptsPage() {
  const { addToast } = useToast()
  
  // States
  const [prompts, setPrompts] = useState<PromptConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState('generation')

  // Load prompts on mount
  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/admin/cover-letter-prompts')
      const data = await response.json()
      
      if (data.success) {
        setPrompts(data.prompts)
      } else {
        // Use default prompts if none exist
        setPrompts(getDefaultPrompts())
      }
    } catch (error) {
      console.error('Failed to load prompts:', error)
      setPrompts(getDefaultPrompts())
      addToast({
        type: 'error',
        title: 'Load Failed',
        description: 'Failed to load prompts. Using defaults.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultPrompts = (): PromptConfig => ({
    generation: {
      systemPrompt: `You are a professional cover letter writer with expertise in creating compelling, personalized cover letters. Create cover letters that are engaging, professional, and tailored to the specific job and company.`,
      templates: {
        basic: `Create a professional cover letter that highlights the candidate's qualifications and enthusiasm for the position.`,
        professional: `Create a polished, corporate-style cover letter emphasizing achievements and professional expertise.`,
        creative: `Create an engaging cover letter that showcases creativity while maintaining professionalism.`,
        executive: `Create an executive-level cover letter demonstrating leadership experience and strategic thinking.`
      },
      tones: {
        formal: `Use a formal, professional tone suitable for traditional industries.`,
        friendly: `Use a warm, approachable tone while maintaining professionalism.`,
        enthusiastic: `Use an energetic, passionate tone that conveys genuine interest.`
      }
    },
    editing: {
      systemPrompt: `You are a professional editor specializing in cover letters. Improve existing content while maintaining the original message and structure.`,
      improvementPrompt: `Improve the following cover letter based on the user's specific instructions. Maintain professionalism and keep the core message intact.`,
      regenerationPrompt: `Create a completely new cover letter using the original candidate information and job details. Make it fresh and compelling.`
    },
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      topK: 40,
      topP: 0.95
    }
  })

  const handleSave = async () => {
    if (!prompts) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/cover-letter-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompts })
      })

      const result = await response.json()
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Saved!',
          description: 'Cover letter prompts have been saved successfully.'
        })
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save prompts. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const defaults = getDefaultPrompts()
      setPrompts(defaults)
      
      addToast({
        type: 'info',
        title: 'Reset Complete',
        description: 'Prompts have been reset to default values.'
      })
    } finally {
      setIsResetting(false)
    }
  }

  const updatePrompt = (path: string, value: string | number) => {
    if (!prompts) return
    
    const pathArray = path.split('.')
    const newPrompts = { ...prompts }
    let current: any = newPrompts
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]]
    }
    
    current[pathArray[pathArray.length - 1]] = value
    setPrompts(newPrompts)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      </div>
    )
  }

  if (!prompts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load prompts. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Cover Letter AI Prompts
              </h1>
              <p className="text-sm sm:text-lg text-gray-600">
                Manage AI prompts for cover letter generation and editing
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isResetting}
                className="flex items-center gap-2"
              >
                {isResetting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Reset</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generation" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generation</span>
            </TabsTrigger>
            <TabsTrigger value="editing" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Editing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Generation Prompts */}
          <TabsContent value="generation" className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
              <Textarea
                value={prompts.generation.systemPrompt}
                onChange={(e) => updatePrompt('generation.systemPrompt', e.target.value)}
                placeholder="System prompt for cover letter generation..."
                className="min-h-[100px] text-sm"
              />
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Templates */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Template Prompts</h3>
                <div className="space-y-4">
                  {Object.entries(prompts.generation.templates).map(([key, value]) => (
                    <div key={key}>
                      <Label className="capitalize">{key}</Label>
                      <Textarea
                        value={value}
                        onChange={(e) => updatePrompt(`generation.templates.${key}`, e.target.value)}
                        className="mt-1 min-h-[80px] text-sm"
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tones */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Tone Prompts</h3>
                <div className="space-y-4">
                  {Object.entries(prompts.generation.tones).map(([key, value]) => (
                    <div key={key}>
                      <Label className="capitalize">{key}</Label>
                      <Textarea
                        value={value}
                        onChange={(e) => updatePrompt(`generation.tones.${key}`, e.target.value)}
                        className="mt-1 min-h-[80px] text-sm"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Editing Prompts */}
          <TabsContent value="editing" className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Editing System Prompt</h3>
              <Textarea
                value={prompts.editing.systemPrompt}
                onChange={(e) => updatePrompt('editing.systemPrompt', e.target.value)}
                placeholder="System prompt for cover letter editing..."
                className="min-h-[100px] text-sm"
              />
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Improvement Prompt</h3>
                <Textarea
                  value={prompts.editing.improvementPrompt}
                  onChange={(e) => updatePrompt('editing.improvementPrompt', e.target.value)}
                  placeholder="Prompt for improving existing cover letters..."
                  className="min-h-[150px] text-sm"
                />
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Regeneration Prompt</h3>
                <Textarea
                  value={prompts.editing.regenerationPrompt}
                  onChange={(e) => updatePrompt('editing.regenerationPrompt', e.target.value)}
                  placeholder="Prompt for regenerating cover letters..."
                  className="min-h-[150px] text-sm"
                />
              </Card>
            </div>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">AI Generation Settings</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={prompts.settings.temperature}
                    onChange={(e) => updatePrompt('settings.temperature', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Controls randomness (0-2)</p>
                </div>

                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    min="100"
                    max="4096"
                    value={prompts.settings.maxTokens}
                    onChange={(e) => updatePrompt('settings.maxTokens', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum response length</p>
                </div>

                <div>
                  <Label>Top K</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={prompts.settings.topK}
                    onChange={(e) => updatePrompt('settings.topK', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Limits vocabulary (1-100)</p>
                </div>

                <div>
                  <Label>Top P</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={prompts.settings.topP}
                    onChange={(e) => updatePrompt('settings.topP', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nucleus sampling (0-1)</p>
                </div>
              </div>
            </Card>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Tips:</strong> Lower temperature (0.3-0.7) for more consistent outputs. 
                Higher temperature (0.7-1.2) for more creative content. 
                Adjust Top K and Top P to control vocabulary diversity.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
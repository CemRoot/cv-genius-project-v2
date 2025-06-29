'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, RefreshCw, FileText, Wand2, Settings, Brain, Target, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ClientAdminAuth } from '@/lib/admin-auth'

interface CVPromptConfig {
  textImprovement: {
    systemPrompt: string
    prompts: {
      general: string
      professionalSummary: string
      experience: string
      skills: string
      education: string
    }
  }
  analysisPrompts: {
    contentAnalysis: string
    atsCompatibility: string
  }
  settings: {
    temperature: number
    maxTokens: number
    topK: number
    topP: number
  }
}

export default function CVBuilderPromptsPage() {
  const { addToast } = useToast()
  const router = useRouter()
  
  // States
  const [prompts, setPrompts] = useState<CVPromptConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState('improvement')

  // Load prompts on mount
  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/cv-builder-prompts')
      const data = await response.json()
      
      if (data.success) {
        setPrompts(data.prompts)
      } else {
        // Use default prompts if none exist
        setPrompts(getDefaultPrompts())
      }
    } catch (error) {
      console.error('Failed to load CV Builder prompts:', error)
      setPrompts(getDefaultPrompts())
      addToast({
        type: 'error',
        title: 'Load Failed',
        description: 'Failed to load CV Builder prompts. Using defaults.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultPrompts = (): CVPromptConfig => ({
    textImprovement: {
      systemPrompt: `You are a professional text improvement specialist for CV content. Your expertise is in enhancing CV text while preserving the original meaning, tone, and language.

Key principles:
1. Maintain the original language (Turkish stays Turkish, English stays English)
2. Preserve the professional tone and meaning
3. Fix grammar and spelling errors only
4. Improve sentence structure and flow
5. Make text more professional and clear
6. Do NOT add new content or merge concepts
7. Keep the same approximate length
8. Focus on clarity and ATS compatibility`,
      prompts: {
        general: `Improve this CV text while preserving its original meaning and language.

Original text: "{text}"
Text type: {type}

Instructions:
- Fix grammar and spelling errors only
- Improve sentence structure and flow
- Make it more professional and clear
- DO NOT change the language or add content
- DO NOT merge words together
- Preserve the original tone and meaning
- Keep the same length approximately
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`,
        professionalSummary: `Improve this professional summary while maintaining its core message and language.

Original summary: "{text}"

Instructions:
- Enhance clarity and professional impact
- Keep the same key achievements and skills mentioned
- Maintain the original language
- Use active voice where appropriate
- Ensure ATS-friendly language
- Keep the same approximate length (2-3 sentences)
- DO NOT add new qualifications or experiences

Return only the improved summary text, nothing else.`,
        experience: `Improve this work experience description while preserving all original information.

Original experience: "{text}"
Position context: {type}

Instructions:
- Enhance action verbs and impact statements
- Improve clarity and professional tone
- Maintain all original responsibilities and achievements
- Keep the original language
- Use bullet-point friendly structure
- Focus on quantifiable results where mentioned
- DO NOT add new responsibilities or achievements

Return only the improved experience text, nothing else.`,
        skills: `Improve this skills section while maintaining the original skill set.

Original skills: "{text}"
Skills category: {type}

Instructions:
- Organize skills more professionally
- Use industry-standard terminology
- Maintain the original language
- Keep all mentioned skills
- Improve formatting for ATS compatibility
- Group related skills appropriately
- DO NOT add new skills not mentioned

Return only the improved skills text, nothing else.`,
        education: `Improve this education entry while preserving all original information.

Original education: "{text}"

Instructions:
- Enhance professional presentation
- Maintain all original qualifications and dates
- Keep the original language
- Use standard academic formatting
- Improve clarity and completeness
- Focus on ATS-friendly presentation
- DO NOT add new qualifications or details

Return only the improved education text, nothing else.`
      }
    },
    analysisPrompts: {
      contentAnalysis: `Analyze this CV content for quality and completeness:

CV Content: "{text}"
Section: {type}

Provide analysis in JSON format:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Focus on:
- Content quality and relevance
- ATS compatibility
- Professional presentation
- Irish job market standards
- Missing elements that could improve impact`,
      atsCompatibility: `Analyze this CV text for ATS (Applicant Tracking System) compatibility:

CV Text: "{text}"
Content Type: {type}

Check for:
1. Keyword density and relevance
2. Clear section headers
3. Readable formatting
4. Industry-standard terminology
5. Quantifiable achievements

Return JSON:
{
  "atsScore": 0-100,
  "issues": ["issue1", "issue2"],
  "improvements": ["fix1", "fix2"],
  "keywords": ["missing_keyword1", "missing_keyword2"]
}`
    },
    settings: {
      temperature: 0.3,
      maxTokens: 1500,
      topK: 20,
      topP: 0.8
    }
  })

  const handleSave = async () => {
    if (!prompts) return
    
    setIsSaving(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/cv-builder-prompts', {
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
          description: 'CV Builder prompts have been saved successfully.'
        })
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save CV Builder prompts. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/cv-builder-prompts', {
        method: 'PUT'
      })

      const result = await response.json()
      
      if (result.success) {
        setPrompts(result.prompts)
        addToast({
          type: 'info',
          title: 'Reset Complete',
          description: 'CV Builder prompts have been reset to default values.'
        })
      } else {
        throw new Error(result.error || 'Reset failed')
      }
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
          <p className="text-gray-600">Loading CV Builder prompts...</p>
        </div>
      </div>
    )
  }

  if (!prompts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load CV Builder prompts. Please refresh the page.
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
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                CV Builder AI Prompts
              </h1>
              <p className="text-sm sm:text-lg text-gray-600">
                Manage AI prompts for CV text improvement and analysis
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
            <TabsTrigger value="improvement" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Text Improvement</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Text Improvement Prompts */}
          <TabsContent value="improvement" className="space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
              <Textarea
                value={prompts.textImprovement.systemPrompt}
                onChange={(e) => updatePrompt('textImprovement.systemPrompt', e.target.value)}
                placeholder="System prompt for CV text improvement..."
                className="min-h-[120px] text-sm"
              />
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* General Improvement */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">General Text Improvement</h3>
                <Textarea
                  value={prompts.textImprovement.prompts.general}
                  onChange={(e) => updatePrompt('textImprovement.prompts.general', e.target.value)}
                  placeholder="General text improvement prompt..."
                  className="min-h-[200px] text-sm"
                />
              </Card>

              {/* Professional Summary */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
                <Textarea
                  value={prompts.textImprovement.prompts.professionalSummary}
                  onChange={(e) => updatePrompt('textImprovement.prompts.professionalSummary', e.target.value)}
                  placeholder="Professional summary improvement prompt..."
                  className="min-h-[200px] text-sm"
                />
              </Card>

              {/* Experience */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                <Textarea
                  value={prompts.textImprovement.prompts.experience}
                  onChange={(e) => updatePrompt('textImprovement.prompts.experience', e.target.value)}
                  placeholder="Work experience improvement prompt..."
                  className="min-h-[200px] text-sm"
                />
              </Card>

              {/* Skills */}
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Skills Section</h3>
                <Textarea
                  value={prompts.textImprovement.prompts.skills}
                  onChange={(e) => updatePrompt('textImprovement.prompts.skills', e.target.value)}
                  placeholder="Skills improvement prompt..."
                  className="min-h-[200px] text-sm"
                />
              </Card>

              {/* Education */}
              <Card className="p-4 sm:p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Education Section</h3>
                <Textarea
                  value={prompts.textImprovement.prompts.education}
                  onChange={(e) => updatePrompt('textImprovement.prompts.education', e.target.value)}
                  placeholder="Education improvement prompt..."
                  className="min-h-[200px] text-sm"
                />
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Prompts */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                <Textarea
                  value={prompts.analysisPrompts.contentAnalysis}
                  onChange={(e) => updatePrompt('analysisPrompts.contentAnalysis', e.target.value)}
                  placeholder="Content analysis prompt..."
                  className="min-h-[250px] text-sm"
                />
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">ATS Compatibility</h3>
                <Textarea
                  value={prompts.analysisPrompts.atsCompatibility}
                  onChange={(e) => updatePrompt('analysisPrompts.atsCompatibility', e.target.value)}
                  placeholder="ATS compatibility analysis prompt..."
                  className="min-h-[250px] text-sm"
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
                  <p className="text-xs text-gray-500 mt-1">Controls creativity (0-2)</p>
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
                  <p className="text-xs text-gray-500 mt-1">Vocabulary limit (1-100)</p>
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
              <Brain className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>CV Builder AI Tips:</strong><br/>
                • Lower temperature (0.1-0.3) for consistent text improvements<br/>
                • Higher temperature (0.5-0.7) for more creative content analysis<br/>
                • Lower Top K (10-30) for focused vocabulary in professional context<br/>
                • These settings only affect temperature and maxTokens in the current implementation
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
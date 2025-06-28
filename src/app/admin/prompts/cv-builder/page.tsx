'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RefreshCw, Sparkles, FileText, Briefcase, GraduationCap, Award } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

interface CVBuilderPrompt {
  id: string
  name: string
  category: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'general'
  prompt: string
  temperature: number
  maxTokens: number
  examples?: string[]
  active: boolean
}

const defaultPrompts: CVBuilderPrompt[] = [
  {
    id: 'personal-enhancement',
    name: 'Personal Information Enhancement',
    category: 'personal',
    prompt: `Enhance the following personal information for a CV. Make the professional title more impactful and ensure all information is formatted professionally:

Input: {personalInfo}

Requirements:
- Professional title should be clear and industry-standard
- Format phone numbers consistently
- Ensure email is professional
- LinkedIn URL should be clean

Return enhanced personal information in the same JSON structure.`,
    temperature: 0.3,
    maxTokens: 500,
    active: true
  },
  {
    id: 'summary-generator',
    name: 'Professional Summary Generator',
    category: 'summary',
    prompt: `Generate a professional summary for a CV based on the following information:

Name: {name}
Professional Title: {title}
Years of Experience: {experience}
Key Skills: {skills}
Career Goals: {goals}

Requirements:
- 3-4 sentences maximum
- Start with years of experience and expertise
- Include 2-3 key achievements or skills
- End with career aspirations
- Use active voice and powerful action words
- Avoid clichés and generic statements`,
    temperature: 0.7,
    maxTokens: 300,
    active: true
  },
  {
    id: 'experience-enhancer',
    name: 'Work Experience Enhancement',
    category: 'experience',
    prompt: `Enhance the following work experience entry for a CV:

Position: {position}
Company: {company}
Duration: {duration}
Description: {description}

Requirements:
- Start each bullet point with a strong action verb
- Include quantifiable achievements where possible
- Focus on impact and results
- Use industry-specific keywords
- Keep bullets concise (1-2 lines each)
- Highlight leadership and problem-solving

Return 3-5 enhanced bullet points.`,
    temperature: 0.5,
    maxTokens: 400,
    active: true
  },
  {
    id: 'skills-optimizer',
    name: 'Skills Section Optimizer',
    category: 'skills',
    prompt: `Optimize and categorize the following skills for a CV:

Skills: {skills}
Job Target: {jobTarget}

Requirements:
- Categorize into Technical, Soft Skills, and Tools/Technologies
- Prioritize most relevant skills for the target job
- Remove redundant or outdated skills
- Add relevant skills that might be missing
- Use industry-standard terminology

Return organized skills in categories.`,
    temperature: 0.4,
    maxTokens: 300,
    active: true
  }
]

export default function CVBuilderPromptsPage() {
  const [prompts, setPrompts] = useState<CVBuilderPrompt[]>(defaultPrompts)
  const [selectedPrompt, setSelectedPrompt] = useState<CVBuilderPrompt | null>(prompts[0])
  const [isSaving, setIsSaving] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const savePrompt = async (prompt: CVBuilderPrompt) => {
    setIsSaving(true)
    try {
      // TODO: Save to database
      const updatedPrompts = prompts.map(p => 
        p.id === prompt.id ? prompt : p
      )
      setPrompts(updatedPrompts)
      // Show success toast
    } catch (error) {
      console.error('Failed to save prompt:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const testPrompt = async () => {
    if (!selectedPrompt || !testInput) return
    
    setIsTesting(true)
    try {
      // TODO: Call AI API with the prompt
      setTestOutput('AI response will appear here...')
    } catch (error) {
      console.error('Failed to test prompt:', error)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CV Builder AI Prompts</h1>
          <p className="text-muted-foreground mt-2">
            Manage AI prompts for CV generation and enhancement
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Prompt Templates</CardTitle>
            <CardDescription>Select a prompt to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedPrompt?.id === prompt.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {prompt.category === 'personal' && <FileText className="w-4 h-4" />}
                    {prompt.category === 'summary' && <Sparkles className="w-4 h-4" />}
                    {prompt.category === 'experience' && <Briefcase className="w-4 h-4" />}
                    {prompt.category === 'education' && <GraduationCap className="w-4 h-4" />}
                    {prompt.category === 'skills' && <Award className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{prompt.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {prompt.category}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    prompt.active ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Prompt Editor */}
        {selectedPrompt && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Prompt: {selectedPrompt.name}</CardTitle>
              <CardDescription>
                Configure the AI prompt and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="prompt" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="space-y-4">
                  <div>
                    <Label>Prompt Template</Label>
                    <Textarea
                      value={selectedPrompt.prompt}
                      onChange={(e) => setSelectedPrompt({
                        ...selectedPrompt,
                        prompt: e.target.value
                      })}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="Enter your prompt template..."
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Use placeholders like {'{variable}'} for dynamic content
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={selectedPrompt.active}
                      onChange={(e) => setSelectedPrompt({
                        ...selectedPrompt,
                        active: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="space-y-6">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={selectedPrompt.category}
                      onValueChange={(value: any) => setSelectedPrompt({
                        ...selectedPrompt,
                        category: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Information</SelectItem>
                        <SelectItem value="summary">Professional Summary</SelectItem>
                        <SelectItem value="experience">Work Experience</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Temperature</Label>
                      <span className="text-sm text-muted-foreground">
                        {selectedPrompt.temperature}
                      </span>
                    </div>
                    <Slider
                      value={[selectedPrompt.temperature]}
                      onValueChange={([value]) => setSelectedPrompt({
                        ...selectedPrompt,
                        temperature: value
                      })}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower = More focused, Higher = More creative
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Max Tokens</Label>
                      <span className="text-sm text-muted-foreground">
                        {selectedPrompt.maxTokens}
                      </span>
                    </div>
                    <Slider
                      value={[selectedPrompt.maxTokens]}
                      onValueChange={([value]) => setSelectedPrompt({
                        ...selectedPrompt,
                        maxTokens: value
                      })}
                      min={100}
                      max={2000}
                      step={50}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="test" className="space-y-4">
                  <div>
                    <Label>Test Input</Label>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      rows={4}
                      placeholder="Enter test data for this prompt..."
                    />
                  </div>

                  <Button 
                    onClick={testPrompt}
                    disabled={isTesting || !testInput}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Test Prompt
                      </>
                    )}
                  </Button>

                  {testOutput && (
                    <div>
                      <Label>AI Output</Label>
                      <div className="mt-2 p-4 rounded-lg border bg-muted/50">
                        <pre className="whitespace-pre-wrap text-sm">
                          {testOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPrompt(
                    prompts.find(p => p.id === selectedPrompt.id) || null
                  )}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => savePrompt(selectedPrompt)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
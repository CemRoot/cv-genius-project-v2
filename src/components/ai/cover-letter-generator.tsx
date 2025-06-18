"use client"

import { useState, useEffect } from 'react'
import { useCVStore } from '@/store/cv-store'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Copy, Download, RefreshCw, Wand2, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CoverLetterData {
  content: string
  template: string
  tone: string
  wordCount: number
  metadata: {
    company: string
    position: string
    applicantName: string
    generatedAt: string
  }
}

const templates = [
  { 
    id: 'basic', 
    name: 'Basic', 
    description: 'Standard professional format',
    preview: `Dear Hiring Manager,

I am writing to express my interest in the [Position] role at [Company]. With my background in [Field], I am confident I would be a valuable addition to your team.

In my previous role, I successfully [Achievement]. My experience with [Skill] and dedication to [Value] align well with your requirements.

I would welcome the opportunity to discuss how my skills can contribute to [Company]'s continued success.

Sincerely,
[Your Name]`
  },
  { 
    id: 'highPerformer', 
    name: 'High Performer', 
    description: 'Results-focused with metrics',
    preview: `Dear [Hiring Manager],

I am excited to apply for the [Position] at [Company]. My track record of achieving [X% improvement] and [specific metric] demonstrates my ability to drive results.

Key achievements include:
• Increased [metric] by X% over Y months
• Led team of X people to exceed targets by Y%
• Implemented [solution] resulting in [measurable outcome]

These results showcase my commitment to excellence and data-driven approach that would benefit [Company].

Best regards,
[Your Name]`
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    description: 'Engaging for creative roles',
    preview: `Hello [Team/Hiring Manager],

Your [Position] role caught my attention immediately – it's exactly the kind of creative challenge I thrive on! 

My passion for [Creative Field] has led me to [Creative Achievement]. I love pushing boundaries and bringing fresh perspectives to projects. Whether it's [Creative Example 1] or [Creative Example 2], I approach every project with enthusiasm and innovation.

I'd love to bring this creative energy to [Company] and help [Creative Goal].

Looking forward to creating something amazing together!

[Your Name]`
  },
  { 
    id: 'graduate', 
    name: 'Graduate', 
    description: 'Entry-level focused',
    preview: `Dear [Hiring Manager],

As a recent graduate in [Field], I am eager to begin my career with [Company] in the [Position] role.

During my studies, I gained valuable experience through:
• [Academic Project/Internship]
• [Relevant Coursework/Skills]
• [Extra-curricular activities]

While I may be new to the professional world, I bring fresh perspectives, strong fundamentals, and enthusiasm to learn and contribute.

I would appreciate the opportunity to start my career with your esteemed organization.

Sincerely,
[Your Name]`
  },
  { 
    id: 'careerChange', 
    name: 'Career Change', 
    description: 'Transition-focused',
    preview: `Dear [Hiring Manager],

I am writing to express my interest in transitioning to [New Field] through the [Position] role at [Company].

While my background is in [Previous Field], the transferable skills I've developed are highly relevant:
• [Transferable Skill 1] from [Previous Experience]
• [Transferable Skill 2] that applies to [New Field]
• [Relevant Learning/Certification] to bridge the gap

My diverse experience brings a unique perspective that can benefit [Company] in achieving [Goal].

Thank you for considering my career transition.

Best regards,
[Your Name]`
  },
  { 
    id: 'executive', 
    name: 'Executive', 
    description: 'Senior leadership focused',
    preview: `Dear [Executive/Board],

I am writing to discuss the [Executive Position] opportunity at [Company]. With [X] years of senior leadership experience, I have consistently delivered strategic results and organizational growth.

My leadership philosophy centers on [Leadership Approach], which has enabled me to:
• Scale organizations from [X] to [Y] in [timeframe]
• Drive strategic initiatives resulting in [major outcome]
• Build and lead high-performing teams across [functions]

I am particularly drawn to [Company]'s vision and would welcome the opportunity to contribute to your continued success at the executive level.

Respectfully,
[Your Name]`
  }
]

const tones = [
  { id: 'formal', name: 'Formal', description: 'Professional business language' },
  { id: 'friendly', name: 'Friendly', description: 'Warm but professional' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic and passionate' }
]

export function CoverLetterGenerator() {
  const { currentCV } = useCVStore()
  const { addToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  
  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState('basic')
  const [selectedTone, setSelectedTone] = useState('formal')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [background, setBackground] = useState('')
  const [achievements, setAchievements] = useState('')
  const [jobRequirements, setJobRequirements] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [autoFillFromCV, setAutoFillFromCV] = useState(true)
  const [includeAddress, setIncludeAddress] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Auto-fill from CV data when component mounts or CV changes
  useEffect(() => {
    if (autoFillFromCV && currentCV) {
      setApplicantName(currentCV.personal.fullName || '')
      setBackground(currentCV.personal.summary || '')
      setUserAddress(currentCV.personal.address || '')
      setUserPhone(currentCV.personal.phone || '')
      
      // Extract achievements from experience
      const experienceAchievements = currentCV.experience
        .flatMap(exp => exp.achievements || [])
        .filter(achievement => achievement.trim())
        .slice(0, 5) // Limit to top 5 achievements
      
      if (experienceAchievements.length > 0) {
        setAchievements(experienceAchievements.join('\n'))
      }
    }
  }, [currentCV, autoFillFromCV])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!applicantName.trim()) {
      errors.applicantName = 'Full name is required'
    }
    
    if (!company.trim()) {
      errors.company = 'Company name is required'
    }
    
    if (!position.trim()) {
      errors.position = 'Position title is required'
    }
    
    if (!background.trim()) {
      errors.background = 'Professional background is required'
    } else if (background.trim().length < 50) {
      errors.background = 'Professional background should be at least 50 characters'
    }
    
    if (company.trim().length > 100) {
      errors.company = 'Company name should be less than 100 characters'
    }
    
    if (position.trim().length > 100) {
      errors.position = 'Position title should be less than 100 characters'
    }
    
    if (background.trim().length > 1000) {
      errors.background = 'Professional background should be less than 1000 characters'
    }
    
    if (achievements.length > 2000) {
      errors.achievements = 'Achievements section is too long (max 2000 characters)'
    }
    
    if (jobDescription.length > 5000) {
      errors.jobDescription = 'Job description is too long (max 5000 characters)'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateCoverLetter = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors before generating')
      addToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please check the required fields and fix any errors.'
      })
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const achievementsList = achievements
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[•\-\*]\s*/, ''))

      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user'
        },
        body: JSON.stringify({
          template: selectedTemplate,
          tone: selectedTone,
          company,
          position,
          applicantName,
          background,
          achievements: achievementsList,
          jobRequirements,
          jobDescription,
          customInstructions,
          includeAddress,
          userAddress: includeAddress ? userAddress : '',
          userPhone: userPhone,
          currentDate: new Date().toLocaleDateString('en-IE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      if (data.success) {
        setCoverLetter(data.coverLetter)
        addToast({
          type: 'success',
          title: 'Cover Letter Generated!',
          description: 'Your cover letter has been created successfully.'
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate cover letter'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Generation Failed',
        description: errorMessage
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (coverLetter) {
      try {
        await navigator.clipboard.writeText(coverLetter.content)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        addToast({
          type: 'success',
          title: 'Copied!',
          description: 'Cover letter copied to clipboard.'
        })
      } catch (err) {
        setError('Failed to copy to clipboard')
        addToast({
          type: 'error',
          title: 'Copy Failed',
          description: 'Failed to copy to clipboard. Please try again.'
        })
      }
    }
  }

  const downloadAsText = () => {
    if (!coverLetter) return
    
    try {
      const blob = new Blob([coverLetter.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Cover Letter - ${coverLetter.metadata.company} - ${coverLetter.metadata.position}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      addToast({
        type: 'success',
        title: 'Downloaded!',
        description: 'Cover letter has been downloaded successfully.'
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        description: 'Failed to download the file. Please try again.'
      })
    }
  }

  const resetForm = () => {
    setCoverLetter(null)
    setError(null)
    setCopySuccess(false)
    setCompany('')
    setPosition('')
    if (!autoFillFromCV) {
      setApplicantName('')
      setBackground('')
      setAchievements('')
      setUserAddress('')
      setUserPhone('')
    }
    setJobRequirements('')
    setJobDescription('')
    setCustomInstructions('')
    setIncludeAddress(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-cvgenius-primary" />
            AI Cover Letter Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CV Auto-fill Toggle */}
          {currentCV && currentCV.personal.fullName && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="autoFillFromCV"
                checked={autoFillFromCV}
                onChange={(e) => setAutoFillFromCV(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="autoFillFromCV" className="text-sm">
                Auto-fill from my current CV ({currentCV.personal.fullName})
              </Label>
            </div>
          )}
          
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Template Style</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`relative p-3 border rounded-lg transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-cvgenius-primary bg-cvgenius-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => setSelectedTemplate(template.id)}
                    className="w-full text-left"
                  >
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </button>
                  
                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewTemplate(template.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-cvgenius-primary hover:bg-white hover:shadow-sm rounded-md transition-colors"
                    title={`Preview ${template.name} template`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label>Tone</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedTone === tone.id
                      ? 'border-cvgenius-primary bg-cvgenius-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium">{tone.name}</h4>
                  <p className="text-xs text-muted-foreground">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Address Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="includeAddress"
                checked={includeAddress}
                onChange={(e) => setIncludeAddress(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeAddress" className="text-sm">
                Include my address in cover letter header (Irish format)
              </Label>
            </div>
            
            {includeAddress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userAddress">Your Address</Label>
                  <Textarea
                    id="userAddress"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="123 Main Street&#10;Dublin 2&#10;Ireland"
                    rows={3}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: Street, City, Country (one line per address component)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userPhone">Phone Number (Optional)</Label>
                  <Input
                    id="userPhone"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+353 87 123 4567"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if you prefer not to include phone number
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicantName">
                Your Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="applicantName"
                value={applicantName}
                onChange={(e) => {
                  setApplicantName(e.target.value)
                  if (validationErrors.applicantName) {
                    setValidationErrors(prev => ({ ...prev, applicantName: '' }))
                  }
                }}
                placeholder="John Smith"
                className={validationErrors.applicantName ? 'border-red-500' : ''}
              />
              {validationErrors.applicantName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.applicantName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value)
                  if (validationErrors.company) {
                    setValidationErrors(prev => ({ ...prev, company: '' }))
                  }
                }}
                placeholder="Tech Corp Ireland"
                className={validationErrors.company ? 'border-red-500' : ''}
              />
              {validationErrors.company && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.company}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="position">
                Position Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value)
                  if (validationErrors.position) {
                    setValidationErrors(prev => ({ ...prev, position: '' }))
                  }
                }}
                placeholder="Senior Software Engineer"
                className={validationErrors.position ? 'border-red-500' : ''}
              />
              {validationErrors.position && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.position}</p>
              )}
            </div>
          </div>

          {/* Job Description Field */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">
              Job Description <span className="text-blue-600">(Recommended)</span>
            </Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                if (validationErrors.jobDescription) {
                  setValidationErrors(prev => ({ ...prev, jobDescription: '' }))
                }
              }}
              placeholder="Paste the full job description here for AI to analyze requirements, skills, and create a perfectly targeted cover letter...

Example: Copy job posting from LinkedIn, IrishJobs, Indeed, etc."
              rows={6}
              className={`text-sm ${validationErrors.jobDescription ? 'border-red-500' : ''}`}
            />
            {validationErrors.jobDescription && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.jobDescription}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {jobDescription.length}/5000 characters
              </p>
              <div className="text-xs text-blue-600 font-medium">
                ✨ AI will auto-extract: skills, requirements, keywords
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">
              Professional Background <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="background"
              value={background}
              onChange={(e) => {
                setBackground(e.target.value)
                if (validationErrors.background) {
                  setValidationErrors(prev => ({ ...prev, background: '' }))
                }
              }}
              placeholder="Brief summary of your relevant experience, education, and skills..."
              rows={3}
              className={validationErrors.background ? 'border-red-500' : ''}
            />
            {validationErrors.background && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.background}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {background.length}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={achievements}
              onChange={(e) => {
                setAchievements(e.target.value)
                if (validationErrors.achievements) {
                  setValidationErrors(prev => ({ ...prev, achievements: '' }))
                }
              }}
              placeholder="• Increased sales by 25%&#10;• Led team of 10 developers&#10;• Implemented cost-saving measures"
              rows={3}
              className={validationErrors.achievements ? 'border-red-500' : ''}
            />
            {validationErrors.achievements && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.achievements}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter each achievement on a new line ({achievements.length}/2000 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobRequirements">Job Requirements (Optional)</Label>
            <Textarea
              id="jobRequirements"
              value={jobRequirements}
              onChange={(e) => setJobRequirements(e.target.value)}
              placeholder="Paste key requirements from the job posting..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="customInstructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any specific points you want to emphasize or mention..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateCoverLetter}
              disabled={isGenerating}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
            
            {coverLetter && (
              <Button 
                variant="outline"
                onClick={resetForm}
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Generated Cover Letter */}
      <AnimatePresence>
        {coverLetter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Cover Letter
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {coverLetter.wordCount} words
                    </Badge>
                    <Badge variant="secondary">
                      {templates.find(t => t.id === coverLetter.template)?.name}
                    </Badge>
                    <Badge variant="outline">
                      {tones.find(t => t.id === coverLetter.tone)?.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                  {coverLetter.content}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={copyToClipboard} 
                    variant={copySuccess ? "default" : "outline"} 
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copySuccess ? 'Copied!' : 'Copy Text'}
                  </Button>
                  <Button onClick={downloadAsText} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Generated on {new Date(coverLetter.metadata.generatedAt).toLocaleDateString('en-IE')} for {coverLetter.metadata.company}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Irish Cover Letter Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🇮🇪 Irish Cover Letter Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Required Structure:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground ml-2">
                <li>1. Your Address & Phone (optional)</li>
                <li>2. Date (DD/MM/YYYY format)</li>
                <li>3. Company Contact & Address</li>
                <li>4. Salutation (Dear Name / Dear Sir/Madam)</li>
                <li>5. Four structured paragraphs</li>
                <li>6. Professional closing & signature</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">AI Job Analysis:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground ml-2">
                <li>• Paste job description for targeted cover letters</li>
                <li>• AI extracts keywords, skills, and requirements</li>
                <li>• Automatically matches your experience to job needs</li>
                <li>• Uses company-specific language and terminology</li>
                <li>• Optimizes for ATS (Applicant Tracking Systems)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Key Rules:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground ml-2">
                <li>• Use "Yours sincerely" if addressing by name</li>
                <li>• Use "Yours faithfully" for "Dear Sir/Madam"</li>
                <li>• Include hand-written signature space</li>
                <li>• Write name in BLOCK CAPITALS below signature</li>
                <li>• Maximum one page length</li>
                <li>• British English spelling (organisation, colour)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {templates.find(t => t.id === previewTemplate)?.name} Template Preview
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Template Description */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Style:</strong> {templates.find(t => t.id === previewTemplate)?.description}
                </p>
              </div>

              {/* Preview Content */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="bg-white p-6 rounded shadow-sm font-mono text-sm leading-relaxed whitespace-pre-line">
                  {templates.find(t => t.id === previewTemplate)?.preview}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  This is a sample template. The AI will customize it based on your inputs.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTemplate(previewTemplate)
                      setPreviewTemplate(null)
                    }}
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
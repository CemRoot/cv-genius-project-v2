'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  MapPin,
  RefreshCw
} from 'lucide-react'
import { parseCV, type ParsedCVData, type AIParsingOptions } from '@/lib/ai-cv-parser'

interface AIParserPanelProps {
  onParsedData?: (data: ParsedCVData) => void
  initialText?: string
}

export default function AIParserPanel({ onParsedData, initialText = '' }: AIParserPanelProps) {
  const [inputText, setInputText] = useState(initialText)
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<AIParsingOptions>({
    enableSmartExtraction: true,
    dublinJobFocus: true,
    includeKeywordOptimization: true,
    extractProjects: true,
    detectLanguages: true
  })

  const handleParse = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    try {
      const data = await parseCV(inputText, options)
      setParsedData(data)
      onParsedData?.(data)
    } catch (error) {
      console.error('Failed to parse CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI CV Parser
          </CardTitle>
          <CardDescription>
            Paste CV text or upload a document to extract structured data using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parsing Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={options.dublinJobFocus}
                onChange={(e) => setOptions(prev => ({ ...prev, dublinJobFocus: e.target.checked }))}
                className="rounded"
              />
              <span>Dublin Focus</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={options.extractProjects}
                onChange={(e) => setOptions(prev => ({ ...prev, extractProjects: e.target.checked }))}
                className="rounded"
              />
              <span>Extract Projects</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={options.detectLanguages}
                onChange={(e) => setOptions(prev => ({ ...prev, detectLanguages: e.target.checked }))}
                className="rounded"
              />
              <span>Detect Languages</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={options.enableSmartExtraction}
                onChange={(e) => setOptions(prev => ({ ...prev, enableSmartExtraction: e.target.checked }))}
                className="rounded"
              />
              <span>Smart Extraction</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={options.includeKeywordOptimization}
                onChange={(e) => setOptions(prev => ({ ...prev, includeKeywordOptimization: e.target.checked }))}
                className="rounded"
              />
              <span>Keyword Optimization</span>
            </label>
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Paste CV text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="resize-none"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleParse} 
              disabled={!inputText.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Parse CV
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {parsedData && (
        <div className="space-y-4">
          {/* Confidence Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Parsing Results</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getConfidenceColor(parsedData.confidence)}`}>
                    {getConfidenceLabel(parsedData.confidence)} Confidence
                  </span>
                  <span className={`text-2xl font-bold ${getConfidenceColor(parsedData.confidence)}`}>
                    {parsedData.confidence}%
                  </span>
                </div>
              </CardTitle>
              <Progress value={parsedData.confidence} className="mt-2" />
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{parsedData.personalInfo.name || 'Not found'}</span>
                    {parsedData.personalInfo.name ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{parsedData.personalInfo.email || 'Not found'}</span>
                    {parsedData.personalInfo.email ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{parsedData.personalInfo.phone || 'Not found'}</span>
                    {parsedData.personalInfo.phone ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{parsedData.personalInfo.location || 'Not found'}</span>
                    {parsedData.personalInfo.location ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              {(parsedData.personalInfo.linkedin || parsedData.personalInfo.github || parsedData.personalInfo.website) && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-600">Social Links</label>
                  <div className="mt-2 space-y-1">
                    {parsedData.personalInfo.linkedin && (
                      <div className="text-sm text-blue-600">{parsedData.personalInfo.linkedin}</div>
                    )}
                    {parsedData.personalInfo.github && (
                      <div className="text-sm text-blue-600">{parsedData.personalInfo.github}</div>
                    )}
                    {parsedData.personalInfo.website && (
                      <div className="text-sm text-blue-600">{parsedData.personalInfo.website}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {parsedData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{parsedData.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {parsedData.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience ({parsedData.experience.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-semibold">{exp.position}</div>
                    <div className="text-gray-600">{exp.company}</div>
                    <div className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    )}
                    {exp.achievements.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-600">Achievements:</div>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsedData.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education ({parsedData.education.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="font-semibold">{edu.degree}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                    {edu.field && (
                      <div className="text-gray-600">Field: {edu.field}</div>
                    )}
                    <div className="text-sm text-gray-500">
                      {edu.startDate} - {edu.endDate}
                    </div>
                    {edu.grade && (
                      <div className="text-sm text-gray-600">Grade: {edu.grade}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedData.skills.technical.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Technical Skills</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parsedData.skills.technical.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedData.skills.soft.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Soft Skills</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parsedData.skills.soft.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.skills.languages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Languages</label>
                  <div className="mt-2 space-y-1">
                    {parsedData.skills.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{lang.language}</span>
                        <Badge variant={lang.proficiency === 'Native' ? 'default' : 'secondary'}>
                          {lang.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {parsedData.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications ({parsedData.certifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-sm text-gray-600">{cert.issuer}</div>
                    </div>
                    <div className="text-sm text-gray-500">{cert.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {parsedData.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects ({parsedData.projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <div className="font-semibold">{project.name}</div>
                    <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="outline" size="sm">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <div className="mt-2">
                        <a href={project.url} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-blue-600 hover:underline">
                          {project.url}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Awards */}
          {parsedData.awards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Awards ({parsedData.awards.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parsedData.awards.map((award, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{award.name}</div>
                      <div className="text-sm text-gray-600">{award.issuer}</div>
                    </div>
                    <div className="text-sm text-gray-500">{award.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => onParsedData?.(parsedData)} className="flex-1">
              Use This Data
            </Button>
            <Button variant="outline" onClick={() => setParsedData(null)}>
              Clear Results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
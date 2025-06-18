"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, Brain, Target, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCVStore } from '@/store/cv-store'

interface CVAnalysis {
  overallScore: number
  sections: {
    structure: { score: number; feedback: string }
    content: { score: number; feedback: string }
    keywords: { score: number; feedback: string }
    formatting: { score: number; feedback: string }
  }
  strengths: string[]
  improvements: string[]
  keywordSuggestions: string[]
  irishMarketFeedback: string[]
}

export function CVAnalyzer() {
  const { currentCV } = useCVStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null)
  const [targetRole, setTargetRole] = useState('')
  const [error, setError] = useState<string | null>(null)

  const analyzeCV = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user' // In production, use actual user ID
        },
        body: JSON.stringify({
          cvData: currentCV,
          targetRole: targetRole || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze CV')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default'
    if (score >= 6) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cvgenius-primary" />
            AI CV Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role (Optional)</Label>
            <Textarea
              id="targetRole"
              placeholder="e.g., Senior Software Engineer, Marketing Manager, Data Analyst..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Specify the role you're targeting for more tailored feedback
            </p>
          </div>

          <Button 
            onClick={analyzeCV}
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing CV...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze My CV
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall CV Score</span>
                  <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                    {analysis.overallScore}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={analysis.overallScore * 10} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Your CV scores {analysis.overallScore}/10 for the Irish job market
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.sections).map(([section, data]) => (
                  <div key={section} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{section}</span>
                      <span className={`font-semibold ${getScoreColor(data.score)}`}>
                        {data.score}/10
                      </span>
                    </div>
                    <Progress value={data.score * 10} className="h-2" />
                    <p className="text-sm text-muted-foreground">{data.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            {analysis.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <TrendingUp className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Keyword Suggestions */}
            {analysis.keywordSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Keyword Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordSuggestions.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Consider incorporating these keywords to improve ATS compatibility
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Irish Market Feedback */}
            {analysis.irishMarketFeedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🇮🇪 Irish Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.irishMarketFeedback.map((feedback, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{feedback}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
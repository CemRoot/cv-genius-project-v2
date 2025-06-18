"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CVAnalyzer } from '@/components/ai/cv-analyzer'
import { JobAnalyzer } from '@/components/ai/job-analyzer'
import { CoverLetterGenerator } from '@/components/ai/cover-letter-generator'
import { Brain, Search, FileText, Sparkles, Target, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'

type ActiveTool = 'cv-analyzer' | 'job-analyzer' | 'cover-letter' | null

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)

  const tools = [
    {
      id: 'cv-analyzer' as const,
      title: 'CV Analyzer',
      description: 'Get AI-powered feedback on your CV for the Irish job market',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'job-analyzer' as const,
      title: 'Job Description Analyzer',
      description: 'Extract key requirements and keywords from job postings',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'cover-letter' as const,
      title: 'Cover Letter Generator',
      description: 'Generate professional cover letters tailored to Irish employers',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  const renderTool = () => {
    switch (activeTool) {
      case 'cv-analyzer':
        return <CVAnalyzer />
      case 'job-analyzer':
        return <JobAnalyzer />
      case 'cover-letter':
        return <CoverLetterGenerator />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cvgenius-primary/10 rounded-full text-cvgenius-primary text-sm font-medium mb-4"
            >
              <Sparkles className="h-4 w-4" />
              Powered by Google Gemini AI
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              AI-Powered Career Tools
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Leverage artificial intelligence to optimize your CV, analyze job opportunities, 
              and create compelling cover letters for the Irish job market.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!activeTool ? (
          /* Tool Selection */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Choose Your AI Tool
              </h2>
              <p className="text-gray-600">
                Select the tool that best fits your current needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${tool.borderColor} ${tool.bgColor}/30`}
                      onClick={() => setActiveTool(tool.id)}
                    >
                      <CardHeader className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tool.bgColor} mx-auto mb-4`}>
                          <Icon className={`h-8 w-8 ${tool.color}`} />
                        </div>
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 mb-4">{tool.description}</p>
                        <Button className="w-full">
                          Get Started
                          <Wand2 className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Features Section */}
            <div className="mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    🇮🇪 Built for the Irish Job Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">ATS Optimization</h3>
                      <p className="text-sm text-gray-600">Optimized for Irish Applicant Tracking Systems</p>
                    </div>
                    <div className="text-center">
                      <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Smart Analysis</h3>
                      <p className="text-sm text-gray-600">AI-powered insights and recommendations</p>
                    </div>
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Professional Templates</h3>
                      <p className="text-sm text-gray-600">6 cover letter styles for different roles</p>
                    </div>
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Local Context</h3>
                      <p className="text-sm text-gray-600">Irish business culture and conventions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rate Limiting Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Target className="h-5 w-5" />
                <h4 className="font-medium">Usage Limits</h4>
              </div>
              <p className="text-sm text-amber-700 mt-2">
                Each tool is limited to 10 requests per minute to ensure fair usage. 
                All AI processing is done securely on our servers.
              </p>
            </div>
          </div>
        ) : (
          /* Active Tool */
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTool(null)}
                size="sm"
              >
                ← Back to Tools
              </Button>
              <h2 className="text-2xl font-semibold text-gray-900">
                {tools.find(tool => tool.id === activeTool)?.title}
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderTool()}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
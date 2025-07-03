'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, TrendingUp, Star, Sparkles, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string
  category: string
  features: string[]
  popularity: number
  isRecommended?: boolean
  color: {
    from: string
    to: string
  }
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'The gold standard for Irish job applications. ATS-optimized and recruiter-approved.',
    category: 'professional',
    features: ['✓ ATS-Friendly', '✓ Universal Format', '✓ Professional', '✓ Most Popular'],
    popularity: 99,
    isRecommended: true,
    color: { from: 'from-gray-800', to: 'to-black' }
  },
  {
    id: 'dublin-tech',
    name: 'Dublin Tech Professional',
    description: 'Optimized for Dublin\'s thriving tech scene - perfect for Google, Meta, LinkedIn',
    category: 'modern',
    features: ['Dublin Tech Focus', 'Modern Design', 'EU Format', 'GitHub Ready'],
    popularity: 98,
    color: { from: 'from-blue-600', to: 'to-blue-700' }
  },
  {
    id: 'irish-finance',
    name: 'Irish Finance Expert',
    description: 'Tailored for IFSC roles - ideal for banking, fintech, and insurance',
    category: 'professional',
    features: ['IFSC Standard', 'Finance Focus', 'Regulatory Ready', 'Metrics Focused'],
    popularity: 95,
    color: { from: 'from-green-700', to: 'to-green-800' }
  },
  {
    id: 'dublin-pharma',
    name: 'Dublin Pharma Professional',
    description: 'Perfect for Ireland\'s pharmaceutical and medical device industry',
    category: 'technical',
    features: ['Pharma Format', 'GMP Ready', 'Technical Skills', 'Research Focus'],
    popularity: 92,
    color: { from: 'from-teal-600', to: 'to-teal-700' }
  }
]

interface StaticTemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void
}

export function StaticTemplateGallery({ onSelectTemplate }: StaticTemplateGalleryProps) {
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Only hide on mobile devices (width < 768px)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down & passed 100px
          setHeaderVisible(false)
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setHeaderVisible(true)
        }
      } else {
        // Always show on desktop
        setHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm transition-transform duration-300 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-6">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="group">
              <Button 
                variant="outline" 
                size="default" 
                className="gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Home</span>
              </Button>
            </Link>
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">CV</span>
              </div>
              <div className="hidden sm:block">
                <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CV Genius
                </h2>
                <p className="text-xs text-gray-500">Irish CV Builder</p>
              </div>
            </Link>
            
            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs">4 Templates Available</span>
              </Badge>
            </div>
          </div>
          
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Choose Your Perfect CV Template
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Professionally designed templates optimized for the Irish job market. 
              All templates are ATS-friendly and recruiter-approved.
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templates.map((template, index) => (
            <Card 
              key={template.id} 
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-500",
                "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
                "bg-white border-gray-200",
                template.isRecommended && "ring-2 ring-green-500 ring-offset-4 shadow-lg"
              )}
              onClick={() => onSelectTemplate(template.id)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Card Content */}
              <div className="relative">
                {/* Template Preview */}
                <div className="aspect-[210/297] bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative overflow-hidden">
                  {/* Preview Shadow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  
                  {/* Template Mock */}
                  <div className={cn(
                    "h-full bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300",
                    "group-hover:scale-[1.02]"
                  )}>
                    {/* Template Header */}
                    <div className={`h-20 relative overflow-hidden bg-gradient-to-r ${template.color.from} ${template.color.to}`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      <div className="relative p-4 space-y-2">
                        <div className="h-3 bg-white/80 rounded w-2/3"></div>
                        <div className="h-2 bg-white/60 rounded w-1/2"></div>
                      </div>
                    </div>
                    
                    {/* Template Body */}
                    <div className="p-4 space-y-4">
                      {/* Section 1 */}
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded w-11/12"></div>
                          <div className="h-1 bg-gray-200 rounded w-10/12"></div>
                        </div>
                      </div>
                      
                      {/* Section 2 */}
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                {template.isRecommended && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-lg px-3 py-1.5">
                      <Award className="w-3 h-3 mr-1" />
                      RECOMMENDED
                    </Badge>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold">{template.popularity}%</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                <h3 className="font-bold text-xl mb-2 flex items-center">
                  {template.name}
                  {template.isRecommended && (
                    <Sparkles className="w-4 h-4 ml-2 text-green-600" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium",
                        feature.startsWith('✓') && "bg-green-50 text-green-700 border-green-200"
                      )}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  className={cn(
                    "w-full group transition-all duration-300",
                    template.isRecommended 
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" 
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  )}
                  size="lg"
                >
                  <span className="font-semibold">Use This Template</span>
                  <Check className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
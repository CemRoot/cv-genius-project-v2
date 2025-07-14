'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { cvTemplates, CvTemplate } from '@/lib/cv-templates/templates-data'
import { TemplatePreview } from './template-preview'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Briefcase,
  GraduationCap,
  Palette,
  Award,
  X,
  ChevronRight,
  Star,
  Users,
  FileText,
  Zap
} from 'lucide-react'
import { TemplateColorPicker } from './template-color-picker'

interface ModernTemplateGalleryProps {
  onSelectTemplate: (template: CvTemplate) => void
}

const categoryIcons = {
  irish: Globe,
  european: Globe,
  tech: Zap,
  creative: Palette,
  academic: GraduationCap,
  executive: Briefcase,
  modern: TrendingUp,
  simple: FileText,
  professional: Users,
  ats: CheckCircle
}

const categoryColors = {
  irish: 'bg-emerald-500',
  european: 'bg-blue-500',
  tech: 'bg-purple-500',
  creative: 'bg-pink-500',
  academic: 'bg-indigo-500',
  executive: 'bg-gray-800',
  modern: 'bg-cyan-500',
  simple: 'bg-slate-500',
  professional: 'bg-blue-600',
  ats: 'bg-green-600'
}

export function ModernTemplateGallery({ onSelectTemplate }: ModernTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<CvTemplate | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [atsOnly, setAtsOnly] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<Record<string, { primary: string, secondary: string }>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory === 'all' 
      ? cvTemplates 
      : cvTemplates.filter(t => t.category === selectedCategory)
    
    if (atsOnly) {
      templates = templates.filter(t =>
        t.tags.some(tag =>
          /ats-friendly|ats-compatible/i.test(tag)
        )
      )
    }
    if (searchQuery) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return templates
  }, [selectedCategory, searchQuery, atsOnly])

  const categories = [
    { id: 'all', label: 'All Templates', count: cvTemplates.length },
    { id: 'ats', label: 'ATS Optimized', count: cvTemplates.filter(t => t.category === 'ats').length },
    { id: 'modern', label: 'Modern', count: cvTemplates.filter(t => t.category === 'modern').length },
    { id: 'creative', label: 'Creative', count: cvTemplates.filter(t => t.category === 'creative').length },
    { id: 'simple', label: 'Simple & Classic', count: cvTemplates.filter(t => t.category === 'simple').length },
    { id: 'professional', label: 'Professional', count: cvTemplates.filter(t => t.category === 'professional').length },
    { id: 'irish', label: 'Irish Market', count: cvTemplates.filter(t => t.category === 'irish').length },
    { id: 'european', label: 'European', count: cvTemplates.filter(t => t.category === 'european').length },
    { id: 'tech', label: 'Technology', count: cvTemplates.filter(t => t.category === 'tech').length },
    { id: 'academic', label: 'Academic', count: cvTemplates.filter(t => t.category === 'academic').length },
    { id: 'executive', label: 'Executive', count: cvTemplates.filter(t => t.category === 'executive').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <div className="relative container mx-auto px-4 py-12 lg:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional CV Templates
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Choose from our collection of ATS-optimized templates designed for Irish and European job markets
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates by name, category, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg rounded-xl shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* ATS Friendly Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <label htmlFor="ats-toggle" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="ats-toggle"
                  type="checkbox"
                  checked={atsOnly}
                  onChange={() => setAtsOnly(!atsOnly)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show ATS‑Friendly Only</span>
              </label>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-gray-700"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>ATS Optimized</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-gray-700"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Professional Designs</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-gray-700"
              >
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span>Industry Specific</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            <Badge variant="secondary">{selectedCategory === 'all' ? 'All' : selectedCategory}</Badge>
          </Button>
        </div>

        {/* Category Filters - Desktop */}
        <div className="hidden lg:flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => {
            const Icon = category.id !== 'all' ? categoryIcons[category.id as keyof typeof categoryIcons] : FileText
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all
                  ${selectedCategory === category.id 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                <Badge 
                  variant={selectedCategory === category.id ? "secondary" : "outline"}
                  className={selectedCategory === category.id ? "bg-white/20 text-white border-white/30" : ""}
                >
                  {category.count}
                </Badge>
              </motion.button>
            )
          })}
        </div>

        {/* Mobile Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowFilters(false)
                    }}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all
                      ${selectedCategory === category.id 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span>{category.label}</span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${selectedCategory === category.id ? 'bg-white/20' : ''}`}
                    >
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredTemplates.length}</span> templates
            {atsOnly && <span> (ATS‑friendly)</span>}
            {searchQuery && <span> for "{searchQuery}"</span>}
          </p>
        </div>

        {/* Template Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => {
              const Icon = categoryIcons[template.category]
              const colorClass = categoryColors[template.category]
              
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group"
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <Card className="h-full overflow-hidden border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300">
                    {/* Template Preview */}
                    <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <TemplatePreview 
                        template={{
                          ...template,
                          styling: {
                            ...template.styling,
                            primaryColor: selectedColors[template.id]?.primary || template.styling.primaryColor,
                            secondaryColor: selectedColors[template.id]?.secondary || template.styling.secondaryColor
                          }
                        }} 
                        className="w-full h-full" 
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 space-y-3">
                          {/* Color Picker */}
                          {template.styling.colorVariants && template.styling.colorVariants.length > 0 && (
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                              <TemplateColorPicker
                                template={template}
                                selectedColor={selectedColors[template.id]?.primary}
                                onColorSelect={(primary, secondary) => {
                                  setSelectedColors(prev => ({
                                    ...prev,
                                    [template.id]: { primary, secondary }
                                  }))
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPreviewTemplate(template)}
                              className="flex-1 backdrop-blur-sm bg-white/90 hover:bg-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const templateToSelect = selectedColors[template.id] 
                                  ? {
                                      ...template,
                                      styling: {
                                        ...template.styling,
                                        primaryColor: selectedColors[template.id].primary,
                                        secondaryColor: selectedColors[template.id].secondary
                                      }
                                    }
                                  : template
                                onSelectTemplate(templateToSelect)
                              }}
                              className="flex-1 backdrop-blur-sm bg-blue-600 hover:bg-blue-700 text-white border-0"
                            >
                              Use Template
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <div className={`absolute top-3 right-3 ${colorClass} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{template.category}</span>
                      </div>
                      
                      {/* Popular Badge */}
                      {index < 3 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Popular
                        </div>
                      )}
                    </div>
                    
                    {/* Template Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{mounted ? Math.floor(500 + (index * 137) % 500) : '...'} uses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                          <span>{mounted ? (4.5 + (index * 0.07) % 0.5).toFixed(1) : '...'}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Need More Customization?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Try our interactive CV Builder with step-by-step guidance, real-time ATS optimization, 
              and advanced customization options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                onClick={() => window.location.href = '/cv-builder'}
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Interactive Builder
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white"
              >
                Compare Features
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h2>
                  <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <TemplatePreview template={previewTemplate} className="scale-100" />
                  </div>
                </div>
                
                {/* Template Details */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>ATS-optimized formatting</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Professional {previewTemplate.styling.fontFamily} typography</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{previewTemplate.styling.layout.replace('-', ' ')} layout</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                  className="sm:flex-1"
                >
                  Back to Gallery
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    onSelectTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                  className="sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Use This Template
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
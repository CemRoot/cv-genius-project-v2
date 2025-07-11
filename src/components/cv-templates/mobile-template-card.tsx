'use client'

import React from 'react'
import { CvTemplate } from '@/lib/cv-templates/templates-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Eye, ChevronRight, Star, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface MobileTemplateCardProps {
  template: CvTemplate
  index: number
  onSelect: (template: CvTemplate) => void
  onPreview: (template: CvTemplate) => void
  categoryIcon: React.ComponentType<{ className?: string }>
  categoryColor: string
}

export function MobileTemplateCard({
  template,
  index,
  onSelect,
  onPreview,
  categoryIcon: Icon,
  categoryColor
}: MobileTemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
        {/* Compact Preview */}
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <div className="absolute inset-0 scale-[0.25] origin-top-left">
            {/* Template preview would go here */}
            <div className="bg-white p-8">
              <div className="h-8 bg-gray-300 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-200 rounded mb-1 w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          </div>
          
          {/* Category Badge */}
          <div className={`absolute top-2 right-2 ${categoryColor} text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize">{template.category}</span>
          </div>
          
          {/* Popular Badge */}
          {index < 3 && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </div>
          )}
        </div>
        
        {/* Template Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {template.name}
          </h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{Math.floor(Math.random() * 1000 + 500)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              <span>{(Math.random() * 0.5 + 4.5).toFixed(1)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(template)}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => onSelect(template)}
              className="text-xs"
            >
              Use
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
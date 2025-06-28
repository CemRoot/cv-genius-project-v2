'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Globe } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import { ResponsiveInput, ResponsiveSelect } from '@/components/responsive/responsive-form'
import { ResponsiveText, ResponsiveHeading } from '@/components/responsive/responsive-text'
import { motion, AnimatePresence } from 'framer-motion'

const proficiencyLevels = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Conversational', label: 'Conversational' },
  { value: 'Basic', label: 'Basic' }
]

export function LanguagesForm() {
  const { currentCV, addLanguage, updateLanguage, removeLanguage } = useCVStore()
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Conversational' as const })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddLanguage = () => {
    if (newLanguage.name.trim()) {
      addLanguage(newLanguage)
      setNewLanguage({ name: '', level: 'Conversational' })
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <ResponsiveHeading level={3}>Languages</ResponsiveHeading>
          <ResponsiveText size="sm" className="text-gray-600 mt-1">
            Add languages you speak and your proficiency level
          </ResponsiveText>
        </div>
        <Globe className="w-6 h-6 text-gray-400" />
      </div>

      {/* Languages list */}
      <AnimatePresence>
        {currentCV?.languages.map((lang, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid gap-4 sm:grid-cols-2">
                  <ResponsiveInput
                    label="Language"
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                    placeholder="e.g., English, Spanish"
                  />
                  
                  <ResponsiveSelect
                    label="Proficiency"
                    value={lang.level}
                    onChange={(e) => updateLanguage(lang.id, { level: e.target.value as any })}
                    options={proficiencyLevels}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLanguage(lang.id)}
                  className="ml-4"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add new language */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 border-dashed border-2 border-blue-200 bg-blue-50/50">
              <div className="grid gap-4 sm:grid-cols-2">
                <ResponsiveInput
                  label="Language"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  placeholder="e.g., French"
                  autoFocus
                />
                
                <ResponsiveSelect
                  label="Proficiency"
                  value={newLanguage.level}
                  onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value as any })}
                  options={proficiencyLevels}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewLanguage({ name: '', level: 'Conversational' })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddLanguage}
                  disabled={!newLanguage.name.trim()}
                >
                  Add Language
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        )}
      </AnimatePresence>

      {/* Tips */}
      {currentCV?.languages.length === 0 && !isAdding && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <p className="text-sm text-gray-600">
            💡 Tip: Including languages can make you stand out, especially for international roles.
            List all languages you're comfortable using in a professional setting.
          </p>
        </Card>
      )}
    </div>
  )
}
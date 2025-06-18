'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCVStore } from "@/store/cv-store"
import { useState } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, Globe, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Language interface
export interface Language {
  id: string
  name: string
  level: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic'
  certification?: string
}

const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  level: z.enum(['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'], {
    required_error: "Please select a proficiency level"
  }),
  certification: z.string().optional()
})

type LanguageFormData = z.infer<typeof languageSchema>

const languageLevels = [
  { value: 'Native', label: 'Native', description: 'Mother tongue', color: 'bg-purple-600' },
  { value: 'Fluent', label: 'Fluent', description: 'Near-native proficiency', color: 'bg-blue-600' },
  { value: 'Professional', label: 'Professional', description: 'Business proficiency', color: 'bg-green-600' },
  { value: 'Conversational', label: 'Conversational', description: 'Can hold conversations', color: 'bg-yellow-600' },
  { value: 'Basic', label: 'Basic', description: 'Elementary understanding', color: 'bg-gray-600' }
] as const

const commonLanguages = [
  'English', 'Irish (Gaeilge)', 'French', 'German', 'Spanish', 'Italian', 'Portuguese',
  'Dutch', 'Polish', 'Hungarian', 'Czech', 'Mandarin', 'Japanese', 'Korean', 'Arabic',
  'Russian', 'Turkish', 'Hindi', 'Thai', 'Vietnamese'
]

export function LanguagesForm() {
  const { currentCV, updateLanguages } = useCVStore()
  const [languages, setLanguages] = useState<Language[]>(currentCV?.languages || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: "",
      level: "Professional",
      certification: ""
    }
  })

  const watchLevel = watch("level")

  const onSubmit = (data: LanguageFormData) => {
    if (editingId) {
      const updatedLanguages = languages.map(lang =>
        lang.id === editingId ? { ...lang, ...data } : lang
      )
      setLanguages(updatedLanguages)
      updateLanguages(updatedLanguages)
      setEditingId(null)
    } else {
      const newLanguage: Language = {
        id: crypto.randomUUID(),
        ...data
      }
      const updatedLanguages = [...languages, newLanguage]
      setLanguages(updatedLanguages)
      updateLanguages(updatedLanguages)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (language: Language) => {
    setEditingId(language.id)
    setValue("name", language.name)
    setValue("level", language.level)
    setValue("certification", language.certification || "")
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this language?")) {
      const updatedLanguages = languages.filter(lang => lang.id !== id)
      setLanguages(updatedLanguages)
      updateLanguages(updatedLanguages)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-cvgenius-primary" />
          Languages
        </h2>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Language
          </Button>
        )}
      </div>

      {/* Languages List */}
      <AnimatePresence>
        {languages.map((language) => (
          <motion.div
            key={language.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            {editingId === language.id ? (
              /* Inline Edit Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input
                      {...register("name")}
                      placeholder="e.g., Spanish"
                      className={errors.name ? "border-red-500" : ""}
                      list="languages-list"
                    />
                    <datalist id="languages-list">
                      {commonLanguages.map(lang => (
                        <option key={lang} value={lang} />
                      ))}
                    </datalist>
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {languageLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setValue("level", level.value)}
                          className={`text-xs p-2 rounded-lg font-medium transition-colors text-left ${
                            watchLevel === level.value
                              ? `${level.color} text-white`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-semibold">{level.label}</div>
                          <div className="text-xs opacity-80">{level.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Certification (Optional)</Label>
                    <Input
                      {...register("certification")}
                      placeholder="e.g., IELTS 8.0, DELE B2"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button type="submit" size="sm">
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{language.name}</h4>
                    {language.certification && (
                      <p className="text-sm text-gray-600">{language.certification}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium text-white ${
                      languageLevels.find(l => l.value === language.level)?.color
                    }`}>
                      {language.level}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(language)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(language.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {languages.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No languages added yet</h3>
          <p className="text-gray-500 mb-4">Add languages to showcase your multilingual abilities</p>
        </div>
      )}

      {/* Add New Language Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-4 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-cvgenius-primary" />
            Add New Language
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="languageName">
                  Language <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="languageName"
                  {...register("name")}
                  placeholder="e.g., Spanish, French, Mandarin"
                  className={errors.name ? "border-red-500" : ""}
                  list="languages-list"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Proficiency Level <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {languageLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setValue("level", level.value)}
                      className={`text-sm p-3 rounded-lg font-medium transition-colors text-left ${
                        watchLevel === level.value
                          ? `${level.color} text-white`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-xs opacity-80">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification">
                  Certification (Optional)
                </Label>
                <Input
                  id="certification"
                  {...register("certification")}
                  placeholder="e.g., IELTS 8.0, DELE B2, JLPT N2"
                />
                <div className="text-xs text-gray-500">
                  Include test scores or certifications if you have them
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Language
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Language Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Language Tips:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Be honest about your proficiency level - employers may test you</li>
          <li>• Include certifications (IELTS, TOEFL, DELE, etc.) if you have them</li>
          <li>• Native speakers should list their mother tongue first</li>
          <li>• Professional level means you can work effectively in that language</li>
        </ul>
      </div>
    </div>
  )
}
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCVStore } from "@/store/cv-store"
import { useState } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, GripVertical, Star, StarOff, Code, Briefcase, Globe, Users, Wrench } from "lucide-react"
import { Skill } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    required_error: "Please select a skill level"
  }),
  category: z.enum(['Technical', 'Software', 'Soft', 'Other'], {
    required_error: "Please select a category"
  })
})

type SkillFormData = z.infer<typeof skillSchema>

const skillCategories = [
  { value: 'Technical', label: 'Technical Skills', icon: Code, color: 'bg-blue-100 text-blue-800' },
  { value: 'Software', label: 'Software & Tools', icon: Wrench, color: 'bg-green-100 text-green-800' },
  { value: 'Soft', label: 'Soft Skills', icon: Users, color: 'bg-orange-100 text-orange-800' },
  { value: 'Other', label: 'Other Skills', icon: Briefcase, color: 'bg-gray-100 text-gray-800' }
] as const

const skillLevels = [
  { value: 'Beginner', label: 'Beginner', stars: 1 },
  { value: 'Intermediate', label: 'Intermediate', stars: 2 },
  { value: 'Advanced', label: 'Advanced', stars: 3 },
  { value: 'Expert', label: 'Expert', stars: 4 }
] as const

export function SkillsForm() {
  const { currentCV, addSkill, updateSkill, removeSkill } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('Technical')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      level: "Intermediate",
      category: "Technical"
    }
  })

  const watchCategory = watch("category")
  const watchLevel = watch("level")

  const onSubmit = (data: SkillFormData) => {
    if (editingId) {
      updateSkill(editingId, data)
      setEditingId(null)
    } else {
      addSkill(data)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setValue("name", skill.name)
    setValue("level", skill.level)
    setValue("category", skill.category)
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      removeSkill(id)
    }
  }

  const renderStars = (level: string, interactive = false, onStarClick?: (stars: number) => void) => {
    const skillLevel = skillLevels.find(l => l.value === level)
    const stars = skillLevel?.stars || 0
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 4 }, (_, i) => {
          const filled = i < stars
          const StarIcon = filled ? Star : StarOff
          return (
            <button
              key={i}
              type="button"
              onClick={() => interactive && onStarClick?.(i + 1)}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
              disabled={!interactive}
            >
              <StarIcon 
                className={`h-4 w-4 ${filled ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
              />
            </button>
          )
        })}
      </div>
    )
  }

  const handleStarClick = (stars: number) => {
    const level = skillLevels.find(l => l.stars === stars)?.value || 'Intermediate'
    setValue("level", level)
  }

  // Group skills by category
  const skillsByCategory = skillCategories.map(category => ({
    ...category,
    skills: currentCV.skills.filter(skill => skill.category === category.value)
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Skills by Category */}
      <div className="space-y-6">
        {skillsByCategory.map((category) => (
          <div key={category.value} className="space-y-3">
            {category.skills.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-cvgenius-primary" />
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.skills.length} {category.skills.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {category.skills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                      >
                        {editingId === skill.id ? (
                          /* Inline Edit Form */
                          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                            <div className="space-y-2">
                              <Input
                                {...register("name")}
                                placeholder="Skill name"
                                className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                              />
                              {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Level</Label>
                              <div className="flex gap-2">
                                {skillLevels.map((level) => (
                                  <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setValue("level", level.value)}
                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                      watchLevel === level.value
                                        ? level.value === 'Expert' ? 'bg-purple-600 text-white' :
                                          level.value === 'Advanced' ? 'bg-blue-600 text-white' :
                                          level.value === 'Intermediate' ? 'bg-green-600 text-white' :
                                          'bg-gray-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {level.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Category</Label>
                              <select
                                {...register("category")}
                                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                {skillCategories.map((cat) => (
                                  <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>
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
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">{skill.name}</h4>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(skill)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(skill.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                skill.level === 'Expert' ? 'bg-purple-100 text-purple-800' :
                                skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                                skill.level === 'Intermediate' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {skill.level}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* No Skills Message */}
      {currentCV.skills.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No skills added yet</h3>
          <p className="text-gray-500 mb-4">Add your first skill to get started</p>
        </div>
      )}

      {/* Add New Skill Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-4 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-cvgenius-primary" />
            Add New Skill
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillName">
                  Skill Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="skillName"
                  {...register("name")}
                  placeholder="e.g., JavaScript, Leadership, Spanish"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillCategory">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="skillCategory"
                  {...register("category")}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cvgenius-primary focus:border-transparent ${errors.category ? "border-red-500" : ""}`}
                >
                  {skillCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Skill Level <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setValue("level", level.value)}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        watchLevel === level.value
                          ? level.value === 'Expert' ? 'bg-purple-600 text-white' :
                            level.value === 'Advanced' ? 'bg-blue-600 text-white' :
                            level.value === 'Intermediate' ? 'bg-green-600 text-white' :
                            'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Skill
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Skill Button */}
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      )}

      {/* Quick Add Suggestions */}
      {!isAdding && currentCV.skills.length < 5 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Quick Add Popular Skills</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'JavaScript', category: 'Technical' },
              { name: 'Leadership', category: 'Soft' },
              { name: 'Microsoft Office', category: 'Software' },
              { name: 'Spanish', category: 'Language' },
              { name: 'Project Management', category: 'Soft' },
              { name: 'Python', category: 'Technical' },
              { name: 'Communication', category: 'Soft' },
              { name: 'French', category: 'Language' }
            ].filter(suggestion => 
              !currentCV.skills.some(skill => 
                skill.name.toLowerCase() === suggestion.name.toLowerCase()
              )
            ).slice(0, 6).map((suggestion) => (
              <Button
                key={suggestion.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Convert Language category to Other since we now have a separate Languages section
                  const category = suggestion.category === 'Language' ? 'Other' : suggestion.category
                  addSkill({
                    name: suggestion.name,
                    category: category as 'Technical' | 'Software' | 'Soft' | 'Other',
                    level: 'Intermediate'
                  })
                }}
                className="text-xs"
              >
                + {suggestion.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for Skills</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Focus on relevant skills for your target role</li>
          <li>• Include both technical and soft skills</li>
          <li>• Be honest about your skill levels</li>
          <li>• Mention language proficiency (especially Irish if applicable)</li>
          <li>• Include software and tools specific to your industry</li>
          <li>• Keep skills list concise - aim for 8-12 key skills</li>
        </ul>
      </div>
    </div>
  )
}
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCVStore } from "@/store/cv-store"
import { useState } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, Heart, Trophy, Camera, Music, Plane, Users, Gamepad2 } from "lucide-react"
import { Interest } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"

const interestSchema = z.object({
  name: z.string().min(1, "Interest name is required"),
  category: z.enum(['Sports', 'Arts', 'Technology', 'Volunteering', 'Travel', 'Other'], {
    required_error: "Please select a category"
  }),
  description: z.string().optional()
})

type InterestFormData = z.infer<typeof interestSchema>

const interestCategories = [
  { value: 'Sports', label: 'Sports & Fitness', icon: Trophy, color: 'bg-green-100 text-green-800' },
  { value: 'Arts', label: 'Arts & Culture', icon: Camera, color: 'bg-purple-100 text-purple-800' },
  { value: 'Technology', label: 'Technology', icon: Gamepad2, color: 'bg-blue-100 text-blue-800' },
  { value: 'Volunteering', label: 'Volunteering', icon: Users, color: 'bg-orange-100 text-orange-800' },
  { value: 'Travel', label: 'Travel', icon: Plane, color: 'bg-teal-100 text-teal-800' },
  { value: 'Other', label: 'Other', icon: Heart, color: 'bg-gray-100 text-gray-800' }
] as const

export function InterestsForm() {
  const { currentCV, addInterest, updateInterest, removeInterest } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<InterestFormData>({
    resolver: zodResolver(interestSchema),
    defaultValues: {
      name: "",
      category: "Other",
      description: ""
    }
  })

  const watchCategory = watch("category")

  const onSubmit = (data: InterestFormData) => {
    if (editingId) {
      updateInterest(editingId, data)
      setEditingId(null)
    } else {
      addInterest(data)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (interest: Interest) => {
    setEditingId(interest.id)
    setValue("name", interest.name)
    setValue("category", interest.category || "Other")
    setValue("description", interest.description || "")
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this interest?")) {
      removeInterest(id)
    }
  }

  // Group interests by category
  const interestsByCategory = interestCategories.map(category => ({
    ...category,
    interests: (currentCV.interests || []).filter(interest => interest.category === category.value)
  }))

  const totalInterests = currentCV.interests?.length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Interests by Category */}
      {totalInterests > 0 && (
        <div className="space-y-6">
          {interestsByCategory.map((category) => (
            <div key={category.value} className="space-y-3">
              {category.interests.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-cvgenius-primary" />
                    <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.interests.length} {category.interests.length === 1 ? 'interest' : 'interests'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {category.interests.map((interest) => (
                        <motion.div
                          key={interest.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                        >
                          {editingId === interest.id ? (
                            /* Inline Edit Form */
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                              <div className="space-y-2">
                                <Input
                                  {...register("name")}
                                  placeholder="Interest name"
                                  className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                                />
                                {errors.name && (
                                  <p className="text-xs text-red-500">{errors.name.message}</p>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <select
                                  {...register("category")}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  {interestCategories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Textarea
                                  {...register("description")}
                                  placeholder="Brief description (optional)"
                                  className="text-xs"
                                  rows={2}
                                />
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
                                <h4 className="font-medium text-gray-900 text-sm">{interest.name}</h4>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(interest)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(interest.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              {interest.description && (
                                <p className="text-xs text-gray-600">{interest.description}</p>
                              )}
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
      )}

      {/* No Interests Message */}
      {totalInterests === 0 && !isAdding && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No interests added yet</h3>
          <p className="text-gray-500 mb-4">Add your hobbies and interests to show your personality</p>
        </div>
      )}

      {/* Add New Interest Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-4 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-cvgenius-primary" />
            Add New Interest
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestName">
                  Interest/Hobby <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interestName"
                  {...register("name")}
                  placeholder="e.g., Photography, Football, Reading"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestCategory">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="interestCategory"
                  {...register("category")}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cvgenius-primary focus:border-transparent ${errors.category ? "border-red-500" : ""}`}
                >
                  {interestCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestDescription">Description (optional)</Label>
              <Textarea
                id="interestDescription"
                {...register("description")}
                placeholder="Brief description of your involvement or achievements..."
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Optional: Add details like achievements, level of involvement, or years of experience
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Interest
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Interest Button */}
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Interest
        </Button>
      )}

      {/* Quick Add Popular Interests */}
      {!isAdding && totalInterests < 5 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Quick Add Popular Interests</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Photography', category: 'Arts' },
              { name: 'Football', category: 'Sports' },
              { name: 'Reading', category: 'Other' },
              { name: 'Coding', category: 'Technology' },
              { name: 'Travelling', category: 'Travel' },
              { name: 'Music', category: 'Arts' },
              { name: 'Volunteering', category: 'Volunteering' },
              { name: 'Running', category: 'Sports' },
              { name: 'Cooking', category: 'Other' },
              { name: 'Hiking', category: 'Sports' }
            ].filter(suggestion => 
              !(currentCV.interests || []).some(interest => 
                interest.name.toLowerCase() === suggestion.name.toLowerCase()
              )
            ).slice(0, 8).map((suggestion) => (
              <Button
                key={suggestion.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  addInterest({
                    name: suggestion.name,
                    category: suggestion.category as 'Sports' | 'Arts' | 'Technology' | 'Volunteering' | 'Travel' | 'Other'
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
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for Interests</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Keep interests relevant and professional</li>
          <li>• Include 3-5 interests maximum to avoid clutter</li>
          <li>• Mention achievements or leadership roles in hobbies</li>
          <li>• Show transferable skills (e.g., teamwork from sports)</li>
          <li>• Consider what interests might help with networking</li>
          <li>• Avoid controversial topics or overly personal details</li>
        </ul>
      </div>
    </div>
  )
}
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCVStore } from "@/store/cv-store"
import { useState } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, GripVertical, ChevronDown, ChevronUp, GraduationCap } from "lucide-react"
import { Education } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"

const educationSchema = z.object({
  institution: z.string().min(2, "Institution name is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().min(2, "Field of study is required"),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  grade: z.string().optional(),
  description: z.string().optional()
})

type EducationFormData = z.infer<typeof educationSchema>

export function EducationForm() {
  const { currentCV, addEducation, updateEducation, removeEducation } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      field: "",
      location: "Dublin, Ireland",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      description: ""
    }
  })

  const watchCurrent = watch("current")

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString || dateString === "Present") return dateString
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === "Present") return ""
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString
      }
      // Try to parse various formats
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch {
      return dateString
    }
  }

  const onSubmit = (data: EducationFormData) => {
    const educationData = {
      ...data,
      endDate: data.current ? "Present" : data.endDate || ""
    }

    if (editingId) {
      updateEducation(editingId, educationData)
      setEditingId(null)
    } else {
      addEducation(educationData)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (education: Education) => {
    setEditingId(education.id)
    setExpandedId(education.id)
    setValue("institution", education.institution)
    setValue("degree", education.degree)
    setValue("field", education.field)
    setValue("location", education.location)
    setValue("startDate", formatDateForInput(education.startDate))
    setValue("endDate", education.current ? "" : formatDateForInput(education.endDate))
    setValue("current", education.current)
    setValue("grade", education.grade || "")
    setValue("description", education.description || "")
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this education entry?")) {
      removeEducation(id)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Existing Education */}
      <AnimatePresence>
        {currentCV.education.length > 0 && (
          <div className="space-y-4">
            {currentCV.education.map((education) => (
              <motion.div
                key={education.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Education Header */}
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        className="cursor-move text-gray-400 hover:text-gray-600"
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-5 w-5" />
                      </button>
                      <GraduationCap className="h-5 w-5 text-cvgenius-primary" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{education.degree}</h4>
                        <p className="text-sm text-gray-600">
                          {education.institution} • {education.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {education.field} • {formatDateForDisplay(education.startDate)} - {education.current ? "Present" : formatDateForDisplay(education.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(education.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedId === education.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      {editingId !== education.id && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(education)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(education.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {(expandedId === education.id || editingId === education.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200"
                    >
                      {editingId === education.id ? (
                        /* Edit Form */
                        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`degree-${education.id}`}>
                                Degree <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`degree-${education.id}`}
                                {...register("degree")}
                                placeholder="Bachelor of Science"
                                className={errors.degree ? "border-red-500" : ""}
                              />
                              {errors.degree && (
                                <p className="text-sm text-red-500">{errors.degree.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`field-${education.id}`}>
                                Field of Study <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`field-${education.id}`}
                                {...register("field")}
                                placeholder="Computer Science"
                                className={errors.field ? "border-red-500" : ""}
                              />
                              {errors.field && (
                                <p className="text-sm text-red-500">{errors.field.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`institution-${education.id}`}>
                                Institution <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`institution-${education.id}`}
                                {...register("institution")}
                                placeholder="Trinity College Dublin"
                                className={errors.institution ? "border-red-500" : ""}
                              />
                              {errors.institution && (
                                <p className="text-sm text-red-500">{errors.institution.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`location-${education.id}`}>
                                Location <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`location-${education.id}`}
                                {...register("location")}
                                placeholder="Dublin, Ireland"
                                className={errors.location ? "border-red-500" : ""}
                              />
                              {errors.location && (
                                <p className="text-sm text-red-500">{errors.location.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`startDate-${education.id}`}>
                                Start Date <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`startDate-${education.id}`}
                                type="date"
                                {...register("startDate")}
                                className={errors.startDate ? "border-red-500" : ""}
                              />
                              {errors.startDate && (
                                <p className="text-sm text-red-500">{errors.startDate.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`endDate-${education.id}`}>
                                End Date
                              </Label>
                              <Input
                                id={`endDate-${education.id}`}
                                type="date"
                                {...register("endDate")}
                                disabled={watchCurrent}
                                className={errors.endDate ? "border-red-500" : ""}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`grade-${education.id}`}>
                                Grade/GPA
                              </Label>
                              <Input
                                id={`grade-${education.id}`}
                                {...register("grade")}
                                placeholder="First Class Honours"
                                className={errors.grade ? "border-red-500" : ""}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`current-${education.id}`}
                                {...register("current")}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`current-${education.id}`} className="font-normal">
                                Currently studying here
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`description-${education.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`description-${education.id}`}
                              {...register("description")}
                              placeholder="Relevant coursework, thesis topic, achievements..."
                              rows={3}
                              className="resize-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button type="submit">
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      ) : (
                        /* View Mode */
                        <div className="p-4 space-y-4">
                          {education.grade && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Grade:</span> {education.grade}
                            </p>
                          )}
                          {education.description && (
                            <p className="text-gray-700">{education.description}</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Add New Education Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-4 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cvgenius-primary" />
            Add New Education
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="degree"
                  {...register("degree")}
                  placeholder="Bachelor of Science"
                  className={errors.degree ? "border-red-500" : ""}
                />
                {errors.degree && (
                  <p className="text-sm text-red-500">{errors.degree.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">
                  Field of Study <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="field"
                  {...register("field")}
                  placeholder="Computer Science"
                  className={errors.field ? "border-red-500" : ""}
                />
                {errors.field && (
                  <p className="text-sm text-red-500">{errors.field.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">
                  Institution <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="institution"
                  {...register("institution")}
                  placeholder="Trinity College Dublin"
                  className={errors.institution ? "border-red-500" : ""}
                />
                {errors.institution && (
                  <p className="text-sm text-red-500">{errors.institution.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Dublin, Ireland"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Date will be displayed as DD/MM/YYYY
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={watchCurrent}
                  className={errors.endDate ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">
                  Grade/GPA
                </Label>
                <Input
                  id="grade"
                  {...register("grade")}
                  placeholder="First Class Honours"
                  className={errors.grade ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: First Class, 2:1, 2:2, Third Class, or GPA
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="current"
                  {...register("current")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="current" className="font-normal">
                  Currently studying here
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Relevant coursework, thesis topic, achievements, modules..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Education
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Education Button */}
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      )}

      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for Education</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• List in reverse chronological order (most recent first)</li>
          <li>• Include institution location (city/county)</li>
          <li>• Use Irish grading system: First Class, 2:1, 2:2, Third Class</li>
          <li>• Mention relevant coursework or thesis topics</li>
          <li>• Include professional qualifications and certifications</li>
          <li>• Don't include secondary school unless recent graduate</li>
        </ul>
      </div>
    </div>
  )
}
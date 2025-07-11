"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileInput } from "@/components/ui/mobile-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MonthYearPicker } from "@/components/ui/month-year-picker"
import { useCVStore } from "@/store/cv-store"
import { useState, useEffect } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, GripVertical, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Experience } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const experienceSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  position: z.string().min(2, "Position is required"),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}$/, "Please select a valid month and year"),
  endDate: z.string().optional().refine((val) => !val || /^\d{4}-\d{2}$/.test(val), "Please select a valid month and year"),
  current: z.boolean(),
  description: z.string().min(10, "Description should be at least 10 characters"),
  achievements: z.string().optional()
})

type ExperienceFormData = z.infer<typeof experienceSchema>

// Sortable Experience Item Component
function SortableExperienceItem({ 
  experience, 
  editingId, 
  expandedId, 
  onEdit, 
  onRemove, 
  onToggleExpanded,
  onSubmit,
  onCancel,
  register,
  handleSubmit,
  errors,
  watch,
  setValue,
  fields,
  append,
  removeField,
  formatDateForDisplay,
  improveWithAI,
  isImproving
}: {
  experience: Experience
  editingId: string | null
  expandedId: string | null
  onEdit: (experience: Experience) => void
  onRemove: (id: string) => void
  onToggleExpanded: (id: string) => void
  onSubmit: (data: ExperienceFormData) => void
  onCancel: () => void
  register: ReturnType<typeof useForm<ExperienceFormData>>['register']
  handleSubmit: ReturnType<typeof useForm<ExperienceFormData>>['handleSubmit']
  errors: ReturnType<typeof useForm<ExperienceFormData>>['formState']['errors']
  watch: ReturnType<typeof useForm<ExperienceFormData>>['watch']
  setValue: ReturnType<typeof useForm<ExperienceFormData>>['setValue']
  fields: never[]
  append: () => void
  removeField: () => void
  formatDateForDisplay: (date: string) => string
  improveWithAI: (text: string, fieldType: 'description' | 'achievements', experienceId?: string) => Promise<string>
  isImproving: { [key: string]: boolean }
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const watchCurrent = watch("current")

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border border-gray-200 rounded-lg overflow-hidden ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      {/* Experience Header */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              className="cursor-move text-gray-400 hover:text-gray-600 touch-none"
              title="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{experience.position}</h4>
              <p className="text-sm text-gray-600">
                {experience.company}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateForDisplay(experience.startDate)} - {experience.current ? "Present" : formatDateForDisplay(experience.endDate)}
              </p>
              <p className="text-xs text-gray-500">
                {experience.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleExpanded(experience.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedId === experience.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {editingId !== experience.id && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(experience)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(experience.id)}
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
        {(expandedId === experience.id || editingId === experience.id) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            {editingId === experience.id ? (
              /* Edit Form */
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`position-${experience.id}`}>
                      Position <span className="text-red-500">*</span>
                    </Label>
                    <MobileInput
                      id={`position-${experience.id}`}
                      {...register("position")}
                      enableAutocomplete={true}
                      autocompleteType="job-title"
                      className={errors.position ? "border-red-500" : ""}
                    />
                    {errors.position && (
                      <p className="text-sm text-red-500">{errors.position.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`company-${experience.id}`}>
                      Company <span className="text-red-500">*</span>
                    </Label>
                    <MobileInput
                      id={`company-${experience.id}`}
                      {...register("company")}
                      enableAutocomplete={true}
                      autocompleteType="company"
                      className={errors.company ? "border-red-500" : ""}
                    />
                    {errors.company && (
                      <p className="text-sm text-red-500">{errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`location-${experience.id}`}>
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <MobileInput
                      id={`location-${experience.id}`}
                      {...register("location")}
                      enableAutocomplete={true}
                      autocompleteType="location"
                      placeholder="Dublin, Ireland"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${experience.id}`}>
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <MonthYearPicker
                      id={`startDate-${experience.id}`}
                      value={watch("startDate") || ""}
                      onChange={(value) => setValue("startDate", value)}
                      placeholder="Select start month and year"
                      className={errors.startDate ? "border-red-500" : ""}
                      required
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Date will be displayed as Month Year (e.g., January 2024)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${experience.id}`}>
                      End Date
                    </Label>
                    <MonthYearPicker
                      id={`endDate-${experience.id}`}
                      value={watch("endDate") || ""}
                      onChange={(value) => setValue("endDate", value)}
                      placeholder="Select end month and year"
                      disabled={watchCurrent}
                      className={`${errors.endDate ? "border-red-500" : ""} ${watchCurrent ? "opacity-50" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty if current position
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <input
                      type="checkbox"
                      id={`current-${experience.id}`}
                      {...register("current")}
                      className="w-5 h-5 rounded border-gray-300 text-cvgenius-primary focus:ring-cvgenius-primary focus:ring-2"
                    />
                    <Label htmlFor={`current-${experience.id}`} className="font-normal cursor-pointer select-none">
                      I currently work here
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`description-${experience.id}`}>
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const currentText = watch("description")
                        if (currentText) {
                          const improved = await improveWithAI(currentText, 'description', experience.id)
                          setValue("description", improved)
                        }
                      }}
                      disabled={isImproving[`${experience.id}-description`] || !watch("description")}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {isImproving[`${experience.id}-description`] ? 'Improving...' : 'AI Improve'}
                    </Button>
                  </div>
                  <Textarea
                    id={`description-${experience.id}`}
                    {...register("description")}
                    rows={4}
                    placeholder="Describe your key responsibilities and daily tasks..."
                    className={`resize-none min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`achievements-${experience.id}`}>
                      Key Achievements
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const currentText = watch("achievements")
                        if (currentText) {
                          const improved = await improveWithAI(currentText, 'achievements', experience.id)
                          setValue("achievements", improved)
                        }
                      }}
                      disabled={isImproving[`${experience.id}-achievements`] || !watch("achievements")}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {isImproving[`${experience.id}-achievements`] ? 'Improving...' : 'AI Improve'}
                    </Button>
                  </div>
                  <Textarea
                    id={`achievements-${experience.id}`}
                    {...register("achievements")}
                    placeholder="• Increased sales by 25%&#10;• Led team of 5 developers&#10;• Implemented new processes"
                    rows={4}
                    className="resize-none min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter each achievement on a new line (optional but recommended)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="h-12 w-full sm:w-auto order-2 sm:order-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="h-12 w-full sm:w-auto order-1 sm:order-2"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="p-4 space-y-4">
                <p className="text-gray-700">{experience.description}</p>
                {experience.achievements.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Key Achievements:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {experience.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700">{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ExperienceFormProps {
  isMobile?: boolean
}

export function ExperienceForm({ isMobile = false }: ExperienceFormProps) {
  const { currentCV, addExperience, updateExperience, removeExperience, reorderExperience } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isImproving, setIsImproving] = useState<{ [key: string]: boolean }>({})
  const [improveField, setImproveField] = useState<'description' | 'achievements' | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isMobileView = isMobile || isMobileDevice

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      position: "",
      location: "Dublin, Ireland",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: ""
    }
  })

  const watchCurrent = watch("current")

  // Format date for display (Month Year)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString || dateString === "Present") return dateString
    try {
      // Handle YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        const [year, month] = dateString.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return date.toLocaleDateString('en-IE', {
          month: 'long',
          year: 'numeric'
        })
      }
      // Fallback for other formats
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IE', {
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Format date for input (YYYY-MM)
  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === "Present") return ""
    try {
      // If it's already in YYYY-MM format, return as is
      if (/^\d{4}-\d{2}$/.test(dateString)) {
        return dateString
      }
      // If it's in YYYY-MM-DD format, extract year and month
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString.substring(0, 7) // Extract YYYY-MM
      }
      // Try to parse other formats and convert to YYYY-MM
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    } catch {
      return dateString
    }
  }

  const onSubmit = (data: ExperienceFormData) => {
    const experienceData = {
      ...data,
      achievements: data.achievements ? data.achievements.split('\n').filter(a => a.trim() !== "") : [],
      endDate: data.current ? "Present" : data.endDate || ""
    }

    if (editingId) {
      updateExperience(editingId, experienceData)
      setEditingId(null)
    } else {
      addExperience(experienceData)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id)
    setExpandedId(experience.id)
    setValue("company", experience.company)
    setValue("position", experience.position)
    setValue("location", experience.location)
    setValue("startDate", formatDateForInput(experience.startDate))
    setValue("endDate", experience.current ? "" : formatDateForInput(experience.endDate))
    setValue("current", experience.current)
    setValue("description", experience.description)
    setValue("achievements", experience.achievements.join('\n'))
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      removeExperience(id)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const activeIndex = currentCV.experience.findIndex((item) => item.id === active.id)
      const overIndex = currentCV.experience.findIndex((item) => item.id === over?.id)

      reorderExperience(activeIndex, overIndex)
    }
  }

  // AI Improve function
  const improveWithAI = async (text: string, fieldType: 'description' | 'achievements', experienceId?: string) => {
    if (!text) return text
    
    const improveKey = experienceId ? `${experienceId}-${fieldType}` : fieldType
    setIsImproving({ ...isImproving, [improveKey]: true })
    
    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text,
          type: 'experience',
          fieldType: fieldType
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.improvedText || text
      }
      return text
    } catch (error) {
      console.error('AI improvement failed:', error)
      return text
    } finally {
      setIsImproving({ ...isImproving, [improveKey]: false })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Existing Experiences with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence>
          {currentCV.experience.length > 0 && (
            <SortableContext
              items={currentCV.experience.map(exp => exp.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentCV.experience.map((experience) => (
                  <SortableExperienceItem
                    key={experience.id}
                    experience={experience}
                    editingId={editingId}
                    expandedId={expandedId}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    onToggleExpanded={toggleExpanded}
                    onSubmit={onSubmit}
                    onCancel={handleCancel}
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    fields={[]}
                    append={() => {}}
                    removeField={() => {}}
                    formatDateForDisplay={formatDateForDisplay}
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </AnimatePresence>
      </DndContext>

      {/* Add New Experience Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-4 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Add New Experience</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">
                  Position <span className="text-red-500">*</span>
                </Label>
                <MobileInput
                  id="position"
                  {...register("position")}
                  placeholder="Software Engineer"
                  enableAutocomplete={true}
                  autocompleteType="job-title"
                  className={errors.position ? "border-red-500" : ""}
                />
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </Label>
                <MobileInput
                  id="company"
                  {...register("company")}
                  placeholder="Tech Corp Ireland"
                  enableAutocomplete={true}
                  autocompleteType="company"
                  className={errors.company ? "border-red-500" : ""}
                />
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <MobileInput
                  id="location"
                  {...register("location")}
                  placeholder="Dublin, Ireland"
                  enableAutocomplete={true}
                  autocompleteType="location"
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
                <MonthYearPicker
                  id="startDate"
                  value={watch("startDate") || ""}
                  onChange={(value) => setValue("startDate", value)}
                  placeholder="Select start month and year"
                  className={errors.startDate ? "border-red-500" : ""}
                  required
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Date will be displayed as Month Year (e.g., January 2024)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date
                </Label>
                <MonthYearPicker
                  id="endDate"
                  value={watch("endDate") || ""}
                  onChange={(value) => setValue("endDate", value)}
                  placeholder="Select end month and year"
                  disabled={watchCurrent}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave empty if current position
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
                  I currently work here
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">
                  Role Description <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const currentText = watch("description")
                    if (currentText) {
                      const improved = await improveWithAI(currentText, 'description')
                      setValue("description", improved)
                    }
                  }}
                  disabled={isImproving['description'] || !watch("description")}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isImproving['description'] ? 'Improving...' : 'AI Improve'}
                </Button>
              </div>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe your responsibilities and role..."
                rows={3}
                className={`resize-none ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="achievements">
                  Key Achievements
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const currentText = watch("achievements")
                    if (currentText) {
                      const improved = await improveWithAI(currentText, 'achievements')
                      setValue("achievements", improved)
                    }
                  }}
                  disabled={isImproving['achievements'] || !watch("achievements")}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isImproving['achievements'] ? 'Improving...' : 'AI Improve'}
                </Button>
              </div>
              <Textarea
                id="achievements"
                {...register("achievements")}
                placeholder="• Increased sales by 25%&#10;• Led team of 5 developers&#10;• Implemented new processes"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Enter each achievement on a new line
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Experience
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Experience Button */}
      {!isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full h-16 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 group-hover:scale-[1.02] text-blue-700 hover:text-blue-800"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 group-hover:bg-blue-300 transition-colors duration-200">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Add Work Experience</div>
                <div className="text-sm text-blue-600">Click to add your professional journey</div>
              </div>
            </div>
          </Button>
        </motion.div>
      )}

      {/* Irish CV Tips */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 border-2 border-emerald-200 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xl">
              🇮🇪
            </div>
            <div>
              <h4 className="font-bold text-emerald-800 text-lg">Irish CV Best Practices</h4>
              <p className="text-emerald-600 text-sm">Optimize for the Irish job market</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  📅
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Date Format</div>
                  <div className="text-xs text-emerald-600">Use Month Year format (e.g., "January 2024")</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  📍
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Location Details</div>
                  <div className="text-xs text-emerald-600">Include city/county ("Dublin", "Cork", "Remote")</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  📊
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Quantify Results</div>
                  <div className="text-xs text-emerald-600">Include specific numbers and percentages</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  ⏰
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Chronological Order</div>
                  <div className="text-xs text-emerald-600">List most recent experience first</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  ✨
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Concise Descriptions</div>
                  <div className="text-xs text-emerald-600">Aim for 2-3 impactful bullet points per role</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-200/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                  🎯
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Impact Focus</div>
                  <div className="text-xs text-emerald-600">Highlight achievements over responsibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useCVStore } from "@/store/cv-store"
import { useState } from "react"
import { PlusCircle, Trash2, Edit2, Save, X, ExternalLink, Github, Code2, Briefcase } from "lucide-react"
import { Project } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  achievements: z.array(z.string())
})

type ProjectFormData = z.infer<typeof projectSchema>

export function ProjectsForm() {
  const { currentCV, addProject, updateProject, removeProject } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [techInput, setTechInput] = useState("")
  const [achievementInput, setAchievementInput] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      technologies: [],
      startDate: "",
      endDate: "",
      current: false,
      url: "",
      github: "",
      achievements: []
    }
  })

  const watchCurrent = watch("current")
  const watchTechnologies = watch("technologies")
  const watchAchievements = watch("achievements")

  const onSubmit = (data: ProjectFormData) => {
    if (editingId) {
      updateProject(editingId, data)
      setEditingId(null)
    } else {
      addProject(data)
      setIsAdding(false)
    }
    reset()
    setTechInput("")
    setAchievementInput("")
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setValue("name", project.name)
    setValue("description", project.description)
    setValue("technologies", project.technologies)
    setValue("startDate", project.startDate)
    setValue("endDate", project.endDate)
    setValue("current", project.current)
    setValue("url", project.url || "")
    setValue("github", project.github || "")
    setValue("achievements", project.achievements)
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
    setTechInput("")
    setAchievementInput("")
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      removeProject(id)
    }
  }

  const addTechnology = () => {
    if (techInput.trim()) {
      const currentTechs = watchTechnologies || []
      setValue("technologies", [...currentTechs, techInput.trim()])
      setTechInput("")
    }
  }

  const removeTechnology = (index: number) => {
    const currentTechs = watchTechnologies || []
    setValue("technologies", currentTechs.filter((_, i) => i !== index))
  }

  const addAchievement = () => {
    if (achievementInput.trim()) {
      const currentAchievements = watchAchievements || []
      setValue("achievements", [...currentAchievements, achievementInput.trim()])
      setAchievementInput("")
    }
  }

  const removeAchievement = (index: number) => {
    const currentAchievements = watchAchievements || []
    setValue("achievements", currentAchievements.filter((_, i) => i !== index))
  }

  const projects = currentCV.projects || []

  return (
    <div className="p-6 space-y-6">
      {/* Existing Projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cvgenius-primary" />
            Your Projects ({projects.length})
          </h3>
          
          <div className="space-y-4">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {editingId === project.id ? (
                    /* Inline Edit Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Project Name <span className="text-red-500">*</span></Label>
                          <Input
                            {...register("name")}
                            placeholder="My Awesome Project"
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Project URL</Label>
                          <Input
                            {...register("url")}
                            placeholder="https://myproject.com"
                            className={errors.url ? "border-red-500" : ""}
                          />
                          {errors.url && (
                            <p className="text-sm text-red-500">{errors.url.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description <span className="text-red-500">*</span></Label>
                        <Textarea
                          {...register("description")}
                          placeholder="Brief description of your project..."
                          rows={3}
                          className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-500">{errors.description.message}</p>
                        )}
                      </div>

                      {/* Technologies Section */}
                      <div className="space-y-2">
                        <Label>
                          Technologies <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            placeholder="e.g., React, Node.js"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTechnology()
                              }
                            }}
                          />
                          <Button type="button" onClick={addTechnology} variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(watchTechnologies || []).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {tech}
                              <button
                                type="button"
                                onClick={() => removeTechnology(index)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {errors.technologies && (
                          <p className="text-sm text-red-500">{errors.technologies.message}</p>
                        )}
                      </div>

                      {/* Date Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date <span className="text-red-500">*</span></Label>
                          <Input
                            {...register("startDate")}
                            type="date"
                            className={errors.startDate ? "border-red-500" : ""}
                          />
                          {errors.startDate && (
                            <p className="text-sm text-red-500">{errors.startDate.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            {...register("endDate")}
                            type="date"
                            disabled={watchCurrent}
                            className={errors.endDate ? "border-red-500" : ""}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="current-edit"
                          {...register("current")}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="current-edit" className="font-normal">
                          Currently working on this project
                        </Label>
                      </div>

                      {/* GitHub URL */}
                      <div className="space-y-2">
                        <Label>GitHub Repository</Label>
                        <Input
                          {...register("github")}
                          placeholder="https://github.com/username/project"
                          className={errors.github ? "border-red-500" : ""}
                        />
                        {errors.github && (
                          <p className="text-sm text-red-500">{errors.github.message}</p>
                        )}
                      </div>

                      {/* Achievements Section */}
                      <div className="space-y-2">
                        <Label>Key Achievements</Label>
                        <div className="flex gap-2">
                          <Input
                            value={achievementInput}
                            onChange={(e) => setAchievementInput(e.target.value)}
                            placeholder="e.g., Improved performance by 50%"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addAchievement()
                              }
                            }}
                          />
                          <Button type="button" onClick={addAchievement} variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        <ul className="space-y-1">
                          {(watchAchievements || []).map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span className="flex-1">{achievement}</span>
                              <button
                                type="button"
                                onClick={() => removeAchievement(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* View Mode */
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {project.name}
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            {project.github && (
                              <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {project.startDate} - {project.current ? "Present" : project.endDate}
                          </p>
                          <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                          
                          {project.technologies.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Technologies:</p>
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map((tech, index) => (
                                  <span 
                                    key={index} 
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {project.achievements.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Key Achievements:</p>
                              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                                {project.achievements.map((achievement, index) => (
                                  <li key={index}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(project.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Projects Message */}
      {projects.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No projects added yet</h3>
          <p className="text-gray-500 mb-4">Add your first project to showcase your work</p>
        </div>
      )}

      {/* Add New Project Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-6 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cvgenius-primary" />
            Add New Project
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  {...register("name")}
                  placeholder="My Awesome Project"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  {...register("url")}
                  placeholder="https://myproject.com"
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="projectDescription"
                {...register("description")}
                placeholder="Brief description of your project..."
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Technologies Section */}
            <div className="space-y-2">
              <Label>
                Technologies <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g., React, Node.js"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTechnology()
                    }
                  }}
                />
                <Button type="button" onClick={addTechnology} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(watchTechnologies || []).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {errors.technologies && (
                <p className="text-sm text-red-500">{errors.technologies.message}</p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={watchCurrent}
                  className={errors.endDate ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                className="rounded border-gray-300"
              />
              <Label htmlFor="current" className="font-normal">
                Currently working on this project
              </Label>
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Repository</Label>
              <Input
                id="github"
                {...register("github")}
                placeholder="https://github.com/username/project"
                className={errors.github ? "border-red-500" : ""}
              />
              {errors.github && (
                <p className="text-sm text-red-500">{errors.github.message}</p>
              )}
            </div>

            {/* Achievements Section */}
            <div className="space-y-2">
              <Label>Key Achievements</Label>
              <div className="flex gap-2">
                <Input
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  placeholder="e.g., Improved performance by 50%"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAchievement()
                    }
                  }}
                />
                <Button type="button" onClick={addAchievement} variant="outline">
                  Add
                </Button>
              </div>
              <ul className="space-y-1">
                {(watchAchievements || []).map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span className="flex-1">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Project
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Project Button */}
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      )}

      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for Projects</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include 2-4 relevant projects that showcase your skills</li>
          <li>• Focus on projects relevant to your target role</li>
          <li>• Mention technologies and tools used</li>
          <li>• Include links to live demos or GitHub repositories</li>
          <li>• Quantify your achievements and impact where possible</li>
          <li>• Keep descriptions concise but informative</li>
        </ul>
      </div>
    </div>
  )
}
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
import { Plus, Trash2, Edit3, Check, X, ExternalLink, Award, Calendar, Building, Hash, FileText, Star, Zap } from "lucide-react"
import { Certification } from "@/types/cv"
import { motion, AnimatePresence } from "framer-motion"

const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional()
})

type CertificationFormData = z.infer<typeof certificationSchema>

export function CertificationsForm() {
  const { currentCV, addCertification, updateCertification, removeCertification } = useCVStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      url: "",
      description: ""
    }
  })

  const onSubmit = (data: CertificationFormData) => {
    if (editingId) {
      updateCertification(editingId, data)
      setEditingId(null)
    } else {
      addCertification(data)
      setIsAdding(false)
    }
    reset()
  }

  const handleEdit = (certification: Certification) => {
    setEditingId(certification.id)
    setValue("name", certification.name)
    setValue("issuer", certification.issuer)
    setValue("issueDate", certification.issueDate)
    setValue("expiryDate", certification.expiryDate || "")
    setValue("credentialId", certification.credentialId || "")
    setValue("url", certification.url || "")
    setValue("description", certification.description || "")
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      removeCertification(id)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IE', { 
        year: 'numeric', 
        month: 'long' 
      })
    } catch {
      return dateString
    }
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const certifications = currentCV.certifications || []

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cvgenius-primary/10 to-blue-100 rounded-2xl">
          <Award className="h-8 w-8 text-cvgenius-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Certifications</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Showcase your expertise with industry-recognized certifications that set you apart
          </p>
        </div>
      </div>

      {/* Existing Certifications - Clean Cards */}
      {certifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-1 h-6 bg-cvgenius-primary rounded-full"></div>
            Your Certifications
            <span className="text-sm font-normal text-gray-500">({certifications.length})</span>
          </h3>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {certifications.map((certification) => (
                <motion.div
                  key={certification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-cvgenius-primary/20 cert-card-hover"
                >
                  {editingId === certification.id ? (
                    /* Compact Edit Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Certification Name *</Label>
                          <Input
                            {...register("name")}
                            placeholder="AWS Certified Developer"
                            className={`h-11 form-transition enhanced-focus ${errors.name ? "border-red-500" : ""}`}
                          />
                          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Issuing Organization *</Label>
                          <Input
                            {...register("issuer")}
                            placeholder="Amazon Web Services"
                            className={`h-11 form-transition enhanced-focus ${errors.issuer ? "border-red-500" : ""}`}
                          />
                          {errors.issuer && <p className="text-sm text-red-500">{errors.issuer.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Issue Date *</Label>
                          <Input
                            {...register("issueDate")}
                            type="month"
                            className={`h-11 form-transition enhanced-focus ${errors.issueDate ? "border-red-500" : ""}`}
                          />
                          {errors.issueDate && <p className="text-sm text-red-500">{errors.issueDate.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                          <Input {...register("expiryDate")} type="month" className="h-11 form-transition enhanced-focus" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Credential ID</Label>
                          <Input {...register("credentialId")} placeholder="ABC123XYZ" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Verification URL</Label>
                          <Input
                            {...register("url")}
                            placeholder="https://verify.example.com"
                            className={`h-11 form-transition enhanced-focus ${errors.url ? "border-red-500" : ""}`}
                          />
                          {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          {...register("description")}
                          placeholder="Brief description..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleCancel} className="h-10">
                          <X className="h-4 w-4 mr-2" />Cancel
                        </Button>
                        <Button type="submit" className="h-10">
                          <Check className="h-4 w-4 mr-2" />Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Clean View Mode */
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Award className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-semibold text-gray-900">{certification.name}</h4>
                              {certification.url && (
                                <a
                                  href={certification.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              {certification.expiryDate && isExpired(certification.expiryDate) && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  Expired
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 font-medium mb-2">{certification.issuer}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(certification.issueDate)}
                              </span>
                              {certification.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires {formatDate(certification.expiryDate)}
                                </span>
                              )}
                              {certification.credentialId && (
                                <span className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {certification.credentialId}
                                </span>
                              )}
                            </div>
                            {certification.description && (
                              <p className="text-gray-700 mt-2 text-sm leading-relaxed">{certification.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(certification)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(certification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Certifications Message */}
      {certifications.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Award className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to add your certifications?</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Professional certifications demonstrate your expertise and commitment to your field. 
            Let's showcase what makes you qualified.
          </p>
        </div>
      )}

      {/* Modern Add Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm form-transition"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cvgenius-primary/10 to-blue-100 rounded-xl mb-4">
              <Plus className="h-6 w-6 text-cvgenius-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Certification</h3>
            <p className="text-gray-600">Showcase your professional expertise and qualifications</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1 - Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Certification Details</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Certification Name *</Label>
                  <Input
                    {...register("name")}
                    placeholder="AWS Certified Solutions Architect"
                    className={`h-12 text-base ${errors.name ? "border-red-500" : "border-gray-300 focus:border-cvgenius-primary"}`}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Issuing Organization *</Label>
                  <Input
                    {...register("issuer")}
                    placeholder="Amazon Web Services"
                    className={`h-12 text-base ${errors.issuer ? "border-red-500" : "border-gray-300 focus:border-cvgenius-primary"}`}
                  />
                  {errors.issuer && <p className="text-sm text-red-500">{errors.issuer.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 2 - Dates */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Timeline</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Issue Date *</Label>
                  <Input
                    {...register("issueDate")}
                    type="month"
                    className={`h-12 text-base ${errors.issueDate ? "border-red-500" : "border-gray-300 focus:border-cvgenius-primary"}`}
                  />
                  {errors.issueDate && <p className="text-sm text-red-500">{errors.issueDate.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Expiry Date <span className="text-gray-500 font-normal">(Optional)</span></Label>
                  <Input
                    {...register("expiryDate")}
                    type="month"
                    className="h-12 text-base border-gray-300 focus:border-cvgenius-primary"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 - Additional Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Hash className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Verification Details</h4>
                <span className="text-sm text-gray-500">Optional</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Credential ID</Label>
                  <Input
                    {...register("credentialId")}
                    placeholder="ABC123XYZ789"
                    className="h-12 text-base border-gray-300 focus:border-cvgenius-primary"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Verification URL</Label>
                  <Input
                    {...register("url")}
                    placeholder="https://verify.example.com"
                    className={`h-12 text-base ${errors.url ? "border-red-500" : "border-gray-300 focus:border-cvgenius-primary"}`}
                  />
                  {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 4 - Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Description</h4>
                <span className="text-sm text-gray-500">Optional</span>
              </div>
              
              <Textarea
                {...register("description")}
                placeholder="Describe what this certification covers and its relevance to your career..."
                rows={4}
                className="text-base form-transition enhanced-focus border-gray-300 focus:border-cvgenius-primary resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1 h-12 text-base"
              >
                <X className="h-4 w-4 mr-2" />Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 h-12 text-base bg-cvgenius-primary hover:bg-cvgenius-primary/90"
              >
                <Check className="h-4 w-4 mr-2" />Add Certification
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Certification Button */}
      {!isAdding && (
        <div className="text-center">
          <Button
            onClick={() => setIsAdding(true)}
            className="h-14 px-8 text-base bg-cvgenius-primary hover:bg-cvgenius-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-3" />
            Add Certification
          </Button>
        </div>
      )}

      {/* Quick Add Popular Certifications */}
      {!isAdding && certifications.length < 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-cvgenius-primary" />
              Quick Add Popular Certifications
            </h4>
            <p className="text-gray-600 text-sm">Choose from common industry certifications</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", category: "Cloud" },
              { name: "Google Cloud Professional", issuer: "Google Cloud", category: "Cloud" },
              { name: "Microsoft Azure Fundamentals", issuer: "Microsoft", category: "Cloud" },
              { name: "PMP (Project Management Professional)", issuer: "PMI", category: "Management" },
              { name: "CISSP", issuer: "ISC²", category: "Security" },
              { name: "CompTIA Security+", issuer: "CompTIA", category: "Security" }
            ].filter(suggestion => 
              !certifications.some(cert => 
                cert.name.toLowerCase().includes(suggestion.name.toLowerCase())
              )
            ).slice(0, 6).map((suggestion) => (
              <motion.button
                key={suggestion.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setValue("name", suggestion.name)
                  setValue("issuer", suggestion.issuer)
                  setIsAdding(true)
                }}
                className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-cvgenius-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {suggestion.category}
                    </span>
                    <Star className="h-4 w-4 text-gray-300 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                    {suggestion.name}
                  </h5>
                  <p className="text-xs text-gray-600">
                    {suggestion.issuer}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Irish CV Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">🇮🇪 Irish CV Best Practices</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-800">
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Include industry-relevant certifications
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  List newest certifications first
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Include expiry dates when applicable
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Provide verification links/IDs
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Focus on role-relevant certifications
                </p>
                <p className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Include technical & professional certs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
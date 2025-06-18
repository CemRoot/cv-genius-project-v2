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
import { PlusCircle, Trash2, Edit2, Save, X, ExternalLink, Award, Calendar } from "lucide-react"
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
    <div className="p-6 space-y-6">
      {/* Existing Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-cvgenius-primary" />
            Your Certifications ({certifications.length})
          </h3>
          
          <div className="space-y-4">
            <AnimatePresence>
              {certifications.map((certification) => (
                <motion.div
                  key={certification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {editingId === certification.id ? (
                    /* Inline Edit Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Certification Name *</Label>
                          <Input
                            {...register("name")}
                            placeholder="AWS Certified Developer"
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Issuer *</Label>
                          <Input
                            {...register("issuer")}
                            placeholder="Amazon Web Services"
                            className={errors.issuer ? "border-red-500" : ""}
                          />
                          {errors.issuer && (
                            <p className="text-sm text-red-500">{errors.issuer.message}</p>
                          )}
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
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{certification.name}</h4>
                            {certification.url && (
                              <a 
                                href={certification.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            {certification.expiryDate && isExpired(certification.expiryDate) && (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                Expired
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 font-medium mb-1">{certification.issuer}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Issued: {formatDate(certification.issueDate)}
                            </span>
                            {certification.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires: {formatDate(certification.expiryDate)}
                              </span>
                            )}
                          </div>

                          {certification.credentialId && (
                            <p className="text-xs text-gray-500 mb-2">
                              Credential ID: {certification.credentialId}
                            </p>
                          )}

                          {certification.description && (
                            <p className="text-sm text-gray-700">{certification.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEdit(certification)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(certification.id)}
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

      {/* No Certifications Message */}
      {certifications.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No certifications added yet</h3>
          <p className="text-gray-500 mb-4">Add your professional certifications and licenses</p>
        </div>
      )}

      {/* Add New Certification Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-cvgenius-primary/20 rounded-lg p-6 bg-cvgenius-primary/5"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-cvgenius-primary" />
            Add New Certification
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certName">
                  Certification Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="certName"
                  {...register("name")}
                  placeholder="AWS Certified Developer"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certIssuer">
                  Issuing Organization <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="certIssuer"
                  {...register("issuer")}
                  placeholder="Amazon Web Services"
                  className={errors.issuer ? "border-red-500" : ""}
                />
                {errors.issuer && (
                  <p className="text-sm text-red-500">{errors.issuer.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssueDate">
                  Issue Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="certIssueDate"
                  {...register("issueDate")}
                  type="month"
                  className={errors.issueDate ? "border-red-500" : ""}
                />
                {errors.issueDate && (
                  <p className="text-sm text-red-500">{errors.issueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Expiry Date (if applicable)</Label>
                <Input
                  id="certExpiryDate"
                  {...register("expiryDate")}
                  type="month"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certCredentialId">Credential ID</Label>
                <Input
                  id="certCredentialId"
                  {...register("credentialId")}
                  placeholder="ABC123XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certUrl">Verification URL</Label>
                <Input
                  id="certUrl"
                  {...register("url")}
                  placeholder="https://verify.example.com"
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certDescription">Description (optional)</Label>
              <Textarea
                id="certDescription"
                {...register("description")}
                placeholder="Brief description of what this certification covers..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Certification
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Add Certification Button */}
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      )}

      {/* Quick Add Popular Certifications */}
      {!isAdding && certifications.length < 3 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Quick Add Popular Certifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services" },
              { name: "Google Cloud Professional", issuer: "Google Cloud" },
              { name: "Microsoft Azure Fundamentals", issuer: "Microsoft" },
              { name: "PMP (Project Management Professional)", issuer: "PMI" },
              { name: "CISSP", issuer: "ISC²" },
              { name: "CompTIA Security+", issuer: "CompTIA" }
            ].filter(suggestion => 
              !certifications.some(cert => 
                cert.name.toLowerCase().includes(suggestion.name.toLowerCase())
              )
            ).slice(0, 6).map((suggestion) => (
              <Button
                key={suggestion.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("name", suggestion.name)
                  setValue("issuer", suggestion.issuer)
                  setIsAdding(true)
                }}
                className="text-xs text-left p-2 h-auto"
              >
                <div>
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-gray-500">{suggestion.issuer}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Tips for Certifications</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include relevant professional certifications for your industry</li>
          <li>• List certifications in reverse chronological order (newest first)</li>
          <li>• Include expiry dates and renewal status if applicable</li>
          <li>• Provide verification links or credential IDs when possible</li>
          <li>• Focus on certifications that add value to your target role</li>
          <li>• Include both technical and professional development certifications</li>
        </ul>
      </div>
    </div>
  )
}
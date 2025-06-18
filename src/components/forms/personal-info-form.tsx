"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCVStore } from "@/store/cv-store"
import { formatIrishPhone } from "@/lib/utils"
import { useEffect, useCallback, useRef } from "react"

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  title: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  nationality: z.string().optional(),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal(""))
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

export function PersonalInfoForm() {
  const { currentCV, updatePersonalInfo } = useCVStore()
  const isInitialMount = useRef(true)
  
  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: currentCV.personal
  })

  // Memoized update function to prevent recreating on every render
  const updateStoreData = useCallback((data: PersonalInfoFormData) => {
    updatePersonalInfo(data)
  }, [updatePersonalInfo])

  // Watch for changes and update store in real-time
  const watchedFields = watch()
  
  // Reset form when currentCV.personal changes from external updates
  useEffect(() => {
    if (!isInitialMount.current && !isDirty) {
      reset(currentCV.personal)
    }
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [currentCV.personal, reset, isDirty])
  
  // Update store when form changes, but prevent infinite loops
  useEffect(() => {
    if (isDirty && !isInitialMount.current) {
      const timeoutId = setTimeout(() => {
        updateStoreData(watchedFields)
      }, 300) // Debounce updates
      
      return () => clearTimeout(timeoutId)
    }
  }, [watchedFields, isDirty, updateStoreData])

  // Format phone number on blur
  const handlePhoneFormat = (value: string) => {
    const formatted = formatIrishPhone(value)
    setValue('phone', formatted, { shouldDirty: true })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="John Smith"
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Professional Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Python Developer"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john.smith@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+353 87 123 4567"
            onBlur={(e) => handlePhoneFormat(e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Will be automatically formatted for Irish numbers
          </p>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Dublin, Ireland"
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* Nationality/Status */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Work Authorization</Label>
          <Input
            id="nationality"
            {...register("nationality")}
            placeholder="STAMP2 | Master Student"
            className={errors.nationality ? "border-red-500" : ""}
          />
          {errors.nationality && (
            <p className="text-sm text-red-500">{errors.nationality.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            e.g., "EU Citizen", "STAMP2", "Work Permit Holder"
          </p>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/johnsmith"
            className={errors.linkedin ? "border-red-500" : ""}
          />
          {errors.linkedin && (
            <p className="text-sm text-red-500">{errors.linkedin.message}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Personal Website</Label>
          <Input
            id="website"
            {...register("website")}
            placeholder="https://johnsmith.dev"
            className={errors.website ? "border-red-500" : ""}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>
      </div>


      {/* Irish CV Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🇮🇪 Irish CV Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Don't include a photo (GDPR compliance)</li>
          <li>• Mention your work authorization status if you're not an EU citizen</li>
          <li>• Use Dublin postal codes (D01, D02, etc.) if applicable</li>
          <li>• Professional summary is optional but recommended</li>
        </ul>
      </div>

      {/* Save Status */}
      {isDirty && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          Unsaved changes - auto-saving...
        </div>
      )}
    </div>
  )
}
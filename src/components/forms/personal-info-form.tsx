"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { MobileInput } from "@/components/ui/mobile-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCVStore } from "@/store/cv-store"
import { formatIrishPhone } from "@/lib/utils"
import { useEffect, useCallback, useRef, useState } from "react"

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

interface PersonalInfoFormProps {
  isMobile?: boolean
}

export function PersonalInfoForm({ isMobile = false }: PersonalInfoFormProps) {
  const { currentCV, updatePersonalInfo } = useCVStore()
  const isInitialMount = useRef(true)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
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

  const isMobileView = isMobile || isMobileDevice

  return (
    <div className={`${isMobileView ? 'p-0 space-y-4' : 'p-6 space-y-6'}`}>
      {/* Mobile Header */}
      {isMobileView && (
        <div className="px-4 py-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg mx-4">
          <h4 className="font-medium text-blue-900 text-sm">Personal Information</h4>
          <p className="text-blue-700 text-xs mt-1">Required fields are marked with *</p>
        </div>
      )}

      <div className={`${isMobileView ? 'space-y-4 px-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {/* Full Name */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="fullName" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="John Smith"
            className={`
              ${errors.fullName ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Professional Title */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="title" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Professional Title
          </Label>
          <MobileInput
            id="title"
            {...register("title")}
            placeholder="e.g. Software Developer, Product Manager"
            enableAutocomplete={true}
            autocompleteType="job-title"
            isMobile={isMobileView}
            className={`
              ${errors.title ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.title && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="email" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john.smith@example.com"
            className={`
              ${errors.email ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="phone" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="+353 87 123 4567"
            onBlur={(e) => handlePhoneFormat(e.target.value)}
            className={`
              ${errors.phone ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.phone.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            📱 Auto-formatted for Irish numbers
          </p>
        </div>

        {/* Address */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="address" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Address <span className="text-red-500">*</span>
          </Label>
          <MobileInput
            id="address"
            {...register("address")}
            placeholder="Dublin, Ireland"
            enableAutocomplete={true}
            autocompleteType="location"
            isMobile={isMobileView}
            className={`
              ${errors.address ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.address && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Nationality/Status */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="nationality" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Work Authorization
          </Label>
          <MobileInput
            id="nationality"
            {...register("nationality")}
            placeholder="EU Citizen, STAMP2, Work Permit"
            enableAutocomplete={true}
            autocompleteType="work-authorization"
            isMobile={isMobileView}
            className={`
              ${errors.nationality ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.nationality && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.nationality.message}
            </p>
          )}
          <p className={`text-xs ${isMobileView ? 'text-gray-600' : 'text-muted-foreground'}`}>
            💼 e.g., "EU Citizen", "STAMP2", "Work Permit Holder"
          </p>
        </div>

        {/* LinkedIn */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="linkedin" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            type="url"
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/yourname"
            className={`
              ${errors.linkedin ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.linkedin && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.linkedin.message}
            </p>
          )}
          <p className={`text-xs ${isMobileView ? 'text-gray-600' : 'text-muted-foreground'}`}>
            🔗 Optional - adds professional credibility
          </p>
        </div>

        {/* Website */}
        <div className={`${isMobileView ? 'space-y-3' : 'space-y-2'}`}>
          <Label htmlFor="website" className={`${isMobileView ? 'text-base font-semibold text-gray-900' : ''}`}>
            Personal Website
          </Label>
          <Input
            id="website"
            type="url"
            {...register("website")}
            placeholder="https://yourportfolio.com"
            className={`
              ${errors.website ? "border-red-500" : ""}
              ${isMobileView ? 'h-12 text-base' : ''}
            `}
          />
          {errors.website && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {errors.website.message}
            </p>
          )}
          <p className={`text-xs ${isMobileView ? 'text-gray-600' : 'text-muted-foreground'}`}>
            🌐 Portfolio, blog, or personal site
          </p>
        </div>
      </div>


      {/* Irish CV Tips */}
      <div className={`${isMobileView ? 'mx-4 mb-4' : ''} bg-blue-50 border border-blue-200 rounded-lg p-4`}>
        <h4 className={`font-medium text-blue-800 mb-2 ${isMobileView ? 'text-base' : ''}`}>🇮🇪 Irish CV Guidelines</h4>
        <ul className={`text-sm text-blue-700 ${isMobileView ? 'space-y-2' : 'space-y-1'}`}>
          <li>• Don't include a photo (GDPR compliance)</li>
          <li>• Mention your work authorization status if you're not an EU citizen</li>
          <li>• Use Dublin postal codes (D01, D02, etc.) if applicable</li>
          <li>• Professional summary is optional but recommended</li>
        </ul>
      </div>

      {/* Save Status */}
      {isDirty && (
        <div className={`${isMobileView ? 'mx-4 mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg' : ''} text-xs ${isMobileView ? 'text-orange-800' : 'text-muted-foreground'} flex items-center gap-2`}>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className={isMobileView ? 'font-medium' : ''}>
            {isMobileView ? 'Auto-saving changes...' : 'Unsaved changes - auto-saving...'}
          </span>
        </div>
      )}
    </div>
  )
}
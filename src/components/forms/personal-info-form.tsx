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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  title: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  nationality: z.string().optional(),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  summary: z.string().optional()
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  isMobile?: boolean
}

export function PersonalInfoForm({ isMobile = false }: PersonalInfoFormProps) {
  const { currentCV, updatePersonalInfo } = useCVStore()
  const isInitialMount = useRef(true)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  // Debug logging
  useEffect(() => {
    console.log('PersonalInfoForm mounted with CV:', currentCV)
  }, [])

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
    defaultValues: currentCV?.personal || {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      address: 'Dublin, Ireland',
      nationality: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    mode: 'onChange' // Add this to trigger validation on every change
  })

  // Memoized update function to prevent recreating on every render
  const updateStoreData = useCallback((data: PersonalInfoFormData) => {
    updatePersonalInfo(data)
  }, [updatePersonalInfo])

  // Watch for changes and update store in real-time
  const watchedFields = watch()
  const nationalityValue = watch('nationality')
  
  // Debug nationality field specifically
  useEffect(() => {
    console.log('🏳️ Nationality field value:', nationalityValue)
  }, [nationalityValue])
  
  // 🔄 Sync nationality value to CV store in real-time
  useEffect(() => {
    // Update store immediately whenever nationality changes
    if (nationalityValue !== undefined) {
      updatePersonalInfo({ nationality: nationalityValue })
      console.log('🚀 Synced nationality to store:', nationalityValue)
    }
  }, [nationalityValue, updatePersonalInfo])
  
  // Reset form when currentCV.personal changes from external updates
  useEffect(() => {
    if (!isInitialMount.current && currentCV?.personal) {
      // Always reset from store data to ensure sync
      console.log('🔄 Resetting form with store data:', currentCV.personal)
      reset(currentCV.personal)
    }
    if (isInitialMount.current) {
      isInitialMount.current = false
      console.log('🚀 PersonalInfoForm initialized with:', currentCV?.personal)
    }
  }, [currentCV?.personal, reset])
  
  // Update store when form changes, but prevent infinite loops
  useEffect(() => {
    if (isDirty && !isInitialMount.current) {
      // Immediate update for better sync - no debouncing for critical fields
      console.log('🔄 Form updating store with:', watchedFields)
      console.log('🎯 Nationality value:', watchedFields.nationality)
      updateStoreData(watchedFields)
    }
  }, [watchedFields, isDirty, updateStoreData])

  // Format phone number on blur
  const handlePhoneFormat = (value: string) => {
    const formatted = formatIrishPhone(value)
    setValue('phone', formatted, { shouldDirty: true })
  }

  const isMobileView = isMobile || isMobileDevice

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-sm text-gray-600">Required fields are marked with an asterisk (*)</p>
      </div>

      <div className="space-y-8">
        {/* Essential Information Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 text-lg">Essential Details</h3>
            </div>
            
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="e.g. John Smith"
                  className={`h-11 transition-colors ${errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Professional Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Professional Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. Software Developer, Product Manager"
                  className={`h-11 transition-colors ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.title && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 text-lg">Contact Information</h3>
            </div>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john.smith@example.com"
                  className={`h-11 transition-colors ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="+353 87 123 4567"
                  onBlur={(e) => handlePhoneFormat(e.target.value)}
                  className={`h-11 transition-colors ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  📱 Auto-formatted for Irish numbers
                </p>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Dublin, Ireland"
                  className={`h-11 transition-colors ${errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Work Authorization */}
              <div className="space-y-3">
                <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">
                  Work Authorization
                </Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  placeholder="EU Citizen, STAMP2, Work Permit"
                  className={`h-11 transition-colors ${errors.nationality ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.nationality && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.nationality.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💼 e.g., "EU Citizen", "STAMP2", "Work Permit Holder"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Links Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 text-lg">Professional Links</h3>
              <Badge variant="secondary" className="text-xs ml-auto">Optional</Badge>
            </div>
            
            <div className="space-y-6">
              {/* LinkedIn */}
              <div className="space-y-3">
                <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  {...register("linkedin")}
                  placeholder="https://linkedin.com/in/yourname"
                  className={`h-11 transition-colors ${errors.linkedin ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.linkedin && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.linkedin.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  🔗 Adds professional credibility
                </p>
              </div>

              {/* Website */}
              <div className="space-y-3">
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                  Personal Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  {...register("website")}
                  placeholder="https://yourportfolio.com"
                  className={`h-11 transition-colors ${errors.website ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {errors.website && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <span>⚠</span>
                    {errors.website.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  🌐 Portfolio, blog, or personal site
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 text-lg">Professional Summary</h3>
              <Badge variant="secondary" className="text-xs ml-auto">Optional</Badge>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                Summary
              </Label>
              <Textarea
                id="summary"
                {...register("summary")}
                placeholder="Brief overview of your professional background and key achievements..."
                rows={4}
                className={`transition-colors resize-none ${errors.summary ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.summary && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span>
                  {errors.summary.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 2-3 sentences highlighting your experience and value proposition
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Irish CV Guidelines */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-blue-600 text-lg">🇮🇪</span>
              <h3 className="font-semibold text-blue-900 text-lg">Irish CV Guidelines</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Don't include a photo (GDPR compliance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Mention your work authorization status if you're not an EU citizen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Use Dublin postal codes (D01, D02, etc.) if applicable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Professional summary is optional but recommended</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Auto-save Status */}
        {isDirty && (
          <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-amber-800 font-medium">
              Auto-saving changes...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
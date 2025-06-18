import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Page loading component
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-muted-foreground">Loading CVGenius...</p>
      </div>
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded"></div>
        <div className="h-2 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  )
}

// Template preview skeleton
export function TemplateSkeleton() {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="h-48 bg-muted animate-pulse"></div>
      <div className="p-6 space-y-4">
        <div className="h-5 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    </div>
  )
}

// FAQ skeleton
export function FAQSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
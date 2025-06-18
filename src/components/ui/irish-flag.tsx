import { cn } from "@/lib/utils"

interface IrishFlagProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function IrishFlag({ className, size = "md" }: IrishFlagProps) {
  const sizeClasses = {
    sm: "w-6 h-4",
    md: "w-8 h-6", 
    lg: "w-12 h-8"
  }

  return (
    <div className={cn("inline-block overflow-hidden rounded-sm border", sizeClasses[size], className)}>
      <div className="flex h-full">
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-orange-500"></div>
      </div>
    </div>
  )
}

export function ShamrockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-green-600", className)}
    >
      <path d="M12 2C10.89 2 10 2.89 10 4C10 4.74 10.4 5.38 11 5.73C10.4 6.07 10 6.71 10 7.45C10 8.56 10.89 9.45 12 9.45C13.11 9.45 14 8.56 14 7.45C14 6.71 13.6 6.07 13 5.73C13.6 5.38 14 4.74 14 4C14 2.89 13.11 2 12 2M7.45 10C6.34 10 5.45 10.89 5.45 12C5.45 13.11 6.34 14 7.45 14C8.19 14 8.83 13.6 9.18 13C8.84 13.6 8.2 14 7.46 14C6.35 14 5.46 13.11 5.46 12C5.46 10.89 6.35 10 7.46 10C8.2 10 8.84 10.4 9.18 11C8.83 10.4 8.19 10 7.45 10M16.55 10C15.44 10 14.55 10.89 14.55 12C14.55 13.11 15.44 14 16.55 14C17.29 14 17.93 13.6 18.28 13C17.94 13.6 17.3 14 16.56 14C15.45 14 14.56 13.11 14.56 12C14.56 10.89 15.45 10 16.56 10C17.3 10 17.94 10.4 18.28 11C17.93 10.4 17.29 10 16.55 10M12 14.55C10.89 14.55 10 15.44 10 16.55C10 17.66 10.89 18.55 12 18.55C13.11 18.55 14 17.66 14 16.55C14 15.44 13.11 14.55 12 14.55M12 18.55V22L11 21L12 18.55Z" />
    </svg>
  )
}
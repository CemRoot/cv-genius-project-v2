"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }
  
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  }

  const handleLogoClick = () => {
    // If already on home page, scroll to top
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // Navigate to home page
    router.push('/')
  }

  return (
    <Link 
      href="/" 
      scroll={false}
      onClick={handleLogoClick}
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="text-cvgenius-purple"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
      {showText && (
        <span className={`font-bold cvgenius-text-gradient ${sizeClasses[size]}`}>
          CVGenius
        </span>
      )}
    </Link>
  )
}
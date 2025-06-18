"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "CV Builder" },
  { href: "/cover-letter", label: "Cover Letters" },
  { href: "/templates", label: "Templates" },
  { href: "/examples", label: "Examples" },
  { href: "/ats-check", label: "ATS Check" },
  { href: "/guides", label: "Career Guide" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Auto-close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [isOpen])

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOpen) return
    const touch = e.touches[0]
    const startX = touch.clientX
    
    const handleTouchMove = (moveE: TouchEvent) => {
      const currentTouch = moveE.touches[0]
      const deltaX = currentTouch.clientX - startX
      
      // Swipe right to close (if swiped more than 100px)
      if (deltaX > 100) {
        setIsOpen(false)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-top">
      <div className="container mx-auto mobile-container">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-cvgenius-purple touch-target ${
                  pathname === link.href ? 'text-cvgenius-purple' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="cvgenius" size="sm" className="touch-target" asChild>
              <Link href="/builder">Start Building</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative z-50 touch-target-large touch-feedback"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setIsOpen(false)}
                style={{ top: '64px' }}
              />
              
              {/* Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="lg:hidden absolute left-0 right-0 top-full bg-background/98 backdrop-blur-md border-t shadow-lg"
                onTouchStart={handleTouchStart}
                style={{ height: 'calc(var(--mobile-vh) - 64px)' }}
              >
                <div className="mobile-container py-6 h-full overflow-y-auto mobile-overflow-scroll">
                  <nav className="mobile-stack" role="navigation" aria-label="Mobile navigation">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          className={`block mobile-body font-medium transition-all duration-200 py-4 px-6 rounded-touch hover:bg-muted/50 touch-target touch-feedback ${
                            pathname === link.href 
                              ? 'text-cvgenius-purple bg-cvgenius-purple/10 border-l-4 border-cvgenius-purple' 
                              : 'hover:text-cvgenius-purple'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="mt-8 px-6"
                    >
                      <Button 
                        variant="cvgenius" 
                        size="lg" 
                        className="w-full mobile-button-primary touch-feedback" 
                        asChild
                      >
                        <Link href="/builder" onClick={() => setIsOpen(false)}>
                          Start Building CV
                        </Link>
                      </Button>
                    </motion.div>

                    {/* Mobile-specific quick actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="mt-6 px-6 pt-6 border-t border-border/50"
                    >
                      <div className="mobile-grid-2 gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mobile-button-secondary touch-feedback" 
                          asChild
                        >
                          <Link href="/templates" onClick={() => setIsOpen(false)}>
                            Browse Templates
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mobile-button-secondary touch-feedback" 
                          asChild
                        >
                          <Link href="/ats-check" onClick={() => setIsOpen(false)}>
                            ATS Check
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
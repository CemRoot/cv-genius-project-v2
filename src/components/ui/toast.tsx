"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto remove after duration (default 4 seconds)
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {/* Desktop Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3 pointer-events-none hidden md:block">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Mobile Toast Container */}
      <div className="fixed top-4 left-4 right-4 z-50 space-y-3 pointer-events-none md:hidden">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} isMobile />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function ToastComponent({ toast, onRemove, isMobile = false }: { toast: Toast; onRemove: (id: string) => void; isMobile?: boolean }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[toast.type || 'info']

  const variants = {
    success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900 shadow-green-100",
    error: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-900 shadow-red-100",
    warning: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900 shadow-amber-100",
    info: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-900 shadow-blue-100",
  }

  const iconVariants = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  }

  const progressVariants = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? -20 : -50, x: isMobile ? 0 : 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: isMobile ? -20 : -50, x: isMobile ? 0 : 50, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group relative pointer-events-auto w-full overflow-hidden rounded-xl border-2 p-4 pr-10 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl",
        isMobile ? "max-w-none" : "max-w-sm",
        variants[toast.type || 'info']
      )}
    >
      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
          className={cn(
            "absolute bottom-0 left-0 h-1 rounded-b-xl",
            progressVariants[toast.type || 'info']
          )}
        />
      )}

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute right-2 top-2 rounded-lg p-1.5 text-current/60 opacity-0 transition-all hover:text-current hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/30 group-hover:opacity-100 touch-manipulation"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn("h-5 w-5", iconVariants[toast.type || 'info'])} />
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className={cn(
              "font-semibold leading-tight",
              isMobile ? "text-sm" : "text-sm"
            )}>
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className={cn(
              "mt-1 opacity-90 leading-relaxed",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {toast.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Helper function to create toast utility
export function createToastUtils(addToast: (toast: Omit<Toast, 'id'>) => void) {
  return {
    success: (title: string, description?: string) => {
      addToast({ type: 'success', title, description })
    },
    error: (title: string, description?: string) => {
      addToast({ type: 'error', title, description })
    },
    warning: (title: string, description?: string) => {
      addToast({ type: 'warning', title, description })
    },
    info: (title: string, description?: string) => {
      addToast({ type: 'info', title, description })
    },
  }
}
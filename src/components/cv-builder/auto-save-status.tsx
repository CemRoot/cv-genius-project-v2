'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AutoSaveStatusProps {
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function AutoSaveStatus({ isSaving, hasUnsavedChanges }: AutoSaveStatusProps) {
  const getStatusContent = () => {
    if (isSaving) {
      return {
        bgClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800",
        textClass: "text-blue-700 dark:text-blue-300",
        icon: (
          <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ),
        text: "Saving changes...",
        dot: "bg-blue-500 dark:bg-blue-400 animate-pulse"
      }
    }

    if (hasUnsavedChanges) {
      return {
        bgClass: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800",
        textClass: "text-amber-700 dark:text-amber-300",
        icon: (
          <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
        text: "Unsaved changes",
        dot: "bg-amber-500 dark:bg-amber-400 animate-bounce"
      }
    }

    return {
      bgClass: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800",
      textClass: "text-green-700 dark:text-green-300",
      icon: (
        <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      text: "All changes saved",
      dot: "bg-green-500 dark:bg-green-400"
    }
  }

  const status = getStatusContent()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isSaving ? 'saving' : hasUnsavedChanges ? 'unsaved' : 'saved'}
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${status.bgClass} shadow-sm transition-all duration-300 hover:shadow-md`}
      >
        {/* Status Dot */}
        <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
        
        {/* Icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isSaving ? 360 : 0 }}
          transition={{ duration: isSaving ? 1 : 0.3, repeat: isSaving ? Infinity : 0, ease: "linear" }}
        >
          {status.icon}
        </motion.div>
        
        {/* Text */}
        <span className={`text-sm font-semibold ${status.textClass}`}>
          {status.text}
        </span>
        
        {/* Saving Animation Dots */}
        {isSaving && (
          <div className="flex gap-1">
            <motion.div
              className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
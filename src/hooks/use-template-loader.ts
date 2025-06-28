'use client'

import { useState, useEffect, useCallback } from 'react'
import { IrishCVTemplateManager } from '@/lib/irish-cv-template-manager'

interface TemplateLoaderState {
  isLoading: boolean
  error: string | null
  isReady: boolean
  retryCount: number
}

export function useTemplateLoader() {
  const [state, setState] = useState<TemplateLoaderState>({
    isLoading: true,
    error: null,
    isReady: false,
    retryCount: 0
  })

  const [templateManager] = useState(() => new IrishCVTemplateManager())

  const loadTemplates = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Clear any stale service worker cache for templates
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          for (const cacheName of cacheNames) {
            if (cacheName.includes('template')) {
              await caches.delete(cacheName)
            }
          }
        } catch (e) {
          console.warn('Failed to clear template cache:', e)
        }
      }

      // Verify template manager initialization
      const templates = templateManager.getAllTemplates()
      if (!templates || templates.length === 0) {
        throw new Error('No templates available. Please refresh the page.')
      }

      // Test loading a template
      const testTemplateId = 'classic'
      const success = templateManager.selectTemplate(testTemplateId)
      if (!success) {
        throw new Error('Failed to initialize template system')
      }

      // Add a small delay to ensure DOM stability
      await new Promise(resolve => setTimeout(resolve, 200))

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isReady: true,
        error: null 
      }))

    } catch (error) {
      console.error('Template loading error:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load templates'

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }))

      // Auto-retry up to 3 times with exponential backoff
      if (state.retryCount < 3) {
        const delay = Math.pow(2, state.retryCount) * 1000
        setTimeout(() => loadTemplates(), delay)
      }
    }
  }, [templateManager, state.retryCount])

  useEffect(() => {
    loadTemplates()
  }, [])

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }))
    loadTemplates()
  }, [loadTemplates])

  return {
    ...state,
    templateManager,
    retry
  }
}
'use client'

import { useEffect } from 'react'

export default function HydrationFix() {
  useEffect(() => {
    // Remove problematic attributes added by browser extensions
    const removeExtensionAttributes = () => {
      // Remove ColorZilla attributes
      if (document.body.hasAttribute('cz-shortcut-listen')) {
        document.body.removeAttribute('cz-shortcut-listen')
      }
      
      // Remove Grammarly attributes
      if (document.body.hasAttribute('data-gramm')) {
        document.body.removeAttribute('data-gramm')
      }
      if (document.body.hasAttribute('data-gramm_editor')) {
        document.body.removeAttribute('data-gramm_editor')
      }
      
      // Remove other common extension attributes
      if (document.body.hasAttribute('data-new-gr-c-s-check-loaded')) {
        document.body.removeAttribute('data-new-gr-c-s-check-loaded')
      }
      if (document.body.hasAttribute('data-gr-ext-installed')) {
        document.body.removeAttribute('data-gr-ext-installed')
      }
    }

    // Remove attributes on initial load
    removeExtensionAttributes()

    // Watch for attribute changes and remove them
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          const attributeName = mutation.attributeName
          if (attributeName && (
            attributeName.includes('cz-') ||
            attributeName.includes('gramm') ||
            attributeName.includes('gr-') ||
            attributeName.includes('data-new-gr') ||
            attributeName.includes('scrnli_recorder')
          )) {
            document.body.removeAttribute(attributeName)
          }
        }
      })
    })

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['cz-shortcut-listen', 'data-gramm', 'data-gramm_editor', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
} 
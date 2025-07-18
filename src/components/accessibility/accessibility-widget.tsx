'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Eye, 
  Type, 
  Volume2, 
  Keyboard,
  X,
  Check
} from 'lucide-react'
import useAccessibility from '@/hooks/use-accessibility'

interface AccessibilityWidgetProps {
  className?: string
}

export default function AccessibilityWidget({ className }: AccessibilityWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const {
    preferences,
    togglePreference,
    announce,
    skipToMain,
    shouldReduceMotion,
    shouldUseHighContrast,
    isUsingScreenReader
  } = useAccessibility()
  
  // Hide accessibility widget on CV Builder pages to avoid conflicts with Speed Dial FAB
  const isHiddenPage = pathname?.startsWith('/cv-builder') || 
                       pathname?.startsWith('/builder') ||
                       pathname?.includes('cv-builder')
  
  // Don't render on CV Builder pages (after all hooks are called)
  if (isHiddenPage) {
    return null
  }

  const handleToggle = (key: keyof typeof preferences, label: string) => {
    togglePreference(key)
    const status = preferences[key] ? 'disabled' : 'enabled'
    announce(`${label} ${status}`)
  }

  const accessibilityOptions = [
    {
      key: 'highContrast' as const,
      icon: Eye,
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility'
    },
    {
      key: 'largeText' as const,
      icon: Type,
      label: 'Large Text',
      description: 'Increase font size for easier reading'
    },
    {
      key: 'reduceMotion' as const,
      icon: Settings,
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions'
    },
    {
      key: 'enhancedFocus' as const,
      icon: Keyboard,
      label: 'Enhanced Focus',
      description: 'Show clear focus indicators'
    },
    {
      key: 'screenReader' as const,
      icon: Volume2,
      label: 'Screen Reader',
      description: 'Optimize for screen reader use'
    }
  ]

  if (!isOpen) {
    return (
      <>
        {/* Accessibility button - only visible on mobile/tablet */}
        <div 
          className="md:hidden fixed bottom-4 right-4 z-50" 
          style={{ 
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 50
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
              
              // Disable smooth scrolling temporarily
              const html = document.documentElement
              const originalScrollBehavior = html.style.scrollBehavior
              html.style.scrollBehavior = 'auto'
              
              setIsOpen(true)
              
              // Restore scroll behavior after a brief delay
              setTimeout(() => {
                html.style.scrollBehavior = originalScrollBehavior
              }, 100)
              
              return false
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            type="button"
            className="rounded-full p-3 shadow-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Open accessibility settings"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop - mobilde tam ekran kapla */}
      <div 
        className="md:hidden fixed inset-0 bg-black/20 z-40" 
        onClick={() => setIsOpen(false)}
        style={{ position: 'fixed' }}
      />
      
      {/* Panel - mobilde alt kısımdan çık, tablet+ da köşede göster */}
      <Card className="fixed z-50 shadow-xl md:hidden bottom-0 left-0 right-0 rounded-t-lg rounded-b-none max-h-[70vh] overflow-y-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold">Accessibility</h3>
              {isUsingScreenReader && (
                <Badge variant="secondary" size="sm">SR</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility settings"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Quick Skip */}
            <Button
              variant="outline"
              size="sm"
              onClick={skipToMain}
              className="w-full justify-start"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Skip to Main Content
            </Button>

            {/* Accessibility Options */}
            {accessibilityOptions.map((option) => {
              const IconComponent = option.icon
              const isEnabled = preferences[option.key]
              
              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggle(option.key, option.label)}
                    className="ml-3 flex-shrink-0 min-w-[60px]"
                    aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${option.label}`}
                  >
                    {isEnabled ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">Off</span>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Status Indicators */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {shouldUseHighContrast && (
                <Badge variant="secondary" size="sm">High Contrast</Badge>
              )}
              {shouldReduceMotion && (
                <Badge variant="secondary" size="sm">Reduced Motion</Badge>
              )}
              {preferences.largeText && (
                <Badge variant="secondary" size="sm">Large Text</Badge>
              )}
              {preferences.enhancedFocus && (
                <Badge variant="secondary" size="sm">Enhanced Focus</Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = '/accessibility'
              }}
              className="text-sm"
            >
              Full Accessibility Center
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </>
  )
}

// CSS for accessibility features
export const AccessibilityCSS = () => (
  <style jsx global>{`
    /* High Contrast Mode */
    .high-contrast {
      filter: contrast(150%) brightness(110%);
    }
    
    .high-contrast img,
    .high-contrast video {
      filter: contrast(120%);
    }

    /* Large Text Mode */
    .large-text {
      font-size: 120% !important;
      line-height: 1.6 !important;
    }
    
    .large-text h1 { font-size: 2.5rem !important; }
    .large-text h2 { font-size: 2rem !important; }
    .large-text h3 { font-size: 1.75rem !important; }
    .large-text h4 { font-size: 1.5rem !important; }
    .large-text h5 { font-size: 1.25rem !important; }
    .large-text h6 { font-size: 1.1rem !important; }

    /* Reduced Motion Mode */
    .reduce-motion *,
    .reduce-motion *::before,
    .reduce-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /* Enhanced Focus Mode */
    .enhanced-focus *:focus {
      outline: 3px solid #2563eb !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.2) !important;
    }
    
    .enhanced-focus button:focus,
    .enhanced-focus a:focus,
    .enhanced-focus input:focus,
    .enhanced-focus textarea:focus,
    .enhanced-focus select:focus {
      transform: scale(1.05) !important;
      z-index: 10 !important;
      position: relative !important;
    }

    /* Screen Reader Mode */
    .screen-reader-active .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    /* Keyboard Navigation Mode */
    .keyboard-navigation {
      /* Additional keyboard-specific styles */
    }
    
    .keyboard-navigation :focus {
      outline: 2px solid #2563eb !important;
      outline-offset: 2px !important;
    }

    /* Skip links */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #2563eb;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
    }
    
    .skip-link:focus {
      top: 6px;
    }

    /* Print styles for accessibility */
    @media print {
      .high-contrast {
        filter: none !important;
      }
      
      .reduce-motion * {
        animation: none !important;
        transition: none !important;
      }
    }
  `}</style>
)
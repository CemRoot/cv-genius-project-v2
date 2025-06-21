'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  Smartphone, 
  Brain,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react'
import AccessibilityPanel from '@/components/accessibility/accessibility-panel'

const ACCESSIBILITY_FEATURES = [
  {
    icon: Eye,
    title: 'Visual Accessibility',
    description: 'High contrast, color blind support, and zoom features',
    features: ['High contrast mode', 'Color blind friendly design', 'Zoom support up to 200%', 'Clear focus indicators']
  },
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    description: 'Full keyboard support for all interactive elements',
    features: ['Tab navigation', 'Skip links', 'Keyboard shortcuts', 'Focus management']
  },
  {
    icon: Volume2,
    title: 'Screen Reader Support',
    description: 'Semantic HTML and ARIA labels for assistive technology',
    features: ['Semantic markup', 'ARIA labels', 'Alt text for images', 'Proper heading structure']
  },
  {
    icon: Smartphone,
    title: 'Mobile Accessibility',
    description: 'Touch-friendly design optimized for mobile devices',
    features: ['44px+ touch targets', 'Gesture alternatives', 'Orientation support', 'Voice control ready']
  },
  {
    icon: Brain,
    title: 'Cognitive Support',
    description: 'Clear language and reduced cognitive load',
    features: ['Simple language', 'Clear instructions', 'Error prevention', 'Consistent navigation']
  }
]

const QUICK_SETTINGS = [
  { id: 'high-contrast', label: 'High Contrast', description: 'Increase color contrast for better visibility' },
  { id: 'large-text', label: 'Large Text', description: 'Increase font size for easier reading' },
  { id: 'reduce-motion', label: 'Reduce Motion', description: 'Minimize animations and transitions' },
  { id: 'focus-indicators', label: 'Enhanced Focus', description: 'Show clear focus indicators' }
]

export default function AccessibilityPage() {
  const [showPanel, setShowPanel] = useState(false)
  const [settings, setSettings] = useState<Record<string, boolean>>({
    'high-contrast': false,
    'large-text': false,
    'reduce-motion': false,
    'focus-indicators': true
  })

  const toggleSetting = (settingId: string) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }))

    // Apply the setting
    const body = document.body
    
    switch (settingId) {
      case 'high-contrast':
        body.classList.toggle('high-contrast', !settings[settingId])
        break
      case 'large-text':
        body.classList.toggle('large-text', !settings[settingId])
        break
      case 'reduce-motion':
        body.classList.toggle('reduce-motion', !settings[settingId])
        break
      case 'focus-indicators':
        body.classList.toggle('enhanced-focus', !settings[settingId])
        break
    }
  }

  if (showPanel) {
    return <AccessibilityPanel onClose={() => setShowPanel(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Accessibility Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CVGenius is designed to be accessible to everyone. Customize your experience and 
            test our accessibility features to ensure the best possible experience.
          </p>
        </div>

        {/* Quick Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <CardDescription>
              Customize your experience with these accessibility options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {QUICK_SETTINGS.map((setting) => (
                <div 
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                  <Button
                    variant={settings[setting.id] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSetting(setting.id)}
                  >
                    {settings[setting.id] ? 'Enabled' : 'Enable'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Testing</CardTitle>
            <CardDescription>
              Run comprehensive accessibility tests to ensure WCAG compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-gray-700 mb-2">
                  Test this page and the entire CVGenius application for accessibility compliance.
                  Our tests check for WCAG 2.1 AAA standards including color contrast, keyboard navigation,
                  screen reader compatibility, and mobile accessibility.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">WCAG 2.1</Badge>
                  <Badge variant="outline">AAA Compliance</Badge>
                  <Badge variant="outline">Mobile Optimized</Badge>
                  <Badge variant="outline">Screen Reader Ready</Badge>
                </div>
              </div>
              <Button 
                onClick={() => setShowPanel(true)}
                className="whitespace-nowrap"
              >
                Run Accessibility Tests
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACCESSIBILITY_FEATURES.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-purple-600" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Help & Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Skip to main content</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Tab</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Navigate buttons</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Enter/Space</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Navigate forms</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Tab/Shift+Tab</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Close dialogs</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Esc</code>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Browser Support</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Chrome 90+ (Full support)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Firefox 88+ (Full support)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Safari 14+ (Full support)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Edge 90+ (Full support)
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you're experiencing any accessibility issues or need assistance using CVGenius,
                please don't hesitate to contact our support team.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  Report Issue
                </Button>
                <Button variant="outline" size="sm">
                  Accessibility Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility CSS */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%);
        }
        
        .large-text {
          font-size: 120% !important;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .enhanced-focus *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  )
}
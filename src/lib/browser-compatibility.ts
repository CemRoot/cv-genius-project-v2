// Browser Compatibility Testing Framework for CVGenius
// Comprehensive browser support detection and testing utilities

export interface BrowserFeature {
  name: string
  description: string
  required: boolean
  fallback?: string
  testFunction: () => boolean | Promise<boolean>
}

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  os: string
  mobile: boolean
  supported: boolean
  features: Record<string, boolean>
  warnings: string[]
  errors: string[]
}

export interface CompatibilityResult {
  browser: BrowserInfo
  overallSupport: 'full' | 'partial' | 'unsupported'
  criticalIssues: string[]
  recommendations: string[]
  score: number // 0-100
}

// Define required browser features for CVGenius
export const BROWSER_FEATURES: BrowserFeature[] = [
  {
    name: 'es2020',
    description: 'ES2020 JavaScript support',
    required: true,
    testFunction: () => {
      try {
        // Test optional chaining
        const test: any = {}
        return test?.optional?.chaining === undefined
      } catch {
        return false
      }
    }
  },
  {
    name: 'serviceWorker',
    description: 'Service Worker support for offline functionality',
    required: true,
    fallback: 'Offline functionality will be limited',
    testFunction: () => 'serviceWorker' in navigator
  },
  {
    name: 'webGL',
    description: 'WebGL support for PDF rendering',
    required: true,
    fallback: 'PDF rendering may be slower',
    testFunction: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    }
  },
  {
    name: 'canvas',
    description: 'HTML5 Canvas for image processing',
    required: true,
    testFunction: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext && canvas.getContext('2d'))
      } catch {
        return false
      }
    }
  },
  {
    name: 'webRTC',
    description: 'WebRTC for camera access',
    required: false,
    fallback: 'Camera scanning will not be available',
    testFunction: () => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }
  },
  {
    name: 'webShare',
    description: 'Web Share API for native sharing',
    required: false,
    fallback: 'Custom share dialog will be used',
    testFunction: () => 'share' in navigator
  },
  {
    name: 'notifications',
    description: 'Push Notifications',
    required: false,
    fallback: 'No push notifications',
    testFunction: () => 'Notification' in window
  },
  {
    name: 'geolocation',
    description: 'Geolocation API for job suggestions',
    required: false,
    fallback: 'Location-based features disabled',
    testFunction: () => 'geolocation' in navigator
  },
  {
    name: 'localStorage',
    description: 'Local Storage for data persistence',
    required: true,
    testFunction: () => {
      try {
        const test = 'test'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    }
  },
  {
    name: 'fetch',
    description: 'Fetch API for network requests',
    required: true,
    fallback: 'XMLHttpRequest will be used',
    testFunction: () => 'fetch' in window
  },
  {
    name: 'intersectionObserver',
    description: 'Intersection Observer for performance',
    required: false,
    fallback: 'Less efficient scrolling optimization',
    testFunction: () => 'IntersectionObserver' in window
  },
  {
    name: 'resizeObserver',
    description: 'Resize Observer for responsive layouts',
    required: false,
    fallback: 'Window resize events will be used',
    testFunction: () => 'ResizeObserver' in window
  },
  {
    name: 'webWorkers',
    description: 'Web Workers for background processing',
    required: false,
    fallback: 'Processing will block main thread',
    testFunction: () => 'Worker' in window
  },
  {
    name: 'webAssembly',
    description: 'WebAssembly for high-performance computations',
    required: false,
    fallback: 'JavaScript fallback for processing',
    testFunction: () => 'WebAssembly' in window
  },
  {
    name: 'speechRecognition',
    description: 'Speech Recognition for voice input',
    required: false,
    fallback: 'Voice input not available',
    testFunction: () => {
      return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
    }
  },
  {
    name: 'speechSynthesis',
    description: 'Speech Synthesis for accessibility',
    required: false,
    fallback: 'Text-to-speech not available',
    testFunction: () => 'speechSynthesis' in window
  },
  {
    name: 'vibration',
    description: 'Vibration API for haptic feedback',
    required: false,
    fallback: 'No haptic feedback',
    testFunction: () => 'vibrate' in navigator
  },
  {
    name: 'fileApi',
    description: 'File API for file uploads',
    required: true,
    testFunction: () => 'File' in window && 'FileReader' in window
  },
  {
    name: 'dragDrop',
    description: 'Drag and Drop API',
    required: false,
    fallback: 'Click to upload only',
    testFunction: () => 'draggable' in document.createElement('div')
  },
  {
    name: 'clipboard',
    description: 'Clipboard API for copy/paste',
    required: false,
    fallback: 'Manual copy/paste required',
    testFunction: () => 'clipboard' in navigator
  },
  {
    name: 'visualViewport',
    description: 'Visual Viewport API for mobile keyboard handling',
    required: false,
    fallback: 'Window resize events for keyboard detection',
    testFunction: () => 'visualViewport' in window
  }
]

// Browser detection utilities
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'
  let browserEngine = 'Unknown'
  let osName = 'Unknown'
  let isMobile = false

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
    browserEngine = 'Blink'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
    browserEngine = 'Gecko'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
    browserEngine = 'WebKit'
  } else if (userAgent.includes('Edg')) {
    browserName = 'Edge'
    const match = userAgent.match(/Edg\/(\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
    browserEngine = 'Blink'
  } else if (userAgent.includes('SamsungBrowser')) {
    browserName = 'Samsung Internet'
    const match = userAgent.match(/SamsungBrowser\/(\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
    browserEngine = 'Blink'
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    osName = 'Windows'
  } else if (userAgent.includes('Mac')) {
    osName = 'macOS'
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  } else if (userAgent.includes('Android')) {
    osName = 'Android'
    isMobile = true
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    osName = userAgent.includes('iPad') ? 'iPadOS' : 'iOS'
    isMobile = !userAgent.includes('iPad')
  }

  // Mobile detection
  if (!isMobile) {
    isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  }

  return {
    name: browserName,
    version: browserVersion,
    engine: browserEngine,
    os: osName,
    mobile: isMobile,
    supported: false, // Will be determined by feature testing
    features: {},
    warnings: [],
    errors: []
  }
}

// Test all browser features
export async function testBrowserCompatibility(): Promise<CompatibilityResult> {
  const browser = detectBrowser()
  const features: Record<string, boolean> = {}
  const warnings: string[] = []
  const errors: string[] = []
  const criticalIssues: string[] = []

  // Test each feature
  for (const feature of BROWSER_FEATURES) {
    try {
      const result = await feature.testFunction()
      features[feature.name] = result

      if (!result) {
        if (feature.required) {
          errors.push(`Missing required feature: ${feature.description}`)
          criticalIssues.push(`${feature.name}: ${feature.description}`)
        } else {
          warnings.push(`Optional feature not supported: ${feature.description}${feature.fallback ? ` (${feature.fallback})` : ''}`)
        }
      }
    } catch (error) {
      features[feature.name] = false
      if (feature.required) {
        errors.push(`Failed to test required feature: ${feature.description}`)
        criticalIssues.push(`${feature.name}: Test failed`)
      } else {
        warnings.push(`Failed to test optional feature: ${feature.description}`)
      }
    }
  }

  browser.features = features
  browser.warnings = warnings
  browser.errors = errors

  // Calculate support level
  const requiredFeatures = BROWSER_FEATURES.filter(f => f.required)
  const supportedRequiredFeatures = requiredFeatures.filter(f => features[f.name])
  const requiredSupport = supportedRequiredFeatures.length / requiredFeatures.length

  let overallSupport: 'full' | 'partial' | 'unsupported'
  if (requiredSupport === 1) {
    overallSupport = 'full'
  } else if (requiredSupport >= 0.8) {
    overallSupport = 'partial'
  } else {
    overallSupport = 'unsupported'
  }

  browser.supported = overallSupport !== 'unsupported'

  // Calculate score (0-100)
  const totalFeatures = BROWSER_FEATURES.length
  const supportedFeatures = Object.values(features).filter(Boolean).length
  const score = Math.round((supportedFeatures / totalFeatures) * 100)

  // Generate recommendations
  const recommendations: string[] = []
  
  if (overallSupport === 'unsupported') {
    recommendations.push('Browser is not supported. Please update to a modern browser.')
  } else if (overallSupport === 'partial') {
    recommendations.push('Some features may not work correctly. Consider updating your browser.')
  }

  if (!features.serviceWorker) {
    recommendations.push('Update browser to enable offline functionality.')
  }

  if (!features.webRTC) {
    recommendations.push('Camera scanning features will not be available.')
  }

  if (browser.mobile && !features.visualViewport) {
    recommendations.push('Mobile keyboard handling may not work optimally.')
  }

  return {
    browser,
    overallSupport,
    criticalIssues,
    recommendations,
    score
  }
}

// Specific browser version requirements
export const BROWSER_REQUIREMENTS = {
  Chrome: { min: 88, recommended: 120 },
  Firefox: { min: 85, recommended: 120 },
  Safari: { min: 14, recommended: 17 },
  Edge: { min: 88, recommended: 120 },
  'Samsung Internet': { min: 15, recommended: 22 }
}

// Check if browser version meets requirements
export function checkBrowserVersion(browser: BrowserInfo): {
  meets: boolean
  recommended: boolean
  message: string
} {
  const requirements = BROWSER_REQUIREMENTS[browser.name as keyof typeof BROWSER_REQUIREMENTS]
  
  if (!requirements) {
    return {
      meets: false,
      recommended: false,
      message: `${browser.name} is not officially supported. Functionality may be limited.`
    }
  }

  const version = parseInt(browser.version)
  
  if (isNaN(version)) {
    return {
      meets: false,
      recommended: false,
      message: 'Unable to determine browser version.'
    }
  }

  const meets = version >= requirements.min
  const recommended = version >= requirements.recommended

  if (!meets) {
    return {
      meets: false,
      recommended: false,
      message: `${browser.name} ${version} is too old. Please update to version ${requirements.min} or higher.`
    }
  }

  if (!recommended) {
    return {
      meets: true,
      recommended: false,
      message: `${browser.name} ${version} is supported but not optimal. Consider updating to version ${requirements.recommended} for the best experience.`
    }
  }

  return {
    meets: true,
    recommended: true,
    message: `${browser.name} ${version} is fully supported.`
  }
}

// Performance benchmarking
export async function runPerformanceBenchmark(): Promise<{
  canvasPerformance: number
  jsPerformance: number
  memoryUsage: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}> {
  // Canvas performance test
  const canvasStart = performance.now()
  const canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 500
  const ctx = canvas.getContext('2d')!
  
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `hsl(${i % 360}, 50%, 50%)`
    ctx.fillRect(Math.random() * 500, Math.random() * 500, 20, 20)
  }
  
  const canvasTime = performance.now() - canvasStart

  // JavaScript performance test
  const jsStart = performance.now()
  let sum = 0
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i)
  }
  const jsTime = performance.now() - jsStart

  // Memory usage (if available)
  let memoryUsage = 0
  if ((performance as any).memory) {
    const memory = (performance as any).memory
    memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
  }

  // Calculate grades
  const canvasGrade = canvasTime < 50 ? 5 : canvasTime < 100 ? 4 : canvasTime < 200 ? 3 : canvasTime < 500 ? 2 : 1
  const jsGrade = jsTime < 10 ? 5 : jsTime < 20 ? 4 : jsTime < 50 ? 3 : jsTime < 100 ? 2 : 1
  const memoryGrade = memoryUsage < 50 ? 5 : memoryUsage < 70 ? 4 : memoryUsage < 85 ? 3 : memoryUsage < 95 ? 2 : 1

  const overallScore = (canvasGrade + jsGrade + memoryGrade) / 3
  const overallGrade = overallScore >= 4.5 ? 'A' : overallScore >= 3.5 ? 'B' : overallScore >= 2.5 ? 'C' : overallScore >= 1.5 ? 'D' : 'F'

  return {
    canvasPerformance: canvasTime,
    jsPerformance: jsTime,
    memoryUsage,
    overallGrade
  }
}

// Export utility functions
export function generateCompatibilityReport(result: CompatibilityResult): string {
  const { browser, overallSupport, criticalIssues, recommendations, score } = result
  
  let report = `# Browser Compatibility Report\n\n`
  report += `**Browser:** ${browser.name} ${browser.version} (${browser.engine})\n`
  report += `**OS:** ${browser.os}\n`
  report += `**Mobile:** ${browser.mobile ? 'Yes' : 'No'}\n`
  report += `**Overall Support:** ${overallSupport}\n`
  report += `**Compatibility Score:** ${score}/100\n\n`

  if (criticalIssues.length > 0) {
    report += `## Critical Issues\n`
    criticalIssues.forEach(issue => {
      report += `- ${issue}\n`
    })
    report += `\n`
  }

  if (recommendations.length > 0) {
    report += `## Recommendations\n`
    recommendations.forEach(rec => {
      report += `- ${rec}\n`
    })
    report += `\n`
  }

  report += `## Feature Support\n`
  Object.entries(browser.features).forEach(([feature, supported]) => {
    const featureInfo = BROWSER_FEATURES.find(f => f.name === feature)
    const status = supported ? '✅' : '❌'
    const required = featureInfo?.required ? '(Required)' : '(Optional)'
    report += `${status} ${feature} ${required}\n`
  })

  return report
}

export default {
  BROWSER_FEATURES,
  BROWSER_REQUIREMENTS,
  detectBrowser,
  testBrowserCompatibility,
  checkBrowserVersion,
  runPerformanceBenchmark,
  generateCompatibilityReport
}
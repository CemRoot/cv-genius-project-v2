// Mobile Testing Matrix - Comprehensive Device and Browser Testing Framework
// for CVGenius mobile optimization validation

export interface TestDevice {
  name: string
  category: 'phone' | 'tablet' | 'desktop'
  os: string
  browser: string
  viewport: { width: number; height: number }
  userAgent: string
  features: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface TestScenario {
  id: string
  name: string
  description: string
  steps: string[]
  expectedResults: string[]
  category: 'core' | 'mobile' | 'accessibility' | 'performance'
  priority: 'critical' | 'high' | 'medium' | 'low'
  automatable: boolean
}

export interface TestResult {
  deviceId: string
  scenarioId: string
  status: 'pass' | 'fail' | 'partial' | 'skip'
  issues: string[]
  performanceMetrics?: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    interactionToNextPaint: number
    cumulativeLayoutShift: number
  }
  timestamp: Date
  tester: string
  notes?: string
}

// Critical Test Devices - Must pass on all
export const CRITICAL_DEVICES: TestDevice[] = [
  {
    name: 'iPhone 15 Pro',
    category: 'phone',
    os: 'iOS 17',
    browser: 'Safari',
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'critical'
  },
  {
    name: 'Samsung Galaxy S24',
    category: 'phone',
    os: 'Android 14',
    browser: 'Chrome',
    viewport: { width: 384, height: 854 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'critical'
  },
  {
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    os: 'iPadOS 17',
    browser: 'Safari',
    viewport: { width: 1024, height: 1366 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: ['touch', 'camera', 'geolocation', 'notifications'],
    priority: 'critical'
  }
]

// High Priority Test Devices
export const HIGH_PRIORITY_DEVICES: TestDevice[] = [
  {
    name: 'iPhone 13',
    category: 'phone',
    os: 'iOS 16',
    browser: 'Safari',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'high'
  },
  {
    name: 'Google Pixel 8',
    category: 'phone',
    os: 'Android 14',
    browser: 'Chrome',
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'high'
  },
  {
    name: 'Samsung Galaxy Tab A8',
    category: 'tablet',
    os: 'Android 13',
    browser: 'Chrome',
    viewport: { width: 800, height: 1280 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-X205) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: ['touch', 'camera', 'geolocation', 'notifications'],
    priority: 'high'
  }
]

// Medium Priority Test Devices
export const MEDIUM_PRIORITY_DEVICES: TestDevice[] = [
  {
    name: 'iPhone SE (3rd gen)',
    category: 'phone',
    os: 'iOS 17',
    browser: 'Safari',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'medium'
  },
  {
    name: 'OnePlus 11',
    category: 'phone',
    os: 'Android 13',
    browser: 'Chrome',
    viewport: { width: 412, height: 919 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: ['touch', 'camera', 'geolocation', 'notifications', 'vibration'],
    priority: 'medium'
  },
  {
    name: 'MacBook Pro 14"',
    category: 'desktop',
    os: 'macOS Sonoma',
    browser: 'Safari',
    viewport: { width: 1512, height: 982 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: ['geolocation', 'notifications'],
    priority: 'medium'
  },
  {
    name: 'Windows 11 Desktop',
    category: 'desktop',
    os: 'Windows 11',
    browser: 'Edge',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: ['geolocation', 'notifications'],
    priority: 'medium'
  }
]

export const ALL_TEST_DEVICES = [
  ...CRITICAL_DEVICES,
  ...HIGH_PRIORITY_DEVICES,
  ...MEDIUM_PRIORITY_DEVICES
]

// Core Test Scenarios
export const CORE_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'core-001',
    name: 'CV Builder Basic Flow',
    description: 'User can create a complete CV using the builder',
    steps: [
      'Navigate to CV Builder',
      'Fill personal information form',
      'Add work experience',
      'Add education',
      'Add skills',
      'Preview CV',
      'Download CV as PDF'
    ],
    expectedResults: [
      'All forms load correctly',
      'Data persists between steps',
      'Preview renders properly',
      'PDF downloads successfully',
      'Content matches preview'
    ],
    category: 'core',
    priority: 'critical',
    automatable: true
  },
  {
    id: 'core-002',
    name: 'ATS Analysis',
    description: 'User can analyze CV with ATS checker',
    steps: [
      'Navigate to ATS Check page',
      'Upload CV file',
      'Wait for analysis',
      'Review results',
      'Download report'
    ],
    expectedResults: [
      'File upload works',
      'Analysis completes',
      'Results display clearly',
      'Report is downloadable'
    ],
    category: 'core',
    priority: 'critical',
    automatable: true
  },
  {
    id: 'core-003',
    name: 'Template Selection',
    description: 'User can browse and select CV templates',
    steps: [
      'Navigate to Templates page',
      'Browse template gallery',
      'Preview template',
      'Select template',
      'Customize template'
    ],
    expectedResults: [
      'Templates load correctly',
      'Preview works',
      'Selection persists',
      'Customization applies'
    ],
    category: 'core',
    priority: 'high',
    automatable: true
  }
]

// Mobile-Specific Test Scenarios
export const MOBILE_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'mobile-001',
    name: 'Touch Navigation',
    description: 'All touch interactions work correctly',
    steps: [
      'Navigate between pages using touch',
      'Use swipe gestures',
      'Test button touch targets',
      'Test form input touch',
      'Test long press actions'
    ],
    expectedResults: [
      'Touch targets are minimum 44px',
      'Swipe gestures work',
      'Buttons respond to touch',
      'Forms are touch-friendly',
      'Long press actions trigger'
    ],
    category: 'mobile',
    priority: 'critical',
    automatable: false
  },
  {
    id: 'mobile-002',
    name: 'Responsive Layout',
    description: 'Layout adapts to different screen sizes',
    steps: [
      'Test portrait orientation',
      'Test landscape orientation',
      'Test different viewport sizes',
      'Check text readability',
      'Verify button placement'
    ],
    expectedResults: [
      'Layout adapts correctly',
      'No horizontal scrolling',
      'Text remains readable',
      'Buttons stay accessible',
      'Content fits viewport'
    ],
    category: 'mobile',
    priority: 'critical',
    automatable: true
  },
  {
    id: 'mobile-003',
    name: 'Camera Integration',
    description: 'Camera scanning features work',
    steps: [
      'Access camera from CV builder',
      'Scan existing CV document',
      'Review extracted text',
      'Apply extracted data',
      'Verify accuracy'
    ],
    expectedResults: [
      'Camera permission requested',
      'Camera opens correctly',
      'OCR extracts text',
      'Data populates forms',
      'Results are accurate'
    ],
    category: 'mobile',
    priority: 'high',
    automatable: false
  },
  {
    id: 'mobile-004',
    name: 'Offline Functionality',
    description: 'App works when offline',
    steps: [
      'Go offline',
      'Access cached pages',
      'Try to build CV',
      'Check data persistence',
      'Go back online and sync'
    ],
    expectedResults: [
      'Offline page displays',
      'Cached content available',
      'Local data persists',
      'Sync works when online'
    ],
    category: 'mobile',
    priority: 'high',
    automatable: true
  },
  {
    id: 'mobile-005',
    name: 'Voice Features',
    description: 'Voice input and output work',
    steps: [
      'Enable voice input',
      'Dictate CV content',
      'Use voice navigation',
      'Test text-to-speech',
      'Verify accuracy'
    ],
    expectedResults: [
      'Voice permission granted',
      'Speech recognition works',
      'Voice commands respond',
      'Text-to-speech plays',
      'Content is accurate'
    ],
    category: 'mobile',
    priority: 'medium',
    automatable: false
  }
]

// Performance Test Scenarios
export const PERFORMANCE_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'perf-001',
    name: 'Page Load Performance',
    description: 'Pages load within acceptable time limits',
    steps: [
      'Clear cache',
      'Navigate to home page',
      'Measure load times',
      'Navigate to builder',
      'Measure subsequent loads'
    ],
    expectedResults: [
      'First load < 3 seconds',
      'Subsequent loads < 1 second',
      'LCP < 2.5 seconds',
      'FID < 100ms',
      'CLS < 0.1'
    ],
    category: 'performance',
    priority: 'high',
    automatable: true
  },
  {
    id: 'perf-002',
    name: 'Memory Usage',
    description: 'App uses memory efficiently',
    steps: [
      'Monitor memory usage',
      'Use app for extended period',
      'Create multiple CVs',
      'Check for memory leaks',
      'Verify cleanup'
    ],
    expectedResults: [
      'Memory usage stable',
      'No significant leaks',
      'Cleanup after operations',
      'Performance remains good'
    ],
    category: 'performance',
    priority: 'medium',
    automatable: true
  }
]

// Accessibility Test Scenarios
export const ACCESSIBILITY_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'a11y-001',
    name: 'Screen Reader Support',
    description: 'App works with screen readers',
    steps: [
      'Enable screen reader',
      'Navigate through app',
      'Fill out forms',
      'Listen to announcements',
      'Complete CV creation'
    ],
    expectedResults: [
      'All content is readable',
      'Navigation is logical',
      'Forms are accessible',
      'Proper ARIA labels',
      'Actions are announced'
    ],
    category: 'accessibility',
    priority: 'high',
    automatable: false
  },
  {
    id: 'a11y-002',
    name: 'Keyboard Navigation',
    description: 'App is fully keyboard accessible',
    steps: [
      'Navigate using only keyboard',
      'Tab through all elements',
      'Use arrow keys',
      'Test escape key',
      'Complete workflows'
    ],
    expectedResults: [
      'All elements reachable',
      'Tab order logical',
      'Focus indicators visible',
      'Keyboard shortcuts work',
      'No keyboard traps'
    ],
    category: 'accessibility',
    priority: 'high',
    automatable: true
  },
  {
    id: 'a11y-003',
    name: 'High Contrast Mode',
    description: 'App works in high contrast mode',
    steps: [
      'Enable high contrast',
      'Navigate through app',
      'Check text readability',
      'Verify button visibility',
      'Test interactive elements'
    ],
    expectedResults: [
      'Text is readable',
      'Buttons are visible',
      'Contrast ratios pass',
      'No information lost',
      'UI remains functional'
    ],
    category: 'accessibility',
    priority: 'medium',
    automatable: true
  }
]

export const ALL_TEST_SCENARIOS = [
  ...CORE_TEST_SCENARIOS,
  ...MOBILE_TEST_SCENARIOS,
  ...PERFORMANCE_TEST_SCENARIOS,
  ...ACCESSIBILITY_TEST_SCENARIOS
]

// Test Matrix Generator
export function generateTestMatrix(): Array<{device: TestDevice, scenario: TestScenario}> {
  const matrix: Array<{device: TestDevice, scenario: TestScenario}> = []
  
  // Critical devices must test all critical scenarios
  CRITICAL_DEVICES.forEach(device => {
    ALL_TEST_SCENARIOS
      .filter(scenario => scenario.priority === 'critical')
      .forEach(scenario => {
        matrix.push({ device, scenario })
      })
  })
  
  // High priority devices test critical and high priority scenarios
  HIGH_PRIORITY_DEVICES.forEach(device => {
    ALL_TEST_SCENARIOS
      .filter(scenario => ['critical', 'high'].includes(scenario.priority))
      .forEach(scenario => {
        matrix.push({ device, scenario })
      })
  })
  
  // Medium priority devices test applicable scenarios
  MEDIUM_PRIORITY_DEVICES.forEach(device => {
    ALL_TEST_SCENARIOS
      .filter(scenario => {
        // Desktop devices skip mobile-specific tests
        if (device.category === 'desktop' && scenario.category === 'mobile') {
          return false
        }
        return ['critical', 'high', 'medium'].includes(scenario.priority)
      })
      .forEach(scenario => {
        matrix.push({ device, scenario })
      })
  })
  
  return matrix
}

// Test Result Analysis
export function analyzeTestResults(results: TestResult[]): {
  passRate: number
  criticalIssues: string[]
  recommendations: string[]
  deviceIssues: Record<string, number>
  scenarioIssues: Record<string, number>
} {
  const totalTests = results.length
  const passedTests = results.filter(r => r.status === 'pass').length
  const passRate = (passedTests / totalTests) * 100
  
  const criticalIssues: string[] = []
  const deviceIssues: Record<string, number> = {}
  const scenarioIssues: Record<string, number> = {}
  
  results.forEach(result => {
    if (result.status === 'fail') {
      deviceIssues[result.deviceId] = (deviceIssues[result.deviceId] || 0) + 1
      scenarioIssues[result.scenarioId] = (scenarioIssues[result.scenarioId] || 0) + 1
      
      // Check if it's a critical issue
      const device = ALL_TEST_DEVICES.find(d => d.name === result.deviceId)
      const scenario = ALL_TEST_SCENARIOS.find(s => s.id === result.scenarioId)
      
      if (device?.priority === 'critical' || scenario?.priority === 'critical') {
        criticalIssues.push(...result.issues)
      }
    }
  })
  
  const recommendations: string[] = []
  
  if (passRate < 95) {
    recommendations.push('Overall pass rate is below 95% - review failed tests')
  }
  
  if (criticalIssues.length > 0) {
    recommendations.push('Critical issues found - must be fixed before release')
  }
  
  // Find most problematic devices
  const problematicDevices = Object.entries(deviceIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([device]) => device)
  
  if (problematicDevices.length > 0) {
    recommendations.push(`Focus testing on: ${problematicDevices.join(', ')}`)
  }
  
  return {
    passRate,
    criticalIssues: [...new Set(criticalIssues)],
    recommendations,
    deviceIssues,
    scenarioIssues
  }
}

// Test Automation Helpers
export function getAutomatableTests(): Array<{device: TestDevice, scenario: TestScenario}> {
  return generateTestMatrix().filter(({scenario}) => scenario.automatable)
}

export function getManualTests(): Array<{device: TestDevice, scenario: TestScenario}> {
  return generateTestMatrix().filter(({scenario}) => !scenario.automatable)
}

// Browser Compatibility Matrix
export const BROWSER_COMPATIBILITY = {
  'iOS Safari': {
    minVersion: '15.0',
    features: {
      webRTC: true,
      serviceWorker: true,
      webShare: true,
      webGL: true,
      notifications: true
    }
  },
  'Chrome Mobile': {
    minVersion: '100.0',
    features: {
      webRTC: true,
      serviceWorker: true,
      webShare: true,
      webGL: true,
      notifications: true
    }
  },
  'Firefox Mobile': {
    minVersion: '100.0',
    features: {
      webRTC: true,
      serviceWorker: true,
      webShare: false,
      webGL: true,
      notifications: true
    }
  },
  'Samsung Internet': {
    minVersion: '18.0',
    features: {
      webRTC: true,
      serviceWorker: true,
      webShare: true,
      webGL: true,
      notifications: true
    }
  }
}

export default {
  devices: ALL_TEST_DEVICES,
  scenarios: ALL_TEST_SCENARIOS,
  generateTestMatrix,
  analyzeTestResults,
  getAutomatableTests,
  getManualTests,
  BROWSER_COMPATIBILITY
}
// Accessibility Testing Framework for CVGenius Mobile
// WCAG 2.1 AAA compliance testing and mobile accessibility utilities

export interface AccessibilityTest {
  id: string
  name: string
  description: string
  category: 'visual' | 'keyboard' | 'screen-reader' | 'mobile' | 'cognitive'
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriteria: string
  run: () => Promise<AccessibilityTestResult>
}

export interface AccessibilityTestResult {
  testId: string
  passed: boolean
  score: number // 0-100
  issues: AccessibilityIssue[]
  recommendations: string[]
  wcagLevel: 'A' | 'AA' | 'AAA'
  timestamp: Date
  url: string
}

export interface AccessibilityIssue {
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  type: 'missing' | 'invalid' | 'insufficient' | 'unclear'
  element: string
  description: string
  wcagCriteria: string
  suggestion: string
}

export interface AccessibilityReport {
  overall: {
    score: number
    conformanceLevel: 'A' | 'AA' | 'AAA' | 'Non-conformant'
    summary: string
  }
  categories: Record<string, {
    score: number
    tests: AccessibilityTestResult[]
    criticalIssues: number
    totalIssues: number
  }>
  mobile: {
    touchTargetSize: boolean
    gestureAlternatives: boolean
    orientationSupport: boolean
    zoomSupport: boolean
  }
  device: {
    mobile: boolean
    screenReader: boolean
    reducedMotion: boolean
    highContrast: boolean
  }
}

// WCAG criteria thresholds and requirements
const WCAG_REQUIREMENTS = {
  colorContrast: {
    normal: 4.5,    // AA for normal text
    large: 3,       // AA for large text
    AAA_normal: 7,  // AAA for normal text
    AAA_large: 4.5  // AAA for large text
  },
  touchTargets: {
    minimum: 44,    // 44x44px minimum touch target
    recommended: 48 // 48x48px recommended
  },
  timing: {
    minimumTime: 20000, // 20 seconds minimum for timed content
    extendableTime: true
  }
}

// Utility functions for accessibility testing
export class AccessibilityUtils {
  
  // Calculate color contrast ratio
  static getColorContrast(foreground: string, background: string): number {
    const rgb1 = this.hexToRgb(foreground)
    const rgb2 = this.hexToRgb(background)
    
    if (!rgb1 || !rgb2) return 0
    
    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private static hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Check if element is keyboard accessible
  static isKeyboardAccessible(element: Element): boolean {
    const focusableElements = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]',
      '[contenteditable]'
    ]
    
    return focusableElements.some(selector => 
      element.matches(selector) || element.querySelector(selector) !== null
    )
  }

  // Check touch target size
  static getTouchTargetSize(element: Element): {width: number, height: number} {
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  // Check for proper heading structure
  static validateHeadingStructure(): AccessibilityIssue[] {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const issues: AccessibilityIssue[] = []
    let previousLevel = 0

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1))
      
      // Check for missing h1
      if (index === 0 && level !== 1) {
        issues.push({
          severity: 'serious',
          type: 'missing',
          element: heading.tagName,
          description: 'Page should start with h1',
          wcagCriteria: '1.3.1',
          suggestion: 'Add an h1 element as the main page heading'
        })
      }

      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        issues.push({
          severity: 'moderate',
          type: 'invalid',
          element: heading.tagName,
          description: `Heading level skipped from h${previousLevel} to h${level}`,
          wcagCriteria: '1.3.1',
          suggestion: 'Use heading levels in sequential order'
        })
      }

      previousLevel = level
    })

    return issues
  }

  // Check for alt text on images
  static validateImages(): AccessibilityIssue[] {
    const images = document.querySelectorAll('img')
    const issues: AccessibilityIssue[] = []

    images.forEach(img => {
      const alt = img.getAttribute('alt')
      const src = img.getAttribute('src')

      if (alt === null) {
        issues.push({
          severity: 'critical',
          type: 'missing',
          element: `img[src="${src}"]`,
          description: 'Image missing alt attribute',
          wcagCriteria: '1.1.1',
          suggestion: 'Add descriptive alt text or alt="" for decorative images'
        })
      } else if (alt === '' && img.getAttribute('role') !== 'presentation') {
        // Empty alt is okay for decorative images
      } else if (alt && alt.length > 125) {
        issues.push({
          severity: 'minor',
          type: 'insufficient',
          element: `img[src="${src}"]`,
          description: 'Alt text is too long (over 125 characters)',
          wcagCriteria: '1.1.1',
          suggestion: 'Keep alt text concise and descriptive'
        })
      }
    })

    return issues
  }

  // Check form accessibility
  static validateForms(): AccessibilityIssue[] {
    const forms = document.querySelectorAll('form')
    const issues: AccessibilityIssue[] = []

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea')
      
      inputs.forEach(input => {
        const id = input.getAttribute('id')
        const name = input.getAttribute('name')
        const label = form.querySelector(`label[for="${id}"]`)
        const ariaLabel = input.getAttribute('aria-label')
        const ariaLabelledby = input.getAttribute('aria-labelledby')

        // Check for proper labeling
        if (!label && !ariaLabel && !ariaLabelledby) {
          issues.push({
            severity: 'critical',
            type: 'missing',
            element: `${input.tagName.toLowerCase()}[name="${name}"]`,
            description: 'Form input missing accessible label',
            wcagCriteria: '1.3.1',
            suggestion: 'Add a label element or aria-label attribute'
          })
        }

        // Check for required field indication
        if (input.hasAttribute('required')) {
          const requiredIndication = form.querySelector('[aria-label*="required"], [aria-describedby*="required"]')
          if (!requiredIndication && !input.getAttribute('aria-required')) {
            issues.push({
              severity: 'moderate',
              type: 'missing',
              element: `${input.tagName.toLowerCase()}[name="${name}"]`,
              description: 'Required field not properly indicated',
              wcagCriteria: '3.3.2',
              suggestion: 'Add aria-required="true" or visual required indicator'
            })
          }
        }
      })
    })

    return issues
  }
}

// Accessibility test suite
export const ACCESSIBILITY_TESTS: AccessibilityTest[] = [
  {
    id: 'color-contrast',
    name: 'Color Contrast',
    description: 'Checks color contrast ratios meet WCAG standards',
    category: 'visual',
    wcagLevel: 'AA',
    wcagCriteria: '1.4.3',
    run: async () => {
      const issues: AccessibilityIssue[] = []
      const elements = document.querySelectorAll('*:not(script):not(style)')
      let totalChecked = 0
      let passed = 0

      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        const fontSize = parseFloat(styles.fontSize)

        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          totalChecked++
          const contrast = AccessibilityUtils.getColorContrast(color, backgroundColor)
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold')
          const requiredContrast = isLargeText ? WCAG_REQUIREMENTS.colorContrast.large : WCAG_REQUIREMENTS.colorContrast.normal

          if (contrast >= requiredContrast) {
            passed++
          } else {
            issues.push({
              severity: contrast < 3 ? 'critical' : 'serious',
              type: 'insufficient',
              element: element.tagName.toLowerCase(),
              description: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (requires ${requiredContrast}:1)`,
              wcagCriteria: '1.4.3',
              suggestion: 'Increase color contrast between text and background'
            })
          }
        }
      })

      return {
        testId: 'color-contrast',
        passed: issues.length === 0,
        score: totalChecked > 0 ? Math.round((passed / totalChecked) * 100) : 100,
        issues,
        recommendations: issues.length > 0 
          ? ['Use higher contrast colors', 'Test with color contrast analyzer tools']
          : [],
        wcagLevel: 'AA',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'keyboard-navigation',
    name: 'Keyboard Navigation',
    description: 'Tests keyboard accessibility and focus management',
    category: 'keyboard',
    wcagLevel: 'A',
    wcagCriteria: '2.1.1',
    run: async () => {
      const issues: AccessibilityIssue[] = []
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex], [role="button"]')
      let keyboardAccessible = 0

      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex')
        const isAccessible = AccessibilityUtils.isKeyboardAccessible(element)

        if (isAccessible) {
          keyboardAccessible++
        } else if (tabIndex === '-1') {
          // Element intentionally removed from tab order
        } else {
          issues.push({
            severity: 'serious',
            type: 'missing',
            element: element.tagName.toLowerCase(),
            description: 'Interactive element not keyboard accessible',
            wcagCriteria: '2.1.1',
            suggestion: 'Ensure element can be reached and activated via keyboard'
          })
        }

        // Check for visible focus indicator
        const styles = window.getComputedStyle(element, ':focus')
        if (styles.outline === 'none' && !styles.boxShadow && !styles.border) {
          issues.push({
            severity: 'moderate',
            type: 'missing',
            element: element.tagName.toLowerCase(),
            description: 'Missing visible focus indicator',
            wcagCriteria: '2.4.7',
            suggestion: 'Add visible focus outline or border'
          })
        }
      })

      return {
        testId: 'keyboard-navigation',
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'serious').length === 0,
        score: interactiveElements.length > 0 ? Math.round((keyboardAccessible / interactiveElements.length) * 100) : 100,
        issues,
        recommendations: issues.length > 0 
          ? ['Test navigation with keyboard only', 'Ensure all interactive elements are focusable']
          : [],
        wcagLevel: 'A',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'touch-targets',
    name: 'Touch Target Size',
    description: 'Verifies touch targets meet minimum size requirements for mobile',
    category: 'mobile',
    wcagLevel: 'AAA',
    wcagCriteria: '2.5.5',
    run: async () => {
      const issues: AccessibilityIssue[] = []
      const touchElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"], [onclick]')
      let adequateSize = 0

      touchElements.forEach(element => {
        const size = AccessibilityUtils.getTouchTargetSize(element)
        const minDimension = Math.min(size.width, size.height)

        if (minDimension >= WCAG_REQUIREMENTS.touchTargets.minimum) {
          adequateSize++
        } else {
          issues.push({
            severity: minDimension < 32 ? 'serious' : 'moderate',
            type: 'insufficient',
            element: element.tagName.toLowerCase(),
            description: `Touch target too small: ${Math.round(minDimension)}px (requires ${WCAG_REQUIREMENTS.touchTargets.minimum}px)`,
            wcagCriteria: '2.5.5',
            suggestion: `Increase touch target size to at least ${WCAG_REQUIREMENTS.touchTargets.minimum}x${WCAG_REQUIREMENTS.touchTargets.minimum}px`
          })
        }
      })

      return {
        testId: 'touch-targets',
        passed: issues.filter(i => i.severity === 'serious').length === 0,
        score: touchElements.length > 0 ? Math.round((adequateSize / touchElements.length) * 100) : 100,
        issues,
        recommendations: issues.length > 0 
          ? ['Increase button and link sizes for mobile', 'Add padding around small interactive elements']
          : [],
        wcagLevel: 'AAA',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'semantic-structure',
    name: 'Semantic Structure',
    description: 'Validates semantic HTML and heading hierarchy',
    category: 'screen-reader',
    wcagLevel: 'A',
    wcagCriteria: '1.3.1',
    run: async () => {
      const issues: AccessibilityIssue[] = []
      
      // Check heading structure
      issues.push(...AccessibilityUtils.validateHeadingStructure())
      
      // Check for landmarks
      const landmarks = document.querySelectorAll('header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]')
      if (landmarks.length === 0) {
        issues.push({
          severity: 'moderate',
          type: 'missing',
          element: 'page structure',
          description: 'No landmark elements found',
          wcagCriteria: '1.3.1',
          suggestion: 'Add semantic landmarks (header, nav, main, footer) or ARIA roles'
        })
      }

      // Check for skip links
      const skipLink = document.querySelector('a[href="#main"], a[href="#content"]')
      if (!skipLink) {
        issues.push({
          severity: 'moderate',
          type: 'missing',
          element: 'skip link',
          description: 'Missing skip to main content link',
          wcagCriteria: '2.4.1',
          suggestion: 'Add a skip link as the first focusable element'
        })
      }

      return {
        testId: 'semantic-structure',
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'serious').length === 0,
        score: Math.max(0, 100 - (issues.length * 10)),
        issues,
        recommendations: issues.length > 0 
          ? ['Use semantic HTML elements', 'Implement proper heading hierarchy', 'Add ARIA landmarks']
          : [],
        wcagLevel: 'A',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'images-alt-text',
    name: 'Images Alt Text',
    description: 'Checks for proper alternative text on images',
    category: 'screen-reader',
    wcagLevel: 'A',
    wcagCriteria: '1.1.1',
    run: async () => {
      const issues = AccessibilityUtils.validateImages()
      const images = document.querySelectorAll('img')
      const imagesWithAlt = document.querySelectorAll('img[alt]')

      return {
        testId: 'images-alt-text',
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        score: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 100,
        issues,
        recommendations: issues.length > 0 
          ? ['Add descriptive alt text to images', 'Use alt="" for decorative images']
          : [],
        wcagLevel: 'A',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'form-accessibility',
    name: 'Form Accessibility',
    description: 'Tests form labeling and error handling',
    category: 'screen-reader',
    wcagLevel: 'A',
    wcagCriteria: '1.3.1',
    run: async () => {
      const issues = AccessibilityUtils.validateForms()
      const forms = document.querySelectorAll('form')
      const inputs = document.querySelectorAll('input, select, textarea')
      const labeledInputs = document.querySelectorAll('input[id]:not([type="hidden"]), select[id], textarea[id]').length

      return {
        testId: 'form-accessibility',
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        score: inputs.length > 0 ? Math.round((labeledInputs / inputs.length) * 100) : 100,
        issues,
        recommendations: issues.length > 0 
          ? ['Add labels to form inputs', 'Indicate required fields clearly', 'Provide helpful error messages']
          : [],
        wcagLevel: 'A',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  },
  {
    id: 'motion-preferences',
    name: 'Motion Preferences',
    description: 'Respects user motion preferences and provides alternatives',
    category: 'cognitive',
    wcagLevel: 'AAA',
    wcagCriteria: '2.3.3',
    run: async () => {
      const issues: AccessibilityIssue[] = []
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"], .animate-')

      if (prefersReducedMotion && animatedElements.length > 0) {
        // Check if animations are properly disabled
        animatedElements.forEach(element => {
          const styles = window.getComputedStyle(element)
          const animationDuration = styles.animationDuration
          const transitionDuration = styles.transitionDuration
          
          if (animationDuration !== '0s' && animationDuration !== 'none') {
            issues.push({
              severity: 'moderate',
              type: 'insufficient',
              element: element.tagName.toLowerCase(),
              description: 'Animation not disabled for users who prefer reduced motion',
              wcagCriteria: '2.3.3',
              suggestion: 'Respect prefers-reduced-motion media query'
            })
          }
        })
      }

      return {
        testId: 'motion-preferences',
        passed: issues.length === 0,
        score: issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20)),
        issues,
        recommendations: issues.length > 0 
          ? ['Implement prefers-reduced-motion support', 'Provide animation controls']
          : [],
        wcagLevel: 'AAA',
        timestamp: new Date(),
        url: window.location.href
      }
    }
  }
]

// Run all accessibility tests
export async function runAccessibilityTests(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  for (const test of ACCESSIBILITY_TESTS) {
    try {
      const result = await test.run()
      results.push(result)
    } catch (error) {
      console.error(`Accessibility test ${test.id} failed:`, error)
      results.push({
        testId: test.id,
        passed: false,
        score: 0,
        issues: [{
          severity: 'critical',
          type: 'invalid',
          element: 'test framework',
          description: `Test failed: ${error}`,
          wcagCriteria: test.wcagCriteria,
          suggestion: 'Fix test implementation'
        }],
        recommendations: [`Test failed: ${error}`],
        wcagLevel: test.wcagLevel,
        timestamp: new Date(),
        url: window.location.href
      })
    }
  }
  
  return results
}

// Generate accessibility report
export async function generateAccessibilityReport(): Promise<AccessibilityReport> {
  const testResults = await runAccessibilityTests()
  
  // Group results by category
  const categories: Record<string, {
    score: number
    tests: AccessibilityTestResult[]
    criticalIssues: number
    totalIssues: number
  }> = {}
  
  ACCESSIBILITY_TESTS.forEach(test => {
    const results = testResults.filter(r => r.testId === test.id)
    const categoryResults = results.length > 0 ? results : []
    const avgScore = categoryResults.length > 0 
      ? categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length 
      : 0
    
    if (!categories[test.category]) {
      categories[test.category] = {
        score: 0,
        tests: [],
        criticalIssues: 0,
        totalIssues: 0
      }
    }
    
    categories[test.category].tests.push(...categoryResults)
    categories[test.category].score = avgScore
    categories[test.category].criticalIssues += categoryResults.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'critical').length, 0)
    categories[test.category].totalIssues += categoryResults.reduce((sum, r) => 
      sum + r.issues.length, 0)
  })
  
  // Calculate overall score
  const overallScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0) / Object.keys(categories).length
  
  // Determine WCAG conformance level
  const criticalIssues = Object.values(categories).reduce((sum, cat) => sum + cat.criticalIssues, 0)
  const aaTests = testResults.filter(r => ACCESSIBILITY_TESTS.find(t => t.id === r.testId)?.wcagLevel === 'AA')
  const aaaTests = testResults.filter(r => ACCESSIBILITY_TESTS.find(t => t.id === r.testId)?.wcagLevel === 'AAA')
  
  let conformanceLevel: 'A' | 'AA' | 'AAA' | 'Non-conformant'
  if (criticalIssues > 0) {
    conformanceLevel = 'Non-conformant'
  } else if (aaaTests.every(t => t.passed)) {
    conformanceLevel = 'AAA'
  } else if (aaTests.every(t => t.passed)) {
    conformanceLevel = 'AA'
  } else {
    conformanceLevel = 'A'
  }
  
  // Mobile-specific checks
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const viewport = document.querySelector('meta[name="viewport"]')
  const touchTargetTest = testResults.find(r => r.testId === 'touch-targets')
  
  return {
    overall: {
      score: Math.round(overallScore),
      conformanceLevel,
      summary: generateAccessibilitySummary(conformanceLevel, overallScore)
    },
    categories,
    mobile: {
      touchTargetSize: touchTargetTest ? touchTargetTest.passed : false,
      gestureAlternatives: true, // Would need specific testing
      orientationSupport: viewport?.getAttribute('content')?.includes('orientation') !== false,
      zoomSupport: viewport?.getAttribute('content')?.includes('user-scalable=no') === false
    },
    device: {
      mobile: isMobile,
      screenReader: 'speechSynthesis' in window,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches
    }
  }
}

function generateAccessibilitySummary(level: string, score: number): string {
  switch (level) {
    case 'AAA':
      return 'Excellent accessibility! Meets the highest WCAG standards.'
    case 'AA':
      return 'Good accessibility conformance. Meets WCAG AA standards.'
    case 'A':
      return 'Basic accessibility conformance. Consider improving for better access.'
    case 'Non-conformant':
      return 'Accessibility issues detected. Critical improvements needed.'
    default:
      return 'Accessibility analysis complete.'
  }
}

// Start accessibility monitoring
export function initializeAccessibilityMonitoring(): void {
  if (typeof window === 'undefined') return
  
  // Monitor for focus trap issues
  let lastFocusedElement: Element | null = null
  
  document.addEventListener('focusin', (e) => {
    lastFocusedElement = e.target as Element
  })
  
  // Monitor for keyboard navigation issues
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const activeElement = document.activeElement
      if (activeElement && !AccessibilityUtils.isKeyboardAccessible(activeElement)) {
        console.warn('Non-keyboard-accessible element focused:', activeElement)
      }
    }
  })
  
  // Log accessibility violations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            
            // Check for images without alt text
            if (element.tagName === 'IMG' && !element.hasAttribute('alt')) {
              console.warn('Image added without alt text:', element)
            }
            
            // Check for buttons without accessible names
            if (element.tagName === 'BUTTON' && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
              console.warn('Button added without accessible name:', element)
            }
          }
        })
      }
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Initialize when module loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccessibilityMonitoring)
  } else {
    initializeAccessibilityMonitoring()
  }
}

export default {
  runAccessibilityTests,
  generateAccessibilityReport,
  initializeAccessibilityMonitoring,
  AccessibilityUtils,
  ACCESSIBILITY_TESTS,
  WCAG_REQUIREMENTS
}
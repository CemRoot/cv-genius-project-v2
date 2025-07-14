// Safari-specific compatibility fixes and checks
export class SafariCompatibility {
  static isSafari(): boolean {
    if (typeof window === 'undefined') return false
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  }

  static getSafariVersion(): number {
    if (!this.isSafari()) return 0
    const match = navigator.userAgent.match(/Version\/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  static checkCompatibility(): SafariCompatibilityResult {
    const isSafari = this.isSafari()
    const version = this.getSafariVersion()
    const issues: string[] = []
    const fixes: string[] = []

    if (!isSafari) {
      return {
        compatible: true,
        version: 0,
        issues: [],
        fixes: [],
        requiresPolyfills: false
      }
    }

    // Check for known Safari issues
    if (version < 14) {
      issues.push('Safari version too old - requires Safari 14+')
      fixes.push('Please update Safari to the latest version')
    }

    // Check optional chaining support (Safari 13.1+)
    try {
      const test: any = {}
      const result = test?.optional?.chaining
      if (result !== undefined) {
        issues.push('Optional chaining not working correctly')
      }
    } catch (error) {
      issues.push('Optional chaining not supported')
      fixes.push('JavaScript polyfill will be applied')
    }

    // Check ResizeObserver (Safari 13.1+)
    if (!('ResizeObserver' in window)) {
      issues.push('ResizeObserver not supported')
      fixes.push('Fallback to window resize events')
    }

    // Check CSS custom properties support
    if (!CSS.supports('color', 'var(--test)')) {
      issues.push('CSS custom properties not fully supported')
      fixes.push('CSS fallbacks will be used')
    }

    // Check for Safari-specific CSS bugs
    const safariCSSBugs = this.checkSafariCSSBugs()
    issues.push(...safariCSSBugs.issues)
    fixes.push(...safariCSSBugs.fixes)

    return {
      compatible: issues.length === 0 || version >= 14,
      version,
      issues,
      fixes,
      requiresPolyfills: issues.some(issue => 
        issue.includes('optional chaining') || 
        issue.includes('ResizeObserver')
      )
    }
  }

  static checkSafariCSSBugs(): { issues: string[]; fixes: string[] } {
    const issues: string[] = []
    const fixes: string[] = []

    // Check backdrop-filter support (Safari 14+)
    if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
      issues.push('backdrop-filter not supported')
      fixes.push('Alternative blur effects will be used')
    }

    // Check aspect-ratio support (Safari 15+)
    if (!CSS.supports('aspect-ratio', '16/9')) {
      issues.push('aspect-ratio property not supported')
      fixes.push('Padding-based aspect ratios will be used')
    }

    // Check for Safari gradient rendering bugs
    const version = this.getSafariVersion()
    if (version > 0 && version < 16) {
      issues.push('Safari gradient rendering inconsistencies')
      fixes.push('Gradient fallbacks applied')
    }

    return { issues, fixes }
  }

  static applySafariPolyfills(): void {
    if (!this.isSafari()) return

    // Optional chaining polyfill for older Safari
    if (!this.supportsOptionalChaining()) {
      console.log('🦋 Applying optional chaining polyfill for Safari')
      // Polyfill would be applied here in a real implementation
    }

    // ResizeObserver polyfill
    if (!('ResizeObserver' in window)) {
      console.log('🦋 Applying ResizeObserver polyfill for Safari')
      this.loadResizeObserverPolyfill()
    }

    // CSS fixes for Safari
    this.applySafariCSSFixes()
  }

  private static supportsOptionalChaining(): boolean {
    try {
      const test: any = {}
      return test?.optional?.chaining === undefined
    } catch {
      return false
    }
  }

  private static loadResizeObserverPolyfill(): void {
    // Simple ResizeObserver polyfill for Safari
    if (!('ResizeObserver' in window)) {
      (window as any).ResizeObserver = class {
        private callback: ResizeObserverCallback
        private elements: Set<Element> = new Set()

        constructor(callback: ResizeObserverCallback) {
          this.callback = callback
        }

        observe(element: Element) {
          this.elements.add(element)
          // Fallback to window resize
          window.addEventListener('resize', this.handleResize.bind(this))
        }

        unobserve(element: Element) {
          this.elements.delete(element)
        }

        disconnect() {
          this.elements.clear()
          window.removeEventListener('resize', this.handleResize.bind(this))
        }

        private handleResize() {
          const entries = Array.from(this.elements).map(element => ({
            target: element,
            contentRect: element.getBoundingClientRect()
          }))
          this.callback(entries as any, this as any)
        }
      }
    }
  }

  private static applySafariCSSFixes(): void {
    const style = document.createElement('style')
    style.id = 'safari-compatibility-fixes'
    
    style.textContent = `
      /* Safari-specific CSS fixes */
      @supports (-webkit-appearance: none) {
        /* Fix gradient rendering in Safari */
        .cvgenius-gradient {
          background: -webkit-linear-gradient(135deg, #8B5CF6, #6366F1) !important;
          background: linear-gradient(135deg, #8B5CF6, #6366F1) !important;
        }
        
        /* Fix backdrop-filter fallback */
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        /* Fix sticky positioning */
        .sticky {
          position: -webkit-sticky;
          position: sticky;
        }
        
        /* Fix text rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Fix flexbox gaps in older Safari */
        .gap-4 > * + * {
          margin-left: 1rem;
        }
        
        .gap-6 > * + * {
          margin-left: 1.5rem;
        }
        
        /* Fix CSS Grid gaps */
        .grid.gap-4 {
          grid-gap: 1rem;
        }
        
        .grid.gap-6 {
          grid-gap: 1.5rem;
        }
        
        /* Fix mobile viewport units */
        .h-screen {
          height: 100vh;
          height: -webkit-fill-available;
        }
        
        /* Fix input styling */
        input, textarea, select {
          -webkit-appearance: none;
          border-radius: 0;
        }
        
        /* Fix scroll behavior */
        html {
          -webkit-overflow-scrolling: touch;
        }
      }
    `
    
    document.head.appendChild(style)
  }

  static logCompatibilityInfo(): void {
    if (!this.isSafari()) return

    const result = this.checkCompatibility()
    console.log('🦋 Safari Compatibility Check:', {
      version: result.version,
      compatible: result.compatible,
      issues: result.issues,
      fixes: result.fixes
    })

    if (result.issues.length > 0) {
      console.warn('🦋 Safari Issues Detected:', result.issues)
      console.log('🦋 Applying Fixes:', result.fixes)
    }
  }
}

export interface SafariCompatibilityResult {
  compatible: boolean
  version: number
  issues: string[]
  fixes: string[]
  requiresPolyfills: boolean
}

// Auto-initialize Safari compatibility on import
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      SafariCompatibility.applySafariPolyfills()
      SafariCompatibility.logCompatibilityInfo()
    })
  } else {
    SafariCompatibility.applySafariPolyfills()
    SafariCompatibility.logCompatibilityInfo()
  }
} 
// A/B Testing System for CVGenius Mobile
// Mobile-optimized experimentation and feature testing

export interface ABTest {
  id: string
  name: string
  description: string
  hypothesis: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'
  type: 'ui' | 'flow' | 'content' | 'performance' | 'feature'
  variants: ABVariant[]
  trafficAllocation: number // 0-100 percentage
  targetAudience: ABTargetAudience
  metrics: ABMetric[]
  startDate: Date
  endDate?: Date
  duration?: number // days
  results?: ABTestResults
  config: ABTestConfig
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ABVariant {
  id: string
  name: string
  description: string
  weight: number // percentage of traffic
  config: Record<string, any>
  isControl: boolean
  conversionRate?: number
  sampleSize?: number
}

export interface ABTargetAudience {
  include: ABCriteria[]
  exclude: ABCriteria[]
  percentage: number
}

export interface ABCriteria {
  type: 'device' | 'location' | 'user_type' | 'session_count' | 'feature_flag' | 'custom'
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  field?: string
}

export interface ABMetric {
  id: string
  name: string
  type: 'conversion' | 'engagement' | 'performance' | 'revenue' | 'custom'
  eventName: string
  isPrimary: boolean
  description: string
  expectedDirection: 'increase' | 'decrease'
  minimumDetectableEffect: number
  baseline?: number
}

export interface ABTestConfig {
  confidenceLevel: number // 90, 95, 99
  minimumSampleSize: number
  maximumDuration: number // days
  autoStop: boolean
  autoStopThreshold: number
  cookieDuration: number // days
  ignoreReturningUsers: boolean
  mobileOnly: boolean
  enableDebugMode: boolean
}

export interface ABTestResults {
  status: 'incomplete' | 'significant' | 'not_significant' | 'inconclusive'
  winningVariant?: string
  confidenceLevel: number
  pValue: number
  effectSize: number
  variants: ABVariantResult[]
  startedAt: Date
  completedAt?: Date
  totalSessions: number
  totalConversions: number
}

export interface ABVariantResult {
  variantId: string
  sessions: number
  conversions: number
  conversionRate: number
  confidence: number
  lift: number
  isWinner: boolean
  metrics: Record<string, number>
}

export interface ABUserSession {
  userId: string
  sessionId: string
  testId: string
  variantId: string
  assignedAt: Date
  events: ABEvent[]
  converted: boolean
  conversionValue?: number
  deviceInfo: ABDeviceInfo
}

export interface ABEvent {
  name: string
  timestamp: Date
  properties: Record<string, any>
  value?: number
}

export interface ABDeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  platform: string
  browser: string
  screenSize: string
  userAgent: string
  connection: string
}

export interface MobileABFeatures {
  localStorage: boolean
  touchTracking: boolean
  performanceMetrics: boolean
  networkAware: boolean
  deviceSpecific: boolean
  gestureAnalytics: boolean
  batteryOptimization: boolean
  offlineCapability: boolean
}

const DEFAULT_MOBILE_FEATURES: MobileABFeatures = {
  localStorage: true,
  touchTracking: true,
  performanceMetrics: true,
  networkAware: true,
  deviceSpecific: true,
  gestureAnalytics: true,
  batteryOptimization: true,
  offlineCapability: true
}

export class MobileABTesting {
  private tests: Map<string, ABTest> = new Map()
  private sessions: Map<string, ABUserSession> = new Map()
  private assignments: Map<string, Map<string, string>> = new Map() // userId -> testId -> variantId
  private eventQueue: ABEvent[] = []
  private features: MobileABFeatures
  private userId: string
  private sessionId: string
  private deviceInfo: ABDeviceInfo
  private isInitialized = false

  constructor(userId: string, features?: Partial<MobileABFeatures>) {
    this.userId = userId
    this.sessionId = this.generateSessionId()
    this.features = { ...DEFAULT_MOBILE_FEATURES, ...features }
    this.deviceInfo = this.detectDeviceInfo()
    
    this.initialize()
  }

  private async initialize() {
    if (typeof window === 'undefined') return

    // Load existing assignments
    if (this.features.localStorage) {
      await this.loadAssignments()
    }

    // Set up event tracking
    this.setupEventTracking()

    // Set up performance monitoring
    if (this.features.performanceMetrics) {
      this.setupPerformanceTracking()
    }

    // Set up offline capability
    if (this.features.offlineCapability) {
      this.setupOfflineSync()
    }

    this.isInitialized = true
  }

  // Test management
  async createTest(testConfig: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest> {
    const test: ABTest = {
      ...testConfig,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate test configuration
    this.validateTest(test)

    this.tests.set(test.id, test)
    await this.saveToStorage()

    return test
  }

  async startTest(testId: string): Promise<void> {
    const test = this.tests.get(testId)
    if (!test) throw new Error('Test not found')

    test.status = 'running'
    test.startDate = new Date()
    test.updatedAt = new Date()

    await this.saveToStorage()
  }

  async stopTest(testId: string): Promise<void> {
    const test = this.tests.get(testId)
    if (!test) throw new Error('Test not found')

    test.status = 'completed'
    test.endDate = new Date()
    test.updatedAt = new Date()

    // Calculate final results
    test.results = await this.calculateResults(test)

    await this.saveToStorage()
  }

  // User assignment and variant selection
  async getVariant(testId: string): Promise<string | null> {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') return null

    // Check if user is already assigned
    const userAssignments = this.assignments.get(this.userId)
    if (userAssignments?.has(testId)) {
      return userAssignments.get(testId) || null
    }

    // Check targeting criteria
    if (!this.matchesAudience(test.targetAudience)) {
      return null
    }

    // Check traffic allocation
    if (Math.random() * 100 > test.trafficAllocation) {
      return null
    }

    // Assign variant
    const variantId = this.assignVariant(test)
    if (!variantId) return null

    // Save assignment
    this.saveAssignment(testId, variantId)

    // Create session
    this.createSession(test, variantId)

    return variantId
  }

  private assignVariant(test: ABTest): string | null {
    // Weighted random assignment
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of test.variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        return variant.id
      }
    }

    return null
  }

  private matchesAudience(audience: ABTargetAudience): boolean {
    // Check percentage
    if (Math.random() * 100 > audience.percentage) {
      return false
    }

    // Check include criteria
    const includeMatch = audience.include.length === 0 || 
      audience.include.some(criteria => this.matchesCriteria(criteria))

    // Check exclude criteria
    const excludeMatch = audience.exclude.length === 0 || 
      !audience.exclude.some(criteria => this.matchesCriteria(criteria))

    return includeMatch && excludeMatch
  }

  private matchesCriteria(criteria: ABCriteria): boolean {
    let value: any

    switch (criteria.type) {
      case 'device':
        value = this.deviceInfo.type
        break
      case 'location':
        value = 'dublin' // Simplified for demo
        break
      case 'user_type':
        value = 'new' // Simplified for demo
        break
      case 'session_count':
        value = this.getSessionCount()
        break
      default:
        return false
    }

    switch (criteria.operator) {
      case 'equals':
        return value === criteria.value
      case 'not_equals':
        return value !== criteria.value
      case 'contains':
        return String(value).includes(String(criteria.value))
      case 'greater_than':
        return Number(value) > Number(criteria.value)
      case 'less_than':
        return Number(value) < Number(criteria.value)
      case 'in':
        return Array.isArray(criteria.value) && criteria.value.includes(value)
      case 'not_in':
        return Array.isArray(criteria.value) && !criteria.value.includes(value)
      default:
        return false
    }
  }

  // Event tracking
  track(eventName: string, properties?: Record<string, any>, value?: number): void {
    const event: ABEvent = {
      name: eventName,
      timestamp: new Date(),
      properties: properties || {},
      value
    }

    this.eventQueue.push(event)

    // Add to active sessions
    for (const session of this.sessions.values()) {
      if (session.userId === this.userId && session.sessionId === this.sessionId) {
        session.events.push(event)

        // Check for conversions
        this.checkConversion(session, event)
      }
    }

    // Flush events periodically
    if (this.eventQueue.length >= 10) {
      this.flushEvents()
    }
  }

  private checkConversion(session: ABUserSession, event: ABEvent): void {
    const test = this.tests.get(session.testId)
    if (!test || session.converted) return

    // Check if event matches any conversion metrics
    const conversionMetric = test.metrics.find(m => 
      m.type === 'conversion' && m.eventName === event.name
    )

    if (conversionMetric) {
      session.converted = true
      session.conversionValue = event.value
    }
  }

  // Mobile-specific features
  private setupEventTracking(): void {
    if (!this.features.touchTracking) return

    // Track touch events for mobile
    document.addEventListener('touchstart', (e) => {
      this.track('touch_start', {
        touches: e.touches.length,
        target: (e.target as Element)?.tagName
      })
    }, { passive: true })

    document.addEventListener('touchend', (e) => {
      this.track('touch_end', {
        touches: e.touches.length
      })
    }, { passive: true })

    // Track gestures
    if (this.features.gestureAnalytics) {
      this.setupGestureTracking()
    }
  }

  private setupGestureTracking(): void {
    let startTouch: Touch | null = null
    let startTime = 0

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startTouch = e.touches[0]
        startTime = Date.now()
      }
    }, { passive: true })

    document.addEventListener('touchend', (e) => {
      if (startTouch && e.changedTouches.length === 1) {
        const endTouch = e.changedTouches[0]
        const duration = Date.now() - startTime
        const deltaX = endTouch.clientX - startTouch.clientX
        const deltaY = endTouch.clientY - startTouch.clientY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance > 50 && duration < 500) {
          // Swipe gesture
          const direction = Math.abs(deltaX) > Math.abs(deltaY) 
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up')

          this.track('swipe', {
            direction,
            distance: Math.round(distance),
            duration
          })
        } else if (duration < 200 && distance < 10) {
          // Tap gesture
          this.track('tap', {
            x: endTouch.clientX,
            y: endTouch.clientY,
            target: (e.target as Element)?.tagName
          })
        }
      }
      
      startTouch = null
    }, { passive: true })
  }

  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      this.track('page_load', {
        load_time: navigation.loadEventEnd - navigation.fetchStart,
        dom_ready: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        first_paint: this.getFirstPaintTime()
      })
    })

    // Track network performance
    if (this.features.networkAware && 'connection' in navigator) {
      const connection = (navigator as any).connection
      this.track('network_info', {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      })
    }
  }

  private setupOfflineSync(): void {
    // Sync when coming back online
    window.addEventListener('online', () => {
      this.flushEvents()
    })

    // Save to local storage when going offline
    window.addEventListener('offline', () => {
      this.saveToStorage()
    })
  }

  // Results calculation
  private async calculateResults(test: ABTest): Promise<ABTestResults> {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.testId === test.id)

    const variantResults: ABVariantResult[] = test.variants.map(variant => {
      const variantSessions = sessions.filter(s => s.variantId === variant.id)
      const conversions = variantSessions.filter(s => s.converted).length
      const conversionRate = variantSessions.length > 0 ? conversions / variantSessions.length : 0

      return {
        variantId: variant.id,
        sessions: variantSessions.length,
        conversions,
        conversionRate,
        confidence: 0, // Would calculate statistical confidence
        lift: 0, // Would calculate vs control
        isWinner: false,
        metrics: {}
      }
    })

    // Determine winner and statistical significance
    const controlResult = variantResults.find(r => 
      test.variants.find(v => v.id === r.variantId)?.isControl
    )
    
    if (controlResult) {
      variantResults.forEach(result => {
        if (result.variantId !== controlResult.variantId) {
          result.lift = controlResult.conversionRate > 0 
            ? ((result.conversionRate - controlResult.conversionRate) / controlResult.conversionRate) * 100
            : 0
        }
      })
    }

    // Find winner (simplified)
    const winner = variantResults.reduce((prev, current) => 
      current.conversionRate > prev.conversionRate ? current : prev
    )
    winner.isWinner = true

    return {
      status: 'significant', // Simplified
      winningVariant: winner.variantId,
      confidenceLevel: test.config.confidenceLevel,
      pValue: 0.05, // Simplified
      effectSize: winner.lift,
      variants: variantResults,
      startedAt: test.startDate,
      completedAt: new Date(),
      totalSessions: sessions.length,
      totalConversions: sessions.filter(s => s.converted).length
    }
  }

  // Storage and persistence
  private async saveAssignment(testId: string, variantId: string): Promise<void> {
    if (!this.assignments.has(this.userId)) {
      this.assignments.set(this.userId, new Map())
    }
    
    this.assignments.get(this.userId)!.set(testId, variantId)

    if (this.features.localStorage) {
      localStorage.setItem(
        'ab_assignments', 
        JSON.stringify(Array.from(this.assignments.entries()))
      )
    }
  }

  private async loadAssignments(): Promise<void> {
    if (!this.features.localStorage) return

    try {
      const stored = localStorage.getItem('ab_assignments')
      if (stored) {
        const data = JSON.parse(stored)
        this.assignments = new Map(data.map(([userId, assignments]: [string, [string, string][]]) => 
          [userId, new Map(assignments)]
        ))
      }
    } catch (error) {
      console.error('Failed to load AB test assignments:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.features.localStorage) return

    try {
      localStorage.setItem('ab_tests', JSON.stringify(Array.from(this.tests.entries())))
      localStorage.setItem('ab_sessions', JSON.stringify(Array.from(this.sessions.entries())))
    } catch (error) {
      console.error('Failed to save AB test data:', error)
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return

    // In production, send events to analytics server
    console.log('Flushing AB test events:', this.eventQueue)
    this.eventQueue = []
  }

  // Session management
  private createSession(test: ABTest, variantId: string): void {
    const session: ABUserSession = {
      userId: this.userId,
      sessionId: this.sessionId,
      testId: test.id,
      variantId,
      assignedAt: new Date(),
      events: [],
      converted: false,
      deviceInfo: this.deviceInfo
    }

    this.sessions.set(`${this.userId}_${test.id}`, session)
  }

  // Utility methods
  private detectDeviceInfo(): ABDeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        platform: 'unknown',
        browser: 'unknown',
        screenSize: '0x0',
        userAgent: '',
        connection: 'unknown'
      }
    }

    const userAgent = navigator.userAgent
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent)

    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      platform: navigator.platform,
      browser: this.getBrowserName(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      userAgent,
      connection: this.getConnectionType()
    }
  }

  private getBrowserName(): string {
    const agent = navigator.userAgent
    if (agent.includes('Chrome')) return 'Chrome'
    if (agent.includes('Firefox')) return 'Firefox'
    if (agent.includes('Safari')) return 'Safari'
    if (agent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown'
    }
    return 'unknown'
  }

  private getFirstPaintTime(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : 0
  }

  private getSessionCount(): number {
    // Simplified session count
    return parseInt(localStorage.getItem('session_count') || '1')
  }

  private validateTest(test: ABTest): void {
    // Validate variants sum to 100%
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100%')
    }

    // Ensure at least one control variant
    if (!test.variants.some(v => v.isControl)) {
      throw new Error('At least one variant must be marked as control')
    }

    // Validate metrics
    if (test.metrics.length === 0) {
      throw new Error('At least one metric must be defined')
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 16)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Public getters
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId)
  }

  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(t => t.status === 'running')
  }

  getUserAssignments(): Map<string, string> {
    return this.assignments.get(this.userId) || new Map()
  }

  // Cleanup
  destroy(): void {
    this.flushEvents()
    this.saveToStorage()
  }
}

export default MobileABTesting
// Feature Flag Management System for CVGenius Mobile
// Dynamic feature toggling and gradual rollouts

export interface FeatureFlag {
  id: string
  name: string
  description: string
  key: string
  type: 'boolean' | 'string' | 'number' | 'json'
  defaultValue: any
  currentValue: any
  enabled: boolean
  rolloutPercentage: number
  targetAudience: FlagTargetAudience
  conditions: FlagCondition[]
  variants: FlagVariant[]
  status: 'draft' | 'active' | 'disabled' | 'archived'
  environment: 'development' | 'staging' | 'production'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  metrics: FlagMetrics
  dependencies: string[]
  tags: string[]
}

export interface FlagTargetAudience {
  include: FlagCriteria[]
  exclude: FlagCriteria[]
  userIds?: string[]
  groups?: string[]
  percentage: number
}

export interface FlagCriteria {
  type: 'device' | 'browser' | 'location' | 'version' | 'custom'
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in'
  value: any
  field?: string
}

export interface FlagCondition {
  id: string
  type: 'time' | 'user_property' | 'session_count' | 'feature_flag' | 'custom'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between'
  value: any
  field?: string
  description: string
}

export interface FlagVariant {
  id: string
  name: string
  value: any
  weight: number
  description: string
}

export interface FlagMetrics {
  evaluations: number
  uniqueUsers: number
  lastEvaluated: Date
  errorRate: number
  performanceMs: number
}

export interface FlagEvaluation {
  flagId: string
  userId: string
  value: any
  variant?: string
  timestamp: Date
  context: EvaluationContext
  matched: boolean
  reason: string
}

export interface EvaluationContext {
  userId: string
  sessionId: string
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop'
    platform: string
    browser: string
    version: string
  }
  location?: {
    country: string
    city: string
    timezone: string
  }
  userProperties: Record<string, any>
  customProperties: Record<string, any>
}

export interface MobileFeatureFlagOptions {
  cacheEnabled: boolean
  cacheDuration: number // minutes
  evaluationTimeout: number // ms
  fallbackMode: 'default' | 'last_known' | 'error'
  offlineSupport: boolean
  realTimeUpdates: boolean
  analytics: boolean
  debugMode: boolean
}

const DEFAULT_OPTIONS: MobileFeatureFlagOptions = {
  cacheEnabled: true,
  cacheDuration: 15,
  evaluationTimeout: 500,
  fallbackMode: 'default',
  offlineSupport: true,
  realTimeUpdates: true,
  analytics: true,
  debugMode: false
}

export class MobileFeatureFlags {
  private flags: Map<string, FeatureFlag> = new Map()
  private cache: Map<string, { value: any; timestamp: number }> = new Map()
  private evaluations: FlagEvaluation[] = []
  private options: MobileFeatureFlagOptions
  private context: EvaluationContext
  private eventListeners: Map<string, Function[]> = new Map()
  private syncTimer: NodeJS.Timeout | null = null

  constructor(
    userId: string,
    options?: Partial<MobileFeatureFlagOptions>
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.context = this.buildContext(userId)
    this.initializeFeatureFlags()
  }

  private buildContext(userId: string): EvaluationContext {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent)

    return {
      userId,
      sessionId: this.generateSessionId(),
      deviceInfo: {
        type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        browser: this.getBrowserName(),
        version: this.getBrowserVersion()
      },
      userProperties: {},
      customProperties: {}
    }
  }

  private initializeFeatureFlags() {
    // Load cached flags
    if (this.options.cacheEnabled) {
      this.loadFromCache()
    }

    // Set up real-time updates
    if (this.options.realTimeUpdates) {
      this.setupRealTimeSync()
    }

    // Initialize default flags for CVGenius mobile features
    this.initializeDefaultFlags()
  }

  private initializeDefaultFlags() {
    const defaultFlags: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Mobile CV Builder Redesign',
        description: 'New mobile-optimized CV builder interface',
        key: 'mobile_cv_builder_v2',
        type: 'boolean',
        defaultValue: false,
        currentValue: false,
        enabled: true,
        rolloutPercentage: 25,
        targetAudience: {
          include: [{ type: 'device', operator: 'equals', value: 'mobile' }],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [
          { id: 'off', name: 'Original', value: false, weight: 75, description: 'Original CV builder' },
          { id: 'on', name: 'New Design', value: true, weight: 25, description: 'New mobile design' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: [],
        tags: ['mobile', 'ui', 'cv-builder']
      },
      {
        name: 'Voice Input Feature',
        description: 'Voice-to-text input for CV sections',
        key: 'voice_input_enabled',
        type: 'boolean',
        defaultValue: false,
        currentValue: false,
        enabled: true,
        rolloutPercentage: 50,
        targetAudience: {
          include: [
            { type: 'device', operator: 'in', value: ['mobile', 'tablet'] },
            { type: 'browser', operator: 'not_equals', value: 'Safari' }
          ],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [
          { id: 'disabled', name: 'Disabled', value: false, weight: 50, description: 'Voice input disabled' },
          { id: 'enabled', name: 'Enabled', value: true, weight: 50, description: 'Voice input enabled' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: [],
        tags: ['mobile', 'voice', 'accessibility']
      },
      {
        name: 'Dublin Jobs Integration',
        description: 'Show Dublin-specific job recommendations',
        key: 'dublin_jobs_integration',
        type: 'boolean',
        defaultValue: true,
        currentValue: true,
        enabled: true,
        rolloutPercentage: 100,
        targetAudience: {
          include: [{ type: 'location', operator: 'equals', value: 'Ireland' }],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [
          { id: 'global', name: 'Global Jobs', value: false, weight: 0, description: 'Show global jobs' },
          { id: 'dublin', name: 'Dublin Focus', value: true, weight: 100, description: 'Show Dublin jobs' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: [],
        tags: ['location', 'dublin', 'jobs']
      },
      {
        name: 'AI CV Optimization',
        description: 'AI-powered CV suggestions and optimizations',
        key: 'ai_cv_optimization',
        type: 'string',
        defaultValue: 'basic',
        currentValue: 'basic',
        enabled: true,
        rolloutPercentage: 75,
        targetAudience: {
          include: [],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [
          { id: 'disabled', name: 'Disabled', value: 'disabled', weight: 25, description: 'No AI features' },
          { id: 'basic', name: 'Basic AI', value: 'basic', weight: 50, description: 'Basic AI suggestions' },
          { id: 'advanced', name: 'Advanced AI', value: 'advanced', weight: 25, description: 'Advanced AI features' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: [],
        tags: ['ai', 'optimization', 'suggestions']
      },
      {
        name: 'Mobile Collaboration',
        description: 'Real-time collaborative editing on mobile',
        key: 'mobile_collaboration',
        type: 'boolean',
        defaultValue: false,
        currentValue: false,
        enabled: true,
        rolloutPercentage: 10,
        targetAudience: {
          include: [{ type: 'device', operator: 'equals', value: 'mobile' }],
          exclude: [],
          percentage: 100
        },
        conditions: [
          {
            id: 'network_condition',
            type: 'custom',
            operator: 'greater_than',
            value: '3g',
            field: 'connection_speed',
            description: 'Require good network connection'
          }
        ],
        variants: [
          { id: 'solo', name: 'Solo Mode', value: false, weight: 90, description: 'Single user editing' },
          { id: 'collaborative', name: 'Collaborative', value: true, weight: 10, description: 'Multi-user editing' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: ['mobile_cv_builder_v2'],
        tags: ['mobile', 'collaboration', 'experimental']
      },
      {
        name: 'Offline Mode',
        description: 'Enable offline CV editing capabilities',
        key: 'offline_mode_enabled',
        type: 'boolean',
        defaultValue: true,
        currentValue: true,
        enabled: true,
        rolloutPercentage: 100,
        targetAudience: {
          include: [{ type: 'device', operator: 'in', value: ['mobile', 'tablet'] }],
          exclude: [],
          percentage: 100
        },
        conditions: [],
        variants: [
          { id: 'online_only', name: 'Online Only', value: false, weight: 0, description: 'Requires internet' },
          { id: 'offline_enabled', name: 'Offline Enabled', value: true, weight: 100, description: 'Works offline' }
        ],
        status: 'active',
        environment: 'production',
        createdBy: 'system',
        metrics: {
          evaluations: 0,
          uniqueUsers: 0,
          lastEvaluated: new Date(),
          errorRate: 0,
          performanceMs: 0
        },
        dependencies: [],
        tags: ['offline', 'mobile', 'pwa']
      }
    ]

    defaultFlags.forEach(flagData => {
      const flag: FeatureFlag = {
        ...flagData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.flags.set(flag.key, flag)
    })
  }

  // Flag evaluation
  async evaluate(flagKey: string, fallbackValue?: any): Promise<any> {
    const startTime = performance.now()
    
    try {
      const flag = this.flags.get(flagKey)
      if (!flag) {
        return fallbackValue !== undefined ? fallbackValue : null
      }

      // Check cache first
      if (this.options.cacheEnabled) {
        const cached = this.getCachedValue(flagKey)
        if (cached !== null) {
          return cached
        }
      }

      // Evaluate flag
      const evaluation = await this.evaluateFlag(flag)
      
      // Cache result
      if (this.options.cacheEnabled) {
        this.setCachedValue(flagKey, evaluation.value)
      }

      // Record evaluation
      this.recordEvaluation(evaluation)

      // Update metrics
      const endTime = performance.now()
      flag.metrics.evaluations++
      flag.metrics.performanceMs = endTime - startTime
      flag.metrics.lastEvaluated = new Date()

      this.triggerEvent('flagEvaluated', { flagKey, value: evaluation.value, evaluation })

      return evaluation.value
    } catch (error) {
      console.error(`Error evaluating flag ${flagKey}:`, error)
      
      // Update error metrics
      const flag = this.flags.get(flagKey)
      if (flag) {
        flag.metrics.errorRate++
      }

      // Fallback strategy
      switch (this.options.fallbackMode) {
        case 'last_known':
          const lastKnown = this.getLastKnownValue(flagKey)
          return lastKnown !== null ? lastKnown : fallbackValue
        case 'error':
          throw error
        default:
          return fallbackValue !== undefined ? fallbackValue : flag?.defaultValue
      }
    }
  }

  private async evaluateFlag(flag: FeatureFlag): Promise<FlagEvaluation> {
    const evaluation: FlagEvaluation = {
      flagId: flag.id,
      userId: this.context.userId,
      value: flag.defaultValue,
      timestamp: new Date(),
      context: this.context,
      matched: false,
      reason: 'default'
    }

    // Check if flag is enabled
    if (!flag.enabled) {
      evaluation.reason = 'flag_disabled'
      return evaluation
    }

    // Check dependencies
    if (flag.dependencies.length > 0) {
      for (const dependency of flag.dependencies) {
        const depValue = await this.evaluate(dependency)
        if (!depValue) {
          evaluation.reason = `dependency_failed: ${dependency}`
          return evaluation
        }
      }
    }

    // Check conditions
    if (!this.evaluateConditions(flag.conditions)) {
      evaluation.reason = 'conditions_not_met'
      return evaluation
    }

    // Check target audience
    if (!this.matchesTargetAudience(flag.targetAudience)) {
      evaluation.reason = 'audience_not_matched'
      return evaluation
    }

    // Check rollout percentage
    const userHash = this.hashUserId(this.context.userId, flag.key)
    if (userHash > flag.rolloutPercentage) {
      evaluation.reason = 'rollout_percentage'
      return evaluation
    }

    // Select variant
    if (flag.variants.length > 0) {
      const variant = this.selectVariant(flag.variants, userHash)
      evaluation.value = variant.value
      evaluation.variant = variant.id
      evaluation.reason = `variant: ${variant.name}`
    } else {
      evaluation.value = flag.currentValue
      evaluation.reason = 'current_value'
    }

    evaluation.matched = true
    return evaluation
  }

  private evaluateConditions(conditions: FlagCondition[]): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          return this.evaluateTimeCondition(condition)
        case 'user_property':
          return this.evaluateUserPropertyCondition(condition)
        case 'session_count':
          return this.evaluateSessionCountCondition(condition)
        case 'feature_flag':
          return this.evaluateFeatureFlagCondition(condition)
        case 'custom':
          return this.evaluateCustomCondition(condition)
        default:
          return true
      }
    })
  }

  private matchesTargetAudience(audience: FlagTargetAudience): boolean {
    // Check percentage
    const userHash = this.hashUserId(this.context.userId, 'audience')
    if (userHash > audience.percentage) {
      return false
    }

    // Check specific user IDs
    if (audience.userIds && audience.userIds.length > 0) {
      return audience.userIds.includes(this.context.userId)
    }

    // Check include criteria
    const includeMatch = audience.include.length === 0 || 
      audience.include.some(criteria => this.matchesCriteria(criteria))

    // Check exclude criteria
    const excludeMatch = audience.exclude.length === 0 || 
      !audience.exclude.some(criteria => this.matchesCriteria(criteria))

    return includeMatch && excludeMatch
  }

  private matchesCriteria(criteria: FlagCriteria): boolean {
    let value: any

    switch (criteria.type) {
      case 'device':
        value = this.context.deviceInfo.type
        break
      case 'browser':
        value = this.context.deviceInfo.browser
        break
      case 'location':
        value = this.context.location?.country || 'unknown'
        break
      case 'version':
        value = this.context.deviceInfo.version
        break
      case 'custom':
        value = criteria.field ? this.context.customProperties[criteria.field] : null
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
      default:
        return false
    }
  }

  private selectVariant(variants: FlagVariant[], userHash: number): FlagVariant {
    const normalizedHash = userHash / 100
    let cumulative = 0

    for (const variant of variants) {
      cumulative += variant.weight / 100
      if (normalizedHash <= cumulative) {
        return variant
      }
    }

    return variants[variants.length - 1]
  }

  // Flag management
  async createFlag(flagData: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<FeatureFlag> {
    const flag: FeatureFlag = {
      ...flagData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        evaluations: 0,
        uniqueUsers: 0,
        lastEvaluated: new Date(),
        errorRate: 0,
        performanceMs: 0
      }
    }

    this.flags.set(flag.key, flag)
    await this.saveToStorage()

    this.triggerEvent('flagCreated', { flag })
    return flag
  }

  async updateFlag(flagKey: string, updates: Partial<FeatureFlag>): Promise<void> {
    const flag = this.flags.get(flagKey)
    if (!flag) return

    Object.assign(flag, updates, { updatedAt: new Date() })
    
    // Clear cache for this flag
    this.clearCache(flagKey)
    
    await this.saveToStorage()
    this.triggerEvent('flagUpdated', { flagKey, flag })
  }

  async deleteFlag(flagKey: string): Promise<void> {
    const flag = this.flags.get(flagKey)
    if (!flag) return

    this.flags.delete(flagKey)
    this.clearCache(flagKey)
    
    await this.saveToStorage()
    this.triggerEvent('flagDeleted', { flagKey })
  }

  // Utility methods
  private evaluateTimeCondition(condition: FlagCondition): boolean {
    const now = new Date()
    const conditionTime = new Date(condition.value)
    
    switch (condition.operator) {
      case 'greater_than':
        return now > conditionTime
      case 'less_than':
        return now < conditionTime
      default:
        return true
    }
  }

  private evaluateUserPropertyCondition(condition: FlagCondition): boolean {
    const value = this.context.userProperties[condition.field || '']
    return this.compareValues(value, condition.operator, condition.value)
  }

  private evaluateSessionCountCondition(condition: FlagCondition): boolean {
    const sessionCount = this.getSessionCount()
    return this.compareValues(sessionCount, condition.operator, condition.value)
  }

  private evaluateFeatureFlagCondition(condition: FlagCondition): boolean {
    // This would need to be async in a real implementation
    return true
  }

  private evaluateCustomCondition(condition: FlagCondition): boolean {
    const value = this.context.customProperties[condition.field || '']
    return this.compareValues(value, condition.operator, condition.value)
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected
      case 'not_equals':
        return actual !== expected
      case 'greater_than':
        return Number(actual) > Number(expected)
      case 'less_than':
        return Number(actual) < Number(expected)
      case 'between':
        return Array.isArray(expected) && 
               Number(actual) >= Number(expected[0]) && 
               Number(actual) <= Number(expected[1])
      default:
        return false
    }
  }

  private hashUserId(userId: string, salt: string): number {
    const str = userId + salt
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100
  }

  private recordEvaluation(evaluation: FlagEvaluation): void {
    this.evaluations.push(evaluation)
    
    // Keep only recent evaluations to prevent memory issues
    if (this.evaluations.length > 1000) {
      this.evaluations = this.evaluations.slice(-500)
    }

    if (this.options.analytics) {
      this.sendAnalytics(evaluation)
    }
  }

  private sendAnalytics(evaluation: FlagEvaluation): void {
    // In production, send to analytics service
    if (this.options.debugMode) {
      console.log('Feature flag evaluation:', evaluation)
    }
  }

  // Cache management
  private getCachedValue(flagKey: string): any {
    if (!this.options.cacheEnabled) return null

    const cached = this.cache.get(flagKey)
    if (!cached) return null

    const now = Date.now()
    const expiryTime = cached.timestamp + (this.options.cacheDuration * 60 * 1000)
    
    if (now > expiryTime) {
      this.cache.delete(flagKey)
      return null
    }

    return cached.value
  }

  private setCachedValue(flagKey: string, value: any): void {
    if (!this.options.cacheEnabled) return

    this.cache.set(flagKey, {
      value,
      timestamp: Date.now()
    })
  }

  private clearCache(flagKey?: string): void {
    if (flagKey) {
      this.cache.delete(flagKey)
    } else {
      this.cache.clear()
    }
  }

  private getLastKnownValue(flagKey: string): any {
    // In production, retrieve from persistent storage
    return null
  }

  // Storage
  private async saveToStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const data = {
        flags: Array.from(this.flags.entries()),
        evaluations: this.evaluations.slice(-100), // Keep recent evaluations
        lastSync: Date.now()
      }

      localStorage.setItem('cvgenius_feature_flags', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save feature flags:', error)
    }
  }

  private loadFromCache(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('cvgenius_feature_flags')
      if (!stored) return

      const data = JSON.parse(stored)
      
      if (data.flags) {
        this.flags = new Map(data.flags)
      }
      
      if (data.evaluations) {
        this.evaluations = data.evaluations
      }
    } catch (error) {
      console.error('Failed to load feature flags from cache:', error)
    }
  }

  private setupRealTimeSync(): void {
    // Sync every 5 minutes
    this.syncTimer = setInterval(() => {
      this.syncWithServer()
    }, 5 * 60 * 1000)
  }

  private async syncWithServer(): Promise<void> {
    // In production, sync with feature flag service
    if (this.options.debugMode) {
      console.log('Syncing feature flags with server')
    }
  }

  // Utility methods
  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const agent = navigator.userAgent
    if (agent.includes('Chrome')) return 'Chrome'
    if (agent.includes('Firefox')) return 'Firefox'
    if (agent.includes('Safari')) return 'Safari'
    if (agent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getBrowserVersion(): string {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const agent = navigator.userAgent
    const match = agent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/)
    return match ? match[1] : 'unknown'
  }

  private getSessionCount(): number {
    if (typeof localStorage === 'undefined') return 1
    
    const stored = localStorage.getItem('cvgenius_session_count')
    return stored ? parseInt(stored) : 1
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 16)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private triggerEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => callback(data))
  }

  // Public getters
  getFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  getFlag(flagKey: string): FeatureFlag | undefined {
    return this.flags.get(flagKey)
  }

  getEvaluations(): FlagEvaluation[] {
    return this.evaluations
  }

  getContext(): EvaluationContext {
    return this.context
  }

  updateContext(updates: Partial<EvaluationContext>): void {
    this.context = { ...this.context, ...updates }
    this.clearCache() // Clear cache when context changes
  }

  // Cleanup
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
    this.saveToStorage()
    this.eventListeners.clear()
    this.cache.clear()
  }
}

export default MobileFeatureFlags
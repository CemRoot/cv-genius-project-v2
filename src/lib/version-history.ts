// Mobile Version History System for CVGenius
// Track changes, revisions, and collaborative editing history

export interface CVVersion {
  id: string
  versionNumber: number
  title: string
  description?: string
  authorId: string
  authorName: string
  content: any
  changes: VersionChange[]
  tags: string[]
  status: 'draft' | 'review' | 'approved' | 'archived'
  isAutoSave: boolean
  isMajorVersion: boolean
  parentVersionId?: string
  branchName?: string
  createdAt: Date
  metadata: VersionMetadata
  collaborators: string[]
  comments: string[]
  fileSize: number
  checksumHash: string
}

export interface VersionChange {
  id: string
  type: 'add' | 'edit' | 'delete' | 'move' | 'format'
  section: string
  field?: string
  oldValue?: any
  newValue?: any
  position?: number
  author: string
  timestamp: Date
  description: string
}

export interface VersionMetadata {
  device: {
    type: 'mobile' | 'tablet' | 'desktop'
    platform: string
    browser: string
    userAgent: string
  }
  location?: {
    country: string
    city: string
    timezone: string
  }
  session: {
    sessionId: string
    duration: number
    changeCount: number
  }
  performance: {
    loadTime: number
    saveTime: number
    renderTime: number
  }
}

export interface VersionBranch {
  id: string
  name: string
  description: string
  parentVersionId: string
  headVersionId: string
  createdBy: string
  createdAt: Date
  status: 'active' | 'merged' | 'abandoned'
  versions: string[]
}

export interface VersionComparison {
  fromVersion: CVVersion
  toVersion: CVVersion
  differences: VersionDifference[]
  summary: {
    addedSections: number
    editedSections: number
    deletedSections: number
    totalChanges: number
  }
}

export interface VersionDifference {
  type: 'added' | 'removed' | 'modified'
  section: string
  field?: string
  oldValue?: any
  newValue?: any
  description: string
}

export interface VersionFilter {
  authorIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  statuses?: CVVersion['status'][]
  isMajorOnly?: boolean
  branchName?: string
  hasComments?: boolean
}

export interface MobileVersionFeatures {
  autoSave: boolean
  offlineVersioning: boolean
  compressedStorage: boolean
  quickPreview: boolean
  swipeNavigation: boolean
  touchComparison: boolean
  voiceNotes: boolean
  collaborativeHistory: boolean
}

const DEFAULT_MOBILE_FEATURES: MobileVersionFeatures = {
  autoSave: true,
  offlineVersioning: true,
  compressedStorage: true,
  quickPreview: true,
  swipeNavigation: true,
  touchComparison: true,
  voiceNotes: true,
  collaborativeHistory: true
}

export class MobileVersionHistory {
  private versions: Map<string, CVVersion> = new Map()
  private branches: Map<string, VersionBranch> = new Map()
  private currentVersion: CVVersion | null = null
  private autoSaveTimer: NodeJS.Timeout | null = null
  private features: MobileVersionFeatures
  private userId: string
  private userName: string
  private sessionId: string
  private changeBuffer: VersionChange[] = []
  private lastSaveTime: number = 0
  private compressionWorker: Worker | null = null

  constructor(userId: string, userName: string, features?: Partial<MobileVersionFeatures>) {
    this.userId = userId
    this.userName = userName
    this.features = { ...DEFAULT_MOBILE_FEATURES, ...features }
    this.sessionId = this.generateSessionId()
    
    this.initializeMobileFeatures()
    this.setupAutoSave()
  }

  private initializeMobileFeatures() {
    if (typeof window === 'undefined') return

    // Initialize compression worker for storage optimization
    if (this.features.compressedStorage && typeof Worker !== 'undefined') {
      this.setupCompressionWorker()
    }

    // Setup offline storage
    if (this.features.offlineVersioning) {
      this.setupOfflineStorage()
    }
  }

  private setupCompressionWorker() {
    // In production, load actual compression worker
    // For now, simulate compression
  }

  private setupOfflineStorage() {
    // Load versions from localStorage/IndexedDB for offline support
    this.loadFromStorage()
    
    // Save to storage when versions change
    this.setupStorageSync()
  }

  private setupAutoSave() {
    if (this.features.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        if (this.changeBuffer.length > 0) {
          this.autoSaveVersion()
        }
      }, 30000) // Auto-save every 30 seconds
    }
  }

  // Version creation and management
  async createVersion(
    content: any,
    options?: {
      title?: string
      description?: string
      isMajorVersion?: boolean
      tags?: string[]
      branchName?: string
    }
  ): Promise<CVVersion> {
    const versionNumber = this.getNextVersionNumber()
    const changes = this.calculateChanges(content)
    
    const version: CVVersion = {
      id: this.generateId(),
      versionNumber,
      title: options?.title || `Version ${versionNumber}`,
      description: options?.description,
      authorId: this.userId,
      authorName: this.userName,
      content: await this.compressContent(content),
      changes,
      tags: options?.tags || [],
      status: 'draft',
      isAutoSave: false,
      isMajorVersion: options?.isMajorVersion || false,
      parentVersionId: this.currentVersion?.id,
      branchName: options?.branchName || 'main',
      createdAt: new Date(),
      metadata: await this.generateMetadata(),
      collaborators: [this.userId],
      comments: [],
      fileSize: this.calculateFileSize(content),
      checksumHash: await this.generateChecksum(content)
    }

    this.versions.set(version.id, version)
    this.currentVersion = version
    this.changeBuffer = []

    // Save to storage
    await this.saveToStorage()

    return version
  }

  private async autoSaveVersion(): Promise<CVVersion | null> {
    if (!this.currentVersion || this.changeBuffer.length === 0) return null

    // Create auto-save version
    const autoSaveVersion: CVVersion = {
      ...this.currentVersion,
      id: this.generateId(),
      title: `Auto-save ${new Date().toLocaleTimeString()}`,
      changes: [...this.changeBuffer],
      isAutoSave: true,
      createdAt: new Date(),
      metadata: await this.generateMetadata()
    }

    this.versions.set(autoSaveVersion.id, autoSaveVersion)
    this.changeBuffer = []
    this.lastSaveTime = Date.now()

    await this.saveToStorage()
    return autoSaveVersion
  }

  // Change tracking
  addChange(change: Omit<VersionChange, 'id' | 'author' | 'timestamp'>): void {
    const fullChange: VersionChange = {
      ...change,
      id: this.generateId(),
      author: this.userName,
      timestamp: new Date()
    }

    this.changeBuffer.push(fullChange)

    // Trigger auto-save if enough changes accumulated
    if (this.changeBuffer.length >= 10) {
      this.autoSaveVersion()
    }
  }

  private calculateChanges(newContent: any): VersionChange[] {
    if (!this.currentVersion) return []

    const changes: VersionChange[] = []
    const oldContent = this.currentVersion.content

    // Deep comparison to find changes
    this.compareObjects(oldContent, newContent, '', changes)

    return changes
  }

  private compareObjects(oldObj: any, newObj: any, path: string, changes: VersionChange[]): void {
    const oldKeys = Object.keys(oldObj || {})
    const newKeys = Object.keys(newObj || {})
    const allKeys = new Set([...oldKeys, ...newKeys])

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      const oldValue = oldObj?.[key]
      const newValue = newObj?.[key]

      if (oldValue === undefined && newValue !== undefined) {
        // Added
        changes.push({
          id: this.generateId(),
          type: 'add',
          section: currentPath.split('.')[0],
          field: key,
          newValue,
          author: this.userName,
          timestamp: new Date(),
          description: `Added ${key}`
        })
      } else if (oldValue !== undefined && newValue === undefined) {
        // Deleted
        changes.push({
          id: this.generateId(),
          type: 'delete',
          section: currentPath.split('.')[0],
          field: key,
          oldValue,
          author: this.userName,
          timestamp: new Date(),
          description: `Deleted ${key}`
        })
      } else if (oldValue !== newValue) {
        if (typeof oldValue === 'object' && typeof newValue === 'object') {
          // Recurse into objects
          this.compareObjects(oldValue, newValue, currentPath, changes)
        } else {
          // Modified
          changes.push({
            id: this.generateId(),
            type: 'edit',
            section: currentPath.split('.')[0],
            field: key,
            oldValue,
            newValue,
            author: this.userName,
            timestamp: new Date(),
            description: `Modified ${key}`
          })
        }
      }
    }
  }

  // Version retrieval and filtering
  getVersions(filter?: VersionFilter): CVVersion[] {
    let versions = Array.from(this.versions.values())

    if (!filter) {
      return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    // Apply filters
    if (filter.authorIds) {
      versions = versions.filter(v => filter.authorIds!.includes(v.authorId))
    }

    if (filter.dateRange) {
      versions = versions.filter(v => 
        v.createdAt >= filter.dateRange!.start && 
        v.createdAt <= filter.dateRange!.end
      )
    }

    if (filter.tags && filter.tags.length > 0) {
      versions = versions.filter(v => 
        v.tags.some(tag => filter.tags!.includes(tag))
      )
    }

    if (filter.statuses) {
      versions = versions.filter(v => filter.statuses!.includes(v.status))
    }

    if (filter.isMajorOnly) {
      versions = versions.filter(v => v.isMajorVersion)
    }

    if (filter.branchName) {
      versions = versions.filter(v => v.branchName === filter.branchName)
    }

    if (filter.hasComments !== undefined) {
      versions = versions.filter(v => 
        filter.hasComments ? v.comments.length > 0 : v.comments.length === 0
      )
    }

    return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getVersion(versionId: string): CVVersion | undefined {
    return this.versions.get(versionId)
  }

  getCurrentVersion(): CVVersion | null {
    return this.currentVersion
  }

  // Version comparison
  async compareVersions(fromVersionId: string, toVersionId: string): Promise<VersionComparison> {
    const fromVersion = this.versions.get(fromVersionId)
    const toVersion = this.versions.get(toVersionId)

    if (!fromVersion || !toVersion) {
      throw new Error('Version not found')
    }

    const differences: VersionDifference[] = []
    this.generateDifferences(fromVersion.content, toVersion.content, '', differences)

    const summary = {
      addedSections: differences.filter(d => d.type === 'added').length,
      editedSections: differences.filter(d => d.type === 'modified').length,
      deletedSections: differences.filter(d => d.type === 'removed').length,
      totalChanges: differences.length
    }

    return {
      fromVersion,
      toVersion,
      differences,
      summary
    }
  }

  private generateDifferences(
    oldObj: any, 
    newObj: any, 
    path: string, 
    differences: VersionDifference[]
  ): void {
    const oldKeys = Object.keys(oldObj || {})
    const newKeys = Object.keys(newObj || {})
    const allKeys = new Set([...oldKeys, ...newKeys])

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      const oldValue = oldObj?.[key]
      const newValue = newObj?.[key]

      if (oldValue === undefined && newValue !== undefined) {
        differences.push({
          type: 'added',
          section: currentPath.split('.')[0],
          field: key,
          newValue,
          description: `Added ${key}`
        })
      } else if (oldValue !== undefined && newValue === undefined) {
        differences.push({
          type: 'removed',
          section: currentPath.split('.')[0],
          field: key,
          oldValue,
          description: `Removed ${key}`
        })
      } else if (oldValue !== newValue) {
        if (typeof oldValue === 'object' && typeof newValue === 'object') {
          this.generateDifferences(oldValue, newValue, currentPath, differences)
        } else {
          differences.push({
            type: 'modified',
            section: currentPath.split('.')[0],
            field: key,
            oldValue,
            newValue,
            description: `Modified ${key}: "${oldValue}" → "${newValue}"`
          })
        }
      }
    }
  }

  // Version operations
  async revertToVersion(versionId: string): Promise<CVVersion> {
    const targetVersion = this.versions.get(versionId)
    if (!targetVersion) {
      throw new Error('Version not found')
    }

    // Create new version based on target version
    const revertedVersion: CVVersion = {
      ...targetVersion,
      id: this.generateId(),
      versionNumber: this.getNextVersionNumber(),
      title: `Reverted to version ${targetVersion.versionNumber}`,
      description: `Reverted to "${targetVersion.title}"`,
      parentVersionId: this.currentVersion?.id,
      createdAt: new Date(),
      metadata: await this.generateMetadata(),
      isAutoSave: false,
      isMajorVersion: true
    }

    this.versions.set(revertedVersion.id, revertedVersion)
    this.currentVersion = revertedVersion

    await this.saveToStorage()
    return revertedVersion
  }

  async deleteVersion(versionId: string): Promise<void> {
    const version = this.versions.get(versionId)
    if (!version) return

    // Don't delete if it's the current version
    if (version.id === this.currentVersion?.id) {
      throw new Error('Cannot delete current version')
    }

    this.versions.delete(versionId)
    await this.saveToStorage()
  }

  async tagVersion(versionId: string, tags: string[]): Promise<void> {
    const version = this.versions.get(versionId)
    if (!version) return

    version.tags = [...new Set([...version.tags, ...tags])]
    await this.saveToStorage()
  }

  async updateVersionStatus(versionId: string, status: CVVersion['status']): Promise<void> {
    const version = this.versions.get(versionId)
    if (!version) return

    version.status = status
    await this.saveToStorage()
  }

  // Branch management
  async createBranch(
    name: string, 
    description: string, 
    fromVersionId?: string
  ): Promise<VersionBranch> {
    const parentVersion = fromVersionId 
      ? this.versions.get(fromVersionId)
      : this.currentVersion

    if (!parentVersion) {
      throw new Error('Parent version not found')
    }

    const branch: VersionBranch = {
      id: this.generateId(),
      name,
      description,
      parentVersionId: parentVersion.id,
      headVersionId: parentVersion.id,
      createdBy: this.userId,
      createdAt: new Date(),
      status: 'active',
      versions: [parentVersion.id]
    }

    this.branches.set(branch.id, branch)
    return branch
  }

  getBranches(): VersionBranch[] {
    return Array.from(this.branches.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Mobile-specific features
  async generateThumbnail(versionId: string): Promise<string> {
    const version = this.versions.get(versionId)
    if (!version) throw new Error('Version not found')

    // Generate a preview thumbnail for mobile quick view
    // In production, this would render the CV content to a canvas and return base64
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  // Storage management
  private async saveToStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const data = {
        versions: Array.from(this.versions.entries()),
        branches: Array.from(this.branches.entries()),
        currentVersionId: this.currentVersion?.id
      }

      if (this.features.compressedStorage) {
        // Compress data before storing
        const compressed = await this.compressData(data)
        localStorage.setItem('cvgenius_versions', compressed)
      } else {
        localStorage.setItem('cvgenius_versions', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to save versions to storage:', error)
    }
  }

  private async loadFromStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('cvgenius_versions')
      if (!stored) return

      let data
      if (this.features.compressedStorage) {
        data = await this.decompressData(stored)
      } else {
        data = JSON.parse(stored)
      }

      this.versions = new Map(data.versions || [])
      this.branches = new Map(data.branches || [])
      
      if (data.currentVersionId) {
        this.currentVersion = this.versions.get(data.currentVersionId) || null
      }
    } catch (error) {
      console.error('Failed to load versions from storage:', error)
    }
  }

  private setupStorageSync(): void {
    // Sync to storage on visibility change (mobile app switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveToStorage()
      }
    })

    // Sync on before unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage()
    })
  }

  // Utility methods
  private async compressContent(content: any): Promise<any> {
    if (!this.features.compressedStorage) return content
    
    // Simple compression simulation
    // In production, use actual compression algorithms
    return content
  }

  private async compressData(data: any): Promise<string> {
    // Compress version data for storage
    return JSON.stringify(data)
  }

  private async decompressData(data: string): Promise<any> {
    // Decompress version data from storage
    return JSON.parse(data)
  }

  private async generateMetadata(): Promise<VersionMetadata> {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    return {
      device: {
        type: isMobile ? 'mobile' : 'desktop',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        browser: this.getBrowserName(),
        userAgent
      },
      session: {
        sessionId: this.sessionId,
        duration: Date.now() - this.lastSaveTime,
        changeCount: this.changeBuffer.length
      },
      performance: {
        loadTime: 0,
        saveTime: 0,
        renderTime: 0
      }
    }
  }

  private async generateChecksum(content: any): Promise<string> {
    // Generate checksum for content integrity
    const str = JSON.stringify(content)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  private calculateFileSize(content: any): number {
    return JSON.stringify(content).length
  }

  private getNextVersionNumber(): number {
    const versions = Array.from(this.versions.values())
    const maxVersion = Math.max(0, ...versions.map(v => v.versionNumber))
    return maxVersion + 1
  }

  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const agent = navigator.userAgent
    if (agent.includes('Chrome')) return 'Chrome'
    if (agent.includes('Firefox')) return 'Firefox'
    if (agent.includes('Safari')) return 'Safari'
    if (agent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 16)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Cleanup
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate()
    }

    // Save final state
    this.saveToStorage()
  }
}

export default MobileVersionHistory
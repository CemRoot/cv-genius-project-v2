// Mobile Comment System for CVGenius
// Context-aware commenting with mobile-optimized features

export interface Comment {
  id: string
  parentId?: string // For threaded comments
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  type: 'text' | 'voice' | 'suggestion' | 'highlight' | 'approval'
  context: CommentContext
  metadata?: CommentMetadata
  reactions: CommentReaction[]
  replies: Comment[]
  status: 'active' | 'resolved' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  tags: string[]
  mentions: string[]
  attachments: CommentAttachment[]
  isPrivate: boolean
  visibility: CommentVisibility
}

export interface CommentContext {
  sectionId: string
  elementId?: string
  selection?: {
    start: number
    end: number
    text: string
  }
  coordinates?: {
    x: number
    y: number
  }
  pageNumber?: number
  version: number
}

export interface CommentMetadata {
  voiceDuration?: number
  suggestionType?: 'grammar' | 'content' | 'formatting' | 'structure'
  highlightColor?: string
  approvalLevel?: 'minor' | 'major' | 'critical'
  deviceInfo?: {
    platform: string
    browser: string
    screenSize: string
  }
}

export interface CommentReaction {
  userId: string
  userName: string
  emoji: string
  timestamp: Date
}

export interface CommentAttachment {
  id: string
  type: 'image' | 'voice' | 'document' | 'link'
  name: string
  url: string
  size?: number
  duration?: number
  mimeType?: string
}

export interface CommentVisibility {
  scope: 'everyone' | 'collaborators' | 'reviewers' | 'owners'
  allowedUsers?: string[]
  restrictedUsers?: string[]
}

export interface CommentThread {
  id: string
  rootCommentId: string
  participantIds: string[]
  title?: string
  status: 'active' | 'resolved' | 'locked'
  lastActivity: Date
  commentCount: number
  unreadCount: number
}

export interface CommentFilter {
  authorIds?: string[]
  types?: Comment['type'][]
  statuses?: Comment['status'][]
  priorities?: Comment['priority'][]
  tags?: string[]
  sections?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  hasAttachments?: boolean
  isUnread?: boolean
  mentions?: string[]
}

export interface CommentNotification {
  id: string
  type: 'new_comment' | 'reply' | 'mention' | 'reaction' | 'resolution'
  commentId: string
  userId: string
  message: string
  read: boolean
  timestamp: Date
}

export interface MobileCommentFeatures {
  voiceComments: boolean
  swipeActions: boolean
  hapticFeedback: boolean
  gestureNavigation: boolean
  quickReactions: boolean
  offlineComments: boolean
  pushNotifications: boolean
}

const DEFAULT_MOBILE_FEATURES: MobileCommentFeatures = {
  voiceComments: true,
  swipeActions: true,
  hapticFeedback: true,
  gestureNavigation: true,
  quickReactions: true,
  offlineComments: true,
  pushNotifications: true
}

export class MobileCommentSystem {
  private comments: Map<string, Comment> = new Map()
  private threads: Map<string, CommentThread> = new Map()
  private notifications: Map<string, CommentNotification[]> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private currentUserId: string = ''
  private currentUserName: string = ''
  private features: MobileCommentFeatures
  private offlineQueue: Comment[] = []
  private mediaRecorder: MediaRecorder | null = null
  private isRecording = false

  constructor(userId: string, userName: string, features?: Partial<MobileCommentFeatures>) {
    this.currentUserId = userId
    this.currentUserName = userName
    this.features = { ...DEFAULT_MOBILE_FEATURES, ...features }
    this.initializeMobileFeatures()
  }

  private initializeMobileFeatures() {
    if (typeof window === 'undefined') return

    // Initialize push notifications
    if (this.features.pushNotifications && 'Notification' in window) {
      this.setupPushNotifications()
    }

    // Initialize voice recording
    if (this.features.voiceComments && 'mediaDevices' in navigator) {
      this.setupVoiceRecording()
    }

    // Initialize gesture support
    if (this.features.gestureNavigation) {
      this.setupGestureSupport()
    }
  }

  // Comment creation and management
  async createComment(
    content: string,
    context: CommentContext,
    options?: {
      type?: Comment['type']
      priority?: Comment['priority']
      parentId?: string
      tags?: string[]
      mentions?: string[]
      attachments?: CommentAttachment[]
      isPrivate?: boolean
      visibility?: CommentVisibility
    }
  ): Promise<Comment> {
    const comment: Comment = {
      id: this.generateId(),
      parentId: options?.parentId,
      authorId: this.currentUserId,
      authorName: this.currentUserName,
      content,
      type: options?.type || 'text',
      context,
      reactions: [],
      replies: [],
      status: 'active',
      priority: options?.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: options?.tags || [],
      mentions: options?.mentions || [],
      attachments: options?.attachments || [],
      isPrivate: options?.isPrivate || false,
      visibility: options?.visibility || { scope: 'everyone' }
    }

    // Add device info for mobile comments
    if (this.isMobileDevice()) {
      comment.metadata = {
        ...comment.metadata,
        deviceInfo: {
          platform: navigator.platform,
          browser: this.getBrowserInfo(),
          screenSize: `${window.screen.width}x${window.screen.height}`
        }
      }
    }

    // Handle offline mode
    if (!navigator.onLine && this.features.offlineComments) {
      this.offlineQueue.push(comment)
      this.scheduleOfflineSync()
    } else {
      await this.saveComment(comment)
    }

    // Create or update thread
    if (comment.parentId) {
      await this.addToThread(comment)
    } else {
      await this.createThread(comment)
    }

    // Send notifications
    await this.sendNotifications(comment)

    // Haptic feedback
    this.hapticFeedback('comment')

    this.triggerEvent('commentCreated', { comment })
    return comment
  }

  async createVoiceComment(
    audioBlob: Blob,
    context: CommentContext,
    options?: {
      transcription?: string
      priority?: Comment['priority']
      parentId?: string
    }
  ): Promise<Comment> {
    if (!this.features.voiceComments) {
      throw new Error('Voice comments are disabled')
    }

    // Get duration
    const duration = await this.getAudioDuration(audioBlob)
    
    // Convert to base64 for storage (in production, upload to server)
    const audioUrl = await this.blobToBase64(audioBlob)

    const attachment: CommentAttachment = {
      id: this.generateId(),
      type: 'voice',
      name: `Voice comment ${new Date().toLocaleTimeString()}`,
      url: audioUrl,
      duration,
      mimeType: audioBlob.type,
      size: audioBlob.size
    }

    return this.createComment(
      options?.transcription || 'Voice comment',
      context,
      {
        type: 'voice',
        priority: options?.priority,
        parentId: options?.parentId,
        attachments: [attachment],
        metadata: {
          voiceDuration: duration
        }
      }
    )
  }

  async createSuggestion(
    content: string,
    context: CommentContext,
    suggestionType: CommentMetadata['suggestionType'],
    options?: {
      priority?: Comment['priority']
      replacement?: string
    }
  ): Promise<Comment> {
    return this.createComment(content, context, {
      type: 'suggestion',
      priority: options?.priority || 'medium',
      metadata: {
        suggestionType
      }
    })
  }

  async createHighlight(
    context: CommentContext,
    color: string = '#fbbf24',
    note?: string
  ): Promise<Comment> {
    return this.createComment(note || 'Highlighted text', context, {
      type: 'highlight',
      priority: 'low',
      metadata: {
        highlightColor: color
      }
    })
  }

  // Comment retrieval and filtering
  getComments(filter?: CommentFilter): Comment[] {
    let comments = Array.from(this.comments.values())

    if (!filter) return comments

    // Apply filters
    if (filter.authorIds) {
      comments = comments.filter(c => filter.authorIds!.includes(c.authorId))
    }

    if (filter.types) {
      comments = comments.filter(c => filter.types!.includes(c.type))
    }

    if (filter.statuses) {
      comments = comments.filter(c => filter.statuses!.includes(c.status))
    }

    if (filter.priorities) {
      comments = comments.filter(c => filter.priorities!.includes(c.priority))
    }

    if (filter.sections) {
      comments = comments.filter(c => filter.sections!.includes(c.context.sectionId))
    }

    if (filter.tags && filter.tags.length > 0) {
      comments = comments.filter(c => 
        c.tags.some(tag => filter.tags!.includes(tag))
      )
    }

    if (filter.mentions && filter.mentions.length > 0) {
      comments = comments.filter(c => 
        c.mentions.some(mention => filter.mentions!.includes(mention))
      )
    }

    if (filter.hasAttachments !== undefined) {
      comments = comments.filter(c => 
        filter.hasAttachments ? c.attachments.length > 0 : c.attachments.length === 0
      )
    }

    if (filter.dateRange) {
      comments = comments.filter(c => 
        c.createdAt >= filter.dateRange!.start && 
        c.createdAt <= filter.dateRange!.end
      )
    }

    return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getCommentsBySection(sectionId: string): Comment[] {
    return this.getComments({ sections: [sectionId] })
  }

  getCommentThread(commentId: string): Comment[] {
    const comment = this.comments.get(commentId)
    if (!comment) return []

    // Find root comment
    let rootComment = comment
    while (rootComment.parentId) {
      const parent = this.comments.get(rootComment.parentId)
      if (!parent) break
      rootComment = parent
    }

    // Collect all replies recursively
    const collectReplies = (comment: Comment): Comment[] => {
      const replies = Array.from(this.comments.values())
        .filter(c => c.parentId === comment.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

      const result = [comment]
      for (const reply of replies) {
        result.push(...collectReplies(reply))
      }
      return result
    }

    return collectReplies(rootComment)
  }

  // Comment interactions
  async addReaction(commentId: string, emoji: string): Promise<void> {
    const comment = this.comments.get(commentId)
    if (!comment) return

    // Remove existing reaction from this user
    comment.reactions = comment.reactions.filter(r => r.userId !== this.currentUserId)

    // Add new reaction
    comment.reactions.push({
      userId: this.currentUserId,
      userName: this.currentUserName,
      emoji,
      timestamp: new Date()
    })

    comment.updatedAt = new Date()
    await this.saveComment(comment)

    this.hapticFeedback('light')
    this.triggerEvent('reactionAdded', { commentId, emoji, userId: this.currentUserId })
  }

  async resolveComment(commentId: string): Promise<void> {
    const comment = this.comments.get(commentId)
    if (!comment) return

    comment.status = 'resolved'
    comment.resolvedAt = new Date()
    comment.resolvedBy = this.currentUserId
    comment.updatedAt = new Date()

    await this.saveComment(comment)

    // Resolve entire thread if this is the root comment
    if (!comment.parentId) {
      const thread = Array.from(this.threads.values())
        .find(t => t.rootCommentId === commentId)
      if (thread) {
        thread.status = 'resolved'
      }
    }

    this.hapticFeedback('success')
    this.triggerEvent('commentResolved', { commentId, userId: this.currentUserId })
  }

  async editComment(commentId: string, newContent: string): Promise<void> {
    const comment = this.comments.get(commentId)
    if (!comment || comment.authorId !== this.currentUserId) return

    comment.content = newContent
    comment.updatedAt = new Date()

    await this.saveComment(comment)
    this.triggerEvent('commentEdited', { commentId, newContent })
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = this.comments.get(commentId)
    if (!comment || comment.authorId !== this.currentUserId) return

    // Delete all replies first
    const replies = Array.from(this.comments.values())
      .filter(c => c.parentId === commentId)
    
    for (const reply of replies) {
      await this.deleteComment(reply.id)
    }

    this.comments.delete(commentId)
    this.triggerEvent('commentDeleted', { commentId })
  }

  // Voice recording for mobile
  async startVoiceComment(): Promise<void> {
    if (!this.features.voiceComments || this.isRecording) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm; codecs=opus'
      })

      const audioChunks: BlobPart[] = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        this.triggerEvent('voiceRecordingComplete', { audioBlob })
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      this.mediaRecorder.start(250) // Collect data every 250ms
      this.isRecording = true
      this.hapticFeedback('start')
      
      this.triggerEvent('voiceRecordingStarted', {})
    } catch (error) {
      console.error('Failed to start voice recording:', error)
      throw new Error('Microphone access denied or not available')
    }
  }

  async stopVoiceComment(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording) return null

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false
        this.hapticFeedback('stop')
        this.triggerEvent('voiceRecordingStopped', {})
      }

      // Listen for the audioBlob from ondataavailable event
      this.addEventListener('voiceRecordingComplete', (data: { audioBlob: Blob }) => {
        resolve(data.audioBlob)
      })

      this.mediaRecorder.stop()
    })
  }

  // Mobile-specific features
  private setupPushNotifications() {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  private setupVoiceRecording() {
    // Voice recording setup is handled in startVoiceComment
  }

  private setupGestureSupport() {
    if (typeof window === 'undefined') return

    // Add touch gesture support for comment interactions
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true })
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  private handleTouchStart(e: TouchEvent) {
    // Handle swipe gestures for comment actions
  }

  private handleTouchMove(e: TouchEvent) {
    // Handle swipe gestures for comment actions
  }

  private handleTouchEnd(e: TouchEvent) {
    // Handle swipe gestures for comment actions
  }

  private hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'comment' | 'start' | 'stop') {
    if (!this.features.hapticFeedback || !navigator.vibrate) return

    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [100, 50, 100],
      error: [200, 100, 200],
      comment: [30, 10, 30],
      start: 50,
      stop: 25
    }

    navigator.vibrate(patterns[type] || 20)
  }

  // Utility methods
  private async saveComment(comment: Comment): Promise<void> {
    this.comments.set(comment.id, comment)
    // In production, save to server/database
  }

  private async createThread(comment: Comment): Promise<void> {
    const thread: CommentThread = {
      id: this.generateId(),
      rootCommentId: comment.id,
      participantIds: [comment.authorId],
      status: 'active',
      lastActivity: comment.createdAt,
      commentCount: 1,
      unreadCount: 0
    }

    this.threads.set(thread.id, thread)
  }

  private async addToThread(comment: Comment): Promise<void> {
    // Find thread containing the parent comment
    const thread = Array.from(this.threads.values())
      .find(t => this.isCommentInThread(t.id, comment.parentId!))
    
    if (thread) {
      if (!thread.participantIds.includes(comment.authorId)) {
        thread.participantIds.push(comment.authorId)
      }
      thread.lastActivity = comment.createdAt
      thread.commentCount++
      thread.unreadCount++
    }
  }

  private isCommentInThread(threadId: string, commentId: string): boolean {
    const thread = this.threads.get(threadId)
    if (!thread) return false

    const checkComment = (id: string): boolean => {
      const comment = this.comments.get(id)
      if (!comment) return false
      
      if (comment.id === thread.rootCommentId) return true
      if (comment.parentId) return checkComment(comment.parentId)
      return false
    }

    return checkComment(commentId)
  }

  private async sendNotifications(comment: Comment): Promise<void> {
    // Send notifications to mentioned users and thread participants
    const notifyUsers = new Set([...comment.mentions])

    // Add thread participants
    if (comment.parentId) {
      const thread = Array.from(this.threads.values())
        .find(t => this.isCommentInThread(t.id, comment.parentId!))
      if (thread) {
        thread.participantIds.forEach(id => notifyUsers.add(id))
      }
    }

    notifyUsers.delete(this.currentUserId) // Don't notify self

    for (const userId of notifyUsers) {
      const notification: CommentNotification = {
        id: this.generateId(),
        type: comment.mentions.includes(userId) ? 'mention' : 
              comment.parentId ? 'reply' : 'new_comment',
        commentId: comment.id,
        userId,
        message: this.generateNotificationMessage(comment),
        read: false,
        timestamp: new Date()
      }

      const userNotifications = this.notifications.get(userId) || []
      userNotifications.push(notification)
      this.notifications.set(userId, userNotifications)

      // Send push notification if enabled
      if (this.features.pushNotifications && Notification.permission === 'granted') {
        new Notification(`New comment from ${comment.authorName}`, {
          body: comment.content.substring(0, 100),
          icon: '/favicon.svg',
          tag: comment.id
        })
      }
    }
  }

  private generateNotificationMessage(comment: Comment): string {
    switch (comment.type) {
      case 'voice':
        return `${comment.authorName} left a voice comment`
      case 'suggestion':
        return `${comment.authorName} suggested an improvement`
      case 'highlight':
        return `${comment.authorName} highlighted text`
      case 'approval':
        return `${comment.authorName} reviewed your changes`
      default:
        return `${comment.authorName} commented`
    }
  }

  private async scheduleOfflineSync(): Promise<void> {
    if (navigator.onLine && this.offlineQueue.length > 0) {
      const queue = [...this.offlineQueue]
      this.offlineQueue = []
      
      for (const comment of queue) {
        await this.saveComment(comment)
      }
    }
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private getBrowserInfo(): string {
    const agent = navigator.userAgent
    if (agent.includes('Chrome')) return 'Chrome'
    if (agent.includes('Firefox')) return 'Firefox'
    if (agent.includes('Safari')) return 'Safari'
    if (agent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private async getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.src = URL.createObjectURL(blob)
    })
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

  // Getters
  getComment(id: string): Comment | undefined {
    return this.comments.get(id)
  }

  getUnreadNotifications(userId: string): CommentNotification[] {
    const notifications = this.notifications.get(userId) || []
    return notifications.filter(n => !n.read)
  }

  getThreads(): CommentThread[] {
    return Array.from(this.threads.values())
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  // Cleanup
  destroy() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }
    this.eventListeners.clear()
    this.comments.clear()
    this.threads.clear()
    this.notifications.clear()
  }
}

export default MobileCommentSystem
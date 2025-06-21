// Mobile Collaboration System for CVGenius
// Real-time collaboration, sharing, and feedback features optimized for mobile

export interface CollaborationRoom {
  id: string
  name: string
  description?: string
  ownerId: string
  ownerName: string
  type: 'cv-review' | 'template-design' | 'job-application' | 'interview-prep'
  status: 'active' | 'paused' | 'completed'
  participants: CollaborationParticipant[]
  permissions: RoomPermissions
  cvData?: any
  templateId?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface CollaborationParticipant {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'reviewer' | 'viewer'
  status: 'online' | 'away' | 'offline'
  joinedAt: Date
  lastSeen: Date
  avatar?: string
  permissions: ParticipantPermissions
}

export interface RoomPermissions {
  allowEdit: boolean
  allowComment: boolean
  allowShare: boolean
  allowExport: boolean
  allowInvite: boolean
  publicAccess: boolean
  requireApproval: boolean
  maxParticipants: number
}

export interface ParticipantPermissions {
  canEdit: boolean
  canComment: boolean
  canViewComments: boolean
  canShare: boolean
  canExport: boolean
  canInvite: boolean
  canManageParticipants: boolean
}

export interface CollaborationMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  type: 'text' | 'system' | 'edit' | 'comment' | 'file' | 'voice-note'
  content: string
  metadata?: {
    elementId?: string
    editType?: string
    fileUrl?: string
    fileName?: string
    voiceDuration?: number
  }
  timestamp: Date
  edited: boolean
  editedAt?: Date
  reactions: MessageReaction[]
}

export interface MessageReaction {
  userId: string
  emoji: string
  timestamp: Date
}

export interface CVEdit {
  id: string
  roomId: string
  userId: string
  userName: string
  type: 'text' | 'add' | 'delete' | 'move' | 'style'
  section: string
  elementId?: string
  oldValue?: any
  newValue?: any
  timestamp: Date
  applied: boolean
  conflictsWith?: string[]
}

export interface ShareLink {
  id: string
  roomId: string
  token: string
  createdBy: string
  permissions: ParticipantPermissions
  expiresAt?: Date
  useCount: number
  maxUses?: number
  password?: string
  allowedEmails?: string[]
}

export interface MobileCollaborationFeatures {
  touchGestures: boolean
  voiceComments: boolean
  offlineSync: boolean
  pushNotifications: boolean
  hapticFeedback: boolean
  quickActions: boolean
  swipeToComment: boolean
  voiceToText: boolean
}

// Default permissions
const DEFAULT_ROOM_PERMISSIONS: RoomPermissions = {
  allowEdit: true,
  allowComment: true,
  allowShare: true,
  allowExport: true,
  allowInvite: true,
  publicAccess: false,
  requireApproval: false,
  maxParticipants: 10
}

const DEFAULT_MOBILE_FEATURES: MobileCollaborationFeatures = {
  touchGestures: true,
  voiceComments: true,
  offlineSync: true,
  pushNotifications: true,
  hapticFeedback: true,
  quickActions: true,
  swipeToComment: true,
  voiceToText: true
}

export class MobileCollaborationManager {
  private rooms: Map<string, CollaborationRoom> = new Map()
  private messages: Map<string, CollaborationMessage[]> = new Map()
  private edits: Map<string, CVEdit[]> = new Map()
  private shareLinks: Map<string, ShareLink> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private currentUserId: string = ''
  private currentUserName: string = ''
  private mobileFeatures: MobileCollaborationFeatures

  constructor(userId: string, userName: string, mobileFeatures?: Partial<MobileCollaborationFeatures>) {
    this.currentUserId = userId
    this.currentUserName = userName
    this.mobileFeatures = { ...DEFAULT_MOBILE_FEATURES, ...mobileFeatures }
    this.initializeMobileFeatures()
  }

  private initializeMobileFeatures() {
    if (typeof window === 'undefined') return

    // Initialize mobile-specific features
    if (this.mobileFeatures.hapticFeedback && 'vibrate' in navigator) {
      this.setupHapticFeedback()
    }

    if (this.mobileFeatures.pushNotifications && 'Notification' in window) {
      this.setupPushNotifications()
    }

    if (this.mobileFeatures.voiceToText && 'webkitSpeechRecognition' in window) {
      this.setupVoiceToText()
    }

    if (this.mobileFeatures.touchGestures) {
      this.setupTouchGestures()
    }
  }

  // Room Management
  async createRoom(
    name: string, 
    type: CollaborationRoom['type'],
    options?: {
      description?: string
      permissions?: Partial<RoomPermissions>
      cvData?: any
      templateId?: string
      expiresIn?: number // hours
    }
  ): Promise<CollaborationRoom> {
    const roomId = this.generateId()
    const now = new Date()
    
    const room: CollaborationRoom = {
      id: roomId,
      name,
      description: options?.description,
      ownerId: this.currentUserId,
      ownerName: this.currentUserName,
      type,
      status: 'active',
      participants: [{
        id: this.currentUserId,
        name: this.currentUserName,
        email: '',
        role: 'owner',
        status: 'online',
        joinedAt: now,
        lastSeen: now,
        permissions: this.getOwnerPermissions()
      }],
      permissions: { ...DEFAULT_ROOM_PERMISSIONS, ...options?.permissions },
      cvData: options?.cvData,
      templateId: options?.templateId,
      createdAt: now,
      updatedAt: now,
      expiresAt: options?.expiresIn ? new Date(now.getTime() + options.expiresIn * 60 * 60 * 1000) : undefined
    }

    this.rooms.set(roomId, room)
    this.messages.set(roomId, [])
    this.edits.set(roomId, [])

    // Add system message
    await this.addSystemMessage(roomId, `${this.currentUserName} created the collaboration room`)

    this.triggerEvent('roomCreated', { room })
    this.hapticFeedback('success')

    return room
  }

  async joinRoom(roomId: string, token?: string): Promise<CollaborationRoom | null> {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Check if already a participant
    const existingParticipant = room.participants.find(p => p.id === this.currentUserId)
    if (existingParticipant) {
      existingParticipant.status = 'online'
      existingParticipant.lastSeen = new Date()
      this.triggerEvent('participantStatusChanged', { roomId, participant: existingParticipant })
      return room
    }

    // Check permissions and capacity
    if (room.participants.length >= room.permissions.maxParticipants) {
      throw new Error('Room is at maximum capacity')
    }

    // Add as participant
    const participant: CollaborationParticipant = {
      id: this.currentUserId,
      name: this.currentUserName,
      email: '',
      role: 'viewer',
      status: 'online',
      joinedAt: new Date(),
      lastSeen: new Date(),
      permissions: this.getViewerPermissions()
    }

    room.participants.push(participant)
    room.updatedAt = new Date()

    await this.addSystemMessage(roomId, `${this.currentUserName} joined the room`)
    
    this.triggerEvent('participantJoined', { roomId, participant })
    this.hapticFeedback('join')

    return room
  }

  async leaveRoom(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId)
    if (!room) return

    const participantIndex = room.participants.findIndex(p => p.id === this.currentUserId)
    if (participantIndex === -1) return

    if (room.participants[participantIndex].role === 'owner' && room.participants.length > 1) {
      // Transfer ownership to another participant
      const nextOwner = room.participants.find(p => p.id !== this.currentUserId && p.role === 'editor')
      if (nextOwner) {
        nextOwner.role = 'owner'
        nextOwner.permissions = this.getOwnerPermissions()
        await this.addSystemMessage(roomId, `${nextOwner.name} is now the room owner`)
      }
    }

    room.participants.splice(participantIndex, 1)
    room.updatedAt = new Date()

    await this.addSystemMessage(roomId, `${this.currentUserName} left the room`)

    this.triggerEvent('participantLeft', { roomId, userId: this.currentUserId })
    this.hapticFeedback('leave')

    // If no participants left, mark room as completed
    if (room.participants.length === 0) {
      room.status = 'completed'
    }
  }

  // Messaging
  async sendMessage(
    roomId: string, 
    content: string, 
    type: CollaborationMessage['type'] = 'text',
    metadata?: CollaborationMessage['metadata']
  ): Promise<CollaborationMessage> {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    const participant = room.participants.find(p => p.id === this.currentUserId)
    if (!participant) throw new Error('Not a participant in this room')

    const message: CollaborationMessage = {
      id: this.generateId(),
      roomId,
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      type,
      content,
      metadata,
      timestamp: new Date(),
      edited: false,
      reactions: []
    }

    const roomMessages = this.messages.get(roomId) || []
    roomMessages.push(message)
    this.messages.set(roomId, roomMessages)

    this.triggerEvent('messageReceived', { roomId, message })
    this.hapticFeedback('message')

    return message
  }

  async addVoiceComment(roomId: string, audioBlob: Blob, elementId?: string): Promise<CollaborationMessage> {
    if (!this.mobileFeatures.voiceComments) {
      throw new Error('Voice comments are disabled')
    }

    // Convert audio blob to base64 for storage (in real app, upload to server)
    const base64Audio = await this.blobToBase64(audioBlob)
    const duration = await this.getAudioDuration(audioBlob)

    return this.sendMessage(roomId, 'Voice comment', 'voice-note', {
      elementId,
      fileUrl: base64Audio,
      voiceDuration: duration
    })
  }

  async addReaction(roomId: string, messageId: string, emoji: string): Promise<void> {
    const roomMessages = this.messages.get(roomId) || []
    const message = roomMessages.find(m => m.id === messageId)
    if (!message) return

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(r => r.userId !== this.currentUserId)
    
    // Add new reaction
    message.reactions.push({
      userId: this.currentUserId,
      emoji,
      timestamp: new Date()
    })

    this.triggerEvent('reactionAdded', { roomId, messageId, emoji, userId: this.currentUserId })
    this.hapticFeedback('light')
  }

  // CV Editing
  async submitEdit(
    roomId: string,
    type: CVEdit['type'],
    section: string,
    elementId: string,
    oldValue: any,
    newValue: any
  ): Promise<CVEdit> {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    const participant = room.participants.find(p => p.id === this.currentUserId)
    if (!participant?.permissions.canEdit) {
      throw new Error('No edit permissions')
    }

    const edit: CVEdit = {
      id: this.generateId(),
      roomId,
      userId: this.currentUserId,
      userName: this.currentUserName,
      type,
      section,
      elementId,
      oldValue,
      newValue,
      timestamp: new Date(),
      applied: false,
      conflictsWith: []
    }

    // Check for conflicts
    const roomEdits = this.edits.get(roomId) || []
    const conflicts = roomEdits.filter(e => 
      e.elementId === elementId && 
      e.applied === false && 
      e.userId !== this.currentUserId
    )

    if (conflicts.length > 0) {
      edit.conflictsWith = conflicts.map(c => c.id)
    }

    roomEdits.push(edit)
    this.edits.set(roomId, roomEdits)

    // Auto-apply if no conflicts (in real app, this would be server-side)
    if (conflicts.length === 0) {
      edit.applied = true
      await this.addSystemMessage(roomId, `${this.currentUserName} edited ${section}`)
    }

    this.triggerEvent('editSubmitted', { roomId, edit })
    this.hapticFeedback('edit')

    return edit
  }

  async approveEdit(roomId: string, editId: string): Promise<void> {
    const roomEdits = this.edits.get(roomId) || []
    const edit = roomEdits.find(e => e.id === editId)
    if (!edit) return

    const room = this.rooms.get(roomId)
    const participant = room?.participants.find(p => p.id === this.currentUserId)
    
    if (!participant?.permissions.canEdit && participant?.role !== 'owner') {
      throw new Error('No approval permissions')
    }

    edit.applied = true
    await this.addSystemMessage(roomId, `${this.currentUserName} approved an edit by ${edit.userName}`)

    this.triggerEvent('editApproved', { roomId, edit })
    this.hapticFeedback('success')
  }

  // Sharing
  async createShareLink(
    roomId: string,
    options?: {
      permissions?: Partial<ParticipantPermissions>
      expiresIn?: number // hours
      maxUses?: number
      password?: string
      allowedEmails?: string[]
    }
  ): Promise<ShareLink> {
    const room = this.rooms.get(roomId)
    if (!room) throw new Error('Room not found')

    const participant = room.participants.find(p => p.id === this.currentUserId)
    if (!participant?.permissions.canShare) {
      throw new Error('No sharing permissions')
    }

    const shareLink: ShareLink = {
      id: this.generateId(),
      roomId,
      token: this.generateToken(),
      createdBy: this.currentUserId,
      permissions: { ...this.getViewerPermissions(), ...options?.permissions },
      expiresAt: options?.expiresIn ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000) : undefined,
      useCount: 0,
      maxUses: options?.maxUses,
      password: options?.password,
      allowedEmails: options?.allowedEmails
    }

    this.shareLinks.set(shareLink.token, shareLink)

    this.triggerEvent('shareLinkCreated', { roomId, shareLink })
    this.hapticFeedback('share')

    return shareLink
  }

  // Mobile-specific features
  private setupHapticFeedback() {
    // Haptic feedback patterns for different actions
  }

  private setupPushNotifications() {
    // Push notification setup for collaboration events
  }

  private setupVoiceToText() {
    // Voice-to-text for comments and messages
  }

  private setupTouchGestures() {
    // Touch gesture handling for mobile collaboration
  }

  private hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'join' | 'leave' | 'message' | 'edit' | 'share') {
    if (!this.mobileFeatures.hapticFeedback || typeof navigator === 'undefined' || !navigator.vibrate) return

    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [100, 50, 100],
      error: [200, 100, 200],
      join: [50, 25, 50],
      leave: [25, 50, 25],
      message: 15,
      edit: [30, 10, 30],
      share: [40, 20, 40, 20, 40]
    }

    navigator.vibrate(patterns[type] || 20)
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2, 16)
  }

  private async addSystemMessage(roomId: string, content: string): Promise<void> {
    await this.sendMessage(roomId, content, 'system')
  }

  private getOwnerPermissions(): ParticipantPermissions {
    return {
      canEdit: true,
      canComment: true,
      canViewComments: true,
      canShare: true,
      canExport: true,
      canInvite: true,
      canManageParticipants: true
    }
  }

  private getViewerPermissions(): ParticipantPermissions {
    return {
      canEdit: false,
      canComment: true,
      canViewComments: true,
      canShare: false,
      canExport: false,
      canInvite: false,
      canManageParticipants: false
    }
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
  getRoom(roomId: string): CollaborationRoom | undefined {
    return this.rooms.get(roomId)
  }

  getRoomMessages(roomId: string): CollaborationMessage[] {
    return this.messages.get(roomId) || []
  }

  getRoomEdits(roomId: string): CVEdit[] {
    return this.edits.get(roomId) || []
  }

  getUserRooms(): CollaborationRoom[] {
    return Array.from(this.rooms.values()).filter(room => 
      room.participants.some(p => p.id === this.currentUserId)
    )
  }
}

// Export singleton instance
export const collaborationManager = new MobileCollaborationManager('', '')

export default MobileCollaborationManager
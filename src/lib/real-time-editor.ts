// Real-time Collaborative Editor for CVGenius Mobile
// WebSocket-based collaborative editing with operational transformation

export interface EditorState {
  content: any
  version: number
  participants: EditorParticipant[]
  lastModified: Date
  locked: boolean
  lockHolder?: string
}

export interface EditorParticipant {
  id: string
  name: string
  color: string
  cursor?: CursorPosition
  selection?: SelectionRange
  isActive: boolean
  lastActivity: Date
}

export interface CursorPosition {
  sectionId: string
  elementId?: string
  offset: number
  visible: boolean
}

export interface SelectionRange {
  sectionId: string
  elementId?: string
  start: number
  end: number
}

export interface Operation {
  id: string
  type: 'insert' | 'delete' | 'retain' | 'format' | 'move'
  sectionId: string
  elementId?: string
  position: number
  content?: any
  length?: number
  attributes?: Record<string, any>
  userId: string
  timestamp: Date
  version: number
}

export interface OperationResult {
  success: boolean
  transformedOps: Operation[]
  newVersion: number
  conflicts?: Conflict[]
}

export interface Conflict {
  id: string
  operationIds: string[]
  type: 'concurrent_edit' | 'format_conflict' | 'structure_change'
  description: string
  resolutionOptions: ConflictResolution[]
}

export interface ConflictResolution {
  id: string
  description: string
  action: 'accept_mine' | 'accept_theirs' | 'merge' | 'ignore'
  preview?: any
}

export interface CollaborativeChange {
  operation: Operation
  beforeState: any
  afterState: any
  participant: EditorParticipant
}

// Operational Transformation for text operations
class OperationalTransform {
  static transform(op1: Operation, op2: Operation): { op1Prime: Operation; op2Prime: Operation } {
    const op1Prime = { ...op1 }
    const op2Prime = { ...op2 }

    // Same position operations
    if (op1.sectionId === op2.sectionId && op1.position === op2.position) {
      if (op1.type === 'insert' && op2.type === 'insert') {
        // Both insertions at same position - prioritize by timestamp
        if (op1.timestamp.getTime() < op2.timestamp.getTime()) {
          op2Prime.position += op1.content?.length || 1
        } else {
          op1Prime.position += op2.content?.length || 1
        }
      } else if (op1.type === 'delete' && op2.type === 'delete') {
        // Both deletions at same position - merge ranges
        const maxLength = Math.max(op1.length || 0, op2.length || 0)
        op1Prime.length = maxLength
        op2Prime.length = 0 // Second operation becomes no-op
      }
    }
    // Different positions
    else if (op1.sectionId === op2.sectionId) {
      if (op1.type === 'insert' && op2.position > op1.position) {
        op2Prime.position += op1.content?.length || 1
      } else if (op1.type === 'delete' && op2.position > op1.position) {
        const deleteEnd = op1.position + (op1.length || 1)
        if (op2.position >= deleteEnd) {
          op2Prime.position -= op1.length || 1
        } else {
          // Operation falls within deleted range
          op2Prime.position = op1.position
        }
      }
    }

    return { op1Prime, op2Prime }
  }

  static transformMultiple(operations: Operation[]): Operation[] {
    const sorted = [...operations].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const transformed: Operation[] = []

    for (let i = 0; i < sorted.length; i++) {
      let currentOp = sorted[i]
      
      // Transform against all previous operations
      for (let j = 0; j < transformed.length; j++) {
        const { op1Prime } = this.transform(currentOp, transformed[j])
        currentOp = op1Prime
      }
      
      transformed.push(currentOp)
    }

    return transformed
  }
}

export class RealTimeEditor {
  private state: EditorState
  private pendingOperations: Operation[] = []
  private operationHistory: Operation[] = []
  private websocket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Function[]> = new Map()
  private userId: string
  private userColor: string
  private heartbeatInterval: NodeJS.Timeout | null = null
  private conflictResolver: ConflictResolver

  constructor(userId: string, userName: string, roomId: string) {
    this.userId = userId
    this.userColor = this.generateUserColor()
    this.conflictResolver = new ConflictResolver()
    
    this.state = {
      content: {},
      version: 0,
      participants: [{
        id: userId,
        name: userName,
        color: this.userColor,
        isActive: true,
        lastActivity: new Date()
      }],
      lastModified: new Date(),
      locked: false
    }

    this.connectWebSocket(roomId)
  }

  private connectWebSocket(roomId: string) {
    try {
      // In production, use actual WebSocket server
      const wsUrl = `wss://api.cvgenius.ie/collaborate/${roomId}`
      // For development, simulate WebSocket
      this.simulateWebSocket()
      
      this.setupHeartbeat()
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private simulateWebSocket() {
    // Simulate WebSocket for development
    this.websocket = {
      send: (data: string) => {
        const message = JSON.parse(data)
        // Echo back for testing
        setTimeout(() => {
          this.handleWebSocketMessage({ data: JSON.stringify(message) } as MessageEvent)
        }, 100)
      },
      close: () => {},
      readyState: WebSocket.OPEN
    } as WebSocket

    this.triggerEvent('connected', { userId: this.userId })
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'heartbeat',
          userId: this.userId,
          timestamp: new Date()
        })
      }
    }, 30000) // 30 seconds
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'operation':
          this.handleRemoteOperation(message.operation)
          break
        case 'participant_joined':
          this.handleParticipantJoined(message.participant)
          break
        case 'participant_left':
          this.handleParticipantLeft(message.userId)
          break
        case 'cursor_update':
          this.handleCursorUpdate(message.userId, message.cursor)
          break
        case 'selection_update':
          this.handleSelectionUpdate(message.userId, message.selection)
          break
        case 'state_sync':
          this.handleStateSync(message.state)
          break
        case 'conflict':
          this.handleConflict(message.conflict)
          break
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error)
    }
  }

  // Core editing operations
  async applyOperation(operation: Operation): Promise<OperationResult> {
    // Add to pending operations
    operation.version = this.state.version + 1
    this.pendingOperations.push(operation)

    // Transform against concurrent operations
    const transformed = OperationalTransform.transformMultiple([
      ...this.pendingOperations,
      operation
    ])

    // Apply to local state
    const result = this.applyOperationToState(transformed[transformed.length - 1])
    
    if (result.success) {
      this.state.version = result.newVersion
      this.state.lastModified = new Date()
      this.operationHistory.push(operation)

      // Send to other participants
      this.sendMessage({
        type: 'operation',
        operation: transformed[transformed.length - 1],
        userId: this.userId
      })

      // Clear pending operations
      this.pendingOperations = []

      this.triggerEvent('operationApplied', { operation, result })
    }

    return result
  }

  private applyOperationToState(operation: Operation): OperationResult {
    const beforeContent = JSON.parse(JSON.stringify(this.state.content))
    
    try {
      switch (operation.type) {
        case 'insert':
          this.applyInsert(operation)
          break
        case 'delete':
          this.applyDelete(operation)
          break
        case 'format':
          this.applyFormat(operation)
          break
        case 'move':
          this.applyMove(operation)
          break
      }

      return {
        success: true,
        transformedOps: [operation],
        newVersion: this.state.version + 1
      }
    } catch (error) {
      // Revert state
      this.state.content = beforeContent
      
      return {
        success: false,
        transformedOps: [],
        newVersion: this.state.version,
        conflicts: [{
          id: this.generateId(),
          operationIds: [operation.id],
          type: 'concurrent_edit',
          description: `Failed to apply ${operation.type} operation`,
          resolutionOptions: [
            {
              id: 'retry',
              description: 'Retry operation',
              action: 'accept_mine'
            },
            {
              id: 'ignore',
              description: 'Ignore operation',
              action: 'ignore'
            }
          ]
        }]
      }
    }
  }

  private applyInsert(operation: Operation) {
    const section = this.state.content[operation.sectionId] || {}
    
    if (operation.elementId) {
      const element = section[operation.elementId] || ''
      const content = typeof element === 'string' ? element : element.text || ''
      const newContent = content.slice(0, operation.position) + 
                         operation.content + 
                         content.slice(operation.position)
      
      if (typeof element === 'string') {
        section[operation.elementId] = newContent
      } else {
        section[operation.elementId] = { ...element, text: newContent }
      }
    } else {
      // Insert new element
      section[operation.position] = operation.content
    }
    
    this.state.content[operation.sectionId] = section
  }

  private applyDelete(operation: Operation) {
    const section = this.state.content[operation.sectionId] || {}
    
    if (operation.elementId) {
      const element = section[operation.elementId] || ''
      const content = typeof element === 'string' ? element : element.text || ''
      const newContent = content.slice(0, operation.position) + 
                         content.slice(operation.position + (operation.length || 1))
      
      if (typeof element === 'string') {
        section[operation.elementId] = newContent
      } else {
        section[operation.elementId] = { ...element, text: newContent }
      }
    } else {
      // Delete element
      delete section[operation.position]
    }
    
    this.state.content[operation.sectionId] = section
  }

  private applyFormat(operation: Operation) {
    const section = this.state.content[operation.sectionId] || {}
    
    if (operation.elementId && operation.attributes) {
      const element = section[operation.elementId]
      if (typeof element === 'object') {
        section[operation.elementId] = { ...element, ...operation.attributes }
      } else {
        section[operation.elementId] = { text: element, ...operation.attributes }
      }
    }
    
    this.state.content[operation.sectionId] = section
  }

  private applyMove(operation: Operation) {
    // Move operation implementation
    const section = this.state.content[operation.sectionId] || {}
    // Implementation depends on specific data structure
    this.state.content[operation.sectionId] = section
  }

  // Participant management
  updateCursor(sectionId: string, elementId: string, offset: number) {
    const participant = this.state.participants.find(p => p.id === this.userId)
    if (participant) {
      participant.cursor = {
        sectionId,
        elementId,
        offset,
        visible: true
      }
      participant.lastActivity = new Date()

      this.sendMessage({
        type: 'cursor_update',
        userId: this.userId,
        cursor: participant.cursor
      })

      this.triggerEvent('cursorMoved', { userId: this.userId, cursor: participant.cursor })
    }
  }

  updateSelection(sectionId: string, elementId: string, start: number, end: number) {
    const participant = this.state.participants.find(p => p.id === this.userId)
    if (participant) {
      participant.selection = {
        sectionId,
        elementId,
        start,
        end
      }
      participant.lastActivity = new Date()

      this.sendMessage({
        type: 'selection_update',
        userId: this.userId,
        selection: participant.selection
      })

      this.triggerEvent('selectionChanged', { userId: this.userId, selection: participant.selection })
    }
  }

  // Remote operation handling
  private handleRemoteOperation(operation: Operation) {
    if (operation.userId === this.userId) return

    // Transform against pending operations
    const transformedOps = OperationalTransform.transformMultiple([
      ...this.pendingOperations,
      operation
    ])

    // Apply transformed operation
    const result = this.applyOperationToState(transformedOps[transformedOps.length - 1])
    
    if (result.success) {
      this.state.version = Math.max(this.state.version, operation.version)
      this.triggerEvent('remoteOperationApplied', { operation, result })
    } else if (result.conflicts) {
      this.handleConflict(result.conflicts[0])
    }
  }

  private handleParticipantJoined(participant: EditorParticipant) {
    const existing = this.state.participants.find(p => p.id === participant.id)
    if (!existing) {
      this.state.participants.push(participant)
      this.triggerEvent('participantJoined', { participant })
    }
  }

  private handleParticipantLeft(userId: string) {
    this.state.participants = this.state.participants.filter(p => p.id !== userId)
    this.triggerEvent('participantLeft', { userId })
  }

  private handleCursorUpdate(userId: string, cursor: CursorPosition) {
    const participant = this.state.participants.find(p => p.id === userId)
    if (participant) {
      participant.cursor = cursor
      participant.lastActivity = new Date()
      this.triggerEvent('cursorUpdated', { userId, cursor })
    }
  }

  private handleSelectionUpdate(userId: string, selection: SelectionRange) {
    const participant = this.state.participants.find(p => p.id === userId)
    if (participant) {
      participant.selection = selection
      participant.lastActivity = new Date()
      this.triggerEvent('selectionUpdated', { userId, selection })
    }
  }

  private handleStateSync(newState: EditorState) {
    this.state = { ...newState }
    this.triggerEvent('stateSynced', { state: newState })
  }

  private handleConflict(conflict: Conflict) {
    this.triggerEvent('conflictDetected', { conflict })
  }

  // Conflict resolution
  async resolveConflict(conflictId: string, resolutionId: string): Promise<void> {
    await this.conflictResolver.resolve(conflictId, resolutionId, this.state)
    this.triggerEvent('conflictResolved', { conflictId, resolutionId })
  }

  // Utility methods
  private sendMessage(message: any) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message))
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connectWebSocket('')
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
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
  getState(): EditorState {
    return { ...this.state }
  }

  getParticipants(): EditorParticipant[] {
    return [...this.state.participants]
  }

  getOperationHistory(): Operation[] {
    return [...this.operationHistory]
  }

  // Cleanup
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    if (this.websocket) {
      this.websocket.close()
    }
    
    this.eventListeners.clear()
    this.pendingOperations = []
    this.operationHistory = []
  }
}

// Conflict resolution system
class ConflictResolver {
  private resolutions: Map<string, ConflictResolution> = new Map()

  async resolve(conflictId: string, resolutionId: string, state: EditorState): Promise<void> {
    const resolution = this.resolutions.get(resolutionId)
    if (!resolution) return

    switch (resolution.action) {
      case 'accept_mine':
        // Keep current state
        break
      case 'accept_theirs':
        // Apply conflicting operation
        break
      case 'merge':
        // Attempt to merge changes
        break
      case 'ignore':
        // Ignore the conflict
        break
    }
  }

  registerResolution(resolution: ConflictResolution) {
    this.resolutions.set(resolution.id, resolution)
  }
}

export default RealTimeEditor
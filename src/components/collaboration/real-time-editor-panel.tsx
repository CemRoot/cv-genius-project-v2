'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Edit3,
  Users,
  Eye,
  Lock,
  Unlock,
  Save,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  MousePointer,
  Zap
} from 'lucide-react'
import {
  RealTimeEditor,
  type EditorState,
  type EditorParticipant,
  type Operation,
  type Conflict
} from '@/lib/real-time-editor'

interface RealTimeEditorPanelProps {
  roomId: string
  userId: string
  userName: string
  initialContent?: any
  onContentChange?: (content: any) => void
  onConflict?: (conflict: Conflict) => void
}

export default function RealTimeEditorPanel({
  roomId,
  userId,
  userName,
  initialContent = {},
  onContentChange,
  onConflict
}: RealTimeEditorPanelProps) {
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>('summary')
  const [content, setContent] = useState<Record<string, any>>(initialContent)
  const [cursors, setCursors] = useState<Map<string, any>>(new Map())
  const [selections, setSelections] = useState<Map<string, any>>(new Map())
  
  const editorRef = useRef<RealTimeEditor | null>(null)
  const textAreaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const lastContentRef = useRef<Record<string, any>>(initialContent)

  // Initialize real-time editor
  useEffect(() => {
    const editor = new RealTimeEditor(userId, userName, roomId)
    editorRef.current = editor

    // Set up event listeners
    editor.addEventListener('connected', handleConnected)
    editor.addEventListener('operationApplied', handleOperationApplied)
    editor.addEventListener('remoteOperationApplied', handleRemoteOperationApplied)
    editor.addEventListener('participantJoined', handleParticipantJoined)
    editor.addEventListener('participantLeft', handleParticipantLeft)
    editor.addEventListener('cursorUpdated', handleCursorUpdated)
    editor.addEventListener('selectionUpdated', handleSelectionUpdated)
    editor.addEventListener('conflictDetected', handleConflictDetected)
    editor.addEventListener('stateSynced', handleStateSynced)

    setEditorState(editor.getState())
    setIsConnected(true)

    return () => {
      editor.destroy()
    }
  }, [roomId, userId, userName])

  // Event handlers
  const handleConnected = useCallback(() => {
    setIsConnected(true)
  }, [])

  const handleOperationApplied = useCallback((data: { operation: Operation; result: any }) => {
    setEditorState(editorRef.current?.getState() || null)
    onContentChange?.(content)
  }, [content, onContentChange])

  const handleRemoteOperationApplied = useCallback((data: { operation: Operation; result: any }) => {
    const newState = editorRef.current?.getState()
    if (newState) {
      setEditorState(newState)
      setContent(newState.content)
      onContentChange?.(newState.content)
    }
  }, [onContentChange])

  const handleParticipantJoined = useCallback((data: { participant: EditorParticipant }) => {
    setEditorState(editorRef.current?.getState() || null)
  }, [])

  const handleParticipantLeft = useCallback((data: { userId: string }) => {
    setEditorState(editorRef.current?.getState() || null)
    setCursors(prev => {
      const newCursors = new Map(prev)
      newCursors.delete(data.userId)
      return newCursors
    })
    setSelections(prev => {
      const newSelections = new Map(prev)
      newSelections.delete(data.userId)
      return newSelections
    })
  }, [])

  const handleCursorUpdated = useCallback((data: { userId: string; cursor: any }) => {
    setCursors(prev => new Map(prev.set(data.userId, data.cursor)))
  }, [])

  const handleSelectionUpdated = useCallback((data: { userId: string; selection: any }) => {
    setSelections(prev => new Map(prev.set(data.userId, data.selection)))
  }, [])

  const handleConflictDetected = useCallback((data: { conflict: Conflict }) => {
    setConflicts(prev => [...prev, data.conflict])
    onConflict?.(data.conflict)
  }, [onConflict])

  const handleStateSynced = useCallback((data: { state: EditorState }) => {
    setEditorState(data.state)
    setContent(data.state.content)
  }, [])

  // Content editing
  const handleTextChange = useCallback(async (sectionId: string, elementId: string, newText: string) => {
    if (!editorRef.current) return

    const oldText = content[sectionId]?.[elementId] || ''
    const oldTextStr = typeof oldText === 'string' ? oldText : oldText.text || ''
    
    if (newText === oldTextStr) return

    // Find the difference and create appropriate operations
    const operations = diffToOperations(oldTextStr, newText, sectionId, elementId)
    
    for (const op of operations) {
      try {
        await editorRef.current.applyOperation(op)
      } catch (error) {
        console.error('Failed to apply operation:', error)
      }
    }

    // Update local content
    setContent(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [elementId]: newText
      }
    }))

    lastContentRef.current = content
  }, [content])

  const handleCursorChange = useCallback((sectionId: string, elementId: string, position: number) => {
    editorRef.current?.updateCursor(sectionId, elementId, position)
  }, [])

  const handleSelectionChange = useCallback((sectionId: string, elementId: string, start: number, end: number) => {
    if (start !== end) {
      editorRef.current?.updateSelection(sectionId, elementId, start, end)
    }
  }, [])

  // Conflict resolution
  const resolveConflict = useCallback(async (conflictId: string, resolutionId: string) => {
    if (!editorRef.current) return

    try {
      await editorRef.current.resolveConflict(conflictId, resolutionId)
      setConflicts(prev => prev.filter(c => c.id !== conflictId))
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }, [])

  // Utility functions
  const diffToOperations = (oldText: string, newText: string, sectionId: string, elementId: string): Operation[] => {
    const operations: Operation[] = []
    
    // Simple diff implementation - in production, use a proper diff algorithm
    if (newText.length > oldText.length) {
      // Text was inserted
      const insertPos = findInsertPosition(oldText, newText)
      const insertedText = newText.slice(insertPos, insertPos + (newText.length - oldText.length))
      
      operations.push({
        id: generateId(),
        type: 'insert',
        sectionId,
        elementId,
        position: insertPos,
        content: insertedText,
        userId,
        timestamp: new Date(),
        version: editorState?.version || 0
      })
    } else if (newText.length < oldText.length) {
      // Text was deleted
      const deletePos = findDeletePosition(oldText, newText)
      const deleteLength = oldText.length - newText.length
      
      operations.push({
        id: generateId(),
        type: 'delete',
        sectionId,
        elementId,
        position: deletePos,
        length: deleteLength,
        userId,
        timestamp: new Date(),
        version: editorState?.version || 0
      })
    }
    
    return operations
  }

  const findInsertPosition = (oldText: string, newText: string): number => {
    for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
      if (oldText[i] !== newText[i]) {
        return i
      }
    }
    return oldText.length
  }

  const findDeletePosition = (oldText: string, newText: string): number => {
    for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
      if (oldText[i] !== newText[i]) {
        return i
      }
    }
    return newText.length
  }

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9)
  }

  const getParticipantColor = (participantId: string): string => {
    const participant = editorState?.participants.find(p => p.id === participantId)
    return participant?.color || '#6B7280'
  }

  const renderParticipantCursor = (sectionId: string, elementId: string, participantId: string) => {
    const cursor = cursors.get(participantId)
    if (!cursor || cursor.sectionId !== sectionId || cursor.elementId !== elementId || !cursor.visible) {
      return null
    }

    const participant = editorState?.participants.find(p => p.id === participantId)
    if (!participant || participant.id === userId) return null

    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: `${cursor.offset * 8}px`, // Approximate character width
          borderLeft: `2px solid ${participant.color}`,
          height: '20px',
          marginTop: '2px'
        }}
      >
        <div
          className="absolute -top-6 -left-1 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
          style={{ backgroundColor: participant.color }}
        >
          {participant.name}
        </div>
      </div>
    )
  }

  const renderParticipantSelection = (sectionId: string, elementId: string, participantId: string) => {
    const selection = selections.get(participantId)
    if (!selection || selection.sectionId !== sectionId || selection.elementId !== elementId) {
      return null
    }

    const participant = editorState?.participants.find(p => p.id === participantId)
    if (!participant || participant.id === userId) return null

    const startPos = Math.min(selection.start, selection.end)
    const endPos = Math.max(selection.start, selection.end)
    const width = (endPos - startPos) * 8 // Approximate character width

    return (
      <div
        className="absolute pointer-events-none z-5"
        style={{
          left: `${startPos * 8}px`,
          width: `${width}px`,
          height: '20px',
          backgroundColor: participant.color,
          opacity: 0.3,
          marginTop: '2px'
        }}
      />
    )
  }

  const sections = [
    { id: 'summary', label: 'Professional Summary' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ]

  if (!editorState) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="font-medium">Connecting to real-time editor...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Real-time Collaborative Editor
                {isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
              </CardTitle>
              <CardDescription>
                Version {editorState.version} • {editorState.participants.length} participants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {editorState.locked && (
                <Badge variant="destructive">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>

          {/* Participants */}
          <div className="flex flex-wrap gap-2 mt-3">
            {editorState.participants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-sm">{participant.name}</span>
                {participant.isActive ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Conflicts Detected ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="font-medium text-orange-900 mb-2">{conflict.description}</div>
                  <div className="flex gap-2">
                    {conflict.resolutionOptions.map((resolution) => (
                      <Button
                        key={resolution.id}
                        variant="outline"
                        size="sm"
                        onClick={() => resolveConflict(conflict.id, resolution.id)}
                      >
                        {resolution.description}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>

          {/* Editor Content */}
          <div className="space-y-4">
            {sections
              .filter(section => selectedSection === section.id)
              .map((section) => (
                <div key={section.id} className="space-y-3">
                  <label className="text-sm font-medium">{section.label}</label>
                  
                  {/* Text Editor with Collaborative Features */}
                  <div className="relative">
                    {/* Participant selections */}
                    {Array.from(selections.keys()).map(participantId => 
                      renderParticipantSelection(section.id, 'text', participantId)
                    )}
                    
                    {/* Main textarea */}
                    <Textarea
                      ref={(el) => {
                        if (el) textAreaRefs.current.set(section.id, el)
                      }}
                      value={content[section.id]?.text || ''}
                      onChange={(e) => handleTextChange(section.id, 'text', e.target.value)}
                      onSelect={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        handleSelectionChange(section.id, 'text', target.selectionStart, target.selectionEnd)
                      }}
                      onKeyUp={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        handleCursorChange(section.id, 'text', target.selectionStart)
                      }}
                      onClick={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        handleCursorChange(section.id, 'text', target.selectionStart)
                      }}
                      placeholder={`Enter ${section.label.toLowerCase()}...`}
                      rows={6}
                      className="resize-none relative"
                    />

                    {/* Participant cursors */}
                    {Array.from(cursors.keys()).map(participantId => 
                      renderParticipantCursor(section.id, 'text', participantId)
                    )}
                  </div>

                  {/* Section-specific participants */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {editorState.participants
                      .filter(p => p.cursor?.sectionId === section.id || p.selection?.sectionId === section.id)
                      .map(p => (
                        <span key={p.id} style={{ color: p.color }}>
                          {p.name}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{editorState.version}</div>
              <div className="text-xs text-gray-600">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {editorState.participants.filter(p => p.isActive).length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{conflicts.length}</div>
              <div className="text-xs text-gray-600">Conflicts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {new Date(editorState.lastModified).toLocaleTimeString()}
              </div>
              <div className="text-xs text-gray-600">Last Change</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
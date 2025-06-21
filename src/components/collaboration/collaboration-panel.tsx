'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Users,
  MessageSquare,
  Share2,
  Edit3,
  Mic,
  MicOff,
  Send,
  Heart,
  ThumbsUp,
  Smile,
  Clock,
  Eye,
  Settings,
  UserPlus,
  Copy,
  Check,
  X,
  Play,
  Pause,
  Volume2
} from 'lucide-react'
import { 
  MobileCollaborationManager,
  type CollaborationRoom,
  type CollaborationMessage,
  type CVEdit,
  type ParticipantPermissions
} from '@/lib/collaboration'

interface CollaborationPanelProps {
  roomId?: string
  cvData?: any
  onRoomCreated?: (room: CollaborationRoom) => void
  onEditApplied?: (edit: CVEdit) => void
}

export default function CollaborationPanel({ 
  roomId, 
  cvData, 
  onRoomCreated, 
  onEditApplied 
}: CollaborationPanelProps) {
  const [room, setRoom] = useState<CollaborationRoom | null>(null)
  const [messages, setMessages] = useState<CollaborationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showCreateRoom, setShowCreateRoom] = useState(!roomId)
  const [shareLink, setShareLink] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const collaborationRef = useRef<MobileCollaborationManager | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize collaboration manager
    const userId = 'user_' + Math.random().toString(36).substr(2, 9)
    const userName = 'User ' + Math.floor(Math.random() * 1000)
    
    collaborationRef.current = new MobileCollaborationManager(userId, userName, {
      touchGestures: true,
      voiceComments: true,
      hapticFeedback: true,
      pushNotifications: true
    })

    // Set up event listeners
    const manager = collaborationRef.current
    
    manager.addEventListener('messageReceived', handleMessageReceived)
    manager.addEventListener('participantJoined', handleParticipantJoined)
    manager.addEventListener('editSubmitted', handleEditSubmitted)
    manager.addEventListener('shareLinkCreated', handleShareLinkCreated)

    // Join existing room or show create dialog
    if (roomId) {
      joinExistingRoom(roomId)
    }

    return () => {
      // Cleanup
      if (roomId && collaborationRef.current) {
        collaborationRef.current.leaveRoom(roomId)
      }
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMessageReceived = (data: { roomId: string; message: CollaborationMessage }) => {
    if (data.roomId === roomId) {
      setMessages(prev => [...prev, data.message])
    }
  }

  const handleParticipantJoined = (data: { roomId: string; participant: any }) => {
    if (data.roomId === roomId && room) {
      setRoom(prev => prev ? {
        ...prev,
        participants: [...prev.participants, data.participant]
      } : null)
    }
  }

  const handleEditSubmitted = (data: { roomId: string; edit: CVEdit }) => {
    if (data.roomId === roomId && data.edit.applied) {
      onEditApplied?.(data.edit)
    }
  }

  const handleShareLinkCreated = (data: { roomId: string; shareLink: any }) => {
    const link = `${window.location.origin}/collaborate/${data.shareLink.token}`
    setShareLink(link)
  }

  const joinExistingRoom = async (id: string) => {
    if (!collaborationRef.current) return

    try {
      const joinedRoom = await collaborationRef.current.joinRoom(id)
      if (joinedRoom) {
        setRoom(joinedRoom)
        const roomMessages = collaborationRef.current.getRoomMessages(id)
        setMessages(roomMessages)
        setShowCreateRoom(false)
      }
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleCreateRoom = async (name: string, type: 'cv-review' | 'template-design' = 'cv-review') => {
    if (!collaborationRef.current) return

    try {
      const newRoom = await collaborationRef.current.createRoom(name, type, {
        description: 'Mobile CV collaboration session',
        cvData,
        permissions: {
          allowEdit: true,
          allowComment: true,
          allowShare: true,
          allowExport: true,
          allowInvite: true,
          publicAccess: false,
          requireApproval: false,
          maxParticipants: 5
        }
      })

      setRoom(newRoom)
      setMessages([])
      setShowCreateRoom(false)
      onRoomCreated?.(newRoom)
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !room || !collaborationRef.current) return

    try {
      await collaborationRef.current.sendMessage(room.id, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        if (room && collaborationRef.current) {
          await collaborationRef.current.addVoiceComment(room.id, audioBlob)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!room || !collaborationRef.current) return

    try {
      await collaborationRef.current.addReaction(room.id, messageId, emoji)
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleCreateShareLink = async () => {
    if (!room || !collaborationRef.current) return

    try {
      await collaborationRef.current.createShareLink(room.id, {
        permissions: {
          canComment: true,
          canViewComments: true,
          canEdit: false,
          canShare: false,
          canExport: false,
          canInvite: false,
          canManageParticipants: false
        },
        expiresIn: 24 // 24 hours
      })
      setShowShareDialog(true)
    } catch (error) {
      console.error('Failed to create share link:', error)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      // Show success feedback
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const playVoiceMessage = async (message: CollaborationMessage) => {
    if (!message.metadata?.fileUrl) return

    if (playingAudio === message.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingAudio(null)
      return
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(message.metadata.fileUrl)
      audioRef.current.onended = () => setPlayingAudio(null)
      
      await audioRef.current.play()
      setPlayingAudio(message.id)
    } catch (error) {
      console.error('Failed to play voice message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  if (showCreateRoom) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Start Collaboration
          </CardTitle>
          <CardDescription>
            Create a room to collaborate on your CV with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreateRoomForm onCreateRoom={handleCreateRoom} />
        </CardContent>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="font-medium">Loading collaboration room...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Room Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">{room.type}</Badge>
                <span>{room.participants.length} participants</span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateShareLink}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Participants */}
          <div className="flex flex-wrap gap-2 mt-3">
            {room.participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`} />
                <span className="text-sm">{participant.name}</span>
                <Badge variant="secondary" size="sm">{participant.role}</Badge>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.type !== 'text' && (
                        <Badge variant="outline" size="sm">{message.type}</Badge>
                      )}
                    </div>
                    
                    {message.type === 'voice-note' ? (
                      <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playVoiceMessage(message)}
                        >
                          {playingAudio === message.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Volume2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          Voice message ({message.metadata?.voiceDuration?.toFixed(1)}s)
                        </span>
                      </div>
                    ) : (
                      <div className={`${
                        message.type === 'system' 
                          ? 'text-gray-600 italic text-sm' 
                          : 'text-gray-900'
                      }`}>
                        {message.content}
                      </div>
                    )}

                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {message.reactions.map((reaction, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 rounded-full px-2 py-1 text-xs"
                          >
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick reactions */}
                    {message.type === 'text' && message.senderId !== collaborationRef.current?.currentUserId && (
                      <div className="flex gap-1 mt-2">
                        {['👍', '❤️', '😊'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className="text-sm hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={1}
                className="resize-none min-h-[40px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={handleStartRecording}
                  onMouseUp={handleStopRecording}
                  onTouchStart={handleStartRecording}
                  onTouchEnd={handleStopRecording}
                  className={isRecording ? 'bg-red-100 text-red-600' : ''}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {showShareDialog && shareLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Collaboration Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              This link allows others to join as viewers and comment on your CV. 
              The link expires in 24 hours.
            </div>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Create Room Form Component
function CreateRoomForm({ onCreateRoom }: { onCreateRoom: (name: string, type: 'cv-review' | 'template-design') => void }) {
  const [roomName, setRoomName] = useState('')
  const [roomType, setRoomType] = useState<'cv-review' | 'template-design'>('cv-review')

  const handleSubmit = () => {
    if (roomName.trim()) {
      onCreateRoom(roomName.trim(), roomType)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Room Name</label>
        <Input
          placeholder="e.g., John's CV Review"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Room Type</label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="cv-review"
              checked={roomType === 'cv-review'}
              onChange={(e) => setRoomType(e.target.value as 'cv-review')}
            />
            <span className="text-sm">CV Review & Feedback</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="template-design"
              checked={roomType === 'template-design'}
              onChange={(e) => setRoomType(e.target.value as 'template-design')}
            />
            <span className="text-sm">Template Design Session</span>
          </label>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!roomName.trim()} className="w-full">
        <Users className="h-4 w-4 mr-2" />
        Create Room
      </Button>
    </div>
  )
}
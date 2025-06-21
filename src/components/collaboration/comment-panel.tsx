'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare,
  Plus,
  Mic,
  MicOff,
  Send,
  Reply,
  Heart,
  ThumbsUp,
  Smile,
  Check,
  X,
  Edit,
  Trash2,
  Play,
  Pause,
  Volume2,
  Tag,
  AtSign,
  Paperclip,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Clock,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  MobileCommentSystem,
  type Comment,
  type CommentFilter,
  type CommentThread
} from '@/lib/comment-system'

interface CommentPanelProps {
  sectionId?: string
  userId: string
  userName: string
  onCommentSelect?: (comment: Comment) => void
  onCommentCreate?: (comment: Comment) => void
}

export default function CommentPanel({
  sectionId,
  userId,
  userName,
  onCommentSelect,
  onCommentCreate
}: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [filter, setFilter] = useState<CommentFilter>({})
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())

  const commentSystemRef = useRef<MobileCommentSystem | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Initialize comment system
  useEffect(() => {
    const commentSystem = new MobileCommentSystem(userId, userName, {
      voiceComments: true,
      swipeActions: true,
      hapticFeedback: true,
      quickReactions: true,
      offlineComments: true,
      pushNotifications: true
    })

    commentSystemRef.current = commentSystem

    // Set up event listeners
    commentSystem.addEventListener('commentCreated', handleCommentCreated)
    commentSystem.addEventListener('commentEdited', handleCommentEdited)
    commentSystem.addEventListener('commentDeleted', handleCommentDeleted)
    commentSystem.addEventListener('commentResolved', handleCommentResolved)
    commentSystem.addEventListener('reactionAdded', handleReactionAdded)
    commentSystem.addEventListener('voiceRecordingComplete', handleVoiceRecordingComplete)

    // Load initial comments
    loadComments()

    return () => {
      commentSystem.destroy()
    }
  }, [userId, userName])

  // Filter comments when filter changes
  useEffect(() => {
    if (commentSystemRef.current) {
      const filtered = commentSystemRef.current.getComments(filter)
      setFilteredComments(filtered)
    }
  }, [filter, comments])

  // Event handlers
  const handleCommentCreated = useCallback((data: { comment: Comment }) => {
    setComments(prev => [data.comment, ...prev])
    onCommentCreate?.(data.comment)
  }, [onCommentCreate])

  const handleCommentEdited = useCallback((data: { commentId: string; newContent: string }) => {
    setComments(prev => prev.map(c => 
      c.id === data.commentId ? { ...c, content: data.newContent, updatedAt: new Date() } : c
    ))
  }, [])

  const handleCommentDeleted = useCallback((data: { commentId: string }) => {
    setComments(prev => prev.filter(c => c.id !== data.commentId))
  }, [])

  const handleCommentResolved = useCallback((data: { commentId: string }) => {
    setComments(prev => prev.map(c => 
      c.id === data.commentId 
        ? { ...c, status: 'resolved' as const, resolvedAt: new Date() } 
        : c
    ))
  }, [])

  const handleReactionAdded = useCallback((data: { commentId: string; emoji: string; userId: string }) => {
    loadComments() // Refresh to get updated reactions
  }, [])

  const handleVoiceRecordingComplete = useCallback(async (data: { audioBlob: Blob }) => {
    if (!commentSystemRef.current || !sectionId) return

    try {
      const comment = await commentSystemRef.current.createVoiceComment(
        data.audioBlob,
        {
          sectionId,
          version: 1
        },
        {
          parentId: replyTo || undefined
        }
      )
      
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to create voice comment:', error)
    }
  }, [sectionId, replyTo])

  // Comment operations
  const loadComments = useCallback(() => {
    if (commentSystemRef.current) {
      const allComments = sectionId 
        ? commentSystemRef.current.getCommentsBySection(sectionId)
        : commentSystemRef.current.getComments()
      
      setComments(allComments)
      setThreads(commentSystemRef.current.getThreads())
    }
  }, [sectionId])

  const handleCreateComment = async () => {
    if (!newComment.trim() || !commentSystemRef.current || !sectionId) return

    try {
      await commentSystemRef.current.createComment(
        newComment.trim(),
        {
          sectionId,
          version: 1
        },
        {
          parentId: replyTo || undefined,
          priority: 'medium'
        }
      )

      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleStartVoiceComment = async () => {
    if (!commentSystemRef.current) return

    try {
      await commentSystemRef.current.startVoiceComment()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start voice comment:', error)
      alert('Microphone access is required for voice comments')
    }
  }

  const handleStopVoiceComment = async () => {
    if (!commentSystemRef.current) return

    try {
      const audioBlob = await commentSystemRef.current.stopVoiceComment()
      setIsRecording(false)
      
      if (audioBlob) {
        // Voice comment will be created via the event handler
      }
    } catch (error) {
      console.error('Failed to stop voice comment:', error)
    }
  }

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!commentSystemRef.current) return

    try {
      await commentSystemRef.current.addReaction(commentId, emoji)
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleResolveComment = async (commentId: string) => {
    if (!commentSystemRef.current) return

    try {
      await commentSystemRef.current.resolveComment(commentId)
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!commentSystemRef.current) return

    try {
      await commentSystemRef.current.deleteComment(commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const playVoiceComment = async (comment: Comment) => {
    const voiceAttachment = comment.attachments.find(a => a.type === 'voice')
    if (!voiceAttachment) return

    if (playingAudio === comment.id) {
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

      audioRef.current = new Audio(voiceAttachment.url)
      audioRef.current.onended = () => setPlayingAudio(null)
      
      await audioRef.current.play()
      setPlayingAudio(comment.id)
    } catch (error) {
      console.error('Failed to play voice comment:', error)
    }
  }

  const toggleThread = (commentId: string) => {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedThreads(newExpanded)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getCommentIcon = (type: Comment['type']) => {
    switch (type) {
      case 'voice': return <Volume2 className="h-4 w-4" />
      case 'suggestion': return <Edit className="h-4 w-4" />
      case 'highlight': return <Tag className="h-4 w-4" />
      case 'approval': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Comment['status']) => {
    switch (status) {
      case 'resolved': return 'text-green-600'
      case 'archived': return 'text-gray-400'
      default: return 'text-gray-900'
    }
  }

  const getPriorityColor = (priority: Comment['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-300 bg-white'
    }
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const isExpanded = expandedThreads.has(comment.id)
    const replies = comments.filter(c => c.parentId === comment.id)
    const voiceAttachment = comment.attachments.find(a => a.type === 'voice')

    return (
      <div key={comment.id} className={`space-y-2 ${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div 
          className={`border rounded-lg p-4 ${getPriorityColor(comment.priority)} ${
            selectedComment === comment.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => {
            setSelectedComment(comment.id)
            onCommentSelect?.(comment)
          }}
        >
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getCommentIcon(comment.type)}
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
              {comment.type !== 'text' && (
                <Badge variant="outline" size="sm">{comment.type}</Badge>
              )}
              {comment.priority !== 'medium' && (
                <Badge 
                  variant={comment.priority === 'critical' ? 'destructive' : 'secondary'} 
                  size="sm"
                >
                  {comment.priority}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {comment.status === 'resolved' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {comment.authorId === userId && (
                <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Voice Comment */}
          {voiceAttachment && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playVoiceComment(comment)}
              >
                {playingAudio === comment.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Voice comment ({voiceAttachment.duration?.toFixed(1)}s)
              </span>
            </div>
          )}

          {/* Comment Content */}
          <div className={`text-sm ${getStatusColor(comment.status)}`}>
            {comment.content}
          </div>

          {/* Tags and Mentions */}
          {(comment.tags.length > 0 || comment.mentions.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {comment.tags.map((tag, index) => (
                <Badge key={index} variant="outline" size="sm">
                  #{tag}
                </Badge>
              ))}
              {comment.mentions.map((mention, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  @{mention}
                </Badge>
              ))}
            </div>
          )}

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {comment.reactions.reduce((acc, reaction) => {
                const existing = acc.find(r => r.emoji === reaction.emoji)
                if (existing) {
                  existing.count++
                  existing.users.push(reaction.userName)
                } else {
                  acc.push({
                    emoji: reaction.emoji,
                    count: 1,
                    users: [reaction.userName]
                  })
                }
                return acc
              }, [] as Array<{emoji: string, count: number, users: string[]}>).map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(comment.id, reaction.emoji)}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs transition-colors"
                  title={reaction.users.join(', ')}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)}>
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {/* Quick Reactions */}
            <div className="flex gap-1">
              {['👍', '❤️', '😊'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className="text-sm hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {comment.status !== 'resolved' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleResolveComment(comment.id)}
                className="ml-auto"
              >
                <Check className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>

          {/* Replies Toggle */}
          {replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleThread(comment.id)}
              className="mt-2 w-full justify-start"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {replies.length} replies
            </Button>
          )}
        </div>

        {/* Replies */}
        {isExpanded && replies.map(reply => renderComment(reply, true))}

        {/* Reply Form */}
        {replyTo === comment.id && (
          <div className="ml-8 mt-2">
            <ReplyForm
              onSubmit={handleCreateComment}
              onCancel={() => setReplyTo(null)}
              value={newComment}
              onChange={setNewComment}
              isRecording={isRecording}
              onStartRecording={handleStartVoiceComment}
              onStopRecording={handleStopVoiceComment}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments {sectionId && `- ${sectionId}`}
              </CardTitle>
              <CardDescription>
                {filteredComments.length} comments • {threads.filter(t => t.status === 'active').length} active threads
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={loadComments}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    types: e.target.value ? [e.target.value as Comment['type']] : undefined 
                  }))}
                >
                  <option value="">All types</option>
                  <option value="text">Text</option>
                  <option value="voice">Voice</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="highlight">Highlight</option>
                  <option value="approval">Approval</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    statuses: e.target.value ? [e.target.value as Comment['status']] : undefined 
                  }))}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    priorities: e.target.value ? [e.target.value as Comment['priority']] : undefined 
                  }))}
                >
                  <option value="">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Comment Form */}
      {!replyTo && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onMouseDown={handleStartVoiceComment}
                    onMouseUp={handleStopVoiceComment}
                    onTouchStart={handleStartVoiceComment}
                    onTouchEnd={handleStopVoiceComment}
                    className={isRecording ? 'bg-red-100 text-red-600' : ''}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleCreateComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.filter(c => !c.parentId).map(comment => renderComment(comment))}
        
        {filteredComments.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <div className="font-medium">No comments yet</div>
                <div className="text-sm mt-1">Be the first to add a comment</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Reply Form Component
function ReplyForm({
  onSubmit,
  onCancel,
  value,
  onChange,
  isRecording,
  onStartRecording,
  onStopRecording
}: {
  onSubmit: () => void
  onCancel: () => void
  value: string
  onChange: (value: string) => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
}) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <Textarea
        placeholder="Write a reply..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={onStartRecording}
            onMouseUp={onStopRecording}
            onTouchStart={onStartRecording}
            onTouchEnd={onStopRecording}
            className={isRecording ? 'bg-red-100 text-red-600' : ''}
          >
            {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={!value.trim()}>
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}
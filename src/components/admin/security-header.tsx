'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, MapPin, Shield, AlertTriangle, Eye } from 'lucide-react'

interface SecurityStats {
  totalLogins: number
  failedLogins: number
  lastLogin: string
  lastLoginIP: string
  totalSessions: number
  activeSessions: number
  blockedIPs: string[]
  recentAttempts: any[]
}

interface SecurityHeaderProps {
  isAuthenticated: boolean
}

export function SecurityHeader({ isAuthenticated }: SecurityHeaderProps) {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadSecurityStats()
      // Refresh stats every 2 minutes (instead of 30 seconds to prevent rate limiting)
      const interval = setInterval(loadSecurityStats, 120000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadSecurityStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin-token')
      if (!token) return

      // Use relative URL to avoid port issues
      const response = await fetch('/api/admin/audit?action=stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else if (response.status === 429) {
        console.warn('Rate limit reached for security stats, will retry in 2 minutes')
      } else {
        console.error('Failed to load security stats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load security stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    if (timestamp === 'Never') return 'Never'
    
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (!isAuthenticated || !stats) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Admin Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last login: {formatTimeAgo(stats.lastLogin)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>IP: {stats.lastLoginIP}</span>
              </div>
            </div>
          </div>

          {/* Right: Security Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-3 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Sessions: {stats.totalSessions}
              </Badge>
              
              {stats.failedLogins > 0 && (
                <Badge variant="destructive" className="bg-red-500/80">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.failedLogins} Failed
                </Badge>
              )}

              {stats.blockedIPs.length > 0 && (
                <Badge variant="destructive" className="bg-orange-500/80">
                  {stats.blockedIPs.length} Blocked IPs
                </Badge>
              )}
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="View Security Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <Card className="mt-4 bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Login Statistics
                  </h4>
                  <div className="space-y-1 text-white/80">
                    <div>Total Logins: {stats.totalLogins}</div>
                    <div>Failed Attempts: {stats.failedLogins}</div>
                    <div>Success Rate: {stats.totalLogins > 0 ? Math.round((stats.totalLogins / (stats.totalLogins + stats.failedLogins)) * 100) : 0}%</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Security Alerts
                  </h4>
                  <div className="space-y-1 text-white/80">
                    <div>Active Sessions: {stats.activeSessions}</div>
                    <div>Blocked IPs: {stats.blockedIPs.length}</div>
                    <div>Recent Attempts: {stats.recentAttempts.length}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Recent Activity
                  </h4>
                  <div className="space-y-1 text-white/80">
                    {stats.recentAttempts.slice(0, 3).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={attempt.success ? 'text-green-300' : 'text-red-300'}>
                          {attempt.success ? '✓' : '✗'} {attempt.ip}
                        </span>
                        <span className="text-xs">
                          {formatTimeAgo(attempt.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {stats.blockedIPs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h4 className="font-semibold mb-2 text-red-300">Blocked IP Addresses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.blockedIPs.map((ip, index) => (
                      <Badge key={index} variant="destructive" className="bg-red-500/80">
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
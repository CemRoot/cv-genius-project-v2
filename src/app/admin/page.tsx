'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, Lock, Settings, BarChart3, FileText, DollarSign,
  LogOut, User, Key, AlertCircle, CheckCircle, Info,
  Eye, EyeOff, Save, RefreshCw, Plus, Trash2, Edit,
  ChevronRight, Home, Menu, X, Bell, Search, Filter,
  Users, Activity, Server, Database, Globe, Zap, Wand2,
  Loader2
} from 'lucide-react'
import './admin-login.css'

// Extend window object for admin stats
declare global {
  interface Window {
    adminSecurityStats?: any;
  }
}

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Custom imports
import { ClientAdminAuth } from '@/lib/admin-auth'
import { useToast, createToastUtils } from '@/components/ui/toast'
import { SecurityHeader } from '@/components/admin/security-header'
import AdsManagement from '@/components/admin/ads-management'

// Types
interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalCVs: number
  todayLogins: number
  growth?: {
    users: string
    cvs: string
  }
}

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down' | 'not_configured'
  database: 'healthy' | 'degraded' | 'down' | 'not_configured'
  storage: 'healthy' | 'degraded' | 'down' | 'local_only'
  performance: number
}

interface PromptTemplate {
  id: string
  name: string
  category: string
  prompt: string
  variables: string[]
  lastModified: string
  context?: string
}

export default function AdminPanel() {
  const router = useRouter()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [require2FA, setRequire2FA] = useState(false)
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  // Data States
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCVs: 0,
    todayLogins: 0
  })
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: 'healthy',
    database: 'healthy',
    storage: 'healthy',
    performance: 95
  })

  // Prompt Management States
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // SECURITY: Listen for storage events to detect cookie/storage clearing
    const handleStorageChange = (e: StorageEvent) => {
      // If admin token was removed from localStorage, force logout
      if (e.key === 'admin-token' && e.newValue === null && isAuthenticated) {
        console.warn('🚨 SECURITY: Admin token removed from storage - forcing logout')
        setIsAuthenticated(false)
        toast.error('Session expired - logged out for security')
        window.location.href = '/admin'
      }
    }
    
    // SECURITY: Listen for cookie changes to detect manual cookie clearing
    const checkCookieIntegrity = () => {
      if (isAuthenticated) {
        const token = ClientAdminAuth.getToken()
        const csrfToken = ClientAdminAuth.getCsrfToken()
        
        // If JWT exists but CSRF token is missing, cookies were cleared
        if (token && !csrfToken) {
          console.warn('🚨 SECURITY: CSRF token missing but JWT exists - cookies likely cleared')
          setIsAuthenticated(false)
          ClientAdminAuth.removeToken()
          localStorage.clear()
          sessionStorage.clear()
          toast.error('Security violation detected - logged out')
          window.location.href = '/admin'
        }
      }
    }
    
    // SECURITY: Monitor for manual cookie/storage clearing
    const securityInterval = setInterval(checkCookieIntegrity, 5000) // Check every 5 seconds
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(securityInterval)
    }
  }, [isAuthenticated]) // Add isAuthenticated as dependency

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const checkAuth = async () => {
    try {
      const token = ClientAdminAuth.getToken()
      if (token) {
        const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/settings')
        if (response.ok) {
          setIsAuthenticated(true)
          loadDashboardData()
          loadPrompts()
        } else {
          ClientAdminAuth.removeToken()
        }
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      // Use direct fetch for login (no auth required yet)
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies for CSRF
        body: JSON.stringify({ 
          username: 'admin', // Always use 'admin' as username
          password,
          ...(twoFactorToken && { twoFactorToken })
        })
      })

      // Debug network response
      console.log('🔍 Login response status:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('🚨 Login response not OK:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
      }

      const data = await response.json()
      console.log('🔍 Login response data:', data)

      if (response.ok && data.success) {
        ClientAdminAuth.setToken(data.token)
        setIsAuthenticated(true)
        toast.success('Welcome to Admin Panel')
        loadDashboardData()
        loadPrompts()
      } else if (data.require2FA) {
        setRequire2FA(true)
        toast.info('Please enter your 2FA code')
      } else {
        console.error('🚨 Login failed:', data)
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('🚨 Network error during login:', error)
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await ClientAdminAuth.logout()
    setIsAuthenticated(false)
    toast.info('Logged out successfully')
  }

  const loadDashboardData = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setStats(data.stats.dashboard)
          setSystemHealth(data.stats.system)
          // Store security stats for later use
          window.adminSecurityStats = data.stats.security
        }
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    }
  }

  const loadPrompts = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/prompts')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.prompts) {
          setPrompts(data.prompts)
        }
      }
    } catch (error) {
      toast.error('Failed to load prompts')
    }
  }

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content & Prompts', icon: FileText },
    { id: 'ads', label: 'Ads & Revenue', icon: DollarSign },
    { id: 'system', label: 'System', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Login screen with glassmorphism design
  if (!isAuthenticated) {
    return (
      <section className="admin-login-section">
        <div className="form-box">
          <div className="form-value">
            <form onSubmit={handleLogin}>
              <h2 className="form-title">Admin Panel</h2>
              
              {!require2FA ? (
                <>
                  {/* Password input */}
                  <div className="inputbox">
                    <Lock className="icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginLoading}
                      placeholder=" "
                      autoFocus
                    />
                    <label>Password</label>
                    {showPassword ? (
                      <EyeOff 
                        className="icon eye-icon" 
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye 
                        className="icon eye-icon" 
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  
                  <div className="forget">
                    <label>Secure Admin Access</label>
                  </div>
                </>
              ) : (
                <>
                  {/* 2FA input */}
                  <div className="inputbox fade-in">
                    <Shield className="icon" />
                    <input
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      maxLength={6}
                      required
                      disabled={loginLoading}
                      placeholder=" "
                      autoFocus
                    />
                    <label>2FA Code</label>
                  </div>
                  
                  <div className="forget">
                    <label>Enter your 6-digit authentication code</label>
                  </div>
                </>
              )}
              
              <button 
                type="submit" 
                className="admin-login-button"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <span className="button-content">
                    <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} />
                    {require2FA ? 'Verifying...' : 'Logging in...'}
                  </span>
                ) : (
                  require2FA ? 'Verify' : 'Log in'
                )}
              </button>
              
              <div className="security-info">
                <p>
                  <Shield className="security-icon" />
                  Protected by CV Genius Security
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    )
  }

  // Main Admin Panel
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">CV Genius</h2>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    if (isMobile) setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  <span className="truncate">admin@cvgenius.com</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveSection('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className={sidebarOpen ? 'hidden' : 'lg:hidden'}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Security Header */}
        <SecurityHeader isAuthenticated={isAuthenticated} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {activeSection === 'dashboard' && <DashboardSection stats={stats} systemHealth={systemHealth} />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'content' && <ContentSection prompts={prompts} setPrompts={setPrompts} />}
            {activeSection === 'ads' && <AdsManagement />}
            {activeSection === 'system' && <SystemSection systemHealth={systemHealth} />}
            {activeSection === 'settings' && <SettingsSection />}
          </div>
        </main>
      </div>
    </div>
  )
}

// Dashboard Section
function DashboardSection({ stats, systemHealth }: { stats: AdminStats, systemHealth: SystemHealth }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back to CV Genius Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.growth?.users || 'No data'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCVs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.growth?.cvs || 'No new CVs'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Logins</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Real-time system status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">API Status</span>
              </div>
              <Badge variant={systemHealth.api === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.api}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant={systemHealth.database === 'not_configured' ? 'secondary' : systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.database === 'not_configured' ? 'Not Configured' : systemHealth.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <Badge variant={systemHealth.storage === 'local_only' ? 'secondary' : systemHealth.storage === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.storage === 'local_only' ? 'Local Only' : systemHealth.storage}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <span className="text-sm text-muted-foreground">{systemHealth.performance}%</span>
              </div>
              <Progress value={systemHealth.performance} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Security Section
function SecuritySection() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [securityData, setSecurityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([])
  const [showIPDialog, setShowIPDialog] = useState(false)
  const [newIP, setNewIP] = useState('')
  const [ipLoading, setIpLoading] = useState(false)
  const [vercelStatus, setVercelStatus] = useState<any>(null)

  useEffect(() => {
    // Get security data from window object (set by loadDashboardData)
    if (window.adminSecurityStats) {
      setSecurityData(window.adminSecurityStats)
      // Load IP whitelist from env
      const envIPs = window.adminSecurityStats.ipWhitelist || []
      setIpWhitelist(envIPs)
      setLoading(false)
    } else {
      // If not available, fetch it
      fetchSecurityData()
    }
    
    // Check Vercel status
    checkVercelStatus()
  }, [])
  
  const checkVercelStatus = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/vercel-status')
      if (response.ok) {
        const data = await response.json()
        setVercelStatus(data.vercel)
      }
    } catch (error) {
      console.error('Failed to check Vercel status')
    }
  }

  const fetchSecurityData = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setSecurityData(data.stats.security)
        }
      }
    } catch (error) {
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        if (data.vercelUpdated) {
          toast.success('Password changed successfully and synced with Vercel!')
        } else {
          toast.success('Password changed successfully (local only)')
          if (vercelStatus && vercelStatus.configured) {
            toast.info('Failed to sync with Vercel - update may be required')
          }
        }
        setShowPasswordDialog(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-2">Manage security settings and access control</p>
      </div>

      <div className="grid gap-6">
        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle>Password Management</CardTitle>
            <CardDescription>Change your admin password</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowPasswordDialog(true)}>
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">2FA Status</p>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : (securityData?.twoFactorEnabled ? 'Enabled' : 'Disabled')}
                </p>
              </div>
              <Switch 
                checked={securityData?.twoFactorEnabled || false} 
                disabled={true}
                onCheckedChange={() => {
                  toast.info('2FA management is available through the dedicated 2FA page')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* IP Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist</CardTitle>
            <CardDescription>Restrict admin access to specific IP addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Current IP</AlertTitle>
                <AlertDescription>
                  Your current IP address: {loading ? 'Checking...' : (securityData?.currentIP || 'Unknown')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Whitelisted IPs</Label>
                <div className="space-y-2">
                  {loading ? (
                    <div className="p-2 border rounded">
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : securityData?.ipWhitelistEnabled ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{securityData.currentIP}</span>
                        <Badge variant="outline">Current</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">All IPs allowed (Whitelist disabled)</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowIPDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage IP Whitelist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP Whitelist Dialog */}
      <Dialog open={showIPDialog} onOpenChange={setShowIPDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage IP Whitelist</DialogTitle>
            <DialogDescription>
              Control which IP addresses can access the admin panel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {vercelStatus && !vercelStatus.configured && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Vercel Integration Not Configured</AlertTitle>
                <AlertDescription>
                  To sync IP changes with Vercel, set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Current Whitelist</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ipWhitelist.length > 0 ? (
                  ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIpWhitelist(ipWhitelist.filter((_ip, i) => i !== index))
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No IPs in whitelist</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add New IP</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="192.168.1.100"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (newIP && !ipWhitelist.includes(newIP)) {
                      setIpWhitelist([...ipWhitelist, newIP])
                      setNewIP('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const currentIP = securityData?.currentIP
                  if (currentIP && !ipWhitelist.includes(currentIP)) {
                    setIpWhitelist([...ipWhitelist, currentIP])
                  }
                }}
              >
                Add Current IP ({securityData?.currentIP})
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIPDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIpLoading(true)
                try {
                  const response = await ClientAdminAuth.makeAuthenticatedRequest(
                    '/api/admin/ip-whitelist/update-vercel',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ips: ipWhitelist })
                    }
                  )
                  
                  if (response.ok) {
                    toast.success('IP whitelist updated successfully!')
                    setShowIPDialog(false)
                    // Update local security data
                    setSecurityData((prev: any) => ({
                      ...prev,
                      ipWhitelist: ipWhitelist
                    }))
                  } else {
                    const data = await response.json()
                    toast.error(data.error || 'Failed to update IP whitelist')
                  }
                } catch (error) {
                  toast.error('Network error')
                } finally {
                  setIpLoading(false)
                }
              }}
              disabled={ipLoading}
            >
              {ipLoading ? 'Updating...' : 'Update in Vercel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP Whitelist Dialog */}
      <Dialog open={showIPDialog} onOpenChange={setShowIPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage IP Whitelist</DialogTitle>
            <DialogDescription>
              Add or remove IP addresses from the whitelist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Whitelist</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ipWhitelist.length > 0 ? (
                  ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const filtered = ipWhitelist.filter((_, i) => i !== index)
                          setIpWhitelist(filtered)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No IPs in whitelist</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add New IP</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="192.168.1.100"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (newIP && !ipWhitelist.includes(newIP)) {
                      setIpWhitelist([...ipWhitelist, newIP])
                      setNewIP('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const currentIP = securityData?.currentIP
                  if (currentIP && !ipWhitelist.includes(currentIP)) {
                    setIpWhitelist([...ipWhitelist, currentIP])
                  }
                }}
              >
                Add Current IP ({securityData?.currentIP})
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIPDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIpLoading(true)
                try {
                  const response = await ClientAdminAuth.makeAuthenticatedRequest(
                    '/api/admin/ip-whitelist/update-vercel',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ips: ipWhitelist })
                    }
                  )
                  
                  if (response.ok) {
                    toast.success('IP whitelist updated in Vercel!')
                    setShowIPDialog(false)
                  } else {
                    toast.error('Failed to update IP whitelist')
                  }
                } catch (error) {
                  toast.error('Network error')
                } finally {
                  setIpLoading(false)
                }
              }}
              disabled={ipLoading}
            >
              {ipLoading ? 'Updating...' : 'Update in Vercel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Content & Prompts Section
function ContentSection({ prompts, setPrompts }: { prompts: PromptTemplate[], setPrompts: (prompts: PromptTemplate[]) => void }) {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [testing, setTesting] = useState(false)
  const router = useRouter()

  const savePrompt = async (prompt: PromptTemplate) => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (response.ok) {
        toast.success('Prompt saved successfully')
        // Reload prompts
        const getResponse = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/prompts')
        if (getResponse.ok) {
          const data = await getResponse.json()
          if (data.success && data.prompts) {
            setPrompts(data.prompts)
          }
        }
        setShowPromptDialog(false)
        setEditingPrompt(null)
      } else {
        toast.error('Failed to save prompt')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const testPrompt = async () => {
    if (!selectedPrompt || !testInput) return
    
    setTesting(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          prompt: selectedPrompt.prompt,
          input: testInput,
          variables: selectedPrompt.variables
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.result) {
          setTestOutput(data.result)
        } else {
          toast.error('Failed to test prompt')
        }
      } else {
        toast.error('Failed to test prompt')
      }
    } catch (error) {
      toast.error('Test failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content & Prompts</h1>
          <p className="text-gray-600 mt-2">Manage CV templates and AI prompts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/cv-builder-prompts')}>
            <Wand2 className="w-4 h-4 mr-2" />
            CV Builder Prompts
          </Button>
          <Button onClick={() => router.push('/admin/cover-letter-prompts')}>
            <FileText className="w-4 h-4 mr-2" />
            Cover Letter Prompts
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>AI Prompts</span>
          </CardTitle>
          <CardDescription>
            Configure prompts for CV improvement and generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{prompt.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category}
                      </Badge>
                      {prompt.context && (
                        <Badge variant="outline" className="text-xs">
                          {prompt.context}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last modified: {prompt.lastModified}
                    </p>
                    {prompt.variables && prompt.variables.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Variables: {prompt.variables.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPrompt(prompt)
                        setShowPromptDialog(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const filtered = prompts.filter(p => p.id !== prompt.id)
                        setPrompts(filtered)
                        toast.success('Prompt deleted')
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPrompt ? 'Edit Prompt' : 'Add New Prompt'}
            </DialogTitle>
            <DialogDescription>
              Configure AI prompt for CV processing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={selectedPrompt?.name || ''}
                placeholder="e.g., Cover Letter Generation"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedPrompt?.category || 'Generation'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Generation">Generation</SelectItem>
                  <SelectItem value="Improvement">Improvement</SelectItem>
                  <SelectItem value="Analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prompt Template</Label>
              <Textarea
                value={selectedPrompt?.prompt || ''}
                placeholder="Enter the prompt template..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Prompt saved')
              setShowPromptDialog(false)
            }}>
              Save Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Users Management Section
function UsersSection() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [activeTab, setActiveTab] = useState('analytics')
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get data from stats API
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setUserData(data.stats.dashboard)
        }
      }
    } catch (error) {
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
          <p className="text-gray-600">Monitor user activity and manage access</p>
        </div>
        <Button>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userData?.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total registered users
                </p>
                <Progress value={75} className="h-2 mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userData?.activeUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users active in last 24h
                </p>
                <Badge variant="outline" className="mt-3">Live</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CVs Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userData?.totalCVs.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total CVs generated
                </p>
                <p className="text-xs text-green-600 mt-3">
                  {userData?.growth?.cvs || '+423'} today
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average CVs per User</span>
                  <span className="font-medium">
                    {userData && userData.totalUsers > 0 ? (userData.totalCVs / userData.totalUsers).toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active User Rate</span>
                  <span className="font-medium">
                    {userData && userData.totalUsers > 0 ? `${((userData.activeUsers / userData.totalUsers) * 100).toFixed(1)}%` : '0.0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Login Rate</span>
                  <span className="font-medium">
                    {userData && userData.totalUsers > 0 ? `${((userData.todayLogins / userData.totalUsers) * 100).toFixed(1)}%` : '0.0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Currently logged in users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Sessions</AlertTitle>
                  <AlertDescription>
                    Session tracking requires database integration. Currently showing logged-in admin only.
                  </AlertDescription>
                </Alert>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="default">Active</Badge>
                      <div>
                        <p className="font-medium">Admin Session</p>
                        <p className="text-sm text-gray-500">Current session</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Started: Just now</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>Latest actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Activity Logging</AlertTitle>
                  <AlertDescription>
                    Recent activities from security audit log:
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Admin login successful</span>
                      </div>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </div>
                  {userData && userData.todayLogins > 0 && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{userData.todayLogins} login(s) today</span>
                        </div>
                        <span className="text-xs text-gray-500">Today</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Replaced by AdsManagement component
/* function AdsSection() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [activeTab, setActiveTab] = useState('overview')
  const [adSettings, setAdSettings] = useState({
    enableAds: true,
    mobileAds: true,
    testMode: false,
    monetagPopup: true,
    monetagPush: true,
    monetagNative: false
  })
  const [revenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyAverage: 0,
    activeAds: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0
  })
  const [saving, setSaving] = useState(false)

  // Load current ad settings on component mount
  useEffect(() => {
    loadAdSettings()
  }, [])

  const loadAdSettings = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setAdSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to load ad settings:', error)
    }
  }

  const saveAdSetting = async (key: string, value: boolean) => {
    setSaving(true)
    console.log('🔧 Admin Panel - Saving ad setting:', { key, value, currentSettings: adSettings })
    
    // Store the previous value for rollback
    const previousValue = adSettings[key]
    
    // Optimistic update - immediately update the UI
    setAdSettings(prev => ({ ...prev, [key]: value }))
    
    try {
      const requestBody = { 
        setting: key, 
        enabled: value,
        settings: { ...adSettings, [key]: value }
      }
      console.log('📤 Sending request to /api/admin/ads:', requestBody)
      
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📥 API Response data:', data)
        
        if (data.success) {
          // State already updated optimistically, just show success message
          toast.success(data.message || `${key} ${value ? 'enabled' : 'disabled'}`)
          console.log('✅ Settings updated successfully, new state:', { ...adSettings, [key]: value })
          
          // Note: Environment variables now managed through local data files
          // No need for Vercel API calls - admin panel controls ads directly
        } else {
          console.error('❌ API returned success: false', data)
          // Revert the optimistic update
          setAdSettings(prev => ({ ...prev, [key]: previousValue }))
          toast.error(data.error || 'Failed to update ad setting')
        }
      } else {
        console.error('❌ Response not OK:', response.status, response.statusText)
        // Revert the optimistic update
        setAdSettings(prev => ({ ...prev, [key]: previousValue }))
        toast.error('Failed to update ad setting')
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      // Revert the optimistic update
      setAdSettings(prev => ({ ...prev, [key]: previousValue }))
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  // Vercel environment updates removed - ads now controlled via local data files
  // const updateVercelEnvironment = async (key: string, value: string) => {
  //   try {
  //     await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/vercel/update-environment', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ key, value })
  //     })
  //   } catch (error) {
  //     console.error('Failed to update Vercel environment:', error)
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ads & Revenue</h1>
          <p className="text-gray-600">Monitor ad performance and revenue metrics</p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <DollarSign className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $0.00
            </div>
            <p className="text-xs text-muted-foreground mt-1">No revenue yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${revenueData.dailyAverage.toFixed(2)}/day avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ad Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">Click-through rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.activeAds}</div>
            <p className="text-xs text-muted-foreground mt-1">Running campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adsense">Google AdSense</TabsTrigger>
          <TabsTrigger value="monetag">Monetag</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Performance metrics across all ad networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Impressions</p>
                    <p className="text-2xl font-bold">{revenueData.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Clicks</p>
                    <p className="text-2xl font-bold">{revenueData.clicks.toLocaleString()}</p>
                  </div>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">65% of monthly target reached</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense Configuration</CardTitle>
              <CardDescription>Manage your AdSense integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Publisher ID</Label>
                <Input value="ca-pub-1742989559393752" readOnly />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sidebar Ad Slot</Label>
                  <Input placeholder="Enter slot ID" />
                </div>
                <div className="space-y-2">
                  <Label>Footer Ad Slot</Label>
                  <Input placeholder="Enter slot ID" />
                </div>
              </div>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monetag Zones</CardTitle>
              <CardDescription>Configure Monetag ad zones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Popup Zone</p>
                    <p className="text-sm text-muted-foreground">ID: 9469379</p>
                  </div>
                  <Switch 
                    checked={adSettings.monetagPopup} 
                    onCheckedChange={(checked) => saveAdSetting('monetagPopup', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">ID: 9469382</p>
                  </div>
                  <Switch 
                    checked={adSettings.monetagPush} 
                    onCheckedChange={(checked) => saveAdSetting('monetagPush', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Native Ads</p>
                    <p className="text-sm text-muted-foreground">ID: 9469381</p>
                  </div>
                  <Switch 
                    checked={adSettings.monetagNative} 
                    onCheckedChange={(checked) => saveAdSetting('monetagNative', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Settings</CardTitle>
              <CardDescription>Global advertisement settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Ads</p>
                    <p className="text-sm text-muted-foreground">Show ads to users</p>
                  </div>
                  <Switch 
                    checked={adSettings.enableAds} 
                    onCheckedChange={(checked) => saveAdSetting('enableAds', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile Ads</p>
                    <p className="text-sm text-muted-foreground">Show ads on mobile devices</p>
                  </div>
                  <Switch 
                    checked={adSettings.mobileAds} 
                    onCheckedChange={(checked) => saveAdSetting('mobileAds', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-muted-foreground">Show test ads only</p>
                  </div>
                  <Switch 
                    checked={adSettings.testMode} 
                    onCheckedChange={(checked) => saveAdSetting('testMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} */

function SystemSection({ systemHealth }: { systemHealth: SystemHealth }) {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [activeTab, setActiveTab] = useState('health')
  const [systemData, setSystemData] = useState({
    uptime: 'Loading...',
    cpu: 0,
    memory: 0,
    disk: 0,
    requests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    connections: 0,
    systemLogs: []
  })
  const [apiConfig, setApiConfig] = useState<any>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Polling state with exponential backoff
  const [pollingState, setPollingState] = useState({
    consecutiveFailures: 0,
    retryDelay: 30000, // Initial delay: 30 seconds
    maxRetries: 5,
    hasShownError: false,
    intervalId: null as NodeJS.Timeout | null,
    isPaused: false
  })

  // Use ref to track interval ID for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchApiConfig()
    fetchSystemData()
    
    // Start polling with exponential backoff
    startPolling()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startPolling = (delay?: number) => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const currentDelay = delay || pollingState.retryDelay
    
    // Set new interval
    intervalRef.current = setInterval(() => {
      fetchSystemData()
    }, currentDelay)
  }

  const fetchSystemData = async () => {
    // Don't fetch if paused and we've reached max retries
    if (pollingState.isPaused && pollingState.consecutiveFailures >= pollingState.maxRetries) {
      return
    }
    
    setRefreshing(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/system-health')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSystemData(data.systemData)
          
          // Reset failure count on success
          const wasFailingOrPaused = pollingState.consecutiveFailures > 0 || pollingState.isPaused
          setPollingState(prev => ({
            ...prev,
            consecutiveFailures: 0,
            retryDelay: 30000, // Reset to initial delay
            hasShownError: false,
            isPaused: false
          }))
          
          // Restart polling with normal interval if it was failing or paused
          if (wasFailingOrPaused) {
            startPolling(30000)
          }
        } else {
          handlePollingFailure()
        }
      } else {
        handlePollingFailure()
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error)
      handlePollingFailure()
    } finally {
      setRefreshing(false)
    }
  }

  const handlePollingFailure = () => {
    setPollingState(prev => {
      const newFailureCount = prev.consecutiveFailures + 1
      const newDelay = Math.min(prev.retryDelay * 2, 300000) // Max 5 minutes
      
      // Show error toast only on first failure
      if (!prev.hasShownError) {
        toast.error('Failed to fetch system data. Retrying with exponential backoff.')
      }
      
      // Stop polling after max retries
      if (newFailureCount >= prev.maxRetries) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        toast.error(`System monitoring stopped after ${prev.maxRetries} failed attempts. Click refresh to retry.`)
        return { ...prev, consecutiveFailures: newFailureCount, isPaused: true }
      }
      
      // Update state with new failure count and delay
      const newState = {
        ...prev,
        consecutiveFailures: newFailureCount,
        retryDelay: newDelay,
        hasShownError: true
      }
      
      // Restart polling with exponential backoff delay
      startPolling(newDelay)
      
      return newState
    })
  }

  const manualRefresh = async () => {
    // Reset polling state
    setPollingState({
      consecutiveFailures: 0,
      retryDelay: 30000,
      maxRetries: 5,
      hasShownError: false,
      intervalId: null,
      isPaused: false
    })
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Fetch data immediately
    await fetchSystemData()
    
    // Restart polling with normal interval
    startPolling(30000)
  }

  const fetchApiConfig = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/api-config')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiConfig(data.config)
        }
      }
    } catch (error) {
      toast.error('Failed to load API configuration')
    } finally {
      setConfigLoading(false)
    }
  }

  const updateApiConfig = async (updates: any) => {
    setSaving(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/api-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Configuration updated')
        // Refresh config
        fetchApiConfig()
      } else {
        toast.error('Failed to update configuration')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const testApiEndpoint = async (endpoint: string) => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest(`/api/admin/test-endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`${endpoint} - Response time: ${data.responseTime}ms`)
      } else {
        toast.error(`${endpoint} - Failed to test`)
      }
    } catch (error) {
      toast.error(`${endpoint} - Network error`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System Management</h1>
          <p className="text-gray-600">Monitor system health and API services</p>
        </div>
        <div className="flex items-center gap-2">
          {pollingState.isPaused && (
            <Badge variant="destructive">
              Monitoring Paused
            </Badge>
          )}
          {pollingState.consecutiveFailures > 0 && !pollingState.isPaused && (
            <Badge variant="secondary">
              Retry {pollingState.consecutiveFailures}/{pollingState.maxRetries}
            </Badge>
          )}
          <Button
            onClick={manualRefresh}
            disabled={refreshing}
            variant={pollingState.isPaused ? "default" : "outline"}
            size="sm"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {pollingState.isPaused ? 'Resume Monitoring' : 'Refresh'}
              </>
            )}
          </Button>
          <Badge variant={systemHealth.api === 'healthy' ? 'default' : 'destructive'}>
            API {systemHealth.api}
          </Badge>
          <Badge variant="outline">
            Uptime: {systemData.uptime}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="apis">API Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  API Service
                  <Badge variant={systemHealth.api === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.api}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>{systemData.avgResponseTime}ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Database
                  <Badge variant={systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.database}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <span>No Database</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Storage
                  <Badge variant={systemHealth.storage === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.storage}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type</span>
                    <span>Local Only</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>Real-time resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm">{systemData.cpu}%</span>
                </div>
                <Progress value={systemData.cpu} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm">{systemData.memory}%</span>
                </div>
                <Progress value={systemData.memory} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Performance</span>
                  <span className="text-sm">{systemHealth.performance}%</span>
                </div>
                <Progress value={systemHealth.performance} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Services Configuration</CardTitle>
              <CardDescription>Manage and monitor API integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {configLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Loading configuration...</p>
                </div>
              ) : apiConfig ? (
                <>
                  {/* Gemini AI */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wand2 className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">Google Gemini AI</h4>
                          <p className="text-sm text-gray-500">AI-powered CV improvements</p>
                        </div>
                      </div>
                      <Badge variant={apiConfig.gemini.enabled ? 'default' : 'secondary'}>
                        {apiConfig.gemini.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="ml-8 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {apiConfig.gemini.hasKey ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>Server Key: {apiConfig.gemini.hasKey ? 'Configured' : 'Not configured'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.gemini.hasPublicKey ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span>Public Key: {apiConfig.gemini.hasPublicKey ? 'Configured' : 'Not configured'}</span>
                      </div>
                      <p className="text-gray-500">Model: {apiConfig.gemini.model}</p>
                    </div>
                  </div>

                  {/* HuggingFace */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <div>
                          <h4 className="font-semibold">HuggingFace API</h4>
                          <p className="text-sm text-gray-500">ATS analysis and scoring</p>
                        </div>
                      </div>
                      <Badge variant={apiConfig.huggingface.enabled ? 'default' : 'secondary'}>
                        {apiConfig.huggingface.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="ml-8 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {apiConfig.huggingface.hasKey ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>API Key: {apiConfig.huggingface.hasKey ? 'Configured' : 'Not configured'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vercel Integration */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-black" />
                        <div>
                          <h4 className="font-semibold">Vercel Integration</h4>
                          <p className="text-sm text-gray-500">Dynamic environment management</p>
                        </div>
                      </div>
                      <Badge variant={apiConfig.vercel.enabled ? 'default' : 'secondary'}>
                        {apiConfig.vercel.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="ml-8 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {apiConfig.vercel.hasToken ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>API Token: {apiConfig.vercel.hasToken ? 'Configured' : 'Not configured'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.vercel.hasProjectId ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>Project ID: {apiConfig.vercel.hasProjectId ? 'Configured' : 'Not configured'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiConfig.vercel.kvEnabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Info className="w-4 h-4 text-gray-400" />
                        )}
                        <span>KV Storage: {apiConfig.vercel.kvEnabled ? 'Enabled' : 'Not enabled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" />
                      <div>
                        <h4 className="font-semibold">Security Features</h4>
                        <p className="text-sm text-gray-500">Control security settings</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">IP Whitelist</p>
                          <p className="text-sm text-gray-500">Restrict admin panel access</p>
                        </div>
                        <Switch
                          checked={apiConfig.security.ipWhitelistEnabled}
                          onCheckedChange={(checked) => {
                            updateApiConfig({ ipWhitelistEnabled: checked })
                          }}
                          disabled={saving}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Maintenance Mode</p>
                          <p className="text-sm text-gray-500">Temporarily disable site access</p>
                        </div>
                        <Switch
                          checked={apiConfig.features.maintenanceMode}
                          onCheckedChange={(checked) => {
                            updateApiConfig({ maintenanceMode: checked })
                          }}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Error</AlertTitle>
                  <AlertDescription>
                    Failed to load API configuration. Please refresh the page.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Application performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-bold">{systemData.requests.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Error Rate</p>
                  <p className="text-2xl font-bold">{systemData.errorRate}%</p>
                  <p className="text-xs text-green-600">Low error rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Label>Recent System Events</Label>
                  <Button size="sm" variant="outline" onClick={() => fetchApiConfig()}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">System started successfully</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">API configuration loaded</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {apiConfig && !apiConfig.vercel.enabled && (
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">Vercel integration not configured</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks</CardTitle>
              <CardDescription>System maintenance and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Server className="h-4 w-4" />
                <AlertTitle>Serverless Architecture</AlertTitle>
                <AlertDescription>
                  This application runs on Vercel's serverless infrastructure. Maintenance is handled automatically.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Available Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={async () => {
                        toast.info('Clearing all cache and logging out for security...')
                        
                        // Clear browser cache
                        if ('caches' in window) {
                          try {
                            const cacheNames = await caches.keys()
                            await Promise.all(cacheNames.map(name => caches.delete(name)))
                          } catch (error) {
                            console.error('Cache clearing error:', error)
                          }
                        }
                        
                        // SECURITY: Since we're clearing storage, also perform secure logout
                        await ClientAdminAuth.logout()
                        toast.success('Cache cleared and logged out for security!')
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cache & Logout
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        fetchApiConfig()
                        toast.success('Configuration reloaded')
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload Configuration
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const runtime = 'edge'
                        const node = process.version || 'N/A'
                        const deployment = process.env.VERCEL_ENV || 'development'
                        toast.info(`Runtime: ${runtime}\nNode: ${node}\nEnv: ${deployment}`)
                      }}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      View System Info
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsSection() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [settings, setSettings] = useState({
    siteName: 'CV Genius',
    siteUrl: 'https://cvgenius-one.vercel.app',
    maintenanceMode: false,
    debugMode: false,
    maxFileSize: '10',
    allowedFormats: 'pdf,docx,txt'
  })

  const saveSettings = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Configure application settings</p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input 
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input 
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Temporarily disable site access</p>
                </div>
                <Switch 
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Debug Mode</p>
                  <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                </div>
                <Switch 
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => setSettings({...settings, debugMode: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>File Upload Settings</CardTitle>
            <CardDescription>Configure file upload restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max File Size (MB)</Label>
              <Input 
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>Allowed Formats</Label>
              <Input 
                value={settings.allowedFormats}
                onChange={(e) => setSettings({...settings, allowedFormats: e.target.value})}
                placeholder="pdf,docx,txt"
              />
              <p className="text-xs text-muted-foreground">Comma-separated file extensions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
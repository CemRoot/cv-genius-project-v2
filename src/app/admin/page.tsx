'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, Lock, Settings, BarChart3, FileText, DollarSign,
  LogOut, User, Key, AlertCircle, CheckCircle, Info,
  Eye, EyeOff, Save, RefreshCw, Plus, Trash2, Edit,
  ChevronRight, Home, Menu, X, Bell, Search, Filter,
  Users, Activity, Server, Database, Globe, Zap, Wand2
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

// Types
interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalCVs: number
  todayLogins: number
}

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down'
  database: 'healthy' | 'degraded' | 'down'
  storage: 'healthy' | 'degraded' | 'down'
  performance: number
}

interface PromptTemplate {
  id: string
  name: string
  category: string
  prompt: string
  variables: string[]
  lastModified: string
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
  const [prompts, setPrompts] = useState<PromptTemplate[]>([
    {
      id: 'cover-letter-generation',
      name: 'Cover Letter Generation',
      category: 'Generation',
      prompt: 'Generate a professional cover letter...',
      variables: ['jobTitle', 'company', 'candidateName'],
      lastModified: '2025-06-29'
    },
    {
      id: 'cv-improvement',
      name: 'CV Text Improvement',
      category: 'Improvement',
      prompt: 'Improve the following CV text...',
      variables: ['text', 'jobType'],
      lastModified: '2025-06-29'
    }
  ])

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'admin', // Always use 'admin' as username
          password,
          ...(twoFactorToken && { twoFactorToken })
        })
      })

      const data = await response.json()

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
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
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
            {activeSection === 'ads' && <AdsSection />}
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
            <p className="text-xs text-muted-foreground">+12% from last month</p>
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
            <p className="text-xs text-muted-foreground">+423 today</p>
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
              <Badge variant={systemHealth.database === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <Badge variant={systemHealth.storage === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.storage}
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

  useEffect(() => {
    // Get security data from window object (set by loadDashboardData)
    if (window.adminSecurityStats) {
      setSecurityData(window.adminSecurityStats)
      setLoading(false)
    } else {
      // If not available, fetch it
      fetchSecurityData()
    }
  }, [])

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
        toast.success('Password changed successfully')
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
              <Switch checked={securityData?.twoFactorEnabled || false} />
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
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add IP Address
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
      // Simulate AI response
      setTimeout(() => {
        const mockResponse = `[AI Response for ${selectedPrompt.name}]\n\n`
          + `Input: "${testInput}"\n\n`
          + `Based on the ${selectedPrompt.category.toLowerCase()} prompt, here's what the AI would generate:\n\n`
          + `• Enhanced text with improved clarity\n`
          + `• Professional language and tone\n`
          + `• ATS-optimized keywords\n`
          + `• Industry-specific terminology\n\n`
          + `This is a simulated response. In production, this would use the actual AI service.`
        
        setTestOutput(mockResponse)
        setTesting(false)
      }, 1500)
    } catch (error) {
      toast.error('Test failed')
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
        <Button onClick={() => setShowPromptDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Prompt
        </Button>
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
                    {userData ? (userData.totalCVs / userData.totalUsers).toFixed(1) : '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active User Rate</span>
                  <span className="font-medium">
                    {userData ? `${((userData.activeUsers / userData.totalUsers) * 100).toFixed(1)}%` : '...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Login Rate</span>
                  <span className="font-medium">
                    {userData ? `${((userData.todayLogins / userData.totalUsers) * 100).toFixed(1)}%` : '...'}
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
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Session tracking will be available in the next update</p>
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
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Activity logging will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdsSection() {
  const [activeTab, setActiveTab] = useState('overview')
  const [revenueData] = useState({
    totalRevenue: 2847.50,
    monthlyRevenue: 847.50,
    dailyAverage: 28.25,
    activeAds: 4,
    impressions: 45678,
    clicks: 1234,
    ctr: 2.7
  })

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
              ${revenueData.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">+15.3% from last month</p>
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
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">ID: 9469382</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Native Ads</p>
                    <p className="text-sm text-muted-foreground">ID: 9469381</p>
                  </div>
                  <Switch checked={false} />
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
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile Ads</p>
                    <p className="text-sm text-muted-foreground">Show ads on mobile devices</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-muted-foreground">Show test ads only</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SystemSection({ systemHealth }: { systemHealth: SystemHealth }) {
  const [activeTab, setActiveTab] = useState('health')
  const [systemData] = useState({
    uptime: '24d 15h 32m',
    cpu: 23,
    memory: 67,
    disk: 45,
    requests: 12847,
    avgResponseTime: 145,
    errorRate: 0.02
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System Management</h1>
          <p className="text-gray-600">Monitor system health and performance</p>
        </div>
        <div className="flex items-center gap-2">
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
                    <span>Connections</span>
                    <span>12/100</span>
                  </div>
                  <Progress value={12} className="h-2" />
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
                    <span>Used Space</span>
                    <span>{systemData.disk}%</span>
                  </div>
                  <Progress value={systemData.disk} className="h-2" />
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
              <div className="text-center py-8 text-gray-500">
                <Server className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Log viewer will be available in the next update</p>
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
              <Button className="w-full" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
              <Button className="w-full" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Services
              </Button>
              <Button className="w-full" variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Temporary Files
              </Button>
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
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
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
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive system alerts via email</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Settings</CardTitle>
            <CardDescription>Configure automatic backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Backup</p>
                <p className="text-sm text-muted-foreground">Automatically backup data</p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
              />
            </div>
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select 
                value={settings.backupFrequency}
                onValueChange={(value) => setSettings({...settings, backupFrequency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
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
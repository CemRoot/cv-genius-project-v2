'use client'

// Security Layer: Obfuscated admin access with hidden validation
const SECURITY_CHECKPOINT = () => {
  // DISABLED - Direct access allowed
  return true
}

import { useState, useEffect } from 'react'
import { MobileAdminLayout } from './components/mobile-admin-layout'
import { MobileAdminContent } from './components/mobile-admin-content'
import { useRouter } from 'next/navigation'
import { SecurityHooks } from '@/lib/security-obfuscation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, Save, TestTube, Settings, FileText, BarChart3, Lock, Shield, LogOut, Smartphone, QrCode, Wand2 } from 'lucide-react'
import { ClientAdminAuth } from '@/lib/admin-auth'
import PasswordEncryption from '@/lib/password-encryption'
import { useToast, createToastUtils } from '@/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import { defaultAdConfigs } from '@/lib/ad-config'
import { SecurityHeader } from '@/components/admin/security-header'

interface AISettings {
  temperature: number
  topP: number
  maxTokens: number
  model: string
  systemPrompt: string
}

interface ContextAISettings {
  coverLetter: AISettings
  cvAnalysis: AISettings
  cvOptimization: AISettings
  jobAnalysis: AISettings
  keywordExtraction: AISettings
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
  // Hidden security checkpoint
  const [securityCheck, setSecurityCheck] = useState(false)
  
  const router = useRouter()
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [require2FA, setRequire2FA] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [firstTimeLogin, setFirstTimeLogin] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  
  // Mobile detection effect - MUST be before any conditional returns
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const [contextAISettings, setContextAISettings] = useState<ContextAISettings>({
    coverLetter: {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      model: 'gemini-2.0-flash',
      systemPrompt: 'You are a professional cover letter writing assistant specialized for the Irish job market. Create compelling, personalized cover letters that highlight relevant experience and skills while maintaining a professional Irish business tone.'
    },
    cvAnalysis: {
      temperature: 0.5,
      topP: 0.85,
      maxTokens: 2000,
      model: 'gemini-2.0-flash',
      systemPrompt: 'You are a CV analysis expert for the Irish job market. Provide constructive feedback on CVs, highlighting strengths, areas for improvement, and alignment with Irish hiring practices and ATS systems.'
    },
    cvOptimization: {
      temperature: 0.3,
      topP: 0.8,
      maxTokens: 1500,
      model: 'gemini-2.0-flash',
      systemPrompt: 'You are a CV optimization specialist. Focus on improving CV content for ATS compatibility and Irish job market standards. Provide factual, precise suggestions for better keyword usage and formatting.'
    },
    jobAnalysis: {
      temperature: 0.4,
      topP: 0.8,
      maxTokens: 1500,
      model: 'gemini-2.0-flash',
      systemPrompt: 'You are a job description analysis expert. Extract key requirements, skills, and qualifications from job postings. Identify important keywords and company culture indicators for the Irish job market.'
    },
    keywordExtraction: {
      temperature: 0.2,
      topP: 0.7,
      maxTokens: 1000,
      model: 'gemini-2.0-flash',
      systemPrompt: 'You are a keyword extraction specialist. Extract relevant industry keywords, skills, and phrases from job descriptions and CVs. Focus on ATS-friendly terms and Irish job market terminology.'
    }
  })

  const [activeAIContext, setActiveAIContext] = useState<keyof ContextAISettings>('coverLetter')

  const [prompts, setPrompts] = useState<PromptTemplate[]>([
    {
      id: 'cover-letter-generation',
      name: 'Cover Letter Generation',
      category: 'Generation',
      prompt: `Generate a professional cover letter for the Irish job market based on the following information:

Job Title: {jobTitle}
Company: {company}
Candidate Name: {candidateName}
Experience Level: {experienceLevel}
Key Skills: {skills}
Work Style: {workStyle}

Guidelines:
- Use Irish English spelling and terminology
- Keep professional but personable tone
- Highlight relevant experience and skills
- Include company-specific customization
- Follow standard Irish business letter format
- Length: 3-4 paragraphs maximum`,
      variables: ['jobTitle', 'company', 'candidateName', 'experienceLevel', 'skills', 'workStyle'],
      lastModified: '2025-06-18'
    },
    {
      id: 'cv-analysis',
      name: 'CV Analysis',
      category: 'Analysis',
      prompt: `Analyze the following CV content and extract key information for cover letter generation:

CV Content: {cvContent}

Extract and return JSON format:
{
  "name": "Full name",
  "currentRole": "Current or most recent position",
  "keySkills": ["skill1", "skill2", "skill3"],
  "experienceLevel": "junior/mid/senior",
  "industries": ["industry1", "industry2"],
  "achievements": ["achievement1", "achievement2"],
  "education": "Highest qualification",
  "workStyle": "collaborative/independent/leadership"
}

Focus on information relevant for Irish job applications.`,
      variables: ['cvContent'],
      lastModified: '2025-06-18'
    }
  ])

  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [testing, setTesting] = useState(false)

  // IP Whitelist state
  const [ipWhitelist, setIpWhitelist] = useState<any[]>([])
  const [currentIP, setCurrentIP] = useState('')
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)
  const [newIPAddress, setNewIPAddress] = useState('')
  const [newIPLabel, setNewIPLabel] = useState('')

  // Enhanced authentication with smart 2FA flow
  const handleLogin = async () => {
    try {
      // Removed debug logs for security
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: password,
          twoFactorToken: twoFactorToken || null
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('🎉 Login successful!')
        ClientAdminAuth.setToken(result.token)
        setIsAuthenticated(true)
        setIs2FAEnabled(result.twoFactorEnabled)
        
        loadSettings()
        
        // Check if this is first time and 2FA is not enabled
        // Disabled first time login alert
        // if (!result.twoFactorEnabled) {
        //   setFirstTimeLogin(true)
        //   setTimeout(() => {
        //     alert('🔐 First login detected! 2FA setup is recommended for security.')
        //     setActiveTab('security')
        //   }, 1000)
        // }
      } else if (result.require2FA) {
        // Debug logs removed for production security
        setRequire2FA(true)
      } else {
        alert(result.error || 'Login failed')
        if (result.attemptsRemaining !== undefined) {
          alert(`Attempts remaining: ${result.attemptsRemaining}`)
        }
      }
    } catch (error) {
      console.error('💥 Login error:', error)
      alert('Login failed: ' + (error instanceof Error ? error.message : 'Network error'))
    }
  }

  useEffect(() => {
    console.log('🚀 Admin Panel initializing...')
    // Security checkpoint - hidden validation (DISABLED for easy access)
    // const isSecure = SECURITY_CHECKPOINT()
    // if (!isSecure) return
    setSecurityCheck(true)
    console.log('✅ Security check passed (disabled)')
    
    // Initialize security hooks
    SecurityHooks.detectDevTools() // Disabled for debugging
    SecurityHooks.clearConsole() // Disabled for debugging
    SecurityHooks.disableRightClick() // Disabled for debugging
    
    // Check if already authenticated with valid token
    const token = ClientAdminAuth.getToken()
    if (token) {
      // Verify token is still valid
      verifyToken(token)
    }

    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['settings', 'ads', 'security', 'ip-management', 'prompts', 'testing', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/settings')
      if (response.ok) {
        setIsAuthenticated(true)
        loadSettings()
      } else {
        ClientAdminAuth.removeToken()
      }
    } catch (error) {
      ClientAdminAuth.removeToken()
    }
  }

  const handleLogout = async () => {
    await ClientAdminAuth.logout()
    setIsAuthenticated(false)
    setRequire2FA(false)
    setTwoFactorToken('')
    setShow2FASetup(false)
    setFirstTimeLogin(false)
  }

  // Check 2FA status on load
  const check2FAStatus = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/2fa/verify')
      if (response.ok) {
        const result = await response.json()
        setIs2FAEnabled(result.enabled)
      }
    } catch (error) {
      // 2FA status check failed (removed for security)
    }
  }

  // 2FA Setup
  const setup2FA = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setQrCode(result.qrCode)
        setSetupSecret(result.secret)
        setShow2FASetup(true)
        setPassword('') // Clear password for security
      } else {
        alert(result.error || '2FA setup failed')
      }
    } catch (error) {
      alert('2FA setup failed: Network error')
    }
  }

  // Verify 2FA Setup
  const verify2FASetup = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFactorToken, action: 'setup' })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setIs2FAEnabled(true)
        setShow2FASetup(false)
        setTwoFactorToken('')
        setFirstTimeLogin(false)
        alert('🎉 2FA successfully activated! You will need 2FA codes for future logins.')
      } else {
        alert(result.error || '2FA verification failed')
      }
    } catch (error) {
      alert('2FA verification failed: Network error')
    }
  }

  // Change Password
  const handlePasswordChange = async () => {
    if (!currentPasswordForChange) {
      toast.error('Please enter your current password')
      return
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    setPasswordChangeLoading(true)
    
    try {
      // Encrypt passwords before sending
      const encryptedPasswords = PasswordEncryption.encryptPasswords({
        currentPassword: currentPasswordForChange,
        newPassword: newPassword,
        confirmPassword: confirmNewPassword
      })
      
      // Debug logs removed for production security
      
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedPasswords
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        toast.success(result.message)
        
        // Clear form
        setCurrentPasswordForChange('')
        setNewPassword('')
        setConfirmNewPassword('')
        setShowPasswordChange(false)
        
        // Show production instructions if needed
        if (result.instructions) {
          // Debug logs removed for production security
          if (result.newPasswordHash) {
            toast.info('Password updated successfully')
          }
        }
      } else {
        // Handle specific error codes
        if (response.status === 429) {
          toast.error('Too many password change attempts. Please wait 15 minutes.')
        } else if (response.status === 403) {
          toast.error('Access denied: Your IP address is not authorized for password changes.')
        } else if (response.status === 401) {
          toast.error('Current password is incorrect or session expired.')
        } else {
          toast.error(result.error || 'Failed to change password')
        }
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Network error: Failed to change password')
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  // Disable 2FA
  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return
    }
    
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token: twoFactorToken })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setIs2FAEnabled(false)
        setTwoFactorToken('')
        setPassword('')
        alert('2FA has been disabled')
      } else {
        alert(result.error || '2FA disable failed')
      }
    } catch (error) {
      alert('2FA disable failed: Network error')
    }
  }

  // Load context-specific settings and check 2FA status
  const loadSettings = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/settings')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.contextSettings) {
          setContextAISettings(result.contextSettings)
        }
      }
      // Also check 2FA status
      check2FAStatus()
      // Load IP whitelist
      loadIPWhitelist()
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  // Load IP whitelist
  const loadIPWhitelist = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ip-whitelist')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIpWhitelist(result.entries)
          setCurrentIP(result.currentIP)
          setIsFirstTimeSetup(result.isFirstTimeSetup)
          
          // Debug removed for security
        }
      }
    } catch (error) {
      console.error('Failed to load IP whitelist:', error)
    }
  }

  // Add current IP to whitelist
  const addCurrentIP = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add-current',
          label: `Admin IP (${new Date().toLocaleDateString()})`
        })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        alert(result.message)
        loadIPWhitelist()
      } else {
        alert(result.error || 'Failed to add current IP')
      }
    } catch (error) {
      alert('Failed to add current IP: Network error')
    }
  }

  // Add custom IP to whitelist
  const addCustomIP = async () => {
    if (!newIPAddress.trim()) {
      alert('Please enter an IP address')
      return
    }

    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add',
          ip: newIPAddress.trim(),
          label: newIPLabel.trim() || 'Admin IP'
        })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        alert(result.message)
        setNewIPAddress('')
        setNewIPLabel('')
        loadIPWhitelist()
      } else {
        alert(result.error || 'Failed to add IP')
      }
    } catch (error) {
      alert('Failed to add IP: Network error')
    }
  }

  // Remove IP from whitelist
  const removeIP = async (ip: string) => {
    if (!confirm(`Are you sure you want to remove IP ${ip} from whitelist?`)) {
      return
    }

    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'remove',
          ip: ip
        })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        alert(result.message)
        loadIPWhitelist()
      } else {
        alert(result.error || 'Failed to remove IP')
      }
    } catch (error) {
      alert('Failed to remove IP: Network error')
    }
  }

  // Update Vercel Production Environment
  const updateVercelEnvironment = async () => {
    if (!confirm('Update Vercel production environment with current IP whitelist?')) {
      return
    }

    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/vercel/update-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_ip_whitelist',
          environment: 'production'
        })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        toast.success(`✅ Vercel environment updated successfully!\\n${result.message}`)
      } else {
        toast.error(result.error || 'Failed to update Vercel environment')
      }
    } catch (error) {
      toast.error('Failed to update Vercel environment: Network error')
    }
  }

  // Sync IP Whitelist with Vercel
  const syncWithVercel = async () => {
    if (!confirm('Sync current IP whitelist with Vercel production environment?')) {
      return
    }

    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/vercel/sync-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync_whitelist'
        })
      })
      
      const result = await response.json()
      if (response.ok && result.success) {
        toast.success(`🔄 IP whitelist synced with Vercel!\\n${result.message}`)
        loadIPWhitelist() // Reload to show updated status
      } else {
        toast.error(result.error || 'Failed to sync with Vercel')
      }
    } catch (error) {
      toast.error('Failed to sync with Vercel: Network error')
    }
  }

  // Save context-specific settings with authentication
  const saveContextSettings = async () => {
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contextSettings: contextAISettings,
          activeContext: activeAIContext
        })
      })
      
      if (response.ok) {
        alert(`${activeAIContext} AI settings saved successfully!`)
      } else {
        const error = await response.json()
        alert('Failed to save settings: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to save settings: Network error')
    }
  }

  // Test prompt with authentication
  const testPrompt = async () => {
    if (!selectedPrompt) return
    
    setTesting(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selectedPrompt.prompt,
          input: testInput,
          settings: contextAISettings[activeAIContext]
        })
      })
      
      const result = await response.json()
      setTestOutput(result.output || result.error || 'No output received')
    } catch (error) {
      setTestOutput('Test failed: ' + error)
    }
    setTesting(false)
  }

  // Security gate - hidden from F12 inspection
  if (!securityCheck) {
    console.log('⏳ Waiting for security check...')
    return null // No visible error or loading state
  }
  
  // Removed debug logging for production security

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <Lock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-600" />
            <h1 className="text-xl md:text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">Enter admin password to continue</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (!require2FA || twoFactorToken.length === 6) && handleLogin()}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {require2FA && (
              <div>
                <Label htmlFor="twoFactorToken">2FA Code</Label>
                <Input
                  id="twoFactorToken"
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && twoFactorToken.length === 6 && handleLogin()}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={require2FA && twoFactorToken.length !== 6}
            >
              {require2FA ? 'Verify 2FA Code' : 'Login'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Use mobile layout for small screens
  if (isMobile) {
    return (
      <MobileAdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        is2FAEnabled={is2FAEnabled}
      >
        <MobileAdminContent
          activeTab={activeTab}
          contextAISettings={contextAISettings}
          activeAIContext={activeAIContext}
          setActiveAIContext={setActiveAIContext}
          setContextAISettings={setContextAISettings}
          saveContextSettings={saveContextSettings}
          // Security props
          is2FAEnabled={is2FAEnabled}
          show2FASetup={show2FASetup}
          setShow2FASetup={setShow2FASetup}
          qrCode={qrCode}
          setupSecret={setupSecret}
          password={password}
          setPassword={setPassword}
          twoFactorToken={twoFactorToken}
          setTwoFactorToken={setTwoFactorToken}
          setup2FA={setup2FA}
          verify2FASetup={verify2FASetup}
          disable2FA={disable2FA}
          // IP Management props
          currentIP={currentIP}
          ipWhitelist={ipWhitelist}
          isFirstTimeSetup={isFirstTimeSetup}
          newIPAddress={newIPAddress}
          setNewIPAddress={setNewIPAddress}
          newIPLabel={newIPLabel}
          setNewIPLabel={setNewIPLabel}
          addCurrentIP={addCurrentIP}
          addCustomIP={addCustomIP}
          removeIP={removeIP}
          // Vercel integration props
          updateVercelEnvironment={updateVercelEnvironment}
          syncWithVercel={syncWithVercel}
          // Password change props
          showPasswordChange={showPasswordChange}
          setShowPasswordChange={setShowPasswordChange}
          currentPasswordForChange={currentPasswordForChange}
          setCurrentPasswordForChange={setCurrentPasswordForChange}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          handlePasswordChange={handlePasswordChange}
          passwordChangeLoading={passwordChangeLoading}
        />
      </MobileAdminLayout>
    )
  }

  // Desktop layout remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      <SecurityHeader isAuthenticated={isAuthenticated} />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CV Genius Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secured</span>
              </Badge>
              {is2FAEnabled && (
                <Badge variant="default" className="flex items-center space-x-1">
                  <Smartphone className="w-3 h-3" />
                  <span>2FA Active</span>
                </Badge>
              )}
              {firstTimeLogin && (
                <Badge variant="destructive" className="flex items-center space-x-1 animate-pulse">
                  <Smartphone className="w-3 h-3" />
                  <span>Setup 2FA</span>
                </Badge>
              )}
              <Badge variant="secondary">Gemini AI 2.0</Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>AI Settings</span>
            </TabsTrigger>
            <TabsTrigger value="cv-builder" className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>CV Builder</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <span>💰</span>
              <span>Ads</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="ip-management" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>IP Control</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span>Testing</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Context-Specific AI Configuration</h2>
              
              {/* Context Selector */}
              <div className="mb-6">
                <Label className="text-base font-medium">AI Context</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                  {Object.keys(contextAISettings).map((context) => (
                    <Button
                      key={context}
                      variant={activeAIContext === context ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveAIContext(context as keyof ContextAISettings)}
                      className="text-xs"
                    >
                      {context === 'coverLetter' && '📝 Cover Letter'}
                      {context === 'cvAnalysis' && '🔍 CV Analysis'}
                      {context === 'cvOptimization' && '⚡ CV Optimization'}
                      {context === 'jobAnalysis' && '💼 Job Analysis'}
                      {context === 'keywordExtraction' && '🎯 Keywords'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Context Info */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-1">
                  {activeAIContext === 'coverLetter' && '📝 Cover Letter AI - Creative & Professional'}
                  {activeAIContext === 'cvAnalysis' && '🔍 CV Analysis AI - Balanced Feedback'}
                  {activeAIContext === 'cvOptimization' && '⚡ CV Optimization AI - Factual & Precise'}
                  {activeAIContext === 'jobAnalysis' && '💼 Job Analysis AI - Analytical & Flexible'}
                  {activeAIContext === 'keywordExtraction' && '🎯 Keyword Extraction AI - Very Precise'}
                </h3>
                <p className="text-sm text-blue-700">
                  {activeAIContext === 'coverLetter' && 'Optimized for creative but professional cover letter generation with Irish market focus.'}
                  {activeAIContext === 'cvAnalysis' && 'Balanced for providing constructive CV feedback and improvement suggestions.'}
                  {activeAIContext === 'cvOptimization' && 'Focused on factual, ATS-friendly CV improvements with minimal creativity.'}
                  {activeAIContext === 'jobAnalysis' && 'Analytical approach for extracting job requirements and company insights.'}
                  {activeAIContext === 'keywordExtraction' && 'Precise extraction of relevant keywords and industry terminology.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Model</Label>
                    <Select 
                      value={contextAISettings[activeAIContext].model} 
                      onValueChange={(value) => 
                        setContextAISettings(prev => ({
                          ...prev,
                          [activeAIContext]: { ...prev[activeAIContext], model: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Temperature: {contextAISettings[activeAIContext].temperature}</Label>
                    <Slider
                      value={[contextAISettings[activeAIContext].temperature]}
                      onValueChange={([value]) => 
                        setContextAISettings(prev => ({
                          ...prev,
                          [activeAIContext]: { ...prev[activeAIContext], temperature: value }
                        }))
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div>
                    <Label>Top-P: {contextAISettings[activeAIContext].topP}</Label>
                    <Slider
                      value={[contextAISettings[activeAIContext].topP]}
                      onValueChange={([value]) => 
                        setContextAISettings(prev => ({
                          ...prev,
                          [activeAIContext]: { ...prev[activeAIContext], topP: value }
                        }))
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Controls diversity of word selection
                    </p>
                  </div>

                  <div>
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={contextAISettings[activeAIContext].maxTokens}
                      onChange={(e) => 
                        setContextAISettings(prev => ({
                          ...prev,
                          [activeAIContext]: { ...prev[activeAIContext], maxTokens: parseInt(e.target.value) }
                        }))
                      }
                      min={100}
                      max={8192}
                    />
                  </div>
                </div>

                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    value={contextAISettings[activeAIContext].systemPrompt}
                    onChange={(e) => 
                      setContextAISettings(prev => ({
                        ...prev,
                        [activeAIContext]: { ...prev[activeAIContext], systemPrompt: e.target.value }
                      }))
                    }
                    rows={8}
                    className="mt-2"
                    placeholder="Enter system prompt that defines AI behavior for this context..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Editing: <span className="font-medium text-blue-600">{activeAIContext}</span> context
                </div>
                <Button onClick={saveContextSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save {activeAIContext} Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* CV Builder Tab */}
          <TabsContent value="cv-builder" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Wand2 className="w-5 h-5" />
                    <span>CV Builder AI Prompts</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Manage text improvement and analysis prompts used in the CV builder</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open('/admin/cv-builder-prompts', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Prompts</span>
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Status Card */}
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Prompt Types:</span>
                      <span className="text-blue-900 font-medium">5 Categories</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Last Updated:</span>
                      <span className="text-blue-900 font-medium">Admin Managed</span>
                    </div>
                  </div>
                </Card>

                {/* Features Card */}
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Available Features</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>General text improvement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Professional summary enhancement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Work experience optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Skills section formatting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Education section polish</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Key Features */}
              <Card className="p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">CV Builder AI Features</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-600">Text Improvement</h4>
                    <p className="text-sm text-gray-600">
                      Advanced AI prompts for enhancing CV text while preserving original meaning and language. 
                      Supports both Turkish and English content.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">Section-Specific</h4>
                    <p className="text-sm text-gray-600">
                      Specialized prompts for different CV sections: professional summary, experience, 
                      skills, and education. Each optimized for its purpose.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-600">ATS Compatible</h4>
                    <p className="text-sm text-gray-600">
                      Prompts designed to improve ATS (Applicant Tracking System) compatibility 
                      while maintaining professional quality and readability.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Usage Tips */}
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-2">💡 Usage Tips</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use lower temperature (0.1-0.3) for consistent text improvements</li>
                  <li>• Each prompt type is optimized for specific CV sections</li>
                  <li>• Language preservation ensures Turkish content stays Turkish</li>
                  <li>• All prompts focus on grammar, clarity, and professionalism</li>
                  <li>• Changes to prompts take effect immediately for new requests</li>
                </ul>
              </Card>
            </Card>
          </TabsContent>

          {/* Ads Management Tab */}
          <TabsContent value="ads" className="space-y-6">
            <AdsManagementComponent />
          </TabsContent>

          {/* IP Management Tab */}
          <TabsContent value="ip-management" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>IP Access Control</span>
              </h2>
              
              <div className="space-y-6">
                {/* Current IP Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Your Current IP Address</h3>
                  <p className="text-blue-700 font-mono">{currentIP || 'Loading...'}</p>
                  {isFirstTimeSetup && (
                    <div className="mt-3">
                      <p className="text-sm text-blue-700 mb-2">
                        🔐 First time setup detected. Add your current IP to secure admin access.
                      </p>
                      <Button onClick={addCurrentIP} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Shield className="w-4 h-4 mr-2" />
                        Add Current IP to Whitelist
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add Custom IP */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4">Add New IP Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="newIP">IP Address</Label>
                      <Input
                        id="newIP"
                        type="text"
                        value={newIPAddress}
                        onChange={(e) => setNewIPAddress(e.target.value)}
                        placeholder="192.168.1.100"
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newIPLabel">Label (Optional)</Label>
                      <Input
                        id="newIPLabel"
                        type="text"
                        value={newIPLabel}
                        onChange={(e) => setNewIPLabel(e.target.value)}
                        placeholder="Home Office"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addCustomIP} className="w-full">
                        <Shield className="w-4 h-4 mr-2" />
                        Add IP
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* IP Whitelist Table */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4">Allowed IP Addresses</h3>
                  {ipWhitelist.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">IP Address</th>
                            <th className="text-left py-2">Label</th>
                            <th className="text-left py-2">Added</th>
                            <th className="text-left py-2">Status</th>
                            <th className="text-left py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ipWhitelist.map((entry, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-3 font-mono">{entry.ip}</td>
                              <td className="py-3">{entry.label}</td>
                              <td className="py-3">{new Date(entry.addedAt).toLocaleDateString()}</td>
                              <td className="py-3">
                                <Badge variant={entry.isActive ? 'default' : 'secondary'}>
                                  {entry.isActive ? 'Active' : 'Disabled'}
                                </Badge>
                                {currentIP === entry.ip && (
                                  <Badge variant="outline" className="ml-2">Current</Badge>
                                )}
                              </td>
                              <td className="py-3">
                                {!entry.ip.includes('127.0.0.1') && entry.ip !== '::1' && currentIP !== entry.ip ? (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeIP(entry.ip)}
                                    disabled={!entry.isActive}
                                  >
                                    Remove
                                  </Button>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    {currentIP === entry.ip ? 'Current IP' : 
                                     (entry.ip.includes('127.0.0.1') || entry.ip === '::1') ? 'Localhost' : 
                                     'Protected'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No IP addresses in whitelist</p>
                  )}
                </Card>

                {/* Vercel Integration */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Vercel Production Sync
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Automatically sync IP whitelist and settings with your Vercel production environment.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        onClick={updateVercelEnvironment}
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Shield className="w-4 h-4" />
                        Update Production
                      </Button>
                      
                      <Button 
                        onClick={syncWithVercel}
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Wand2 className="w-4 h-4" />
                        Sync with Vercel
                      </Button>
                    </div>
                    
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>• <strong>Update Production:</strong> Push current IP whitelist to Vercel</p>
                      <p>• <strong>Sync with Vercel:</strong> Compare and sync local/production settings</p>
                      <p>• Requires VERCEL_TOKEN and VERCEL_PROJECT_ID in .env.local</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Security Notes</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Only whitelisted IPs can access the admin panel</li>
                    <li>• You cannot remove your current IP address</li>
                    <li>• Localhost IPs (127.0.0.1, ::1) are always allowed in development</li>
                    <li>• Changes take effect immediately</li>
                    <li>• Make sure to add your home/office IPs before deploying</li>
                  </ul>
                  
                  {!isFirstTimeSetup && (
                    <div className="mt-4">
                      <Button onClick={addCurrentIP} variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Add Current IP ({currentIP})
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Two-Factor Authentication</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={is2FAEnabled ? 'default' : 'secondary'}>
                      {is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {!is2FAEnabled ? (
                      <Button onClick={() => setShow2FASetup(true)} size="sm">
                        Enable 2FA
                      </Button>
                    ) : (
                      <Button onClick={() => setShow2FASetup(true)} variant="destructive" size="sm">
                        Disable 2FA
                      </Button>
                    )}
                  </div>
                </div>
                
                {show2FASetup && !is2FAEnabled && (
                  <Card className="p-6 border-blue-200 bg-blue-50">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                      <QrCode className="w-5 h-5" />
                      <span>Set up Two-Factor Authentication</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {!qrCode ? (
                        <div>
                          <Label htmlFor="adminPassword">Confirm Admin Password</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your admin password"
                          />
                          <Button onClick={setup2FA} disabled={!password} className="mt-4 w-full">
                            <Shield className="w-4 h-4 mr-2" />
                            Generate 2FA Setup
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-700 space-y-2">
                            <p><strong>Step 1:</strong> Install Google Authenticator, Authy, or Microsoft Authenticator</p>
                            <p><strong>Step 2:</strong> Scan the QR code below with your authenticator app</p>
                            <p><strong>Step 3:</strong> Enter the 6-digit code from your app to verify</p>
                          </div>
                          
                          {qrCode && (
                            <div className="flex justify-center p-4 bg-white rounded border">
                              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                          )}
                          
                          <div>
                            <Label>Manual Entry Key</Label>
                            <Input value={setupSecret} readOnly className="font-mono text-sm bg-gray-100" />
                            <p className="text-xs text-gray-600 mt-1">
                              Use this key if you can't scan the QR code
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="verify2fa">Enter 6-digit code from your authenticator app</Label>
                            <Input
                              id="verify2fa"
                              type="text"
                              value={twoFactorToken}
                              onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              maxLength={6}
                              className="text-center font-mono text-lg"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              onClick={verify2FASetup} 
                              disabled={twoFactorToken.length !== 6}
                              className="flex-1"
                            >
                              Verify & Enable 2FA
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => { 
                                setShow2FASetup(false); 
                                setTwoFactorToken(''); 
                                setQrCode(''); 
                                setSetupSecret(''); 
                                setPassword(''); 
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )}
                
                {show2FASetup && is2FAEnabled && (
                  <Card className="p-6 border-red-200 bg-red-50">
                    <h3 className="font-semibold mb-4 text-red-800">Disable Two-Factor Authentication</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Admin Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your admin password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm2fa">Current 2FA Code</Label>
                        <Input
                          id="confirm2fa"
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter current 6-digit code"
                          maxLength={6}
                          className="text-center font-mono"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={disable2FA} 
                          variant="destructive"
                          disabled={!password || twoFactorToken.length !== 6}
                          className="flex-1"
                        >
                          Disable 2FA
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => { 
                            setShow2FASetup(false); 
                            setTwoFactorToken(''); 
                            setPassword(''); 
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                
                {is2FAEnabled && !show2FASetup && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Two-Factor Authentication is Active</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your admin account is protected. You'll need to enter a code from your authenticator app when logging in.
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Password Change Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Change Admin Password</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-amber-600" />
                    <div>
                      <h3 className="font-medium">Password Management</h3>
                      <p className="text-sm text-gray-600">
                        Update your admin panel password
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    size="sm"
                    variant={showPasswordChange ? "outline" : "default"}
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>
                
                {showPasswordChange && (
                  <Card className="p-6 border-amber-200 bg-amber-50">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Change Admin Password</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPasswordForChange}
                          onChange={(e) => setCurrentPasswordForChange(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      
                      {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                      )}
                      
                      {newPassword && newPassword.length < 8 && (
                        <p className="text-sm text-red-600">Password must be at least 8 characters long</p>
                      )}
                      
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={
                          !currentPasswordForChange || 
                          !newPassword || 
                          !confirmNewPassword || 
                          newPassword !== confirmNewPassword ||
                          newPassword.length < 8 ||
                          passwordChangeLoading
                        }
                        className="w-full"
                      >
                        {passwordChangeLoading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                      
                      {process.env.NODE_ENV === 'production' && (
                        <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded text-sm">
                          <p className="font-medium text-blue-800 mb-1">Production Note:</p>
                          <p className="text-blue-700">
                            After generating the new password hash, you'll need to update the 
                            ADMIN_PASSWORD_HASH environment variable in your hosting platform.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Prompt Templates</h3>
                <div className="space-y-2">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedPrompt?.id === prompt.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{prompt.name}</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {prompt.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {prompt.lastModified}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {selectedPrompt && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Prompt</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={selectedPrompt.name} readOnly />
                    </div>
                    
                    <div>
                      <Label>Variables</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPrompt.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {'{' + variable + '}'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Prompt Template</Label>
                      <Textarea
                        value={selectedPrompt.prompt}
                        onChange={(e) => {
                          const updated = { ...selectedPrompt, prompt: e.target.value }
                          setSelectedPrompt(updated)
                          setPrompts(prev => prev.map(p => 
                            p.id === updated.id ? updated : p
                          ))
                        }}
                        rows={12}
                        className="mt-2 font-mono text-sm"
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Prompt Testing</h3>
              
              {selectedPrompt && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label>Test Input</Label>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      rows={8}
                      className="mt-2"
                      placeholder="Enter test data for variables..."
                    />
                    <Button 
                      onClick={testPrompt} 
                      disabled={testing || !testInput.trim()}
                      className="mt-4"
                    >
                      {testing ? 'Testing...' : 'Test Prompt'}
                    </Button>
                  </div>

                  <div>
                    <Label>AI Output</Label>
                    <Textarea
                      value={testOutput}
                      readOnly
                      rows={8}
                      className="mt-2 bg-gray-50"
                      placeholder="Test output will appear here..."
                    />
                  </div>
                </div>
              )}

              {!selectedPrompt && (
                <p className="text-gray-500 text-center py-8">
                  Select a prompt template from the Prompts tab to test it
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">API Usage</h3>
                <div className="text-3xl font-bold text-blue-600">1,247</div>
                <p className="text-gray-600">Requests today</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                <div className="text-3xl font-bold text-green-600">98.3%</div>
                <p className="text-gray-600">Last 24 hours</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Avg Response</h3>
                <div className="text-3xl font-bold text-purple-600">2.4s</div>
                <p className="text-gray-600">Response time</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: '14:32', action: 'Cover letter generated', user: 'user_123', status: 'success' },
                  { time: '14:28', action: 'CV analyzed', user: 'user_456', status: 'success' },
                  { time: '14:25', action: 'Prompt modified', user: 'admin', status: 'info' },
                  { time: '14:20', action: 'Settings updated', user: 'admin', status: 'info' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{activity.time}</span>
                      <span>{activity.action}</span>
                      <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{activity.user}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

// Ads Management Component
function AdsManagementComponent() {
  const [adConfigs, setAdConfigs] = useState(defaultAdConfigs)
  const [loading, setLoading] = useState(false)

  const toggleAd = (adId: string, enabled: boolean) => {
    setAdConfigs(prev => prev.map(ad => 
      ad.id === adId ? { ...ad, enabled } : ad
    ))
  }

  const adTypeColors = {
    banner: 'bg-blue-100 text-blue-800',
    sidebar: 'bg-green-100 text-green-800', 
    mobile: 'bg-cyan-100 text-cyan-800',
    popup: 'bg-red-100 text-red-800',
    native: 'bg-purple-100 text-purple-800',
    push: 'bg-orange-100 text-orange-800',
    inline: 'bg-indigo-100 text-indigo-800',
    footer: 'bg-gray-100 text-gray-800',
    interstitial: 'bg-pink-100 text-pink-800',
    sticky: 'bg-yellow-100 text-yellow-800'
  }

  const platformIcons = {
    adsense: '🟦',
    monetag: '🔴',
    propellerads: '🟠',
    custom: '🟣'
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertisement Management</h1>
        <p className="text-gray-600">Control advertisement settings across the entire site from here.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="web">🖥️ Web Ads</TabsTrigger>
          <TabsTrigger value="mobile">📱 Mobile Ads</TabsTrigger>
          <TabsTrigger value="popup">🚀 Popup/Push</TabsTrigger>
          <TabsTrigger value="special">⚡ Special Ads</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {['banner', 'sidebar', 'mobile', 'popup', 'native'].map(type => {
              const ads = adConfigs.filter(ad => ad.type === type)
              const activeAds = ads.filter(ad => ad.enabled).length
              
              const typeIcons = {
                banner: '🎯',
                sidebar: '📌', 
                mobile: '📱',
                popup: '🚀',
                native: '⭐'
              }
              
              return (
                <Card key={type}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">{typeIcons[type as keyof typeof typeIcons]}</span>
                          <Badge className={adTypeColors[type as keyof typeof adTypeColors]}>
                            {type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">{activeAds}/{ads.length}</p>
                        <p className="text-xs text-gray-500">Active/Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
              <CardDescription>All advertisement positions across the site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adConfigs.map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge className={adTypeColors[ad.type]}>
                        {ad.type}
                      </Badge>
                      <div>
                        <h3 className="font-medium">{ad.name}</h3>
                        <p className="text-sm text-gray-500">
                          {ad.zone && `Zone: ${ad.zone}`}
                          {ad.position && ` • Pozisyon: ${ad.position}`}
                        </p>
                        {ad.settings?.platform && (
                          <span className="text-xs font-medium mt-1 inline-block">
                            {platformIcons[ad.settings.platform]} {ad.settings.platform.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={ad.enabled}
                      onCheckedChange={(enabled) => toggleAd(ad.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Banner Reklamları</CardTitle>
                <CardDescription>Desktop banner reklamları (Header, Content arası)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adConfigs.filter(ad => ad.type === 'banner').map(ad => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{ad.name}</h3>
                        <p className="text-sm text-gray-500">
                          Position: {ad.position || 'General'}
                          {ad.settings?.size && ` • Size: ${ad.settings.size}`}
                        </p>
                      </div>
                      <Switch
                        checked={ad.enabled}
                        onCheckedChange={(enabled) => toggleAd(ad.id, enabled)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📌 Sidebar Ads</CardTitle>
                <CardDescription>Google AdSense sidebar ads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adConfigs.filter(ad => ad.type === 'sidebar').map(ad => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{ad.name}</h3>
                        <p className="text-sm text-gray-500">
                          AdSense Client: {ad.settings?.adSenseClient || ad.zone}
                        </p>
                        <p className="text-xs text-green-600">300x300 responsive</p>
                      </div>
                      <Switch
                        checked={ad.enabled}
                        onCheckedChange={(enabled) => toggleAd(ad.id, enabled)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📱 Mobile Ads</CardTitle>
              <CardDescription>Mobile device specific ad placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adConfigs.filter(ad => ad.type === 'mobile').map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{ad.name}</h3>
                      <p className="text-sm text-gray-500">
                        Position: {ad.settings?.mobilePosition} • 
                        Size: {ad.settings?.width}x{ad.settings?.height}
                      </p>
                      <p className="text-xs text-cyan-600">
                        PropellerAds - {ad.settings?.mobilePosition === 'floating' ? 'Dismissible' : 'Sticky'}
                      </p>
                    </div>
                    <Switch
                      checked={ad.enabled}
                      onCheckedChange={(enabled) => toggleAd(ad.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Popup & Push Ads</CardTitle>
              <CardDescription>Monetag aggressive ads - use with caution!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adConfigs.filter(ad => ['popup', 'push', 'native'].includes(ad.type)).map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{ad.name}</h3>
                      <p className="text-sm text-gray-500">
                        Zone: {ad.zone} • 
                        Cooldown: {ad.settings?.cooldown ? `${ad.settings.cooldown / 60000} min` : 'None'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="destructive" className="text-xs">Aggressive</Badge>
                        {ad.settings?.restrictedPages && (
                          <Badge variant="outline" className="text-xs">
                            {ad.settings.restrictedPages.length} pages restricted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={ad.enabled}
                      onCheckedChange={(enabled) => toggleAd(ad.id, enabled)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Download Monetization</CardTitle>
                <CardDescription>Ad redirect before PDF/DOCX download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Pre-Download Ad</h3>
                      <p className="text-sm text-gray-500">
                        Export Manager integration
                      </p>
                      <p className="text-xs text-blue-600">First-time visitor tracking</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌐 Facebook Browser</CardTitle>
                <CardDescription>In-app browser optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Facebook Browser Redirect</h3>
                      <p className="text-sm text-gray-500">
                        External browser redirect
                      </p>
                      <p className="text-xs text-green-600">Session-based dismiss</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ General Settings</CardTitle>
                <CardDescription>Site-wide ad settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">💡 Ad-Free Pages</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• /builder - CV builder page</p>
                      <p>• /cover-letter/* - All cover letter pages</p>
                      <p>• /ats-check - ATS analysis page</p>
                      <p>• /export - Export page</p>
                      <p>• /admin - Admin panel</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">⚠️ Minimal Ad Pages</h3>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <p>• /templates - Sidebar ads only</p>
                      <p>• /examples - Sidebar ads only</p>
                      <p>• /cover-letter/choose-template</p>
                      <p>• /cover-letter/creation-mode</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Ad Statistics</CardTitle>
                <CardDescription>Current ad status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries({
                    'Web Reklamları': adConfigs.filter(ad => ['banner', 'sidebar'].includes(ad.type)),
                    'Mobile Reklamları': adConfigs.filter(ad => ad.type === 'mobile'),
                    'Agresif Reklamları': adConfigs.filter(ad => ['popup', 'push', 'native'].includes(ad.type))
                  }).map(([category, ads]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{category}</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {ads.filter(ad => ad.enabled).length}
                        </span>
                        <span className="text-gray-500">/{ads.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
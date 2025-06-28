'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Save, Shield, Smartphone, QrCode, Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileAdminContentProps {
  activeTab: string
  contextAISettings: any
  activeAIContext: string
  setActiveAIContext: (context: string) => void
  setContextAISettings: (fn: any) => void
  saveContextSettings: () => void
  // Security props
  is2FAEnabled: boolean
  show2FASetup: boolean
  setShow2FASetup: (show: boolean) => void
  qrCode: string
  setupSecret: string
  password: string
  setPassword: (password: string) => void
  twoFactorToken: string
  setTwoFactorToken: (token: string) => void
  setup2FA: () => void
  verify2FASetup: () => void
  disable2FA: () => void
  // IP Management props
  currentIP: string
  ipWhitelist: any[]
  isFirstTimeSetup: boolean
  newIPAddress: string
  setNewIPAddress: (ip: string) => void
  newIPLabel: string
  setNewIPLabel: (label: string) => void
  addCurrentIP: () => void
  addCustomIP: () => void
  removeIP: (ip: string) => void
}

export function MobileAdminContent(props: MobileAdminContentProps) {
  const {
    activeTab,
    contextAISettings,
    activeAIContext,
    setActiveAIContext,
    setContextAISettings,
    saveContextSettings,
    // Add more destructured props as needed
  } = props

  const contextLabels = {
    coverLetter: '📝 Cover Letter',
    cvAnalysis: '🔍 CV Analysis', 
    cvOptimization: '⚡ CV Optimization',
    jobAnalysis: '💼 Job Analysis',
    keywordExtraction: '🎯 Keywords'
  }

  switch (activeTab) {
    case 'settings':
      return (
        <div className="space-y-4">
          {/* AI Context Selector - Mobile Optimized */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">AI Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(contextAISettings).map((context) => (
                  <Button
                    key={context}
                    variant={activeAIContext === context ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveAIContext(context as any)}
                    className="text-xs h-auto py-3 px-2"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">
                        {contextLabels[context as keyof typeof contextLabels].split(' ')[0]}
                      </div>
                      <div className="font-normal">
                        {contextLabels[context as keyof typeof contextLabels].split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Context Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h3 className="font-medium text-blue-900 text-sm mb-1">
                {contextLabels[activeAIContext as keyof typeof contextLabels]}
              </h3>
              <p className="text-xs text-blue-700">
                {activeAIContext === 'coverLetter' && 'Creative but professional generation'}
                {activeAIContext === 'cvAnalysis' && 'Balanced feedback and suggestions'}
                {activeAIContext === 'cvOptimization' && 'Factual, ATS-friendly improvements'}
                {activeAIContext === 'jobAnalysis' && 'Extract requirements and insights'}
                {activeAIContext === 'keywordExtraction' && 'Precise keyword extraction'}
              </p>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm">Model</Label>
              <Select 
                value={contextAISettings[activeAIContext].model} 
                onValueChange={(value) => 
                  setContextAISettings((prev: any) => ({
                    ...prev,
                    [activeAIContext]: { ...prev[activeAIContext], model: value }
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Temperature & Top-P */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="text-sm">
                  Temperature: {contextAISettings[activeAIContext].temperature}
                </Label>
                <Slider
                  value={[contextAISettings[activeAIContext].temperature]}
                  onValueChange={([value]) => 
                    setContextAISettings((prev: any) => ({
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
                  Lower = focused, Higher = creative
                </p>
              </div>

              <div>
                <Label className="text-sm">
                  Top-P: {contextAISettings[activeAIContext].topP}
                </Label>
                <Slider
                  value={[contextAISettings[activeAIContext].topP]}
                  onValueChange={([value]) => 
                    setContextAISettings((prev: any) => ({
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
                  Controls word diversity
                </p>
              </div>

              <div>
                <Label className="text-sm">Max Tokens</Label>
                <Input
                  type="number"
                  value={contextAISettings[activeAIContext].maxTokens}
                  onChange={(e) => 
                    setContextAISettings((prev: any) => ({
                      ...prev,
                      [activeAIContext]: { ...prev[activeAIContext], maxTokens: parseInt(e.target.value) }
                    }))
                  }
                  min={100}
                  max={8192}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm">System Prompt</Label>
              <Textarea
                value={contextAISettings[activeAIContext].systemPrompt}
                onChange={(e) => 
                  setContextAISettings((prev: any) => ({
                    ...prev,
                    [activeAIContext]: { ...prev[activeAIContext], systemPrompt: e.target.value }
                  }))
                }
                rows={6}
                className="mt-2 text-sm"
                placeholder="Enter system prompt..."
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={saveContextSettings} 
            className="w-full"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save {activeAIContext} Settings
          </Button>
        </div>
      )

    case 'security':
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 2FA Status Card */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">2FA Status</span>
                    </div>
                    <Badge variant={props.is2FAEnabled ? 'default' : 'secondary'}>
                      {props.is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Add an extra layer of security to your admin account
                  </p>

                  {!props.is2FAEnabled ? (
                    <Button 
                      onClick={() => props.setShow2FASetup(true)} 
                      className="w-full"
                      variant="default"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => props.setShow2FASetup(true)} 
                      variant="destructive"
                      className="w-full"
                    >
                      Disable 2FA
                    </Button>
                  )}
                </div>

                {/* 2FA Setup Flow */}
                {props.show2FASetup && !props.is2FAEnabled && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Set up 2FA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!props.qrCode ? (
                        <>
                          <div>
                            <Label className="text-sm">Admin Password</Label>
                            <div className="relative mt-2">
                              <Input
                                type={props.password ? "password" : "text"}
                                value={props.password}
                                onChange={(e) => props.setPassword(e.target.value)}
                                placeholder="Enter password"
                              />
                            </div>
                          </div>
                          <Button 
                            onClick={props.setup2FA} 
                            disabled={!props.password}
                            className="w-full"
                          >
                            Generate QR Code
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-sm space-y-2">
                            <p><strong>1.</strong> Install an authenticator app</p>
                            <p><strong>2.</strong> Scan the QR code</p>
                            <p><strong>3.</strong> Enter the 6-digit code</p>
                          </div>
                          
                          {props.qrCode && (
                            <div className="flex justify-center p-4 bg-white rounded">
                              <img src={props.qrCode} alt="2FA QR" className="w-40 h-40" />
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-sm">Manual Key</Label>
                            <Input 
                              value={props.setupSecret} 
                              readOnly 
                              className="font-mono text-xs mt-2"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm">6-digit code</Label>
                            <Input
                              type="text"
                              value={props.twoFactorToken}
                              onChange={(e) => props.setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              maxLength={6}
                              className="text-center font-mono text-lg mt-2"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                props.setShow2FASetup(false)
                                props.setTwoFactorToken('')
                                props.setPassword('')
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={props.verify2FASetup}
                              disabled={props.twoFactorToken.length !== 6}
                            >
                              Verify
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Disable 2FA Flow */}
                {props.show2FASetup && props.is2FAEnabled && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800">
                        Disable 2FA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm">Admin Password</Label>
                        <Input
                          type="password"
                          value={props.password}
                          onChange={(e) => props.setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Current 2FA Code</Label>
                        <Input
                          type="text"
                          value={props.twoFactorToken}
                          onChange={(e) => props.setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="text-center font-mono text-lg mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            props.setShow2FASetup(false)
                            props.setTwoFactorToken('')
                            props.setPassword('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={props.disable2FA}
                          disabled={!props.password || props.twoFactorToken.length !== 6}
                        >
                          Disable
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case 'ip-management':
      return (
        <div className="space-y-4">
          {/* Current IP Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h3 className="font-medium text-blue-900 mb-2">Your Current IP</h3>
              <p className="font-mono text-blue-700">{props.currentIP || 'Loading...'}</p>
              {props.isFirstTimeSetup && (
                <div className="mt-3">
                  <p className="text-xs text-blue-700 mb-2">
                    🔐 First time setup detected
                  </p>
                  <Button 
                    onClick={props.addCurrentIP} 
                    size="sm" 
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Add Current IP
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New IP */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add New IP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">IP Address</Label>
                <Input
                  type="text"
                  value={props.newIPAddress}
                  onChange={(e) => props.setNewIPAddress(e.target.value)}
                  placeholder="192.168.1.100"
                  className="font-mono mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Label (Optional)</Label>
                <Input
                  type="text"
                  value={props.newIPLabel}
                  onChange={(e) => props.setNewIPLabel(e.target.value)}
                  placeholder="Home Office"
                  className="mt-2"
                />
              </div>
              <Button onClick={props.addCustomIP} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                Add IP Address
              </Button>
            </CardContent>
          </Card>

          {/* IP List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Allowed IPs</CardTitle>
            </CardHeader>
            <CardContent>
              {props.ipWhitelist.length > 0 ? (
                <div className="space-y-2">
                  {props.ipWhitelist.map((entry, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-mono text-sm">{entry.ip}</p>
                          <p className="text-xs text-gray-600">{entry.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={entry.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {entry.isActive ? 'Active' : 'Disabled'}
                            </Badge>
                            {props.currentIP === entry.ip && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!entry.ip.includes('127.0.0.1') && 
                         entry.ip !== '::1' && 
                         props.currentIP !== entry.ip && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => props.removeIP(entry.ip)}
                            disabled={!entry.isActive}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No IP addresses in whitelist
                </p>
              )}
            </CardContent>
          </Card>

          {/* Security Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <h3 className="font-medium text-yellow-800 mb-2 text-sm">
                ⚠️ Security Notes
              </h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Only whitelisted IPs can access admin</li>
                <li>• Cannot remove current IP</li>
                <li>• Changes take effect immediately</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )

    case 'analytics':
      return (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <p className="text-xs text-gray-600 mt-1">API Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600">98.3%</div>
                <p className="text-xs text-gray-600 mt-1">Success Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-purple-600">2.4s</div>
                <p className="text-xs text-gray-600 mt-1">Avg Response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-orange-600">847</div>
                <p className="text-xs text-gray-600 mt-1">Active Users</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '14:32', action: 'Cover letter generated', status: 'success' },
                  { time: '14:28', action: 'CV analyzed', status: 'success' },
                  { time: '14:25', action: 'Prompt modified', status: 'info' },
                  { time: '14:20', action: 'Settings updated', status: 'info' },
                  { time: '14:15', action: 'Export completed', status: 'success' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge 
                      variant={activity.status === 'success' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              This section is being optimized for mobile. Please check back soon.
            </p>
          </CardContent>
        </Card>
      )
  }
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Info,
  ExternalLink,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  Server,
  Smartphone,
  Settings,
  Key,
  Database,
  Shield,
  Download,
  Upload
} from 'lucide-react'
import { ClientAdminAuth } from '@/lib/admin-auth'
import { useToast, createToastUtils } from '@/components/ui/toast'

interface EnvVariable {
  id?: string
  key: string
  value: string
  type: 'encrypted' | 'plain' | 'sensitive'
  target: ('production' | 'preview' | 'development')[]
  masked?: boolean
  category?: 'security' | 'api' | 'config' | 'ads' | 'features' | 'other'
  description?: string
  required?: boolean
  lastUpdated?: string
}

interface EnvCategory {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  variables: EnvVariable[]
}

export default function EnvironmentManager() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('production')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(null)
  const [maskedVariables, setMaskedVariables] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<EnvCategory[]>([])
  const [vercelConnected, setVercelConnected] = useState(false)
  
  const [newVariable, setNewVariable] = useState<EnvVariable>({
    key: '',
    value: '',
    type: 'plain',
    target: ['production'],
    category: 'config'
  })

  // Environment categories for organization
  const envCategories: Record<string, { name: string; icon: React.ComponentType<any>; description: string }> = {
    security: { name: 'Security', icon: Shield, description: 'JWT secrets, admin credentials, API keys' },
    api: { name: 'API Keys', icon: Key, description: 'External service API keys and tokens' },
    ads: { name: 'Advertising', icon: Globe, description: 'AdSense, Monetag and other ad network settings' },
    config: { name: 'Configuration', icon: Settings, description: 'App configuration and feature flags' },
    database: { name: 'Database', icon: Database, description: 'Database connections and storage' },
    features: { name: 'Features', icon: Smartphone, description: 'Feature flags and toggles' }
  }

  useEffect(() => {
    loadEnvironmentVariables()
  }, [activeTab])

  const loadEnvironmentVariables = async () => {
    setLoading(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest(`/api/admin/environment?env=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          organizeVariablesByCategory(data.variables)
          setVercelConnected(data.vercelConnected)
          
          // Auto-mask sensitive variables
          const sensitiveKeys = data.variables
            .filter((v: EnvVariable) => v.type === 'sensitive' || v.key.includes('SECRET') || v.key.includes('KEY') || v.key.includes('HASH'))
            .map((v: EnvVariable) => v.key)
          setMaskedVariables(new Set(sensitiveKeys))
        }
      }
    } catch (error) {
      toast.error("Error", "Failed to load environment variables")
    } finally {
      setLoading(false)
    }
  }

  const organizeVariablesByCategory = (variables: EnvVariable[]) => {
    const categorizedVars: Record<string, EnvVariable[]> = {}
    
    // Initialize categories
    Object.keys(envCategories).forEach(cat => {
      categorizedVars[cat] = []
    })
    categorizedVars.other = []

    // Categorize variables
    variables.forEach((variable: EnvVariable) => {
      const category = detectCategory(variable.key)
      variable.category = category
      categorizedVars[category].push(variable)
    })

    // Create category objects
    const cats: EnvCategory[] = Object.entries(envCategories).map(([id, info]) => ({
      id,
      name: info.name,
      icon: info.icon,
      description: info.description,
      variables: categorizedVars[id] || []
    }))

    // Add "Other" category if it has variables
    if (categorizedVars.other.length > 0) {
      cats.push({
        id: 'other',
        name: 'Other',
        icon: Settings,
        description: 'Uncategorized variables',
        variables: categorizedVars.other
      })
    }

    setCategories(cats)
  }

  const detectCategory = (key: string): string => {
    const lowerKey = key.toLowerCase()
    
    if (lowerKey.includes('jwt') || lowerKey.includes('secret') || lowerKey.includes('admin') || lowerKey.includes('password') || lowerKey.includes('hash')) {
      return 'security'
    }
    if (lowerKey.includes('api_key') || lowerKey.includes('token') || lowerKey.includes('gemini') || lowerKey.includes('huggingface')) {
      return 'api'
    }
    if (lowerKey.includes('adsense') || lowerKey.includes('monetag') || lowerKey.includes('ad_')) {
      return 'ads'
    }
    if (lowerKey.includes('kv_') || lowerKey.includes('database') || lowerKey.includes('redis')) {
      return 'database'
    }
    if (lowerKey.includes('maintenance') || lowerKey.includes('enable_') || lowerKey.includes('disable_')) {
      return 'features'
    }
    
    return 'config'
  }

  const saveVariable = async (variable: EnvVariable, isNew: boolean = false) => {
    setSaving(true)
    try {
      const endpoint = isNew ? '/api/admin/environment/add' : '/api/admin/environment/update'
      const response = await ClientAdminAuth.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: variable.key,
          value: variable.value,
          type: variable.type,
          target: variable.target,
          category: variable.category,
          description: variable.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success("Success", `Variable ${isNew ? 'added' : 'updated'} successfully`)
          await loadEnvironmentVariables()
          setShowAddDialog(false)
          setEditingVariable(null)
          resetNewVariable()
        } else {
          throw new Error(data.error)
        }
      } else {
        throw new Error('Failed to save variable')
      }
    } catch (error) {
      toast.error("Error", `Failed to ${isNew ? 'add' : 'update'} variable`)
    } finally {
      setSaving(false)
    }
  }

  const deleteVariable = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the variable "${key}"? This action cannot be undone.`)) {
      return
    }

    setSaving(true)
    try {
      const response = await ClientAdminAuth.makeAuthenticatedRequest('/api/admin/environment/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, environment: activeTab })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success("Success", "Variable deleted successfully")
          await loadEnvironmentVariables()
        } else {
          throw new Error(data.error)
        }
      } else {
        throw new Error('Failed to delete variable')
      }
    } catch (error) {
      toast.error("Error", "Failed to delete variable")
    } finally {
      setSaving(false)
    }
  }

  const toggleVariableMask = (key: string) => {
    const newMasked = new Set(maskedVariables)
    if (newMasked.has(key)) {
      newMasked.delete(key)
    } else {
      newMasked.add(key)
    }
    setMaskedVariables(newMasked)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied", `${label} copied to clipboard`)
  }

  const resetNewVariable = () => {
    setNewVariable({
      key: '',
      value: '',
      type: 'plain',
      target: ['production'],
      category: 'config'
    })
  }

  const refreshVariables = async () => {
    setRefreshing(true)
    await loadEnvironmentVariables()
    setRefreshing(false)
    toast.success("Refreshed", "Environment variables refreshed")
  }

  const getVariableValue = (variable: EnvVariable) => {
    if (maskedVariables.has(variable.key)) {
      return '••••••••••••••••'
    }
    return variable.value
  }

  const filteredCategories = categories.map(category => ({
    ...category,
    variables: category.variables.filter(variable => {
      const matchesSearch = variable.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (variable.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory
      return matchesSearch && matchesCategory
    })
  })).filter(category => category.variables.length > 0)

  const totalVariables = categories.reduce((sum, cat) => sum + cat.variables.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Environment Variables Manager
              </CardTitle>
              <CardDescription>
                Manage your Vercel environment variables directly from the admin panel
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={vercelConnected ? "default" : "destructive"}>
                {vercelConnected ? 'Vercel Connected' : 'Vercel Disconnected'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshVariables}
                disabled={refreshing}
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!vercelConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Vercel Integration Required</AlertTitle>
          <AlertDescription>
            To manage environment variables, ensure VERCEL_TOKEN and VERCEL_PROJECT_ID are configured.
            <br />
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="https://vercel.com/docs/environment-variables" target="_blank" rel="noopener noreferrer">
                Learn how to set up Vercel API credentials
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(envCategories).map(([id, info]) => (
                    <SelectItem key={id} value={id}>{info.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button disabled={!vercelConnected}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Environment Variable</DialogTitle>
                  <DialogDescription>
                    Create a new environment variable for {activeTab}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Variable Name</Label>
                    <Input
                      id="key"
                      placeholder="VARIABLE_NAME"
                      value={newVariable.key}
                      onChange={(e) => setNewVariable({...newVariable, key: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Textarea
                      id="value"
                      placeholder="Variable value"
                      value={newVariable.value}
                      onChange={(e) => setNewVariable({...newVariable, value: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newVariable.category}
                      onValueChange={(value) => setNewVariable({...newVariable, category: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(envCategories).map(([id, info]) => (
                          <SelectItem key={id} value={id}>{info.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="What this variable is used for"
                      value={newVariable.description || ''}
                      onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveVariable(newVariable, true)}
                    disabled={saving || !newVariable.key || !newVariable.value}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Variable
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalVariables} variables total</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{filteredCategories.reduce((sum, cat) => sum + cat.variables.length, 0)} showing</span>
          </div>
        </CardContent>
      </Card>

      {/* Environment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Development
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading environment variables...
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5" />
                      {category.name}
                      <Badge variant="secondary">{category.variables.length}</Badge>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.variables.map((variable) => (
                      <div key={variable.key} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono">{variable.key}</code>
                            {variable.type === 'sensitive' && (
                              <Badge variant="destructive" className="text-xs">Sensitive</Badge>
                            )}
                            {variable.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {variable.description && (
                            <p className="text-xs text-muted-foreground mb-2">{variable.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 min-w-0 font-mono">
                              {getVariableValue(variable)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleVariableMask(variable.key)}
                            >
                              {maskedVariables.has(variable.key) ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(variable.value, variable.key)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          {variable.target && (
                            <div className="flex gap-1 mt-2">
                              {variable.target.map((env) => (
                                <Badge key={env} variant="outline" className="text-xs">
                                  {env}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingVariable(variable)}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteVariable(variable.key)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              
              {filteredCategories.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-muted-foreground">No environment variables found</p>
                      {searchQuery && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your search or category filter
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Variable Dialog */}
      <Dialog open={!!editingVariable} onOpenChange={(open) => !open && setEditingVariable(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Environment Variable</DialogTitle>
            <DialogDescription>
              Modify {editingVariable?.key} in {activeTab}
            </DialogDescription>
          </DialogHeader>
          {editingVariable && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Variable Name</Label>
                <Input value={editingVariable.key} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Value</Label>
                <Textarea
                  id="edit-value"
                  value={editingVariable.value}
                  onChange={(e) => setEditingVariable({...editingVariable, value: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingVariable.description || ''}
                  onChange={(e) => setEditingVariable({...editingVariable, description: e.target.value})}
                  placeholder="What this variable is used for"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariable(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingVariable && saveVariable(editingVariable)}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
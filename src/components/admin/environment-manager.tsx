'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Globe,
  Server,
  Smartphone,
  Settings,
  Key,
  Database,
  Shield,
  Search,
  Filter,
  Edit3,
  X,
  Clock
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
  createdAt?: number // milliseconds timestamp from Vercel
  updatedAt?: number // milliseconds timestamp from Vercel
}

export default function EnvironmentManager() {
  const { addToast } = useToast()
  const toast = createToastUtils(addToast)
  
  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('production')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(null)
  const [maskedVariables, setMaskedVariables] = useState<Set<string>>(new Set())
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [vercelConnected, setVercelConnected] = useState(false)
  
  const [newVariable, setNewVariable] = useState<EnvVariable>({
    key: '',
    value: '',
    type: 'plain',
    target: ['production'],
    category: 'config'
  })

  // Environment categories
  const categories = [
    { id: 'security', name: 'Security', icon: Shield, color: 'red' },
    { id: 'api', name: 'API Keys', icon: Key, color: 'blue' },
    { id: 'ads', name: 'Advertising', icon: Globe, color: 'green' },
    { id: 'config', name: 'Configuration', icon: Settings, color: 'gray' },
    { id: 'database', name: 'Database', icon: Database, color: 'purple' },
    { id: 'features', name: 'Features', icon: Smartphone, color: 'orange' }
  ]

  // Environment tabs
  const envTabs = [
    { id: 'production', name: 'Production', icon: Server, color: 'red' },
    { id: 'preview', name: 'Preview', icon: Globe, color: 'yellow' },
    { id: 'development', name: 'Development', icon: Smartphone, color: 'blue' }
  ]

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
          const enrichedVars = data.variables.map((v: EnvVariable) => ({
            ...v,
            category: detectCategory(v.key)
          }))
          setVariables(enrichedVars)
          setVercelConnected(data.vercelConnected)
          
          // Auto-mask sensitive variables
          const sensitiveKeys = enrichedVars
            .filter((v: EnvVariable) => 
              v.type === 'sensitive' || 
              v.key.includes('SECRET') || 
              v.key.includes('KEY') || 
              v.key.includes('HASH') ||
              v.key.includes('TOKEN') ||
              v.key.includes('PASSWORD')
            )
            .map((v: EnvVariable) => v.key)
          setMaskedVariables(new Set(sensitiveKeys))
        }
      }
    } catch (error) {
      toast.error("Failed to load environment variables")
    } finally {
      setLoading(false)
    }
  }

  const detectCategory = (key: string): string => {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('hash') || lowerKey.includes('jwt')) return 'security'
    if (lowerKey.includes('api') || lowerKey.includes('key') || lowerKey.includes('token')) return 'api'
    if (lowerKey.includes('adsense') || lowerKey.includes('monetag') || lowerKey.includes('ad_')) return 'ads'
    if (lowerKey.includes('db') || lowerKey.includes('database') || lowerKey.includes('mongo') || lowerKey.includes('postgres')) return 'database'
    if (lowerKey.includes('enable') || lowerKey.includes('feature') || lowerKey.includes('mode')) return 'features'
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
          toast.success(`Variable ${isNew ? 'added' : 'updated'} successfully`)
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
      toast.error(`Failed to ${isNew ? 'add' : 'update'} variable`)
    } finally {
      setSaving(false)
    }
  }

  const deleteVariable = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return

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
          toast.success("Variable deleted successfully")
          await loadEnvironmentVariables()
        } else {
          throw new Error(data.error)
        }
      } else {
        throw new Error('Failed to delete variable')
      }
    } catch (error) {
      toast.error("Failed to delete variable")
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
    toast.success(`${label} copied to clipboard`)
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
    toast.success("Environment variables refreshed")
  }

  const getVariableValue = (variable: EnvVariable) => {
    if (maskedVariables.has(variable.key)) {
      return '••••••••••••••••'
    }
    return variable.value
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getTimeSince = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (variable.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || variable.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedVariables = categories.reduce((acc, category) => {
    acc[category.id] = filteredVariables.filter(v => v.category === category.id)
    return acc
  }, {} as Record<string, EnvVariable[]>)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Environment Variables
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your Vercel environment variables directly from the admin panel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={vercelConnected ? "default" : "destructive"}
              className="h-6"
            >
              {vercelConnected ? 'Vercel Connected' : 'Vercel Disconnected'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshVariables}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {!vercelConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Vercel Integration Required</AlertTitle>
            <AlertDescription>
              To manage environment variables, ensure VERCEL_TOKEN and VERCEL_PROJECT_ID are configured.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                disabled={!vercelConnected}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Variable</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{variables.length} variables total</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{filteredVariables.length} showing</span>
          </div>
        </CardContent>
      </Card>

      {/* Environment Tabs */}
      <div className="space-y-4">
        <div className="flex overflow-x-auto">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg min-w-max">
            {envTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

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
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryVars = groupedVariables[category.id] || []
              if (categoryVars.length === 0) return null

              return (
                <Card key={category.id}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5" />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {categoryVars.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryVars.map((variable) => (
                      <div key={variable.key} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-sm font-mono font-semibold">
                                {variable.key}
                              </code>
                              {variable.type === 'sensitive' && (
                                <Badge variant="destructive" className="text-xs">
                                  Sensitive
                                </Badge>
                              )}
                              {variable.required && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {variable.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {variable.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingVariable(variable)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteVariable(variable.key)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <code className="block text-xs bg-gray-50 px-3 py-2 rounded border font-mono break-all">
                              {getVariableValue(variable)}
                            </code>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleVariableMask(variable.key)}
                            className="h-8 w-8 p-0"
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
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        {variable.target && variable.target.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {variable.target.map((env) => (
                              <Badge key={env} variant="outline" className="text-xs">
                                {env}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Timestamp Information */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <div className="flex items-center gap-4">
                            {variable.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Created: {getTimeSince(variable.createdAt)}</span>
                              </div>
                            )}
                            {variable.updatedAt && variable.updatedAt !== variable.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Modified: {getTimeSince(variable.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                          {(variable.updatedAt || variable.createdAt) && (
                            <div 
                              className="text-xs text-gray-400 cursor-help" 
                              title={`Created: ${formatTimestamp(variable.createdAt)}\nLast Modified: ${formatTimestamp(variable.updatedAt)}`}
                            >
                              {formatTimestamp(variable.updatedAt || variable.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
            
            {filteredVariables.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-gray-600">No environment variables found</p>
                    {searchQuery && (
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search or category filter
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Variable Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md mx-4">
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
              <select
                id="category"
                value={newVariable.category}
                onChange={(e) => setNewVariable({...newVariable, category: e.target.value as any})}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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

      {/* Edit Variable Dialog */}
      <Dialog open={!!editingVariable} onOpenChange={(open) => !open && setEditingVariable(null)}>
        <DialogContent className="max-w-md mx-4">
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
                <Input value={editingVariable.key} readOnly className="bg-gray-50" />
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
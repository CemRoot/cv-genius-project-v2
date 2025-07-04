'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Wrench, Globe, Info, Copy, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMaintenanceConfig } from '@/lib/maintenance-config'
import { useToast } from '@/components/ui/toast'

interface MaintenanceSection {
  id: string
  name: string
  path: string
  isInMaintenance: boolean
  message: string
  estimatedTime: string
}

export function MaintenanceManagement() {
  const [config, setConfig] = useState<{ globalMaintenance: boolean; sections: MaintenanceSection[] }>({
    globalMaintenance: false,
    sections: []
  })
  const { addToast } = useToast()

  // Load maintenance settings
  useEffect(() => {
    const maintenanceConfig = getMaintenanceConfig()
    setConfig(maintenanceConfig)
  }, [])

  const copyEnvVar = (envVar: string) => {
    navigator.clipboard.writeText(envVar)
    addToast({
      type: 'success',
      message: 'Environment variable copied to clipboard'
    })
  }

  const activeMaintenance = config.sections.filter(s => s.isInMaintenance).length

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Maintenance Mode via Environment Variables</AlertTitle>
        <AlertDescription>
          Maintenance mode is controlled through environment variables on Vercel. 
          Set these variables in your Vercel project settings to enable maintenance mode.
        </AlertDescription>
      </Alert>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Current Maintenance Status
          </CardTitle>
          <CardDescription>
            Live status based on environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold">{config.sections.length}</p>
            </div>
            <div className={activeMaintenance > 0 ? "bg-orange-100 dark:bg-orange-900/20" : "bg-muted"} rounded-lg p-4>
              <p className="text-sm text-muted-foreground">In Maintenance</p>
              <p className={`text-2xl font-bold ${activeMaintenance > 0 ? "text-orange-600 dark:text-orange-400" : ""}`}>
                {activeMaintenance}
              </p>
            </div>
            <div className={config.globalMaintenance ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20"} rounded-lg p-4>
              <p className="text-sm text-muted-foreground">Global Status</p>
              <p className={`text-2xl font-bold ${config.globalMaintenance ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {config.globalMaintenance ? 'Maintenance' : 'Operational'}
              </p>
            </div>
          </div>

          {/* Global Maintenance */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Global Maintenance Mode
                  {config.globalMaintenance && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  To enable global maintenance mode, set this environment variable:
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-1 rounded text-sm flex-1">
                    NEXT_PUBLIC_GLOBAL_MAINTENANCE=true
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyEnvVar('NEXT_PUBLIC_GLOBAL_MAINTENANCE=true')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section Status */}
          <div className="space-y-4">
            <h4 className="font-medium">Section-Specific Maintenance</h4>
            {config.sections.map((section) => (
              <Card key={section.id} className={section.isInMaintenance ? 'border-orange-500' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {section.name}
                      {section.isInMaintenance && (
                        <Badge variant="destructive" className="ml-2">
                          Active
                        </Badge>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {section.path}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Enable Maintenance:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-1 rounded text-xs flex-1">
                        NEXT_PUBLIC_{section.id.toUpperCase().replace('-', '_')}_MAINTENANCE=true
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyEnvVar(`NEXT_PUBLIC_${section.id.toUpperCase().replace('-', '_')}_MAINTENANCE=true`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Custom Message:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-1 rounded text-xs flex-1 truncate">
                        NEXT_PUBLIC_{section.id.toUpperCase().replace('-', '_')}_MESSAGE="Your message"
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyEnvVar(`NEXT_PUBLIC_${section.id.toUpperCase().replace('-', '_')}_MESSAGE="Your custom message"`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Estimated Time:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-1 rounded text-xs flex-1">
                        NEXT_PUBLIC_{section.id.toUpperCase().replace('-', '_')}_TIME="30 minutes"
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyEnvVar(`NEXT_PUBLIC_${section.id.toUpperCase().replace('-', '_')}_TIME="30 minutes"`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {section.isInMaintenance && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Current Message:</strong> {section.message}<br />
                        <strong>Estimated Time:</strong> {section.estimatedTime}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Use on Vercel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>Add the environment variables shown above</li>
                <li>Redeploy your application for changes to take effect</li>
              </ol>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Remember to prefix all variables with <code className="font-mono">NEXT_PUBLIC_</code> to make them available on the client side.
                  Changes require a redeploy on Vercel.
                </AlertDescription>
              </Alert>
              <Button variant="outline" asChild>
                <a href="https://vercel.com/docs/environment-variables" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Vercel Environment Variables Docs
                </a>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
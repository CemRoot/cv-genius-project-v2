'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Settings, 
  Shield, 
  Lock, 
  FileText, 
  TestTube, 
  BarChart3, 
  LogOut,
  Wand2,
  DollarSign,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileAdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  is2FAEnabled?: boolean
}

export function MobileAdminLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout,
  is2FAEnabled = false 
}: MobileAdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { id: 'settings', label: 'AI Settings', icon: Settings, color: 'text-blue-600' },
    { id: 'cv-builder', label: 'CV Builder', icon: Wand2, color: 'text-purple-600' },
    { id: 'ads', label: 'Ads Management', icon: DollarSign, color: 'text-green-600' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-red-600' },
    { id: 'ip-management', label: 'IP Control', icon: Lock, color: 'text-orange-600' },
    { id: 'prompts', label: 'Prompts', icon: FileText, color: 'text-indigo-600' },
    { id: 'testing', label: 'Testing', icon: TestTube, color: 'text-cyan-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-pink-600' },
  ]

  const currentMenuItem = menuItems.find(item => item.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              {currentMenuItem && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <currentMenuItem.icon className="w-3 h-3" />
                  {currentMenuItem.label}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {is2FAEnabled && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                2FA
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 z-50 md:hidden",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setIsMenuOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                  isActive 
                    ? "bg-gray-100 shadow-sm" 
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive ? "bg-white shadow-sm" : "bg-gray-50"
                  )}>
                    <Icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-medium",
                      isActive ? "text-gray-900" : "text-gray-700"
                    )}>
                      {item.label}
                    </p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4",
                  isActive ? "text-gray-700" : "text-gray-400"
                )} />
              </button>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <Button 
            onClick={onLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Desktop Tabs (Hidden on Mobile) */}
      <div className="hidden md:block container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onTabChange(item.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
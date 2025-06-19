'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

interface MobileTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export function MobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = '' 
}: MobileTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const activeElement = activeTabRef.current
      const containerElement = tabsRef.current
      
      const activeRect = activeElement.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()
      
      setIndicatorStyle({
        width: activeRect.width,
        left: activeRect.left - containerRect.left
      })
    }
  }, [activeTab, tabs])

  const variantClasses = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-3 text-sm font-medium transition-colors',
      activeTab: 'text-cvgenius-purple border-b-2 border-cvgenius-purple',
      inactiveTab: 'text-gray-500 hover:text-gray-700'
    },
    pills: {
      container: 'bg-gray-100 rounded-lg p-1',
      tab: 'px-3 py-2 text-sm font-medium rounded-md transition-all relative',
      activeTab: 'text-white bg-cvgenius-purple shadow-sm',
      inactiveTab: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    },
    underline: {
      container: 'relative',
      tab: 'px-4 py-3 text-sm font-medium transition-colors relative',
      activeTab: 'text-cvgenius-purple',
      inactiveTab: 'text-gray-500 hover:text-gray-700'
    }
  }

  const classes = variantClasses[variant]

  return (
    <div className={`${classes.container} ${className}`} ref={tabsRef}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              onClick={() => onTabChange(tab.id)}
              className={`
                ${classes.tab}
                ${isActive ? classes.activeTab : classes.inactiveTab}
                flex items-center gap-2 whitespace-nowrap
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Animated indicator for underline variant */}
      {variant === 'underline' && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-cvgenius-purple"
          initial={false}
          animate={{
            width: indicatorStyle.width,
            x: indicatorStyle.left
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  )
}
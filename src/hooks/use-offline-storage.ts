'use client'

import { useEffect, useState, useCallback } from 'react'

interface OfflineStorageOptions {
  key: string
  syncEnabled?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
}

export function useOfflineStorage<T>(
  initialData: T,
  options: OfflineStorageOptions
) {
  const { key, syncEnabled = true, autoSave = true, autoSaveInterval = 5000 } = options
  
  const [data, setData] = useState<T>(initialData)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsedData = JSON.parse(stored)
        setData(parsedData)
        setLastSaved(new Date(localStorage.getItem(`${key}_timestamp`) || Date.now()))
      }
    } catch (error) {
      console.error('Error loading offline data:', error)
    }
  }, [key])

  // Save data to localStorage
  const saveToLocal = useCallback((dataToSave: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(dataToSave))
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString())
      setLastSaved(new Date())
      setIsDirty(false)
    } catch (error) {
      console.error('Error saving offline data:', error)
    }
  }, [key])

  // Update data
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData
      setIsDirty(true)
      return updated
    })
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty) return

    const timeoutId = setTimeout(() => {
      saveToLocal(data)
    }, autoSaveInterval)

    return () => clearTimeout(timeoutId)
  }, [data, isDirty, autoSave, autoSaveInterval, saveToLocal])

  // Manual save
  const save = useCallback(() => {
    saveToLocal(data)
  }, [data, saveToLocal])

  // Clear offline data
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
      localStorage.removeItem(`${key}_timestamp`)
      setData(initialData)
      setLastSaved(null)
      setIsDirty(false)
    } catch (error) {
      console.error('Error clearing offline data:', error)
    }
  }, [key, initialData])

  // Sync with server (when online)
  const sync = useCallback(async (syncFunction?: (data: T) => Promise<void>) => {
    if (!isOnline || !syncFunction || !isDirty) return

    try {
      await syncFunction(data)
      setIsDirty(false)
      console.log('✅ Data synced with server')
    } catch (error) {
      console.error('❌ Failed to sync with server:', error)
    }
  }, [data, isOnline, isDirty])

  return {
    data,
    updateData,
    save,
    clear,
    sync,
    isOnline,
    lastSaved,
    isDirty,
    offlineCapable: true
  }
}
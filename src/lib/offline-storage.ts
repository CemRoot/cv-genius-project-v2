'use client'

import { CV } from '@/types/cv'

// IndexedDB configuration
const DB_NAME = 'CVGeniusOffline'
const DB_VERSION = 1
const STORE_NAME = 'cvs'

export class OfflineStorage {
  private db: IDBDatabase | null = null

  // Initialize IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create CV store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('lastModified', 'lastModified', { unique: false })
          store.createIndex('isDraft', 'isDraft', { unique: false })
        }
      }
    })
  }

  // Save CV to offline storage
  async saveCV(cv: CV): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const cvData = {
        ...cv,
        lastModified: new Date().toISOString(),
        isDraft: true
      }

      const request = store.put(cvData)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save CV offline'))
    })
  }

  // Get CV from offline storage
  async getCV(id: string): Promise<CV | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => reject(new Error('Failed to get CV from offline storage'))
    })
  }

  // Get all CVs from offline storage
  async getAllCVs(): Promise<CV[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(new Error('Failed to get CVs from offline storage'))
    })
  }

  // Delete CV from offline storage
  async deleteCV(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete CV from offline storage'))
    })
  }

  // Clear all offline data
  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to clear offline storage'))
    })
  }

  // Get storage usage
  async getStorageInfo(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      }
    }
    return { usage: 0, quota: 0 }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()

// Sync manager for background sync
export class SyncManager {
  private syncQueue: Set<string> = new Set()
  private isSyncing = false

  // Add CV to sync queue
  addToSyncQueue(cvId: string) {
    this.syncQueue.add(cvId)
    this.requestSync()
  }

  // Request background sync
  private async requestSync() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('sync-cv-data')
      } catch (error) {
        console.error('Background sync registration failed:', error)
        // Fallback to immediate sync
        this.syncNow()
      }
    } else {
      // Fallback for browsers without background sync
      this.syncNow()
    }
  }

  // Sync immediately
  private async syncNow() {
    if (this.isSyncing || this.syncQueue.size === 0) return

    this.isSyncing = true

    try {
      const cvIds = Array.from(this.syncQueue)
      
      for (const cvId of cvIds) {
        const cv = await offlineStorage.getCV(cvId)
        if (cv) {
          // Attempt to sync with server
          const success = await this.syncCV(cv)
          if (success) {
            this.syncQueue.delete(cvId)
          }
        }
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  // Sync single CV with server
  private async syncCV(cv: CV): Promise<boolean> {
    try {
      const response = await fetch('/api/cv/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cv)
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      pendingCount: this.syncQueue.size,
      isSyncing: this.isSyncing
    }
  }
}

// Singleton sync manager
export const syncManager = new SyncManager()

// React hook for offline functionality
import { useState, useEffect } from 'react'

export function useOfflineCV(cvId?: string) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [offlineCV, setOfflineCV] = useState<CV | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ pendingCount: 0, isSyncing: false })

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // Trigger sync when coming back online
      syncManager.syncNow()
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load CV from offline storage
  useEffect(() => {
    if (cvId && isOffline) {
      offlineStorage.getCV(cvId).then(cv => {
        if (cv) setOfflineCV(cv)
      })
    }
  }, [cvId, isOffline])

  // Save CV offline
  const saveOffline = async (cv: CV) => {
    setIsSaving(true)
    try {
      await offlineStorage.saveCV(cv)
      if (isOffline) {
        syncManager.addToSyncQueue(cv.id)
      }
      return true
    } catch (error) {
      console.error('Failed to save offline:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Update sync status
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getSyncStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    isOffline,
    offlineCV,
    saveOffline,
    isSaving,
    syncStatus
  }
}
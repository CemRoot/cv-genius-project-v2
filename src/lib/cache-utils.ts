export async function clearTemplateCache(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const templateCaches = cacheNames.filter(name => 
        name.includes('template') || 
        name.includes('cv-genius-dynamic')
      )
      
      await Promise.all(
        templateCaches.map(cacheName => caches.delete(cacheName))
      )
    }

    // Clear session storage template data
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('template') || key.includes('cv'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))

    // Clear any template-related local storage
    const localKeysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('template')) {
        localKeysToRemove.push(key)
      }
    }
    localKeysToRemove.forEach(key => localStorage.removeItem(key))

  } catch (error) {
    console.error('Failed to clear template cache:', error)
  }
}

export async function ensureTemplateCacheHealth(): Promise<boolean> {
  try {
    // Clear any stale caches on different ports
    await clearTemplateCache()
    
    // Small delay to ensure cache operations complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  } catch (error) {
    console.error('Cache health check failed:', error)
    return false
  }
}
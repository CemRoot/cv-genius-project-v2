'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  city?: string
  country?: string
  timezone?: string
}

export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
}

export interface DeviceContext {
  batteryLevel: number
  isCharging: boolean
  memoryUsage: number
  deviceMemory: number
  hardwareConcurrency: number
  platform: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export interface TimeContext {
  currentTime: Date
  timezone: string
  isBusinessHours: boolean
  isDaytime: boolean
  workingDay: boolean
  localWorkingHours: { start: number; end: number }
}

export interface MobileContextState {
  location: LocationData | null
  network: NetworkInfo | null
  device: DeviceContext | null
  time: TimeContext | null
  isLocationEnabled: boolean
  hasLocationPermission: boolean | null
  isOffline: boolean
}

export interface ContextOptions {
  enableLocation?: boolean
  enableNetworkMonitoring?: boolean
  enableDeviceMonitoring?: boolean
  enableTimeContext?: boolean
  workingHours?: { start: number; end: number }
  onLocationChange?: (location: LocationData) => void
  onNetworkChange?: (network: NetworkInfo) => void
  onDeviceChange?: (device: DeviceContext) => void
}

const defaultOptions: Required<ContextOptions> = {
  enableLocation: true,
  enableNetworkMonitoring: true,
  enableDeviceMonitoring: true,
  enableTimeContext: true,
  workingHours: { start: 9, end: 17 }, // 9 AM to 5 PM
  onLocationChange: () => {},
  onNetworkChange: () => {},
  onDeviceChange: () => {}
}

// Dublin job market data
const DUBLIN_JOB_HUBS = [
  { name: 'Silicon Docks', lat: 53.3445, lng: -6.2439, sectors: ['tech', 'finance'] },
  { name: 'IFSC', lat: 53.3498, lng: -6.2540, sectors: ['finance', 'banking'] },
  { name: 'Grand Canal Dock', lat: 53.3415, lng: -6.2418, sectors: ['tech', 'startup'] },
  { name: 'City Centre', lat: 53.3498, lng: -6.2603, sectors: ['retail', 'service'] },
  { name: 'Sandyford', lat: 53.2715, lng: -6.2167, sectors: ['tech', 'pharmaceutical'] }
]

export function useMobileContext(options: ContextOptions = {}) {
  const opts = { ...defaultOptions, ...options }
  
  const [state, setState] = useState<MobileContextState>({
    location: null,
    network: null,
    device: null,
    time: null,
    isLocationEnabled: false,
    hasLocationPermission: null,
    isOffline: !navigator.onLine
  })

  const locationWatchId = useRef<number | null>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const networkUpdateInterval = useRef<NodeJS.Timeout | null>(null)

  // Get device context
  const getDeviceContext = useCallback((): DeviceContext => {
    const memory = (performance as any).memory
    const navigator_: any = navigator

    return {
      batteryLevel: 0, // Will be updated separately
      isCharging: false, // Will be updated separately
      memoryUsage: memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0,
      deviceMemory: navigator_.deviceMemory || 4,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      platform: navigator.platform,
      isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      isTablet: /iPad|Tablet/.test(navigator.userAgent),
      isDesktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(navigator.userAgent)
    }
  }, [])

  // Get network context
  const getNetworkContext = useCallback((): NetworkInfo | null => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (!connection) return null

    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    }
  }, [])

  // Get time context
  const getTimeContext = useCallback((): TimeContext => {
    const now = new Date()
    const hour = now.getHours()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const dayOfWeek = now.getDay()

    return {
      currentTime: now,
      timezone,
      isBusinessHours: hour >= opts.workingHours.start && hour <= opts.workingHours.end,
      isDaytime: hour >= 6 && hour <= 20,
      workingDay: dayOfWeek >= 1 && dayOfWeek <= 5, // Monday to Friday
      localWorkingHours: opts.workingHours
    }
  }, [opts.workingHours])

  // Request location permission and start watching
  const requestLocation = useCallback(async (): Promise<boolean> => {
    if (!opts.enableLocation || !navigator.geolocation) {
      setState(prev => ({ ...prev, hasLocationPermission: false }))
      return false
    }

    try {
      // Request permission first
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      
      if (permission.state === 'denied') {
        setState(prev => ({ ...prev, hasLocationPermission: false }))
        return false
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      // Reverse geocoding (in production, use a proper service)
      try {
        // This is a placeholder - in production, use Google Maps API or similar
        if (isInDublin(locationData.latitude, locationData.longitude)) {
          locationData.city = 'Dublin'
          locationData.country = 'Ireland'
        }
      } catch (error) {
        console.warn('Reverse geocoding failed:', error)
      }

      setState(prev => ({
        ...prev,
        location: locationData,
        hasLocationPermission: true,
        isLocationEnabled: true
      }))

      opts.onLocationChange(locationData)

      // Start watching position
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current)
      }

      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const updatedLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            city: locationData.city,
            country: locationData.country,
            timezone: locationData.timezone
          }

          setState(prev => ({ ...prev, location: updatedLocation }))
          opts.onLocationChange(updatedLocation)
        },
        (error) => {
          console.error('Location watch error:', error)
        },
        {
          enableHighAccuracy: false,
          maximumAge: 600000, // 10 minutes
          timeout: 30000
        }
      )

      return true

    } catch (error) {
      console.error('Location request failed:', error)
      setState(prev => ({ ...prev, hasLocationPermission: false }))
      return false
    }
  }, [opts])

  // Check if coordinates are in Dublin area
  const isInDublin = useCallback((lat: number, lng: number): boolean => {
    // Dublin bounds (approximate)
    const dublinBounds = {
      north: 53.4,
      south: 53.2,
      east: -6.1,
      west: -6.4
    }

    return lat >= dublinBounds.south && lat <= dublinBounds.north &&
           lng >= dublinBounds.west && lng <= dublinBounds.east
  }, [])

  // Get nearby job hubs
  const getNearbyJobHubs = useCallback((maxDistance: number = 10): Array<typeof DUBLIN_JOB_HUBS[0] & { distance: number }> => {
    if (!state.location) return []

    return DUBLIN_JOB_HUBS
      .map(hub => {
        const distance = calculateDistance(
          state.location!.latitude,
          state.location!.longitude,
          hub.lat,
          hub.lng
        )
        return { ...hub, distance }
      })
      .filter(hub => hub.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  }, [state.location])

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  const toRadians = (degrees: number): number => degrees * (Math.PI / 180)

  // Get job suggestions based on location
  const getLocationBasedJobSuggestions = useCallback(() => {
    if (!state.location) return []

    const nearbyHubs = getNearbyJobHubs(15) // Within 15km

    const suggestions = nearbyHubs.flatMap(hub => 
      hub.sectors.map(sector => ({
        sector,
        location: hub.name,
        distance: hub.distance,
        commute: getCommuteAdvice(hub.distance),
        relevantSkills: getSectorSkills(sector)
      }))
    )

    return suggestions.slice(0, 5) // Top 5 suggestions
  }, [state.location, getNearbyJobHubs])

  // Get commute advice based on distance
  const getCommuteAdvice = useCallback((distance: number): string => {
    if (distance <= 2) return 'Walking distance'
    if (distance <= 5) return 'Short cycle or bus ride'
    if (distance <= 10) return 'Bus or LUAS accessible'
    if (distance <= 20) return 'DART or Dublin Bus'
    return 'Consider remote or hybrid options'
  }, [])

  // Get relevant skills for sector
  const getSectorSkills = useCallback((sector: string): string[] => {
    const skillMap: Record<string, string[]> = {
      tech: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
      finance: ['Excel', 'Financial Modeling', 'Risk Analysis', 'Bloomberg', 'SQL'],
      startup: ['Agile', 'Growth Hacking', 'Product Management', 'MVP Development'],
      retail: ['Customer Service', 'Sales', 'Inventory Management', 'POS Systems'],
      pharmaceutical: ['GMP', 'Regulatory Affairs', 'Clinical Research', 'Quality Control'],
      banking: ['AML', 'Compliance', 'Credit Analysis', 'Basel III', 'KYC']
    }
    
    return skillMap[sector] || []
  }, [])

  // Update battery info
  const updateBatteryInfo = useCallback(async () => {
    if (!opts.enableDeviceMonitoring || !('getBattery' in navigator)) return

    try {
      const battery = await (navigator as any).getBattery()
      
      setState(prev => ({
        ...prev,
        device: prev.device ? {
          ...prev.device,
          batteryLevel: battery.level * 100,
          isCharging: battery.charging
        } : null
      }))
    } catch (error) {
      console.warn('Battery API not supported')
    }
  }, [opts.enableDeviceMonitoring])

  // Initialize context monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize device context
    if (opts.enableDeviceMonitoring) {
      const deviceContext = getDeviceContext()
      setState(prev => ({ ...prev, device: deviceContext }))
      opts.onDeviceChange(deviceContext)
      
      // Update battery info
      updateBatteryInfo()
    }

    // Initialize network context
    if (opts.enableNetworkMonitoring) {
      const networkContext = getNetworkContext()
      setState(prev => ({ ...prev, network: networkContext }))
      if (networkContext) opts.onNetworkChange(networkContext)
    }

    // Initialize time context
    if (opts.enableTimeContext) {
      const timeContext = getTimeContext()
      setState(prev => ({ ...prev, time: timeContext }))
    }

    // Request location
    if (opts.enableLocation) {
      requestLocation()
    }
  }, [])

  // Set up periodic updates
  useEffect(() => {
    // Update time context every minute
    if (opts.enableTimeContext) {
      timeUpdateInterval.current = setInterval(() => {
        const timeContext = getTimeContext()
        setState(prev => ({ ...prev, time: timeContext }))
      }, 60000)
    }

    // Update network context every 30 seconds
    if (opts.enableNetworkMonitoring) {
      networkUpdateInterval.current = setInterval(() => {
        const networkContext = getNetworkContext()
        setState(prev => ({ ...prev, network: networkContext }))
        if (networkContext) opts.onNetworkChange(networkContext)
      }, 30000)
    }

    // Update battery info every 5 minutes
    if (opts.enableDeviceMonitoring) {
      const batteryInterval = setInterval(updateBatteryInfo, 300000)
      return () => clearInterval(batteryInterval)
    }

    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current)
      if (networkUpdateInterval.current) clearInterval(networkUpdateInterval.current)
    }
  }, [opts, getTimeContext, getNetworkContext, updateBatteryInfo])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }))
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current)
      }
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current)
      }
      if (networkUpdateInterval.current) {
        clearInterval(networkUpdateInterval.current)
      }
    }
  }, [])

  // Context-aware optimizations
  const getContextualOptimizations = useCallback(() => {
    const optimizations: string[] = []

    // Network-based optimizations
    if (state.network?.effectiveType === '2g' || state.network?.effectiveType === 'slow-2g') {
      optimizations.push('Enable data saver mode')
      optimizations.push('Use simplified interface')
    }

    // Battery-based optimizations
    if (state.device && state.device.batteryLevel < 20 && !state.device.isCharging) {
      optimizations.push('Enable battery saver mode')
      optimizations.push('Reduce background activity')
    }

    // Time-based optimizations
    if (state.time && !state.time.isBusinessHours) {
      optimizations.push('Schedule job applications for business hours')
    }

    return optimizations
  }, [state])

  return {
    // State
    ...state,
    
    // Location functions
    requestLocation,
    getNearbyJobHubs,
    getLocationBasedJobSuggestions,
    isInDublin,
    
    // Context functions
    getContextualOptimizations,
    
    // Computed values
    isLowPowerMode: state.device ? state.device.batteryLevel < 20 && !state.device.isCharging : false,
    isSlowNetwork: state.network ? ['2g', 'slow-2g'].includes(state.network.effectiveType) : false,
    isBusinessTime: state.time ? state.time.isBusinessHours && state.time.workingDay : false,
    
    // Dublin-specific helpers
    isDublinUser: state.location ? isInDublin(state.location.latitude, state.location.longitude) : false,
    
    // Network helpers
    shouldCompressData: state.network?.saveData || (state.network && ['2g', 'slow-2g'].includes(state.network.effectiveType)),
    
    // Device helpers
    isMobileDevice: state.device?.isMobile || false,
    isTabletDevice: state.device?.isTablet || false,
    
    // Time helpers
    timeUntilBusinessHours: state.time ? getTimeUntilBusinessHours(state.time) : null
  }
}

function getTimeUntilBusinessHours(timeContext: TimeContext): number | null {
  if (timeContext.isBusinessHours && timeContext.workingDay) return 0

  const now = timeContext.currentTime
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(timeContext.localWorkingHours.start, 0, 0, 0)

  if (!timeContext.workingDay) {
    // Find next Monday if it's weekend
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7
    tomorrow.setDate(now.getDate() + daysUntilMonday)
  } else if (now.getHours() >= timeContext.localWorkingHours.end) {
    // After business hours today, next business day
    tomorrow.setDate(now.getDate() + 1)
  } else {
    // Before business hours today
    tomorrow.setDate(now.getDate())
  }

  return tomorrow.getTime() - now.getTime()
}

export default useMobileContext
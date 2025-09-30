// Cache utility for improving performance
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

class DataCache {
  private static instance: DataCache
  private cache: Map<string, CacheItem<any>> = new Map()
  
  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache()
    }
    return DataCache.instance
  }

  // Set data in cache with expiry time in milliseconds
  set<T>(key: string, data: T, expiryMs: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs
    }
    
    this.cache.set(key, item)
    
    // Also store in localStorage for persistence across sessions
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to store in localStorage:', error)
    }
  }

  // Get data from cache
  get<T>(key: string): T | null {
    // First check memory cache
    let item = this.cache.get(key)
    
    // If not in memory, try localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          item = JSON.parse(stored)
          // Restore to memory cache
          if (item) {
            this.cache.set(key, item)
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }

    if (!item) return null

    // Check if expired
    const now = Date.now()
    if (now - item.timestamp > item.expiry) {
      this.delete(key)
      return null
    }

    return item.data
  }

  // Delete from cache
  delete(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
    }
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

export const cache = DataCache.getInstance()

// Cache keys constants
export const CACHE_KEYS = {
  SPECIALTIES: 'specialties',
  DOCTORS: (specialtyId: string) => `doctors_${specialtyId}`,
  APPOINTMENTS: (doctorId: string) => `appointments_${doctorId}`
}

// Cache expiry times (in milliseconds)
export const CACHE_EXPIRY = {
  SPECIALTIES: 10 * 60 * 1000, // 10 minutes
  DOCTORS: 5 * 60 * 1000,      // 5 minutes
  APPOINTMENTS: 2 * 60 * 1000   // 2 minutes
}
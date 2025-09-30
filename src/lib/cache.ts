// Sistema de caché simple para mejorar el rendimiento
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // Verificar si el item ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()

// Claves de caché para diferentes tipos de datos
export const CACHE_KEYS = {
  SPECIALTIES: 'specialties',
  DOCTORS: (specialtyId: string) => `doctors_${specialtyId}`,
  AVAILABLE_TIMES: (doctorId: string, date: string) => `available_times_${doctorId}_${date}`
} as const
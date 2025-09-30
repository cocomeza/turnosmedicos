// Sistema de caché simple para mejorar el rendimiento
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  
  // Obtener datos del caché
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // Verificar si el caché ha expirado
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  // Guardar datos en caché
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default: 5 minutos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  // Limpiar un elemento específico
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  // Limpiar todo el caché
  clear(): void {
    this.cache.clear()
  }
  
  // Verificar si existe en caché y no ha expirado
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// Instancia singleton del caché
export const cache = new SimpleCache()

// Helper para crear keys de caché consistentes
export const cacheKeys = {
  specialties: () => 'specialties:all',
  doctors: (specialtyId: string) => `doctors:${specialtyId}`,
  doctorSchedule: (doctorId: string, dayOfWeek: number) => `schedule:${doctorId}:${dayOfWeek}`,
  appointments: (doctorId: string, date: string) => `appointments:${doctorId}:${date}`
}

// TTL presets en milisegundos
export const cacheTTL = {
  short: 30 * 1000,        // 30 segundos
  medium: 5 * 60 * 1000,   // 5 minutos
  long: 30 * 60 * 1000,    // 30 minutos
  veryLong: 60 * 60 * 1000 // 1 hora
}
// Configuración centralizada para optimizaciones de rendimiento
export const PERFORMANCE_CONFIG = {
  // Timeouts para consultas de base de datos
  TIMEOUTS: {
    SPECIALTIES_FETCH: 5000, // 5 segundos
    DOCTORS_FETCH: 8000,     // 8 segundos
    APPOINTMENTS_FETCH: 10000 // 10 segundos
  },

  // Límites de resultados para consultas
  LIMITS: {
    SPECIALTIES: 50,
    DOCTORS: 20,
    APPOINTMENTS: 30
  },

  // Configuración de caché (en milisegundos)
  CACHE_TTL: {
    SPECIALTIES: 10 * 60 * 1000,    // 10 minutos
    DOCTORS: 5 * 60 * 1000,         // 5 minutos
    APPOINTMENTS: 2 * 60 * 1000,    // 2 minutos
    AVAILABLE_TIMES: 1 * 60 * 1000  // 1 minuto
  },

  // Configuración de lazy loading
  LAZY_LOADING: {
    INITIAL_DELAY: 100,      // 100ms delay inicial
    PREFETCH_DELAY: 30000,   // 30 segundos para prefetch
    DEBOUNCE_DELAY: 300      // 300ms para debounce de búsquedas
  },

  // Configuración de UI
  UI: {
    SKELETON_ITEMS: 6,       // Número de elementos skeleton
    ANIMATION_DURATION: 200, // Duración de animaciones
    LOADING_MIN_DURATION: 500 // Duración mínima de loading
  },

  // Configuración de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_DELAY: 1000
  }
} as const

// Función para obtener timeout dinámico basado en el tipo de conexión
export const getDynamicTimeout = (baseTimeout: number): number => {
  if (typeof navigator !== 'undefined') {
    const connection = (navigator as any).connection
    if (connection) {
      // Reducir timeout para conexiones lentas
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return baseTimeout * 2
      }
      // Aumentar timeout para conexiones rápidas
      if (connection.effectiveType === '4g') {
        return Math.max(baseTimeout * 0.5, 2000)
      }
    }
  }
  return baseTimeout
}

// Función para verificar si la conexión es lenta
export const isSlowConnection = (): boolean => {
  if (typeof navigator !== 'undefined') {
    const connection = (navigator as any).connection
    if (connection) {
      return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
    }
  }
  return false
}

// Función para obtener límites dinámicos basados en el dispositivo
export const getDynamicLimit = (baseLimit: number): number => {
  if (typeof window !== 'undefined') {
    // Reducir límites en dispositivos móviles
    if (window.innerWidth < 768) {
      return Math.max(Math.floor(baseLimit * 0.7), 10)
    }
    // Aumentar límites en pantallas grandes
    if (window.innerWidth > 1200) {
      return Math.floor(baseLimit * 1.5)
    }
  }
  return baseLimit
}
// Monitor de rendimiento para medir tiempos de carga
class PerformanceMonitor {
  private metrics = new Map<string, number>()

  startTiming(key: string): void {
    this.metrics.set(key, performance.now())
  }

  endTiming(key: string): number {
    const startTime = this.metrics.get(key)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.metrics.delete(key)
    
    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${key}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  // Medir tiempo de una función asíncrona
  async measureAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(key)
    try {
      const result = await fn()
      return result
    } finally {
      this.endTiming(key)
    }
  }

  // Obtener métricas de rendimiento
  getMetrics() {
    return {
      memoryUsage: typeof window !== 'undefined' && 'memory' in performance 
        ? (performance as any).memory 
        : null,
      navigation: typeof window !== 'undefined' && performance.navigation
        ? performance.navigation
        : null
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Hook para medir rendimiento de componentes
export const usePerformanceMonitor = (componentName: string) => {
  const startTiming = (operation: string) => {
    performanceMonitor.startTiming(`${componentName}_${operation}`)
  }

  const endTiming = (operation: string) => {
    return performanceMonitor.endTiming(`${componentName}_${operation}`)
  }

  const measureAsync = async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(`${componentName}_${operation}`, fn)
  }

  return {
    startTiming,
    endTiming,
    measureAsync
  }
}
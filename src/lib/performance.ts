// Performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private timers: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  startTimer(key: string): void {
    this.timers.set(key, performance.now())
  }

  // End timing and log the result
  endTimer(key: string, logToConsole: boolean = true): number {
    const startTime = this.timers.get(key)
    if (!startTime) {
      console.warn(`Timer '${key}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(key)

    if (logToConsole) {
      const color = duration > 2000 ? 'color: red' : duration > 1000 ? 'color: orange' : 'color: green'
      console.log(`%c⏱️ ${key}: ${duration.toFixed(2)}ms`, color)
    }

    return duration
  }

  // Measure a function execution time
  async measureAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(key)
    try {
      const result = await fn()
      this.endTimer(key)
      return result
    } catch (error) {
      this.endTimer(key)
      throw error
    }
  }

  // Get performance metrics
  getMetrics(): { [key: string]: any } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
    }
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : 0
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0
  }

  // Log performance summary
  logSummary(): void {
    const metrics = this.getMetrics()
    console.group('📊 Performance Summary')
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        const color = value > 2000 ? 'color: red' : value > 1000 ? 'color: orange' : 'color: green'
        console.log(`%c${key}: ${value.toFixed(2)}ms`, color)
      }
    })
    console.groupEnd()
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance timing constants
export const PERFORMANCE_KEYS = {
  SPECIALTIES_LOAD: 'specialties_load',
  DOCTORS_LOAD: 'doctors_load',
  APPOINTMENTS_LOAD: 'appointments_load',
  COMPONENT_RENDER: 'component_render',
  CACHE_OPERATION: 'cache_operation'
}
import { useState, useEffect, useCallback } from 'react'

interface UseOptimizedFetchOptions<T> {
  fetchFunction: () => Promise<T>
  dependencies?: any[]
  cacheKey?: string
  cacheTTL?: number
  initialData?: T
  enablePrefetch?: boolean
}

export function useOptimizedFetch<T>({
  fetchFunction,
  dependencies = [],
  cacheKey,
  cacheTTL = 5 * 60 * 1000,
  initialData,
  enablePrefetch = true
}: UseOptimizedFetchOptions<T>) {
  const [data, setData] = useState<T | null>(initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (useCache = true) => {
    if (loading) return // Evitar múltiples llamadas simultáneas

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()
      setData(result)
      
      // Si hay caché disponible, guardar resultado
      if (cacheKey && typeof window !== 'undefined') {
        try {
          const cache = window.localStorage
          const cacheData = {
            data: result,
            timestamp: Date.now(),
            ttl: cacheTTL
          }
          cache.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData))
        } catch (cacheError) {
          console.warn('Failed to cache data:', cacheError)
        }
      }
    } catch (err) {
      setError(err as Error)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, cacheKey, cacheTTL, loading])

  // Verificar caché local al montar
  useEffect(() => {
    if (cacheKey && typeof window !== 'undefined') {
      try {
        const cache = window.localStorage
        const cached = cache.getItem(`cache_${cacheKey}`)
        
        if (cached) {
          const { data: cachedData, timestamp, ttl } = JSON.parse(cached)
          
          // Verificar si el caché no ha expirado
          if (Date.now() - timestamp < ttl) {
            setData(cachedData)
            return // No hacer fetch si tenemos datos válidos en caché
          }
        }
      } catch (cacheError) {
        console.warn('Failed to read cache:', cacheError)
      }
    }

    // Solo hacer fetch si no tenemos datos iniciales
    if (!initialData) {
      fetchData()
    }
  }, dependencies)

  // Prefetch en segundo plano
  useEffect(() => {
    if (enablePrefetch && data && cacheKey) {
      const timer = setTimeout(() => {
        fetchData(false) // Actualizar en segundo plano sin mostrar loading
      }, 30000) // 30 segundos después

      return () => clearTimeout(timer)
    }
  }, [data, cacheKey, enablePrefetch, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
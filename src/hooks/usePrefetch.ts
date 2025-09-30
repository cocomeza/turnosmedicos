import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cache, cacheKeys, cacheTTL } from '../lib/cache'

// Hook para precargar datos en segundo plano
export const usePrefetchDoctors = (specialtyIds: string[]) => {
  useEffect(() => {
    if (!specialtyIds || specialtyIds.length === 0) return

    const prefetchDoctors = async (specialtyId: string) => {
      const cacheKey = cacheKeys.doctors(specialtyId)
      
      // Si ya está en caché, no hacer nada
      if (cache.has(cacheKey)) return
      
      try {
        console.log(`🔄 Precargando doctores para especialidad ${specialtyId}`)
        
        const { data } = await supabase
          .from('doctors')
          .select(`
            *,
            specialty:specialties(name)
          `)
          .eq('specialty_id', specialtyId)
          .eq('is_active', true)
          .limit(20)
        
        if (data && data.length > 0) {
          cache.set(cacheKey, data, cacheTTL.medium)
        }
      } catch (error) {
        console.error(`Error prefetching doctors for ${specialtyId}:`, error)
      }
    }

    // Precargar doctores para las primeras 3 especialidades
    specialtyIds.slice(0, 3).forEach(id => {
      // Usar setTimeout para no bloquear el thread principal
      setTimeout(() => prefetchDoctors(id), 100)
    })
  }, [specialtyIds])
}

// Hook para precargar horarios disponibles
export const usePrefetchSchedules = (doctorIds: string[]) => {
  useEffect(() => {
    if (!doctorIds || doctorIds.length === 0) return

    const prefetchSchedule = async (doctorId: string) => {
      try {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const cacheKey = cacheKeys.doctorSchedule(doctorId, dayOfWeek)
        
        // Si ya está en caché, no hacer nada
        if (cache.has(cacheKey)) return
        
        console.log(`🔄 Precargando horarios para doctor ${doctorId}`)
        
        const { data } = await supabase
          .from('doctor_schedules')
          .select('start_time, end_time')
          .eq('doctor_id', doctorId)
          .eq('day_of_week', dayOfWeek)
          .single()
        
        if (data) {
          cache.set(cacheKey, data, cacheTTL.long)
        }
      } catch (error) {
        console.error(`Error prefetching schedule for ${doctorId}:`, error)
      }
    }

    // Precargar horarios para los primeros 3 doctores
    doctorIds.slice(0, 3).forEach(id => {
      setTimeout(() => prefetchSchedule(id), 150)
    })
  }, [doctorIds])
}
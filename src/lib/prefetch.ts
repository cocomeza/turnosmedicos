// Sistema de prefetch para cargar datos de manera proactiva
import { supabase } from './supabase'
import { cache, CACHE_KEYS } from './cache'

// Función para prefetch de especialidades
export const prefetchSpecialties = async () => {
  try {
    // Solo hacer prefetch si no está en caché
    const cached = cache.get(CACHE_KEYS.SPECIALTIES)
    if (cached) return

    const { data } = await supabase
      .from('specialties')
      .select('id, name, description')
      .order('name')
      .limit(50)

    if (data) {
      cache.set(CACHE_KEYS.SPECIALTIES, data, 10 * 60 * 1000)
    }
  } catch (error) {
    console.log('Prefetch specialties failed:', error)
  }
}

// Función para prefetch de doctores por especialidad
export const prefetchDoctors = async (specialtyId: string) => {
  try {
    const cacheKey = CACHE_KEYS.DOCTORS(specialtyId)
    const cached = cache.get(cacheKey)
    if (cached) return

    const { data } = await supabase
      .from('doctors')
      .select(`
        id,
        name,
        email,
        phone,
        bio,
        years_experience,
        specialty_id,
        specialty:specialties(name)
      `)
      .eq('specialty_id', specialtyId)
      .eq('is_active', true)
      .order('name')
      .limit(20)

    if (data) {
      cache.set(cacheKey, data, 5 * 60 * 1000)
    }
  } catch (error) {
    console.log('Prefetch doctors failed:', error)
  }
}

// Función para prefetch inteligente basado en patrones de uso
export const intelligentPrefetch = async (currentSpecialtyId?: string) => {
  // Prefetch de especialidades siempre
  await prefetchSpecialties()

  // Si tenemos una especialidad actual, prefetch sus doctores
  if (currentSpecialtyId) {
    await prefetchDoctors(currentSpecialtyId)
  }
}
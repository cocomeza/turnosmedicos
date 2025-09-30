'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, User, Star, Phone, Mail, Award, Clock, Calendar } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'
import { cache, cacheKeys, cacheTTL } from '../lib/cache'
import { usePrefetchSchedules } from '../hooks/usePrefetch'

interface DoctorListProps {
  specialtyId: string
  onSelectDoctor: (doctorId: string) => void
  onBack: () => void
}

// Skeleton loader para doctores
const DoctorSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse">
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-gray-200 p-3 rounded-full w-14 h-14"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
    </div>
  </div>
)

export default function DoctorList({ specialtyId, onSelectDoctor, onBack }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Precargar horarios de los doctores
  usePrefetchSchedules(doctors.map(d => d.id))

  const fetchDoctors = useCallback(async () => {
    setError(null)
    
    // Verificar si hay datos en caché
    const cacheKey = cacheKeys.doctors(specialtyId)
    const cachedData = cache.get<Doctor[]>(cacheKey)
    
    if (cachedData) {
      console.log('📦 Usando doctores desde caché')
      setDoctors(cachedData)
      setLoading(false)
      return
    }
    
    setLoading(true)
    console.log('🔄 Obteniendo doctores desde la base de datos')
    
    try {
      // Implementar timeout para evitar esperas largas
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      const fetchPromise = supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialties(name)
        `)
        .eq('specialty_id', specialtyId)
        .eq('is_active', true)
        .limit(20) // Limitar resultados para mejorar rendimiento
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (data) {
        setDoctors(data)
        // Guardar en caché para futuras visitas
        cache.set(cacheKey, data, cacheTTL.medium)
      } else if (error) {
        console.error('Error fetching doctors:', error)
        setError('Error al cargar los médicos. Por favor, intenta nuevamente.')
      }
    } catch (err) {
      console.error('Error connecting to database:', err)
      setError('No se pudo conectar con el servidor. Por favor, intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }, [specialtyId])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  // Memorizar la lista de doctores renderizada para evitar re-renders innecesarios
  const doctorCards = useMemo(() => doctors.map((doctor) => (
    <div
      key={doctor.id}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="p-6">
        {/* Avatar y header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Dr. {doctor.name}
            </h3>
            <p className="text-blue-600 text-sm font-medium">
              {doctor.specialty?.name}
            </p>
          </div>
        </div>

        {/* Información del doctor */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Award className="h-4 w-4 mr-2 text-yellow-500" />
            <span>{doctor.years_experience} años de experiencia</span>
          </div>
          
          {doctor.bio && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {doctor.bio}
            </p>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-blue-500" />
            <span className="truncate">{doctor.email}</span>
          </div>
          
          {doctor.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-green-500" />
              <span>{doctor.phone}</span>
            </div>
          )}
        </div>

        {/* Botón de selección */}
        <button
          onClick={() => onSelectDoctor(doctor.id)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md"
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Reservar Turno
        </button>
      </div>
    </div>
  )), [doctors, onSelectDoctor])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a especialidades
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <DoctorSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Botón para volver */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a especialidades
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchDoctors}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de doctores */}
      {!error && doctors.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay médicos disponibles</h3>
          <p className="text-gray-600">
            No encontramos médicos para esta especialidad en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorCards}
        </div>
      )}
    </div>
  )
}

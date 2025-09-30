'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, User, Star, Phone, Mail, Award, Clock, Calendar } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'
import { cache, CACHE_KEYS, CACHE_EXPIRY } from '../lib/cache'

interface DoctorListProps {
  specialtyId: string
  onSelectDoctor: (doctorId: string) => void
  onBack: () => void
}

export default function DoctorList({ specialtyId, onSelectDoctor, onBack }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.DOCTORS(specialtyId)
      const cachedDoctors = cache.get<Doctor[]>(cacheKey)
      if (cachedDoctors) {
        setDoctors(cachedDoctors)
        setLoading(false)
        return
      }
      
      // Implementar timeout para evitar esperas indefinidas
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: La búsqueda está tardando demasiado')), 8000)
      )
      
      const fetchPromise = supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialties(name)
        `)
        .eq('specialty_id', specialtyId)
        .eq('is_active', true)
        .order('name')
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (data) {
        setDoctors(data)
        // Cache the data for future use
        cache.set(cacheKey, data, CACHE_EXPIRY.DOCTORS)
      }
      if (error) {
        console.error('Error fetching doctors:', error)
        setError('Error al cargar los médicos de esta especialidad')
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [specialtyId])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  if (loading) {
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
        
        {/* Loading state mejorado */}
        <div className="flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buscando especialistas...
              </h3>
              <p className="text-gray-600 text-sm">
                Encontrando los mejores médicos para ti
              </p>
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  🔍 Revisando disponibilidad y experiencia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
        
        {/* Error state */}
        <div className="flex items-center justify-center py-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border-l-4 border-red-400">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error al cargar médicos
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {error}
              </p>
              <button
                onClick={fetchDoctors}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mr-3"
              >
                Reintentar
              </button>
              <button
                onClick={onBack}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Volver
              </button>
            </div>
          </div>
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

      {/* Lista de doctores */}
      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay médicos disponibles</h3>
          <p className="text-gray-600">
            No encontramos médicos para esta especialidad en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
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
          ))}
        </div>
      )}
    </div>
  )
}

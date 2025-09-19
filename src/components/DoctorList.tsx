'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, User, Star, MapPin, Phone, Mail, Award, Clock, Calendar } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'

interface DoctorListProps {
  specialtyId: string
  onSelectDoctor: (doctorId: string) => void
  onBack: () => void
}

export default function DoctorList({ specialtyId, onSelectDoctor, onBack }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [specialtyId])

  const fetchDoctors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        specialty:specialties(name)
      `)
      .eq('specialty_id', specialtyId)
      .eq('is_active', true)
    
    if (data) setDoctors(data)
    if (error) console.error('Error fetching doctors:', error)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Buscando los mejores especialistas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb mejorado */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="group flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a especialidades
        </button>
      </div>

      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-2xl border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Especialistas Disponibles
        </h2>
        <p className="text-gray-600 mb-4">
          {doctors.length} {doctors.length === 1 ? 'médico encontrado' : 'médicos encontrados'} para atenderte
        </p>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-1 text-blue-500" />
            Certificados
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            Calificación 4.8+
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-green-500" />
            Citas disponibles
          </div>
        </div>
      </div>

      {/* Grid de doctores mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 overflow-hidden"
            onClick={() => onSelectDoctor(doctor.id)}
          >
            {/* Barra superior colorida */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            
            <div className="p-8">
              {/* Header del doctor */}
              <div className="flex items-start space-x-6 mb-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm mt-1">
                        {doctor.specialty?.name}
                      </p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold text-yellow-700">4.9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio y experiencia */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {doctor.bio || "Especialista comprometido con brindar la mejor atención médica a sus pacientes."}
                </p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Award className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">{doctor.years_experience} años de experiencia</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">Disponible hoy</span>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-2 mb-6">
                {doctor.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">Disponible para citas</span>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Reservar cita</span>
                    <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío mejorado */}
      {doctors.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay especialistas disponibles</h3>
          <p className="text-gray-600 mb-6">Intenta seleccionar otra especialidad o contacta con nosotros</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explorar otras especialidades
          </button>
        </div>
      )}
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, User, Star } from 'lucide-react'
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
    return <div className="text-center py-8">Cargando médicos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a especialidades
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">
        Médicos Disponibles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSelectDoctor(doctor.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-sm text-blue-600 mb-2">
                  {doctor.specialty?.name}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {doctor.bio}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{doctor.years_experience} años de experiencia</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
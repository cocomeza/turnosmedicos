'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { supabase, Specialty, isSupabaseConfigured } from '../lib/supabase'
import SpecialtySearch from '../components/SpecialtySearch'
import DoctorList from '../components/DoctorList'
import AppointmentBooking from '../components/AppointmentBooking'

// Datos de ejemplo para mostrar la interfaz cuando Supabase no está configurado
const mockSpecialties: Specialty[] = [
  {
    id: '1',
    name: 'Cardiología',
    description: 'Especialista en corazón y sistema cardiovascular'
  },
  {
    id: '2',
    name: 'Dermatología',
    description: 'Cuidado de la piel, cabello y uñas'
  },
  {
    id: '3',
    name: 'Neurología',
    description: 'Especialista en sistema nervioso y cerebro'
  },
  {
    id: '4',
    name: 'Pediatría',
    description: 'Atención médica especializada para niños'
  },
  {
    id: '5',
    name: 'Traumatología',
    description: 'Tratamiento de lesiones y fracturas'
  },
  {
    id: '6',
    name: 'Ginecología',
    description: 'Salud reproductiva y cuidado femenino'
  }
]

export default function Home() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [supabaseEnabled, setSupabaseEnabled] = useState(false)

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setSupabaseEnabled(configured)
    
    if (configured) {
      fetchSpecialties()
    } else {
      // Usar datos de ejemplo si Supabase no está configurado
      setSpecialties(mockSpecialties)
    }
  }, [])

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name')
      
      if (data) setSpecialties(data)
      if (error) {
        console.error('Error fetching specialties:', error)
        // Fallback a datos de ejemplo si hay error
        setSpecialties(mockSpecialties)
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Usar datos de ejemplo si hay problemas de conexión
      setSpecialties(mockSpecialties)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Turnos Médicos
            </h1>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Settings className="h-4 w-4 mr-2" />
              Panel Administrativo
            </Link>
          </div>
        </div>
        {!supabaseEnabled && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Modo de demostración:</span> 
                  {' '}Configurar Supabase para habilitar todas las funcionalidades.
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedSpecialty ? (
          <SpecialtySearch 
            specialties={specialties}
            onSelectSpecialty={setSelectedSpecialty}
          />
        ) : !selectedDoctor ? (
          <DoctorList 
            specialtyId={selectedSpecialty}
            onSelectDoctor={setSelectedDoctor}
            onBack={() => setSelectedSpecialty(null)}
          />
        ) : (
          <AppointmentBooking 
            doctorId={selectedDoctor}
            onBack={() => setSelectedDoctor(null)}
          />
        )}
      </main>
    </div>
  )
}
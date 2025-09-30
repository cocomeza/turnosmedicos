'use client'
import { useState, useEffect, Suspense, lazy } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { supabase, Specialty, isSupabaseConfigured } from '../lib/supabase'
import { cache, CACHE_KEYS, CACHE_EXPIRY } from '../lib/cache'
import { performanceMonitor, PERFORMANCE_KEYS } from '../lib/performance'
import SpecialtySearch from '../components/SpecialtySearch'

// Lazy load components that are not immediately needed
const DoctorList = lazy(() => import('../components/DoctorList'))
const AppointmentBooking = lazy(() => import('../components/AppointmentBooking'))

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setSupabaseEnabled(configured)
    
    if (configured) {
      fetchSpecialties()
    } else {
      // Usar datos de ejemplo si Supabase no está configurado
      setSpecialties(mockSpecialties)
      setLoading(false)
    }
  }, [])

  const fetchSpecialties = async () => {
    try {
      setLoading(true)
      setError(null)
      performanceMonitor.startTimer(PERFORMANCE_KEYS.SPECIALTIES_LOAD)
      
      // Check cache first
      const cachedSpecialties = cache.get<Specialty[]>(CACHE_KEYS.SPECIALTIES)
      if (cachedSpecialties) {
        setSpecialties(cachedSpecialties)
        setLoading(false)
        performanceMonitor.endTimer(PERFORMANCE_KEYS.SPECIALTIES_LOAD)
        return
      }
      
      // Implementar timeout para evitar esperas indefinidas
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: La conexión está tardando demasiado')), 10000)
      )
      
      const fetchPromise = supabase
        .from('specialties')
        .select('*')
        .order('name')
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (data) {
        setSpecialties(data)
        // Cache the data for future use
        cache.set(CACHE_KEYS.SPECIALTIES, data, CACHE_EXPIRY.SPECIALTIES)
      }
      if (error) {
        console.error('Error fetching specialties:', error)
        setError('Error al cargar las especialidades')
        // Fallback a datos de ejemplo si hay error
        setSpecialties(mockSpecialties)
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      setError('Error de conexión. Mostrando datos de ejemplo.')
      // Usar datos de ejemplo si hay problemas de conexión
      setSpecialties(mockSpecialties)
    } finally {
      setLoading(false)
      performanceMonitor.endTimer(PERFORMANCE_KEYS.SPECIALTIES_LOAD)
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cargando especialidades médicas...
                </h3>
                <p className="text-gray-600 text-sm">
                  Estamos preparando la mejor atención para ti
                </p>
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Tip: La primera carga puede tomar unos segundos
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border-l-4 border-yellow-400">
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Problema de conexión
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchSpecialties}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        ) : !selectedSpecialty ? (
          <SpecialtySearch 
            specialties={specialties}
            onSelectSpecialty={setSelectedSpecialty}
          />
        ) : !selectedDoctor ? (
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className="text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cargando especialistas...
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preparando la lista de médicos
                  </p>
                </div>
              </div>
            </div>
          }>
            <DoctorList 
              specialtyId={selectedSpecialty}
              onSelectDoctor={setSelectedDoctor}
              onBack={() => setSelectedSpecialty(null)}
            />
          </Suspense>
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className="text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cargando reserva de turnos...
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preparando el sistema de citas
                  </p>
                </div>
              </div>
            </div>
          }>
            <AppointmentBooking 
              doctorId={selectedDoctor}
              onBack={() => setSelectedDoctor(null)}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <small className="text-gray-600">
              Desarrollado por{' '}
              <a href="https://botoncreativo.onrender.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                Botón Creativo
              </a>
            </small>
          </div>
        </div>
      </footer>
    </div>
  )
}
'use client'
import { useState, useEffect, Suspense, lazy } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { supabase, Specialty, isSupabaseConfigured } from '../lib/supabase'
import { cache, cacheKeys, cacheTTL } from '../lib/cache'
import { usePrefetchDoctors } from '../hooks/usePrefetch'

// Lazy loading de componentes para mejorar el rendimiento inicial
const SpecialtySearch = lazy(() => import('../components/SpecialtySearch'))
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

// Componente de carga con skeleton
const LoadingSpecialties = () => (
  <div className="space-y-6">
    <div className="text-center bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-2xl border border-blue-100 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-200 p-4 rounded-full w-16 h-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
      <div className="h-12 bg-gray-200 rounded-xl max-w-lg mx-auto"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  </div>
)

export default function Home() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [supabaseEnabled, setSupabaseEnabled] = useState(false)
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true)
  
  // Precargar doctores de las especialidades más populares
  usePrefetchDoctors(specialties.map(s => s.id))

  useEffect(() => {
    const configured = isSupabaseConfigured()
    setSupabaseEnabled(configured)
    
    // Simular un pequeño delay para mostrar el skeleton loader
    const loadSpecialties = async () => {
      setIsLoadingSpecialties(true)
      
      // Pequeño delay para evitar flash de contenido
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (configured) {
        await fetchSpecialties()
      } else {
        // Usar datos de ejemplo si Supabase no está configurado
        setSpecialties(mockSpecialties)
      }
      
      setIsLoadingSpecialties(false)
    }
    
    loadSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      // Verificar si hay datos en caché
      const cacheKey = cacheKeys.specialties()
      const cachedData = cache.get<Specialty[]>(cacheKey)
      
      if (cachedData) {
        console.log('📦 Usando especialidades desde caché')
        setSpecialties(cachedData)
        return
      }
      
      console.log('🔄 Obteniendo especialidades desde la base de datos')
      
      // Implementar timeout para evitar esperas largas
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      const fetchPromise = supabase
        .from('specialties')
        .select('*')
        .order('name')
        .limit(50) // Limitar resultados para mejorar rendimiento
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (data && data.length > 0) {
        setSpecialties(data)
        // Guardar en caché para futuras visitas
        cache.set(cacheKey, data, cacheTTL.long)
      } else if (error || !data || data.length === 0) {
        console.error('Error fetching specialties:', error)
        // Fallback a datos de ejemplo si hay error
        setSpecialties(mockSpecialties)
        // Guardar datos de ejemplo en caché temporalmente
        cache.set(cacheKey, mockSpecialties, cacheTTL.short)
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error)
      // Usar datos de ejemplo si hay problemas de conexión o timeout
      setSpecialties(mockSpecialties)
      // Guardar datos de ejemplo en caché temporalmente
      cache.set(cacheKeys.specialties(), mockSpecialties, cacheTTL.short)
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
        <Suspense fallback={<LoadingSpecialties />}>
          {isLoadingSpecialties ? (
            <LoadingSpecialties />
          ) : !selectedSpecialty ? (
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
        </Suspense>
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
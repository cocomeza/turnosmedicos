'use client'
import { useState, useEffect } from 'react'
import { supabase, Specialty } from '../lib/supabase'
import SpecialtySearch from '../components/SpecialtySearch'
import DoctorList from '../components/DoctorList'
import AppointmentBooking from '../components/AppointmentBooking'

export default function Home() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name')
    
    if (data) setSpecialties(data)
    if (error) console.error('Error fetching specialties:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Turnos Médicos
            </h1>
          </div>
        </div>
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
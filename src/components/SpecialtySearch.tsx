'use client'
import { useState } from 'react'
import { Search, Stethoscope } from 'lucide-react'
import { Specialty } from '../lib/supabase'

interface SpecialtySearchProps {
  specialties: Specialty[]
  onSelectSpecialty: (specialtyId: string) => void
}

export default function SpecialtySearch({ specialties, onSelectSpecialty }: SpecialtySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Buscar por Especialidad
        </h2>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar especialidad..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecialties.map((specialty) => (
          <div
            key={specialty.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSelectSpecialty(specialty.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {specialty.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {specialty.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
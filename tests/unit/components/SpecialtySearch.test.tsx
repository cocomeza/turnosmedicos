import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpecialtySearch from '../../../src/components/SpecialtySearch'
import { Specialty } from '../../../src/lib/supabase'

const mockSpecialties: Specialty[] = [
  {
    id: '1',
    name: 'Cardiología',
    description: 'Especialidad del corazón',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Pediatría',
    description: 'Especialidad para niños',
    created_at: new Date().toISOString()
  }
]

describe('SpecialtySearch', () => {
  it('debe renderizar el componente con especialidades', () => {
    const mockOnSelect = vi.fn()
    render(<SpecialtySearch specialties={mockSpecialties} onSelectSpecialty={mockOnSelect} />)
    expect(screen.getByText(/Encuentra tu Especialista Médico/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Buscar por especialidad médica/i)).toBeInTheDocument()
  })

  it('debe mostrar el placeholder de búsqueda', () => {
    const mockOnSelect = vi.fn()
    render(<SpecialtySearch specialties={mockSpecialties} onSelectSpecialty={mockOnSelect} />)
    const input = screen.getByPlaceholderText(/Buscar por especialidad médica/i)
    expect(input).toBeInTheDocument()
  })
})


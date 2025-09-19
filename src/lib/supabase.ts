
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ejemplo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo.clave.temporal'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función helper para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://ejemplo.supabase.co' && supabaseKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo.clave.temporal'
}

// Tipos TypeScript
export interface Specialty {
  id: string
  name: string
  description: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialty_id: string
  bio: string
  years_experience: number
  profile_image?: string
  specialty?: Specialty
}

export interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  doctor?: Doctor
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
}
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente de Supabase con permisos de administrador (service role)
// Solo debe usarse en el servidor, nunca en el cliente
// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL deben estar configurados para el panel admin')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface AppointmentWithDetails {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  doctor: {
    id: string
    name: string
    email: string
    phone: string
    specialty: {
      name: string
    }
  }
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
}

export interface AdminAppointmentsFilter {
  search?: string
  startDate?: string
  endDate?: string
  status?: string
  doctorId?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'doctor' | 'patient'
  sortOrder?: 'asc' | 'desc'
}

export async function getAppointmentsForAdmin({
  search = '',
  startDate,
  endDate,
  status,
  doctorId,
  page = 1,
  limit = 10,
  sortBy = 'date',
  sortOrder = 'desc'
}: AdminAppointmentsFilter = {}) {
  let query = supabaseAdmin
    .from('appointments')
    .select(`
      id,
      appointment_date,
      appointment_time,
      status,
      notes,
      created_at,
      doctor:doctors(
        id,
        name,
        email,
        phone,
        specialty:specialties(name)
      ),
      patient:patients(
        id,
        name,
        email,
        phone
      )
    `, { count: 'exact' })

  // Filtros
  if (startDate) {
    query = query.gte('appointment_date', startDate)
  }
  if (endDate) {
    query = query.lte('appointment_date', endDate)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (doctorId) {
    query = query.eq('doctor_id', doctorId)
  }

  // Búsqueda de texto (primero buscar pacientes que coincidan)
  if (search) {
    const { data: matchingPatients } = await supabaseAdmin
      .from('patients')
      .select('id')
      .or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    
    if (matchingPatients && matchingPatients.length > 0) {
      const patientIds = matchingPatients.map(p => p.id)
      query = query.in('patient_id', patientIds)
    } else {
      // No hay pacientes que coincidan, retornar resultados vacíos
      return {
        appointments: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0
      }
    }
  }

  // Ordenamiento
  if (sortBy === 'date') {
    query = query.order('appointment_date', { ascending: sortOrder === 'asc' })
    query = query.order('appointment_time', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'doctor') {
    query = query.order('name', { foreignTable: 'doctors', ascending: sortOrder === 'asc' })
  } else if (sortBy === 'patient') {
    query = query.order('name', { foreignTable: 'patients', ascending: sortOrder === 'asc' })
  } else {
    // Default ordering
    query = query.order('appointment_date', { ascending: sortOrder === 'asc' })
    query = query.order('appointment_time', { ascending: sortOrder === 'asc' })
  }

  // Paginación
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching admin appointments:', error)
    throw error
  }

  return {
    appointments: (data || []) as unknown as AppointmentWithDetails[],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment status:', error)
    throw error
  }

  return data
}

export async function getDoctorsForAdmin() {
  const { data, error } = await supabaseAdmin
    .from('doctors')
    .select(`
      id,
      name,
      email,
      specialty:specialties(name)
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching doctors for admin:', error)
    throw error
  }

  return data
}

export async function getAppointmentStats() {
  const today = new Date().toISOString().split('T')[0]
  
  const [
    { count: totalAppointments },
    { count: todayAppointments },
    { count: scheduledAppointments },
    { count: completedAppointments }
  ] = await Promise.all([
    supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today),
    supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed')
  ])

  return {
    total: totalAppointments || 0,
    today: todayAppointments || 0,
    scheduled: scheduledAppointments || 0,
    completed: completedAppointments || 0
  }
}
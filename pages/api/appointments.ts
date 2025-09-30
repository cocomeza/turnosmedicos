import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { doctorId, appointmentDate, appointmentTime, patientInfo } = req.body

      if (!doctorId || !appointmentDate || !appointmentTime || !patientInfo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' })
      }

      // Verificar o crear paciente
      let patientId
      
      // Buscar paciente existente por email
      const { data: existingPatient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('email', patientInfo.email)
        .single()

      if (existingPatient) {
        patientId = existingPatient.id
      } else {
        // Crear nuevo paciente
        const { data: newPatient, error: patientError } = await supabaseAdmin
          .from('patients')
          .insert([{
            name: patientInfo.name,
            email: patientInfo.email,
            phone: patientInfo.phone || ''
          }])
          .select()
          .single()

        if (patientError) {
          console.error('Error creating patient:', patientError)
          return res.status(400).json({ error: 'Error al crear el paciente' })
        }

        patientId = newPatient.id
      }

      // Verificar disponibilidad del horario
      const { data: existingAppointment } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', appointmentDate)
        .eq('appointment_time', appointmentTime)
        .neq('status', 'cancelled')
        .single()

      if (existingAppointment) {
        return res.status(400).json({ error: 'El horario seleccionado ya está ocupado' })
      }

      // Crear la cita
      const { data: appointment, error: appointmentError } = await supabaseAdmin
        .from('appointments')
        .insert([{
          doctor_id: doctorId,
          patient_id: patientId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          status: 'scheduled'
        }])
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          created_at,
          doctor:doctors(
            id,
            name,
            email,
            specialty:specialties(name)
          ),
          patient:patients(
            id,
            name,
            email,
            phone
          )
        `)
        .single()

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError)
        return res.status(400).json({ error: 'Error al crear la cita' })
      }

      return res.status(201).json({ 
        success: true, 
        appointment 
      })
    } catch (error: any) {
      console.error('Error in appointment creation:', error)
      return res.status(500).json({ error: error.message || 'Error al procesar la solicitud' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}

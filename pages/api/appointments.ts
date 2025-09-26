import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../src/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { 
      doctorId, 
      appointmentDate, 
      appointmentTime, 
      patientInfo 
    } = req.body

    // Validar campos requeridos
    if (!doctorId || !appointmentDate || !appointmentTime || !patientInfo?.name || !patientInfo?.email) {
      return res.status(400).json({ 
        error: 'Doctor, fecha, hora y datos del paciente son requeridos' 
      })
    }

    console.log('📋 API: Datos recibidos:', { doctorId, appointmentDate, appointmentTime, patientInfo })

    // Crear o buscar paciente
    let patient
    
    // Intentar buscar paciente existente
    const { data: existingPatient, error: searchError } = await supabaseAdmin
      .from('patients')
      .select('id, name, email, phone')
      .eq('email', patientInfo.email.toLowerCase().trim())
      .single()

    if (existingPatient && !searchError) {
      console.log('✅ API: Paciente encontrado:', existingPatient)
      patient = existingPatient
    } else {
      console.log('👤 API: Creando nuevo paciente...')
      // Crear nuevo paciente
      const { data: newPatient, error: createPatientError } = await supabaseAdmin
        .from('patients')
        .insert([{
          name: patientInfo.name,
          email: patientInfo.email.toLowerCase().trim(),
          phone: patientInfo.phone || ''
        }])
        .select('id, name, email, phone')
        .single()

      if (createPatientError) {
        console.error('❌ API: Error creating patient:', createPatientError)
        return res.status(400).json({ 
          error: `Error al registrar paciente: ${createPatientError.message}` 
        })
      }

      console.log('✅ API: Paciente creado:', newPatient)
      patient = newPatient
    }

    // Verificar que no existe una cita en el mismo horario
    const { data: existingAppointment } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('appointment_time', appointmentTime)
      .neq('status', 'cancelled')
      .single()

    if (existingAppointment) {
      return res.status(400).json({ 
        error: 'El horario seleccionado ya está ocupado' 
      })
    }

    // Crear la cita
    const { data: newAppointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([{
        doctor_id: doctorId,
        patient_id: patient.id,
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
          phone,
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
      console.error('❌ API: Error creating appointment:', appointmentError)
      return res.status(400).json({ 
        error: `Error al crear la cita: ${appointmentError.message}` 
      })
    }

    console.log('✅ API: Cita creada exitosamente:', newAppointment)

    return res.status(201).json({ 
      success: true, 
      appointment: newAppointment 
    })

  } catch (error: any) {
    console.error('❌ API: Error general:', error)
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    })
  }
}
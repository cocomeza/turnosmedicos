import type { NextApiRequest, NextApiResponse } from 'next'
import { getPatientsForAdmin, createPatientForAdmin } from '../../../src/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // La autenticación se maneja en el middleware

  if (req.method === 'GET') {
    try {
      const patients = await getPatientsForAdmin()
      return res.status(200).json({ patients })
    } catch (error) {
      console.error('Error fetching patients:', error)
      return res.status(500).json({ error: 'Error al obtener pacientes' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone } = req.body

      if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' })
      }

      const newPatient = await createPatientForAdmin({ name, email, phone })
      return res.status(201).json({ 
        success: true, 
        patient: newPatient 
      })
    } catch (error: any) {
      console.error('Error creating patient:', error)
      return res.status(400).json({ error: error.message || 'Error al crear paciente' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
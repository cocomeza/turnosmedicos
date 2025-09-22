import type { NextApiRequest, NextApiResponse } from 'next'
import { getAppointmentsForAdmin, updateAppointmentStatus } from '../../../src/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // La autenticación se maneja en el middleware

  if (req.method === 'GET') {
    try {
      const {
        search,
        startDate,
        endDate,
        status,
        doctorId,
        page = '1',
        limit = '10',
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query

      const filters = {
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        doctorId: doctorId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as 'date' | 'doctor' | 'patient',
        sortOrder: sortOrder as 'asc' | 'desc'
      }

      const result = await getAppointmentsForAdmin(filters)
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return res.status(500).json({ error: 'Error al obtener citas' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { appointmentId, status } = req.body

      if (!appointmentId || !status) {
        return res.status(400).json({ error: 'ID de cita y estado requeridos' })
      }

      if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' })
      }

      const updatedAppointment = await updateAppointmentStatus(appointmentId, status)
      return res.status(200).json({ 
        success: true, 
        appointment: updatedAppointment 
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      return res.status(500).json({ error: 'Error al actualizar cita' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
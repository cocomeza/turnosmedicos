import type { NextApiRequest, NextApiResponse } from 'next'
import { getAvailableTimesForAdmin } from '../../../src/lib/supabase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // La autenticación se maneja en el middleware

  if (req.method === 'GET') {
    try {
      const { doctorId, date } = req.query

      if (!doctorId || !date) {
        return res.status(400).json({ error: 'Doctor ID y fecha son requeridos' })
      }

      const availableTimes = await getAvailableTimesForAdmin(
        doctorId as string, 
        date as string
      )
      
      return res.status(200).json({ availableTimes })
    } catch (error) {
      console.error('Error fetching available times:', error)
      return res.status(500).json({ error: 'Error al obtener horarios disponibles' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
import type { NextApiRequest, NextApiResponse } from 'next'
import { validateAdminCredentials, setAdminSession } from '../../../src/lib/admin-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    const isValid = await validateAdminCredentials(email, password)
    
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const sessionCookie = await setAdminSession(email)
    
    res.setHeader('Set-Cookie', sessionCookie)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error in admin login:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

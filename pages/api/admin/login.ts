import type { NextApiRequest, NextApiResponse } from 'next'
import { validateAdminCredentials, setAdminSession } from '../../../src/lib/admin-auth'

// Rate limiting simple (en producción usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutos

function isRateLimited(ip: string): boolean {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false
  
  const now = Date.now()
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(ip)
    return false
  }
  
  return attempts.count >= MAX_ATTEMPTS
}

function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now }
  
  if (success) {
    loginAttempts.delete(ip)
    return
  }
  
  attempts.count += 1
  attempts.lastAttempt = now
  loginAttempts.set(ip, attempts)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
  const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp

  if (isRateLimited(ip)) {
    return res.status(429).json({ 
      error: 'Demasiados intentos de login. Intenta en 15 minutos.' 
    })
  }

  const { email, password } = req.body

  if (!email || !password) {
    recordLoginAttempt(ip, false)
    return res.status(400).json({ error: 'Email y contraseña requeridos' })
  }

  try {
    const isValid = await validateAdminCredentials(email, password)
    
    if (!isValid) {
      recordLoginAttempt(ip, false)
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    recordLoginAttempt(ip, true)
    const cookieString = await setAdminSession(email)

    // Configurar cookie
    res.setHeader('Set-Cookie', cookieString)

    return res.status(200).json({ 
      success: true, 
      message: 'Login exitoso',
      user: { email, role: 'admin' }
    })

  } catch (error) {
    console.error('Error en login admin:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
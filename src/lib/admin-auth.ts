import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { serialize } from 'cookie'

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET debe estar configurado en producción')
    }
    return 'dev-secret-key-change-in-production'
  }
  return secret
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hospital.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export interface AdminUser {
  email: string
  role: 'admin'
  iat: number
  exp: number
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  if (email !== ADMIN_EMAIL) return false
  
  // En desarrollo, comparación directa; en producción, usar hash
  if (process.env.NODE_ENV === 'production' && process.env.ADMIN_PASSWORD_HASH) {
    return bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH)
  }
  
  return password === ADMIN_PASSWORD
}

export async function generateAdminToken(email: string): Promise<string> {
  const secret = new TextEncoder().encode(getJwtSecret())
  
  return await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret())
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as AdminUser
  } catch {
    return null
  }
}

export async function setAdminSession(email: string): Promise<string> {
  const token = await generateAdminToken(email)
  
  return serialize('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 horas
    path: '/'
  })
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  
  if (!token) return null
  return await verifyAdminToken(token)
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })
}
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateAdminCredentials,
  generateAdminToken,
  verifyAdminToken,
  getJwtSecret
} from '../../../src/lib/admin-auth'

describe('admin-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.ADMIN_PASSWORD = 'test123'
    process.env.JWT_SECRET = 'test-secret-key'
  })

  describe('validateAdminCredentials', () => {
    it('debe validar credenciales correctas', async () => {
      const result = await validateAdminCredentials('admin@test.com', 'test123')
      expect(result).toBe(true)
    })

    it('debe rechazar email incorrecto', async () => {
      const result = await validateAdminCredentials('wrong@test.com', 'test123')
      expect(result).toBe(false)
    })

    it('debe rechazar contraseña incorrecta', async () => {
      const result = await validateAdminCredentials('admin@test.com', 'wrong')
      expect(result).toBe(false)
    })
  })

  describe('generateAdminToken', () => {
    it('debe generar un token válido', async () => {
      const token = await generateAdminToken('admin@test.com')
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
  })

  describe('verifyAdminToken', () => {
    it('debe verificar un token válido', async () => {
      const token = await generateAdminToken('admin@test.com')
      const verified = await verifyAdminToken(token)
      
      expect(verified).toBeTruthy()
      expect(verified?.email).toBe('admin@test.com')
      expect(verified?.role).toBe('admin')
    })

    it('debe rechazar un token inválido', async () => {
      const verified = await verifyAdminToken('invalid-token')
      expect(verified).toBeNull()
    })
  })

  describe('getJwtSecret', () => {
    it('debe retornar el secreto de las variables de entorno', () => {
      process.env.JWT_SECRET = 'custom-secret'
      expect(getJwtSecret()).toBe('custom-secret')
    })

    it('debe retornar secreto por defecto en desarrollo', () => {
      delete process.env.JWT_SECRET
      process.env.NODE_ENV = 'development'
      expect(getJwtSecret()).toBe('dev-secret-key-change-in-production')
    })
  })
})


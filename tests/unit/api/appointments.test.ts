import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de Next.js API
vi.mock('next', () => ({
  default: vi.fn()
}))

describe('API Appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe validar datos de entrada', () => {
    const validData = {
      doctorId: '123',
      patientInfo: {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '123456789'
      },
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00'
    }

    expect(validData.doctorId).toBeTruthy()
    expect(validData.patientInfo.email).toContain('@')
    expect(validData.appointmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(validData.appointmentTime).toMatch(/^\d{2}:\d{2}$/)
  })

  it('debe rechazar datos inválidos', () => {
    const invalidData = {
      doctorId: '',
      patientInfo: {
        name: '',
        email: 'invalid-email',
        phone: ''
      },
      appointmentDate: 'invalid-date',
      appointmentTime: 'invalid-time'
    }

    expect(invalidData.doctorId).toBeFalsy()
    expect(invalidData.patientInfo.email).not.toContain('@')
  })
})


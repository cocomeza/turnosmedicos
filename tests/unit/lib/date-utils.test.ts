import { describe, it, expect } from 'vitest'
import { formatDateForAPI } from '../../../src/lib/date-utils'

describe('date-utils', () => {
  it('debe formatear fecha correctamente para API', () => {
    const date = new Date('2024-01-15T10:00:00')
    const formatted = formatDateForAPI(date)
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(formatted).toBe('2024-01-15')
  })

  it('debe manejar diferentes zonas horarias', () => {
    const date = new Date('2024-12-25T23:59:59')
    const formatted = formatDateForAPI(date)
    expect(formatted).toBe('2024-12-25')
  })
})

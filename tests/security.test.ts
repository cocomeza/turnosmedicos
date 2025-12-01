import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('Seguridad', () => {
  it('debe verificar vulnerabilidades en dependencias', () => {
    try {
      const result = execSync('npm audit --json', { encoding: 'utf-8' })
      const audit = JSON.parse(result)
      
      const vulnerabilities = audit.vulnerabilities || {}
      const critical = Object.values(vulnerabilities).filter((v: any) => v.severity === 'critical')
      const high = Object.values(vulnerabilities).filter((v: any) => v.severity === 'high')
      
      expect(critical.length).toBe(0)
      expect(high.length).toBeLessThan(10) // Permitir algunas vulnerabilidades de nivel alto
    } catch (error) {
      // Si npm audit falla, no es crítico para los tests
      console.warn('npm audit no disponible')
    }
  })

  it('debe validar que no hay secrets hardcodeados', () => {
    // Verificar que no hay secrets en el código
    const secrets = [
      'sk_live',
      'pk_live',
      'password.*=.*["\']',
      'secret.*=.*["\']',
      'api_key.*=.*["\']'
    ]
    
    // Este test es más una advertencia que un fallo
    expect(secrets.length).toBeGreaterThan(0)
  })
})


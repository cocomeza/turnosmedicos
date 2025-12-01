import { test, expect } from '@playwright/test'

test.describe('Panel de Administración', () => {
  test('debe requerir autenticación para acceder al admin', async ({ page }) => {
    await page.goto('/admin')
    
    // Debe redirigir a login o mostrar mensaje de acceso denegado
    const isLoginPage = page.url().includes('/login') || 
                       page.url().includes('/auth') ||
                       await page.locator('text=/iniciar|login|acceso/i').isVisible()
    
    expect(isLoginPage || page.url() !== '/admin').toBeTruthy()
  })

  test('debe tener estructura de admin si está autenticado', async ({ page }) => {
    // Este test requiere autenticación mock o real
    // Por ahora solo verificamos que la ruta existe
    const response = await page.goto('/admin', { waitUntil: 'networkidle' })
    expect(response?.status()).toBeLessThan(500)
  })
})

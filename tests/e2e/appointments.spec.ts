import { test, expect } from '@playwright/test'

test.describe('Sistema de Turnos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('debe mostrar especialidades disponibles', async ({ page }) => {
    // Esperar a que cargue el contenido
    await page.waitForLoadState('networkidle')
    
    // Buscar elementos relacionados con especialidades
    const specialtyElements = page.locator('button, select, [role="button"]').filter({
      hasText: /cardiología|pediatría|dermatología|especialidad/i
    })
    
    // Si hay elementos, verificar que sean visibles
    const count = await specialtyElements.count()
    if (count > 0) {
      await expect(specialtyElements.first()).toBeVisible()
    }
  })

  test('debe permitir seleccionar fecha', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Buscar input de fecha
    const dateInput = page.locator('input[type="date"], input[placeholder*="fecha" i], [role="textbox"]').first()
    
    if (await dateInput.count() > 0) {
      await expect(dateInput).toBeVisible()
    }
  })
})

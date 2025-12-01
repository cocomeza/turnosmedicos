import { test, expect } from '@playwright/test'

test.describe('Página Principal', () => {
  test('debe cargar la página principal', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/turnos|médicos|appointments/i)
  })

  test('debe mostrar el formulario de búsqueda', async ({ page }) => {
    await page.goto('/')
    const searchForm = page.locator('form, [role="search"], input[type="search"]').first()
    await expect(searchForm).toBeVisible({ timeout: 10000 })
  })

  test('debe navegar correctamente', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('localhost:3000')
  })
})

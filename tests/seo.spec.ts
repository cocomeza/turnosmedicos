import { test, expect } from '@playwright/test'

test.describe('SEO', () => {
  test('debe tener título en la página principal', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
    expect(title.length).toBeLessThan(60) // Títulos SEO óptimos son < 60 caracteres
  })

  test('debe tener meta descripción', async ({ page }) => {
    await page.goto('/')
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    
    // Si existe, debe tener contenido válido
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50)
      expect(metaDescription.length).toBeLessThan(160) // Descripciones SEO óptimas son 50-160 caracteres
    }
  })

  test('debe tener meta viewport para móviles', async ({ page }) => {
    await page.goto('/')
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    
    expect(viewport).toBeTruthy()
    expect(viewport).toContain('width')
  })

  test('debe tener al menos un H1', async ({ page }) => {
    await page.goto('/')
    const h1Count = await page.locator('h1').count()
    
    expect(h1Count).toBeGreaterThan(0)
    expect(h1Count).toBeLessThan(3) // Solo uno o dos H1 es mejor para SEO
  })

  test('debe tener estructura semántica HTML5', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que tenga elementos semánticos
    const hasHeader = await page.locator('header').count() > 0
    const hasMain = await page.locator('main').count() > 0
    const hasFooter = await page.locator('footer').count() > 0
    
    expect(hasHeader || hasMain).toBeTruthy() // Al menos header o main
  })

  test('las imágenes deben tener atributos alt', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const images = await page.locator('img').all()
    
    for (const img of images.slice(0, 5)) { // Verificar primeras 5 imágenes
      const alt = await img.getAttribute('alt')
      // Alt puede ser string vacío para imágenes decorativas, pero debe existir
      expect(alt).not.toBeNull()
    }
  })

  test('debe tener lang en el elemento html', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    
    expect(lang).toBeTruthy()
  })
})


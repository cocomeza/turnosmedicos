import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('página principal debe cargar rápidamente', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // La página debe cargar en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000)
  })

  test('debe tener buen tiempo de primera pintura', async ({ page }) => {
    await page.goto('/')
    
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart
      }
    })

    // DOM debe estar listo en menos de 2 segundos
    expect(metrics.domContentLoaded).toBeLessThan(2000)
  })

  test('no debe tener recursos bloqueantes grandes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const resources = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return perfData
        .filter(r => r.transferSize > 500000) // Más de 500KB
        .map(r => ({
          name: r.name,
          size: r.transferSize
        }))
    })

    // No debería haber muchos recursos grandes
    expect(resources.length).toBeLessThan(10)
  })
})


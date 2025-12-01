import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accesibilidad', () => {
  test('página principal debe ser accesible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('formularios deben tener labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]')
    const count = await inputs.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      
      // Al menos uno debe existir
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false
      expect(hasLabel || !!ariaLabel || !!placeholder).toBeTruthy()
    }
  })

  test('debe tener contraste de colores adecuado', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()

    // Filtrar solo violaciones de contraste
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    )

    expect(contrastViolations.length).toBe(0)
  })

  test('elementos interactivos deben ser accesibles por teclado', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar que los botones sean focusables
    const buttons = page.locator('button, [role="button"], a[href]')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i)
      const tabIndex = await button.getAttribute('tabindex')
      
      // No debe tener tabindex="-1" a menos que sea intencional
      if (tabIndex === '-1') {
        const ariaHidden = await button.getAttribute('aria-hidden')
        expect(ariaHidden).not.toBe('true')
      }
    }
  })
})

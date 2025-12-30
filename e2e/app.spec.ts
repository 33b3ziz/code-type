import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('CodeType App', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TanStack/)
  })

  test('@a11y home page has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})

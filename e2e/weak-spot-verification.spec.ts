/**
 * Temporary Playwright test to verify the weak spot training mode feature
 * This test file should be deleted after verification
 */

import { test, expect } from '@playwright/test'

test.describe('Weak Spot Training Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the practice page
    await page.goto('/practice')
  })

  test('should display the practice mode selector', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the Practice Mode heading is visible
    await expect(page.locator('h1:has-text("Practice Mode")')).toBeVisible()

    // Check that the practice selector is shown
    await expect(page.locator('text=Focused exercises to improve your typing skills')).toBeVisible()
  })

  test('should show weak-spots practice mode option', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Look for the weak spots mode card by data-testid
    const weakSpotsCard = page.locator('[data-testid="practice-mode-weak-spots"]')
    await expect(weakSpotsCard).toBeVisible()

    // Should show the title and description
    await expect(page.locator('text=Weak Spot Training')).toBeVisible()
    await expect(page.locator('text=Focus on characters where you make the most mistakes')).toBeVisible()
  })

  test('should start weak spot drill when selected', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Click on weak spots mode card
    await page.click('[data-testid="practice-mode-weak-spots"]')

    // Wait for duration selection and click Start button
    await page.waitForTimeout(500)
    const startButton = page.locator('button:has-text("Start Practice")')
    if (await startButton.isVisible()) {
      await startButton.click()
    }

    // Wait for the drill to start
    await page.waitForTimeout(1000)

    // Check that the weak spot drill header is visible (in the drill component)
    const drillHeader = page.locator('h2:has-text("Weak Spot Training")')
    await expect(drillHeader).toBeVisible({ timeout: 5000 })

    // Check that focus characters are displayed
    await expect(page.locator('text=Focus on:')).toBeVisible()
  })

  test('should have cancel button that returns to selector', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Start weak spots practice
    await page.click('[data-testid="practice-mode-weak-spots"]')
    await page.waitForTimeout(500)

    const startButton = page.locator('button:has-text("Start Practice")')
    if (await startButton.isVisible()) {
      await startButton.click()
    }

    await page.waitForTimeout(1000)

    // Click cancel
    await page.click('text=Cancel')

    // Should return to selector
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="practice-mode-weak-spots"]')).toBeVisible()
  })

  test('should show timer countdown', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Start weak spots practice
    await page.click('[data-testid="practice-mode-weak-spots"]')
    await page.waitForTimeout(500)

    const startButton = page.locator('button:has-text("Start Practice")')
    if (await startButton.isVisible()) {
      await startButton.click()
    }

    await page.waitForTimeout(1000)

    // Timer should be visible with format like "1:00" or "0:30"
    const timer = page.locator('.text-2xl.font-mono.font-bold')
    await expect(timer).toBeVisible()

    // Timer should contain a colon (time format)
    const timerText = await timer.textContent()
    expect(timerText).toMatch(/\d+:\d+/)
  })
})

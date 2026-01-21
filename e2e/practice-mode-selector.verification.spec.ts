/**
 * VERIFICATION TEST - Practice Mode Selector
 * This is a temporary test to verify the practice mode selector feature works correctly.
 * DELETE THIS FILE after verification is complete.
 */

import { test, expect } from '@playwright/test'

test.describe('Practice Mode Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to practice page
    await page.goto('/practice')
    // Wait for the selector to load
    await page.waitForSelector('[data-testid="practice-selector"]')
  })

  test('should display all six practice modes', async ({ page }) => {
    // Check that all six practice modes are visible
    const modes = ['symbols', 'keywords', 'weak-spots', 'speed', 'accuracy', 'warm-up']

    for (const mode of modes) {
      const modeCard = page.locator(`[data-testid="practice-mode-${mode}"]`)
      await expect(modeCard).toBeVisible()
    }
  })

  test('should show difficulty indicators for each mode', async ({ page }) => {
    const modes = ['symbols', 'keywords', 'weak-spots', 'speed', 'accuracy', 'warm-up']

    for (const mode of modes) {
      const difficultyBadge = page.locator(`[data-testid="difficulty-${mode}"]`)
      await expect(difficultyBadge).toBeVisible()

      // Check badge has one of the valid difficulty labels
      const badgeText = await difficultyBadge.textContent()
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(badgeText)
    }
  })

  test('should show estimated duration for each mode', async ({ page }) => {
    // Duration info should be visible in each mode card (contains clock icon)
    const modeCards = page.locator('[data-testid^="practice-mode-"]')
    const count = await modeCards.count()

    expect(count).toBe(6) // All six modes should be present

    // Each card should contain duration text
    for (let i = 0; i < count; i++) {
      const card = modeCards.nth(i)
      // Duration text pattern like "1-2 min", "30s-1 min", etc.
      await expect(card).toContainText(/\d+(-\d+)?\s*(min|s)/)
    }
  })

  test('should toggle favorite mode', async ({ page }) => {
    const symbolsFavorite = page.locator('[data-testid="favorite-symbols"]')

    // Initially should not be favorited (no fill)
    await expect(symbolsFavorite).toBeVisible()

    // Click to favorite
    await symbolsFavorite.click()

    // Star should now be filled (favorited)
    await expect(symbolsFavorite.locator('svg')).toHaveClass(/fill-current/)

    // Click again to unfavorite
    await symbolsFavorite.click()

    // Star should no longer be filled
    await expect(symbolsFavorite.locator('svg')).not.toHaveClass(/fill-current/)
  })

  test('should select a mode and show configuration panel', async ({ page }) => {
    // Click on the symbols practice mode
    await page.locator('[data-testid="practice-mode-symbols"]').click()

    // Configuration panel should appear
    await expect(page.locator('[data-testid="practice-config"]')).toBeVisible()

    // Start button should be visible
    await expect(page.locator('[data-testid="start-practice-button"]')).toBeVisible()
  })

  test('should show language selection for modes that require it', async ({ page }) => {
    // Symbols mode requires language selection
    await page.locator('[data-testid="practice-mode-symbols"]').click()

    // Wait for config panel
    await expect(page.locator('[data-testid="practice-config"]')).toBeVisible()

    // Language options should be present
    await expect(page.locator('[data-testid="language-javascript"]')).toBeVisible()
    await expect(page.locator('[data-testid="language-typescript"]')).toBeVisible()
    await expect(page.locator('[data-testid="language-python"]')).toBeVisible()
  })

  test('should show difficulty selection for modes that require it', async ({ page }) => {
    // Speed mode requires difficulty selection
    await page.locator('[data-testid="practice-mode-speed"]').click()

    // Wait for config panel
    await expect(page.locator('[data-testid="practice-config"]')).toBeVisible()

    // Difficulty options should be present
    await expect(page.locator('[data-testid="difficulty-option-beginner"]')).toBeVisible()
    await expect(page.locator('[data-testid="difficulty-option-intermediate"]')).toBeVisible()
    await expect(page.locator('[data-testid="difficulty-option-advanced"]')).toBeVisible()
    await expect(page.locator('[data-testid="difficulty-option-hardcore"]')).toBeVisible()
  })

  test('should not show language/difficulty for warm-up mode', async ({ page }) => {
    // Warm-up mode doesn't require language or difficulty
    await page.locator('[data-testid="practice-mode-warm-up"]').click()

    // Wait for config panel
    await expect(page.locator('[data-testid="practice-config"]')).toBeVisible()

    // Language options should NOT be present
    await expect(page.locator('[data-testid="language-javascript"]')).not.toBeVisible()

    // Difficulty options should NOT be present
    await expect(page.locator('[data-testid="difficulty-option-beginner"]')).not.toBeVisible()
  })

  test('should show duration selection options', async ({ page }) => {
    await page.locator('[data-testid="practice-mode-symbols"]').click()

    // Wait for config panel
    await expect(page.locator('[data-testid="practice-config"]')).toBeVisible()

    // Duration options should be present
    await expect(page.locator('[data-testid="duration-30"]')).toBeVisible()
    await expect(page.locator('[data-testid="duration-60"]')).toBeVisible()
    await expect(page.locator('[data-testid="duration-90"]')).toBeVisible()
    await expect(page.locator('[data-testid="duration-120"]')).toBeVisible()
    await expect(page.locator('[data-testid="duration-180"]')).toBeVisible()
  })

  test('should highlight recommended mode when provided', async ({ page }) => {
    // The practice page shows a recommended mode (default is warm-up)
    // Check that the recommended badge is visible
    const recommendedBadge = page.locator('text=Recommended')

    // At least one mode should be recommended
    await expect(recommendedBadge.first()).toBeVisible()
  })

  test('should persist favorites in localStorage', async ({ page }) => {
    // Favorite the symbols mode
    await page.locator('[data-testid="favorite-symbols"]').click()

    // Wait for the star to be filled
    await expect(page.locator('[data-testid="favorite-symbols"] svg')).toHaveClass(/fill-current/)

    // Reload the page
    await page.reload()
    await page.waitForSelector('[data-testid="practice-selector"]')

    // The symbols mode should still be favorited
    await expect(page.locator('[data-testid="favorite-symbols"] svg')).toHaveClass(/fill-current/)

    // Clean up - unfavorite
    await page.locator('[data-testid="favorite-symbols"]').click()
  })
})

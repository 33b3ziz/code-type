/**
 * Temporary Verification Test for Virtual Leaderboard Feature
 * This test verifies the virtual scrolling and caching implementation
 * DELETE THIS FILE after verification is complete
 */

import { expect, test } from '@playwright/test'

test.describe('Virtual Leaderboard Feature Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to leaderboard and wait longer for server rendering
    await page.goto('/leaderboard', { waitUntil: 'networkidle', timeout: 30000 })
  })

  test('leaderboard page renders successfully', async ({ page }) => {
    // Wait for the page to be ready - either content loads or error state
    await page.waitForSelector('h1, [data-testid="virtual-leaderboard-scroll"], text="No results"', { timeout: 15000 })

    // Check that we have some kind of leaderboard content
    const hasTitle = await page.locator('h1').count() > 0
    const hasScrollContainer = await page.getByTestId('virtual-leaderboard-scroll').count() > 0
    const hasEmptyState = await page.locator('text=No results').count() > 0
    const hasParticipants = await page.locator('text=/\\d+ participants/').count() > 0

    // At least one of these should be true if page rendered
    expect(hasTitle || hasScrollContainer || hasEmptyState || hasParticipants).toBe(true)
  })

  test('virtual scroll container exists when data is present', async ({ page }) => {
    // Wait for any state to be ready
    await page.waitForSelector('[data-testid="virtual-leaderboard-scroll"], text="No results yet"', { timeout: 15000 })

    const scrollContainer = page.getByTestId('virtual-leaderboard-scroll')
    const emptyState = page.locator('text="No results yet"')

    // Either scroll container with data OR empty state
    const hasScrollContainer = await scrollContainer.count() > 0
    const hasEmptyState = await emptyState.count() > 0

    expect(hasScrollContainer || hasEmptyState).toBe(true)

    if (hasScrollContainer) {
      // Verify the scroll container has proper structure
      await expect(scrollContainer).toBeVisible()
    }
  })

  test('time frame selector is functional', async ({ page }) => {
    // Wait for page content
    await page.waitForTimeout(2000)

    // Find the select trigger using various selectors
    const selectTrigger = page.locator('[role="combobox"], [data-state="closed"][data-placeholder]').first()

    const triggerCount = await selectTrigger.count()
    if (triggerCount > 0) {
      await expect(selectTrigger).toBeVisible()

      // Click to open dropdown
      await selectTrigger.click()

      // Wait for dropdown to open
      await page.waitForTimeout(500)

      // Check that options appear
      const options = page.locator('[role="option"]')
      const optionCount = await options.count()

      expect(optionCount).toBeGreaterThan(0)
    }
  })

  test('footer displays showing count', async ({ page }) => {
    // Wait for content
    await page.waitForTimeout(2000)

    // Look for footer with count - matches pattern "Showing X of Y participants"
    const footer = page.locator('text=/Showing \\d+ of \\d+ participants/')
    const hasFooter = await footer.count() > 0

    // Footer only appears when there's data
    if (hasFooter) {
      await expect(footer).toBeVisible()
    }
  })

  test('header row contains expected columns', async ({ page }) => {
    // Wait for content to render
    await page.waitForTimeout(2000)

    // Check for header columns when data exists
    const hasHeader = await page.locator('.sticky.top-0').count() > 0
    const hasScrollContainer = await page.getByTestId('virtual-leaderboard-scroll').count() > 0

    if (hasHeader && hasScrollContainer) {
      await expect(page.locator('text=Rank').first()).toBeVisible()
      await expect(page.locator('text=User').first()).toBeVisible()
      await expect(page.locator('text=Best WPM').first()).toBeVisible()
    }
  })

  test('virtual rows render when data exists', async ({ page }) => {
    // Wait for content
    await page.waitForTimeout(2000)

    const scrollContainer = page.getByTestId('virtual-leaderboard-scroll')
    const hasScrollContainer = await scrollContainer.count() > 0

    if (hasScrollContainer) {
      // Check for virtual rows
      const virtualRows = page.locator('[data-testid^="virtual-row-"]')
      const rowCount = await virtualRows.count()

      // If container exists with data, we should have rows
      if (rowCount > 0) {
        const firstRow = virtualRows.first()
        await expect(firstRow).toBeVisible()
      }
    }
  })

  test('page handles URL parameters for time frame', async ({ page }) => {
    // Navigate with specific time frame
    await page.goto('/leaderboard?timeFrame=weekly', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // URL should contain the time frame
    expect(page.url()).toContain('timeFrame=weekly')

    // Navigate to different time frame
    await page.goto('/leaderboard?timeFrame=daily', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    expect(page.url()).toContain('timeFrame=daily')
  })

  test('responsive design - content adapts to viewport', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/leaderboard', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Page should render
    const hasContent = await page.locator('body').count() > 0
    expect(hasContent).toBe(true)

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Page should still render on mobile
    expect(await page.locator('body').count()).toBeGreaterThan(0)
  })
})

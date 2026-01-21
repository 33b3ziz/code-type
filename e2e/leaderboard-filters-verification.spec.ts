import { expect, test } from '@playwright/test'

/**
 * Verification test for leaderboard filtering feature
 * Tests: Time period, language, difficulty filters, and sorting options
 */

test.describe('Leaderboard Filtering Feature Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to leaderboard page
    await page.goto('/leaderboard')
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should render the leaderboard page with filters', async ({ page }) => {
    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()

    // Check that the filter components are rendered
    await expect(page.getByTestId('leaderboard-filters')).toBeVisible()

    // Check for time frame filter
    await expect(page.getByTestId('timeframe-filter')).toBeVisible()

    // Check for language filter
    await expect(page.getByTestId('language-filter')).toBeVisible()

    // Check for difficulty filter
    await expect(page.getByTestId('difficulty-filter')).toBeVisible()

    // Check for sort by filter
    await expect(page.getByTestId('sortby-filter')).toBeVisible()

    // Check for sort order filter
    await expect(page.getByTestId('sortorder-filter')).toBeVisible()
  })

  test('should change time frame filter via URL', async ({ page }) => {
    // Navigate with daily time frame
    await page.goto('/leaderboard?timeFrame=daily')
    await page.waitForLoadState('networkidle')

    // Verify the timeframe filter shows "Today"
    const timeFrameButton = page.getByTestId('timeframe-filter')
    await expect(timeFrameButton).toContainText('Today')
  })

  test('should change time frame filter via dropdown', async ({ page }) => {
    // Click on the time frame filter
    await page.getByTestId('timeframe-filter').click()

    // Select "This Week"
    await page.getByRole('option', { name: 'This Week' }).click()

    // Wait for navigation
    await page.waitForURL(/timeFrame=weekly/)

    // Verify URL was updated
    expect(page.url()).toContain('timeFrame=weekly')
  })

  test('should filter by language', async ({ page }) => {
    // Click on the language filter
    await page.getByTestId('language-filter').click()

    // Select "TypeScript"
    await page.getByRole('option', { name: 'TypeScript' }).click()

    // Wait for navigation
    await page.waitForURL(/language=typescript/)

    // Verify URL was updated
    expect(page.url()).toContain('language=typescript')
  })

  test('should filter by difficulty', async ({ page }) => {
    // Click on the difficulty filter
    await page.getByTestId('difficulty-filter').click()

    // Select "Intermediate"
    await page.getByRole('option', { name: 'Intermediate' }).click()

    // Wait for navigation
    await page.waitForURL(/difficulty=intermediate/)

    // Verify URL was updated
    expect(page.url()).toContain('difficulty=intermediate')
  })

  test('should change sort by option', async ({ page }) => {
    // Click on the sort by filter
    await page.getByTestId('sortby-filter').click()

    // Select "Accuracy"
    await page.getByRole('option', { name: 'Accuracy' }).click()

    // Wait for navigation
    await page.waitForURL(/sortBy=accuracy/)

    // Verify URL was updated
    expect(page.url()).toContain('sortBy=accuracy')
  })

  test('should change sort order', async ({ page }) => {
    // Click on the sort order filter
    await page.getByTestId('sortorder-filter').click()

    // Select "Worst First"
    await page.getByRole('option', { name: 'Worst First' }).click()

    // Wait for navigation
    await page.waitForURL(/sortOrder=asc/)

    // Verify URL was updated
    expect(page.url()).toContain('sortOrder=asc')
  })

  test('should combine multiple filters', async ({ page }) => {
    // Navigate with multiple filters
    await page.goto('/leaderboard?timeFrame=monthly&language=javascript&difficulty=beginner&sortBy=accuracy&sortOrder=desc')
    await page.waitForLoadState('networkidle')

    // Verify page loaded with all filters
    await expect(page.getByTestId('timeframe-filter')).toContainText('This Month')
    await expect(page.getByTestId('language-filter')).toContainText('JavaScript')
    await expect(page.getByTestId('difficulty-filter')).toContainText('Beginner')
    await expect(page.getByTestId('sortby-filter')).toContainText('Accuracy')
    await expect(page.getByTestId('sortorder-filter')).toContainText('Best First')
  })

  test('should show participant count', async ({ page }) => {
    // Check that participant count is displayed
    const participantText = page.getByText(/participants/)
    await expect(participantText).toBeVisible()
  })

  test('should display filter badges when filters are active', async ({ page }) => {
    // Navigate with language filter
    await page.goto('/leaderboard?language=typescript')
    await page.waitForLoadState('networkidle')

    // Check that the filter badge is displayed
    await expect(page.getByText('typescript')).toBeVisible()
  })

  test('should reset language filter to all', async ({ page }) => {
    // Start with a language filter
    await page.goto('/leaderboard?language=javascript')
    await page.waitForLoadState('networkidle')

    // Click on the language filter
    await page.getByTestId('language-filter').click()

    // Select "All Languages"
    await page.getByRole('option', { name: 'All Languages' }).click()

    // Wait for navigation - language should be removed from URL
    await page.waitForLoadState('networkidle')

    // Verify language is no longer in URL
    expect(page.url()).not.toContain('language=javascript')
  })

  test('should display leaderboard description based on sort', async ({ page }) => {
    // Check default description mentions speed
    await expect(page.getByText(/ranked by speed/i)).toBeVisible()

    // Change to accuracy sort
    await page.goto('/leaderboard?sortBy=accuracy')
    await page.waitForLoadState('networkidle')

    // Check description mentions accuracy
    await expect(page.getByText(/ranked by accuracy/i)).toBeVisible()
  })
})

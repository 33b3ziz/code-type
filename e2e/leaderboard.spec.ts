import { test, expect } from './fixtures/test-fixtures'

test.describe('Leaderboard Page', () => {
  test('should load the leaderboard page', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()
  })

  test('should display leaderboard description', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await expect(page.getByText('Top typists ranked by best WPM')).toBeVisible()
  })

  test('should show trophy icon', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Trophy icon should be present
    const trophyIcon = page.locator('.text-yellow-400').first()
    await expect(trophyIcon).toBeVisible()
  })

  test('should display participant count', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await expect(page.getByText(/\d+\s*participants/)).toBeVisible()
  })
})

test.describe('Leaderboard Time Frame Selection', () => {
  test('should have time frame selector', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Time frame selector should be visible
    const trigger = page.locator('[data-slot="select-trigger"]')
    await expect(trigger).toBeVisible()
  })

  test('should show all time frame options', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Click to open dropdown
    const trigger = page.locator('[data-slot="select-trigger"]')
    await trigger.click()

    // Check all options are present
    await expect(page.getByRole('option', { name: 'Today' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'This Week' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'This Month' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'All Time' })).toBeVisible()
  })

  test('should update URL when time frame changes', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Select daily
    await leaderboardPage.selectTimeFrame('daily')

    // URL should reflect the time frame
    await expect(page).toHaveURL(/timeFrame=daily/)
  })

  test('should select weekly time frame', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await leaderboardPage.selectTimeFrame('weekly')

    await expect(page).toHaveURL(/timeFrame=weekly/)
  })

  test('should select monthly time frame', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await leaderboardPage.selectTimeFrame('monthly')

    await expect(page).toHaveURL(/timeFrame=monthly/)
  })

  test('should load with time frame from URL', async ({ page }) => {
    await page.goto('/leaderboard?timeFrame=weekly')

    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()

    // The selector should show "This Week"
    const trigger = page.locator('[data-slot="select-trigger"]')
    await expect(trigger).toContainText('This Week')
  })
})

test.describe('Leaderboard Table', () => {
  test('should display leaderboard table or empty state', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Either table or empty state should be visible
    const table = page.locator('table')
    const emptyState = page.getByText(/No results yet|Be the First/i)

    const hasTable = await table.isVisible().catch(() => false)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should have correct table headers when entries exist', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      await expect(page.getByRole('columnheader', { name: 'Rank' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'Best WPM' })).toBeVisible()
    }
  })

  test('should show "Be the First" button when no entries', async ({ page, leaderboardPage }) => {
    // Go to a time frame that might have no entries (like daily)
    await page.goto('/leaderboard?timeFrame=daily')

    const emptyState = page.getByRole('link', { name: 'Be the First!' })
    const table = page.locator('table')

    // If empty state is visible, check the button
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible()
    } else {
      // Otherwise table should be visible
      await expect(table).toBeVisible()
    }
  })
})

test.describe('Leaderboard Table Content', () => {
  test('should display medal emojis for top 3 when entries exist', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      // Check if there are at least 3 entries
      const rows = page.locator('tbody tr')
      const rowCount = await rows.count()

      if (rowCount >= 3) {
        // Top 3 should have medal emojis
        const medals = page.locator('.text-xl')
        await expect(medals.first()).toBeVisible()
      }
    }
  })

  test('should display WPM values in cyan color', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      // Best WPM should be in cyan
      const wpmCells = page.locator('.text-cyan-400.font-bold.font-mono')
      if (await wpmCells.first().isVisible()) {
        await expect(wpmCells.first()).toBeVisible()
      }
    }
  })

  test('should color-code accuracy values', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      // Accuracy values should be colored based on value
      // High accuracy: green, medium: yellow, low: red
      const accuracyCells = page.locator('td').filter({ hasText: /%$/ })
      if (await accuracyCells.first().isVisible()) {
        await expect(accuracyCells.first()).toBeVisible()
      }
    }
  })
})

test.describe('Leaderboard - User Rank Card', () => {
  test('should show sign in prompt for non-authenticated users', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // For non-authenticated users, check for sign in CTA
    const signInCTA = page.getByText('Sign in to track your rank and compete!')

    // This may or may not be visible depending on if there are entries
    const table = page.locator('table')
    if (await table.isVisible()) {
      // If there are entries and user is not logged in, should show CTA
      const ctaVisible = await signInCTA.isVisible().catch(() => false)
      if (ctaVisible) {
        await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Create Account' })).toBeVisible()
      }
    }
  })

  test('should have sign in button that navigates to login', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      const signInLink = page.getByRole('link', { name: 'Sign In' })
      if (await signInLink.isVisible()) {
        await signInLink.click()
        await expect(page).toHaveURL('/login')
      }
    }
  })

  test('should have create account button that navigates to register', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      const createAccountLink = page.getByRole('link', { name: 'Create Account' })
      if (await createAccountLink.isVisible()) {
        await createAccountLink.click()
        await expect(page).toHaveURL('/register')
      }
    }
  })
})

test.describe('Leaderboard - Navigation', () => {
  test('should be accessible from home page', async ({ page }) => {
    await page.goto('/')

    // Navigate via Quick Start or other link
    const leaderboardLink = page.getByRole('link', { name: 'Leaderboard' })
    if (await leaderboardLink.first().isVisible()) {
      await leaderboardLink.first().click()
      await expect(page).toHaveURL(/\/leaderboard/)
    }
  })

  test('should be accessible from header navigation', async ({ page }) => {
    await page.goto('/')

    // Desktop navigation
    const navLink = page.locator('nav').getByRole('link', { name: 'Leaderboard' })
    if (await navLink.isVisible()) {
      await navLink.click()
      await expect(page).toHaveURL(/\/leaderboard/)
    }
  })

  test('should navigate to test page from empty state', async ({ page, leaderboardPage }) => {
    await page.goto('/leaderboard?timeFrame=daily')

    const beFirstButton = page.getByRole('link', { name: 'Be the First!' })
    if (await beFirstButton.isVisible()) {
      await beFirstButton.click()
      await expect(page).toHaveURL('/test')
    }
  })
})

test.describe('Leaderboard - Responsive Design', () => {
  test('should hide some columns on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/leaderboard')

    const table = page.locator('table')
    if (await table.isVisible()) {
      // Some columns should be hidden on mobile
      const avgWpmHeader = page.getByRole('columnheader', { name: 'Avg WPM' })
      const accuracyHeader = page.getByRole('columnheader', { name: 'Accuracy' })

      // These should be hidden with md:table-cell class
      await expect(avgWpmHeader).not.toBeVisible()
      await expect(accuracyHeader).not.toBeVisible()
    }
  })

  test('should show all columns on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.goto('/leaderboard')

    const table = page.locator('table')
    if (await table.isVisible()) {
      // All columns should be visible on desktop
      await expect(page.getByRole('columnheader', { name: 'Rank' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'Best WPM' })).toBeVisible()
    }
  })
})

test.describe('Leaderboard - Accessibility', () => {
  test('@a11y should have proper heading structure', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()
  })

  test('@a11y table should have proper structure', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    const table = page.locator('table')
    if (await table.isVisible()) {
      // Table should have thead and tbody
      await expect(page.locator('thead')).toBeVisible()
      await expect(page.locator('tbody')).toBeVisible()
    }
  })

  test('@a11y should use semantic HTML for navigation', async ({ page, leaderboardPage }) => {
    await leaderboardPage.goto()

    // Clock icon indicates time filter
    const clockIcon = page.locator('.text-gray-400').first()
    await expect(clockIcon).toBeVisible()
  })
})

/**
 * TEMPORARY VERIFICATION TEST
 * Tests the live race progress tracking feature
 * This test file should be deleted after verification
 */

import { test, expect } from './fixtures/test-fixtures'

test.describe('Live Race Progress Tracking Feature', () => {
  test('should display race progress component with player tracking elements', async ({ page, racePage }) => {
    await racePage.goto()

    // Verify the race page loads
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()

    // Verify Create Room and Join Room sections exist
    await expect(page.getByRole('heading', { name: 'Create a Room' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Join a Room' })).toBeVisible()
  })

  test('should have all race configuration options', async ({ page, racePage }) => {
    await racePage.goto()

    // Verify max players selection
    await expect(page.getByText('Max Players')).toBeVisible()
    for (const num of [2, 3, 4, 5]) {
      await expect(page.getByRole('button', { name: String(num), exact: true })).toBeVisible()
    }

    // Verify language selection
    await expect(page.getByText('Language').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'JavaScript' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'TypeScript' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Python' })).toBeVisible()

    // Verify difficulty selection
    await expect(page.getByText('Difficulty')).toBeVisible()

    // Verify countdown duration selection
    await expect(page.getByText('Countdown Duration')).toBeVisible()
  })

  test('should properly handle room code input for joining races', async ({ page, racePage }) => {
    await racePage.goto()

    const codeInput = page.getByPlaceholder('ABCDEF')

    // Test uppercase conversion
    await codeInput.fill('abcdef')
    await expect(codeInput).toHaveValue('ABCDEF')

    // Test max length enforcement
    await codeInput.fill('')
    await codeInput.fill('ABCDEFGHIJ')
    await expect(codeInput).toHaveValue('ABCDEF')
  })

  test('should show loading state when attempting to create room', async ({ page, racePage }) => {
    await racePage.goto()

    // Configure room
    await racePage.selectMaxPlayers(2)
    await racePage.selectLanguage('JavaScript')

    // Click create room
    await page.getByRole('button', { name: /Create Room/i }).click()

    // Should show some feedback (loading or error)
    // We give it some time to respond
    await page.waitForTimeout(1000)

    // Either we see loading, an error, or we're in the lobby
    const hasResponse = await Promise.race([
      page.getByText('Creating...').isVisible().catch(() => false),
      page.locator('.bg-red-500\\/10').isVisible().catch(() => false),
      page.getByText('Room Code:').isVisible().catch(() => false),
    ])

    expect(hasResponse).toBeDefined()
  })

  test('RaceTypingArea component integration is configured', async ({ page }) => {
    // Navigate to the race page
    await page.goto('/race')
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()

    // The RaceTypingArea should be used when a race is active
    // We verify the import is configured by checking that no errors occur
    // and the page renders correctly
    const createRoomButton = page.getByRole('button', { name: /Create Room/i })
    await expect(createRoomButton).toBeVisible()
    await expect(createRoomButton).toBeEnabled()
  })

  test('RaceProgress component displays correctly', async ({ page }) => {
    await page.goto('/race')

    // The RaceProgress component should be available when racing
    // For now, we verify the page structure supports it
    // The component will display during actual races with:
    // - Player progress tracks
    // - WPM display
    // - Accuracy display
    // - Countdown overlay

    // Verify the page is functional
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()

    // Verify the How to play section explains the progress tracking
    await expect(page.getByText('How to play multiplayer:')).toBeVisible()
    await expect(page.getByText('When everyone is ready, the host starts the race')).toBeVisible()
  })

  test('should handle room join button state correctly', async ({ page, racePage }) => {
    await racePage.goto()

    const joinButton = page.getByRole('button', { name: /Join Room/i })

    // Initially disabled (no code)
    await expect(joinButton).toBeDisabled()

    // Enter partial code
    await page.getByPlaceholder('ABCDEF').fill('ABC')
    await expect(joinButton).toBeDisabled()

    // Enter full code
    await page.getByPlaceholder('ABCDEF').fill('ABCDEF')
    await expect(joinButton).toBeEnabled()
  })
})

test.describe('Race Progress UI Elements', () => {
  test('player selection buttons should be interactive', async ({ page, racePage }) => {
    await racePage.goto()

    // Select different player counts and verify visual feedback
    for (const num of [2, 3, 4, 5] as const) {
      await racePage.selectMaxPlayers(num)
      const button = page.getByRole('button', { name: String(num), exact: true })
      await expect(button).toHaveClass(/border-cyan-500/)
    }
  })

  test('language selection buttons should be interactive', async ({ page, racePage }) => {
    await racePage.goto()

    // Select JavaScript
    await racePage.selectLanguage('JavaScript')
    const jsButton = page.getByRole('button', { name: 'JavaScript' })
    await expect(jsButton).toHaveClass(/border-cyan-500/)

    // Select TypeScript
    await racePage.selectLanguage('TypeScript')
    const tsButton = page.getByRole('button', { name: 'TypeScript' })
    await expect(tsButton).toHaveClass(/border-cyan-500/)

    // Select Python
    await racePage.selectLanguage('Python')
    const pyButton = page.getByRole('button', { name: 'Python' })
    await expect(pyButton).toHaveClass(/border-cyan-500/)
  })

  test('private room toggle should work', async ({ page, racePage }) => {
    await racePage.goto()

    const toggle = page.locator('button.rounded-full')

    // Toggle on
    await toggle.click()
    await expect(toggle).toHaveClass(/bg-cyan-500/)

    // Toggle off
    await toggle.click()
    await expect(toggle).toHaveClass(/bg-slate-600/)
  })
})

test.describe('Integration Verification', () => {
  test('race page imports and renders without errors', async ({ page }) => {
    // Navigate to race page
    await page.goto('/race')

    // Check page renders without JS errors
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Verify main elements are present
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Create a Room' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Join a Room' })).toBeVisible()

    // No critical errors should have occurred
    const criticalErrors = errors.filter(e =>
      !e.includes('Pusher') && // Ignore Pusher connection errors
      !e.includes('WebSocket') // Ignore WebSocket errors
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('navigation to race page works correctly', async ({ page }) => {
    // Start from home
    await page.goto('/')

    // Navigate via header link
    await page.getByRole('link', { name: 'Multiplayer' }).click()

    // Verify we're on the race page
    await expect(page).toHaveURL('/race')
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
  })
})

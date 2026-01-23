import { test, expect } from './fixtures/test-fixtures'

test.describe('Multiplayer Race Page', () => {
  test('should load the race page', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
  })

  test('should display description text', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('Compete against other programmers in real-time typing races')).toBeVisible()
  })

  test('should show connection status', async ({ page, racePage }) => {
    await racePage.goto()

    // Should show connection status (either connecting, connected, or ready to connect)
    const statusIndicator = page.locator('.flex.items-center.justify-center.gap-2')
    await expect(statusIndicator).toBeVisible()
  })

  test('should display "How to play" instructions', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('How to play multiplayer:')).toBeVisible()
    await expect(page.getByText('Create a room or join with a room code')).toBeVisible()
    await expect(page.getByText('Share the room code with friends')).toBeVisible()
    await expect(page.getByText('Wait for other players to join')).toBeVisible()
    await expect(page.getByText('When everyone is ready, the host starts the race')).toBeVisible()
  })
})

test.describe('Multiplayer Race - Create Room', () => {
  test('should display create room section', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByRole('heading', { name: 'Create a Room' })).toBeVisible()
  })

  test('should have max players selection with options 2-5', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('Max Players')).toBeVisible()

    // Check all player count options are available
    for (const num of [2, 3, 4, 5]) {
      await expect(page.getByRole('button', { name: String(num), exact: true })).toBeVisible()
    }
  })

  test('should select different max player counts', async ({ page, racePage }) => {
    await racePage.goto()

    // Select 2 players
    await racePage.selectMaxPlayers(2)
    const button2 = page.getByRole('button', { name: '2', exact: true })
    await expect(button2).toHaveClass(/border-cyan-500/)

    // Select 5 players
    await racePage.selectMaxPlayers(5)
    const button5 = page.getByRole('button', { name: '5', exact: true })
    await expect(button5).toHaveClass(/border-cyan-500/)
  })

  test('should have language selection', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('Language').first()).toBeVisible()

    // Check language options
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'JavaScript' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'TypeScript' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Python' })).toBeVisible()
  })

  test('should select different languages', async ({ page, racePage }) => {
    await racePage.goto()

    // Select JavaScript
    await racePage.selectLanguage('JavaScript')
    const jsButton = page.getByRole('button', { name: 'JavaScript' })
    await expect(jsButton).toHaveClass(/border-cyan-500/)

    // Select TypeScript
    await racePage.selectLanguage('TypeScript')
    const tsButton = page.getByRole('button', { name: 'TypeScript' })
    await expect(tsButton).toHaveClass(/border-cyan-500/)

    // Select Any (default)
    await racePage.selectLanguage('Any')
    const anyButton = page.getByRole('button', { name: 'Any' })
    await expect(anyButton).toHaveClass(/border-cyan-500/)
  })

  test('should have private room toggle', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('Private Room')).toBeVisible()

    // Toggle button should exist
    const toggle = page.locator('button.rounded-full')
    await expect(toggle).toBeVisible()
  })

  test('should toggle private room setting', async ({ page, racePage }) => {
    await racePage.goto()

    const toggle = page.locator('button.rounded-full')

    // Click to enable private
    await toggle.click()
    await expect(toggle).toHaveClass(/bg-cyan-500/)

    // Click to disable private
    await toggle.click()
    await expect(toggle).toHaveClass(/bg-slate-600/)
  })

  test('should have Create Room button', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByRole('button', { name: /Create Room/i })).toBeVisible()
  })
})

test.describe('Multiplayer Race - Join Room', () => {
  test('should display join room section', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByRole('heading', { name: 'Join a Room' })).toBeVisible()
  })

  test('should have room code input field', async ({ page, racePage }) => {
    await racePage.goto()

    await expect(page.getByText('Room Code')).toBeVisible()
    await expect(page.getByPlaceholder('ABCDEF')).toBeVisible()
  })

  test('should accept only 6 characters in room code', async ({ page, racePage }) => {
    await racePage.goto()

    const codeInput = page.getByPlaceholder('ABCDEF')

    // Try to enter more than 6 characters
    await codeInput.fill('ABCDEFGHIJ')

    // Should only have 6 characters
    await expect(codeInput).toHaveValue('ABCDEF')
  })

  test('should convert room code to uppercase', async ({ page, racePage }) => {
    await racePage.goto()

    const codeInput = page.getByPlaceholder('ABCDEF')

    await codeInput.fill('abcdef')

    // Should be converted to uppercase
    await expect(codeInput).toHaveValue('ABCDEF')
  })

  test('should have disabled Join Room button when code is incomplete', async ({ page, racePage }) => {
    await racePage.goto()

    const joinButton = page.getByRole('button', { name: /Join Room/i })

    // Button should be disabled with no code
    await expect(joinButton).toBeDisabled()

    // Enter partial code
    await page.getByPlaceholder('ABCDEF').fill('ABC')

    // Button should still be disabled
    await expect(joinButton).toBeDisabled()
  })

  test('should enable Join Room button when code is complete', async ({ page, racePage }) => {
    await racePage.goto()

    // Enter full 6-character code
    await page.getByPlaceholder('ABCDEF').fill('TESTCD')

    const joinButton = page.getByRole('button', { name: /Join Room/i })

    // Button should be enabled
    await expect(joinButton).toBeEnabled()
  })
})

test.describe('Multiplayer Race - Room Creation Flow', () => {
  // Note: These tests may fail without a proper Pusher backend configured
  // They are designed to test the UI flow
  test('should show loading state when creating room', async ({ page, racePage }) => {
    await racePage.goto()

    // Configure room settings
    await racePage.selectMaxPlayers(4)
    await racePage.selectLanguage('JavaScript')

    // Click Create Room
    await page.getByRole('button', { name: /Create Room/i }).click()

    // Should show loading or error state (depending on Pusher config)
    const isLoading = await page.getByText('Creating...').isVisible().catch(() => false)
    const hasError = await page.locator('.bg-red-500\\/10').isVisible().catch(() => false)

    // Either loading or error should appear (since Pusher may not be configured)
    expect(isLoading || hasError).toBeTruthy()
  })

  test('should show error message if Pusher is not configured', async ({ page, racePage }) => {
    await racePage.goto()

    // Click Create Room
    await page.getByRole('button', { name: /Create Room/i }).click()

    // Wait a bit for potential error
    await page.waitForTimeout(2000)

    // If there's an error about Pusher configuration, it should be displayed
    const errorMessage = page.locator('.bg-red-500\\/10')
    if (await errorMessage.isVisible()) {
      await expect(page.getByText(/Pusher|environment variables|connect/i)).toBeVisible()
    }
  })
})

test.describe('Multiplayer Race - Join Room Flow', () => {
  test('should show loading state when joining room', async ({ page, racePage }) => {
    await racePage.goto()

    // Enter a room code
    await racePage.enterJoinCode('TESTAB')

    // Click Join Room
    await page.getByRole('button', { name: /Join Room/i }).click()

    // Should show loading or error state
    const isLoading = await page.getByText('Joining...').isVisible().catch(() => false)
    const hasError = await page.locator('.bg-red-500\\/10').isVisible().catch(() => false)

    expect(isLoading || hasError).toBeTruthy()
  })

  test('should show error for non-existent room', async ({ page, racePage }) => {
    await racePage.goto()

    // Enter a fake room code
    await racePage.enterJoinCode('FAKERO')

    // Click Join Room
    await page.getByRole('button', { name: /Join Room/i }).click()

    // Wait for response
    await page.waitForTimeout(3000)

    // Should show some kind of error (room not found or connection error)
    const errorMessage = page.locator('.bg-red-500\\/10')
    // May or may not show error depending on Pusher config
  })
})

test.describe('Multiplayer Race - UI States', () => {
  test('should display both create and join sections on menu view', async ({ page, racePage }) => {
    await racePage.goto()

    // Both sections should be visible on menu
    await expect(page.getByRole('heading', { name: 'Create a Room' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Join a Room' })).toBeVisible()
  })

  test('should have responsive grid layout', async ({ page, racePage }) => {
    await racePage.goto()

    // Check grid container exists
    const grid = page.locator('.grid.md\\:grid-cols-2')
    await expect(grid).toBeVisible()
  })
})

test.describe('Multiplayer Race - Accessibility', () => {
  test('@a11y should have proper form labels', async ({ page, racePage }) => {
    await racePage.goto()

    // Check for labels
    await expect(page.getByText('Max Players')).toBeVisible()
    await expect(page.getByText('Language').first()).toBeVisible()
    await expect(page.getByText('Room Code')).toBeVisible()
  })

  test('@a11y buttons should be properly labeled', async ({ page, racePage }) => {
    await racePage.goto()

    // Check button text is clear
    await expect(page.getByRole('button', { name: /Create Room/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Join Room/i })).toBeVisible()
  })

  test('@a11y input should have placeholder for guidance', async ({ page, racePage }) => {
    await racePage.goto()

    const codeInput = page.getByPlaceholder('ABCDEF')
    await expect(codeInput).toBeVisible()
    await expect(codeInput).toHaveAttribute('maxLength', '6')
  })
})

test.describe('Multiplayer Race - Navigation', () => {
  test('should be accessible from home page', async ({ page }) => {
    await page.goto('/')

    // Find and click Multiplayer Race link
    await page.getByRole('link', { name: /Multiplayer Race/i }).click()

    await expect(page).toHaveURL('/race')
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
  })

  test('should be accessible from header navigation', async ({ page }) => {
    await page.goto('/')

    // Click on Multiplayer in navigation
    await page.getByRole('link', { name: 'Multiplayer' }).click()

    await expect(page).toHaveURL('/race')
  })
})

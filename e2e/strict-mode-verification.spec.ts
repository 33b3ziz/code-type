/**
 * Strict Mode Feature Verification Test
 *
 * This test verifies the strict mode functionality:
 * 1. Strict mode badge is displayed when enabled
 * 2. Test ends immediately on first error
 * 3. Error message and shake animation are shown
 * 4. Settings page allows toggling strict mode
 */

import { test, expect } from './fixtures/test-fixtures'

test.describe('Strict Mode Feature Verification', () => {
  test('should show strict mode badge when strict mode is enabled', async ({ page }) => {
    // First, enable strict mode in settings
    await page.goto('/settings')

    // Find and enable strict mode toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Check if not already enabled, then enable
    const isChecked = await strictModeToggle.getAttribute('data-state')
    if (isChecked !== 'checked') {
      await strictModeToggle.click()
      // Wait for save
      await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })
    }

    // Go to typing test
    await page.goto('/test')
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })

    // Verify strict mode badge is displayed
    const strictModeBadge = page.locator('[data-testid="strict-mode-badge"]')
    await expect(strictModeBadge).toBeVisible()
    await expect(strictModeBadge).toContainText('Strict')
  })

  test('should fail test immediately on first error in strict mode', async ({ page }) => {
    // First, enable strict mode in settings
    await page.goto('/settings')

    // Find and enable strict mode toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Enable strict mode if not already enabled
    const isChecked = await strictModeToggle.getAttribute('data-state')
    if (isChecked !== 'checked') {
      await strictModeToggle.click()
      await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })
    }

    // Go to typing test
    await page.goto('/test?difficulty=beginner')
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })

    // Get the code to type
    const codeText = await page.locator('pre code').textContent()
    expect(codeText).toBeTruthy()
    expect(codeText!.length).toBeGreaterThan(0)

    // Start typing by clicking on the code area
    await page.locator('.bg-slate-900.rounded-xl').click()

    // Type a wrong character (use a character that's definitely not the first character)
    const firstChar = codeText![0]
    const wrongChar = firstChar === '~' ? '@' : '~'

    await page.keyboard.type(wrongChar, { delay: 50 })

    // Should show "Strict Mode Failed!" message
    const completionMessage = page.locator('[data-testid="completion-message"]')
    await expect(completionMessage).toBeVisible({ timeout: 5000 })
    await expect(completionMessage).toContainText('Strict Mode Failed!')

    // Should have red border on code container
    const codeContainer = page.locator('.bg-slate-900.rounded-xl')
    await expect(codeContainer).toHaveClass(/border-red-500/)
  })

  test('should complete test normally with no errors in strict mode', async ({ page }) => {
    // First, enable strict mode in settings
    await page.goto('/settings')

    // Find and enable strict mode toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Enable strict mode if not already enabled
    const isChecked = await strictModeToggle.getAttribute('data-state')
    if (isChecked !== 'checked') {
      await strictModeToggle.click()
      await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })
    }

    // Go to typing test
    await page.goto('/test?difficulty=beginner')
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })

    // Get the code to type
    const codeText = await page.locator('pre code').textContent()
    expect(codeText).toBeTruthy()

    // Start typing
    await page.locator('.bg-slate-900.rounded-xl').click()

    // Type the entire code correctly
    for (const char of codeText!) {
      if (char === '\n') {
        await page.keyboard.press('Enter')
      } else {
        await page.keyboard.type(char, { delay: 5 })
      }
    }

    // Should show "Test Complete!" message (not "Strict Mode Failed!")
    const completionMessage = page.locator('[data-testid="completion-message"]')
    await expect(completionMessage).toBeVisible({ timeout: 15000 })
    await expect(completionMessage).toContainText('Test Complete!')
    await expect(completionMessage).not.toContainText('Strict Mode Failed')
  })

  test('should not show strict mode badge when disabled', async ({ page }) => {
    // First, disable strict mode in settings
    await page.goto('/settings')

    // Find strict mode toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Disable strict mode if enabled
    const isChecked = await strictModeToggle.getAttribute('data-state')
    if (isChecked === 'checked') {
      await strictModeToggle.click()
      await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })
    }

    // Go to typing test
    await page.goto('/test')
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })

    // Verify strict mode badge is NOT displayed
    const strictModeBadge = page.locator('[data-testid="strict-mode-badge"]')
    await expect(strictModeBadge).not.toBeVisible()
  })

  test('should allow continuing after error when strict mode is disabled', async ({ page }) => {
    // First, disable strict mode in settings
    await page.goto('/settings')

    // Find strict mode toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Disable strict mode if enabled
    const isChecked = await strictModeToggle.getAttribute('data-state')
    if (isChecked === 'checked') {
      await strictModeToggle.click()
      await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })
    }

    // Go to typing test
    await page.goto('/test?difficulty=beginner')
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })

    // Get the code to type
    const codeText = await page.locator('pre code').textContent()
    expect(codeText).toBeTruthy()

    // Start typing
    await page.locator('.bg-slate-900.rounded-xl').click()

    // Type a wrong character first
    const firstChar = codeText![0]
    const wrongChar = firstChar === '~' ? '@' : '~'
    await page.keyboard.type(wrongChar, { delay: 50 })

    // Test should NOT be finished
    const completionMessage = page.locator('[data-testid="completion-message"]')
    await expect(completionMessage).not.toBeVisible()

    // Should have incorrect character styling (red)
    const incorrectChars = page.locator('.text-red-400')
    await expect(incorrectChars.first()).toBeVisible()

    // Can continue typing
    await page.keyboard.type('a', { delay: 50 })

    // Still not finished
    await expect(completionMessage).not.toBeVisible()
  })

  test('should toggle strict mode in settings', async ({ page }) => {
    await page.goto('/settings')

    // Find the Strict Mode section
    await expect(page.getByText('Strict Mode')).toBeVisible()
    await expect(page.getByText('End test immediately on error')).toBeVisible()

    // Find the toggle
    const strictModeSection = page.locator('text=Strict Mode').locator('..')
    const strictModeToggle = strictModeSection.locator('button[role="switch"]')

    // Get initial state
    const initialState = await strictModeToggle.getAttribute('data-state')

    // Toggle it
    await strictModeToggle.click()

    // Wait for save
    await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })

    // Verify state changed
    const newState = await strictModeToggle.getAttribute('data-state')
    expect(newState).not.toBe(initialState)

    // Toggle back
    await strictModeToggle.click()
    await expect(page.getByText('Settings saved')).toBeVisible({ timeout: 5000 })

    // Verify back to original state
    const finalState = await strictModeToggle.getAttribute('data-state')
    expect(finalState).toBe(initialState)
  })
})

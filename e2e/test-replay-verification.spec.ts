/**
 * Verification test for the Test Replay System feature
 * This test verifies that:
 * 1. Keystroke data is captured during a typing test
 * 2. The "View Replay" button appears after test completion
 * 3. The replay player opens and shows correct controls
 * 4. The replay player displays keystroke information correctly
 */

import { expect, test } from './fixtures/test-fixtures'

test.describe('Test Replay System', () => {
  test('should show View Replay button after completing a typing test', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Get the expected text from the code display
    const codeDisplay = page.locator('pre code')
    await expect(codeDisplay).toBeVisible()

    const expectedText = await codeDisplay.textContent()
    if (!expectedText) {
      throw new Error('No code content found')
    }

    // Start typing
    await typingTestPage.startTyping()

    // Type the code
    await page.keyboard.type(expectedText, { delay: 5 })

    // Wait for test completion message
    await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 30000 })

    // Verify the "View Replay" button appears
    const viewReplayButton = page.getByTestId('view-replay-btn')
    await expect(viewReplayButton).toBeVisible()
    await expect(viewReplayButton).toContainText('View Replay')
  })

  test('should open replay player when clicking View Replay', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Get the code and type it
    const codeDisplay = page.locator('pre code')
    await expect(codeDisplay).toBeVisible()

    const expectedText = await codeDisplay.textContent()
    if (!expectedText) {
      throw new Error('No code content found')
    }

    await typingTestPage.startTyping()
    await page.keyboard.type(expectedText, { delay: 5 })

    // Wait for completion
    await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 30000 })

    // Click the View Replay button
    await page.getByTestId('view-replay-btn').click()

    // Verify the replay player is visible
    const replayPlayer = page.getByTestId('test-replay-player')
    await expect(replayPlayer).toBeVisible()

    // Verify replay controls are present
    await expect(page.getByTestId('replay-controls')).toBeVisible()
    await expect(page.getByTestId('replay-play-btn')).toBeVisible()
    await expect(page.getByTestId('replay-prev-btn')).toBeVisible()
    await expect(page.getByTestId('replay-next-btn')).toBeVisible()
    await expect(page.getByTestId('replay-reset-btn')).toBeVisible()
    await expect(page.getByTestId('replay-end-btn')).toBeVisible()

    // Verify stats are displayed
    await expect(page.getByTestId('replay-stats')).toBeVisible()
    await expect(page.getByTestId('replay-wpm')).toBeVisible()
    await expect(page.getByTestId('replay-accuracy')).toBeVisible()
  })

  test('should step through keystrokes using replay controls', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Get the code and type it
    const codeDisplay = page.locator('pre code')
    await expect(codeDisplay).toBeVisible()

    const expectedText = await codeDisplay.textContent()
    if (!expectedText) {
      throw new Error('No code content found')
    }

    await typingTestPage.startTyping()
    await page.keyboard.type(expectedText, { delay: 20 })

    // Wait for completion
    await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 30000 })

    // Open replay
    await page.getByTestId('view-replay-btn').click()
    await expect(page.getByTestId('test-replay-player')).toBeVisible()

    // Initially should be at the start (0 keystrokes played)
    const progressText = page.locator('text=/0 \\/ \\d+ keystrokes/')
    await expect(progressText).toBeVisible()

    // Click next button to step forward
    await page.getByTestId('replay-next-btn').click()

    // Verify keystroke info is shown
    const keystrokeInfo = page.getByTestId('current-keystroke-info')
    await expect(keystrokeInfo).toBeVisible()

    // Click next a few more times
    await page.getByTestId('replay-next-btn').click()
    await page.getByTestId('replay-next-btn').click()

    // Click previous to go back
    await page.getByTestId('replay-prev-btn').click()

    // Reset to start
    await page.getByTestId('replay-reset-btn').click()

    // Go to end
    await page.getByTestId('replay-end-btn').click()
  })

  test('should close replay player when clicking Close', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Quick typing test
    const codeDisplay = page.locator('pre code')
    await expect(codeDisplay).toBeVisible()

    const expectedText = await codeDisplay.textContent()
    if (!expectedText) {
      throw new Error('No code content found')
    }

    await typingTestPage.startTyping()
    await page.keyboard.type(expectedText, { delay: 5 })

    // Wait for completion and open replay
    await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('view-replay-btn').click()

    // Verify replay is open
    await expect(page.getByTestId('test-replay-player')).toBeVisible()

    // Click Close button
    await page.click('text=Close')

    // Verify replay is closed
    await expect(page.getByTestId('test-replay-player')).not.toBeVisible()
  })

  test('should change playback speed', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Quick typing test
    const codeDisplay = page.locator('pre code')
    await expect(codeDisplay).toBeVisible()

    const expectedText = await codeDisplay.textContent()
    if (!expectedText) {
      throw new Error('No code content found')
    }

    await typingTestPage.startTyping()
    await page.keyboard.type(expectedText, { delay: 5 })

    // Wait for completion and open replay
    await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('view-replay-btn').click()

    // Verify speed buttons are visible
    await expect(page.getByTestId('speed-0.5')).toBeVisible()
    await expect(page.getByTestId('speed-1')).toBeVisible()
    await expect(page.getByTestId('speed-2')).toBeVisible()

    // Click 2x speed
    await page.getByTestId('speed-2').click()

    // Verify 2x is now highlighted (has bg-cyan-500 class)
    await expect(page.getByTestId('speed-2')).toHaveClass(/bg-cyan-500/)

    // Click 0.5x speed
    await page.getByTestId('speed-0.5').click()
    await expect(page.getByTestId('speed-0.5')).toHaveClass(/bg-cyan-500/)
  })
})

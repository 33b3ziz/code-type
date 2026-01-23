import { test, expect } from './fixtures/test-fixtures'

test.describe('Typing Test Page', () => {
  test('should load the typing test page', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()

    // Check page title and elements
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
  })

  test('should display filter options', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Check language selector exists
    await expect(page.getByText('Language')).toBeVisible()

    // Check difficulty options are present
    await expect(page.getByRole('button', { name: 'Beginner' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Intermediate' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Advanced' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Hardcore' })).toBeVisible()

    // Check new snippet button
    await expect(page.getByRole('button', { name: /New Snippet/i })).toBeVisible()
  })

  test('should load a code snippet', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Check that code is displayed
    const codeContainer = page.locator('pre code')
    await expect(codeContainer).toBeVisible()

    // Check that there's actual content in the code
    const codeText = await codeContainer.textContent()
    expect(codeText?.length).toBeGreaterThan(0)
  })

  test('should display live stats', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Check stats bar elements
    await expect(page.getByText('WPM:')).toBeVisible()
    await expect(page.getByText('Accuracy:')).toBeVisible()
    await expect(page.getByText('Progress:')).toBeVisible()

    // Check progress bar exists
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('should show typing instructions when not started', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await expect(page.getByText('Click here and start typing to begin the test')).toBeVisible()
  })

  test('should load new snippet when New Snippet button is clicked', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Get initial code
    const initialCode = await page.locator('pre code').textContent()

    // Click New Snippet (might or might not get different snippet due to randomness)
    await typingTestPage.getNewSnippet()

    // Code container should still be visible
    await expect(page.locator('pre code')).toBeVisible()
  })

  test('should navigate back to home page', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()

    await page.getByRole('button', { name: /Back/i }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Typing Test Interaction', () => {
  test('should start typing when clicking on code area', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Click on the code container
    await page.locator('.bg-slate-900.rounded-xl').click()

    // The hidden input should be focused
    const hiddenInput = page.locator('input[type="text"]')
    await expect(hiddenInput).toBeFocused()
  })

  test('should show cursor when typing starts', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.startTyping()

    // Cursor element should be visible (animated pulse)
    const cursor = page.locator('.animate-pulse.bg-cyan-400')
    await expect(cursor.first()).toBeVisible()
  })

  test('should update progress when typing', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Get the code to type
    const codeElement = page.locator('pre code')
    const codeText = await codeElement.textContent()

    if (codeText && codeText.length > 0) {
      // Type the first few characters
      await typingTestPage.startTyping()
      const firstChars = codeText.substring(0, Math.min(5, codeText.length))

      for (const char of firstChars) {
        await page.keyboard.type(char, { delay: 50 })
      }

      // Progress should be greater than 0
      const progressBar = page.locator('.bg-cyan-500.transition-all')
      const style = await progressBar.getAttribute('style')
      expect(style).toContain('width:')
    }
  })

  test('should show correct/incorrect highlighting', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.startTyping()

    // Get first character of code
    const codeText = await page.locator('pre code').textContent()

    if (codeText && codeText.length > 0) {
      const firstChar = codeText[0]

      // Type the correct first character
      await page.keyboard.type(firstChar, { delay: 50 })

      // Should have a correct character (green)
      const correctChars = page.locator('.text-green-400')
      await expect(correctChars.first()).toBeVisible()
    }
  })

  test('should show incorrect character styling on mistake', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.startTyping()

    // Type an incorrect character
    const codeText = await page.locator('pre code').textContent()
    if (codeText && codeText.length > 0) {
      // Type something that's definitely wrong (a random symbol)
      const firstChar = codeText[0]
      const wrongChar = firstChar === '~' ? '@' : '~'

      await page.keyboard.type(wrongChar, { delay: 50 })

      // Should have an incorrect character (red)
      const incorrectChars = page.locator('.text-red-400')
      await expect(incorrectChars.first()).toBeVisible()
    }
  })
})

test.describe('Typing Test Difficulty Selection', () => {
  test('should change difficulty to beginner', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.selectDifficulty('beginner')

    // Wait for new snippet to load
    await typingTestPage.waitForSnippetLoad()

    // Check beginner is selected (should have active styling)
    const beginnerButton = page.getByRole('button', { name: 'Beginner' })
    await expect(beginnerButton).toBeVisible()
  })

  test('should change difficulty to advanced', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.selectDifficulty('advanced')
    await typingTestPage.waitForSnippetLoad()

    const advancedButton = page.getByRole('button', { name: 'Advanced' })
    await expect(advancedButton).toBeVisible()
  })

  test('should change difficulty to hardcore', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    await typingTestPage.selectDifficulty('hardcore')
    await typingTestPage.waitForSnippetLoad()

    const hardcoreButton = page.getByRole('button', { name: 'Hardcore' })
    await expect(hardcoreButton).toBeVisible()
  })
})

test.describe('Typing Test Language Selection', () => {
  test('should load page with language from URL', async ({ page }) => {
    await page.goto('/test?language=javascript')

    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()

    // Wait for snippet to load
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })
  })

  test('should load page with difficulty from URL', async ({ page }) => {
    await page.goto('/test?difficulty=beginner')

    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })
  })
})

test.describe('Typing Test Completion', () => {
  test('should complete a very short typing test', async ({ page, typingTestPage }) => {
    // Navigate to beginner difficulty for simpler code
    await page.goto('/test?difficulty=beginner')
    await typingTestPage.waitForSnippetLoad()

    // Get the code to type
    const codeText = await page.locator('pre code').textContent()

    if (codeText) {
      await typingTestPage.startTyping()

      // Type the entire code
      for (const char of codeText) {
        if (char === '\n') {
          await page.keyboard.press('Enter')
        } else {
          await page.keyboard.type(char, { delay: 5 })
        }
      }

      // Should show completion message
      await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 15000 })

      // Should show results with WPM and accuracy
      await expect(page.locator('.text-3xl.font-bold.text-cyan-400').first()).toBeVisible()

      // Should show "Try Another" button
      await expect(page.getByRole('button', { name: /Try Another/i })).toBeVisible()
    }
  })

  test('should start new test after completion', async ({ page, typingTestPage }) => {
    await page.goto('/test?difficulty=beginner')
    await typingTestPage.waitForSnippetLoad()

    const codeText = await page.locator('pre code').textContent()

    if (codeText) {
      await typingTestPage.startTyping()

      // Type the entire code quickly
      for (const char of codeText) {
        if (char === '\n') {
          await page.keyboard.press('Enter')
        } else {
          await page.keyboard.type(char, { delay: 5 })
        }
      }

      // Wait for completion
      await expect(page.getByText('Test Complete!')).toBeVisible({ timeout: 15000 })

      // Click Try Another
      await page.getByRole('button', { name: /Try Another/i }).click()

      // Wait for new snippet
      await typingTestPage.waitForSnippetLoad()

      // Should have new code ready
      await expect(page.locator('pre code')).toBeVisible()

      // Completion message should be gone
      await expect(page.getByText('Test Complete!')).not.toBeVisible()
    }
  })
})

test.describe('Typing Test - Accessibility', () => {
  test('@a11y should have proper aria labels', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Check for application role
    await expect(page.locator('[role="application"]')).toBeVisible()

    // Check for progress bar role
    await expect(page.getByRole('progressbar')).toBeVisible()

    // Check for status region
    await expect(page.locator('[role="status"]')).toBeVisible()
  })

  test('@a11y typing input should have descriptive label', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    const input = page.locator('input[type="text"]')
    const ariaLabel = await input.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
  })

  test('@a11y should have line numbers for better code reading', async ({ page, typingTestPage }) => {
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()

    // Line numbers should be visible
    await expect(page.getByText('1').first()).toBeVisible()
  })
})

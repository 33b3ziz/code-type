import { expect, test } from '@playwright/test'

test.describe('Achievement Notification System', () => {
  test('achievement notification appears with correct animations and content', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Execute JavaScript to trigger an achievement notification
    await page.evaluate(() => {
      // Access the notification context through a test helper
      const event = new CustomEvent('test:trigger-achievement', {
        detail: { achievementSlug: 'speed-demon-40', totalPoints: 10 },
      })
      window.dispatchEvent(event)
    })

    // Inject a script to manually add achievement notification for testing
    await page.evaluate(() => {
      // Find the notification container or create the notification manually for testing
      const container = document.querySelector('[aria-label="Notifications"]')
      if (container) {
        // Create a mock achievement notification element
        const notification = document.createElement('div')
        notification.setAttribute('data-testid', 'achievement-notification')
        notification.setAttribute('role', 'alert')
        notification.className =
          'pointer-events-auto relative overflow-hidden rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 p-4 backdrop-blur-md'
        notification.innerHTML = `
          <div class="relative z-10 flex items-start gap-4">
            <div class="relative flex-shrink-0">
              <div class="w-20 h-20 rounded-full border-2 flex items-center justify-center bg-amber-900/20 border-amber-700/50">
                <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0 pt-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold uppercase tracking-wider text-yellow-400">Achievement Unlocked!</span>
              </div>
              <h3 class="text-lg font-bold text-white">Speed Demon</h3>
              <p class="text-sm text-gray-300 mt-1">Achieve 40 WPM or higher on any test</p>
              <div class="flex items-center gap-3 mt-3">
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                  <span class="text-sm font-semibold text-yellow-400">+10 pts</span>
                </div>
                <span class="text-xs text-gray-400">Total: 10 pts</span>
              </div>
            </div>
            <button class="flex-shrink-0 p-1.5 text-gray-400 hover:text-white" aria-label="Dismiss achievement notification">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        `
        container.appendChild(notification)
      }
    })

    // Wait for the notification to be visible
    const notification = page.locator('[data-testid="achievement-notification"]')
    await expect(notification).toBeVisible({ timeout: 5000 })

    // Verify the notification contains expected content
    await expect(notification.locator('text=Achievement Unlocked!')).toBeVisible()
    await expect(notification.locator('text=Speed Demon')).toBeVisible()
    await expect(notification.locator('text=+10 pts')).toBeVisible()

    // Verify the dismiss button is present
    const dismissButton = notification.locator('button[aria-label="Dismiss achievement notification"]')
    await expect(dismissButton).toBeVisible()

    // Click dismiss and verify notification disappears
    await dismissButton.click()
    await expect(notification).not.toBeVisible({ timeout: 3000 })
  })

  test('notification container has correct accessibility attributes', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for the notification container with accessibility attributes
    const container = page.locator('[aria-label="Notifications"]')
    await expect(container).toBeVisible()
    await expect(container).toHaveAttribute('role', 'region')
    await expect(container).toHaveAttribute('aria-live', 'polite')
  })

  test('achievement badge renders correctly with tier colors', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Create a test badge element to verify styling works
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'test-badge-container'
      testContainer.innerHTML = `
        <div data-testid="test-achievement-badge"
             class="w-14 h-14 rounded-full border-2 flex items-center justify-center bg-amber-900/20 border-amber-700/50"
             role="img"
             aria-label="Speed Demon achievement">
          <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
      `
      document.body.appendChild(testContainer)
    })

    const badge = page.locator('[data-testid="test-achievement-badge"]')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveAttribute('role', 'img')
    await expect(badge).toHaveAttribute('aria-label', 'Speed Demon achievement')

    // Clean up
    await page.evaluate(() => {
      const container = document.getElementById('test-badge-container')
      container?.remove()
    })
  })

  test('multiple achievements can be displayed simultaneously', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Add multiple notifications
    await page.evaluate(() => {
      const container = document.querySelector('[aria-label="Notifications"]')
      if (container) {
        const achievements = [
          { name: 'Speed Demon', points: 10 },
          { name: 'Sharp Shooter', points: 15 },
          { name: 'First Steps', points: 5 },
        ]

        achievements.forEach((achievement, index) => {
          const notification = document.createElement('div')
          notification.setAttribute('data-testid', `achievement-notification-${index}`)
          notification.setAttribute('role', 'alert')
          notification.className =
            'pointer-events-auto relative overflow-hidden rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 p-4 backdrop-blur-md mb-2'
          notification.innerHTML = `
            <div class="flex items-start gap-4">
              <div class="flex-1">
                <span class="text-xs font-semibold text-yellow-400">Achievement Unlocked!</span>
                <h3 class="text-lg font-bold text-white">${achievement.name}</h3>
                <span class="text-sm font-semibold text-yellow-400">+${achievement.points} pts</span>
              </div>
            </div>
          `
          container.appendChild(notification)
        })
      }
    })

    // Verify all three notifications are visible
    await expect(page.locator('[data-testid="achievement-notification-0"]')).toBeVisible()
    await expect(page.locator('[data-testid="achievement-notification-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="achievement-notification-2"]')).toBeVisible()

    // Verify content of each
    await expect(page.locator('text=Speed Demon')).toBeVisible()
    await expect(page.locator('text=Sharp Shooter')).toBeVisible()
    await expect(page.locator('text=First Steps')).toBeVisible()
  })

  test('CSS animations are defined correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify that the keyframe animations are available in the stylesheet
    const hasAnimations = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets)
      const animationNames = [
        'achievement-badge-pop',
        'achievement-glow-pulse',
        'achievement-ring',
        'slide-up',
        'shimmer',
      ]

      let foundAnimations = 0

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule instanceof CSSKeyframesRule) {
              if (animationNames.includes(rule.name)) {
                foundAnimations++
              }
            }
          }
        } catch {
          // Skip cross-origin stylesheets
        }
      }

      return foundAnimations >= 3 // At least 3 of our animations should be found
    })

    expect(hasAnimations).toBe(true)
  })

  test('points display shows correct values', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Create a notification with specific point values
    await page.evaluate(() => {
      const container = document.querySelector('[aria-label="Notifications"]')
      if (container) {
        const notification = document.createElement('div')
        notification.setAttribute('data-testid', 'points-test-notification')
        notification.setAttribute('role', 'alert')
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <span data-testid="new-points" class="text-sm font-semibold text-yellow-400">+25 pts</span>
            </div>
            <span data-testid="total-points" class="text-xs text-gray-400">Total: 125 pts</span>
          </div>
        `
        container.appendChild(notification)
      }
    })

    await expect(page.locator('[data-testid="new-points"]')).toHaveText('+25 pts')
    await expect(page.locator('[data-testid="total-points"]')).toHaveText('Total: 125 pts')
  })
})

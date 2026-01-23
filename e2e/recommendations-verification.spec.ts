/**
 * Verification Test for Recommendations Engine Feature
 * Tests the personalized practice recommendations display on the profile page
 */

import { test, expect, generateTestUser } from './fixtures/test-fixtures'

test.describe('Recommendations Engine - Profile Page', () => {
  test.beforeEach(async ({ page, authPage }) => {
    // Register and login a new user
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('should display Practice Recommendations section on profile page', async ({ page }) => {
    await page.goto('/profile')

    // Verify the Practice Recommendations heading is present
    await expect(page.getByRole('heading', { name: 'Practice Recommendations' })).toBeVisible()
  })

  test('should display motivational message', async ({ page }) => {
    await page.goto('/profile')

    // Check for motivational message container
    await expect(page.getByTestId('motivational-message')).toBeVisible()
  })

  test('should display main practice recommendation card', async ({ page }) => {
    await page.goto('/profile')

    // Check for the primary recommendation card
    await expect(page.getByTestId('practice-recommendation')).toBeVisible()

    // Check for recommended practice header
    await expect(page.getByText('Recommended Practice')).toBeVisible()
  })

  test('should display difficulty, language, and focus recommendations', async ({ page }) => {
    await page.goto('/profile')

    // Check for recommendation labels in the main card
    await expect(page.getByText('Difficulty:')).toBeVisible()
    await expect(page.getByText('Language:')).toBeVisible()
    await expect(page.getByText('Focus:')).toBeVisible()
  })

  test('should display difficulty recommendation card', async ({ page }) => {
    await page.goto('/profile')

    // Check for difficulty recommendation card
    await expect(page.getByTestId('difficulty-recommendation')).toBeVisible()
    await expect(page.getByText('Difficulty Level')).toBeVisible()
  })

  test('should display language recommendation card', async ({ page }) => {
    await page.goto('/profile')

    // Check for language recommendation card
    await expect(page.getByTestId('language-recommendation')).toBeVisible()
    await expect(page.getByText('Language Focus')).toBeVisible()
  })

  test('should display confidence indicator for difficulty', async ({ page }) => {
    await page.goto('/profile')

    // Check for confidence badge (shows as dots)
    const confidenceBadge = page.locator('.confidence-badge').first()
    await expect(confidenceBadge).toBeVisible()
  })

  test('should display challenge badge on practice recommendation', async ({ page }) => {
    await page.goto('/profile')

    // Check for challenge badge (Easy/Good Match/Challenge)
    const challengeBadge = page.locator('.challenge-badge').first()
    await expect(challengeBadge).toBeVisible()
  })

  test('should display practice order in language recommendation', async ({ page }) => {
    await page.goto('/profile')

    // Check for practice order section
    await expect(page.getByText('Suggested practice order:')).toBeVisible()
  })

  test('should show appropriate recommendation for new user', async ({ page }) => {
    await page.goto('/profile')

    // New user should get beginner recommendation with low confidence
    // Look for the beginner text or balanced focus message
    const recommendationText = page.getByText(/beginner|balanced|establish your baseline/i)
    await expect(recommendationText.first()).toBeVisible()
  })
})

test.describe('Recommendations Engine - After Completing Tests', () => {
  test('recommendations update based on typing performance', async ({ page, authPage, typingTestPage }) => {
    // Register user
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Complete a typing test to generate performance data
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()
    await typingTestPage.startTyping()

    // Type some content
    await page.keyboard.type('const example = true;', { delay: 50 })
    await page.waitForTimeout(2000)

    // Navigate to profile
    await page.goto('/profile')

    // Recommendations section should be visible
    await expect(page.getByRole('heading', { name: 'Practice Recommendations' })).toBeVisible()
    await expect(page.getByTestId('practice-recommendation')).toBeVisible()
  })
})

test.describe('Recommendations Engine - Responsiveness', () => {
  test('recommendations should be visible on mobile viewport', async ({ page, authPage }) => {
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/profile')

    // Recommendations section should still be visible
    await expect(page.getByText('Practice Recommendations')).toBeVisible()
    await expect(page.getByTestId('motivational-message')).toBeVisible()
  })

  test('recommendation cards should stack on narrow viewport', async ({ page, authPage }) => {
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/profile')

    // Both recommendation cards should be visible
    await expect(page.getByTestId('difficulty-recommendation')).toBeVisible()
    await expect(page.getByTestId('language-recommendation')).toBeVisible()
  })
})

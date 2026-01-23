/**
 * Verification Test Suite
 *
 * This is a temporary test file to verify the E2E test suite is working correctly.
 * Run with: npx playwright test e2e/verification.spec.ts
 * After verification, this file can be deleted.
 */

import { test, expect } from '@playwright/test'

test.describe('E2E Test Suite Verification', () => {
  test('Home page - basic load test', async ({ page }) => {
    await page.goto('/')

    // Verify page loads
    await expect(page.locator('body')).toBeVisible()

    // Verify main heading elements
    await expect(page.getByText('Type')).toBeVisible()
    await expect(page.getByText('Code')).toBeVisible()

    console.log('✅ Home page load test passed')
  })

  test('Login page - basic load test', async ({ page }) => {
    await page.goto('/login')

    // Verify login form loads
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByLabel(/Email or Username/i)).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()

    console.log('✅ Login page load test passed')
  })

  test('Register page - basic load test', async ({ page }) => {
    await page.goto('/register')

    // Verify register form loads
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()

    console.log('✅ Register page load test passed')
  })

  test('Test page - basic load test', async ({ page }) => {
    await page.goto('/test')

    // Verify test page loads
    await expect(page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()

    // Wait for snippet to load (or loading indicator to disappear)
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 15000 })

    // Verify code container is visible
    await expect(page.locator('pre code')).toBeVisible()

    console.log('✅ Test page load test passed')
  })

  test('Race page - basic load test', async ({ page }) => {
    await page.goto('/race')

    // Verify race page loads
    await expect(page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Create a Room' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Join a Room' })).toBeVisible()

    console.log('✅ Race page load test passed')
  })

  test('Leaderboard page - basic load test', async ({ page }) => {
    await page.goto('/leaderboard')

    // Verify leaderboard page loads
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()

    console.log('✅ Leaderboard page load test passed')
  })

  test('Navigation - header links work', async ({ page }) => {
    await page.goto('/')

    // Click on Typing Test link
    await page.getByRole('link', { name: /Start Typing Test/i }).click()
    await expect(page).toHaveURL('/test')

    console.log('✅ Navigation test passed')
  })

  test('Typing test - user can start typing', async ({ page }) => {
    await page.goto('/test')

    // Wait for snippet to load
    await expect(page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 15000 })

    // Click on code area to focus
    await page.locator('.bg-slate-900.rounded-xl').click()

    // Get first character of code
    const codeText = await page.locator('pre code').textContent()

    if (codeText && codeText.length > 0) {
      const firstChar = codeText[0]

      // Type the first character
      await page.keyboard.type(firstChar)

      // Verify some character changed state (green for correct)
      const typedChars = page.locator('.text-green-400, .text-red-400')
      await expect(typedChars.first()).toBeVisible()

      console.log('✅ Typing interaction test passed')
    }
  })
})

test.describe('Cross-browser Verification', () => {
  test('renders correctly in current browser', async ({ page, browserName }) => {
    await page.goto('/')

    // Basic rendering check
    await expect(page.locator('body')).toBeVisible()

    // Check main CTA button renders
    await expect(page.getByRole('link', { name: /Start Typing Test/i })).toBeVisible()

    console.log(`✅ ${browserName} rendering test passed`)
  })
})

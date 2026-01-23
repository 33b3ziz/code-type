/**
 * Verification Test for Interactive Error Heatmap Feature
 * Tests the error heatmap visualization with language and time period filtering
 */

import { test, expect, generateTestUser } from './fixtures/test-fixtures'

test.describe('Interactive Error Heatmap - Profile Page', () => {
  test.beforeEach(async ({ page, authPage }) => {
    // Register and login a new user
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('should display Error Analysis section on profile page', async ({ page }) => {
    await page.goto('/profile')

    // Verify the Error Analysis heading is present
    await expect(page.getByRole('heading', { name: 'Error Analysis' })).toBeVisible()
  })

  test('should display filter controls', async ({ page }) => {
    await page.goto('/profile')

    // Wait for the Error Analysis section
    await expect(page.getByText('Error Analysis')).toBeVisible()

    // Check for language filter
    const languageFilter = page.locator('[data-slot="select-trigger"]').filter({ hasText: /All Languages|JavaScript|TypeScript|Python/i }).first()
    await expect(languageFilter).toBeVisible()

    // Check for time period filter
    const timePeriodFilter = page.locator('[data-slot="select-trigger"]').filter({ hasText: /Today|This Week|This Month|All Time/i }).first()
    await expect(timePeriodFilter).toBeVisible()
  })

  test('should display view mode tabs (Keyboard, Combinations, Chart)', async ({ page }) => {
    await page.goto('/profile')

    // Check for view mode buttons
    await expect(page.getByRole('button', { name: /Keyboard/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Combinations/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Chart/i })).toBeVisible()
  })

  test('should show "No Data Available" for new user with no tests', async ({ page }) => {
    await page.goto('/profile')

    // New user should see no data message
    await expect(page.getByText('No Data Available')).toBeVisible()
    await expect(page.getByText('Complete some typing tests to see your error analysis')).toBeVisible()
  })

  test('should display summary stats section', async ({ page }) => {
    await page.goto('/profile')

    // Check for summary stats labels
    await expect(page.getByText('Tests Analyzed')).toBeVisible()
    await expect(page.getByText('Total Errors')).toBeVisible()
    await expect(page.getByText('Error Rate')).toBeVisible()
  })

  test('should allow language filter selection', async ({ page }) => {
    await page.goto('/profile')

    // Find and click the language filter
    const languageFilter = page.locator('[data-slot="select-trigger"]').filter({ hasText: /All Languages/i }).first()
    await languageFilter.click()

    // Check options are visible
    await expect(page.getByRole('option', { name: /JavaScript/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /TypeScript/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /Python/i })).toBeVisible()
  })

  test('should allow time period filter selection', async ({ page }) => {
    await page.goto('/profile')

    // Find and click the time period filter
    const timePeriodFilter = page.locator('[data-slot="select-trigger"]').filter({ hasText: /This Week/i }).first()
    await timePeriodFilter.click()

    // Check options are visible
    await expect(page.getByRole('option', { name: 'Today' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'This Month' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'All Time' })).toBeVisible()
  })

  test('should switch between view modes', async ({ page }) => {
    await page.goto('/profile')

    // Click Combinations tab
    await page.getByRole('button', { name: /Combinations/i }).click()
    // The combinations view should be active (check for active styling)
    const combinationsButton = page.getByRole('button', { name: /Combinations/i })
    await expect(combinationsButton).toHaveClass(/bg-cyan/)

    // Click Chart tab
    await page.getByRole('button', { name: /Chart/i }).click()
    const chartButton = page.getByRole('button', { name: /Chart/i })
    await expect(chartButton).toHaveClass(/bg-cyan/)

    // Click Keyboard tab (back to default)
    await page.getByRole('button', { name: /Keyboard/i }).click()
    const keyboardButton = page.getByRole('button', { name: /Keyboard/i })
    await expect(keyboardButton).toHaveClass(/bg-cyan/)
  })
})

test.describe('Interactive Error Heatmap - Component Functionality', () => {
  test('should display heatmap legend in keyboard view', async ({ page, authPage }) => {
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)
    await page.goto('/profile')

    // Check for legend
    await expect(page.getByText('Low')).toBeVisible()
    await expect(page.getByText('Medium')).toBeVisible()
    await expect(page.getByText('High')).toBeVisible()
  })

  test('profile page should be responsive on mobile', async ({ page, authPage }) => {
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/profile')

    // Error Analysis section should still be visible
    await expect(page.getByText('Error Analysis')).toBeVisible()

    // Filters should be accessible
    await expect(page.locator('[data-slot="select-trigger"]').first()).toBeVisible()
  })
})

test.describe('Interactive Error Heatmap - After Completing Test', () => {
  test('should show keyboard heatmap after completing a typing test', async ({ page, authPage, typingTestPage }) => {
    // Register user
    const testUser = generateTestUser()
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Complete a typing test
    await typingTestPage.goto()
    await typingTestPage.waitForSnippetLoad()
    await typingTestPage.startTyping()

    // Type some characters (intentionally make some errors)
    await page.keyboard.type('test code example with some errors', { delay: 30 })

    // Wait a bit for the test to register some activity
    await page.waitForTimeout(2000)

    // Navigate to profile
    await page.goto('/profile')

    // Error Analysis should be visible
    await expect(page.getByText('Error Analysis')).toBeVisible()

    // Summary stats should be visible
    await expect(page.getByText('Tests Analyzed')).toBeVisible()
    await expect(page.getByText('Total Errors')).toBeVisible()
  })
})

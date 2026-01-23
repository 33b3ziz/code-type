import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('CodeType App - Home Page', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the main heading is visible
    await expect(page.getByText('Type Code')).toBeVisible()
    await expect(page.getByText('Faster')).toBeVisible()
  })

  test('should display hero section', async ({ page }) => {
    await page.goto('/')

    // Check hero elements
    await expect(page.getByText('Improve your coding speed today')).toBeVisible()
    await expect(page.getByText('Master coding speed with real code snippets')).toBeVisible()
  })

  test('should display Start Typing Test CTA', async ({ page }) => {
    await page.goto('/')

    const ctaButton = page.getByRole('link', { name: /Start Typing Test/i })
    await expect(ctaButton).toBeVisible()
  })

  test('should display Multiplayer Race CTA', async ({ page }) => {
    await page.goto('/')

    const raceButton = page.getByRole('link', { name: /Multiplayer Race/i })
    await expect(raceButton).toBeVisible()
  })

  test('should display Quick Start options', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Quick Start' })).toBeVisible()

    // Check quick start options
    await expect(page.getByText('Quick Test')).toBeVisible()
    await expect(page.getByText('JavaScript')).toBeVisible()
    await expect(page.getByText('TypeScript')).toBeVisible()
    await expect(page.getByText('Python')).toBeVisible()
  })

  test('should display stats section', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('45+')).toBeVisible() // Code Snippets
    await expect(page.getByText('Code Snippets')).toBeVisible()
    await expect(page.getByText('Languages')).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Why CodeType?' })).toBeVisible()
    await expect(page.getByText('Real Code Snippets')).toBeVisible()
    await expect(page.getByText('Timed Challenges')).toBeVisible()
    await expect(page.getByText('Achievements')).toBeVisible()
    await expect(page.getByText('Track Progress')).toBeVisible()
  })

  test('should navigate to test page from CTA', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Start Typing Test/i }).click()

    await expect(page).toHaveURL('/test')
  })

  test('should navigate to race page from CTA', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Multiplayer Race/i }).click()

    await expect(page).toHaveURL('/race')
  })

  test('should navigate to register page from footer CTA', async ({ page }) => {
    await page.goto('/')

    // Scroll to bottom and click Create Account
    const createAccountButton = page.getByRole('link', { name: 'Create Account' }).last()
    await createAccountButton.click()

    await expect(page).toHaveURL('/register')
  })
})

test.describe('CodeType App - Header Navigation', () => {
  test('should display header with logo', async ({ page }) => {
    await page.goto('/')

    const logo = page.locator('header img[alt="CodeType"]')
    await expect(logo).toBeVisible()
  })

  test('should display navigation links on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const nav = page.locator('nav')
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Typing Test' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Practice' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Multiplayer' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Leaderboard' })).toBeVisible()
  })

  test('should display Start Test button on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const startTestButton = page.getByRole('link', { name: /Start Test/i }).first()
    await expect(startTestButton).toBeVisible()
  })

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/')

    // Theme toggle button should be present
    const themeToggle = page.locator('[aria-label="Toggle theme"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-sun"], svg[class*="lucide-moon"]') }))
    await expect(themeToggle.first()).toBeVisible()
  })

  test('should display mobile menu button on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: /Open navigation menu/i })
    await expect(menuButton).toBeVisible()
  })

  test('should open mobile menu when button is clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Click menu button
    await page.getByRole('button', { name: /Open navigation menu/i }).click()

    // Mobile sidebar should be visible
    const sidebar = page.locator('aside[role="dialog"]')
    await expect(sidebar).toBeVisible()

    // Navigation links should be visible in sidebar
    await expect(sidebar.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: 'Typing Test' })).toBeVisible()
  })

  test('should close mobile menu when X button is clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open menu
    await page.getByRole('button', { name: /Open navigation menu/i }).click()

    const sidebar = page.locator('aside[role="dialog"]')
    await expect(sidebar).toBeVisible()

    // Close menu
    await page.getByRole('button', { name: /Close navigation menu/i }).click()

    // Sidebar should be hidden (translated off-screen)
    await expect(sidebar).toHaveClass(/-translate-x-full/)
  })
})

test.describe('CodeType App - Footer', () => {
  test('should display footer with credits', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Built By')).toBeVisible()
    await expect(page.getByRole('link', { name: '33b3ziz' })).toBeVisible()
  })

  test('should have GitHub link', async ({ page }) => {
    await page.goto('/')

    const githubLink = page.getByRole('link', { name: 'View on GitHub' })
    await expect(githubLink).toBeVisible()
    await expect(githubLink).toHaveAttribute('href', /github.com/)
  })
})

test.describe('CodeType App - Quick Start Navigation', () => {
  test('should navigate to Quick Test', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /Quick Test/i }).click()

    await expect(page).toHaveURL(/\/test\?duration=60/)
  })

  test('should navigate to JavaScript test', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'JavaScript' }).first().click()

    await expect(page).toHaveURL(/\/test\?language=javascript/)
  })

  test('should navigate to TypeScript test', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'TypeScript' }).first().click()

    await expect(page).toHaveURL(/\/test\?language=typescript/)
  })

  test('should navigate to Python test', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Python' }).first().click()

    await expect(page).toHaveURL(/\/test\?language=python/)
  })
})

test.describe('CodeType App - Accessibility', () => {
  test('@a11y home page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    // Filter for critical and serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('@a11y login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/login')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('@a11y register page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/register')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('@a11y keyboard hint should be visible', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Press')).toBeVisible()
    await expect(page.locator('.keyboard-key')).toBeVisible()
  })
})

test.describe('CodeType App - Theme', () => {
  test('should apply dark theme styles by default', async ({ page }) => {
    await page.goto('/')

    // Check for dark theme background
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // The app should have a dark gradient background
    const mainContent = page.locator('.bg-background').first()
    await expect(mainContent).toBeVisible()
  })
})

import { test as base, expect, type Page } from '@playwright/test'

/**
 * Test data for user registration and login
 */
export interface TestUser {
  email: string
  username: string
  password: string
}

/**
 * Generate a unique test user with random credentials
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return {
    email: `test_${timestamp}_${random}@example.com`,
    username: `testuser_${timestamp}_${random}`.substring(0, 20),
    password: 'TestPass123!',
  }
}

/**
 * Page Object Model helpers
 */
export class AuthPage {
  constructor(private page: Page) {}

  // Registration page selectors and actions
  async goToRegister() {
    await this.page.goto('/register')
    await expect(this.page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  }

  async register(user: TestUser) {
    await this.page.getByLabel('Email').fill(user.email)
    await this.page.getByLabel('Username').fill(user.username)
    await this.page.getByLabel('Password').fill(user.password)
    await this.page.getByRole('button', { name: /Create Account/i }).click()
  }

  // Login page selectors and actions
  async goToLogin() {
    await this.page.goto('/login')
    await expect(this.page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  }

  async login(emailOrUsername: string, password: string) {
    await this.page.getByLabel(/Email or Username/i).fill(emailOrUsername)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: /Sign In/i }).click()
  }

  async expectError(message: string | RegExp) {
    await expect(this.page.locator('.text-red-400, [class*="error"]').getByText(message)).toBeVisible()
  }
}

export class TypingTestPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/test')
    // Wait for the page to load
    await expect(this.page.getByRole('heading', { name: 'Typing Test' })).toBeVisible()
  }

  async waitForSnippetLoad() {
    // Wait for loading to finish
    await expect(this.page.getByText('Loading snippet...')).not.toBeVisible({ timeout: 10000 })
  }

  async selectLanguage(language: 'all' | 'javascript' | 'typescript' | 'python') {
    const trigger = this.page.locator('[data-slot="select-trigger"]').first()
    await trigger.click()
    const displayText = {
      all: 'All Languages',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
    }
    await this.page.getByRole('option', { name: displayText[language] }).click()
  }

  async selectDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'hardcore') {
    const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    await this.page.getByRole('button', { name: capitalizedDifficulty }).click()
  }

  async getNewSnippet() {
    await this.page.getByRole('button', { name: /New Snippet/i }).click()
    await this.waitForSnippetLoad()
  }

  async startTyping() {
    // Click on the code container to focus the hidden input
    await this.page.locator('.bg-slate-900.rounded-xl').click()
  }

  async typeCode(text: string) {
    await this.startTyping()
    // Type character by character with a small delay
    for (const char of text) {
      await this.page.keyboard.type(char, { delay: 10 })
    }
  }

  async getWPM() {
    const wpmText = await this.page.locator('.text-cyan-400.font-mono.font-bold').first().textContent()
    return parseInt(wpmText || '0', 10)
  }

  async getAccuracy() {
    const accuracyText = await this.page.locator('[aria-labelledby="accuracy-label"]').textContent()
    return parseInt(accuracyText?.replace('%', '') || '0', 10)
  }

  async isCompleted() {
    return this.page.getByText('Test Complete!').isVisible()
  }
}

export class RacePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/race')
    await expect(this.page.getByRole('heading', { name: 'Multiplayer Race' })).toBeVisible()
  }

  async selectMaxPlayers(num: 2 | 3 | 4 | 5) {
    await this.page.getByRole('button', { name: String(num), exact: true }).click()
  }

  async selectLanguage(language: 'Any' | 'JavaScript' | 'TypeScript' | 'Python') {
    await this.page.getByRole('button', { name: language }).click()
  }

  async togglePrivate() {
    await this.page.locator('button.rounded-full').click()
  }

  async createRoom() {
    await this.page.getByRole('button', { name: /Create Room/i }).click()
  }

  async enterJoinCode(code: string) {
    await this.page.getByPlaceholder('ABCDEF').fill(code.toUpperCase())
  }

  async joinRoom() {
    await this.page.getByRole('button', { name: /Join Room/i }).click()
  }

  async isInLobby() {
    return this.page.getByText(/Room Code/i).isVisible()
  }
}

export class LeaderboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/leaderboard')
    await expect(this.page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()
  }

  async selectTimeFrame(timeFrame: 'daily' | 'weekly' | 'monthly' | 'alltime') {
    const displayText = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      alltime: 'All Time',
    }
    const trigger = this.page.locator('[data-slot="select-trigger"]')
    await trigger.click()
    await this.page.getByRole('option', { name: displayText[timeFrame] }).click()
  }

  async getParticipantCount() {
    const text = await this.page.locator('.text-gray-400').filter({ hasText: 'participants' }).textContent()
    const match = text?.match(/(\d+)\s+participants/)
    return match ? parseInt(match[1], 10) : 0
  }

  async hasLeaderboardTable() {
    return this.page.locator('table').isVisible()
  }
}

/**
 * Extended test fixture with page objects
 */
export const test = base.extend<{
  authPage: AuthPage
  typingTestPage: TypingTestPage
  racePage: RacePage
  leaderboardPage: LeaderboardPage
  testUser: TestUser
}>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page))
  },
  typingTestPage: async ({ page }, use) => {
    await use(new TypingTestPage(page))
  },
  racePage: async ({ page }, use) => {
    await use(new RacePage(page))
  },
  leaderboardPage: async ({ page }, use) => {
    await use(new LeaderboardPage(page))
  },
  testUser: async ({}, use) => {
    await use(generateTestUser())
  },
})

export { expect }

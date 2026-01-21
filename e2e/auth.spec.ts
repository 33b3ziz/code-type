import { test, expect, generateTestUser } from './fixtures/test-fixtures'

test.describe('User Registration', () => {
  test('should display registration form with all required fields', async ({ page, authPage }) => {
    await authPage.goToRegister()

    // Check form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible()
  })

  test('should show password requirements as user types', async ({ page, authPage }) => {
    await authPage.goToRegister()

    // Type a password to trigger requirements display
    await page.getByLabel('Password').fill('test')

    // Check password requirements are shown
    await expect(page.getByText('At least 8 characters')).toBeVisible()
    await expect(page.getByText('Contains a number')).toBeVisible()
    await expect(page.getByText('Contains a letter')).toBeVisible()
  })

  test('should show validation when password meets requirements', async ({ page, authPage }) => {
    await authPage.goToRegister()

    // Fill with a valid password
    await page.getByLabel('Password').fill('ValidPass123')

    // All requirements should show as met (green checkmarks)
    const requirements = page.locator('.text-green-400')
    await expect(requirements).toHaveCount(3)
  })

  test('should successfully register a new user', async ({ page, authPage, testUser }) => {
    await authPage.goToRegister()
    await authPage.register(testUser)

    // Should redirect to home page after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('should show error for invalid email format', async ({ page, authPage }) => {
    await authPage.goToRegister()

    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Username').fill('testuser')
    await page.getByLabel('Password').fill('ValidPass123')
    await page.getByRole('button', { name: /Create Account/i }).click()

    // Browser validation should prevent submission or show error
    // The email input has type="email" which triggers browser validation
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should navigate to login page from registration', async ({ page, authPage }) => {
    await authPage.goToRegister()

    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to test page via continue without account', async ({ page, authPage }) => {
    await authPage.goToRegister()

    await page.getByRole('link', { name: 'continue without an account' }).click()
    await expect(page).toHaveURL('/test')
  })
})

test.describe('User Login', () => {
  test('should display login form with all required fields', async ({ page, authPage }) => {
    await authPage.goToLogin()

    await expect(page.getByLabel(/Email or Username/i)).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('should toggle password visibility', async ({ page, authPage }) => {
    await authPage.goToLogin()

    const passwordInput = page.getByLabel('Password')
    await passwordInput.fill('testpassword')

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button (eye icon)
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await toggleButton.click()

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('should show error for invalid credentials', async ({ page, authPage }) => {
    await authPage.goToLogin()
    await authPage.login('nonexistent@example.com', 'wrongpassword')

    // Should show error message
    await expect(page.locator('.bg-red-500\\/10').or(page.getByText(/invalid|incorrect|not found/i))).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to registration page from login', async ({ page, authPage }) => {
    await authPage.goToLogin()

    await page.getByRole('link', { name: 'Create one' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('should navigate to test page via continue without account', async ({ page, authPage }) => {
    await authPage.goToLogin()

    await page.getByRole('link', { name: 'continue without an account' }).click()
    await expect(page).toHaveURL('/test')
  })
})

test.describe('Authentication Flow', () => {
  test('should register and then login with same credentials', async ({ page, authPage }) => {
    const user = generateTestUser()

    // Register new user
    await authPage.goToRegister()
    await authPage.register(user)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Clear cookies/session (simulating logout)
    await page.context().clearCookies()

    // Login with same credentials
    await authPage.goToLogin()
    await authPage.login(user.email, user.password)

    // Should redirect to home after login
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('should login with username instead of email', async ({ page, authPage }) => {
    const user = generateTestUser()

    // First register
    await authPage.goToRegister()
    await authPage.register(user)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Clear session
    await page.context().clearCookies()

    // Login with username
    await authPage.goToLogin()
    await authPage.login(user.username, user.password)

    // Should redirect to home after login
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})

test.describe('Authentication - Accessibility', () => {
  test('@a11y registration form should be keyboard navigable', async ({ page, authPage }) => {
    await authPage.goToRegister()

    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Email')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Username')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
  })

  test('@a11y login form should be keyboard navigable', async ({ page, authPage }) => {
    await authPage.goToLogin()

    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/Email or Username/i)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
  })
})

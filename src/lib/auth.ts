import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { eq, or } from 'drizzle-orm'
import { useAppSession } from './session'
import {
  hashPassword,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyPassword,
} from './password'
import { db } from '@/db'
import { users } from '@/db/schema'

// Types for auth responses
export interface AuthError {
  error: string
  field?: 'email' | 'username' | 'password'
}

export interface AuthSuccess {
  success: true
  user: {
    id: string
    email: string
    username: string
  }
}

export type AuthResult = AuthError | AuthSuccess

// Register input type
export interface RegisterInput {
  email: string
  username: string
  password: string
}

// Login input type
export interface LoginInput {
  emailOrUsername: string
  password: string
}

/**
 * Register a new user
 */
export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RegisterInput) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const { email, username, password } = data

    // Validate inputs
    const emailError = validateEmail(email)
    if (emailError) {
      return { error: emailError, field: 'email' }
    }

    const usernameError = validateUsername(username)
    if (usernameError) {
      return { error: usernameError, field: 'username' }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return { error: passwordError, field: 'password' }
    }

    // Check if email or username already exists
    const existingUser = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(
        or(
          eq(users.email, email.toLowerCase()),
          eq(users.username, username.toLowerCase())
        )
      )
      .limit(1)

    if (existingUser.length > 0) {
      const existing = existingUser[0]
      if (existing.email === email.toLowerCase()) {
        return { error: 'Email already registered', field: 'email' }
      }
      return { error: 'Username already taken', field: 'username' }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
      })

    // Create session
    const session = await useAppSession()
    await session.update({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })

    return {
      success: true,
      user: newUser,
    }
  })

/**
 * Login an existing user
 */
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: LoginInput) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const { emailOrUsername, password } = data

    if (!emailOrUsername || emailOrUsername.trim().length === 0) {
      return { error: 'Email or username is required', field: 'email' }
    }

    if (!password || password.length === 0) {
      return { error: 'Password is required', field: 'password' }
    }

    // Find user by email or username
    const identifier = emailOrUsername.toLowerCase().trim()
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1)

    const user = userResults[0] as typeof userResults[number] | undefined
    if (!user) {
      return { error: 'Invalid credentials' }
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return { error: 'Invalid credentials' }
    }

    // Create session
    const session = await useAppSession()
    await session.update({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    }
  })

/**
 * Logout the current user
 */
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/' })
})

/**
 * Get the current authenticated user
 */
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return null
    }

    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return userResults[0] ?? null
  }
)

/**
 * Check if a user is authenticated (lighter than getCurrentUser)
 */
export const isAuthenticatedFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    return !!session.data.userId
  }
)

import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const ENCODING = 'hex' as const

/**
 * Hash a password using scrypt with a random salt
 * Returns the salt and hash concatenated with a separator
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString(ENCODING)
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt}:${hash.toString(ENCODING)}`
}

/**
 * Verify a password against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) {
    return false
  }

  const hashBuffer = Buffer.from(hash, ENCODING)
  const suppliedHashBuffer = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  )) as Buffer

  return timingSafeEqual(hashBuffer, suppliedHashBuffer)
}

/**
 * Validate password strength
 * Returns null if valid, or an error message if invalid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (password.length > 128) {
    return 'Password must be less than 128 characters'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  if (!email || email.length === 0) {
    return 'Email is required'
  }
  if (email.length > 255) {
    return 'Email must be less than 255 characters'
  }
  // Basic email regex - covers most common cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  return null
}

/**
 * Validate username
 */
export function validateUsername(username: string): string | null {
  if (!username || username.length === 0) {
    return 'Username is required'
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters long'
  }
  if (username.length > 30) {
    return 'Username must be less than 30 characters'
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens'
  }
  return null
}

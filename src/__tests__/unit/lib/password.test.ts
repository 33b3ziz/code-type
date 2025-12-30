import { describe, expect, it } from 'vitest'
import {
  hashPassword,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyPassword,
} from '@/lib/password'

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('returns a string with salt and hash separated by colon', async () => {
      const hash = await hashPassword('TestPassword123')
      expect(hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/)
    })

    it('generates different hashes for the same password', async () => {
      const hash1 = await hashPassword('TestPassword123')
      const hash2 = await hashPassword('TestPassword123')
      expect(hash1).not.toBe(hash2)
    })

    it('generates consistent hash length', async () => {
      const hash = await hashPassword('TestPassword123')
      const [salt, hashPart] = hash.split(':')
      expect(salt.length).toBe(32) // 16 bytes = 32 hex chars
      expect(hashPart.length).toBe(128) // 64 bytes = 128 hex chars
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'TestPassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const hash = await hashPassword('TestPassword123')
      const isValid = await verifyPassword('WrongPassword123', hash)
      expect(isValid).toBe(false)
    })

    it('returns false for empty password', async () => {
      const hash = await hashPassword('TestPassword123')
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('returns false for malformed hash', async () => {
      const isValid = await verifyPassword('TestPassword123', 'invalid-hash')
      expect(isValid).toBe(false)
    })

    it('returns false for hash without separator', async () => {
      const isValid = await verifyPassword('TestPassword123', 'abc123')
      expect(isValid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('returns null for valid password', () => {
      const result = validatePassword('ValidPass123')
      expect(result).toBeNull()
    })

    it('rejects password shorter than 8 characters', () => {
      const result = validatePassword('Short1A')
      expect(result).toBe('Password must be at least 8 characters long')
    })

    it('rejects password longer than 128 characters', () => {
      const longPassword = 'A1a' + 'x'.repeat(126)
      const result = validatePassword(longPassword)
      expect(result).toBe('Password must be less than 128 characters')
    })

    it('rejects password without lowercase letter', () => {
      const result = validatePassword('UPPERCASE123')
      expect(result).toBe('Password must contain at least one lowercase letter')
    })

    it('rejects password without uppercase letter', () => {
      const result = validatePassword('lowercase123')
      expect(result).toBe('Password must contain at least one uppercase letter')
    })

    it('rejects password without number', () => {
      const result = validatePassword('NoNumbersHere')
      expect(result).toBe('Password must contain at least one number')
    })

    it('accepts password with special characters', () => {
      const result = validatePassword('Valid@Pass#123!')
      expect(result).toBeNull()
    })
  })

  describe('validateEmail', () => {
    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull()
      expect(validateEmail('user.name@example.co.uk')).toBeNull()
      expect(validateEmail('user+tag@example.com')).toBeNull()
    })

    it('rejects empty email', () => {
      expect(validateEmail('')).toBe('Email is required')
    })

    it('rejects email without @', () => {
      expect(validateEmail('userexample.com')).toBe('Invalid email format')
    })

    it('rejects email without domain', () => {
      expect(validateEmail('user@')).toBe('Invalid email format')
    })

    it('rejects email without local part', () => {
      expect(validateEmail('@example.com')).toBe('Invalid email format')
    })

    it('rejects email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe('Invalid email format')
    })

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@b.com'
      expect(validateEmail(longEmail)).toBe(
        'Email must be less than 255 characters'
      )
    })
  })

  describe('validateUsername', () => {
    it('returns null for valid username', () => {
      expect(validateUsername('user123')).toBeNull()
      expect(validateUsername('user_name')).toBeNull()
      expect(validateUsername('user-name')).toBeNull()
      expect(validateUsername('UserName')).toBeNull()
    })

    it('rejects empty username', () => {
      expect(validateUsername('')).toBe('Username is required')
    })

    it('rejects username shorter than 3 characters', () => {
      expect(validateUsername('ab')).toBe(
        'Username must be at least 3 characters long'
      )
    })

    it('rejects username longer than 30 characters', () => {
      const longUsername = 'a'.repeat(31)
      expect(validateUsername(longUsername)).toBe(
        'Username must be less than 30 characters'
      )
    })

    it('rejects username with spaces', () => {
      expect(validateUsername('user name')).toBe(
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
    })

    it('rejects username with special characters', () => {
      expect(validateUsername('user@name')).toBe(
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
      expect(validateUsername('user.name')).toBe(
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
    })
  })
})

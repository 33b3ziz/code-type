import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Verification test for unit test coverage implementation
 * This test verifies that:
 * 1. All expected test files exist
 * 2. Test files contain proper test structure
 * 3. Test files cover the required hooks and utilities
 */

const projectRoot = path.join(__dirname, '..')

test.describe('Unit Test Coverage Verification', () => {
  test('useTypingTest test file exists and has proper structure', async () => {
    const testFilePath = path.join(projectRoot, 'src/hooks/__tests__/useTypingTest.test.ts')

    // Verify file exists
    expect(fs.existsSync(testFilePath)).toBe(true)

    // Read and verify content
    const content = fs.readFileSync(testFilePath, 'utf-8')

    // Verify it imports from the hook
    expect(content).toContain("import { renderHook, act } from '@testing-library/react'")
    expect(content).toContain("from '../useTypingTest'")

    // Verify key test categories exist
    expect(content).toContain("describe('useTypingTest'")
    expect(content).toContain("describe('initialization'")
    expect(content).toContain("describe('typing characters'")
    expect(content).toContain("describe('backspace handling'")
    expect(content).toContain("describe('strict mode'")
    expect(content).toContain("describe('test completion'")
    expect(content).toContain("describe('Tab key handling'")
    expect(content).toContain("describe('reset functionality'")
    expect(content).toContain("describe('progress calculation'")

    // Count number of test cases (should be substantial)
    const testCaseCount = (content.match(/it\('/g) || []).length
    expect(testCaseCount).toBeGreaterThanOrEqual(20)
  })

  test('useTimer test file exists and has proper structure', async () => {
    const testFilePath = path.join(projectRoot, 'src/hooks/__tests__/useTimer.test.ts')

    // Verify file exists
    expect(fs.existsSync(testFilePath)).toBe(true)

    // Read and verify content
    const content = fs.readFileSync(testFilePath, 'utf-8')

    // Verify imports
    expect(content).toContain("import { renderHook, act } from '@testing-library/react'")
    expect(content).toContain("from '../useTimer'")

    // Verify both hooks are tested
    expect(content).toContain("describe('useTimer'")
    expect(content).toContain("describe('useStopwatch'")

    // Verify key test categories for useTimer
    expect(content).toContain("describe('initialization'")
    expect(content).toContain("describe('start functionality'")
    expect(content).toContain("describe('pause and resume functionality'")
    expect(content).toContain("describe('reset functionality'")
    expect(content).toContain("describe('expiration callback'")
    expect(content).toContain("describe('time formatting'")
    expect(content).toContain("describe('progress calculation'")

    // Count number of test cases
    const testCaseCount = (content.match(/it\('/g) || []).length
    expect(testCaseCount).toBeGreaterThanOrEqual(25)
  })

  test('room-store test file exists and has proper structure', async () => {
    const testFilePath = path.join(projectRoot, 'src/lib/pusher/__tests__/room-store.test.ts')

    // Verify file exists
    expect(fs.existsSync(testFilePath)).toBe(true)

    // Read and verify content
    const content = fs.readFileSync(testFilePath, 'utf-8')

    // Verify imports
    expect(content).toContain("from '../room-store'")

    // Verify key test categories
    expect(content).toContain("describe('roomStore'")
    expect(content).toContain("describe('createRoom'")
    expect(content).toContain("describe('getRoom'")
    expect(content).toContain("describe('joinRoom'")
    expect(content).toContain("describe('leaveRoom'")
    expect(content).toContain("describe('setPlayerReady'")
    expect(content).toContain("describe('startCountdown'")
    expect(content).toContain("describe('startRace'")
    expect(content).toContain("describe('updateProgress'")
    expect(content).toContain("describe('finishRace'")
    expect(content).toContain("describe('getResults'")
    expect(content).toContain("describe('resetRoom'")
    expect(content).toContain("describe('cleanup'")

    // Count number of test cases
    const testCaseCount = (content.match(/it\('/g) || []).length
    expect(testCaseCount).toBeGreaterThanOrEqual(30)
  })

  test('utils test file exists and has proper structure', async () => {
    const testFilePath = path.join(projectRoot, 'src/lib/__tests__/utils.test.ts')

    // Verify file exists
    expect(fs.existsSync(testFilePath)).toBe(true)

    // Read and verify content
    const content = fs.readFileSync(testFilePath, 'utf-8')

    // Verify imports
    expect(content).toContain("from '../utils'")

    // Verify key test categories
    expect(content).toContain("describe('cn utility function'")
    expect(content).toContain("describe('basic class merging'")
    expect(content).toContain("describe('conditional classes'")
    expect(content).toContain("describe('tailwind class merging (twMerge)'")
    expect(content).toContain("describe('complex use cases'")
    expect(content).toContain("describe('edge cases'")

    // Count number of test cases
    const testCaseCount = (content.match(/it\('/g) || []).length
    expect(testCaseCount).toBeGreaterThanOrEqual(30)
  })

  test('all test files combined have sufficient coverage', async () => {
    const testFiles = [
      'src/hooks/__tests__/useTypingTest.test.ts',
      'src/hooks/__tests__/useTimer.test.ts',
      'src/lib/pusher/__tests__/room-store.test.ts',
      'src/lib/__tests__/utils.test.ts',
    ]

    let totalTestCount = 0

    for (const testFile of testFiles) {
      const testFilePath = path.join(projectRoot, testFile)
      expect(fs.existsSync(testFilePath)).toBe(true)

      const content = fs.readFileSync(testFilePath, 'utf-8')
      const testCaseCount = (content.match(/it\('/g) || []).length
      totalTestCount += testCaseCount
    }

    // We expect at least 100 test cases total for comprehensive coverage
    expect(totalTestCount).toBeGreaterThanOrEqual(100)
    console.log(`Total test cases: ${totalTestCount}`)
  })

  test('test files follow project conventions', async () => {
    const testFiles = [
      'src/hooks/__tests__/useTypingTest.test.ts',
      'src/hooks/__tests__/useTimer.test.ts',
      'src/lib/pusher/__tests__/room-store.test.ts',
      'src/lib/__tests__/utils.test.ts',
    ]

    for (const testFile of testFiles) {
      const testFilePath = path.join(projectRoot, testFile)
      const content = fs.readFileSync(testFilePath, 'utf-8')

      // Verify vitest imports
      expect(content).toContain("from 'vitest'")

      // Verify proper test structure with describe blocks
      expect(content).toContain('describe(')
      expect(content).toContain('it(')
      expect(content).toContain('expect(')
    }
  })
})

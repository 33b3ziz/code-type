import { beforeEach, describe, expect, it } from 'vitest'
import {
  checkPersonalBest,
  formatDate,
  formatDuration,
  getPersonalBest,
  getRecentResults,
  getUserStats,
  saveTestResult,
} from '@/lib/results-api'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('results-api', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('saveTestResult', () => {
    it('saves a test result', async () => {
      const result = await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 95,
        symbolAccuracy: 90,
        keywordAccuracy: 98,
        charactersTyped: 100,
        correctCharacters: 95,
        incorrectCharacters: 5,
        backspaceCount: 3,
        duration: 60,
        isStrictMode: false,
      })

      expect(result).toHaveProperty('id')
      expect(result.wpm).toBe(50)
      expect(result.accuracy).toBe(95)
    })

    it('stores result in localStorage', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 95,
        charactersTyped: 100,
        correctCharacters: 95,
        incorrectCharacters: 5,
        duration: 60,
      })

      const stored = JSON.parse(localStorage.getItem('testResults') || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].wpm).toBe(50)
    })
  })

  describe('getRecentResults', () => {
    it('returns empty array when no results', async () => {
      const results = await getRecentResults('user-1')
      expect(results).toEqual([])
    })

    it('returns results for specific user', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 95,
        charactersTyped: 100,
        correctCharacters: 95,
        incorrectCharacters: 5,
        duration: 60,
      })

      await saveTestResult({
        userId: 'user-2',
        snippetId: 1,
        wpm: 60,
        rawWpm: 65,
        accuracy: 98,
        charactersTyped: 100,
        correctCharacters: 98,
        incorrectCharacters: 2,
        duration: 60,
      })

      const results = await getRecentResults('user-1')
      expect(results).toHaveLength(1)
      expect(results[0].wpm).toBe(50)
    })

    it('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        await saveTestResult({
          userId: 'user-1',
          snippetId: 1,
          wpm: 50 + i,
          rawWpm: 55 + i,
          accuracy: 95,
          charactersTyped: 100,
          correctCharacters: 95,
          incorrectCharacters: 5,
          duration: 60,
        })
      }

      const results = await getRecentResults('user-1', 3)
      expect(results).toHaveLength(3)
    })
  })

  describe('getUserStats', () => {
    it('returns empty stats for user with no results', async () => {
      const stats = await getUserStats('user-1')

      expect(stats.totalTests).toBe(0)
      expect(stats.averageWpm).toBe(0)
      expect(stats.averageAccuracy).toBe(0)
    })

    it('calculates stats correctly', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 90,
        charactersTyped: 100,
        correctCharacters: 90,
        incorrectCharacters: 10,
        duration: 60,
      })

      await saveTestResult({
        userId: 'user-1',
        snippetId: 2,
        wpm: 60,
        rawWpm: 65,
        accuracy: 100,
        charactersTyped: 100,
        correctCharacters: 100,
        incorrectCharacters: 0,
        duration: 30,
      })

      const stats = await getUserStats('user-1')

      expect(stats.totalTests).toBe(2)
      expect(stats.averageWpm).toBe(55) // (50 + 60) / 2
      expect(stats.averageAccuracy).toBe(95) // (90 + 100) / 2
      expect(stats.bestWpm).toBe(60)
      expect(stats.bestAccuracy).toBe(100)
      expect(stats.totalTimeSpent).toBe(90) // 60 + 30
    })
  })

  describe('getPersonalBest', () => {
    it('returns null when no results', async () => {
      const best = await getPersonalBest('user-1')
      expect(best).toBeNull()
    })

    it('returns best result', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 90,
        charactersTyped: 100,
        correctCharacters: 90,
        incorrectCharacters: 10,
        duration: 60,
      })

      await saveTestResult({
        userId: 'user-1',
        snippetId: 2,
        wpm: 70,
        rawWpm: 75,
        accuracy: 95,
        charactersTyped: 100,
        correctCharacters: 95,
        incorrectCharacters: 5,
        duration: 60,
      })

      const best = await getPersonalBest('user-1')

      expect(best).not.toBeNull()
      expect(best?.wpm).toBe(70)
      expect(best?.accuracy).toBe(95)
    })
  })

  describe('checkPersonalBest', () => {
    it('returns isNewBest true for first result', async () => {
      const result = await checkPersonalBest('user-1', 50)

      expect(result.isNewBest).toBe(true)
      expect(result.previousBest).toBeNull()
    })

    it('detects new personal best', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 50,
        rawWpm: 55,
        accuracy: 90,
        charactersTyped: 100,
        correctCharacters: 90,
        incorrectCharacters: 10,
        duration: 60,
      })

      const result = await checkPersonalBest('user-1', 60)

      expect(result.isNewBest).toBe(true)
      expect(result.previousBest).toBe(50)
    })

    it('returns false when not beating best', async () => {
      await saveTestResult({
        userId: 'user-1',
        snippetId: 1,
        wpm: 70,
        rawWpm: 75,
        accuracy: 90,
        charactersTyped: 100,
        correctCharacters: 90,
        incorrectCharacters: 10,
        duration: 60,
      })

      const result = await checkPersonalBest('user-1', 60)

      expect(result.isNewBest).toBe(false)
      expect(result.previousBest).toBe(70)
    })
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats minutes only', () => {
    expect(formatDuration(60)).toBe('1m')
    expect(formatDuration(120)).toBe('2m')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(150)).toBe('2m 30s')
  })
})

describe('formatDate', () => {
  it('returns Today for current date', () => {
    const now = new Date()
    expect(formatDate(now)).toBe('Today')
  })

  it('returns Yesterday for previous day', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDate(yesterday)).toBe('Yesterday')
  })

  it('returns days ago for recent dates', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(formatDate(threeDaysAgo)).toBe('3 days ago')
  })

  it('returns formatted date for older dates', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 10)
    const result = formatDate(oldDate)
    expect(result).toMatch(/\w+ \d+/)
  })
})

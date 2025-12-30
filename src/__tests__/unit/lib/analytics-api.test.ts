import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAccuracyTrend,
  getWPMTrend,
  getLanguageStats,
  getDifficultyStats,
  identifyWeaknesses,
  getLanguageDisplayName,
  getLanguageColor,
} from '@/lib/analytics-api'
import type { TestResult } from '@/db/schema'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('analytics-api', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const createMockResult = (
    userId: string,
    wpm: number,
    accuracy: number,
    daysAgo: number = 0,
    symbolAccuracy: number | null = null,
    keywordAccuracy: number | null = null
  ): TestResult => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      id: Date.now() + Math.random(),
      userId,
      snippetId: Math.floor(Math.random() * 100),
      wpm,
      rawWpm: wpm + 5,
      accuracy,
      symbolAccuracy,
      keywordAccuracy,
      charactersTyped: 100,
      correctCharacters: accuracy,
      incorrectCharacters: 100 - accuracy,
      backspaceCount: 2,
      duration: 60,
      completedAt: date,
      isStrictMode: false,
    }
  }

  describe('getAccuracyTrend', () => {
    it('returns empty trends when no results', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const trend = await getAccuracyTrend('user_1')

      expect(trend.daily).toHaveLength(0)
      expect(trend.weekly).toHaveLength(0)
      expect(trend.monthly).toHaveLength(0)
      expect(trend.overall.trend).toBe('stable')
    })

    it('calculates daily trends correctly', async () => {
      const results = [
        createMockResult('user_1', 50, 90, 0),
        createMockResult('user_1', 55, 92, 0),
        createMockResult('user_1', 45, 88, 1),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const trend = await getAccuracyTrend('user_1')

      expect(trend.daily.length).toBeGreaterThan(0)
    })

    it('calculates overall trend direction', async () => {
      // Create improving results
      const results = [
        createMockResult('user_1', 50, 80, 10),
        createMockResult('user_1', 50, 82, 9),
        createMockResult('user_1', 50, 84, 8),
        createMockResult('user_1', 50, 86, 7),
        createMockResult('user_1', 50, 88, 6),
        createMockResult('user_1', 50, 90, 5),
        createMockResult('user_1', 50, 92, 4),
        createMockResult('user_1', 50, 94, 3),
        createMockResult('user_1', 50, 96, 2),
        createMockResult('user_1', 50, 98, 1),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const trend = await getAccuracyTrend('user_1')

      expect(trend.overall.trend).toBe('up')
      expect(trend.overall.change).toBeGreaterThan(0)
    })
  })

  describe('getWPMTrend', () => {
    it('returns empty trends when no results', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const trend = await getWPMTrend('user_1')

      expect(trend.daily).toHaveLength(0)
      expect(trend.overall.trend).toBe('stable')
    })

    it('calculates WPM improvement', async () => {
      // Create improving WPM results
      const results = [
        createMockResult('user_1', 40, 90, 10),
        createMockResult('user_1', 42, 90, 9),
        createMockResult('user_1', 44, 90, 8),
        createMockResult('user_1', 46, 90, 7),
        createMockResult('user_1', 48, 90, 6),
        createMockResult('user_1', 50, 90, 5),
        createMockResult('user_1', 55, 90, 4),
        createMockResult('user_1', 60, 90, 3),
        createMockResult('user_1', 65, 90, 2),
        createMockResult('user_1', 70, 90, 1),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const trend = await getWPMTrend('user_1')

      expect(trend.overall.current).toBeGreaterThan(trend.overall.previous)
      expect(trend.overall.trend).toBe('up')
    })
  })

  describe('getLanguageStats', () => {
    it('returns stats for all languages', async () => {
      const results = [
        createMockResult('user_1', 50, 90),
        createMockResult('user_1', 55, 92),
        createMockResult('user_1', 60, 95),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const breakdown = await getLanguageStats('user_1')

      expect(breakdown.languages).toHaveLength(3)
      expect(breakdown.languages.map(l => l.language)).toContain('javascript')
      expect(breakdown.languages.map(l => l.language)).toContain('typescript')
      expect(breakdown.languages.map(l => l.language)).toContain('python')
    })

    it('identifies strongest language', async () => {
      // Create results where JS is clearly strongest
      const results = Array.from({ length: 10 }, (_, i) => ({
        ...createMockResult('user_1', 80, 95),
        snippetId: i % 3 === 0 ? 0 : i, // More JS results (snippetId % 3 === 0)
      }))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const breakdown = await getLanguageStats('user_1')

      expect(breakdown.strongest).toBeDefined()
    })

    it('returns null for empty results', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const breakdown = await getLanguageStats('user_1')

      expect(breakdown.strongest).toBeNull()
      expect(breakdown.needsWork).toBeNull()
      expect(breakdown.mostPracticed).toBeNull()
    })
  })

  describe('getDifficultyStats', () => {
    it('returns stats for all difficulty levels', async () => {
      const results = [
        createMockResult('user_1', 50, 90),
        createMockResult('user_1', 45, 88),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const stats = await getDifficultyStats('user_1')

      expect(stats).toHaveLength(4)
      expect(stats.map(s => s.difficulty)).toContain('easy')
      expect(stats.map(s => s.difficulty)).toContain('medium')
      expect(stats.map(s => s.difficulty)).toContain('hard')
      expect(stats.map(s => s.difficulty)).toContain('expert')
    })
  })

  describe('identifyWeaknesses', () => {
    it('returns not enough data message for few tests', async () => {
      const results = [createMockResult('user_1', 50, 90)]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weaknesses = await identifyWeaknesses('user_1')

      expect(weaknesses.length).toBe(1)
      expect(weaknesses[0].description).toContain('Not enough data')
    })

    it('identifies symbol accuracy weakness', async () => {
      const results = Array.from({ length: 5 }, () =>
        createMockResult('user_1', 50, 90, 0, 70) // Low symbol accuracy
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weaknesses = await identifyWeaknesses('user_1')

      expect(weaknesses.some(w => w.type === 'symbols')).toBe(true)
    })

    it('identifies keyword accuracy weakness', async () => {
      const results = Array.from({ length: 5 }, () =>
        createMockResult('user_1', 50, 90, 0, 95, 60) // Low keyword accuracy
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weaknesses = await identifyWeaknesses('user_1')

      expect(weaknesses.some(w => w.type === 'keywords')).toBe(true)
    })

    it('identifies speed weakness', async () => {
      const results = Array.from({ length: 5 }, () =>
        createMockResult('user_1', 15, 90) // Very low WPM
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weaknesses = await identifyWeaknesses('user_1')

      expect(weaknesses.some(w => w.type === 'speed')).toBe(true)
    })

    it('identifies accuracy weakness', async () => {
      const results = Array.from({ length: 5 }, () =>
        createMockResult('user_1', 50, 70) // Low accuracy
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weaknesses = await identifyWeaknesses('user_1')

      expect(weaknesses.some(w => w.type === 'accuracy')).toBe(true)
    })
  })

  describe('getLanguageDisplayName', () => {
    it('returns display names correctly', () => {
      expect(getLanguageDisplayName('javascript')).toBe('JavaScript')
      expect(getLanguageDisplayName('typescript')).toBe('TypeScript')
      expect(getLanguageDisplayName('python')).toBe('Python')
    })
  })

  describe('getLanguageColor', () => {
    it('returns correct colors', () => {
      expect(getLanguageColor('javascript')).toBe('#f7df1e')
      expect(getLanguageColor('typescript')).toBe('#3178c6')
      expect(getLanguageColor('python')).toBe('#3776ab')
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculatePerformanceProfile,
  getDifficultyRecommendation,
  getLanguageRecommendation,
  getPracticeRecommendation,
  getMotivationalMessage,
} from '@/lib/recommendations-api'
import type { TestResult } from '@/db/schema'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('recommendations-api', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const createMockResult = (
    userId: string,
    wpm: number,
    accuracy: number,
    snippetId: number = 1
  ): TestResult => ({
    id: Date.now() + Math.random(),
    userId,
    snippetId,
    wpm,
    rawWpm: wpm + 5,
    accuracy,
    symbolAccuracy: accuracy - 5,
    keywordAccuracy: accuracy - 3,
    charactersTyped: 100,
    correctCharacters: accuracy,
    incorrectCharacters: 100 - accuracy,
    backspaceCount: 2,
    duration: 60,
    completedAt: new Date(),
    isStrictMode: false,
  })

  describe('calculatePerformanceProfile', () => {
    it('returns null for insufficient data', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const profile = calculatePerformanceProfile('user_1')

      expect(profile).toBeNull()
    })

    it('returns null for less than 3 tests', () => {
      const results = [
        createMockResult('user_1', 50, 90),
        createMockResult('user_1', 55, 92),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const profile = calculatePerformanceProfile('user_1')

      expect(profile).toBeNull()
    })

    it('calculates profile correctly', () => {
      const results = [
        createMockResult('user_1', 50, 90),
        createMockResult('user_1', 55, 92),
        createMockResult('user_1', 60, 95),
        createMockResult('user_1', 52, 91),
        createMockResult('user_1', 58, 93),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const profile = calculatePerformanceProfile('user_1')

      expect(profile).not.toBeNull()
      expect(profile!.totalTests).toBe(5)
      expect(profile!.averageWpm).toBeGreaterThan(0)
      expect(profile!.averageAccuracy).toBeGreaterThan(0)
    })

    it('detects improving trend', () => {
      // Create results where recent tests are better
      const results = [
        // Recent (better)
        createMockResult('user_1', 70, 95),
        createMockResult('user_1', 68, 94),
        createMockResult('user_1', 65, 93),
        createMockResult('user_1', 62, 92),
        createMockResult('user_1', 60, 91),
        // Previous (worse)
        createMockResult('user_1', 45, 88),
        createMockResult('user_1', 42, 87),
        createMockResult('user_1', 40, 86),
        createMockResult('user_1', 38, 85),
        createMockResult('user_1', 35, 84),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const profile = calculatePerformanceProfile('user_1')

      expect(profile!.trend).toBe('improving')
    })
  })

  describe('getDifficultyRecommendation', () => {
    it('returns easy for new users', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const rec = await getDifficultyRecommendation('user_1')

      expect(rec.recommended).toBe('easy')
      expect(rec.confidence).toBe('low')
    })

    it('recommends higher difficulty for good performance', async () => {
      const results = Array.from({ length: 10 }, () =>
        createMockResult('user_1', 75, 97)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getDifficultyRecommendation('user_1')

      expect(['hard', 'expert']).toContain(rec.recommended)
    })

    it('recommends easier difficulty for low accuracy', async () => {
      const results = Array.from({ length: 10 }, () =>
        createMockResult('user_1', 60, 75)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getDifficultyRecommendation('user_1')

      expect(rec.recommended).toBe('easy')
      expect(rec.reason).toContain('accuracy')
    })

    it('provides alternatives', async () => {
      const results = Array.from({ length: 10 }, () =>
        createMockResult('user_1', 55, 92)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getDifficultyRecommendation('user_1')

      expect(rec.alternatives).toBeDefined()
      expect(rec.alternatives.length).toBeGreaterThan(0)
    })
  })

  describe('getLanguageRecommendation', () => {
    it('recommends unpracticed language', async () => {
      // Only JavaScript results
      const results = Array.from({ length: 5 }, (_, i) =>
        createMockResult('user_1', 50, 90, i * 3) // All snippetId % 3 === 0 (JavaScript)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getLanguageRecommendation('user_1')

      // Should recommend TypeScript or Python since they're unpracticed
      expect(['typescript', 'python']).toContain(rec.recommended)
    })

    it('provides practice order', async () => {
      const results = Array.from({ length: 9 }, (_, i) =>
        createMockResult('user_1', 40 + (i % 3) * 10, 85 + (i % 3) * 3, i)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getLanguageRecommendation('user_1')

      expect(rec.practiceOrder).toHaveLength(3)
      expect(rec.practiceOrder).toContain('javascript')
      expect(rec.practiceOrder).toContain('typescript')
      expect(rec.practiceOrder).toContain('python')
    })
  })

  describe('getPracticeRecommendation', () => {
    it('returns balanced focus for new users', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const rec = await getPracticeRecommendation('user_1')

      expect(rec.focus).toBe('balanced')
    })

    it('suggests symbols focus when needed', async () => {
      const results = Array.from({ length: 5 }, () => ({
        ...createMockResult('user_1', 60, 95),
        symbolAccuracy: 70, // Low symbol accuracy
      }))
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getPracticeRecommendation('user_1')

      expect(rec.focus).toBe('symbols')
    })

    it('includes difficulty and language', async () => {
      const results = Array.from({ length: 10 }, () =>
        createMockResult('user_1', 55, 92)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rec = await getPracticeRecommendation('user_1')

      expect(rec.difficulty).toBeDefined()
      expect(rec.language).toBeDefined()
      expect(rec.estimatedChallenge).toBeDefined()
    })
  })

  describe('getMotivationalMessage', () => {
    it('returns starter message for no profile', () => {
      const message = getMotivationalMessage(null)

      expect(message).toContain('Start')
    })

    it('congratulates improving trend', () => {
      const profile = {
        averageWpm: 50,
        averageAccuracy: 90,
        symbolAccuracy: 85,
        keywordAccuracy: 88,
        consistency: 5,
        trend: 'improving' as const,
        totalTests: 10,
      }

      const message = getMotivationalMessage(profile)

      expect(message).toContain('fire')
    })

    it('recognizes high accuracy', () => {
      const profile = {
        averageWpm: 60,
        averageAccuracy: 99,
        symbolAccuracy: 98,
        keywordAccuracy: 99,
        consistency: 3,
        trend: 'stable' as const,
        totalTests: 20,
      }

      const message = getMotivationalMessage(profile)

      expect(message.toLowerCase()).toContain('accuracy')
    })

    it('recognizes high speed', () => {
      const profile = {
        averageWpm: 85,
        averageAccuracy: 92,
        symbolAccuracy: 90,
        keywordAccuracy: 91,
        consistency: 5,
        trend: 'stable' as const,
        totalTests: 15,
      }

      const message = getMotivationalMessage(profile)

      expect(message).toContain('fast')
    })
  })
})

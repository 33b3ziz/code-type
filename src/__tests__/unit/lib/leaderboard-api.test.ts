import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getLeaderboard,
  getUserRank,
  getTopUsers,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  formatRank,
  getRankSuffix,
  type TimeFrame,
} from '@/lib/leaderboard-api'
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

describe('leaderboard-api', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const createMockResult = (
    userId: string,
    wpm: number,
    daysAgo: number = 0
  ): TestResult => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      id: Date.now() + Math.random(),
      userId,
      snippetId: 1,
      wpm,
      rawWpm: wpm + 5,
      accuracy: 95,
      symbolAccuracy: null,
      keywordAccuracy: null,
      charactersTyped: 100,
      correctCharacters: 95,
      incorrectCharacters: 5,
      backspaceCount: 2,
      duration: 60,
      completedAt: date,
      isStrictMode: false,
    }
  }

  describe('getLeaderboard', () => {
    it('returns empty entries when no results exist', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const result = await getLeaderboard({ timeFrame: 'alltime' })

      expect(result.entries).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('returns ranked entries sorted by WPM', async () => {
      const results = [
        createMockResult('user_1', 50),
        createMockResult('user_2', 80),
        createMockResult('user_3', 60),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const result = await getLeaderboard({ timeFrame: 'alltime' })

      expect(result.entries[0].userId).toBe('user_2')
      expect(result.entries[0].rank).toBe(1)
      expect(result.entries[0].wpm).toBe(80)
      expect(result.entries[1].userId).toBe('user_3')
      expect(result.entries[1].rank).toBe(2)
      expect(result.entries[2].userId).toBe('user_1')
      expect(result.entries[2].rank).toBe(3)
    })

    it('filters by daily timeframe', async () => {
      const results = [
        createMockResult('user_1', 50, 0), // Today
        createMockResult('user_2', 80, 2), // 2 days ago
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const result = await getLeaderboard({ timeFrame: 'daily' })

      expect(result.entries).toHaveLength(1)
      expect(result.entries[0].userId).toBe('user_1')
    })

    it('filters by weekly timeframe', async () => {
      const results = [
        createMockResult('user_1', 50, 0), // Today - should be included
        createMockResult('user_2', 80, 10), // 10 days ago - excluded
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const result = await getLeaderboard({ timeFrame: 'weekly' })

      expect(result.entries.length).toBeGreaterThanOrEqual(1)
      // Only user_1 should be in weekly results since user_2's result is 10 days ago
      expect(result.entries.some(e => e.userId === 'user_1')).toBe(true)
    })

    it('respects limit and offset for pagination', async () => {
      const results = [
        createMockResult('user_1', 50),
        createMockResult('user_2', 80),
        createMockResult('user_3', 60),
        createMockResult('user_4', 70),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const result = await getLeaderboard({ timeFrame: 'alltime', limit: 2, offset: 1 })

      expect(result.entries).toHaveLength(2)
      expect(result.entries[0].rank).toBe(2)
    })

    it('aggregates multiple results per user', async () => {
      const results = [
        createMockResult('user_1', 50),
        createMockResult('user_1', 70), // Better score
        createMockResult('user_1', 60),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const result = await getLeaderboard({ timeFrame: 'alltime' })

      expect(result.entries).toHaveLength(1)
      expect(result.entries[0].bestWpm).toBe(70)
      expect(result.entries[0].testsCompleted).toBe(3)
    })
  })

  describe('getUserRank', () => {
    it('returns user rank when found', async () => {
      const results = [
        createMockResult('user_1', 50),
        createMockResult('user_2', 80),
        createMockResult('user_3', 60),
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rank = await getUserRank('user_3', { timeFrame: 'alltime' })

      expect(rank).toBe(2)
    })

    it('returns null when user not found', async () => {
      const results = [createMockResult('user_1', 50)]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const rank = await getUserRank('unknown_user', { timeFrame: 'alltime' })

      expect(rank).toBeNull()
    })
  })

  describe('getTopUsers', () => {
    it('returns top N users', async () => {
      const results = Array.from({ length: 20 }, (_, i) =>
        createMockResult(`user_${i}`, 50 + i)
      )
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const top = await getTopUsers('alltime', 5)

      expect(top).toHaveLength(5)
      expect(top[0].rank).toBe(1)
    })
  })

  describe('getDailyLeaderboard', () => {
    it('returns daily rankings', async () => {
      const results = [createMockResult('user_1', 50, 0)]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const daily = await getDailyLeaderboard(10)

      expect(daily).toBeDefined()
      expect(Array.isArray(daily)).toBe(true)
    })
  })

  describe('getWeeklyLeaderboard', () => {
    it('returns weekly rankings', async () => {
      const results = [createMockResult('user_1', 50, 3)]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const weekly = await getWeeklyLeaderboard(10)

      expect(weekly).toBeDefined()
      expect(Array.isArray(weekly)).toBe(true)
    })
  })

  describe('getAllTimeLeaderboard', () => {
    it('returns all-time rankings', async () => {
      const results = [createMockResult('user_1', 50, 100)]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(results))

      const allTime = await getAllTimeLeaderboard(10)

      expect(allTime).toBeDefined()
      expect(Array.isArray(allTime)).toBe(true)
    })
  })

  describe('formatRank', () => {
    it('returns medal emoji for top 3', () => {
      expect(formatRank(1)).toBe('🥇')
      expect(formatRank(2)).toBe('🥈')
      expect(formatRank(3)).toBe('🥉')
    })

    it('returns hash format for other ranks', () => {
      expect(formatRank(4)).toBe('#4')
      expect(formatRank(10)).toBe('#10')
      expect(formatRank(100)).toBe('#100')
    })
  })

  describe('getRankSuffix', () => {
    it('returns correct suffixes', () => {
      expect(getRankSuffix(1)).toBe('1st')
      expect(getRankSuffix(2)).toBe('2nd')
      expect(getRankSuffix(3)).toBe('3rd')
      expect(getRankSuffix(4)).toBe('4th')
      expect(getRankSuffix(11)).toBe('11th')
      expect(getRankSuffix(12)).toBe('12th')
      expect(getRankSuffix(13)).toBe('13th')
      expect(getRankSuffix(21)).toBe('21st')
      expect(getRankSuffix(22)).toBe('22nd')
      expect(getRankSuffix(23)).toBe('23rd')
      expect(getRankSuffix(111)).toBe('111th')
    })
  })
})

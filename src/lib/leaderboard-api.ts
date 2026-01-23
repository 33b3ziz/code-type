/**
 * Leaderboard API
 * Functions for fetching and managing leaderboard rankings
 */

import type { Difficulty, Language, TestResult } from '@/db/schema'

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'alltime'
export type SortBy = 'wpm' | 'accuracy' | 'consistency'
export type SortOrder = 'asc' | 'desc'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  wpm: number
  accuracy: number
  testsCompleted: number
  bestWpm: number
  averageWpm: number
  lastActive: Date
  consistency: number // Lower is better - standard deviation of WPM
}

export interface LeaderboardFilters {
  timeFrame: TimeFrame
  language?: Language
  difficulty?: Difficulty
  sortBy?: SortBy
  sortOrder?: SortOrder
  limit?: number
  offset?: number
}

export interface LeaderboardResponse {
  entries: Array<LeaderboardEntry>
  total: number
  userRank?: number // Current user's rank if authenticated
  filters: LeaderboardFilters
}

// Demo user data for testing
const DEMO_USERS = [
  { userId: 'user_1', username: 'TypeMaster' },
  { userId: 'user_2', username: 'CodeNinja' },
  { userId: 'user_3', username: 'SpeedyDev' },
  { userId: 'user_4', username: 'KeyboardWizard' },
  { userId: 'user_5', username: 'ByteRunner' },
  { userId: 'user_6', username: 'SyntaxPro' },
  { userId: 'user_7', username: 'QuickFingers' },
  { userId: 'user_8', username: 'DevTyper' },
  { userId: 'user_9', username: 'CodeRacer' },
  { userId: 'user_10', username: 'TerminalAce' },
]

/**
 * Get the start date for a given timeframe
 */
function getTimeFrameStartDate(timeFrame: TimeFrame): Date {
  const now = new Date()

  switch (timeFrame) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'weekly': {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    }
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'alltime':
    default:
      return new Date(0) // Beginning of time
  }
}

/**
 * Filter results by timeframe
 */
function filterByTimeFrame(results: Array<TestResult>, timeFrame: TimeFrame): Array<TestResult> {
  const startDate = getTimeFrameStartDate(timeFrame)
  return results.filter((r) => new Date(r.completedAt) >= startDate)
}

/**
 * Aggregate results by user for leaderboard
 */
function aggregateByUser(results: Array<TestResult>): Map<string, Array<TestResult>> {
  const userResults = new Map<string, Array<TestResult>>()

  for (const result of results) {
    const existing = userResults.get(result.userId) || []
    existing.push(result)
    userResults.set(result.userId, existing)
  }

  return userResults
}

/**
 * Calculate standard deviation of WPM for consistency metric
 */
function calculateConsistency(results: Array<TestResult>): number {
  if (results.length < 2) return 0
  const wpms = results.map((r) => r.wpm)
  const mean = wpms.reduce((sum, wpm) => sum + wpm, 0) / wpms.length
  const squaredDiffs = wpms.map((wpm) => Math.pow(wpm - mean, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / wpms.length
  return Math.round(Math.sqrt(variance) * 10) / 10 // Round to 1 decimal
}

/**
 * Calculate leaderboard entry from user's results
 */
function calculateEntry(
  userId: string,
  results: Array<TestResult>,
  rank: number
): LeaderboardEntry {
  if (results.length === 0) {
    const user = DEMO_USERS.find((u) => u.userId === userId) || { username: 'Unknown' }
    return {
      rank,
      userId,
      username: user.username,
      wpm: 0,
      accuracy: 0,
      testsCompleted: 0,
      bestWpm: 0,
      averageWpm: 0,
      lastActive: new Date(),
      consistency: 0,
    }
  }

  const user = DEMO_USERS.find((u) => u.userId === userId) || { username: 'Unknown' }
  const bestWpm = Math.max(...results.map((r) => r.wpm))
  const averageWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length)
  const averageAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
  const lastActive = new Date(Math.max(...results.map((r) => new Date(r.completedAt).getTime())))
  const consistency = calculateConsistency(results)

  return {
    rank,
    userId,
    username: user.username,
    wpm: bestWpm, // Use best WPM for ranking
    accuracy: averageAccuracy,
    testsCompleted: results.length,
    bestWpm,
    averageWpm,
    lastActive,
    consistency,
  }
}

/**
 * Sort entries based on sortBy and sortOrder
 */
function sortEntries(
  entries: Array<LeaderboardEntry>,
  sortBy: SortBy = 'wpm',
  sortOrder: SortOrder = 'desc'
): Array<LeaderboardEntry> {
  const multiplier = sortOrder === 'desc' ? -1 : 1

  return entries.sort((a, b) => {
    switch (sortBy) {
      case 'accuracy':
        return (a.accuracy - b.accuracy) * multiplier
      case 'consistency':
        // Lower consistency is better, so we invert the comparison
        return (b.consistency - a.consistency) * multiplier
      case 'wpm':
      default:
        return (a.wpm - b.wpm) * multiplier
    }
  })
}

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(
  filters: LeaderboardFilters
): Promise<LeaderboardResponse> {
  const { timeFrame, sortBy = 'wpm', sortOrder = 'desc', limit = 10, offset = 0 } = filters

  if (typeof window === 'undefined') {
    return { entries: [], total: 0, filters }
  }

  // Get all results from localStorage
  let results: Array<TestResult> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  )

  // Filter by timeframe
  results = filterByTimeFrame(results, timeFrame)

  // Filter by language/difficulty if specified
  // Note: In production, this would use snippet data
  // For now, we just use the results we have

  // Aggregate by user
  const userResults = aggregateByUser(results)

  // Calculate entries
  const entries: Array<LeaderboardEntry> = []
  userResults.forEach((results, userId) => {
    entries.push(calculateEntry(userId, results, 0))
  })

  // Sort based on sortBy and sortOrder
  sortEntries(entries, sortBy, sortOrder)

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1
  })

  const total = entries.length
  const paginatedEntries = entries.slice(offset, offset + limit)

  return {
    entries: paginatedEntries,
    total,
    filters,
  }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(
  userId: string,
  filters: Omit<LeaderboardFilters, 'limit' | 'offset'>
): Promise<number | null> {
  const { entries } = await getLeaderboard({ ...filters, limit: 1000 })
  const userEntry = entries.find((e) => e.userId === userId)
  return userEntry?.rank ?? null
}

/**
 * Get top N users
 */
export async function getTopUsers(
  timeFrame: TimeFrame,
  limit: number = 10
): Promise<Array<LeaderboardEntry>> {
  const { entries } = await getLeaderboard({ timeFrame, limit })
  return entries
}

/**
 * Get daily leaderboard
 */
export async function getDailyLeaderboard(limit: number = 10): Promise<Array<LeaderboardEntry>> {
  return getTopUsers('daily', limit)
}

/**
 * Get weekly leaderboard
 */
export async function getWeeklyLeaderboard(limit: number = 10): Promise<Array<LeaderboardEntry>> {
  return getTopUsers('weekly', limit)
}

/**
 * Get all-time leaderboard
 */
export async function getAllTimeLeaderboard(limit: number = 10): Promise<Array<LeaderboardEntry>> {
  return getTopUsers('alltime', limit)
}

/**
 * Format rank for display
 */
export function formatRank(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

/**
 * Get rank suffix (1st, 2nd, 3rd, etc.)
 */
export function getRankSuffix(rank: number): string {
  const j = rank % 10
  const k = rank % 100

  if (j === 1 && k !== 11) return `${rank}st`
  if (j === 2 && k !== 12) return `${rank}nd`
  if (j === 3 && k !== 13) return `${rank}rd`
  return `${rank}th`
}

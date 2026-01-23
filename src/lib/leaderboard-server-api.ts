import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm'
import type { Difficulty, Language } from '@/db/schema'
import { db } from '@/db'
import { snippets, testResults, users } from '@/db/schema'

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'alltime'
export type SortBy = 'wpm' | 'accuracy' | 'consistency'
export type SortOrder = 'asc' | 'desc'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  bestWpm: number
  averageWpm: number
  averageAccuracy: number
  testsCompleted: number
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
  userRank?: number
  filters: LeaderboardFilters
}

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
      return new Date(0)
  }
}

/**
 * Build dynamic order by clause based on sortBy and sortOrder
 */
function getOrderByClause(sortBy: SortBy, sortOrder: SortOrder) {
  const orderFn = sortOrder === 'asc' ? asc : desc
  switch (sortBy) {
    case 'accuracy':
      return orderFn(sql`AVG(${testResults.accuracy})`)
    case 'consistency':
      // For consistency, lower stddev is better, so we invert the order
      return sortOrder === 'asc'
        ? desc(sql`STDDEV_POP(${testResults.wpm})`)
        : asc(sql`STDDEV_POP(${testResults.wpm})`)
    case 'wpm':
    default:
      return orderFn(sql`MAX(${testResults.wpm})`)
  }
}

/**
 * Get leaderboard entries from the database
 */
export const getLeaderboardFn = createServerFn({ method: 'GET' })
  .inputValidator((filters: LeaderboardFilters) => filters)
  .handler(async ({ data: filters }): Promise<LeaderboardResponse> => {
    const {
      timeFrame,
      language,
      difficulty,
      sortBy = 'wpm',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = filters
    const startDate = getTimeFrameStartDate(timeFrame)

    // Build where conditions dynamically
    const whereConditions = [gte(testResults.completedAt, startDate)]

    // Add language filter if specified
    if (language) {
      whereConditions.push(eq(snippets.language, language))
    }

    // Add difficulty filter if specified
    if (difficulty) {
      whereConditions.push(eq(snippets.difficulty, difficulty))
    }

    // Determine if we need to join snippets table
    const needsSnippetJoin = language || difficulty

    // Get aggregated stats per user
    let query = db
      .select({
        userId: testResults.userId,
        username: users.username,
        bestWpm: sql<number>`MAX(${testResults.wpm})`,
        averageWpm: sql<number>`AVG(${testResults.wpm})`,
        averageAccuracy: sql<number>`AVG(${testResults.accuracy})`,
        testsCompleted: sql<number>`COUNT(*)`,
        consistency: sql<number>`COALESCE(STDDEV_POP(${testResults.wpm}), 0)`,
      })
      .from(testResults)
      .innerJoin(users, eq(testResults.userId, users.id))

    if (needsSnippetJoin) {
      query = query.innerJoin(snippets, eq(testResults.snippetId, snippets.id)) as typeof query
    }

    const results = await query
      .where(and(...whereConditions))
      .groupBy(testResults.userId, users.username)
      .orderBy(getOrderByClause(sortBy, sortOrder))
      .limit(limit)
      .offset(offset)

    // Get total count of unique users with the same filters
    let countQuery = db
      .select({ count: sql<number>`COUNT(DISTINCT ${testResults.userId})` })
      .from(testResults)

    if (needsSnippetJoin) {
      countQuery = countQuery.innerJoin(
        snippets,
        eq(testResults.snippetId, snippets.id)
      ) as typeof countQuery
    }

    const countResults = await countQuery.where(and(...whereConditions))

    const total = countResults[0]?.count ?? 0

    const entries: Array<LeaderboardEntry> = results.map((r, index) => ({
      rank: offset + index + 1,
      userId: r.userId,
      username: r.username,
      bestWpm: Math.round(r.bestWpm),
      averageWpm: Math.round(r.averageWpm),
      averageAccuracy: Math.round(r.averageAccuracy),
      testsCompleted: r.testsCompleted,
      consistency: Math.round(r.consistency * 10) / 10, // Round to 1 decimal place
    }))

    return {
      entries,
      total,
      filters,
    }
  })

export interface UserRankFilters {
  userId: string
  timeFrame: TimeFrame
  language?: Language
  difficulty?: Difficulty
  sortBy?: SortBy
}

/**
 * Get a specific user's rank based on filters
 */
export const getUserLeaderboardRankFn = createServerFn({ method: 'GET' })
  .inputValidator((data: UserRankFilters) => data)
  .handler(async ({ data }): Promise<number | null> => {
    const { userId, timeFrame, language, difficulty, sortBy = 'wpm' } = data
    const startDate = getTimeFrameStartDate(timeFrame)

    // Build where conditions
    const baseConditions = [
      eq(testResults.userId, userId),
      gte(testResults.completedAt, startDate),
    ]

    const needsSnippetJoin = language || difficulty

    if (language) {
      baseConditions.push(eq(snippets.language, language))
    }
    if (difficulty) {
      baseConditions.push(eq(snippets.difficulty, difficulty))
    }

    // Get user's metric value
    let userQuery = db
      .select({
        bestWpm: sql<number>`MAX(${testResults.wpm})`,
        avgAccuracy: sql<number>`AVG(${testResults.accuracy})`,
        consistency: sql<number>`COALESCE(STDDEV_POP(${testResults.wpm}), 0)`,
      })
      .from(testResults)

    if (needsSnippetJoin) {
      userQuery = userQuery.innerJoin(
        snippets,
        eq(testResults.snippetId, snippets.id)
      ) as typeof userQuery
    }

    const userResults = await userQuery.where(and(...baseConditions))

    const userStats = userResults[0] as
      | { bestWpm: number; avgAccuracy: number; consistency: number }
      | undefined
    if (!userStats || !userStats.bestWpm) return null

    // Determine which metric to compare
    let comparisonSql
    switch (sortBy) {
      case 'accuracy':
        comparisonSql = sql`AVG(${testResults.accuracy}) > ${userStats.avgAccuracy}`
        break
      case 'consistency':
        // Lower consistency (stddev) is better
        comparisonSql = sql`COALESCE(STDDEV_POP(${testResults.wpm}), 0) < ${userStats.consistency}`
        break
      case 'wpm':
      default:
        comparisonSql = sql`MAX(${testResults.wpm}) > ${userStats.bestWpm}`
    }

    // Build conditions for counting users with better stats
    const countConditions = [gte(testResults.completedAt, startDate)]
    if (language) {
      countConditions.push(eq(snippets.language, language))
    }
    if (difficulty) {
      countConditions.push(eq(snippets.difficulty, difficulty))
    }

    // Count users with better metric
    let rankQuery = db
      .select({
        userId: testResults.userId,
      })
      .from(testResults)

    if (needsSnippetJoin) {
      rankQuery = rankQuery.innerJoin(
        snippets,
        eq(testResults.snippetId, snippets.id)
      ) as typeof rankQuery
    }

    const betterUsers = await rankQuery
      .where(and(...countConditions))
      .groupBy(testResults.userId)
      .having(comparisonSql)

    return betterUsers.length + 1
  })

/**
 * Format rank for display with medals
 */
export function formatRank(rank: number): string {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

/**
 * Get medal emoji for top 3
 */
export function getRankMedal(rank: number): string | null {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

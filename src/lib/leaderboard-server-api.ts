import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import type {Difficulty, Language} from '@/db/schema';
import { db } from '@/db'
import {   testResults, users } from '@/db/schema'

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'alltime'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  bestWpm: number
  averageWpm: number
  averageAccuracy: number
  testsCompleted: number
}

export interface LeaderboardFilters {
  timeFrame: TimeFrame
  language?: Language
  difficulty?: Difficulty
  limit?: number
  offset?: number
}

export interface LeaderboardResponse {
  entries: Array<LeaderboardEntry>
  total: number
  userRank?: number
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
 * Get leaderboard entries from the database
 */
export const getLeaderboardFn = createServerFn({ method: 'GET' })
  .inputValidator((filters: LeaderboardFilters) => filters)
  .handler(async ({ data: filters }): Promise<LeaderboardResponse> => {
    const { timeFrame, limit = 20, offset = 0 } = filters
    const startDate = getTimeFrameStartDate(timeFrame)

    // Get aggregated stats per user
    const results = await db
      .select({
        userId: testResults.userId,
        username: users.username,
        bestWpm: sql<number>`MAX(${testResults.wpm})`,
        averageWpm: sql<number>`AVG(${testResults.wpm})`,
        averageAccuracy: sql<number>`AVG(${testResults.accuracy})`,
        testsCompleted: sql<number>`COUNT(*)`,
      })
      .from(testResults)
      .innerJoin(users, eq(testResults.userId, users.id))
      .where(gte(testResults.completedAt, startDate))
      .groupBy(testResults.userId, users.username)
      .orderBy(desc(sql`MAX(${testResults.wpm})`))
      .limit(limit)
      .offset(offset)

    // Get total count of unique users
    const countResults = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${testResults.userId})` })
      .from(testResults)
      .where(gte(testResults.completedAt, startDate))

    const total = countResults[0]?.count ?? 0

    const entries: Array<LeaderboardEntry> = results.map((r, index) => ({
      rank: offset + index + 1,
      userId: r.userId,
      username: r.username,
      bestWpm: Math.round(r.bestWpm),
      averageWpm: Math.round(r.averageWpm),
      averageAccuracy: Math.round(r.averageAccuracy),
      testsCompleted: r.testsCompleted,
    }))

    return {
      entries,
      total,
    }
  })

/**
 * Get a specific user's rank
 */
export const getUserLeaderboardRankFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; timeFrame: TimeFrame }) => data)
  .handler(async ({ data }): Promise<number | null> => {
    const { userId, timeFrame } = data
    const startDate = getTimeFrameStartDate(timeFrame)

    // Get user's best WPM in the time frame
    const userBestResults = await db
      .select({ bestWpm: sql<number>`MAX(${testResults.wpm})` })
      .from(testResults)
      .where(
        and(
          eq(testResults.userId, userId),
          gte(testResults.completedAt, startDate)
        )
      )

    const userBest = userBestResults[0] as { bestWpm: number } | undefined
    if (!userBest || !userBest.bestWpm) return null

    // Count users with higher best WPM
    const rankResults = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${testResults.userId})`,
      })
      .from(testResults)
      .where(
        and(
          gte(testResults.completedAt, startDate),
          sql`${testResults.userId} IN (
            SELECT ${testResults.userId}
            FROM ${testResults}
            WHERE ${testResults.completedAt} >= ${startDate}
            GROUP BY ${testResults.userId}
            HAVING MAX(${testResults.wpm}) > ${userBest.bestWpm}
          )`
        )
      )

    return (rankResults[0]?.count ?? 0) + 1
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

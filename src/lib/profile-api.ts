import { createServerFn } from '@tanstack/react-start'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { snippets, testResults } from '@/db/schema'

export interface UserStats {
  totalTests: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
  bestAccuracy: number
  totalTimeSpent: number
  totalCharacters: number
  testsThisWeek: number
  improvement: number
}

export interface RecentResult {
  id: number
  wpm: number
  rawWpm: number
  accuracy: number
  duration: number
  completedAt: Date
  snippetTitle: string | null
  snippetLanguage: string | null
}

/**
 * Get user statistics from the database
 */
export const getUserStatsFn = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }): Promise<UserStats> => {
    // Get all test results for user
    const results = await db
      .select({
        wpm: testResults.wpm,
        accuracy: testResults.accuracy,
        duration: testResults.duration,
        charactersTyped: testResults.charactersTyped,
        completedAt: testResults.completedAt,
      })
      .from(testResults)
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt))

    if (results.length === 0) {
      return {
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTimeSpent: 0,
        totalCharacters: 0,
        testsThisWeek: 0,
        improvement: 0,
      }
    }

    const totalTests = results.length
    const averageWpm = Math.round(
      results.reduce((sum, r) => sum + r.wpm, 0) / totalTests
    )
    const averageAccuracy = Math.round(
      results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests
    )
    const bestWpm = Math.round(Math.max(...results.map((r) => r.wpm)))
    const bestAccuracy = Math.round(Math.max(...results.map((r) => r.accuracy)))
    const totalTimeSpent = results.reduce((sum, r) => sum + r.duration, 0)
    const totalCharacters = results.reduce((sum, r) => sum + r.charactersTyped, 0)

    // Tests this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const testsThisWeek = results.filter(
      (r) => new Date(r.completedAt) >= weekAgo
    ).length

    // Calculate improvement (compare last 5 tests to previous 5)
    const recentAvg =
      results.length >= 5
        ? Math.round(results.slice(0, 5).reduce((sum, r) => sum + r.wpm, 0) / 5)
        : averageWpm
    const previousAvg =
      results.length >= 10
        ? Math.round(results.slice(5, 10).reduce((sum, r) => sum + r.wpm, 0) / 5)
        : averageWpm
    const improvement = recentAvg - previousAvg

    return {
      totalTests,
      averageWpm,
      averageAccuracy,
      bestWpm,
      bestAccuracy,
      totalTimeSpent,
      totalCharacters,
      testsThisWeek,
      improvement,
    }
  })

/**
 * Get recent test results for a user
 */
export const getRecentResultsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number }) => data)
  .handler(async ({ data }): Promise<Array<RecentResult>> => {
    const { userId, limit = 10 } = data

    const results = await db
      .select({
        id: testResults.id,
        wpm: testResults.wpm,
        rawWpm: testResults.rawWpm,
        accuracy: testResults.accuracy,
        duration: testResults.duration,
        completedAt: testResults.completedAt,
        snippetTitle: snippets.title,
        snippetLanguage: snippets.language,
      })
      .from(testResults)
      .leftJoin(snippets, eq(testResults.snippetId, snippets.id))
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt))
      .limit(limit)

    return results.map((r) => ({
      id: r.id,
      wpm: Math.round(r.wpm),
      rawWpm: Math.round(r.rawWpm),
      accuracy: Math.round(r.accuracy),
      duration: r.duration,
      completedAt: r.completedAt,
      snippetTitle: r.snippetTitle,
      snippetLanguage: r.snippetLanguage,
    }))
  })

/**
 * Get user's rank on leaderboard
 */
export const getUserRankFn = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }): Promise<number | null> => {
    // Get user's best WPM
    const userBestResults = await db
      .select({ bestWpm: sql<number>`MAX(${testResults.wpm})` })
      .from(testResults)
      .where(eq(testResults.userId, userId))

    const userBest = userBestResults[0] as { bestWpm: number } | undefined
    if (!userBest || !userBest.bestWpm) return null

    // Count users with higher best WPM
    const rankResults = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${testResults.userId})` })
      .from(testResults)
      .where(sql`${testResults.wpm} > ${userBest.bestWpm}`)

    const rankResult = rankResults[0] as { count: number } | undefined
    return (rankResult?.count ?? 0) + 1
  })

/**
 * Weak Spot Analysis API
 * Server functions for identifying and tracking user weak spots from test history
 */

import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte } from 'drizzle-orm'

import { db } from '@/db'
import type { KeystrokeEvent, PracticeMode } from '@/db/schema'
import { practiceSessions, testResults } from '@/db/schema'

export interface WeakSpotCharacter {
  /** The character that the user struggles with */
  char: string
  /** Total number of errors on this character */
  errorCount: number
  /** Total number of times this character was typed */
  totalCount: number
  /** Error rate as a percentage (0-100) */
  errorRate: number
  /** Recent trend: 'improving', 'stable', or 'declining' */
  trend: 'improving' | 'stable' | 'declining'
}

export interface WeakSpotAnalysis {
  /** Top weak characters sorted by error count */
  weakCharacters: Array<WeakSpotCharacter>
  /** Total tests analyzed */
  testCount: number
  /** Overall error rate */
  overallErrorRate: number
  /** Characters that have improved (error rate decreased) since last analysis */
  improvedCharacters: Array<string>
  /** Characters that need more practice (error rate increased or stayed high) */
  needsPracticeCharacters: Array<string>
}

export interface CharacterProgress {
  /** The character */
  char: string
  /** History of accuracy percentages (most recent last) */
  accuracyHistory: Array<number>
  /** Current accuracy percentage */
  currentAccuracy: number
  /** Average accuracy over all sessions */
  averageAccuracy: number
  /** Number of practice sessions on this character */
  sessionCount: number
  /** Whether this character is considered "mastered" (>90% accuracy consistently) */
  isMastered: boolean
}

export interface WeakSpotProgress {
  /** Progress per character */
  characterProgress: Array<CharacterProgress>
  /** Overall improvement percentage */
  overallImprovement: number
  /** Total weak spot practice sessions */
  totalSessions: number
  /** Characters that were mastered */
  masteredCharacters: Array<string>
  /** Characters still needing work */
  inProgressCharacters: Array<string>
}

/**
 * Analyze keystroke data to extract character error statistics
 */
function analyzeKeystrokesForWeakSpots(
  keystrokeData: KeystrokeEvent[]
): Map<string, { errorCount: number; totalCount: number }> {
  const characterStats = new Map<string, { errorCount: number; totalCount: number }>()

  for (const keystroke of keystrokeData) {
    if (keystroke.type === 'backspace') continue

    const char = keystroke.expected
    // Skip whitespace for weak spot analysis
    if (char === ' ' || char === '\n' || char === '\t') continue

    if (!characterStats.has(char)) {
      characterStats.set(char, { errorCount: 0, totalCount: 0 })
    }
    const stats = characterStats.get(char)!
    stats.totalCount++
    if (!keystroke.isCorrect) {
      stats.errorCount++
    }
  }

  return characterStats
}

/**
 * Get weak spots from user's test history
 */
export const getWeakSpotsFromHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number; daysBack?: number }) => data)
  .handler(async ({ data }): Promise<WeakSpotAnalysis> => {
    const { userId, limit = 6, daysBack = 30 } = data

    // Calculate date cutoff
    const dateCutoff = new Date()
    dateCutoff.setDate(dateCutoff.getDate() - daysBack)

    // Fetch recent test results with keystroke data
    const results = await db
      .select({
        keystrokeData: testResults.keystrokeData,
        completedAt: testResults.completedAt,
      })
      .from(testResults)
      .where(
        and(
          eq(testResults.userId, userId),
          gte(testResults.completedAt, dateCutoff)
        )
      )
      .orderBy(desc(testResults.completedAt))

    // Aggregate character errors across all tests
    const aggregatedStats = new Map<string, { errorCount: number; totalCount: number; recentErrors: Array<number> }>()

    let testCount = 0
    let totalErrors = 0
    let totalChars = 0

    // Process each test result
    for (const result of results) {
      if (!result.keystrokeData || result.keystrokeData.length === 0) continue

      testCount++
      const charStats = analyzeKeystrokesForWeakSpots(result.keystrokeData)

      for (const [char, stats] of charStats) {
        if (!aggregatedStats.has(char)) {
          aggregatedStats.set(char, { errorCount: 0, totalCount: 0, recentErrors: [] })
        }
        const agg = aggregatedStats.get(char)!
        agg.errorCount += stats.errorCount
        agg.totalCount += stats.totalCount
        // Track recent error rate for trend calculation
        if (stats.totalCount > 0) {
          agg.recentErrors.push((stats.errorCount / stats.totalCount) * 100)
        }
        totalErrors += stats.errorCount
        totalChars += stats.totalCount
      }
    }

    // Convert to array and calculate metrics
    const weakCharacters: Array<WeakSpotCharacter> = []

    for (const [char, stats] of aggregatedStats) {
      if (stats.totalCount < 5) continue // Need minimum sample size

      const errorRate = Math.round((stats.errorCount / stats.totalCount) * 100)

      // Calculate trend from recent errors
      let trend: 'improving' | 'stable' | 'declining' = 'stable'
      if (stats.recentErrors.length >= 3) {
        const recentHalf = stats.recentErrors.slice(-Math.ceil(stats.recentErrors.length / 2))
        const olderHalf = stats.recentErrors.slice(0, Math.floor(stats.recentErrors.length / 2))

        if (olderHalf.length > 0 && recentHalf.length > 0) {
          const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length
          const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length

          if (recentAvg < olderAvg - 5) {
            trend = 'improving'
          } else if (recentAvg > olderAvg + 5) {
            trend = 'declining'
          }
        }
      }

      weakCharacters.push({
        char,
        errorCount: stats.errorCount,
        totalCount: stats.totalCount,
        errorRate,
        trend,
      })
    }

    // Sort by error count (most errors first) and take top N
    weakCharacters.sort((a, b) => b.errorCount - a.errorCount)
    const topWeakCharacters = weakCharacters.slice(0, limit)

    // Identify improved and needs-practice characters
    const improvedCharacters = topWeakCharacters
      .filter((c) => c.trend === 'improving')
      .map((c) => c.char)

    const needsPracticeCharacters = topWeakCharacters
      .filter((c) => c.trend !== 'improving' && c.errorRate > 10)
      .map((c) => c.char)

    const overallErrorRate = totalChars > 0 ? Math.round((totalErrors / totalChars) * 100) : 0

    return {
      weakCharacters: topWeakCharacters,
      testCount,
      overallErrorRate,
      improvedCharacters,
      needsPracticeCharacters,
    }
  })

/**
 * Get progress data for weak spot practice sessions
 */
export const getWeakSpotProgressFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; daysBack?: number }) => data)
  .handler(async ({ data }): Promise<WeakSpotProgress> => {
    const { userId, daysBack = 90 } = data

    // Calculate date cutoff
    const dateCutoff = new Date()
    dateCutoff.setDate(dateCutoff.getDate() - daysBack)

    // Fetch weak-spot practice sessions
    const sessions = await db
      .select({
        id: practiceSessions.id,
        targetCharacters: practiceSessions.targetCharacters,
        accuracy: practiceSessions.accuracy,
        completedAt: practiceSessions.completedAt,
      })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          eq(practiceSessions.mode, 'weak-spots' as PracticeMode),
          gte(practiceSessions.completedAt, dateCutoff)
        )
      )
      .orderBy(practiceSessions.completedAt)

    // Track progress per character
    const charProgress = new Map<string, { accuracyHistory: Array<number>; sessionCount: number }>()

    for (const session of sessions) {
      if (!session.targetCharacters) continue

      try {
        const chars = JSON.parse(session.targetCharacters) as Array<string>
        // Distribute the session accuracy to each character (simplified model)
        for (const char of chars) {
          if (!charProgress.has(char)) {
            charProgress.set(char, { accuracyHistory: [], sessionCount: 0 })
          }
          const progress = charProgress.get(char)!
          progress.accuracyHistory.push(session.accuracy)
          progress.sessionCount++
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Convert to array with metrics
    const characterProgress: Array<CharacterProgress> = []
    const masteredCharacters: Array<string> = []
    const inProgressCharacters: Array<string> = []

    for (const [char, progress] of charProgress) {
      const currentAccuracy = progress.accuracyHistory.length > 0
        ? progress.accuracyHistory[progress.accuracyHistory.length - 1]
        : 0
      const averageAccuracy = progress.accuracyHistory.length > 0
        ? Math.round(progress.accuracyHistory.reduce((a, b) => a + b, 0) / progress.accuracyHistory.length)
        : 0

      // Consider "mastered" if recent accuracy is consistently > 90%
      const recentSessions = progress.accuracyHistory.slice(-3)
      const isMastered = recentSessions.length >= 2 && recentSessions.every((acc) => acc >= 90)

      if (isMastered) {
        masteredCharacters.push(char)
      } else {
        inProgressCharacters.push(char)
      }

      characterProgress.push({
        char,
        accuracyHistory: progress.accuracyHistory,
        currentAccuracy,
        averageAccuracy,
        sessionCount: progress.sessionCount,
        isMastered,
      })
    }

    // Sort by session count (most practiced first)
    characterProgress.sort((a, b) => b.sessionCount - a.sessionCount)

    // Calculate overall improvement
    let overallImprovement = 0
    if (characterProgress.length > 0) {
      const improvementScores = characterProgress.map((cp) => {
        if (cp.accuracyHistory.length < 2) return 0
        const first = cp.accuracyHistory[0]
        const last = cp.accuracyHistory[cp.accuracyHistory.length - 1]
        return last - first
      })
      overallImprovement = Math.round(
        improvementScores.reduce((a, b) => a + b, 0) / improvementScores.length
      )
    }

    return {
      characterProgress,
      overallImprovement,
      totalSessions: sessions.length,
      masteredCharacters,
      inProgressCharacters,
    }
  })

/**
 * Get combined weak spot data (history analysis + progress)
 */
export const getWeakSpotDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ analysis: WeakSpotAnalysis; progress: WeakSpotProgress }> => {
    const [analysis, progress] = await Promise.all([
      getWeakSpotsFromHistoryFn({ data: { userId: data.userId } }),
      getWeakSpotProgressFn({ data: { userId: data.userId } }),
    ])

    return { analysis, progress }
  })

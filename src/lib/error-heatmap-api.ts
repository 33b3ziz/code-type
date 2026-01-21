/**
 * Error Heatmap API
 * Server functions for fetching and aggregating error heatmap data
 */

import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/db'
import type { KeystrokeEvent, Language } from '@/db/schema'
import { snippets, testResults } from '@/db/schema'

export type TimePeriod = 'today' | 'week' | 'month' | 'all'

export interface CharacterErrorData {
  char: string
  errorCount: number
  totalCount: number
  errorRate: number
}

export interface CharacterCombinationError {
  /** The character pair that caused errors (prev + current) */
  combination: string
  /** First character in the sequence */
  prevChar: string
  /** Second character where the error occurred */
  currentChar: string
  /** Number of errors on this combination */
  errorCount: number
  /** Total times this combination was typed */
  totalCount: number
  /** Error rate as a percentage */
  errorRate: number
}

export interface AggregatedErrorHeatmapData {
  characterErrors: Array<CharacterErrorData>
  topErrors: Array<CharacterErrorData>
  combinationErrors: Array<CharacterCombinationError>
  totalErrors: number
  totalCharacters: number
  overallErrorRate: number
  testCount: number
  /** Breakdown by language if multiple languages are included */
  languageBreakdown?: Record<string, { errorCount: number; totalCount: number }>
}

export interface ErrorHeatmapFilters {
  userId: string
  language?: Language | 'all'
  timePeriod?: TimePeriod
}

/**
 * Get the date cutoff for a time period
 */
function getDateCutoff(period: TimePeriod): Date | null {
  const now = new Date()
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo
    case 'all':
    default:
      return null
  }
}

/**
 * Analyze keystroke data to extract character errors and combinations
 */
function analyzeKeystrokeData(keystrokeData: KeystrokeEvent[]): {
  characterErrors: Map<string, { errorCount: number; totalCount: number }>
  combinationErrors: Map<string, { errorCount: number; totalCount: number; prevChar: string; currentChar: string }>
} {
  const characterErrors = new Map<string, { errorCount: number; totalCount: number }>()
  const combinationErrors = new Map<string, { errorCount: number; totalCount: number; prevChar: string; currentChar: string }>()

  let prevKeystroke: KeystrokeEvent | null = null

  for (const keystroke of keystrokeData) {
    if (keystroke.type === 'backspace') {
      prevKeystroke = null
      continue
    }

    const char = keystroke.expected.toLowerCase()

    // Track individual character errors
    if (!characterErrors.has(char)) {
      characterErrors.set(char, { errorCount: 0, totalCount: 0 })
    }
    const charEntry = characterErrors.get(char)!
    charEntry.totalCount++
    if (!keystroke.isCorrect) {
      charEntry.errorCount++
    }

    // Track combination errors (character pairs)
    if (prevKeystroke && prevKeystroke.type === 'char') {
      const prevChar = prevKeystroke.expected.toLowerCase()
      const combination = `${prevChar}${char}`

      if (!combinationErrors.has(combination)) {
        combinationErrors.set(combination, {
          errorCount: 0,
          totalCount: 0,
          prevChar,
          currentChar: char,
        })
      }
      const combEntry = combinationErrors.get(combination)!
      combEntry.totalCount++
      if (!keystroke.isCorrect) {
        combEntry.errorCount++
      }
    }

    prevKeystroke = keystroke
  }

  return { characterErrors, combinationErrors }
}

/**
 * Get aggregated error heatmap data for a user with filtering
 */
export const getErrorHeatmapDataFn = createServerFn({ method: 'GET' })
  .inputValidator((data: ErrorHeatmapFilters) => data)
  .handler(async ({ data }): Promise<AggregatedErrorHeatmapData> => {
    const { userId, language = 'all', timePeriod = 'all' } = data
    const dateCutoff = getDateCutoff(timePeriod)

    // Build query conditions
    const conditions = [eq(testResults.userId, userId)]
    if (dateCutoff) {
      conditions.push(gte(testResults.completedAt, dateCutoff))
    }
    if (language !== 'all') {
      conditions.push(eq(snippets.language, language))
    }

    // Fetch test results with keystroke data
    const results = await db
      .select({
        keystrokeData: testResults.keystrokeData,
        language: snippets.language,
      })
      .from(testResults)
      .leftJoin(snippets, eq(testResults.snippetId, snippets.id))
      .where(and(...conditions))
      .orderBy(desc(testResults.completedAt))

    // Aggregate data
    const aggregatedCharErrors = new Map<string, { errorCount: number; totalCount: number }>()
    const aggregatedCombErrors = new Map<string, { errorCount: number; totalCount: number; prevChar: string; currentChar: string }>()
    const languageBreakdown: Record<string, { errorCount: number; totalCount: number }> = {}

    let testCount = 0

    for (const result of results) {
      if (!result.keystrokeData || result.keystrokeData.length === 0) continue

      testCount++
      const { characterErrors, combinationErrors } = analyzeKeystrokeData(result.keystrokeData)

      // Aggregate character errors
      for (const [char, data] of characterErrors) {
        if (!aggregatedCharErrors.has(char)) {
          aggregatedCharErrors.set(char, { errorCount: 0, totalCount: 0 })
        }
        const entry = aggregatedCharErrors.get(char)!
        entry.errorCount += data.errorCount
        entry.totalCount += data.totalCount
      }

      // Aggregate combination errors
      for (const [combo, data] of combinationErrors) {
        if (!aggregatedCombErrors.has(combo)) {
          aggregatedCombErrors.set(combo, {
            errorCount: 0,
            totalCount: 0,
            prevChar: data.prevChar,
            currentChar: data.currentChar,
          })
        }
        const entry = aggregatedCombErrors.get(combo)!
        entry.errorCount += data.errorCount
        entry.totalCount += data.totalCount
      }

      // Track language breakdown
      const lang = result.language || 'unknown'
      if (!languageBreakdown[lang]) {
        languageBreakdown[lang] = { errorCount: 0, totalCount: 0 }
      }
      for (const data of characterErrors.values()) {
        languageBreakdown[lang].errorCount += data.errorCount
        languageBreakdown[lang].totalCount += data.totalCount
      }
    }

    // Convert to arrays and calculate rates
    const characterErrors: CharacterErrorData[] = []
    let totalErrors = 0
    let totalCharacters = 0

    for (const [char, data] of aggregatedCharErrors) {
      const errorRate = data.totalCount > 0 ? Math.round((data.errorCount / data.totalCount) * 100) : 0
      characterErrors.push({
        char,
        errorCount: data.errorCount,
        totalCount: data.totalCount,
        errorRate,
      })
      totalErrors += data.errorCount
      totalCharacters += data.totalCount
    }

    // Sort by error count for top errors
    const topErrors = [...characterErrors]
      .filter((e) => e.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 10)

    // Convert combination errors
    const combinationErrors: CharacterCombinationError[] = []
    for (const [combo, data] of aggregatedCombErrors) {
      if (data.errorCount > 0) {
        const errorRate = data.totalCount > 0 ? Math.round((data.errorCount / data.totalCount) * 100) : 0
        combinationErrors.push({
          combination: combo,
          prevChar: data.prevChar,
          currentChar: data.currentChar,
          errorCount: data.errorCount,
          totalCount: data.totalCount,
          errorRate,
        })
      }
    }

    // Sort combination errors by error count
    combinationErrors.sort((a, b) => b.errorCount - a.errorCount)

    const overallErrorRate = totalCharacters > 0 ? Math.round((totalErrors / totalCharacters) * 100) : 0

    return {
      characterErrors,
      topErrors,
      combinationErrors: combinationErrors.slice(0, 15), // Top 15 problem combinations
      totalErrors,
      totalCharacters,
      overallErrorRate,
      testCount,
      languageBreakdown: Object.keys(languageBreakdown).length > 1 ? languageBreakdown : undefined,
    }
  })

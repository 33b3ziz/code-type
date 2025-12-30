/**
 * Analytics API
 * Functions for calculating user analytics, trends, and per-language statistics
 */

import type { Difficulty, Language, TestResult } from '@/db/schema'

export interface TrendPoint {
  date: string // ISO date string (YYYY-MM-DD)
  value: number
  count: number // Number of tests for this point
}

export interface AccuracyTrend {
  daily: Array<TrendPoint>
  weekly: Array<TrendPoint>
  monthly: Array<TrendPoint>
  overall: {
    current: number
    previous: number
    change: number // Positive = improvement
    trend: 'up' | 'down' | 'stable'
  }
}

export interface WPMTrend {
  daily: Array<TrendPoint>
  weekly: Array<TrendPoint>
  monthly: Array<TrendPoint>
  overall: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down' | 'stable'
  }
}

export interface LanguageStats {
  language: Language
  totalTests: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
  bestAccuracy: number
  totalTimeSpent: number
  lastPlayed: Date | null
  trend: 'up' | 'down' | 'stable'
  recentImprovement: number // WPM change over last 5 tests
}

export interface LanguageBreakdown {
  languages: Array<LanguageStats>
  strongest: Language | null
  needsWork: Language | null
  mostPracticed: Language | null
}

export interface DifficultyStats {
  difficulty: Difficulty
  totalTests: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
}

export interface WeaknessArea {
  type: 'symbols' | 'keywords' | 'speed' | 'accuracy' | 'language'
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
  data?: Record<string, number>
}

/**
 * Get results from localStorage
 */
function getResults(userId: string): Array<TestResult> {
  if (typeof window === 'undefined') return []

  const results: Array<TestResult> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  )

  return results
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
}

/**
 * Group results by date (YYYY-MM-DD)
 */
function groupByDate(results: Array<TestResult>): Map<string, Array<TestResult>> {
  const groups = new Map<string, Array<TestResult>>()

  for (const result of results) {
    const date = new Date(result.completedAt).toISOString().split('T')[0]
    const existing = groups.get(date) || []
    existing.push(result)
    groups.set(date, existing)
  }

  return groups
}

/**
 * Group results by week (YYYY-WW)
 */
function groupByWeek(results: Array<TestResult>): Map<string, Array<TestResult>> {
  const groups = new Map<string, Array<TestResult>>()

  for (const result of results) {
    const date = new Date(result.completedAt)
    const year = date.getFullYear()
    const week = getWeekNumber(date)
    const key = `${year}-W${week.toString().padStart(2, '0')}`
    const existing = groups.get(key) || []
    existing.push(result)
    groups.set(key, existing)
  }

  return groups
}

/**
 * Group results by month (YYYY-MM)
 */
function groupByMonth(results: Array<TestResult>): Map<string, Array<TestResult>> {
  const groups = new Map<string, Array<TestResult>>()

  for (const result of results) {
    const date = new Date(result.completedAt)
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    const existing = groups.get(key) || []
    existing.push(result)
    groups.set(key, existing)
  }

  return groups
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Calculate trend points from grouped results
 */
function calculateTrendPoints(
  groups: Map<string, Array<TestResult>>,
  metric: 'accuracy' | 'wpm'
): Array<TrendPoint> {
  const points: Array<TrendPoint> = []

  groups.forEach((results, date) => {
    const values = results.map((r) => (metric === 'accuracy' ? r.accuracy : r.wpm))
    const average = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
    points.push({ date, value: average, count: results.length })
  })

  return points.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate overall trend direction
 */
function calculateTrendDirection(
  recent: number,
  previous: number
): 'up' | 'down' | 'stable' {
  const diff = recent - previous
  if (Math.abs(diff) < 2) return 'stable' // Less than 2% or 2 WPM is considered stable
  return diff > 0 ? 'up' : 'down'
}

/**
 * Get accuracy trend analysis
 */
export async function getAccuracyTrend(userId: string): Promise<AccuracyTrend> {
  const results = getResults(userId)

  if (results.length === 0) {
    return {
      daily: [],
      weekly: [],
      monthly: [],
      overall: { current: 0, previous: 0, change: 0, trend: 'stable' },
    }
  }

  const daily = calculateTrendPoints(groupByDate(results), 'accuracy')
  const weekly = calculateTrendPoints(groupByWeek(results), 'accuracy')
  const monthly = calculateTrendPoints(groupByMonth(results), 'accuracy')

  // Calculate overall trend (last 5 vs previous 5 tests)
  const sorted = [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const recentTests = sorted.slice(0, 5)
  const previousTests = sorted.slice(5, 10)

  const current =
    recentTests.length > 0
      ? Math.round(recentTests.reduce((sum, r) => sum + r.accuracy, 0) / recentTests.length)
      : 0

  const previous =
    previousTests.length > 0
      ? Math.round(previousTests.reduce((sum, r) => sum + r.accuracy, 0) / previousTests.length)
      : current

  return {
    daily,
    weekly,
    monthly,
    overall: {
      current,
      previous,
      change: current - previous,
      trend: calculateTrendDirection(current, previous),
    },
  }
}

/**
 * Get WPM trend analysis
 */
export async function getWPMTrend(userId: string): Promise<WPMTrend> {
  const results = getResults(userId)

  if (results.length === 0) {
    return {
      daily: [],
      weekly: [],
      monthly: [],
      overall: { current: 0, previous: 0, change: 0, trend: 'stable' },
    }
  }

  const daily = calculateTrendPoints(groupByDate(results), 'wpm')
  const weekly = calculateTrendPoints(groupByWeek(results), 'wpm')
  const monthly = calculateTrendPoints(groupByMonth(results), 'wpm')

  // Calculate overall trend
  const sorted = [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const recentTests = sorted.slice(0, 5)
  const previousTests = sorted.slice(5, 10)

  const current =
    recentTests.length > 0
      ? Math.round(recentTests.reduce((sum, r) => sum + r.wpm, 0) / recentTests.length)
      : 0

  const previous =
    previousTests.length > 0
      ? Math.round(previousTests.reduce((sum, r) => sum + r.wpm, 0) / previousTests.length)
      : current

  return {
    daily,
    weekly,
    monthly,
    overall: {
      current,
      previous,
      change: current - previous,
      trend: calculateTrendDirection(current, previous),
    },
  }
}

/**
 * Get per-language statistics
 * Note: In a real app, this would join with snippet data to get language info
 */
export async function getLanguageStats(userId: string): Promise<LanguageBreakdown> {
  const results = getResults(userId)

  // For demo purposes, we'll simulate language data based on snippetId
  // In production, this would join with the snippets table
  const languages: Array<Language> = ['javascript', 'typescript', 'python']
  const languageResults = new Map<Language, Array<TestResult>>()

  // Distribute results across languages based on snippetId
  for (const result of results) {
    const langIndex = result.snippetId % languages.length
    const lang = languages[langIndex]
    const existing = languageResults.get(lang) || []
    existing.push(result)
    languageResults.set(lang, existing)
  }

  const stats: Array<LanguageStats> = []

  for (const lang of languages) {
    const langResults = languageResults.get(lang) || []

    if (langResults.length === 0) {
      stats.push({
        language: lang,
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalTimeSpent: 0,
        lastPlayed: null,
        trend: 'stable',
        recentImprovement: 0,
      })
      continue
    }

    const sorted = [...langResults].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )

    const averageWpm = Math.round(
      langResults.reduce((sum, r) => sum + r.wpm, 0) / langResults.length
    )
    const averageAccuracy = Math.round(
      langResults.reduce((sum, r) => sum + r.accuracy, 0) / langResults.length
    )
    const bestWpm = Math.max(...langResults.map((r) => r.wpm))
    const bestAccuracy = Math.max(...langResults.map((r) => r.accuracy))
    const totalTimeSpent = langResults.reduce((sum, r) => sum + r.duration, 0)
    const lastPlayed = new Date(sorted[0].completedAt)

    // Calculate recent improvement
    const recentAvg =
      sorted.length >= 5
        ? sorted.slice(0, 5).reduce((sum, r) => sum + r.wpm, 0) / 5
        : averageWpm
    const previousAvg =
      sorted.length >= 10
        ? sorted.slice(5, 10).reduce((sum, r) => sum + r.wpm, 0) / 5
        : averageWpm

    const recentImprovement = Math.round(recentAvg - previousAvg)

    stats.push({
      language: lang,
      totalTests: langResults.length,
      averageWpm,
      averageAccuracy,
      bestWpm,
      bestAccuracy,
      totalTimeSpent,
      lastPlayed,
      trend: calculateTrendDirection(recentAvg, previousAvg),
      recentImprovement,
    })
  }

  // Determine strongest, needs work, and most practiced
  const withTests = stats.filter((s) => s.totalTests > 0)
  const strongest =
    withTests.length > 0
      ? withTests.reduce((best, s) => (s.averageWpm > best.averageWpm ? s : best)).language
      : null
  const needsWork =
    withTests.length > 0
      ? withTests.reduce((worst, s) => (s.averageWpm < worst.averageWpm ? s : worst)).language
      : null
  const mostPracticed =
    withTests.length > 0
      ? withTests.reduce((most, s) => (s.totalTests > most.totalTests ? s : most)).language
      : null

  return {
    languages: stats,
    strongest,
    needsWork,
    mostPracticed,
  }
}

/**
 * Get difficulty breakdown stats
 */
export async function getDifficultyStats(userId: string): Promise<Array<DifficultyStats>> {
  const results = getResults(userId)
  const difficulties: Array<Difficulty> = ['beginner', 'intermediate', 'advanced', 'hardcore']
  const difficultyResults = new Map<Difficulty, Array<TestResult>>()

  // Distribute results across difficulties based on snippetId
  for (const result of results) {
    const diffIndex = Math.floor(result.snippetId / 10) % difficulties.length
    const diff = difficulties[diffIndex]
    const existing = difficultyResults.get(diff) || []
    existing.push(result)
    difficultyResults.set(diff, existing)
  }

  return difficulties.map((difficulty) => {
    const diffResults = difficultyResults.get(difficulty) || []

    if (diffResults.length === 0) {
      return {
        difficulty,
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
      }
    }

    return {
      difficulty,
      totalTests: diffResults.length,
      averageWpm: Math.round(
        diffResults.reduce((sum, r) => sum + r.wpm, 0) / diffResults.length
      ),
      averageAccuracy: Math.round(
        diffResults.reduce((sum, r) => sum + r.accuracy, 0) / diffResults.length
      ),
      bestWpm: Math.max(...diffResults.map((r) => r.wpm)),
    }
  })
}

/**
 * Identify user's weaknesses
 */
export async function identifyWeaknesses(userId: string): Promise<Array<WeaknessArea>> {
  const results = getResults(userId)
  const weaknesses: Array<WeaknessArea> = []

  if (results.length < 3) {
    return [
      {
        type: 'accuracy',
        description: 'Not enough data',
        severity: 'low',
        suggestion: 'Complete more tests to get personalized insights',
      },
    ]
  }

  const avgAccuracy =
    results.reduce((sum, r) => sum + r.accuracy, 0) / results.length
  const avgWpm = results.reduce((sum, r) => sum + r.wpm, 0) / results.length

  // Check symbol accuracy
  const symbolResults = results.filter((r) => r.symbolAccuracy !== null)
  if (symbolResults.length > 0) {
    const avgSymbolAccuracy =
      symbolResults.reduce((sum, r) => sum + (r.symbolAccuracy || 0), 0) /
      symbolResults.length

    if (avgSymbolAccuracy < 80) {
      weaknesses.push({
        type: 'symbols',
        description: 'Symbol accuracy needs improvement',
        severity: avgSymbolAccuracy < 60 ? 'high' : 'medium',
        suggestion: 'Practice tests with more symbols like {}, [], (), ->, =>, etc.',
        data: { averageAccuracy: Math.round(avgSymbolAccuracy) },
      })
    }
  }

  // Check keyword accuracy
  const keywordResults = results.filter((r) => r.keywordAccuracy !== null)
  if (keywordResults.length > 0) {
    const avgKeywordAccuracy =
      keywordResults.reduce((sum, r) => sum + (r.keywordAccuracy || 0), 0) /
      keywordResults.length

    if (avgKeywordAccuracy < 85) {
      weaknesses.push({
        type: 'keywords',
        description: 'Keyword accuracy could be better',
        severity: avgKeywordAccuracy < 70 ? 'high' : 'medium',
        suggestion:
          'Focus on common keywords like function, const, return, import, etc.',
        data: { averageAccuracy: Math.round(avgKeywordAccuracy) },
      })
    }
  }

  // Check overall speed
  if (avgWpm < 30) {
    weaknesses.push({
      type: 'speed',
      description: 'Typing speed is below average',
      severity: avgWpm < 20 ? 'high' : 'medium',
      suggestion: 'Practice regularly to build muscle memory for common patterns',
      data: { averageWpm: Math.round(avgWpm) },
    })
  }

  // Check overall accuracy
  if (avgAccuracy < 90) {
    weaknesses.push({
      type: 'accuracy',
      description: 'Overall accuracy needs improvement',
      severity: avgAccuracy < 80 ? 'high' : 'medium',
      suggestion: 'Slow down and focus on accuracy over speed',
      data: { averageAccuracy: Math.round(avgAccuracy) },
    })
  }

  return weaknesses
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: Language): string {
  const names: Record<Language, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
  }
  return names[language] || language
}

/**
 * Get language color for charts
 */
export function getLanguageColor(language: Language): string {
  const colors: Record<Language, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3776ab',
  }
  return colors[language] || '#888888'
}

/**
 * Test Results API
 * Functions for saving and fetching typing test results
 */

import type { Difficulty, KeystrokeEvent, Language, TestResult } from '@/db/schema'

export interface TestResultInput {
  userId: string
  snippetId: number
  wpm: number
  rawWpm: number
  accuracy: number
  symbolAccuracy?: number
  keywordAccuracy?: number
  charactersTyped: number
  correctCharacters: number
  incorrectCharacters: number
  backspaceCount?: number
  duration: number // seconds
  isStrictMode?: boolean
  keystrokeData?: KeystrokeEvent[] // For replay feature
}

export interface TestResultWithDetails extends TestResult {
  snippet?: {
    title: string
    language: Language
    difficulty: Difficulty
  }
}

export interface UserStats {
  totalTests: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
  bestAccuracy: number
  totalTimeSpent: number // seconds
  testsThisWeek: number
  improvement: number // WPM improvement over last 10 tests
}

export interface PersonalBest {
  wpm: number
  accuracy: number
  date: Date
  snippetTitle: string
}

/**
 * Save a test result to the database
 * In a real app, this would call an API endpoint
 */
export async function saveTestResult(result: TestResultInput): Promise<TestResult> {
  // This would be an API call in production
  // For now, return a mock result
  const saved: TestResult = {
    id: Date.now(),
    userId: result.userId,
    snippetId: result.snippetId,
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    symbolAccuracy: result.symbolAccuracy ?? null,
    keywordAccuracy: result.keywordAccuracy ?? null,
    charactersTyped: result.charactersTyped,
    correctCharacters: result.correctCharacters,
    incorrectCharacters: result.incorrectCharacters,
    backspaceCount: result.backspaceCount ?? 0,
    duration: result.duration,
    completedAt: new Date(),
    isStrictMode: result.isStrictMode ?? false,
    keystrokeData: result.keystrokeData ?? null, // For replay feature
  }

  // Store in localStorage for demo purposes
  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('testResults') || '[]')
    existing.push(saved)
    localStorage.setItem('testResults', JSON.stringify(existing))
  }

  return saved
}

/**
 * Get recent test results for a user
 */
export async function getRecentResults(
  userId: string,
  limit: number = 10
): Promise<Array<TestResultWithDetails>> {
  // In production, this would be an API call
  if (typeof window === 'undefined') return []

  const results: Array<TestResult> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  )

  return results
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit)
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  if (typeof window === 'undefined') {
    return getEmptyStats()
  }

  const results: Array<TestResult> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  ).filter((r: TestResult) => r.userId === userId)

  if (results.length === 0) {
    return getEmptyStats()
  }

  const totalTests = results.length
  const averageWpm = Math.round(
    results.reduce((sum, r) => sum + r.wpm, 0) / totalTests
  )
  const averageAccuracy = Math.round(
    results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests
  )
  const bestWpm = Math.max(...results.map((r) => r.wpm))
  const bestAccuracy = Math.max(...results.map((r) => r.accuracy))
  const totalTimeSpent = results.reduce((sum, r) => sum + r.duration, 0)

  // Tests this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const testsThisWeek = results.filter(
    (r) => new Date(r.completedAt) >= weekAgo
  ).length

  // Calculate improvement (compare last 5 tests to previous 5)
  const sortedResults = [...results].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const recentAvg =
    sortedResults.length >= 5
      ? sortedResults.slice(0, 5).reduce((sum, r) => sum + r.wpm, 0) / 5
      : averageWpm
  const previousAvg =
    sortedResults.length >= 10
      ? sortedResults.slice(5, 10).reduce((sum, r) => sum + r.wpm, 0) / 5
      : averageWpm
  const improvement = Math.round(recentAvg - previousAvg)

  return {
    totalTests,
    averageWpm,
    averageAccuracy,
    bestWpm,
    bestAccuracy,
    totalTimeSpent,
    testsThisWeek,
    improvement,
  }
}

/**
 * Get personal best for a specific language/difficulty
 */
export async function getPersonalBest(
  userId: string,
  language?: Language,
  difficulty?: Difficulty
): Promise<PersonalBest | null> {
  if (typeof window === 'undefined') return null

  const results: Array<TestResultWithDetails> = JSON.parse(
    localStorage.getItem('testResults') || '[]'
  ).filter((r: TestResultWithDetails) => {
    if (r.userId !== userId) return false
    if (language && r.snippet?.language !== language) return false
    if (difficulty && r.snippet?.difficulty !== difficulty) return false
    return true
  })

  if (results.length === 0) return null

  const best = results.reduce((best, r) => (r.wpm > best.wpm ? r : best))

  return {
    wpm: best.wpm,
    accuracy: best.accuracy,
    date: new Date(best.completedAt),
    snippetTitle: best.snippet?.title || 'Unknown',
  }
}

/**
 * Check if result beats personal best
 */
export async function checkPersonalBest(
  userId: string,
  wpm: number,
  language?: Language,
  difficulty?: Difficulty
): Promise<{ isNewBest: boolean; previousBest: number | null }> {
  const personalBest = await getPersonalBest(userId, language, difficulty)

  if (!personalBest) {
    return { isNewBest: true, previousBest: null }
  }

  return {
    isNewBest: wpm > personalBest.wpm,
    previousBest: personalBest.wpm,
  }
}

function getEmptyStats(): UserStats {
  return {
    totalTests: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    totalTimeSpent: 0,
    testsThisWeek: 0,
    improvement: 0,
  }
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) return `${minutes}m`
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

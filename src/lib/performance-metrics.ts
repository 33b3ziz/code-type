/**
 * Performance metrics for typing tests
 * Includes keyword accuracy, symbol accuracy, and programming WPM calculations
 */

import type { Language } from '@/db/schema'

// Standard: 5 characters = 1 word
const CHARS_PER_WORD = 5

// Programming keywords by language
export const KEYWORDS: Record<Language, Array<string>> = {
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch',
    'finally', 'throw', 'new', 'this', 'class', 'extends', 'super', 'import',
    'export', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof',
    'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'default', 'try', 'catch',
    'finally', 'throw', 'new', 'this', 'class', 'extends', 'super', 'import',
    'export', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof',
    'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false',
    // TypeScript-specific
    'type', 'interface', 'enum', 'namespace', 'module', 'declare', 'abstract',
    'implements', 'private', 'protected', 'public', 'readonly', 'static',
    'as', 'is', 'keyof', 'infer', 'never', 'unknown', 'any',
  ],
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
    'pass', 'try', 'except', 'finally', 'raise', 'with', 'as', 'import', 'from',
    'class', 'self', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del',
    'in', 'is', 'not', 'and', 'or', 'None', 'True', 'False', 'async', 'await',
  ],
}

// Common programming symbols
export const CODE_SYMBOLS = [
  '{', '}', '[', ']', '(', ')', '<', '>', ';', ':', ',', '.',
  '=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~',
  "'", '"', '`', '@', '#', '$', '?', '\\',
  '=>', '===', '!==', '==', '!=', '>=', '<=', '&&', '||',
  '++', '--', '+=', '-=', '*=', '/=', '??', '?.',
]

// Single character symbols for per-char matching
export const SINGLE_CHAR_SYMBOLS = new Set([
  '{', '}', '[', ']', '(', ')', '<', '>', ';', ':', ',', '.',
  '=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~',
  "'", '"', '`', '@', '#', '$', '?', '\\',
])

export interface KeywordMatch {
  keyword: string
  startIndex: number
  endIndex: number
}

export interface AccuracyMetrics {
  overall: number // Overall accuracy percentage
  keywords: number // Keyword accuracy percentage
  symbols: number // Symbol accuracy percentage
  regular: number // Regular character accuracy
  keywordErrors: number
  keywordTotal: number
  symbolErrors: number
  symbolTotal: number
  regularErrors: number
  regularTotal: number
}

export interface WPMMetrics {
  raw: number // Raw WPM (all characters)
  net: number // Net WPM (correct - errors)
  programming: number // Programming WPM (weighted)
}

export interface PerformanceResult {
  wpm: WPMMetrics
  accuracy: AccuracyMetrics
  duration: number // seconds
  totalChars: number
  correctChars: number
  incorrectChars: number
  keywordsTyped: Array<KeywordMatch>
}


/**
 * Consistency metrics measuring typing uniformity
 */
export interface ConsistencyMetrics {
  /** Consistency score from 0-100 (100 = perfectly consistent) */
  score: number
  /** Standard deviation of keystroke intervals in milliseconds */
  standardDeviation: number
  /** Coefficient of variation (lower = more consistent) */
  coefficientOfVariation: number
  /** Average time between keystrokes in milliseconds */
  averageInterval: number
  /** Rating based on consistency score */
  rating: 'excellent' | 'good' | 'average' | 'needs-improvement'
}

/**
 * Percentile ranking compared to historical data
 */
export interface PercentileRanking {
  /** WPM percentile (0-100) */
  wpmPercentile: number
  /** Accuracy percentile (0-100) */
  accuracyPercentile: number
  /** Symbol accuracy percentile (0-100) */
  symbolAccuracyPercentile: number
  /** Keyword accuracy percentile (0-100) */
  keywordAccuracyPercentile: number
  /** Overall combined percentile */
  overallPercentile: number
  /** Total number of historical records compared against */
  sampleSize: number
}

/**
 * Performance trend direction
 */
export type TrendDirection = 'improving' | 'stable' | 'declining'

/**
 * Performance trend analysis against historical data
 */
export interface PerformanceTrend {
  /** WPM trend direction */
  wpmTrend: TrendDirection
  /** WPM change percentage (positive = improvement) */
  wpmChange: number
  /** Accuracy trend direction */
  accuracyTrend: TrendDirection
  /** Accuracy change in percentage points */
  accuracyChange: number
  /** Symbol accuracy trend */
  symbolAccuracyTrend: TrendDirection
  /** Symbol accuracy change in percentage points */
  symbolAccuracyChange: number
  /** Keyword accuracy trend */
  keywordAccuracyTrend: TrendDirection
  /** Keyword accuracy change in percentage points */
  keywordAccuracyChange: number
  /** Consistency trend */
  consistencyTrend: TrendDirection
  /** Consistency change in percentage points */
  consistencyChange: number
  /** Number of recent tests analyzed */
  recentTestCount: number
  /** Number of older tests compared against */
  comparisonTestCount: number
}

/**
 * Historical test result for analysis
 */
export interface HistoricalTestResult {
  wpm: number
  accuracy: number
  symbolAccuracy?: number
  keywordAccuracy?: number
  consistencyScore?: number
  completedAt: Date
}

/**
 * Extended performance result with all metrics
 */
export interface ExtendedPerformanceResult extends PerformanceResult {
  /** Consistency metrics based on keystroke intervals */
  consistency?: ConsistencyMetrics
  /** Percentile ranking against historical data */
  percentileRanking?: PercentileRanking
  /** Performance trend analysis */
  trend?: PerformanceTrend
}

/**
 * Find all keyword occurrences in code
 */
export function findKeywords(code: string, language: Language): Array<KeywordMatch> {
  const keywords = KEYWORDS[language]
  const matches: Array<KeywordMatch> = []

  // Create regex pattern for whole-word matching
  const pattern = new RegExp(
    `\\b(${keywords.map(k => escapeRegex(k)).join('|')})\\b`,
    'g'
  )

  let match
  while ((match = pattern.exec(code)) !== null) {
    matches.push({
      keyword: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return matches
}

/**
 * Check if a character position is part of a keyword
 */
export function isKeywordPosition(
  position: number,
  keywordMatches: Array<KeywordMatch>
): boolean {
  return keywordMatches.some(
    (m) => position >= m.startIndex && position < m.endIndex
  )
}

/**
 * Check if a character is a symbol
 */
export function isSymbol(char: string): boolean {
  return SINGLE_CHAR_SYMBOLS.has(char)
}

/**
 * Calculate accuracy metrics
 */
export function calculateAccuracyMetrics(
  code: string,
  typedText: string,
  errors: Map<number, string>,
  language: Language
): AccuracyMetrics {
  const keywordMatches = findKeywords(code, language)

  let keywordErrors = 0
  let keywordTotal = 0
  let symbolErrors = 0
  let symbolTotal = 0
  let regularErrors = 0
  let regularTotal = 0

  // Count totals and errors for each category
  for (let i = 0; i < Math.min(code.length, typedText.length); i++) {
    const isKeyword = isKeywordPosition(i, keywordMatches)
    const isSymbolChar = isSymbol(code[i])
    const hasError = errors.has(i)

    if (isKeyword) {
      keywordTotal++
      if (hasError) keywordErrors++
    } else if (isSymbolChar) {
      symbolTotal++
      if (hasError) symbolErrors++
    } else {
      regularTotal++
      if (hasError) regularErrors++
    }
  }

  // Calculate percentages
  const totalTyped = keywordTotal + symbolTotal + regularTotal
  const totalErrors = keywordErrors + symbolErrors + regularErrors

  return {
    overall: totalTyped > 0
      ? Math.round(((totalTyped - totalErrors) / totalTyped) * 100)
      : 100,
    keywords: keywordTotal > 0
      ? Math.round(((keywordTotal - keywordErrors) / keywordTotal) * 100)
      : 100,
    symbols: symbolTotal > 0
      ? Math.round(((symbolTotal - symbolErrors) / symbolTotal) * 100)
      : 100,
    regular: regularTotal > 0
      ? Math.round(((regularTotal - regularErrors) / regularTotal) * 100)
      : 100,
    keywordErrors,
    keywordTotal,
    symbolErrors,
    symbolTotal,
    regularErrors,
    regularTotal,
  }
}

/**
 * Calculate WPM metrics
 */
export function calculateWPMMetrics(
  code: string,
  typedText: string,
  errors: Map<number, string>,
  durationSeconds: number,
  language: Language,
  options: {
    keywordWeight?: number // Weight multiplier for keywords (default: 1.5)
    symbolPenalty?: number // Penalty multiplier for symbol errors (default: 2)
    ignoreWhitespace?: boolean // Whether to ignore whitespace in calculations
  } = {}
): WPMMetrics {
  const {
    keywordWeight = 1.5,
    symbolPenalty = 2,
    ignoreWhitespace = false,
  } = options

  if (durationSeconds <= 0) {
    return { raw: 0, net: 0, programming: 0 }
  }

  const minutes = durationSeconds / 60
  const keywordMatches = findKeywords(code, language)

  let charCount = typedText.length
  let correctCount = 0
  let errorCount = 0
  let weightedCorrect = 0
  let weightedPenalty = 0

  for (let i = 0; i < Math.min(code.length, typedText.length); i++) {
    const char = code[i]

    // Skip whitespace if configured
    if (ignoreWhitespace && /\s/.test(char)) {
      charCount--
      continue
    }

    const isKeyword = isKeywordPosition(i, keywordMatches)
    const isSymbolChar = isSymbol(char)
    const hasError = errors.has(i)

    if (hasError) {
      errorCount++
      // Apply symbol penalty
      if (isSymbolChar) {
        weightedPenalty += symbolPenalty
      } else {
        weightedPenalty += 1
      }
    } else {
      correctCount++
      // Apply keyword weight bonus
      if (isKeyword) {
        weightedCorrect += keywordWeight
      } else {
        weightedCorrect += 1
      }
    }
  }

  // Raw WPM: all typed characters
  const rawWpm = Math.round(charCount / CHARS_PER_WORD / minutes)

  // Net WPM: correct - errors
  const netWpm = Math.max(0, Math.round((correctCount - errorCount) / CHARS_PER_WORD / minutes))

  // Programming WPM: weighted calculation
  const programmingScore = weightedCorrect - weightedPenalty
  const programmingWpm = Math.max(0, Math.round(programmingScore / CHARS_PER_WORD / minutes))

  return {
    raw: rawWpm,
    net: netWpm,
    programming: programmingWpm,
  }
}

/**
 * Calculate complete performance metrics
 */
export function calculatePerformance(
  code: string,
  typedText: string,
  errors: Map<number, string>,
  durationSeconds: number,
  language: Language,
  wpmOptions?: Parameters<typeof calculateWPMMetrics>[5]
): PerformanceResult {
  const keywordMatches = findKeywords(code, language)
  const accuracy = calculateAccuracyMetrics(code, typedText, errors, language)
  const wpm = calculateWPMMetrics(code, typedText, errors, durationSeconds, language, wpmOptions)

  const totalTyped = Math.min(code.length, typedText.length)
  const correctChars = totalTyped - errors.size
  const incorrectChars = errors.size

  return {
    wpm,
    accuracy,
    duration: durationSeconds,
    totalChars: code.length,
    correctChars,
    incorrectChars,
    keywordsTyped: keywordMatches.filter(m => m.endIndex <= typedText.length),
  }
}

// Helper function to escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


/**
 * Calculate consistency metrics from keystroke intervals
 * @param keystrokeTimestamps - Array of timestamps for each keystroke
 * @returns Consistency metrics
 */
export function calculateConsistencyMetrics(
  keystrokeTimestamps: number[]
): ConsistencyMetrics {
  if (keystrokeTimestamps.length < 2) {
    return {
      score: 100,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      averageInterval: 0,
      rating: 'excellent',
    }
  }

  // Calculate intervals between keystrokes
  const intervals: number[] = []
  for (let i = 1; i < keystrokeTimestamps.length; i++) {
    const interval = keystrokeTimestamps[i] - keystrokeTimestamps[i - 1]
    // Filter out outliers (pauses > 2 seconds likely indicate thinking/breaks)
    if (interval > 0 && interval < 2000) {
      intervals.push(interval)
    }
  }

  if (intervals.length === 0) {
    return {
      score: 100,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      averageInterval: 0,
      rating: 'excellent',
    }
  }

  // Calculate average interval
  const sum = intervals.reduce((a, b) => a + b, 0)
  const averageInterval = sum / intervals.length

  // Calculate standard deviation
  const squaredDiffs = intervals.map((i) => Math.pow(i - averageInterval, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length
  const standardDeviation = Math.sqrt(variance)

  // Calculate coefficient of variation (CV = std / mean)
  const coefficientOfVariation =
    averageInterval > 0 ? standardDeviation / averageInterval : 0

  // Convert CV to a 0-100 consistency score
  // CV of 0 = 100% consistent, CV of 1 = 0% consistent
  // Using exponential decay for more meaningful scoring
  const score = Math.round(Math.max(0, Math.min(100, 100 * Math.exp(-coefficientOfVariation * 2))))

  // Determine rating based on score
  const rating = getConsistencyRating(score)

  return {
    score,
    standardDeviation: Math.round(standardDeviation),
    coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
    averageInterval: Math.round(averageInterval),
    rating,
  }
}

/**
 * Get consistency rating based on score
 */
function getConsistencyRating(
  score: number
): 'excellent' | 'good' | 'average' | 'needs-improvement' {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'average'
  return 'needs-improvement'
}

/**
 * Calculate percentile ranking against historical data
 * @param currentResult - Current test result metrics
 * @param historicalData - Array of historical test results
 * @returns Percentile ranking
 */
export function calculatePercentileRanking(
  currentResult: {
    wpm: number
    accuracy: number
    symbolAccuracy?: number
    keywordAccuracy?: number
  },
  historicalData: HistoricalTestResult[]
): PercentileRanking {
  if (historicalData.length === 0) {
    return {
      wpmPercentile: 50,
      accuracyPercentile: 50,
      symbolAccuracyPercentile: 50,
      keywordAccuracyPercentile: 50,
      overallPercentile: 50,
      sampleSize: 0,
    }
  }

  const wpmPercentile = calculateSinglePercentile(
    currentResult.wpm,
    historicalData.map((r) => r.wpm)
  )

  const accuracyPercentile = calculateSinglePercentile(
    currentResult.accuracy,
    historicalData.map((r) => r.accuracy)
  )

  const symbolAccuracyValues = historicalData
    .map((r) => r.symbolAccuracy)
    .filter((v): v is number => v !== undefined)
  const symbolAccuracyPercentile =
    symbolAccuracyValues.length > 0 && currentResult.symbolAccuracy !== undefined
      ? calculateSinglePercentile(currentResult.symbolAccuracy, symbolAccuracyValues)
      : 50

  const keywordAccuracyValues = historicalData
    .map((r) => r.keywordAccuracy)
    .filter((v): v is number => v !== undefined)
  const keywordAccuracyPercentile =
    keywordAccuracyValues.length > 0 && currentResult.keywordAccuracy !== undefined
      ? calculateSinglePercentile(currentResult.keywordAccuracy, keywordAccuracyValues)
      : 50

  // Calculate overall percentile as weighted average
  // WPM and accuracy are more important, so they get higher weights
  const overallPercentile = Math.round(
    wpmPercentile * 0.35 +
      accuracyPercentile * 0.35 +
      symbolAccuracyPercentile * 0.15 +
      keywordAccuracyPercentile * 0.15
  )

  return {
    wpmPercentile,
    accuracyPercentile,
    symbolAccuracyPercentile,
    keywordAccuracyPercentile,
    overallPercentile,
    sampleSize: historicalData.length,
  }
}

/**
 * Calculate percentile for a single value in a dataset
 */
function calculateSinglePercentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 50

  const sorted = [...dataset].sort((a, b) => a - b)
  let countBelow = 0

  for (const v of sorted) {
    if (v < value) countBelow++
    else break
  }

  // Include equal values in the count (inclusive percentile)
  const countEqual = sorted.filter((v) => v === value).length
  const percentile = ((countBelow + countEqual * 0.5) / sorted.length) * 100

  return Math.round(Math.min(99, Math.max(1, percentile)))
}

/**
 * Analyze performance trends against historical data
 * @param recentResults - Recent test results (newest first)
 * @param recentCount - Number of recent tests to consider
 * @param comparisonCount - Number of older tests to compare against
 * @returns Performance trend analysis
 */
export function analyzePerformanceTrend(
  historicalResults: HistoricalTestResult[],
  recentCount: number = 5,
  comparisonCount: number = 10
): PerformanceTrend {
  const defaultTrend: PerformanceTrend = {
    wpmTrend: 'stable',
    wpmChange: 0,
    accuracyTrend: 'stable',
    accuracyChange: 0,
    symbolAccuracyTrend: 'stable',
    symbolAccuracyChange: 0,
    keywordAccuracyTrend: 'stable',
    keywordAccuracyChange: 0,
    consistencyTrend: 'stable',
    consistencyChange: 0,
    recentTestCount: 0,
    comparisonTestCount: 0,
  }

  if (historicalResults.length < 2) {
    return defaultTrend
  }

  // Sort by completedAt descending (newest first)
  const sorted = [...historicalResults].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  )

  // Split into recent and comparison groups
  const recent = sorted.slice(0, Math.min(recentCount, sorted.length))
  const comparison = sorted.slice(
    recentCount,
    Math.min(recentCount + comparisonCount, sorted.length)
  )

  if (comparison.length === 0) {
    // Not enough data for comparison, compare first half with second half
    const mid = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, mid)
    const secondHalf = sorted.slice(mid)

    if (firstHalf.length === 0 || secondHalf.length === 0) {
      return defaultTrend
    }

    return calculateTrendFromGroups(firstHalf, secondHalf)
  }

  return calculateTrendFromGroups(recent, comparison)
}

/**
 * Calculate trend from two groups of results
 */
function calculateTrendFromGroups(
  recentGroup: HistoricalTestResult[],
  comparisonGroup: HistoricalTestResult[]
): PerformanceTrend {
  const recentAvg = calculateGroupAverages(recentGroup)
  const comparisonAvg = calculateGroupAverages(comparisonGroup)

  return {
    wpmTrend: getTrendDirection(recentAvg.wpm, comparisonAvg.wpm, 5),
    wpmChange: calculatePercentageChange(comparisonAvg.wpm, recentAvg.wpm),
    accuracyTrend: getTrendDirection(recentAvg.accuracy, comparisonAvg.accuracy, 2),
    accuracyChange: Math.round((recentAvg.accuracy - comparisonAvg.accuracy) * 10) / 10,
    symbolAccuracyTrend: getTrendDirection(
      recentAvg.symbolAccuracy,
      comparisonAvg.symbolAccuracy,
      2
    ),
    symbolAccuracyChange:
      Math.round((recentAvg.symbolAccuracy - comparisonAvg.symbolAccuracy) * 10) / 10,
    keywordAccuracyTrend: getTrendDirection(
      recentAvg.keywordAccuracy,
      comparisonAvg.keywordAccuracy,
      2
    ),
    keywordAccuracyChange:
      Math.round((recentAvg.keywordAccuracy - comparisonAvg.keywordAccuracy) * 10) / 10,
    consistencyTrend: getTrendDirection(
      recentAvg.consistencyScore,
      comparisonAvg.consistencyScore,
      3
    ),
    consistencyChange:
      Math.round((recentAvg.consistencyScore - comparisonAvg.consistencyScore) * 10) / 10,
    recentTestCount: recentGroup.length,
    comparisonTestCount: comparisonGroup.length,
  }
}

/**
 * Calculate average metrics for a group of results
 */
function calculateGroupAverages(results: HistoricalTestResult[]): {
  wpm: number
  accuracy: number
  symbolAccuracy: number
  keywordAccuracy: number
  consistencyScore: number
} {
  if (results.length === 0) {
    return {
      wpm: 0,
      accuracy: 0,
      symbolAccuracy: 0,
      keywordAccuracy: 0,
      consistencyScore: 0,
    }
  }

  const totals = results.reduce(
    (acc, r) => ({
      wpm: acc.wpm + r.wpm,
      accuracy: acc.accuracy + r.accuracy,
      symbolAccuracy: acc.symbolAccuracy + (r.symbolAccuracy ?? r.accuracy),
      keywordAccuracy: acc.keywordAccuracy + (r.keywordAccuracy ?? r.accuracy),
      consistencyScore: acc.consistencyScore + (r.consistencyScore ?? 70),
    }),
    { wpm: 0, accuracy: 0, symbolAccuracy: 0, keywordAccuracy: 0, consistencyScore: 0 }
  )

  return {
    wpm: totals.wpm / results.length,
    accuracy: totals.accuracy / results.length,
    symbolAccuracy: totals.symbolAccuracy / results.length,
    keywordAccuracy: totals.keywordAccuracy / results.length,
    consistencyScore: totals.consistencyScore / results.length,
  }
}

/**
 * Determine trend direction based on change and threshold
 */
function getTrendDirection(
  current: number,
  previous: number,
  threshold: number
): TrendDirection {
  const change = current - previous
  if (change > threshold) return 'improving'
  if (change < -threshold) return 'declining'
  return 'stable'
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return Math.round(((newValue - oldValue) / oldValue) * 1000) / 10
}

/**
 * Calculate extended performance metrics including consistency, percentile, and trend
 * @param code - The code snippet to type
 * @param typedText - What the user typed
 * @param errors - Map of error positions to expected characters
 * @param durationSeconds - Test duration in seconds
 * @param language - Programming language
 * @param keystrokeTimestamps - Optional array of keystroke timestamps
 * @param historicalData - Optional historical test results for comparison
 * @param wpmOptions - Optional WPM calculation options
 */
export function calculateExtendedPerformance(
  code: string,
  typedText: string,
  errors: Map<number, string>,
  durationSeconds: number,
  language: Language,
  keystrokeTimestamps?: number[],
  historicalData?: HistoricalTestResult[],
  wpmOptions?: Parameters<typeof calculateWPMMetrics>[5]
): ExtendedPerformanceResult {
  // Calculate base performance metrics
  const baseResult = calculatePerformance(
    code,
    typedText,
    errors,
    durationSeconds,
    language,
    wpmOptions
  )

  const result: ExtendedPerformanceResult = { ...baseResult }

  // Calculate consistency metrics if timestamps are provided
  if (keystrokeTimestamps && keystrokeTimestamps.length > 0) {
    result.consistency = calculateConsistencyMetrics(keystrokeTimestamps)
  }

  // Calculate percentile ranking if historical data is provided
  if (historicalData && historicalData.length > 0) {
    result.percentileRanking = calculatePercentileRanking(
      {
        wpm: baseResult.wpm.net,
        accuracy: baseResult.accuracy.overall,
        symbolAccuracy: baseResult.accuracy.symbols,
        keywordAccuracy: baseResult.accuracy.keywords,
      },
      historicalData
    )

    // Calculate performance trend
    result.trend = analyzePerformanceTrend(historicalData)
  }

  return result
}

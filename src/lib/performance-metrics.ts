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

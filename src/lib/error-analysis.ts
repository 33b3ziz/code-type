/**
 * Error analysis utilities for typing test results
 * Tracks which characters cause the most errors
 */

export interface CharacterError {
  char: string
  errorCount: number
  totalCount: number
  errorRate: number
}

export interface ErrorHeatmapData {
  characterErrors: Map<string, CharacterError>
  topErrors: CharacterError[]
  totalErrors: number
  totalCharacters: number
  overallErrorRate: number
}

export interface KeyboardRow {
  keys: string[]
}

// Standard QWERTY keyboard layout
export const KEYBOARD_LAYOUT: KeyboardRow[] = [
  { keys: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='] },
  { keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'] },
  { keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"] },
  { keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'] },
  { keys: [' '] }, // Spacebar
]

// Special characters that share keys (shift variants)
export const SHIFT_VARIANTS: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
  '~': '`',
}

/**
 * Normalize a character to its base key (handles shift variants)
 */
export function normalizeCharacter(char: string): string {
  const lower = char.toLowerCase()
  if (SHIFT_VARIANTS[char]) {
    return SHIFT_VARIANTS[char]
  }
  return lower
}

/**
 * Analyze errors from a typing test to build heatmap data
 */
export function analyzeErrors(
  errors: Map<number, string>,
  typedText: string,
  expectedText: string
): ErrorHeatmapData {
  const characterErrors = new Map<string, CharacterError>()

  // Count total occurrences of each character
  for (const char of expectedText) {
    const normalized = normalizeCharacter(char)
    if (!characterErrors.has(normalized)) {
      characterErrors.set(normalized, {
        char: normalized,
        errorCount: 0,
        totalCount: 0,
        errorRate: 0,
      })
    }
    const entry = characterErrors.get(normalized)!
    entry.totalCount++
  }

  // Count errors for each character
  let totalErrors = 0
  errors.forEach((expectedChar, position) => {
    const normalized = normalizeCharacter(expectedChar)
    const entry = characterErrors.get(normalized)
    if (entry) {
      entry.errorCount++
      totalErrors++
    }
  })

  // Calculate error rates
  characterErrors.forEach((entry) => {
    entry.errorRate = entry.totalCount > 0
      ? Math.round((entry.errorCount / entry.totalCount) * 100)
      : 0
  })

  // Get top errors sorted by error count
  const topErrors = Array.from(characterErrors.values())
    .filter((e) => e.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10)

  return {
    characterErrors,
    topErrors,
    totalErrors,
    totalCharacters: expectedText.length,
    overallErrorRate: expectedText.length > 0
      ? Math.round((totalErrors / expectedText.length) * 100)
      : 0,
  }
}

/**
 * Get error intensity for a key (0-100 scale for heatmap coloring)
 */
export function getErrorIntensity(
  key: string,
  heatmapData: ErrorHeatmapData
): number {
  const normalized = normalizeCharacter(key)
  const entry = heatmapData.characterErrors.get(normalized)
  if (!entry || entry.totalCount === 0) return 0
  return entry.errorRate
}

/**
 * Get color for heatmap based on error intensity
 * 0 = green (no errors), 100 = red (all errors)
 */
export function getHeatmapColor(intensity: number): string {
  if (intensity === 0) return 'bg-green-500/20'
  if (intensity <= 10) return 'bg-green-500/40'
  if (intensity <= 25) return 'bg-yellow-500/40'
  if (intensity <= 50) return 'bg-orange-500/40'
  if (intensity <= 75) return 'bg-red-500/40'
  return 'bg-red-500/60'
}

/**
 * Identify weakness categories based on error patterns
 */
export function identifyWeaknesses(heatmapData: ErrorHeatmapData): string[] {
  const weaknesses: string[] = []
  const { topErrors, characterErrors } = heatmapData

  // Check for symbol weakness
  const symbols = [';', "'", '[', ']', '\\', ',', '.', '/', '`', '-', '=']
  const symbolErrors = symbols.reduce((sum, s) => {
    const entry = characterErrors.get(s)
    return sum + (entry?.errorCount ?? 0)
  }, 0)
  if (symbolErrors > 3) {
    weaknesses.push('Symbols and punctuation')
  }

  // Check for number weakness
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  const numberErrors = numbers.reduce((sum, n) => {
    const entry = characterErrors.get(n)
    return sum + (entry?.errorCount ?? 0)
  }, 0)
  if (numberErrors > 2) {
    weaknesses.push('Numbers')
  }

  // Check for specific problem keys
  topErrors.slice(0, 3).forEach((error) => {
    if (error.errorRate > 25) {
      weaknesses.push(`Key "${error.char.toUpperCase()}" (${error.errorRate}% error rate)`)
    }
  })

  // Check for spacing issues
  const spaceEntry = characterErrors.get(' ')
  if (spaceEntry && spaceEntry.errorRate > 10) {
    weaknesses.push('Spacing and rhythm')
  }

  return weaknesses
}

/**
 * Merge multiple heatmap data sets (for aggregate analysis)
 */
export function mergeHeatmapData(datasets: ErrorHeatmapData[]): ErrorHeatmapData {
  const merged = new Map<string, CharacterError>()

  datasets.forEach((data) => {
    data.characterErrors.forEach((entry, key) => {
      if (!merged.has(key)) {
        merged.set(key, {
          char: entry.char,
          errorCount: 0,
          totalCount: 0,
          errorRate: 0,
        })
      }
      const mergedEntry = merged.get(key)!
      mergedEntry.errorCount += entry.errorCount
      mergedEntry.totalCount += entry.totalCount
    })
  })

  // Recalculate error rates
  let totalErrors = 0
  let totalCharacters = 0
  merged.forEach((entry) => {
    entry.errorRate = entry.totalCount > 0
      ? Math.round((entry.errorCount / entry.totalCount) * 100)
      : 0
    totalErrors += entry.errorCount
    totalCharacters += entry.totalCount
  })

  const topErrors = Array.from(merged.values())
    .filter((e) => e.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10)

  return {
    characterErrors: merged,
    topErrors,
    totalErrors,
    totalCharacters,
    overallErrorRate: totalCharacters > 0
      ? Math.round((totalErrors / totalCharacters) * 100)
      : 0,
  }
}

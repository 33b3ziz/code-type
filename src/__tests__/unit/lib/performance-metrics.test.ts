import { describe, it, expect } from 'vitest'
import {
  findKeywords,
  isKeywordPosition,
  isSymbol,
  calculateAccuracyMetrics,
  calculateWPMMetrics,
  calculatePerformance,
  KEYWORDS,
  SINGLE_CHAR_SYMBOLS,
} from '@/lib/performance-metrics'

describe('findKeywords', () => {
  it('finds JavaScript keywords', () => {
    const code = 'const x = 1;'
    const matches = findKeywords(code, 'javascript')

    expect(matches).toHaveLength(1)
    expect(matches[0].keyword).toBe('const')
    expect(matches[0].startIndex).toBe(0)
    expect(matches[0].endIndex).toBe(5)
  })

  it('finds multiple keywords', () => {
    const code = 'function test() { return true; }'
    const matches = findKeywords(code, 'javascript')

    expect(matches).toHaveLength(3)
    expect(matches.map((m) => m.keyword)).toContain('function')
    expect(matches.map((m) => m.keyword)).toContain('return')
    expect(matches.map((m) => m.keyword)).toContain('true')
  })

  it('finds TypeScript-specific keywords', () => {
    const code = 'interface User { name: string }'
    const matches = findKeywords(code, 'typescript')

    expect(matches.some((m) => m.keyword === 'interface')).toBe(true)
  })

  it('finds Python keywords', () => {
    const code = 'def hello(): return None'
    const matches = findKeywords(code, 'python')

    expect(matches.some((m) => m.keyword === 'def')).toBe(true)
    expect(matches.some((m) => m.keyword === 'return')).toBe(true)
    expect(matches.some((m) => m.keyword === 'None')).toBe(true)
  })

  it('only matches whole words', () => {
    const code = 'constant' // Should NOT match 'const'
    const matches = findKeywords(code, 'javascript')

    expect(matches).toHaveLength(0)
  })

  it('returns empty array for no keywords', () => {
    const code = 'x = 1 + 2'
    const matches = findKeywords(code, 'javascript')

    expect(matches).toHaveLength(0)
  })
})

describe('isKeywordPosition', () => {
  it('returns true for positions within keyword', () => {
    const matches = [{ keyword: 'const', startIndex: 0, endIndex: 5 }]

    expect(isKeywordPosition(0, matches)).toBe(true)
    expect(isKeywordPosition(2, matches)).toBe(true)
    expect(isKeywordPosition(4, matches)).toBe(true)
  })

  it('returns false for positions outside keyword', () => {
    const matches = [{ keyword: 'const', startIndex: 0, endIndex: 5 }]

    expect(isKeywordPosition(5, matches)).toBe(false)
    expect(isKeywordPosition(10, matches)).toBe(false)
  })

  it('returns false for empty matches', () => {
    expect(isKeywordPosition(0, [])).toBe(false)
  })
})

describe('isSymbol', () => {
  it('identifies symbols correctly', () => {
    expect(isSymbol('{')).toBe(true)
    expect(isSymbol('}')).toBe(true)
    expect(isSymbol('=')).toBe(true)
    expect(isSymbol(';')).toBe(true)
    expect(isSymbol('(')).toBe(true)
    expect(isSymbol(')')).toBe(true)
  })

  it('returns false for letters', () => {
    expect(isSymbol('a')).toBe(false)
    expect(isSymbol('Z')).toBe(false)
  })

  it('returns false for digits', () => {
    expect(isSymbol('1')).toBe(false)
    expect(isSymbol('9')).toBe(false)
  })

  it('returns false for whitespace', () => {
    expect(isSymbol(' ')).toBe(false)
    expect(isSymbol('\n')).toBe(false)
    expect(isSymbol('\t')).toBe(false)
  })
})

describe('calculateAccuracyMetrics', () => {
  it('returns 100% for no errors', () => {
    const errors = new Map<number, string>()
    const result = calculateAccuracyMetrics(
      'const x = 1;',
      'const x = 1;',
      errors,
      'javascript'
    )

    expect(result.overall).toBe(100)
    expect(result.keywords).toBe(100)
    expect(result.symbols).toBe(100)
    expect(result.regular).toBe(100)
  })

  it('calculates keyword accuracy correctly', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'c') // Error on 'c' of 'const'
    errors.set(1, 'o') // Error on 'o' of 'const'

    const result = calculateAccuracyMetrics(
      'const x = 1;',
      'xxnst x = 1;',
      errors,
      'javascript'
    )

    expect(result.keywordErrors).toBe(2)
    expect(result.keywordTotal).toBe(5) // 'const' has 5 chars
    expect(result.keywords).toBe(60) // 3/5 = 60%
  })

  it('calculates symbol accuracy correctly', () => {
    // 'const x = 1;' -> symbols at positions: 8 (=), 11 (;)
    const errors = new Map<number, string>()
    errors.set(8, '=') // Error on '='

    const result = calculateAccuracyMetrics(
      'const x = 1;',
      'const x x 1;',
      errors,
      'javascript'
    )

    expect(result.symbolErrors).toBe(1)
    expect(result.symbols).toBeLessThan(100)
  })

  it('handles empty input', () => {
    const errors = new Map<number, string>()
    const result = calculateAccuracyMetrics('', '', errors, 'javascript')

    expect(result.overall).toBe(100)
    expect(result.keywords).toBe(100)
  })
})

describe('calculateWPMMetrics', () => {
  it('returns 0 for 0 duration', () => {
    const errors = new Map<number, string>()
    const result = calculateWPMMetrics('hello', 'hello', errors, 0, 'javascript')

    expect(result.raw).toBe(0)
    expect(result.net).toBe(0)
    expect(result.programming).toBe(0)
  })

  it('calculates raw WPM correctly', () => {
    const errors = new Map<number, string>()
    // 50 characters in 1 minute = 10 WPM (50/5/1)
    const code = 'x'.repeat(50)
    const result = calculateWPMMetrics(code, code, errors, 60, 'javascript')

    expect(result.raw).toBe(10)
  })

  it('calculates net WPM with errors', () => {
    const errors = new Map<number, string>()
    // Add 5 errors
    for (let i = 0; i < 5; i++) {
      errors.set(i, 'x')
    }

    // 50 characters - 5 errors = 45 correct, in 1 minute
    // Net WPM = (45 - 5) / 5 / 1 = 8
    const code = 'x'.repeat(50)
    const result = calculateWPMMetrics(code, code, errors, 60, 'javascript')

    expect(result.net).toBe(8)
  })

  it('applies keyword weight bonus', () => {
    const errors = new Map<number, string>()
    const code = 'const x = 1;' // 'const' is a keyword

    const result = calculateWPMMetrics(code, code, errors, 60, 'javascript', {
      keywordWeight: 2, // Double weight for keywords
    })

    // With keyword bonus, programming WPM should be higher than raw
    expect(result.programming).toBeGreaterThanOrEqual(result.raw)
  })

  it('applies symbol penalty', () => {
    const errors = new Map<number, string>()
    errors.set(8, '=') // Error on symbol at position 8

    const code = 'const x = 1;'

    const resultWithPenalty = calculateWPMMetrics(code, code, errors, 60, 'javascript', {
      symbolPenalty: 5, // High penalty for symbol errors
    })

    const resultWithoutPenalty = calculateWPMMetrics(code, code, errors, 60, 'javascript', {
      symbolPenalty: 1, // No extra penalty
    })

    // With higher symbol penalty, programming WPM should be lower
    expect(resultWithPenalty.programming).toBeLessThanOrEqual(resultWithoutPenalty.programming)
  })

  it('ignores whitespace when configured', () => {
    const errors = new Map<number, string>()
    const code = 'a b c d e' // 9 chars, 4 spaces

    const resultWithWhitespace = calculateWPMMetrics(
      code, code, errors, 60, 'javascript',
      { ignoreWhitespace: false }
    )

    const resultWithoutWhitespace = calculateWPMMetrics(
      code, code, errors, 60, 'javascript',
      { ignoreWhitespace: true }
    )

    // Without whitespace, fewer chars = lower WPM
    expect(resultWithoutWhitespace.raw).toBeLessThan(resultWithWhitespace.raw)
  })
})

describe('calculatePerformance', () => {
  it('returns complete performance metrics', () => {
    const errors = new Map<number, string>()
    const code = 'const x = 1;'
    const typed = 'const x = 1;'

    const result = calculatePerformance(code, typed, errors, 60, 'javascript')

    expect(result).toHaveProperty('wpm')
    expect(result).toHaveProperty('accuracy')
    expect(result).toHaveProperty('duration')
    expect(result).toHaveProperty('totalChars')
    expect(result).toHaveProperty('correctChars')
    expect(result).toHaveProperty('incorrectChars')
    expect(result).toHaveProperty('keywordsTyped')
  })

  it('tracks keywords typed', () => {
    const errors = new Map<number, string>()
    const code = 'const x = 1; let y = 2;'
    const typed = code

    const result = calculatePerformance(code, typed, errors, 60, 'javascript')

    expect(result.keywordsTyped.length).toBeGreaterThan(0)
    expect(result.keywordsTyped.map((k) => k.keyword)).toContain('const')
    expect(result.keywordsTyped.map((k) => k.keyword)).toContain('let')
  })

  it('calculates correct and incorrect chars', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'c')
    errors.set(1, 'o')

    const code = 'const'
    const typed = 'xxnst'

    const result = calculatePerformance(code, typed, errors, 60, 'javascript')

    expect(result.incorrectChars).toBe(2)
    expect(result.correctChars).toBe(3)
    expect(result.totalChars).toBe(5)
  })
})

describe('KEYWORDS', () => {
  it('has keywords for all supported languages', () => {
    expect(KEYWORDS.javascript).toBeDefined()
    expect(KEYWORDS.typescript).toBeDefined()
    expect(KEYWORDS.python).toBeDefined()
  })

  it('includes common JavaScript keywords', () => {
    expect(KEYWORDS.javascript).toContain('const')
    expect(KEYWORDS.javascript).toContain('function')
    expect(KEYWORDS.javascript).toContain('return')
  })

  it('TypeScript includes JavaScript keywords plus extras', () => {
    // TypeScript should have everything JavaScript has plus more
    expect(KEYWORDS.typescript).toContain('const')
    expect(KEYWORDS.typescript).toContain('interface')
    expect(KEYWORDS.typescript).toContain('type')
  })

  it('includes common Python keywords', () => {
    expect(KEYWORDS.python).toContain('def')
    expect(KEYWORDS.python).toContain('class')
    expect(KEYWORDS.python).toContain('self')
  })
})

describe('SINGLE_CHAR_SYMBOLS', () => {
  it('includes common code symbols', () => {
    expect(SINGLE_CHAR_SYMBOLS.has('{')).toBe(true)
    expect(SINGLE_CHAR_SYMBOLS.has('}')).toBe(true)
    expect(SINGLE_CHAR_SYMBOLS.has('=')).toBe(true)
    expect(SINGLE_CHAR_SYMBOLS.has(';')).toBe(true)
  })

  it('does not include letters or digits', () => {
    expect(SINGLE_CHAR_SYMBOLS.has('a')).toBe(false)
    expect(SINGLE_CHAR_SYMBOLS.has('1')).toBe(false)
  })
})

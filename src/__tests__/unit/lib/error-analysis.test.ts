import { describe, it, expect } from 'vitest'
import {
  normalizeCharacter,
  analyzeErrors,
  getErrorIntensity,
  getHeatmapColor,
  identifyWeaknesses,
  mergeHeatmapData,
  KEYBOARD_LAYOUT,
  SHIFT_VARIANTS,
} from '@/lib/error-analysis'

describe('normalizeCharacter', () => {
  it('converts uppercase to lowercase', () => {
    expect(normalizeCharacter('A')).toBe('a')
    expect(normalizeCharacter('Z')).toBe('z')
  })

  it('keeps lowercase as-is', () => {
    expect(normalizeCharacter('a')).toBe('a')
    expect(normalizeCharacter('z')).toBe('z')
  })

  it('maps shift variants to base keys', () => {
    expect(normalizeCharacter('!')).toBe('1')
    expect(normalizeCharacter('@')).toBe('2')
    expect(normalizeCharacter('#')).toBe('3')
    expect(normalizeCharacter('?')).toBe('/')
  })

  it('keeps numbers as-is', () => {
    expect(normalizeCharacter('1')).toBe('1')
    expect(normalizeCharacter('9')).toBe('9')
  })

  it('keeps special characters without shift variants', () => {
    expect(normalizeCharacter(' ')).toBe(' ')
  })
})

describe('analyzeErrors', () => {
  it('creates empty heatmap for no errors', () => {
    const errors = new Map<number, string>()
    const result = analyzeErrors(errors, 'hello', 'hello')

    expect(result.totalErrors).toBe(0)
    expect(result.totalCharacters).toBe(5)
    expect(result.overallErrorRate).toBe(0)
    expect(result.topErrors).toHaveLength(0)
  })

  it('tracks character errors correctly', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'h') // Error on first character
    errors.set(2, 'l') // Error on third character

    const result = analyzeErrors(errors, 'xexlo', 'hello')

    expect(result.totalErrors).toBe(2)
    expect(result.topErrors).toHaveLength(2)
  })

  it('calculates error rate correctly', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'a')
    errors.set(1, 'a')

    // Code has 4 'a' characters, 2 errors
    const result = analyzeErrors(errors, 'xxaa', 'aaaa')

    expect(result.totalErrors).toBe(2)
    const aEntry = result.characterErrors.get('a')
    expect(aEntry).toBeDefined()
    expect(aEntry?.errorCount).toBe(2)
    expect(aEntry?.totalCount).toBe(4)
    expect(aEntry?.errorRate).toBe(50) // 2/4 = 50%
  })

  it('handles shift variant normalization', () => {
    const errors = new Map<number, string>()
    errors.set(0, '!')

    const result = analyzeErrors(errors, 'x', '!')

    // '!' normalizes to '1'
    const entry = result.characterErrors.get('1')
    expect(entry).toBeDefined()
    expect(entry?.errorCount).toBe(1)
  })

  it('returns top 10 errors sorted by count', () => {
    const errors = new Map<number, string>()
    // Create many errors on different characters
    for (let i = 0; i < 15; i++) {
      errors.set(i, String.fromCharCode(97 + i)) // a-o
    }

    const expectedText = 'abcdefghijklmno'
    const result = analyzeErrors(errors, 'x'.repeat(15), expectedText)

    expect(result.topErrors.length).toBeLessThanOrEqual(10)
  })
})

describe('getErrorIntensity', () => {
  it('returns 0 for keys with no errors', () => {
    const errors = new Map<number, string>()
    const data = analyzeErrors(errors, 'hello', 'hello')

    expect(getErrorIntensity('h', data)).toBe(0)
  })

  it('returns correct intensity based on error rate', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'a')
    errors.set(1, 'a')

    const data = analyzeErrors(errors, 'xx', 'aa')

    // 2/2 = 100% error rate
    expect(getErrorIntensity('a', data)).toBe(100)
  })

  it('normalizes key before lookup', () => {
    const errors = new Map<number, string>()
    errors.set(0, 'A')

    const data = analyzeErrors(errors, 'x', 'A')

    // Both 'A' and 'a' should work
    expect(getErrorIntensity('A', data)).toBeGreaterThan(0)
    expect(getErrorIntensity('a', data)).toBeGreaterThan(0)
  })
})

describe('getHeatmapColor', () => {
  it('returns green for 0 intensity', () => {
    expect(getHeatmapColor(0)).toBe('bg-green-500/20')
  })

  it('returns green for low intensity', () => {
    expect(getHeatmapColor(5)).toBe('bg-green-500/40')
    expect(getHeatmapColor(10)).toBe('bg-green-500/40')
  })

  it('returns yellow for medium-low intensity', () => {
    expect(getHeatmapColor(15)).toBe('bg-yellow-500/40')
    expect(getHeatmapColor(25)).toBe('bg-yellow-500/40')
  })

  it('returns orange for medium intensity', () => {
    expect(getHeatmapColor(30)).toBe('bg-orange-500/40')
    expect(getHeatmapColor(50)).toBe('bg-orange-500/40')
  })

  it('returns red for high intensity', () => {
    expect(getHeatmapColor(60)).toBe('bg-red-500/40')
    expect(getHeatmapColor(75)).toBe('bg-red-500/40')
  })

  it('returns dark red for very high intensity', () => {
    expect(getHeatmapColor(80)).toBe('bg-red-500/60')
    expect(getHeatmapColor(100)).toBe('bg-red-500/60')
  })
})

describe('identifyWeaknesses', () => {
  it('returns empty array for no errors', () => {
    const errors = new Map<number, string>()
    const data = analyzeErrors(errors, 'hello', 'hello')

    expect(identifyWeaknesses(data)).toHaveLength(0)
  })

  it('identifies symbol weakness', () => {
    const errors = new Map<number, string>()
    errors.set(0, ';')
    errors.set(1, "'")
    errors.set(2, '[')
    errors.set(3, ']')

    const data = analyzeErrors(errors, 'xxxx', ";'[]")
    const weaknesses = identifyWeaknesses(data)

    expect(weaknesses).toContain('Symbols and punctuation')
  })

  it('identifies number weakness', () => {
    const errors = new Map<number, string>()
    errors.set(0, '1')
    errors.set(1, '2')
    errors.set(2, '3')

    const data = analyzeErrors(errors, 'xxx', '123')
    const weaknesses = identifyWeaknesses(data)

    expect(weaknesses).toContain('Numbers')
  })

  it('identifies high error rate keys', () => {
    const errors = new Map<number, string>()
    // 4 errors on 'a' out of 4 = 100% error rate
    errors.set(0, 'a')
    errors.set(1, 'a')
    errors.set(2, 'a')
    errors.set(3, 'a')

    const data = analyzeErrors(errors, 'xxxx', 'aaaa')
    const weaknesses = identifyWeaknesses(data)

    expect(weaknesses.some(w => w.includes('Key "A"'))).toBe(true)
  })
})

describe('mergeHeatmapData', () => {
  it('merges multiple datasets', () => {
    const errors1 = new Map<number, string>()
    errors1.set(0, 'a')
    const data1 = analyzeErrors(errors1, 'x', 'a')

    const errors2 = new Map<number, string>()
    errors2.set(0, 'a')
    const data2 = analyzeErrors(errors2, 'x', 'a')

    const merged = mergeHeatmapData([data1, data2])

    const aEntry = merged.characterErrors.get('a')
    expect(aEntry?.errorCount).toBe(2)
    expect(aEntry?.totalCount).toBe(2)
  })

  it('handles empty datasets', () => {
    const merged = mergeHeatmapData([])

    expect(merged.totalErrors).toBe(0)
    expect(merged.totalCharacters).toBe(0)
    expect(merged.topErrors).toHaveLength(0)
  })

  it('recalculates error rates after merge', () => {
    const errors1 = new Map<number, string>()
    errors1.set(0, 'a')
    const data1 = analyzeErrors(errors1, 'x', 'aa') // 1/2 = 50%

    const errors2 = new Map<number, string>()
    const data2 = analyzeErrors(errors2, 'aa', 'aa') // 0/2 = 0%

    const merged = mergeHeatmapData([data1, data2])

    const aEntry = merged.characterErrors.get('a')
    expect(aEntry?.errorCount).toBe(1)
    expect(aEntry?.totalCount).toBe(4)
    expect(aEntry?.errorRate).toBe(25) // 1/4 = 25%
  })
})

describe('KEYBOARD_LAYOUT', () => {
  it('has 5 rows', () => {
    expect(KEYBOARD_LAYOUT).toHaveLength(5)
  })

  it('includes all letter keys', () => {
    const allKeys = KEYBOARD_LAYOUT.flatMap(row => row.keys)
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(97 + i) // a-z
      expect(allKeys).toContain(letter)
    }
  })

  it('includes spacebar', () => {
    const allKeys = KEYBOARD_LAYOUT.flatMap(row => row.keys)
    expect(allKeys).toContain(' ')
  })

  it('includes number keys', () => {
    const allKeys = KEYBOARD_LAYOUT.flatMap(row => row.keys)
    for (let i = 0; i <= 9; i++) {
      expect(allKeys).toContain(String(i))
    }
  })
})

describe('SHIFT_VARIANTS', () => {
  it('maps common symbols correctly', () => {
    expect(SHIFT_VARIANTS['!']).toBe('1')
    expect(SHIFT_VARIANTS['@']).toBe('2')
    expect(SHIFT_VARIANTS['?']).toBe('/')
    expect(SHIFT_VARIANTS[':']).toBe(';')
  })
})

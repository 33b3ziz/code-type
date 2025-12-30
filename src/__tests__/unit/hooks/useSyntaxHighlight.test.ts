import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { Language } from '@/db/schema'
import { flattenTokensToChars, useSyntaxHighlight } from '@/hooks/useSyntaxHighlight'

describe('useSyntaxHighlight', () => {
  describe('highlighting', () => {
    it('highlights JavaScript code', async () => {
      const code = 'const x = 1;'
      const { result } = renderHook(() => useSyntaxHighlight(code, 'javascript'))

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tokens).toHaveLength(1)
      expect(result.current.tokens[0].tokens.length).toBeGreaterThan(0)
      expect(result.current.error).toBeNull()
    })

    it('highlights TypeScript code', async () => {
      const code = 'const x: number = 1;'
      const { result } = renderHook(() => useSyntaxHighlight(code, 'typescript'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tokens.length).toBeGreaterThan(0)
      expect(result.current.error).toBeNull()
    })

    it('highlights Python code', async () => {
      const code = 'def hello():\n    print("Hello")'
      const { result } = renderHook(() => useSyntaxHighlight(code, 'python'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have 2 lines
      expect(result.current.tokens).toHaveLength(2)
      expect(result.current.error).toBeNull()
    })

    it('assigns line numbers correctly', async () => {
      const code = 'line1\nline2\nline3'
      const { result } = renderHook(() => useSyntaxHighlight(code, 'javascript'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tokens[0].lineNumber).toBe(1)
      expect(result.current.tokens[1].lineNumber).toBe(2)
      expect(result.current.tokens[2].lineNumber).toBe(3)
    })

    it('tokens have color property', async () => {
      const code = 'const x = 1;'
      const { result } = renderHook(() => useSyntaxHighlight(code, 'javascript'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.tokens.forEach((line) => {
        line.tokens.forEach((token) => {
          expect(token.color).toBeDefined()
          expect(token.color).toMatch(/^#[0-9a-fA-F]{6}$/)
        })
      })
    })
  })

  describe('re-highlighting on changes', () => {
    it('re-highlights when code changes', async () => {
      const { result, rerender } = renderHook(
        ({ code, language }) => useSyntaxHighlight(code, language),
        { initialProps: { code: 'const a = 1;', language: 'javascript' as const } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialTokens = result.current.tokens

      rerender({ code: 'let b = 2;', language: 'javascript' as const })

      await waitFor(() => {
        expect(result.current.tokens).not.toEqual(initialTokens)
      })
    })

    it('re-highlights when language changes', async () => {
      const { result, rerender } = renderHook(
        ({ code, language }: { code: string; language: Language }) => useSyntaxHighlight(code, language),
        { initialProps: { code: 'x = 1', language: 'javascript' as Language } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      rerender({ code: 'x = 1', language: 'python' })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
    })
  })
})

describe('flattenTokensToChars', () => {
  it('flattens tokens to character array', () => {
    const tokens = [
      {
        lineNumber: 1,
        tokens: [
          { content: 'const', color: '#ff0000' },
          { content: ' ', color: '#ffffff' },
          { content: 'x', color: '#00ff00' },
        ],
      },
    ]

    const chars = flattenTokensToChars(tokens)

    expect(chars).toHaveLength(7) // 'const x' = 7 chars
    expect(chars[0]).toEqual({ char: 'c', color: '#ff0000' })
    expect(chars[5]).toEqual({ char: ' ', color: '#ffffff' })
    expect(chars[6]).toEqual({ char: 'x', color: '#00ff00' })
  })

  it('adds newlines between lines', () => {
    const tokens = [
      { lineNumber: 1, tokens: [{ content: 'a', color: '#fff' }] },
      { lineNumber: 2, tokens: [{ content: 'b', color: '#fff' }] },
    ]

    const chars = flattenTokensToChars(tokens)

    expect(chars).toHaveLength(3) // 'a\nb'
    expect(chars[1].char).toBe('\n')
  })

  it('does not add newline after last line', () => {
    const tokens = [
      { lineNumber: 1, tokens: [{ content: 'x', color: '#fff' }] },
    ]

    const chars = flattenTokensToChars(tokens)

    expect(chars).toHaveLength(1)
    expect(chars[0].char).toBe('x')
  })

  it('handles empty tokens array', () => {
    const chars = flattenTokensToChars([])
    expect(chars).toEqual([])
  })

  it('preserves color for each character', () => {
    const tokens = [
      {
        lineNumber: 1,
        tokens: [
          { content: 'ab', color: '#111111' },
          { content: 'cd', color: '#222222' },
        ],
      },
    ]

    const chars = flattenTokensToChars(tokens)

    expect(chars[0].color).toBe('#111111')
    expect(chars[1].color).toBe('#111111')
    expect(chars[2].color).toBe('#222222')
    expect(chars[3].color).toBe('#222222')
  })
})

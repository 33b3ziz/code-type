import { useEffect, useState } from 'react'
import {   createHighlighter } from 'shiki'
import type {BundledLanguage, Highlighter} from 'shiki';
import type { Language } from '@/db/schema'

// Map our language types to Shiki language identifiers
const languageMap: Record<Language, BundledLanguage> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
}

export interface HighlightedToken {
  content: string
  color: string
  fontStyle?: 'italic' | 'bold' | 'underline'
}

export interface HighlightedLine {
  tokens: Array<HighlightedToken>
  lineNumber: number
}

let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python'],
    })
  }
  return highlighterPromise
}

export function useSyntaxHighlight(code: string, language: Language) {
  const [tokens, setTokens] = useState<Array<HighlightedLine>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      try {
        setIsLoading(true)
        setError(null)

        const highlighter = await getHighlighter()
        const shikiLang = languageMap[language]

        const result = highlighter.codeToTokens(code, {
          lang: shikiLang,
          theme: 'github-dark',
        })

        if (cancelled) return

        const lines: Array<HighlightedLine> = result.tokens.map((lineTokens, idx) => ({
          lineNumber: idx + 1,
          tokens: lineTokens.map((token) => ({
            content: token.content,
            color: token.color || '#e1e4e8',
            fontStyle: token.fontStyle === 1 ? 'italic' : undefined,
          })),
        }))

        setTokens(lines)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to highlight'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    highlight()

    return () => {
      cancelled = true
    }
  }, [code, language])

  return { tokens, isLoading, error }
}

// Flatten tokens into a character array for the typing test
export function flattenTokensToChars(
  tokens: Array<HighlightedLine>
): Array<{ char: string; color: string }> {
  const chars: Array<{ char: string; color: string }> = []

  tokens.forEach((line, lineIdx) => {
    line.tokens.forEach((token) => {
      for (const char of token.content) {
        chars.push({ char, color: token.color })
      }
    })
    // Add newline after each line except the last
    if (lineIdx < tokens.length - 1) {
      chars.push({ char: '\n', color: '#e1e4e8' })
    }
  })

  return chars
}

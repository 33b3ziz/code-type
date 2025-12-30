import { describe, it, expect } from 'vitest'
import { snippets, type SnippetSeed } from '@/db/seed/snippets'
import type { Language, Difficulty, SnippetCategory } from '@/db/schema'

describe('Code Snippets Seed Data', () => {
  describe('Data integrity', () => {
    it('has a non-empty collection of snippets', () => {
      expect(snippets.length).toBeGreaterThan(0)
    })

    it('each snippet has all required fields', () => {
      snippets.forEach((snippet, index) => {
        expect(snippet.title, `Snippet ${index}: missing title`).toBeTruthy()
        expect(snippet.code, `Snippet ${index}: missing code`).toBeTruthy()
        expect(
          snippet.language,
          `Snippet ${index}: missing language`
        ).toBeTruthy()
        expect(
          snippet.difficulty,
          `Snippet ${index}: missing difficulty`
        ).toBeTruthy()
        expect(
          snippet.category,
          `Snippet ${index}: missing category`
        ).toBeTruthy()
      })
    })

    it('each snippet has non-empty code', () => {
      snippets.forEach((snippet) => {
        expect(snippet.code.trim().length).toBeGreaterThan(0)
      })
    })

    it('each snippet title is unique', () => {
      const titles = snippets.map((s) => s.title)
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length)
    })
  })

  describe('Language coverage', () => {
    const expectedLanguages: Language[] = ['javascript', 'typescript', 'python']

    expectedLanguages.forEach((language) => {
      it(`includes ${language} snippets`, () => {
        const languageSnippets = snippets.filter((s) => s.language === language)
        expect(languageSnippets.length).toBeGreaterThan(0)
      })
    })

    it('only uses valid languages', () => {
      const validLanguages = new Set(expectedLanguages)
      snippets.forEach((snippet) => {
        expect(validLanguages.has(snippet.language)).toBe(true)
      })
    })
  })

  describe('Difficulty coverage', () => {
    const expectedDifficulties: Difficulty[] = [
      'beginner',
      'intermediate',
      'advanced',
      'hardcore',
    ]

    expectedDifficulties.forEach((difficulty) => {
      it(`includes ${difficulty} snippets`, () => {
        const difficultySnippets = snippets.filter(
          (s) => s.difficulty === difficulty
        )
        expect(difficultySnippets.length).toBeGreaterThan(0)
      })
    })

    it('only uses valid difficulties', () => {
      const validDifficulties = new Set(expectedDifficulties)
      snippets.forEach((snippet) => {
        expect(validDifficulties.has(snippet.difficulty)).toBe(true)
      })
    })
  })

  describe('Category coverage', () => {
    const expectedCategories: SnippetCategory[] = [
      'functions',
      'loops',
      'conditionals',
      'react_components',
    ]

    expectedCategories.forEach((category) => {
      it(`includes ${category} snippets`, () => {
        const categorySnippets = snippets.filter((s) => s.category === category)
        expect(categorySnippets.length).toBeGreaterThan(0)
      })
    })

    it('only uses valid categories', () => {
      const validCategories = new Set(expectedCategories)
      snippets.forEach((snippet) => {
        expect(validCategories.has(snippet.category)).toBe(true)
      })
    })
  })

  describe('Cross-coverage', () => {
    it('each language has multiple difficulty levels', () => {
      const languages = ['javascript', 'typescript', 'python'] as const
      languages.forEach((language) => {
        const languageSnippets = snippets.filter((s) => s.language === language)
        const difficulties = new Set(languageSnippets.map((s) => s.difficulty))
        expect(difficulties.size).toBeGreaterThanOrEqual(2)
      })
    })

    it('beginner snippets exist for each language', () => {
      const languages = ['javascript', 'typescript', 'python'] as const
      languages.forEach((language) => {
        const beginnerSnippets = snippets.filter(
          (s) => s.language === language && s.difficulty === 'beginner'
        )
        expect(beginnerSnippets.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Code quality checks', () => {
    it('code does not contain tab characters (uses spaces)', () => {
      snippets.forEach((snippet) => {
        expect(snippet.code.includes('\t')).toBe(false)
      })
    })

    it('code is reasonably sized (not too short or long)', () => {
      snippets.forEach((snippet) => {
        const lines = snippet.code.split('\n')
        expect(lines.length).toBeGreaterThanOrEqual(1)
        expect(lines.length).toBeLessThanOrEqual(50)
      })
    })

    it('TypeScript snippets with React are categorized correctly', () => {
      const reactSnippets = snippets.filter(
        (s) => s.category === 'react_components'
      )
      reactSnippets.forEach((snippet) => {
        expect(snippet.language).toBe('typescript')
      })
    })
  })

  describe('Statistics', () => {
    it('provides good distribution across difficulties', () => {
      const distribution = snippets.reduce(
        (acc, s) => {
          acc[s.difficulty] = (acc[s.difficulty] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      // Each difficulty should have at least 3 snippets
      Object.values(distribution).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(3)
      })
    })

    it('provides good distribution across languages', () => {
      const distribution = snippets.reduce(
        (acc, s) => {
          acc[s.language] = (acc[s.language] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      // Each language should have at least 5 snippets
      Object.values(distribution).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(5)
      })
    })
  })
})

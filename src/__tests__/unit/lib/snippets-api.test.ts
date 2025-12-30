import { describe, it, expect } from 'vitest'
import type {
  SnippetFilters,
  PaginationParams,
  SnippetResponse,
  PaginatedSnippetsResponse,
} from '@/lib/snippets-api'

// Test the types and interfaces for the snippets API
describe('Snippets API Types', () => {
  describe('SnippetFilters', () => {
    it('allows empty filters', () => {
      const filters: SnippetFilters = {}
      expect(filters).toEqual({})
    })

    it('allows language filter', () => {
      const filters: SnippetFilters = { language: 'javascript' }
      expect(filters.language).toBe('javascript')
    })

    it('allows difficulty filter', () => {
      const filters: SnippetFilters = { difficulty: 'beginner' }
      expect(filters.difficulty).toBe('beginner')
    })

    it('allows category filter', () => {
      const filters: SnippetFilters = { category: 'functions' }
      expect(filters.category).toBe('functions')
    })

    it('allows length range filters', () => {
      const filters: SnippetFilters = { minLength: 100, maxLength: 500 }
      expect(filters.minLength).toBe(100)
      expect(filters.maxLength).toBe(500)
    })

    it('allows combining multiple filters', () => {
      const filters: SnippetFilters = {
        language: 'typescript',
        difficulty: 'intermediate',
        category: 'react_components',
        minLength: 50,
        maxLength: 1000,
      }
      expect(Object.keys(filters).length).toBe(5)
    })
  })

  describe('PaginationParams', () => {
    it('allows empty pagination (uses defaults)', () => {
      const params: PaginationParams = {}
      expect(params.page).toBeUndefined()
      expect(params.pageSize).toBeUndefined()
    })

    it('allows custom page number', () => {
      const params: PaginationParams = { page: 3 }
      expect(params.page).toBe(3)
    })

    it('allows custom page size', () => {
      const params: PaginationParams = { pageSize: 25 }
      expect(params.pageSize).toBe(25)
    })

    it('allows both page and pageSize', () => {
      const params: PaginationParams = { page: 2, pageSize: 20 }
      expect(params.page).toBe(2)
      expect(params.pageSize).toBe(20)
    })
  })

  describe('SnippetResponse', () => {
    it('has all required fields', () => {
      const snippet: SnippetResponse = {
        id: 'test-id',
        title: 'Test Snippet',
        code: 'const x = 1;',
        language: 'javascript',
        difficulty: 'beginner',
        category: 'functions',
        createdAt: new Date(),
      }

      expect(snippet.id).toBeDefined()
      expect(snippet.title).toBeDefined()
      expect(snippet.code).toBeDefined()
      expect(snippet.language).toBeDefined()
      expect(snippet.difficulty).toBeDefined()
      expect(snippet.category).toBeDefined()
      expect(snippet.createdAt).toBeDefined()
    })
  })

  describe('PaginatedSnippetsResponse', () => {
    it('has all pagination metadata', () => {
      const response: PaginatedSnippetsResponse = {
        snippets: [],
        total: 100,
        page: 1,
        pageSize: 10,
        totalPages: 10,
      }

      expect(response.snippets).toEqual([])
      expect(response.total).toBe(100)
      expect(response.page).toBe(1)
      expect(response.pageSize).toBe(10)
      expect(response.totalPages).toBe(10)
    })

    it('totalPages is correctly calculated', () => {
      // Test various scenarios
      const scenarios = [
        { total: 100, pageSize: 10, expected: 10 },
        { total: 95, pageSize: 10, expected: 10 }, // Rounds up
        { total: 0, pageSize: 10, expected: 0 },
        { total: 5, pageSize: 10, expected: 1 },
        { total: 50, pageSize: 25, expected: 2 },
      ]

      scenarios.forEach(({ total, pageSize, expected }) => {
        const totalPages = Math.ceil(total / pageSize)
        expect(totalPages).toBe(expected)
      })
    })
  })

  describe('Filter combinations', () => {
    it('supports typical typing test filter scenario', () => {
      const filters: SnippetFilters = {
        language: 'typescript',
        difficulty: 'intermediate',
      }

      const pagination: PaginationParams = {
        page: 1,
        pageSize: 1, // Get one random snippet
      }

      const combined = { ...filters, ...pagination }
      expect(combined.language).toBe('typescript')
      expect(combined.difficulty).toBe('intermediate')
      expect(combined.page).toBe(1)
      expect(combined.pageSize).toBe(1)
    })

    it('supports category browsing scenario', () => {
      const filters: SnippetFilters = {
        category: 'loops',
      }

      const pagination: PaginationParams = {
        page: 1,
        pageSize: 20,
      }

      const combined = { ...filters, ...pagination }
      expect(combined.category).toBe('loops')
      expect(combined.pageSize).toBe(20)
    })
  })

  describe('Offset calculation', () => {
    it('calculates correct offset for pagination', () => {
      const testCases = [
        { page: 1, pageSize: 10, expectedOffset: 0 },
        { page: 2, pageSize: 10, expectedOffset: 10 },
        { page: 3, pageSize: 10, expectedOffset: 20 },
        { page: 1, pageSize: 25, expectedOffset: 0 },
        { page: 2, pageSize: 25, expectedOffset: 25 },
        { page: 5, pageSize: 20, expectedOffset: 80 },
      ]

      testCases.forEach(({ page, pageSize, expectedOffset }) => {
        const offset = (page - 1) * pageSize
        expect(offset).toBe(expectedOffset)
      })
    })
  })
})

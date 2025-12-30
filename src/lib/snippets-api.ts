import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sql } from 'drizzle-orm'
import type {Difficulty, Language, SnippetCategory} from '@/db/schema';
import { db } from '@/db'
import {    snippets } from '@/db/schema'

// Types for API responses
export interface SnippetResponse {
  id: number
  title: string
  code: string
  language: Language
  difficulty: Difficulty
  category: SnippetCategory
  createdAt: Date
}

export interface PaginatedSnippetsResponse {
  snippets: Array<SnippetResponse>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SnippetFilters {
  language?: Language
  difficulty?: Difficulty
  category?: SnippetCategory
  minLength?: number
  maxLength?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Get a random snippet matching the given filters
 */
export const getRandomSnippetFn = createServerFn({ method: 'GET' })
  .inputValidator((data: SnippetFilters) => data)
  .handler(async ({ data }): Promise<SnippetResponse | null> => {
    const conditions = buildFilterConditions(data)

    const results = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        code: snippets.content,
        language: snippets.language,
        difficulty: snippets.difficulty,
        category: snippets.category,
        createdAt: snippets.createdAt,
      })
      .from(snippets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    return results[0] ?? null
  })

/**
 * Get snippets with filtering and pagination
 */
export const getSnippetsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: SnippetFilters & PaginationParams) => data)
  .handler(async ({ data }): Promise<PaginatedSnippetsResponse> => {
    const { page = 1, pageSize = 10, ...filters } = data
    const offset = (page - 1) * pageSize
    const conditions = buildFilterConditions(filters)

    // Get total count
    const countResults = await db
      .select({ total: count() })
      .from(snippets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const total = countResults[0]?.total ?? 0

    // Get paginated snippets
    const results = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        code: snippets.content,
        language: snippets.language,
        difficulty: snippets.difficulty,
        category: snippets.category,
        createdAt: snippets.createdAt,
      })
      .from(snippets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(snippets.createdAt)
      .limit(pageSize)
      .offset(offset)

    return {
      snippets: results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  })

/**
 * Get a specific snippet by ID
 */
export const getSnippetByIdFn = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }): Promise<SnippetResponse | null> => {
    const snippetResults = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        code: snippets.content,
        language: snippets.language,
        difficulty: snippets.difficulty,
        category: snippets.category,
        createdAt: snippets.createdAt,
      })
      .from(snippets)
      .where(eq(snippets.id, id))
      .limit(1)

    return snippetResults[0] ?? null
  })

/**
 * Get available filter options (for populating dropdowns)
 */
export const getSnippetFilterOptionsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  // Get distinct languages with counts
  const languageCounts = await db
    .select({
      language: snippets.language,
      count: count(),
    })
    .from(snippets)
    .groupBy(snippets.language)

  // Get distinct difficulties with counts
  const difficultyCounts = await db
    .select({
      difficulty: snippets.difficulty,
      count: count(),
    })
    .from(snippets)
    .groupBy(snippets.difficulty)

  // Get distinct categories with counts
  const categoryCounts = await db
    .select({
      category: snippets.category,
      count: count(),
    })
    .from(snippets)
    .groupBy(snippets.category)

  // Get code length range
  const lengthStatsResults = await db
    .select({
      minLength: sql<number>`MIN(LENGTH(${snippets.content}))`,
      maxLength: sql<number>`MAX(LENGTH(${snippets.content}))`,
    })
    .from(snippets)

  const lengthStats = lengthStatsResults[0] as { minLength: number; maxLength: number } | undefined
  const minLength = lengthStats ? lengthStats.minLength : 0
  const maxLength = lengthStats ? lengthStats.maxLength : 1000

  return {
    languages: languageCounts.map((l) => ({
      value: l.language,
      count: l.count,
    })),
    difficulties: difficultyCounts.map((d) => ({
      value: d.difficulty,
      count: d.count,
    })),
    categories: categoryCounts.map((c) => ({
      value: c.category,
      count: c.count,
    })),
    lengthRange: {
      min: minLength,
      max: maxLength,
    },
  }
})

/**
 * Get multiple random snippets for a typing session
 */
export const getRandomSnippetsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: SnippetFilters & { count?: number }) => data)
  .handler(async ({ data }): Promise<Array<SnippetResponse>> => {
    const { count: snippetCount = 5, ...filters } = data
    const conditions = buildFilterConditions(filters)

    const results = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        code: snippets.content,
        language: snippets.language,
        difficulty: snippets.difficulty,
        category: snippets.category,
        createdAt: snippets.createdAt,
      })
      .from(snippets)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(snippetCount)

    return results
  })

/**
 * Build SQL conditions from filter object
 */
function buildFilterConditions(filters: SnippetFilters) {
  const conditions = []

  if (filters.language) {
    conditions.push(eq(snippets.language, filters.language))
  }

  if (filters.difficulty) {
    conditions.push(eq(snippets.difficulty, filters.difficulty))
  }

  if (filters.category) {
    conditions.push(eq(snippets.category, filters.category))
  }

  if (filters.minLength !== undefined) {
    conditions.push(sql`LENGTH(${snippets.content}) >= ${filters.minLength}`)
  }

  if (filters.maxLength !== undefined) {
    conditions.push(sql`LENGTH(${snippets.content}) <= ${filters.maxLength}`)
  }

  return conditions
}

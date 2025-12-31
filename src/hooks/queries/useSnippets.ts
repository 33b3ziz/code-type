/**
 * Snippets Query Hook
 * TanStack Query wrapper for snippet-related API calls
 */

import { useQuery } from '@tanstack/react-query'
import type { Difficulty, Language, SnippetCategory } from '@/db/schema'
import type { PaginationParams, SnippetFilters } from '@/lib/snippets-api'
import {
  getRandomSnippetFn,
  getSnippetByIdFn,
  getSnippetFilterOptionsFn,
  getSnippetsFn,
} from '@/lib/snippets-api'

// Query keys for cache management
export const snippetKeys = {
  all: ['snippets'] as const,
  lists: () => [...snippetKeys.all, 'list'] as const,
  list: (filters: SnippetFilters & PaginationParams) =>
    [...snippetKeys.lists(), filters] as const,
  random: (filters: SnippetFilters) =>
    [...snippetKeys.all, 'random', filters] as const,
  details: () => [...snippetKeys.all, 'detail'] as const,
  detail: (id: number) => [...snippetKeys.details(), id] as const,
  filterOptions: () => [...snippetKeys.all, 'filterOptions'] as const,
}

interface UseSnippetsOptions {
  language?: Language
  difficulty?: Difficulty
  category?: SnippetCategory
  minLength?: number
  maxLength?: number
  page?: number
  pageSize?: number
  enabled?: boolean
}

/**
 * Hook to fetch paginated snippets with filters
 */
export function useSnippets(options: UseSnippetsOptions = {}) {
  const { enabled = true, ...filters } = options

  return useQuery({
    queryKey: snippetKeys.list(filters),
    queryFn: () => getSnippetsFn({ data: filters }),
    enabled,
  })
}

interface UseRandomSnippetOptions {
  language?: Language
  difficulty?: Difficulty
  category?: SnippetCategory
  minLength?: number
  maxLength?: number
  enabled?: boolean
}

/**
 * Hook to fetch a random snippet matching filters
 */
export function useRandomSnippet(options: UseRandomSnippetOptions = {}) {
  const { enabled = true, ...filters } = options

  return useQuery({
    queryKey: snippetKeys.random(filters),
    queryFn: () => getRandomSnippetFn({ data: filters }),
    enabled,
    staleTime: 0, // Always fetch fresh for random
  })
}

/**
 * Hook to fetch a specific snippet by ID
 */
export function useSnippet(id: number, enabled = true) {
  return useQuery({
    queryKey: snippetKeys.detail(id),
    queryFn: () => getSnippetByIdFn({ data: { id } }),
    enabled: enabled && id > 0,
  })
}

/**
 * Hook to fetch snippet filter options (languages, difficulties, etc.)
 */
export function useSnippetFilterOptions(enabled = true) {
  return useQuery({
    queryKey: snippetKeys.filterOptions(),
    queryFn: () => getSnippetFilterOptionsFn(),
    enabled,
    staleTime: 1000 * 60 * 10, // Filter options are stable, cache for 10 minutes
  })
}

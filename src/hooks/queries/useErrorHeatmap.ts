/**
 * Error Heatmap Query Hook
 * TanStack Query wrapper for error heatmap data API
 */

import { useQuery } from '@tanstack/react-query'
import type { Language } from '@/db/schema'
import type { TimePeriod } from '@/lib/error-heatmap-api'
import { getErrorHeatmapDataFn } from '@/lib/error-heatmap-api'

// Query keys for cache management
export const errorHeatmapKeys = {
  all: ['errorHeatmap'] as const,
  data: (userId: string, language?: Language | 'all', timePeriod?: TimePeriod) =>
    [...errorHeatmapKeys.all, 'data', userId, language, timePeriod] as const,
}

export interface UseErrorHeatmapOptions {
  language?: Language | 'all'
  timePeriod?: TimePeriod
  enabled?: boolean
}

/**
 * Hook to fetch aggregated error heatmap data with filtering
 */
export function useErrorHeatmap(userId: string, options: UseErrorHeatmapOptions = {}) {
  const { language = 'all', timePeriod = 'all', enabled = true } = options

  return useQuery({
    queryKey: errorHeatmapKeys.data(userId, language, timePeriod),
    queryFn: () => getErrorHeatmapDataFn({ data: { userId, language, timePeriod } }),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

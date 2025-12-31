/**
 * User Stats Query Hook
 * TanStack Query wrapper for user statistics API calls
 */

import { useQuery } from '@tanstack/react-query'
import {
  getRecentResultsFn,
  getUserRankFn,
  getUserStatsFn,
} from '@/lib/profile-api'

// Query keys for cache management
export const userStatsKeys = {
  all: ['userStats'] as const,
  stats: (userId: string) => [...userStatsKeys.all, 'stats', userId] as const,
  recentResults: (userId: string, limit?: number) =>
    [...userStatsKeys.all, 'recent', userId, limit] as const,
  rank: (userId: string) => [...userStatsKeys.all, 'rank', userId] as const,
}

interface UseUserStatsOptions {
  enabled?: boolean
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats(userId: string, options: UseUserStatsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: userStatsKeys.stats(userId),
    queryFn: () => getUserStatsFn({ data: { userId } }),
    enabled: enabled && !!userId,
  })
}

interface UseRecentResultsOptions {
  limit?: number
  enabled?: boolean
}

/**
 * Hook to fetch user's recent test results
 */
export function useRecentResults(
  userId: string,
  options: UseRecentResultsOptions = {}
) {
  const { limit = 10, enabled = true } = options

  return useQuery({
    queryKey: userStatsKeys.recentResults(userId, limit),
    queryFn: () => getRecentResultsFn({ data: { userId, limit } }),
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to fetch user's rank on the leaderboard
 */
export function useUserRank(userId: string, options: UseUserStatsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: userStatsKeys.rank(userId),
    queryFn: () => getUserRankFn({ data: { userId } }),
    enabled: enabled && !!userId,
  })
}

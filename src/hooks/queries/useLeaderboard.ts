/**
 * Leaderboard Query Hook
 * TanStack Query wrapper for leaderboard API calls
 */

import { useQuery } from '@tanstack/react-query'
import type { Difficulty, Language } from '@/db/schema'
import type { LeaderboardFilters, TimeFrame } from '@/lib/leaderboard-api'
import {
  getAllTimeLeaderboard,
  getDailyLeaderboard,
  getLeaderboard,
  getTopUsers,
  getUserRank,
  getWeeklyLeaderboard,
} from '@/lib/leaderboard-api'

// Query keys for cache management
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (filters: LeaderboardFilters) =>
    [...leaderboardKeys.all, 'list', filters] as const,
  daily: (limit?: number) => [...leaderboardKeys.all, 'daily', limit] as const,
  weekly: (limit?: number) => [...leaderboardKeys.all, 'weekly', limit] as const,
  allTime: (limit?: number) =>
    [...leaderboardKeys.all, 'allTime', limit] as const,
  topUsers: (limit?: number) =>
    [...leaderboardKeys.all, 'topUsers', limit] as const,
  userRank: (userId: string, filters?: Partial<LeaderboardFilters>) =>
    [...leaderboardKeys.all, 'userRank', userId, filters] as const,
}

interface UseLeaderboardOptions {
  timeFrame?: TimeFrame
  language?: Language
  difficulty?: Difficulty
  limit?: number
  offset?: number
  enabled?: boolean
}

/**
 * Hook to fetch leaderboard with filters
 */
export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { enabled = true, ...filters } = options
  const leaderboardFilters: LeaderboardFilters = {
    timeFrame: filters.timeFrame ?? 'alltime',
    language: filters.language,
    difficulty: filters.difficulty,
    limit: filters.limit,
    offset: filters.offset,
  }

  return useQuery({
    queryKey: leaderboardKeys.list(leaderboardFilters),
    queryFn: () => getLeaderboard(leaderboardFilters),
    enabled,
  })
}

interface UseDailyLeaderboardOptions {
  limit?: number
  enabled?: boolean
}

/**
 * Hook to fetch daily leaderboard
 */
export function useDailyLeaderboard(options: UseDailyLeaderboardOptions = {}) {
  const { limit = 10, enabled = true } = options

  return useQuery({
    queryKey: leaderboardKeys.daily(limit),
    queryFn: () => getDailyLeaderboard(limit),
    enabled,
    staleTime: 1000 * 60 * 2, // Daily leaderboard updates often, 2 minute cache
  })
}

/**
 * Hook to fetch weekly leaderboard
 */
export function useWeeklyLeaderboard(options: UseDailyLeaderboardOptions = {}) {
  const { limit = 10, enabled = true } = options

  return useQuery({
    queryKey: leaderboardKeys.weekly(limit),
    queryFn: () => getWeeklyLeaderboard(limit),
    enabled,
    staleTime: 1000 * 60 * 5, // Weekly updates less often, 5 minute cache
  })
}

/**
 * Hook to fetch all-time leaderboard
 */
export function useAllTimeLeaderboard(options: UseDailyLeaderboardOptions = {}) {
  const { limit = 10, enabled = true } = options

  return useQuery({
    queryKey: leaderboardKeys.allTime(limit),
    queryFn: () => getAllTimeLeaderboard(limit),
    enabled,
  })
}

/**
 * Hook to fetch top users
 */
export function useTopUsers(options: UseDailyLeaderboardOptions = {}) {
  const { limit = 10, enabled = true } = options

  return useQuery({
    queryKey: leaderboardKeys.topUsers(limit),
    queryFn: () => getTopUsers(limit),
    enabled,
  })
}

interface UseUserRankOptions {
  timeFrame?: TimeFrame
  language?: Language
  difficulty?: Difficulty
  enabled?: boolean
}

/**
 * Hook to fetch a user's rank on the leaderboard
 */
export function useLeaderboardUserRank(
  userId: string,
  options: UseUserRankOptions = {}
) {
  const { enabled = true, ...filters } = options

  return useQuery({
    queryKey: leaderboardKeys.userRank(userId, filters),
    queryFn: () => getUserRank(userId, filters.timeFrame, filters.language),
    enabled: enabled && !!userId,
  })
}

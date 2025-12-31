/**
 * Save Result Mutation Hook
 * TanStack Query mutation for saving test results
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TestResultInput } from '@/lib/results-api'
import { checkPersonalBest, saveTestResult } from '@/lib/results-api'
import { userStatsKeys } from '@/hooks/queries/useUserStats'
import { leaderboardKeys } from '@/hooks/queries/useLeaderboard'

/**
 * Hook to save a test result
 */
export function useSaveResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (result: TestResultInput) => saveTestResult(result),
    onSuccess: (data, variables) => {
      // Invalidate user stats to refetch with new result
      queryClient.invalidateQueries({
        queryKey: userStatsKeys.stats(variables.userId),
      })

      // Invalidate recent results
      queryClient.invalidateQueries({
        queryKey: userStatsKeys.recentResults(variables.userId),
      })

      // Invalidate leaderboard caches
      queryClient.invalidateQueries({
        queryKey: leaderboardKeys.all,
      })
    },
  })
}

interface CheckPersonalBestParams {
  userId: string
  wpm: number
  accuracy: number
}

/**
 * Hook to check if a result is a personal best
 */
export function useCheckPersonalBest() {
  return useMutation({
    mutationFn: ({ userId, wpm, accuracy }: CheckPersonalBestParams) =>
      checkPersonalBest(userId, wpm, accuracy),
  })
}

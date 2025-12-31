/**
 * Settings Query Hook
 * TanStack Query wrapper for user settings API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SettingsUpdate, UserSettings } from '@/lib/settings-api'
import {
  getSettingsFn,
  resetSettingsFn,
  updateSettingsFn,
} from '@/lib/settings-api'

// Query keys for cache management
export const settingsKeys = {
  all: ['settings'] as const,
  current: () => [...settingsKeys.all, 'current'] as const,
}

interface UseSettingsOptions {
  enabled?: boolean
}

/**
 * Hook to fetch current user's settings
 */
export function useSettings(options: UseSettingsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: settingsKeys.current(),
    queryFn: () => getSettingsFn(),
    enabled,
  })
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SettingsUpdate) => updateSettingsFn({ data }),
    onSuccess: () => {
      // Invalidate settings cache to refetch
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

/**
 * Hook to reset user settings to defaults
 */
export function useResetSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetSettingsFn(),
    onSuccess: () => {
      // Invalidate settings cache to refetch
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

/**
 * Hook for optimistic settings updates
 * Updates the cache immediately and reverts on error
 */
export function useOptimisticUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SettingsUpdate) => updateSettingsFn({ data }),
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.current() })

      // Snapshot current value
      const previousSettings = queryClient.getQueryData<UserSettings>(
        settingsKeys.current()
      )

      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.current(), {
          ...previousSettings,
          ...newSettings,
        })
      }

      return { previousSettings }
    },
    onError: (_err, _newSettings, context) => {
      // Revert on error
      if (context?.previousSettings) {
        queryClient.setQueryData(
          settingsKeys.current(),
          context.previousSettings
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() })
    },
  })
}

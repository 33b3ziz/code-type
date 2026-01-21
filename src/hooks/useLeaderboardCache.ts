/**
 * Leaderboard Cache Hook
 * Provides client-side caching for leaderboard data with TanStack Query integration
 */

import { useCallback, useRef } from 'react'
import type { LeaderboardEntry, TimeFrame } from '@/lib/leaderboard-server-api'

interface CacheEntry {
  entries: LeaderboardEntry[]
  total: number
  timestamp: number
  fullyLoaded: boolean
}

// In-memory cache for leaderboard data
// Maps timeFrame -> CacheEntry
const leaderboardCache = new Map<TimeFrame, CacheEntry>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

/**
 * Check if a cache entry is still valid
 */
function isCacheValid(entry: CacheEntry | undefined): entry is CacheEntry {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

/**
 * Hook for managing leaderboard data with caching
 */
export function useLeaderboardCache() {
  const pendingRequests = useRef(new Map<string, Promise<LeaderboardEntry[]>>())

  /**
   * Get cached entries for a timeframe
   */
  const getCachedEntries = useCallback((timeFrame: TimeFrame): CacheEntry | null => {
    const cached = leaderboardCache.get(timeFrame)
    if (isCacheValid(cached)) {
      return cached
    }
    return null
  }, [])

  /**
   * Update cache with new entries
   */
  const updateCache = useCallback((
    timeFrame: TimeFrame,
    entries: LeaderboardEntry[],
    total: number,
    isFullUpdate: boolean = false
  ) => {
    const existing = leaderboardCache.get(timeFrame)

    if (isFullUpdate || !existing || !isCacheValid(existing)) {
      // Full replacement
      leaderboardCache.set(timeFrame, {
        entries,
        total,
        timestamp: Date.now(),
        fullyLoaded: entries.length >= total,
      })
    } else {
      // Merge new entries with existing (for pagination)
      const entryMap = new Map(existing.entries.map(e => [e.userId, e]))
      entries.forEach(e => entryMap.set(e.userId, e))

      // Sort by rank
      const mergedEntries = Array.from(entryMap.values()).sort((a, b) => a.rank - b.rank)

      leaderboardCache.set(timeFrame, {
        entries: mergedEntries,
        total,
        timestamp: existing.timestamp, // Keep original timestamp
        fullyLoaded: mergedEntries.length >= total,
      })
    }
  }, [])

  /**
   * Clear cache for a specific timeframe or all
   */
  const clearCache = useCallback((timeFrame?: TimeFrame) => {
    if (timeFrame) {
      leaderboardCache.delete(timeFrame)
    } else {
      leaderboardCache.clear()
    }
  }, [])

  /**
   * Get entries from a specific offset
   */
  const getEntriesFromOffset = useCallback((
    timeFrame: TimeFrame,
    offset: number,
    limit: number
  ): LeaderboardEntry[] | null => {
    const cached = getCachedEntries(timeFrame)
    if (!cached) return null

    // Check if we have the requested range cached
    if (cached.entries.length >= offset + limit || cached.fullyLoaded) {
      return cached.entries.slice(offset, offset + limit)
    }

    return null
  }, [getCachedEntries])

  /**
   * Deduplicate concurrent requests for the same data
   */
  const deduplicateRequest = useCallback(async <T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> => {
    const existing = pendingRequests.current.get(key)
    if (existing) {
      return existing as Promise<T>
    }

    const promise = request().finally(() => {
      pendingRequests.current.delete(key)
    })

    pendingRequests.current.set(key, promise as Promise<LeaderboardEntry[]>)
    return promise
  }, [])

  return {
    getCachedEntries,
    updateCache,
    clearCache,
    getEntriesFromOffset,
    deduplicateRequest,
  }
}

/**
 * Utility to invalidate leaderboard cache
 * Call this after completing a typing test
 */
export function invalidateLeaderboardCache(timeFrame?: TimeFrame) {
  if (timeFrame) {
    leaderboardCache.delete(timeFrame)
  } else {
    leaderboardCache.clear()
  }
}

/**
 * Get current cache stats (for debugging)
 */
export function getLeaderboardCacheStats() {
  const stats: Record<string, { entries: number; age: number; fullyLoaded: boolean }> = {}

  leaderboardCache.forEach((value, key) => {
    stats[key] = {
      entries: value.entries.length,
      age: Math.round((Date.now() - value.timestamp) / 1000),
      fullyLoaded: value.fullyLoaded,
    }
  })

  return stats
}

export default useLeaderboardCache

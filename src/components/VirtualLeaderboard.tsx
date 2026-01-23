/**
 * Virtual Leaderboard Component
 * Uses @tanstack/react-virtual for efficient rendering of large lists
 * with caching and infinite scroll pagination
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link } from '@tanstack/react-router'
import { Loader2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { LeaderboardEntry, SortBy, TimeFrame } from '@/lib/leaderboard-server-api'
import { getRankMedal } from '@/lib/leaderboard-server-api'

export interface VirtualLeaderboardProps {
  /** Initial entries from server-side load */
  initialEntries: LeaderboardEntry[]
  /** Total count of entries available */
  totalCount: number
  /** Current time frame filter */
  timeFrame: TimeFrame
  /** Time frame label for display */
  timeFrameLabel: string
  /** Currently logged in user ID */
  currentUserId?: string
  /** Function to fetch more entries */
  onLoadMore: (offset: number, limit: number) => Promise<LeaderboardEntry[]>
  /** Page size for pagination */
  pageSize?: number
  /** Row height in pixels */
  rowHeight?: number
  /** Maximum height of the scrollable container */
  maxHeight?: number
  /** Current sort by field */
  sortBy?: SortBy
  className?: string
}

// Cache for leaderboard entries per timeframe
const entryCache = new Map<string, Map<number, LeaderboardEntry>>()

function getCacheKey(timeFrame: TimeFrame): string {
  return timeFrame
}

export function VirtualLeaderboard({
  initialEntries,
  totalCount,
  timeFrame,
  timeFrameLabel,
  currentUserId,
  onLoadMore,
  pageSize = 20,
  rowHeight = 64,
  maxHeight = 600,
  sortBy = 'wpm',
  className,
}: VirtualLeaderboardProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialEntries.length < totalCount)
  const loadingRef = useRef(false)

  // Reset entries when timeFrame changes
  useEffect(() => {
    setEntries(initialEntries)
    setHasMore(initialEntries.length < totalCount)

    // Initialize cache for this timeframe
    const cacheKey = getCacheKey(timeFrame)
    if (!entryCache.has(cacheKey)) {
      entryCache.set(cacheKey, new Map())
    }

    // Cache initial entries
    const cache = entryCache.get(cacheKey)!
    initialEntries.forEach((entry, index) => {
      cache.set(index, entry)
    })
  }, [initialEntries, totalCount, timeFrame])

  // Load more entries with caching
  const loadMoreEntries = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setIsLoading(true)

    try {
      const offset = entries.length
      const cacheKey = getCacheKey(timeFrame)
      const cache = entryCache.get(cacheKey)!

      // Check if we have cached entries
      const cachedEntries: LeaderboardEntry[] = []
      for (let i = offset; i < offset + pageSize && i < totalCount; i++) {
        const cached = cache.get(i)
        if (cached) {
          cachedEntries.push(cached)
        } else {
          break
        }
      }

      let newEntries: LeaderboardEntry[]
      if (cachedEntries.length === pageSize || cachedEntries.length === totalCount - offset) {
        // All entries are cached
        newEntries = cachedEntries
      } else {
        // Fetch from server
        newEntries = await onLoadMore(offset, pageSize)

        // Cache the new entries
        newEntries.forEach((entry, index) => {
          cache.set(offset + index, entry)
        })
      }

      setEntries(prev => [...prev, ...newEntries])
      setHasMore(entries.length + newEntries.length < totalCount)
    } catch (error) {
      console.error('Failed to load more entries:', error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [entries.length, hasMore, onLoadMore, pageSize, timeFrame, totalCount])

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: entries.length + (hasMore ? 1 : 0), // +1 for loading row
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // Render 5 extra items outside viewport
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  // Detect when we need to load more
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return

    // If we're within 5 items of the end, load more
    if (lastItem.index >= entries.length - 5 && hasMore && !loadingRef.current) {
      loadMoreEntries()
    }
  }, [virtualItems, entries.length, hasMore, loadMoreEntries])

  // Memoize the header row with sort highlighting
  const headerRow = useMemo(() => (
    <div className="sticky top-0 z-10 border-b border-slate-700 bg-slate-800/95 backdrop-blur text-gray-400 text-sm">
      <div className="grid grid-cols-[60px_1fr_80px_80px_80px_80px_60px] md:grid-cols-[60px_1fr_80px_80px_80px_80px_60px] items-center py-3 px-4">
        <span className="font-medium">Rank</span>
        <span className="font-medium">User</span>
        <span className={cn("font-medium text-right", sortBy === 'wpm' && "text-cyan-400")}>
          WPM
        </span>
        <span className="font-medium text-right hidden md:block">Avg</span>
        <span className={cn("font-medium text-right hidden md:block", sortBy === 'accuracy' && "text-cyan-400")}>
          Acc
        </span>
        <span className={cn("font-medium text-right hidden lg:block", sortBy === 'consistency' && "text-cyan-400")}>
          Cons
        </span>
        <span className="font-medium text-right hidden sm:block">Tests</span>
      </div>
    </div>
  ), [sortBy])

  if (entries.length === 0 && !isLoading) {
    return (
      <div className={cn("bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", className)}>
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            No results yet for {timeFrameLabel.toLowerCase()}
          </p>
          <Link to="/test">
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              Be the First!
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", className)}>
      {headerRow}

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: Math.min(maxHeight, entries.length * rowHeight + (hasMore ? rowHeight : 0)) }}
        data-testid="virtual-leaderboard-scroll"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= entries.length

            if (isLoaderRow) {
              return (
                <div
                  key="loader"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center justify-center text-gray-400"
                  data-testid="virtual-leaderboard-loader"
                >
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading more...</span>
                </div>
              )
            }

            const entry = entries[virtualRow.index]
            return (
              <VirtualLeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={currentUserId === entry.userId}
                sortBy={sortBy}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Footer with total count */}
      <div className="border-t border-slate-700 px-4 py-2 text-sm text-gray-400 flex justify-between items-center">
        <span>Showing {entries.length} of {totalCount} participants</span>
        {hasMore && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMoreEntries}
            className="text-cyan-400 hover:text-cyan-300"
          >
            Load More
          </Button>
        )}
      </div>
    </div>
  )
}

interface VirtualLeaderboardRowProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  sortBy: SortBy
  style: React.CSSProperties
}

function VirtualLeaderboardRow({ entry, isCurrentUser, sortBy, style }: VirtualLeaderboardRowProps) {
  const medal = getRankMedal(entry.rank)

  // Format consistency - lower is better
  const formatConsistency = (value: number) => {
    if (value === 0) return '-'
    return `\u00B1${value.toFixed(1)}`
  }

  // Get color for consistency - lower is better (more consistent)
  const getConsistencyColor = (value: number) => {
    if (value === 0) return 'text-gray-400'
    if (value <= 5) return 'text-green-400'
    if (value <= 15) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div
      style={style}
      className={cn(
        "grid grid-cols-[60px_1fr_80px_80px_80px_80px_60px] md:grid-cols-[60px_1fr_80px_80px_80px_80px_60px] items-center px-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors",
        isCurrentUser && "bg-cyan-500/10"
      )}
      data-testid={`virtual-row-${entry.rank}`}
      role="row"
      aria-label={`Rank ${entry.rank}: ${entry.username}${isCurrentUser ? ' (you)' : ''}`}
    >
      {/* Rank */}
      <div className="flex items-center" role="cell">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-gray-400 font-mono">#{entry.rank}</span>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-3" role="cell">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
            entry.rank === 1
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : entry.rank === 2
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : entry.rank === 3
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                  : 'bg-gradient-to-br from-slate-500 to-slate-600'
          )}
        >
          {entry.username[0].toUpperCase()}
        </div>
        <span className={cn("font-medium truncate", isCurrentUser ? 'text-cyan-400' : 'text-white')}>
          {entry.username}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-cyan-400">(you)</span>
          )}
        </span>
      </div>

      {/* Best WPM */}
      <div className="text-right" role="cell">
        <span className={cn("font-bold font-mono", sortBy === 'wpm' ? 'text-cyan-400' : 'text-gray-300')}>
          {entry.bestWpm}
        </span>
      </div>

      {/* Avg WPM */}
      <div className="text-right hidden md:block" role="cell">
        <span className="text-gray-300 font-mono">{entry.averageWpm}</span>
      </div>

      {/* Accuracy */}
      <div className="text-right hidden md:block" role="cell">
        <span
          className={cn(
            "font-mono",
            sortBy === 'accuracy'
              ? 'text-cyan-400 font-bold'
              : entry.averageAccuracy >= 95
                ? 'text-green-400'
                : entry.averageAccuracy >= 80
                  ? 'text-yellow-400'
                  : 'text-red-400'
          )}
        >
          {entry.averageAccuracy}%
        </span>
      </div>

      {/* Consistency */}
      <div className="text-right hidden lg:block" role="cell">
        <span
          className={cn(
            "font-mono text-sm",
            sortBy === 'consistency' ? 'text-cyan-400 font-bold' : getConsistencyColor(entry.consistency)
          )}
        >
          {formatConsistency(entry.consistency)}
        </span>
      </div>

      {/* Tests */}
      <div className="text-right hidden sm:block" role="cell">
        <span className="text-gray-400 font-mono">{entry.testsCompleted}</span>
      </div>
    </div>
  )
}

/**
 * Clear the leaderboard cache
 * Call this when data might be stale (e.g., after completing a test)
 */
export function clearLeaderboardCache(timeFrame?: TimeFrame) {
  if (timeFrame) {
    entryCache.delete(getCacheKey(timeFrame))
  } else {
    entryCache.clear()
  }
}

export default VirtualLeaderboard

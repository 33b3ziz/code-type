/**
 * Race History Component
 * Displays a paginated list of user's past multiplayer races
 */

import { useEffect, useMemo, useState } from 'react'

import { Button } from '../ui/button'

import {
  formatRaceDate,
  formatRaceTime,
  getOrdinalPosition,
  getRaceHistory,
  getRaceStats,
  type RaceHistoryEntry,
  type RaceStats,
} from '@/lib/race-history-api'
import { cn } from '@/lib/utils'

export interface RaceHistoryProps {
  pageSize?: number
  onViewDetails?: (raceId: string) => void
  onClose?: () => void
  className?: string
}

export function RaceHistory({
  pageSize = 10,
  onViewDetails,
  onClose,
  className = '',
}: RaceHistoryProps) {
  const [history, setHistory] = useState<Array<RaceHistoryEntry>>([])
  const [stats, setStats] = useState<RaceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      try {
        const [historyData, statsData] = await Promise.all([
          getRaceHistory(100),
          getRaceStats(),
        ])
        setHistory(historyData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load race history:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  // Paginate
  const totalPages = Math.ceil(history.length / pageSize)
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return history.slice(start, start + pageSize)
  }, [history, currentPage, pageSize])

  if (loading) {
    return (
      <div
        className={cn('race-history bg-slate-900 rounded-xl p-6', className)}
        data-testid="race-history-loading"
      >
        <div className="text-center text-gray-400">Loading race history...</div>
      </div>
    )
  }

  return (
    <div
      className={cn('race-history bg-slate-900 rounded-xl p-6', className)}
      data-testid="race-history"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Race History</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.totalRaces > 0 && (
        <div
          className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          data-testid="race-stats"
        >
          <StatCard label="Total Races" value={stats.totalRaces.toString()} />
          <StatCard
            label="Win Rate"
            value={`${stats.winRate}%`}
            highlight={stats.winRate >= 50}
          />
          <StatCard
            label="Best WPM"
            value={stats.bestWpm.toString()}
            className="text-cyan-400"
          />
          <StatCard
            label="Avg Position"
            value={stats.averagePosition.toFixed(1)}
            suffix={getOrdinalSuffix(Math.round(stats.averagePosition))}
          />
        </div>
      )}

      {/* History List */}
      {paginatedHistory.length === 0 ? (
        <div
          className="text-center py-12 text-gray-400"
          data-testid="race-history-empty"
        >
          <div className="text-4xl mb-4">No races yet!</div>
          <p>Join or create a race to start building your history.</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="race-history-list">
          {paginatedHistory.map((race) => (
            <RaceHistoryRow
              key={race.id}
              race={race}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-4 mt-6"
          data-testid="race-history-pagination"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  suffix?: string
  highlight?: boolean
  className?: string
}

function StatCard({ label, value, suffix, highlight, className }: StatCardProps) {
  return (
    <div className="text-center">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p
        className={cn(
          'text-xl font-mono font-bold',
          highlight ? 'text-green-400' : 'text-white',
          className
        )}
      >
        {value}
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </p>
    </div>
  )
}

interface RaceHistoryRowProps {
  race: RaceHistoryEntry
  onViewDetails?: (raceId: string) => void
}

function RaceHistoryRow({ race, onViewDetails }: RaceHistoryRowProps) {
  const isWin = race.position === 1

  // Position colors
  const positionColors: Record<number, string> = {
    1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    2: 'bg-gray-300/20 text-gray-300 border-gray-400/50',
    3: 'bg-amber-600/20 text-amber-500 border-amber-600/50',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-colors',
        isWin
          ? 'bg-yellow-500/5 border-yellow-500/30'
          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
      )}
      data-testid={`race-history-row-${race.id}`}
    >
      {/* Position Badge */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border',
          positionColors[race.position] || 'bg-slate-700 text-gray-400 border-slate-600'
        )}
      >
        {getOrdinalPosition(race.position)}
      </div>

      {/* Race Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium">
            {isWin ? 'Victory!' : `${getOrdinalPosition(race.position)} Place`}
          </span>
          <span className="text-gray-500 text-sm">
            vs {race.totalPlayers - 1} player{race.totalPlayers > 2 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{formatRaceDate(race.completedAt)}</span>
          {race.language && (
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
              {race.language}
            </span>
          )}
          {race.difficulty && (
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
              {race.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-gray-500 text-xs">WPM</p>
          <p className="font-mono font-bold text-cyan-400">{Math.round(race.wpm)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">Accuracy</p>
          <p
            className={cn(
              'font-mono font-bold',
              race.accuracy >= 95
                ? 'text-green-400'
                : race.accuracy >= 85
                  ? 'text-yellow-400'
                  : 'text-red-400'
            )}
          >
            {Math.round(race.accuracy)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">Time</p>
          <p className="font-mono text-gray-300">{formatRaceTime(race.finishTime)}</p>
        </div>
      </div>

      {/* Actions */}
      {onViewDetails && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(race.id)}
          className="text-gray-400 hover:text-cyan-400"
        >
          Details
        </Button>
      )}
    </div>
  )
}

function getOrdinalSuffix(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
}

export default RaceHistory

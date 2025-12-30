/**
 * Leaderboard Display Component
 * Shows ranked users with filters for timeframe, language, and difficulty
 */

import { useState, useEffect } from 'react'
import type { Language, Difficulty } from '@/db/schema'
import {
  getLeaderboard,
  formatRank,
  getRankSuffix,
  type TimeFrame,
  type LeaderboardEntry,
  type LeaderboardFilters,
} from '@/lib/leaderboard-api'

export interface LeaderboardProps {
  currentUserId?: string
  defaultTimeFrame?: TimeFrame
  showFilters?: boolean
  limit?: number
  className?: string
}

export function Leaderboard({
  currentUserId,
  defaultTimeFrame = 'weekly',
  showFilters = true,
  limit = 10,
  className = '',
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeFrame: defaultTimeFrame,
    limit,
  })
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true)
      try {
        const data = await getLeaderboard(filters)
        setEntries(data.entries)

        // Find current user's rank
        if (currentUserId) {
          const currentUserEntry = data.entries.find(e => e.userId === currentUserId)
          setUserRank(currentUserEntry?.rank ?? null)
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboard()
  }, [filters, currentUserId])

  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setFilters({ ...filters, timeFrame })
  }

  if (loading) {
    return (
      <div className={`leaderboard ${className}`} data-testid="leaderboard-loading">
        <div className="leaderboard-loading">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className={`leaderboard ${className}`} data-testid="leaderboard">
      {/* Header */}
      <header className="leaderboard-header">
        <h2 className="leaderboard-title">Leaderboard</h2>
        {userRank && (
          <span className="leaderboard-user-rank" data-testid="user-rank">
            Your Rank: {getRankSuffix(userRank)}
          </span>
        )}
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="leaderboard-filters" data-testid="leaderboard-filters">
          <TimeFrameTabs
            selected={filters.timeFrame}
            onChange={handleTimeFrameChange}
          />
        </div>
      )}

      {/* Leaderboard Table */}
      {entries.length === 0 ? (
        <div className="leaderboard-empty" data-testid="leaderboard-empty">
          <p>No entries yet. Be the first!</p>
        </div>
      ) : (
        <div className="leaderboard-list" data-testid="leaderboard-list">
          {entries.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TimeFrameTabsProps {
  selected: TimeFrame
  onChange: (timeFrame: TimeFrame) => void
}

function TimeFrameTabs({ selected, onChange }: TimeFrameTabsProps) {
  const tabs: { value: TimeFrame; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'alltime', label: 'All Time' },
  ]

  return (
    <div className="timeframe-tabs" role="tablist" data-testid="timeframe-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={selected === tab.value}
          className={`timeframe-tab ${selected === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
          data-testid={`tab-${tab.value}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
}

function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const rankDisplay = formatRank(entry.rank)
  const isTopThree = entry.rank <= 3

  return (
    <div
      className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''} ${isTopThree ? 'top-three' : ''}`}
      data-testid={`leaderboard-row-${entry.rank}`}
    >
      <div className="leaderboard-rank">
        <span className={`rank-badge rank-${entry.rank}`}>
          {rankDisplay}
        </span>
      </div>
      <div className="leaderboard-user">
        <span className="user-avatar">
          {entry.username.charAt(0).toUpperCase()}
        </span>
        <div className="user-info">
          <span className="user-name">
            {entry.username}
            {isCurrentUser && <span className="you-badge">(You)</span>}
          </span>
          <span className="user-meta">
            {entry.testsCompleted} tests
          </span>
        </div>
      </div>
      <div className="leaderboard-stats">
        <div className="stat-item">
          <span className="stat-value">{entry.wpm}</span>
          <span className="stat-label">Best WPM</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{entry.averageWpm}</span>
          <span className="stat-label">Avg WPM</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{entry.accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini leaderboard for homepage or sidebar
 */
export interface MiniLeaderboardProps {
  timeFrame?: TimeFrame
  limit?: number
  className?: string
}

export function MiniLeaderboard({
  timeFrame = 'weekly',
  limit = 5,
  className = '',
}: MiniLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard({ timeFrame, limit })
        setEntries(data.entries)
      } catch (error) {
        console.error('Failed to load mini leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [timeFrame, limit])

  if (loading) {
    return <div className={`mini-leaderboard loading ${className}`}>Loading...</div>
  }

  return (
    <div className={`mini-leaderboard ${className}`} data-testid="mini-leaderboard">
      <h3 className="mini-leaderboard-title">
        {timeFrame === 'daily' && 'Top Today'}
        {timeFrame === 'weekly' && 'Top This Week'}
        {timeFrame === 'monthly' && 'Top This Month'}
        {timeFrame === 'alltime' && 'All-Time Best'}
      </h3>
      <ul className="mini-leaderboard-list">
        {entries.map((entry) => (
          <li key={entry.userId} className="mini-leaderboard-item">
            <span className="mini-rank">{formatRank(entry.rank)}</span>
            <span className="mini-username">{entry.username}</span>
            <span className="mini-wpm">{entry.wpm} WPM</span>
          </li>
        ))}
      </ul>
      {entries.length === 0 && (
        <p className="mini-leaderboard-empty">No entries yet</p>
      )}
    </div>
  )
}

export default Leaderboard

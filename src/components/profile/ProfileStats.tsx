/**
 * Profile Stats Component
 * Displays the stats grid with key metrics
 */

import type { AccuracyTrend, WPMTrend } from '@/lib/analytics-api'
import type { UserStats } from '@/lib/results-api'
import { formatDuration } from '@/lib/formatters'

export interface ProfileStatsProps {
  stats: UserStats
  wpmTrend: WPMTrend | null
  accuracyTrend: AccuracyTrend | null
}

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: 'tests' | 'speed' | 'trophy' | 'accuracy' | 'star' | 'clock'
}

const ICON_MAP = {
  tests: '📝',
  speed: '⚡',
  trophy: '🏆',
  accuracy: '🎯',
  star: '⭐',
  clock: '⏱️',
} as const

function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <div className="stat-card" data-testid={`stat-card-${icon}`}>
      <span className="stat-icon" aria-hidden="true">
        {ICON_MAP[icon]}
      </span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}

export function ProfileStats({
  stats,
  wpmTrend,
  accuracyTrend,
}: ProfileStatsProps) {
  const wpmSubtext =
    wpmTrend?.overall.trend === 'up' ? `+${wpmTrend.overall.change}` : undefined
  const accuracySubtext =
    accuracyTrend?.overall.trend === 'up'
      ? `+${accuracyTrend.overall.change}%`
      : undefined

  return (
    <section className="profile-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="section-title">
        Overview
      </h2>
      <div className="stats-grid" data-testid="stats-grid">
        <StatCard
          label="Tests Completed"
          value={stats.totalTests.toString()}
          icon="tests"
        />
        <StatCard
          label="Average WPM"
          value={stats.averageWpm.toString()}
          subtext={wpmSubtext}
          icon="speed"
        />
        <StatCard
          label="Best WPM"
          value={stats.bestWpm.toString()}
          icon="trophy"
        />
        <StatCard
          label="Average Accuracy"
          value={`${stats.averageAccuracy}%`}
          subtext={accuracySubtext}
          icon="accuracy"
        />
        <StatCard
          label="Best Accuracy"
          value={`${stats.bestAccuracy}%`}
          icon="star"
        />
        <StatCard
          label="Time Spent"
          value={formatDuration(stats.totalTimeSpent)}
          icon="clock"
        />
      </div>
    </section>
  )
}

export default ProfileStats

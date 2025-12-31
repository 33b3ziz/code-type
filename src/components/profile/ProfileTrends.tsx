/**
 * Profile Trends Component
 * Displays WPM and accuracy performance trends
 */

import type { AccuracyTrend, WPMTrend } from '@/lib/analytics-api'

export interface ProfileTrendsProps {
  wpmTrend: WPMTrend | null
  accuracyTrend: AccuracyTrend | null
}

interface TrendIndicatorProps {
  label: string
  trend: 'up' | 'down' | 'stable'
  current: number
  change: number
  unit: string
}

const TREND_ICONS = {
  up: '↑',
  down: '↓',
  stable: '→',
} as const

const TREND_COLORS = {
  up: 'trend-up',
  down: 'trend-down',
  stable: 'trend-stable',
} as const

function TrendIndicator({
  label,
  trend,
  current,
  change,
  unit,
}: TrendIndicatorProps) {
  const testId = `trend-${label.toLowerCase().replace(' ', '-')}`

  return (
    <div
      className={`trend-indicator ${TREND_COLORS[trend]}`}
      data-testid={testId}
    >
      <span className="trend-label">{label}</span>
      <div className="trend-value-container">
        <span className="trend-current">
          {current}
          {unit}
        </span>
        {change !== 0 && (
          <span className="trend-change">
            {TREND_ICONS[trend]} {change > 0 ? '+' : ''}
            {change}
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export function ProfileTrends({ wpmTrend, accuracyTrend }: ProfileTrendsProps) {
  if (!wpmTrend && !accuracyTrend) {
    return null
  }

  return (
    <section className="profile-section" aria-labelledby="trends-heading">
      <h2 id="trends-heading" className="section-title">
        Performance Trends
      </h2>
      <div className="trends-container" data-testid="trends-container">
        {wpmTrend && (
          <TrendIndicator
            label="WPM Trend"
            trend={wpmTrend.overall.trend}
            current={wpmTrend.overall.current}
            change={wpmTrend.overall.change}
            unit="WPM"
          />
        )}
        {accuracyTrend && (
          <TrendIndicator
            label="Accuracy Trend"
            trend={accuracyTrend.overall.trend}
            current={accuracyTrend.overall.current}
            change={accuracyTrend.overall.change}
            unit="%"
          />
        )}
      </div>
    </section>
  )
}

export default ProfileTrends

/**
 * User Profile Dashboard Component
 * Displays user statistics, typing history, per-language breakdown, and analytics
 */

import { useState, useEffect } from 'react'
import type { Language } from '@/db/schema'
import { getUserStats, type UserStats } from '@/lib/results-api'
import {
  getLanguageStats,
  getAccuracyTrend,
  getWPMTrend,
  identifyWeaknesses,
  getLanguageDisplayName,
  type LanguageBreakdown,
  type AccuracyTrend,
  type WPMTrend,
  type WeaknessArea,
} from '@/lib/analytics-api'
import {
  getUserRank,
  type TimeFrame,
} from '@/lib/leaderboard-api'

export interface UserProfileProps {
  userId: string
  username: string
  className?: string
}

export function UserProfile({ userId, username, className = '' }: UserProfileProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [languageBreakdown, setLanguageBreakdown] = useState<LanguageBreakdown | null>(null)
  const [accuracyTrend, setAccuracyTrend] = useState<AccuracyTrend | null>(null)
  const [wpmTrend, setWPMTrend] = useState<WPMTrend | null>(null)
  const [weaknesses, setWeaknesses] = useState<WeaknessArea[]>([])
  const [globalRank, setGlobalRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [
          userStats,
          langStats,
          accTrend,
          wTrend,
          weak,
          rank,
        ] = await Promise.all([
          getUserStats(userId),
          getLanguageStats(userId),
          getAccuracyTrend(userId),
          getWPMTrend(userId),
          identifyWeaknesses(userId),
          getUserRank(userId, { timeFrame: 'alltime' }),
        ])

        setStats(userStats)
        setLanguageBreakdown(langStats)
        setAccuracyTrend(accTrend)
        setWPMTrend(wTrend)
        setWeaknesses(weak)
        setGlobalRank(rank)
      } catch (error) {
        console.error('Failed to load profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  if (loading) {
    return (
      <div className={`user-profile ${className}`} data-testid="user-profile-loading">
        <div className="profile-loading">Loading profile...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`user-profile ${className}`} data-testid="user-profile-error">
        <div className="profile-error">Failed to load profile data</div>
      </div>
    )
  }

  return (
    <div className={`user-profile ${className}`} data-testid="user-profile">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-initial">{username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{username}</h1>
          {globalRank && (
            <span className="profile-rank">Global Rank: #{globalRank}</span>
          )}
        </div>
      </header>

      {/* Quick Stats Grid */}
      <section className="profile-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="section-title">Overview</h2>
        <div className="stats-grid" data-testid="stats-grid">
          <StatCard
            label="Tests Completed"
            value={stats.totalTests.toString()}
            icon="tests"
          />
          <StatCard
            label="Average WPM"
            value={stats.averageWpm.toString()}
            subtext={wpmTrend?.overall.trend === 'up' ? `+${wpmTrend.overall.change}` : undefined}
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
            subtext={accuracyTrend?.overall.trend === 'up' ? `+${accuracyTrend.overall.change}%` : undefined}
            icon="accuracy"
          />
          <StatCard
            label="Best Accuracy"
            value={`${stats.bestAccuracy}%`}
            icon="star"
          />
          <StatCard
            label="Time Spent"
            value={formatTime(stats.totalTimeSpent)}
            icon="clock"
          />
        </div>
      </section>

      {/* Trends Section */}
      <section className="profile-section" aria-labelledby="trends-heading">
        <h2 id="trends-heading" className="section-title">Performance Trends</h2>
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

      {/* Language Stats */}
      {languageBreakdown && (
        <section className="profile-section" aria-labelledby="language-heading">
          <h2 id="language-heading" className="section-title">Language Performance</h2>
          <div className="language-grid" data-testid="language-grid">
            {languageBreakdown.languages.map((langStat) => (
              <LanguageCard
                key={langStat.language}
                language={langStat.language}
                totalTests={langStat.totalTests}
                averageWpm={langStat.averageWpm}
                averageAccuracy={langStat.averageAccuracy}
                bestWpm={langStat.bestWpm}
                trend={langStat.trend}
                isStrongest={langStat.language === languageBreakdown.strongest}
                needsWork={langStat.language === languageBreakdown.needsWork}
              />
            ))}
          </div>
        </section>
      )}

      {/* Weaknesses / Areas for Improvement */}
      {weaknesses.length > 0 && (
        <section className="profile-section" aria-labelledby="improvement-heading">
          <h2 id="improvement-heading" className="section-title">Areas for Improvement</h2>
          <div className="weaknesses-list" data-testid="weaknesses-list">
            {weaknesses.map((weakness, index) => (
              <WeaknessCard
                key={index}
                type={weakness.type}
                description={weakness.description}
                severity={weakness.severity}
                suggestion={weakness.suggestion}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity Summary */}
      <section className="profile-section" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="section-title">Recent Activity</h2>
        <div className="activity-summary" data-testid="activity-summary">
          <p className="activity-stat">
            <strong>{stats.testsThisWeek}</strong> tests completed this week
          </p>
          {stats.improvement !== 0 && (
            <p className={`activity-stat ${stats.improvement > 0 ? 'improvement-up' : 'improvement-down'}`}>
              {stats.improvement > 0 ? '+' : ''}{stats.improvement} WPM improvement over last 10 tests
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

// --- Helper Components ---

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: 'tests' | 'speed' | 'trophy' | 'accuracy' | 'star' | 'clock'
}

function StatCard({ label, value, subtext, icon }: StatCardProps) {
  const iconMap = {
    tests: '📝',
    speed: '⚡',
    trophy: '🏆',
    accuracy: '🎯',
    star: '⭐',
    clock: '⏱️',
  }

  return (
    <div className="stat-card" data-testid={`stat-card-${icon}`}>
      <span className="stat-icon" aria-hidden="true">{iconMap[icon]}</span>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}

interface TrendIndicatorProps {
  label: string
  trend: 'up' | 'down' | 'stable'
  current: number
  change: number
  unit: string
}

function TrendIndicator({ label, trend, current, change, unit }: TrendIndicatorProps) {
  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  }

  const trendColors = {
    up: 'trend-up',
    down: 'trend-down',
    stable: 'trend-stable',
  }

  return (
    <div className={`trend-indicator ${trendColors[trend]}`} data-testid={`trend-${label.toLowerCase().replace(' ', '-')}`}>
      <span className="trend-label">{label}</span>
      <div className="trend-value-container">
        <span className="trend-current">{current}{unit}</span>
        {change !== 0 && (
          <span className="trend-change">
            {trendIcons[trend]} {change > 0 ? '+' : ''}{change}{unit}
          </span>
        )}
      </div>
    </div>
  )
}

interface LanguageCardProps {
  language: Language
  totalTests: number
  averageWpm: number
  averageAccuracy: number
  bestWpm: number
  trend: 'up' | 'down' | 'stable'
  isStrongest: boolean
  needsWork: boolean
}

function LanguageCard({
  language,
  totalTests,
  averageWpm,
  averageAccuracy,
  bestWpm,
  trend,
  isStrongest,
  needsWork,
}: LanguageCardProps) {
  const languageColors: Record<Language, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3776ab',
  }

  return (
    <div
      className={`language-card ${isStrongest ? 'strongest' : ''} ${needsWork ? 'needs-work' : ''}`}
      data-testid={`language-card-${language}`}
      style={{ borderColor: languageColors[language] }}
    >
      <div className="language-header">
        <span className="language-name">{getLanguageDisplayName(language)}</span>
        {isStrongest && <span className="language-badge strongest-badge">Strongest</span>}
        {needsWork && <span className="language-badge needs-work-badge">Needs Work</span>}
      </div>
      {totalTests === 0 ? (
        <p className="language-no-data">No tests yet</p>
      ) : (
        <div className="language-stats">
          <div className="language-stat">
            <span className="language-stat-value">{totalTests}</span>
            <span className="language-stat-label">Tests</span>
          </div>
          <div className="language-stat">
            <span className="language-stat-value">{averageWpm}</span>
            <span className="language-stat-label">Avg WPM</span>
          </div>
          <div className="language-stat">
            <span className="language-stat-value">{averageAccuracy}%</span>
            <span className="language-stat-label">Accuracy</span>
          </div>
          <div className="language-stat">
            <span className="language-stat-value">{bestWpm}</span>
            <span className="language-stat-label">Best</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface WeaknessCardProps {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

function WeaknessCard({ type, description, severity, suggestion }: WeaknessCardProps) {
  const severityColors = {
    low: 'severity-low',
    medium: 'severity-medium',
    high: 'severity-high',
  }

  const typeIcons: Record<string, string> = {
    symbols: '{}',
    keywords: 'fn',
    speed: '⚡',
    accuracy: '🎯',
    language: '💻',
  }

  return (
    <div className={`weakness-card ${severityColors[severity]}`} data-testid={`weakness-${type}`}>
      <span className="weakness-icon" aria-hidden="true">{typeIcons[type] || '⚠️'}</span>
      <div className="weakness-content">
        <p className="weakness-description">{description}</p>
        <p className="weakness-suggestion">{suggestion}</p>
      </div>
      <span className={`weakness-severity ${severityColors[severity]}`}>{severity}</span>
    </div>
  )
}

// --- Utility Functions ---

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export default UserProfile

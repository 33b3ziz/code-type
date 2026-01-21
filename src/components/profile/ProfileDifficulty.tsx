/**
 * Profile Difficulty Component
 * Displays per-difficulty performance breakdown
 */

import type { Difficulty } from '@/db/schema'
import type { DifficultyStats } from '@/lib/analytics-api'

export interface ProfileDifficultyProps {
  difficultyStats: Array<DifficultyStats>
}

interface DifficultyCardProps {
  stats: DifficultyStats
  isStrongest: boolean
  isWeakest: boolean
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: '#22c55e',      // Green
  intermediate: '#3b82f6',  // Blue
  advanced: '#f59e0b',      // Amber
  hardcore: '#ef4444',      // Red
}

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  beginner: '🌱',
  intermediate: '🌿',
  advanced: '🌲',
  hardcore: '🔥',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  hardcore: 'Hardcore',
}

function DifficultyCard({ stats, isStrongest, isWeakest }: DifficultyCardProps) {
  const cardClasses = [
    'difficulty-card',
    isStrongest ? 'strongest' : '',
    isWeakest ? 'weakest' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClasses}
      data-testid={`difficulty-card-${stats.difficulty}`}
      style={{ borderColor: DIFFICULTY_COLORS[stats.difficulty] }}
    >
      <div className="difficulty-header">
        <span className="difficulty-icon" aria-hidden="true">
          {DIFFICULTY_ICONS[stats.difficulty]}
        </span>
        <span className="difficulty-name">{DIFFICULTY_LABELS[stats.difficulty]}</span>
        {isStrongest && stats.totalTests > 0 && (
          <span className="difficulty-badge strongest-badge">Strongest</span>
        )}
        {isWeakest && stats.totalTests > 0 && (
          <span className="difficulty-badge weakest-badge">Needs Work</span>
        )}
      </div>

      {stats.totalTests === 0 ? (
        <p className="difficulty-no-data">No tests yet</p>
      ) : (
        <div className="difficulty-stats">
          <div className="difficulty-stat">
            <span className="difficulty-stat-value">{stats.totalTests}</span>
            <span className="difficulty-stat-label">Tests</span>
          </div>
          <div className="difficulty-stat">
            <span className="difficulty-stat-value">{stats.averageWpm}</span>
            <span className="difficulty-stat-label">Avg WPM</span>
          </div>
          <div className="difficulty-stat">
            <span className="difficulty-stat-value">{stats.averageAccuracy}%</span>
            <span className="difficulty-stat-label">Accuracy</span>
          </div>
          <div className="difficulty-stat">
            <span className="difficulty-stat-value">{stats.bestWpm}</span>
            <span className="difficulty-stat-label">Best</span>
          </div>
        </div>
      )}

      {/* Difficulty-specific visual indicator */}
      <div
        className="difficulty-indicator"
        style={{ backgroundColor: DIFFICULTY_COLORS[stats.difficulty] }}
      />
    </div>
  )
}

function DifficultyDistribution({ difficultyStats }: ProfileDifficultyProps) {
  const totalTests = difficultyStats.reduce((sum, s) => sum + s.totalTests, 0)
  if (totalTests === 0) return null

  return (
    <div className="difficulty-distribution" data-testid="difficulty-distribution">
      <h3 className="difficulty-distribution-title">Test Distribution</h3>
      <div className="difficulty-distribution-bar">
        {difficultyStats.map(stats => {
          const percentage = (stats.totalTests / totalTests) * 100
          if (percentage === 0) return null
          return (
            <div
              key={stats.difficulty}
              className="difficulty-distribution-segment"
              style={{
                width: `${percentage}%`,
                backgroundColor: DIFFICULTY_COLORS[stats.difficulty],
              }}
              title={`${DIFFICULTY_LABELS[stats.difficulty]}: ${stats.totalTests} tests (${percentage.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div className="difficulty-distribution-legend">
        {difficultyStats.map(stats => {
          const percentage = totalTests > 0 ? ((stats.totalTests / totalTests) * 100).toFixed(1) : '0'
          return (
            <div key={stats.difficulty} className="difficulty-legend-item">
              <span
                className="difficulty-legend-color"
                style={{ backgroundColor: DIFFICULTY_COLORS[stats.difficulty] }}
              />
              <span className="difficulty-legend-label">
                {DIFFICULTY_LABELS[stats.difficulty]} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProfileDifficulty({ difficultyStats }: ProfileDifficultyProps) {
  // Find strongest and weakest difficulties (only among those with tests)
  const withTests = difficultyStats.filter(s => s.totalTests > 0)

  let strongestDifficulty: Difficulty | null = null
  let weakestDifficulty: Difficulty | null = null

  if (withTests.length > 0) {
    const sorted = [...withTests].sort((a, b) => b.averageWpm - a.averageWpm)
    strongestDifficulty = sorted[0].difficulty
    weakestDifficulty = sorted[sorted.length - 1].difficulty

    // Only mark as weakest if different from strongest
    if (strongestDifficulty === weakestDifficulty) {
      weakestDifficulty = null
    }
  }

  return (
    <section className="profile-section" aria-labelledby="difficulty-heading">
      <h2 id="difficulty-heading" className="section-title">
        Difficulty Performance
      </h2>

      <DifficultyDistribution difficultyStats={difficultyStats} />

      <div className="difficulty-grid" data-testid="difficulty-grid">
        {difficultyStats.map(stats => (
          <DifficultyCard
            key={stats.difficulty}
            stats={stats}
            isStrongest={stats.difficulty === strongestDifficulty}
            isWeakest={stats.difficulty === weakestDifficulty}
          />
        ))}
      </div>
    </section>
  )
}

export default ProfileDifficulty

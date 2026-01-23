/**
 * Profile Achievements Component
 * Displays achievement progress with visual indicators
 */

import type { AchievementProgress } from '@/lib/achievement-tracker'

export interface ProfileAchievementsProps {
  achievements: Array<AchievementProgress>
}

interface AchievementCardProps {
  achievement: AchievementProgress
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  speed_demon: '⚡',
  sharpshooter: '🎯',
  marathon_runner: '🏃',
  perfectionist: '💎',
  consistency_king: '👑',
  rising_star: '⭐',
  code_warrior: '⚔️',
  keyboard_master: '⌨️',
  lightning_fingers: '🔥',
  accuracy_ace: '🎖️',
  dedication: '📚',
  polyglot: '🌐',
  night_owl: '🦉',
  early_bird: '🐦',
  streak_master: '🔗',
  centurion: '💯',
  typing_titan: '🏆',
  error_eliminator: '🛡️',
  speed_learner: '📈',
  practice_makes_perfect: '🎓',
}

function getAchievementIcon(iconName: string): string {
  return ACHIEVEMENT_ICONS[iconName] || '🏅'
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercent = Math.min(100, Math.max(0, achievement.progress))
  const isUnlocked = achievement.isUnlocked

  return (
    <div
      className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
      data-testid={`achievement-${achievement.slug}`}
    >
      <div className="achievement-icon-container">
        <span
          className={`achievement-icon ${isUnlocked ? 'achievement-glow' : ''}`}
          aria-hidden="true"
        >
          {getAchievementIcon(achievement.iconName)}
        </span>
        {isUnlocked && (
          <span className="achievement-check" aria-label="Unlocked">✓</span>
        )}
      </div>

      <div className="achievement-content">
        <div className="achievement-header">
          <span className="achievement-name">{achievement.name}</span>
          <span className="achievement-points">+{achievement.points} pts</span>
        </div>

        <p className="achievement-description">{achievement.description}</p>

        {!isUnlocked && (
          <div className="achievement-progress-container">
            <div className="achievement-progress-bar">
              <div
                className="achievement-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="achievement-progress-text">{achievement.progressText}</span>
          </div>
        )}

        {isUnlocked && achievement.unlockedAt && (
          <span className="achievement-unlocked-date">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}

interface AchievementSummaryProps {
  achievements: Array<AchievementProgress>
}

function AchievementSummary({ achievements }: AchievementSummaryProps) {
  const unlocked = achievements.filter(a => a.isUnlocked)
  const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0)
  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0)
  const progressPercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

  return (
    <div className="achievement-summary" data-testid="achievement-summary">
      <div className="achievement-summary-stats">
        <div className="achievement-summary-stat">
          <span className="achievement-summary-value">{unlocked.length}/{achievements.length}</span>
          <span className="achievement-summary-label">Achievements</span>
        </div>
        <div className="achievement-summary-stat">
          <span className="achievement-summary-value">{totalPoints}</span>
          <span className="achievement-summary-label">Points Earned</span>
        </div>
        <div className="achievement-summary-stat">
          <span className="achievement-summary-value">{progressPercent}%</span>
          <span className="achievement-summary-label">Completion</span>
        </div>
      </div>
      <div className="achievement-overall-progress">
        <div className="achievement-progress-bar">
          <div
            className="achievement-progress-fill progress-electric"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  // Sort achievements: unlocked first, then by progress descending
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1
    if (!a.isUnlocked && b.isUnlocked) return 1
    return b.progress - a.progress
  })

  // Get recent achievements (unlocked in the last 7 days)
  const recentlyUnlocked = achievements.filter(a => {
    if (!a.isUnlocked || !a.unlockedAt) return false
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(a.unlockedAt) > sevenDaysAgo
  })

  // Get close to unlocking (progress >= 70%)
  const almostThere = achievements.filter(a => !a.isUnlocked && a.progress >= 70)

  return (
    <section className="profile-section" aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className="section-title">
        Achievements
      </h2>

      <AchievementSummary achievements={achievements} />

      {recentlyUnlocked.length > 0 && (
        <div className="achievement-category" data-testid="recent-achievements">
          <h3 className="achievement-category-title">
            <span className="achievement-category-icon">🎉</span>
            Recently Unlocked
          </h3>
          <div className="achievements-grid">
            {recentlyUnlocked.map(achievement => (
              <AchievementCard key={achievement.slug} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {almostThere.length > 0 && (
        <div className="achievement-category" data-testid="almost-there-achievements">
          <h3 className="achievement-category-title">
            <span className="achievement-category-icon">🔥</span>
            Almost There
          </h3>
          <div className="achievements-grid">
            {almostThere.map(achievement => (
              <AchievementCard key={achievement.slug} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      <div className="achievement-category" data-testid="all-achievements">
        <h3 className="achievement-category-title">
          <span className="achievement-category-icon">🏅</span>
          All Achievements
        </h3>
        <div className="achievements-grid">
          {sortedAchievements.map(achievement => (
            <AchievementCard key={achievement.slug} achievement={achievement} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProfileAchievements

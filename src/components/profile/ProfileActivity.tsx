/**
 * Profile Activity Component
 * Displays recent activity summary
 */

import type { UserStats } from '@/lib/results-api'

export interface ProfileActivityProps {
  stats: UserStats
}

export function ProfileActivity({ stats }: ProfileActivityProps) {
  const improvementClass =
    stats.improvement > 0 ? 'improvement-up' : 'improvement-down'

  return (
    <section className="profile-section" aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="section-title">
        Recent Activity
      </h2>
      <div className="activity-summary" data-testid="activity-summary">
        <p className="activity-stat">
          <strong>{stats.testsThisWeek}</strong> tests completed this week
        </p>
        {stats.improvement !== 0 && (
          <p className={`activity-stat ${improvementClass}`}>
            {stats.improvement > 0 ? '+' : ''}
            {stats.improvement} WPM improvement over last 10 tests
          </p>
        )}
      </div>
    </section>
  )
}

export default ProfileActivity

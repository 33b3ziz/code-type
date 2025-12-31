/**
 * Profile Languages Component
 * Displays per-language performance breakdown
 */

import type { Language } from '@/db/schema'
import type { LanguageBreakdown } from '@/lib/analytics-api'
import { getLanguageDisplayName } from '@/lib/analytics-api'

export interface ProfileLanguagesProps {
  languageBreakdown: LanguageBreakdown
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

const LANGUAGE_COLORS: Record<Language, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
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
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  const trendClass = `trend-${trend}`

  const cardClasses = [
    'language-card',
    isStrongest ? 'strongest' : '',
    needsWork ? 'needs-work' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClasses}
      data-testid={`language-card-${language}`}
      style={{ borderColor: LANGUAGE_COLORS[language] }}
    >
      <div className="language-header">
        <span className="language-name">{getLanguageDisplayName(language)}</span>
        <span className={`language-trend ${trendClass}`} aria-label={`Trend: ${trend}`}>
          {trendIcon}
        </span>
        {isStrongest && (
          <span className="language-badge strongest-badge">Strongest</span>
        )}
        {needsWork && (
          <span className="language-badge needs-work-badge">Needs Work</span>
        )}
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

export function ProfileLanguages({ languageBreakdown }: ProfileLanguagesProps) {
  return (
    <section className="profile-section" aria-labelledby="language-heading">
      <h2 id="language-heading" className="section-title">
        Language Performance
      </h2>
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
  )
}

export default ProfileLanguages

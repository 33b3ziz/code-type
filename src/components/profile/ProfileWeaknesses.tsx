/**
 * Profile Weaknesses Component
 * Displays areas for improvement with suggestions
 */

import type { WeaknessArea } from '@/lib/analytics-api'

export interface ProfileWeaknessesProps {
  weaknesses: Array<WeaknessArea>
}

interface WeaknessCardProps {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

const SEVERITY_CLASSES = {
  low: 'severity-low',
  medium: 'severity-medium',
  high: 'severity-high',
} as const

const TYPE_ICONS: Record<string, string> = {
  symbols: '{}',
  keywords: 'fn',
  speed: '⚡',
  accuracy: '🎯',
  language: '💻',
}

function WeaknessCard({
  type,
  description,
  severity,
  suggestion,
}: WeaknessCardProps) {
  const severityClass = SEVERITY_CLASSES[severity]
  const icon = TYPE_ICONS[type] || '⚠️'

  return (
    <div
      className={`weakness-card ${severityClass}`}
      data-testid={`weakness-${type}`}
    >
      <span className="weakness-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="weakness-content">
        <p className="weakness-description">{description}</p>
        <p className="weakness-suggestion">{suggestion}</p>
      </div>
      <span className={`weakness-severity ${severityClass}`}>{severity}</span>
    </div>
  )
}

export function ProfileWeaknesses({ weaknesses }: ProfileWeaknessesProps) {
  if (weaknesses.length === 0) {
    return null
  }

  return (
    <section className="profile-section" aria-labelledby="improvement-heading">
      <h2 id="improvement-heading" className="section-title">
        Areas for Improvement
      </h2>
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
  )
}

export default ProfileWeaknesses

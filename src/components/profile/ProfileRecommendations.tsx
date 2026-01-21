/**
 * Profile Recommendations Component
 * Displays personalized practice recommendations based on user performance
 */

import { useEffect, useState } from 'react'
import type {
  DifficultyRecommendation,
  LanguageRecommendation,
  PerformanceProfile,
  PracticeRecommendation,
} from '@/lib/recommendations-api'
import {
  calculatePerformanceProfile,
  getDifficultyRecommendation,
  getLanguageRecommendation,
  getMotivationalMessage,
  getPracticeRecommendation,
} from '@/lib/recommendations-api'

export interface ProfileRecommendationsProps {
  userId: string
}

interface RecommendationsData {
  profile: PerformanceProfile | null
  difficulty: DifficultyRecommendation | null
  language: LanguageRecommendation | null
  practice: PracticeRecommendation | null
  motivationalMessage: string
}

const FOCUS_ICONS: Record<string, string> = {
  speed: '⚡',
  accuracy: '🎯',
  symbols: '{}',
  keywords: 'fn',
  balanced: '⚖️',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'difficulty-beginner',
  intermediate: 'difficulty-intermediate',
  advanced: 'difficulty-advanced',
  hardcore: 'difficulty-hardcore',
}

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: '🟨',
  typescript: '🔷',
  python: '🐍',
}

const CHALLENGE_BADGES: Record<string, { class: string; label: string }> = {
  easy: { class: 'challenge-easy', label: 'Easy' },
  appropriate: { class: 'challenge-appropriate', label: 'Good Match' },
  challenging: { class: 'challenge-challenging', label: 'Challenge' },
}

async function loadRecommendations(userId: string): Promise<RecommendationsData> {
  const [difficulty, language, practice] = await Promise.all([
    getDifficultyRecommendation(userId),
    getLanguageRecommendation(userId),
    getPracticeRecommendation(userId),
  ])

  const profile = calculatePerformanceProfile(userId)
  const motivationalMessage = getMotivationalMessage(profile)

  return {
    profile,
    difficulty,
    language,
    practice,
    motivationalMessage,
  }
}

function ConfidenceBadge({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  return (
    <span className={`confidence-badge confidence-${confidence}`} title={`${confidence} confidence`}>
      {confidence === 'high' ? '●●●' : confidence === 'medium' ? '●●○' : '●○○'}
    </span>
  )
}

export function ProfileRecommendations({ userId }: ProfileRecommendationsProps) {
  const [data, setData] = useState<RecommendationsData>({
    profile: null,
    difficulty: null,
    language: null,
    practice: null,
    motivationalMessage: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadRecommendations(userId)
      .then(setData)
      .catch((error) => {
        console.error('Failed to load recommendations:', error)
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <section className="profile-section" aria-labelledby="recommendations-heading">
        <h2 id="recommendations-heading" className="section-title">
          Practice Recommendations
        </h2>
        <div className="recommendations-loading" data-testid="recommendations-loading">
          Analyzing your performance...
        </div>
      </section>
    )
  }

  const { difficulty, language, practice, motivationalMessage } = data

  return (
    <section className="profile-section" aria-labelledby="recommendations-heading" data-testid="profile-recommendations">
      <h2 id="recommendations-heading" className="section-title">
        Practice Recommendations
      </h2>

      {/* Motivational Message */}
      <div className="motivational-message" data-testid="motivational-message">
        <span className="motivational-icon" aria-hidden="true">💪</span>
        <p>{motivationalMessage}</p>
      </div>

      {/* Main Practice Recommendation */}
      {practice && (
        <div className="recommendation-card recommendation-primary" data-testid="practice-recommendation">
          <div className="recommendation-header">
            <span className="recommendation-icon" aria-hidden="true">🚀</span>
            <h3>Recommended Practice</h3>
            <span className={`challenge-badge ${CHALLENGE_BADGES[practice.estimatedChallenge].class}`}>
              {CHALLENGE_BADGES[practice.estimatedChallenge].label}
            </span>
          </div>
          <div className="recommendation-content">
            <div className="recommendation-details">
              <div className="recommendation-item">
                <span className="item-label">Difficulty:</span>
                <span className={`item-value ${DIFFICULTY_COLORS[practice.difficulty]}`}>
                  {practice.difficulty.charAt(0).toUpperCase() + practice.difficulty.slice(1)}
                </span>
              </div>
              <div className="recommendation-item">
                <span className="item-label">Language:</span>
                <span className="item-value">
                  {LANGUAGE_ICONS[practice.language]} {practice.language.charAt(0).toUpperCase() + practice.language.slice(1)}
                </span>
              </div>
              <div className="recommendation-item">
                <span className="item-label">Focus:</span>
                <span className="item-value">
                  {FOCUS_ICONS[practice.focus]} {practice.focus.charAt(0).toUpperCase() + practice.focus.slice(1)}
                </span>
              </div>
            </div>
            <p className="recommendation-reason">{practice.reason}</p>
          </div>
        </div>
      )}

      <div className="recommendations-grid">
        {/* Difficulty Recommendation */}
        {difficulty && (
          <div className="recommendation-card" data-testid="difficulty-recommendation">
            <div className="recommendation-header">
              <span className="recommendation-icon" aria-hidden="true">📊</span>
              <h3>Difficulty Level</h3>
              <ConfidenceBadge confidence={difficulty.confidence} />
            </div>
            <div className="recommendation-content">
              <div className={`recommended-value ${DIFFICULTY_COLORS[difficulty.recommended]}`}>
                {difficulty.recommended.charAt(0).toUpperCase() + difficulty.recommended.slice(1)}
              </div>
              <p className="recommendation-reason">{difficulty.reason}</p>

              {difficulty.alternatives.length > 0 && (
                <div className="alternatives">
                  <span className="alternatives-label">Alternatives:</span>
                  <ul className="alternatives-list">
                    {difficulty.alternatives.map((alt, index) => (
                      <li key={index} className="alternative-item">
                        <span className={`alternative-value ${DIFFICULTY_COLORS[alt.difficulty]}`}>
                          {alt.difficulty}
                        </span>
                        <span className="alternative-reason">{alt.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Language Recommendation */}
        {language && (
          <div className="recommendation-card" data-testid="language-recommendation">
            <div className="recommendation-header">
              <span className="recommendation-icon" aria-hidden="true">💻</span>
              <h3>Language Focus</h3>
            </div>
            <div className="recommendation-content">
              <div className="recommended-value">
                {LANGUAGE_ICONS[language.recommended]} {language.recommended.charAt(0).toUpperCase() + language.recommended.slice(1)}
              </div>
              <p className="recommendation-reason">{language.reason}</p>

              <div className="practice-order">
                <span className="practice-order-label">Suggested practice order:</span>
                <ol className="practice-order-list">
                  {language.practiceOrder.map((lang, index) => (
                    <li key={lang} className="practice-order-item">
                      <span className="order-number">{index + 1}</span>
                      <span className="order-language">
                        {LANGUAGE_ICONS[lang]} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProfileRecommendations

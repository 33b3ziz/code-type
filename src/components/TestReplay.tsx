/**
 * Test Replay Component
 * Allows users to replay previous typing tests with the same snippet
 */

import { useState } from 'react'
import type { TestResult, Language, Difficulty } from '@/db/schema'
import { formatDuration, formatDate } from '@/lib/results-api'

export interface ReplayableTest {
  id: number
  snippetId: number
  snippetTitle?: string
  snippetCode?: string
  language: Language
  difficulty: Difficulty
  previousWpm: number
  previousAccuracy: number
  completedAt: Date
}

export interface TestReplayProps {
  test: ReplayableTest
  onStartReplay: (snippetId: number) => void
  onClose?: () => void
  className?: string
}

export function TestReplay({
  test,
  onStartReplay,
  onClose,
  className = '',
}: TestReplayProps) {
  const [showComparison, setShowComparison] = useState(false)

  const handleStartReplay = () => {
    onStartReplay(test.snippetId)
  }

  return (
    <div className={`test-replay ${className}`} data-testid="test-replay">
      {/* Header */}
      <div className="replay-header">
        <h3 className="replay-title">Replay Test</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="replay-close"
            aria-label="Close replay"
          >
            &times;
          </button>
        )}
      </div>

      {/* Test Info */}
      <div className="replay-info" data-testid="replay-info">
        <div className="info-row">
          <span className="info-label">Original Test:</span>
          <span className="info-value">{formatDate(new Date(test.completedAt))}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Language:</span>
          <span className={`info-value language-badge language-${test.language}`}>
            {getLanguageDisplayName(test.language)}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Difficulty:</span>
          <span className={`info-value difficulty-badge difficulty-${test.difficulty}`}>
            {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
          </span>
        </div>
        {test.snippetTitle && (
          <div className="info-row">
            <span className="info-label">Snippet:</span>
            <span className="info-value">{test.snippetTitle}</span>
          </div>
        )}
      </div>

      {/* Previous Performance */}
      <div className="replay-previous" data-testid="replay-previous">
        <h4 className="previous-title">Previous Performance</h4>
        <div className="previous-stats">
          <div className="previous-stat">
            <span className="stat-value">{test.previousWpm}</span>
            <span className="stat-label">WPM</span>
          </div>
          <div className="previous-stat">
            <span className="stat-value">{test.previousAccuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Challenge */}
      <div className="replay-challenge" data-testid="replay-challenge">
        <p className="challenge-text">
          Can you beat your previous score of <strong>{test.previousWpm} WPM</strong>?
        </p>
        <div className="challenge-targets">
          <div className="target-item">
            <span className="target-label">To improve:</span>
            <span className="target-value">{test.previousWpm + 1}+ WPM</span>
          </div>
          <div className="target-item">
            <span className="target-label">Stretch goal:</span>
            <span className="target-value">{Math.round(test.previousWpm * 1.1)}+ WPM</span>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      {test.snippetCode && (
        <details className="replay-code-preview" data-testid="replay-code-preview">
          <summary>Preview Code</summary>
          <pre className="code-preview">{test.snippetCode}</pre>
        </details>
      )}

      {/* Actions */}
      <div className="replay-actions" data-testid="replay-actions">
        <button
          onClick={handleStartReplay}
          className="replay-btn replay-btn-primary"
          data-testid="start-replay-btn"
        >
          Start Replay
        </button>
        {onClose && (
          <button onClick={onClose} className="replay-btn replay-btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Comparison component to show after completing a replay
 */
export interface ReplayComparisonProps {
  previousResult: { wpm: number; accuracy: number }
  newResult: { wpm: number; accuracy: number }
  onPlayAgain: () => void
  onNewTest: () => void
  className?: string
}

export function ReplayComparison({
  previousResult,
  newResult,
  onPlayAgain,
  onNewTest,
  className = '',
}: ReplayComparisonProps) {
  const wpmDiff = newResult.wpm - previousResult.wpm
  const accuracyDiff = newResult.accuracy - previousResult.accuracy
  const isImproved = wpmDiff > 0 || (wpmDiff === 0 && accuracyDiff > 0)

  return (
    <div className={`replay-comparison ${className}`} data-testid="replay-comparison">
      <h3 className="comparison-title">
        {isImproved ? 'You Beat Your Previous Score!' : 'Good Effort!'}
      </h3>

      <div className="comparison-stats">
        {/* WPM Comparison */}
        <div className="comparison-stat">
          <div className="stat-header">WPM</div>
          <div className="stat-values">
            <div className="stat-previous">
              <span className="stat-label">Previous</span>
              <span className="stat-value">{previousResult.wpm}</span>
            </div>
            <div className="stat-arrow">
              {wpmDiff > 0 ? '→' : wpmDiff < 0 ? '→' : '='}
            </div>
            <div className={`stat-new ${wpmDiff > 0 ? 'improved' : wpmDiff < 0 ? 'decreased' : ''}`}>
              <span className="stat-label">New</span>
              <span className="stat-value">{newResult.wpm}</span>
            </div>
          </div>
          <div className={`stat-diff ${wpmDiff > 0 ? 'positive' : wpmDiff < 0 ? 'negative' : ''}`}>
            {wpmDiff > 0 ? `+${wpmDiff}` : wpmDiff < 0 ? wpmDiff : '='}
          </div>
        </div>

        {/* Accuracy Comparison */}
        <div className="comparison-stat">
          <div className="stat-header">Accuracy</div>
          <div className="stat-values">
            <div className="stat-previous">
              <span className="stat-label">Previous</span>
              <span className="stat-value">{previousResult.accuracy}%</span>
            </div>
            <div className="stat-arrow">
              {accuracyDiff > 0 ? '→' : accuracyDiff < 0 ? '→' : '='}
            </div>
            <div className={`stat-new ${accuracyDiff > 0 ? 'improved' : accuracyDiff < 0 ? 'decreased' : ''}`}>
              <span className="stat-label">New</span>
              <span className="stat-value">{newResult.accuracy}%</span>
            </div>
          </div>
          <div className={`stat-diff ${accuracyDiff > 0 ? 'positive' : accuracyDiff < 0 ? 'negative' : ''}`}>
            {accuracyDiff > 0 ? `+${accuracyDiff}%` : accuracyDiff < 0 ? `${accuracyDiff}%` : '='}
          </div>
        </div>
      </div>

      <div className="comparison-message">
        {wpmDiff > 5 && (
          <p className="message positive">Amazing improvement! +{wpmDiff} WPM!</p>
        )}
        {wpmDiff > 0 && wpmDiff <= 5 && (
          <p className="message positive">Nice! Every improvement counts.</p>
        )}
        {wpmDiff === 0 && (
          <p className="message neutral">Consistent performance. Try again for improvement!</p>
        )}
        {wpmDiff < 0 && (
          <p className="message neutral">
            {Math.abs(wpmDiff)} WPM below your best. One more try?
          </p>
        )}
      </div>

      <div className="comparison-actions">
        <button
          onClick={onPlayAgain}
          className="comparison-btn comparison-btn-primary"
          data-testid="play-again-btn"
        >
          Play Again
        </button>
        <button
          onClick={onNewTest}
          className="comparison-btn comparison-btn-secondary"
        >
          Try New Test
        </button>
      </div>
    </div>
  )
}

// Helper function
function getLanguageDisplayName(language: Language): string {
  const names: Record<Language, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
  }
  return names[language] || language
}

export default TestReplay

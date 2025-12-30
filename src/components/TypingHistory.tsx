/**
 * Typing History Component
 * Displays a paginated list of user's past typing tests
 */

import { useState, useEffect, useMemo } from 'react'
import type { Language, Difficulty } from '@/db/schema'
import { getRecentResults, formatDuration, formatDate, type TestResultWithDetails } from '@/lib/results-api'

export interface TypingHistoryProps {
  userId: string
  pageSize?: number
  onViewDetails?: (resultId: number) => void
  className?: string
}

export function TypingHistory({
  userId,
  pageSize = 10,
  onViewDetails,
  className = '',
}: TypingHistoryProps) {
  const [results, setResults] = useState<TestResultWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<{
    language: Language | 'all'
    difficulty: Difficulty | 'all'
  }>({
    language: 'all',
    difficulty: 'all',
  })

  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      try {
        // Fetch more results than we need for filtering
        const data = await getRecentResults(userId, 100)
        setResults(data)
      } catch (error) {
        console.error('Failed to load typing history:', error)
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [userId])

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (filter.language !== 'all' && r.snippet?.language !== filter.language) {
        return false
      }
      if (filter.difficulty !== 'all' && r.snippet?.difficulty !== filter.difficulty) {
        return false
      }
      return true
    })
  }, [results, filter])

  // Paginate
  const totalPages = Math.ceil(filteredResults.length / pageSize)
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredResults.slice(start, start + pageSize)
  }, [filteredResults, currentPage, pageSize])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  if (loading) {
    return (
      <div className={`typing-history ${className}`} data-testid="typing-history-loading">
        <div className="history-loading">Loading history...</div>
      </div>
    )
  }

  return (
    <div className={`typing-history ${className}`} data-testid="typing-history">
      {/* Filters */}
      <div className="history-filters" data-testid="history-filters">
        <div className="filter-group">
          <label htmlFor="language-filter">Language:</label>
          <select
            id="language-filter"
            value={filter.language}
            onChange={(e) => setFilter({ ...filter, language: e.target.value as Language | 'all' })}
          >
            <option value="all">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="difficulty-filter">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value as Difficulty | 'all' })}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      {paginatedResults.length === 0 ? (
        <div className="history-empty" data-testid="history-empty">
          <p>No tests found. Start typing to build your history!</p>
        </div>
      ) : (
        <div className="history-list" data-testid="history-list">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Language</th>
                <th>Difficulty</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Duration</th>
                {onViewDetails && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((result) => (
                <HistoryRow
                  key={result.id}
                  result={result}
                  onViewDetails={onViewDetails}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="history-pagination" data-testid="history-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="history-summary" data-testid="history-summary">
        <span>Showing {paginatedResults.length} of {filteredResults.length} tests</span>
      </div>
    </div>
  )
}

interface HistoryRowProps {
  result: TestResultWithDetails
  onViewDetails?: (resultId: number) => void
}

function HistoryRow({ result, onViewDetails }: HistoryRowProps) {
  const languageLabels: Record<Language, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
  }

  const difficultyLabels: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
  }

  return (
    <tr className="history-row" data-testid={`history-row-${result.id}`}>
      <td className="history-date">
        {formatDate(new Date(result.completedAt))}
      </td>
      <td className="history-language">
        <span className={`language-badge language-${result.snippet?.language || 'unknown'}`}>
          {result.snippet?.language ? languageLabels[result.snippet.language] : 'Unknown'}
        </span>
      </td>
      <td className="history-difficulty">
        <span className={`difficulty-badge difficulty-${result.snippet?.difficulty || 'unknown'}`}>
          {result.snippet?.difficulty ? difficultyLabels[result.snippet.difficulty] : 'Unknown'}
        </span>
      </td>
      <td className="history-wpm">
        <span className={`wpm-value ${getWPMClass(result.wpm)}`}>
          {result.wpm}
        </span>
      </td>
      <td className="history-accuracy">
        <span className={`accuracy-value ${getAccuracyClass(result.accuracy)}`}>
          {result.accuracy}%
        </span>
      </td>
      <td className="history-duration">
        {formatDuration(result.duration)}
      </td>
      {onViewDetails && (
        <td className="history-actions">
          <button
            onClick={() => onViewDetails(result.id)}
            className="view-details-btn"
            aria-label={`View details for test on ${formatDate(new Date(result.completedAt))}`}
          >
            View Details
          </button>
        </td>
      )}
    </tr>
  )
}

function getWPMClass(wpm: number): string {
  if (wpm >= 80) return 'wpm-excellent'
  if (wpm >= 60) return 'wpm-great'
  if (wpm >= 40) return 'wpm-good'
  return 'wpm-average'
}

function getAccuracyClass(accuracy: number): string {
  if (accuracy >= 98) return 'accuracy-excellent'
  if (accuracy >= 95) return 'accuracy-great'
  if (accuracy >= 90) return 'accuracy-good'
  return 'accuracy-average'
}

export default TypingHistory

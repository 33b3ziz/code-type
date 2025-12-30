import type { AccuracyMetrics, WPMMetrics } from '@/lib/performance-metrics'
import type { ErrorHeatmapData } from '@/lib/error-analysis'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/results-api'
import { ErrorHeatmapCompact } from '@/components/ErrorHeatmap'

export interface TestResultsSummaryProps {
  wpm: WPMMetrics
  accuracy: AccuracyMetrics
  duration: number // seconds
  totalChars: number
  correctChars: number
  incorrectChars: number
  backspaceCount: number
  errorHeatmap?: ErrorHeatmapData
  isNewPersonalBest?: boolean
  previousBest?: number | null
  onRetry?: () => void
  onNewTest?: () => void
  className?: string
}

export function TestResultsSummary({
  wpm,
  accuracy,
  duration,
  totalChars,
  correctChars,
  incorrectChars,
  backspaceCount,
  errorHeatmap,
  isNewPersonalBest = false,
  previousBest,
  onRetry,
  onNewTest,
  className,
}: TestResultsSummaryProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Personal Best Banner */}
      {isNewPersonalBest && (
        <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-lg font-bold text-yellow-400">New Personal Best!</div>
          {previousBest && (
            <div className="text-sm text-gray-400">
              Previous best: {previousBest} WPM
            </div>
          )}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM */}
        <div className="rounded-lg bg-slate-800 p-4 text-center">
          <div className="text-4xl font-bold text-cyan-400">{wpm.net}</div>
          <div className="text-sm text-gray-400 mt-1">WPM</div>
          <div className="text-xs text-gray-500">Raw: {wpm.raw}</div>
        </div>

        {/* Accuracy */}
        <div className="rounded-lg bg-slate-800 p-4 text-center">
          <div
            className={cn(
              'text-4xl font-bold',
              accuracy.overall >= 95
                ? 'text-green-400'
                : accuracy.overall >= 85
                  ? 'text-yellow-400'
                  : 'text-red-400'
            )}
          >
            {accuracy.overall}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Accuracy</div>
          <div className="text-xs text-gray-500">
            {correctChars}/{totalChars} chars
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-lg bg-slate-800 p-4 text-center">
          <div className="text-4xl font-bold text-purple-400">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-400 mt-1">Time</div>
        </div>

        {/* Programming WPM */}
        <div className="rounded-lg bg-slate-800 p-4 text-center">
          <div className="text-4xl font-bold text-orange-400">{wpm.programming}</div>
          <div className="text-sm text-gray-400 mt-1">Code WPM</div>
          <div className="text-xs text-gray-500">Weighted score</div>
        </div>
      </div>

      {/* Detailed Accuracy */}
      <div className="rounded-lg bg-slate-800 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Accuracy Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Keywords</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  accuracy.keywords >= 95
                    ? 'text-green-400'
                    : accuracy.keywords >= 85
                      ? 'text-yellow-400'
                      : 'text-red-400'
                )}
              >
                {accuracy.keywords}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700">
              <div
                className={cn(
                  'h-full rounded-full',
                  accuracy.keywords >= 95
                    ? 'bg-green-500'
                    : accuracy.keywords >= 85
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${accuracy.keywords}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {accuracy.keywordTotal - accuracy.keywordErrors}/{accuracy.keywordTotal}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Symbols</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  accuracy.symbols >= 95
                    ? 'text-green-400'
                    : accuracy.symbols >= 85
                      ? 'text-yellow-400'
                      : 'text-red-400'
                )}
              >
                {accuracy.symbols}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700">
              <div
                className={cn(
                  'h-full rounded-full',
                  accuracy.symbols >= 95
                    ? 'bg-green-500'
                    : accuracy.symbols >= 85
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${accuracy.symbols}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {accuracy.symbolTotal - accuracy.symbolErrors}/{accuracy.symbolTotal}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Regular</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  accuracy.regular >= 95
                    ? 'text-green-400'
                    : accuracy.regular >= 85
                      ? 'text-yellow-400'
                      : 'text-red-400'
                )}
              >
                {accuracy.regular}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700">
              <div
                className={cn(
                  'h-full rounded-full',
                  accuracy.regular >= 95
                    ? 'bg-green-500'
                    : accuracy.regular >= 85
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${accuracy.regular}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {accuracy.regularTotal - accuracy.regularErrors}/{accuracy.regularTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      {errorHeatmap && errorHeatmap.totalErrors > 0 && (
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Problem Areas
          </h3>
          <ErrorHeatmapCompact data={errorHeatmap} />
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-lg font-bold text-gray-300">{incorrectChars}</div>
          <div className="text-xs text-gray-500">Errors</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-lg font-bold text-gray-300">{backspaceCount}</div>
          <div className="text-xs text-gray-500">Backspaces</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-lg font-bold text-gray-300">
            {Math.round(totalChars / (duration / 60))}
          </div>
          <div className="text-xs text-gray-500">Chars/min</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-lg font-bold text-gray-300">
            {backspaceCount === 0 ? '✓' : '✗'}
          </div>
          <div className="text-xs text-gray-500">No Backspace</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}
        {onNewTest && (
          <button
            onClick={onNewTest}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors"
          >
            New Test
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for displaying in lists
 */
export function TestResultCard({
  wpm,
  accuracy,
  duration,
  date,
  snippetTitle,
  language,
  className,
}: {
  wpm: number
  accuracy: number
  duration: number
  date: Date
  snippetTitle?: string
  language?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-800 p-4 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-cyan-400">{wpm}</div>
        <div className="text-sm text-gray-400">WPM</div>
        <div
          className={cn(
            'text-sm font-medium',
            accuracy >= 95
              ? 'text-green-400'
              : accuracy >= 85
                ? 'text-yellow-400'
                : 'text-red-400'
          )}
        >
          {accuracy}%
        </div>
      </div>
      <div className="text-right">
        {snippetTitle && (
          <div className="text-sm text-gray-300">{snippetTitle}</div>
        )}
        <div className="text-xs text-gray-500">
          {language && <span className="capitalize">{language} • </span>}
          {formatDuration(duration)} •{' '}
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  )
}

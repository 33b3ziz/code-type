import { cn } from '@/lib/utils'
import {
  type ErrorHeatmapData,
  KEYBOARD_LAYOUT,
  getErrorIntensity,
  getHeatmapColor,
  identifyWeaknesses,
} from '@/lib/error-analysis'

interface ErrorHeatmapProps {
  data: ErrorHeatmapData
  showKeyboard?: boolean
  showTopErrors?: boolean
  showWeaknesses?: boolean
  className?: string
}

export function ErrorHeatmap({
  data,
  showKeyboard = true,
  showTopErrors = true,
  showWeaknesses = true,
  className,
}: ErrorHeatmapProps) {
  const weaknesses = identifyWeaknesses(data)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-slate-800 p-4">
          <div className="text-2xl font-bold text-cyan-400">{data.totalErrors}</div>
          <div className="text-sm text-gray-400">Total Errors</div>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <div className="text-2xl font-bold text-cyan-400">
            {data.totalCharacters}
          </div>
          <div className="text-sm text-gray-400">Characters Typed</div>
        </div>
        <div className="rounded-lg bg-slate-800 p-4">
          <div
            className={cn(
              'text-2xl font-bold',
              data.overallErrorRate <= 5
                ? 'text-green-400'
                : data.overallErrorRate <= 15
                  ? 'text-yellow-400'
                  : 'text-red-400'
            )}
          >
            {data.overallErrorRate}%
          </div>
          <div className="text-sm text-gray-400">Error Rate</div>
        </div>
      </div>

      {/* Keyboard Heatmap */}
      {showKeyboard && (
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-300">
            Keyboard Heatmap
          </h3>
          <div className="flex flex-col items-center gap-1">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.keys.map((key) => {
                  const intensity = getErrorIntensity(key, data)
                  const colorClass = getHeatmapColor(intensity)
                  const entry = data.characterErrors.get(key.toLowerCase())
                  const hasErrors = entry && entry.errorCount > 0

                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center justify-center rounded border border-slate-600 font-mono text-xs transition-colors',
                        key === ' ' ? 'h-8 w-32' : 'h-8 w-8',
                        colorClass,
                        hasErrors && 'ring-1 ring-red-400'
                      )}
                      title={
                        entry
                          ? `${key.toUpperCase()}: ${entry.errorCount}/${entry.totalCount} errors (${entry.errorRate}%)`
                          : key.toUpperCase()
                      }
                    >
                      {key === ' ' ? 'Space' : key.toUpperCase()}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-green-500/40" />
              <span>Low errors</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-yellow-500/40" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-500/40" />
              <span>High errors</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Errors */}
      {showTopErrors && data.topErrors.length > 0 && (
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-300">
            Most Frequent Errors
          </h3>
          <div className="space-y-2">
            {data.topErrors.slice(0, 5).map((error) => (
              <div key={error.char} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-700 font-mono text-sm font-bold">
                  {error.char === ' ' ? '␣' : error.char.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-700">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        error.errorRate <= 25
                          ? 'bg-yellow-500'
                          : error.errorRate <= 50
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                      )}
                      style={{ width: `${error.errorRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm">
                  <span className="text-gray-400">{error.errorCount}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-gray-400">{error.totalCount}</span>
                  <span className="ml-2 text-red-400">{error.errorRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {showWeaknesses && weaknesses.length > 0 && (
        <div className="rounded-lg bg-slate-800 p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-300">
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span className="text-yellow-500">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Errors State */}
      {data.totalErrors === 0 && (
        <div className="rounded-lg bg-green-500/10 p-6 text-center">
          <div className="text-3xl">🎯</div>
          <div className="mt-2 text-lg font-medium text-green-400">
            Perfect Accuracy!
          </div>
          <div className="text-sm text-gray-400">
            No errors detected in this session
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for displaying in results summary
 */
export function ErrorHeatmapCompact({
  data,
  className,
}: {
  data: ErrorHeatmapData
  className?: string
}) {
  if (data.topErrors.length === 0) {
    return (
      <div className={cn('text-center text-green-400', className)}>
        Perfect accuracy!
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {data.topErrors.slice(0, 5).map((error) => (
        <div
          key={error.char}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-xs',
            error.errorRate <= 25
              ? 'bg-yellow-500/20 text-yellow-400'
              : error.errorRate <= 50
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-red-500/20 text-red-400'
          )}
        >
          <span className="font-mono font-bold">
            {error.char === ' ' ? '␣' : error.char.toUpperCase()}
          </span>
          <span>{error.errorRate}%</span>
        </div>
      ))}
    </div>
  )
}

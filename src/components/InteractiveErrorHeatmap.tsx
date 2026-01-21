/**
 * Interactive Error Heatmap Component
 * Visualizes typing errors with filtering by language and time period,
 * including character combination analysis
 */

import { useState, useMemo } from 'react'
import { AlertCircle, Filter, Keyboard, Layers, BarChart3, Info } from 'lucide-react'
import type { Language } from '@/db/schema'
import type { TimePeriod, CharacterCombinationError, AggregatedErrorHeatmapData } from '@/lib/error-heatmap-api'
import { cn } from '@/lib/utils'
import { KEYBOARD_LAYOUT, getHeatmapColor } from '@/lib/error-analysis'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useErrorHeatmap } from '@/hooks/queries/useErrorHeatmap'

const TIME_PERIOD_OPTIONS: Array<{ value: TimePeriod; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

const LANGUAGE_OPTIONS: Array<{ value: Language | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All Languages', icon: '🌐' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
]

type ViewMode = 'keyboard' | 'combinations' | 'chart'

interface InteractiveErrorHeatmapProps {
  userId: string
  className?: string
  initialLanguage?: Language | 'all'
  initialTimePeriod?: TimePeriod
}

export function InteractiveErrorHeatmap({
  userId,
  className,
  initialLanguage = 'all',
  initialTimePeriod = 'week',
}: InteractiveErrorHeatmapProps) {
  const [language, setLanguage] = useState<Language | 'all'>(initialLanguage)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialTimePeriod)
  const [viewMode, setViewMode] = useState<ViewMode>('keyboard')
  const [selectedChar, setSelectedChar] = useState<string | null>(null)

  const { data, isLoading, error } = useErrorHeatmap(userId, {
    language,
    timePeriod,
    enabled: !!userId,
  })

  // Create a map for quick character lookup
  const charErrorMap = useMemo(() => {
    if (!data) return new Map<string, { char: string; errorCount: number; totalCount: number; errorRate: number }>()
    return new Map(data.characterErrors.map((e: { char: string; errorCount: number; totalCount: number; errorRate: number }) => [e.char, e]))
  }, [data])

  // Filter combinations involving the selected character
  const filteredCombinations = useMemo(() => {
    if (!data || !selectedChar) return data?.combinationErrors ?? []
    return data.combinationErrors.filter(
      (c: CharacterCombinationError) => c.prevChar === selectedChar || c.currentChar === selectedChar
    )
  }, [data, selectedChar])

  if (error) {
    return (
      <div className={cn('rounded-lg bg-red-500/10 border border-red-500/30 p-6', className)}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load error heatmap data</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Error Analysis</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Filter */}
          <Select value={language} onValueChange={(v) => setLanguage(v as Language | 'all')}>
            <SelectTrigger className="w-[160px] bg-slate-800 border-slate-600">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time Period Filter */}
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-600">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <Button
          variant={viewMode === 'keyboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('keyboard')}
          className={cn(
            'gap-2',
            viewMode === 'keyboard' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-gray-400 hover:text-white'
          )}
        >
          <Keyboard className="h-4 w-4" />
          Keyboard
        </Button>
        <Button
          variant={viewMode === 'combinations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('combinations')}
          className={cn(
            'gap-2',
            viewMode === 'combinations' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-gray-400 hover:text-white'
          )}
        >
          <Layers className="h-4 w-4" />
          Combinations
        </Button>
        <Button
          variant={viewMode === 'chart' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('chart')}
          className={cn(
            'gap-2',
            viewMode === 'chart' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-gray-400 hover:text-white'
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Chart
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
        </div>
      )}

      {/* Content */}
      {data && !isLoading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Tests Analyzed" value={data.testCount} />
            <StatBox label="Total Errors" value={data.totalErrors} />
            <StatBox label="Characters" value={data.totalCharacters.toLocaleString()} />
            <StatBox
              label="Error Rate"
              value={`${data.overallErrorRate}%`}
              valueClass={
                data.overallErrorRate <= 5
                  ? 'text-green-400'
                  : data.overallErrorRate <= 15
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }
            />
          </div>

          {/* No Data State */}
          {data.testCount === 0 && (
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8 text-center">
              <Info className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Data Available</h3>
              <p className="text-gray-500 text-sm">
                Complete some typing tests to see your error analysis.
              </p>
            </div>
          )}

          {/* Keyboard View */}
          {viewMode === 'keyboard' && data.testCount > 0 && (
            <KeyboardHeatmap
              charErrorMap={charErrorMap}
              selectedChar={selectedChar}
              onCharSelect={setSelectedChar}
            />
          )}

          {/* Combinations View */}
          {viewMode === 'combinations' && data.testCount > 0 && (
            <CombinationsView
              combinations={filteredCombinations}
              selectedChar={selectedChar}
              onCharSelect={setSelectedChar}
            />
          )}

          {/* Chart View */}
          {viewMode === 'chart' && data.testCount > 0 && (
            <ChartView data={data} />
          )}

          {/* Selected Character Info */}
          {selectedChar && data.testCount > 0 && (
            <SelectedCharInfo
              char={selectedChar}
              charData={charErrorMap.get(selectedChar)}
              relatedCombinations={filteredCombinations}
              onClear={() => setSelectedChar(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

// Sub-components

function StatBox({
  label,
  value,
  valueClass = 'text-cyan-400',
}: {
  label: string
  value: string | number
  valueClass?: string
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3 text-center">
      <div className={cn('text-xl font-bold', valueClass)}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function KeyboardHeatmap({
  charErrorMap,
  selectedChar,
  onCharSelect,
}: {
  charErrorMap: Map<string, { char: string; errorCount: number; totalCount: number; errorRate: number }>
  selectedChar: string | null
  onCharSelect: (char: string | null) => void
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        Keyboard Heatmap
        <span className="text-gray-500 font-normal ml-2">(click a key for details)</span>
      </h3>
      <div className="flex flex-col items-center gap-1 overflow-x-auto">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.keys.map((key) => {
              const entry = charErrorMap.get(key.toLowerCase())
              const intensity = entry?.errorRate ?? 0
              const colorClass = getHeatmapColor(intensity)
              const hasErrors = entry && entry.errorCount > 0
              const isSelected = selectedChar === key.toLowerCase()

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCharSelect(isSelected ? null : key.toLowerCase())}
                  className={cn(
                    'flex items-center justify-center rounded border font-mono text-xs transition-all',
                    key === ' ' ? 'h-8 w-32' : 'h-8 w-8',
                    colorClass,
                    hasErrors && 'ring-1 ring-red-400',
                    isSelected && 'ring-2 ring-cyan-400 scale-110 z-10',
                    'hover:scale-105 hover:z-10 cursor-pointer'
                  )}
                  title={
                    entry
                      ? `${key.toUpperCase()}: ${entry.errorCount}/${entry.totalCount} errors (${entry.errorRate}%)`
                      : key.toUpperCase()
                  }
                >
                  {key === ' ' ? 'Space' : key.toUpperCase()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <HeatmapLegend />
    </div>
  )
}

function HeatmapLegend() {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded bg-green-500/40" />
        <span>Low</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded bg-yellow-500/40" />
        <span>Medium</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded bg-red-500/40" />
        <span>High</span>
      </div>
    </div>
  )
}

function CombinationsView({
  combinations,
  selectedChar,
  onCharSelect,
}: {
  combinations: CharacterCombinationError[]
  selectedChar: string | null
  onCharSelect: (char: string | null) => void
}) {
  if (combinations.length === 0) {
    return (
      <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8 text-center">
        <Layers className="h-8 w-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">
          {selectedChar
            ? `No error combinations found involving "${selectedChar.toUpperCase()}"`
            : 'No problematic character combinations detected'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        Problem Character Combinations
        {selectedChar && (
          <span className="text-cyan-400 ml-2">
            (filtered by "{selectedChar.toUpperCase()}")
          </span>
        )}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {combinations.slice(0, 15).map((combo) => (
          <div
            key={combo.combination}
            className={cn(
              'flex items-center gap-3 rounded-lg bg-slate-700/50 p-3 transition-colors',
              'hover:bg-slate-700/80 cursor-pointer'
            )}
            onClick={() => onCharSelect(combo.currentChar)}
          >
            <div className="flex items-center gap-1 font-mono">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded bg-slate-600 text-sm font-bold',
                  combo.prevChar === selectedChar && 'ring-2 ring-cyan-400'
                )}
              >
                {combo.prevChar === ' ' ? '␣' : combo.prevChar.toUpperCase()}
              </span>
              <span className="text-gray-500">→</span>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded text-sm font-bold',
                  combo.errorRate <= 25
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : combo.errorRate <= 50
                      ? 'bg-orange-500/30 text-orange-400'
                      : 'bg-red-500/30 text-red-400',
                  combo.currentChar === selectedChar && 'ring-2 ring-cyan-400'
                )}
              >
                {combo.currentChar === ' ' ? '␣' : combo.currentChar.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white">
                {combo.errorCount} / {combo.totalCount} errors
              </div>
              <div className="text-xs text-gray-400">{combo.errorRate}% error rate</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartView({ data }: { data: AggregatedErrorHeatmapData }) {
  const maxErrors = Math.max(...data.topErrors.map((e) => e.errorCount), 1)

  if (data.topErrors.length === 0) {
    return (
      <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8 text-center">
        <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No errors to display</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Top Error Characters</h3>
      <div className="space-y-3">
        {data.topErrors.slice(0, 10).map((error) => {
          const barWidth = (error.errorCount / maxErrors) * 100
          return (
            <div key={error.char} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-700 font-mono text-sm font-bold text-white">
                {error.char === ' ' ? '␣' : error.char.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="h-6 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      error.errorRate <= 25
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : error.errorRate <= 50
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
              <div className="text-right min-w-[100px]">
                <span className="text-sm text-gray-400">{error.errorCount}</span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-sm text-gray-400">{error.totalCount}</span>
                <span className={cn(
                  'ml-2 text-sm font-medium',
                  error.errorRate <= 25
                    ? 'text-yellow-400'
                    : error.errorRate <= 50
                      ? 'text-orange-400'
                      : 'text-red-400'
                )}>
                  {error.errorRate}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SelectedCharInfo({
  char,
  charData,
  relatedCombinations,
  onClear,
}: {
  char: string
  charData?: { char: string; errorCount: number; totalCount: number; errorRate: number }
  relatedCombinations: CharacterCombinationError[]
  onClear: () => void
}) {
  return (
    <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20 font-mono text-xl font-bold text-cyan-400">
            {char === ' ' ? '␣' : char.toUpperCase()}
          </div>
          <div>
            <h4 className="text-white font-medium">
              Key: {char === ' ' ? 'Space' : char.toUpperCase()}
            </h4>
            {charData ? (
              <p className="text-sm text-gray-400">
                {charData.errorCount} errors out of {charData.totalCount} typed ({charData.errorRate}% error rate)
              </p>
            ) : (
              <p className="text-sm text-gray-400">No errors recorded for this key</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-gray-400 hover:text-white"
        >
          Clear
        </Button>
      </div>

      {relatedCombinations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <h5 className="text-sm font-medium text-gray-300 mb-2">Related Combinations</h5>
          <div className="flex flex-wrap gap-2">
            {relatedCombinations.slice(0, 6).map((combo) => (
              <div
                key={combo.combination}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs"
              >
                <span className="font-mono font-bold">
                  {combo.prevChar === ' ' ? '␣' : combo.prevChar.toUpperCase()}
                </span>
                <span className="text-gray-500">→</span>
                <span className="font-mono font-bold">
                  {combo.currentChar === ' ' ? '␣' : combo.currentChar.toUpperCase()}
                </span>
                <span className={cn(
                  'ml-1',
                  combo.errorRate <= 25
                    ? 'text-yellow-400'
                    : combo.errorRate <= 50
                      ? 'text-orange-400'
                      : 'text-red-400'
                )}>
                  {combo.errorRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveErrorHeatmap

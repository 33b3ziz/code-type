/**
 * Practice Selector Component
 * Allows users to select a practice mode and configure options
 */

import { useState } from 'react'

import type { Difficulty, Language, PracticeMode } from '@/db/schema'
import { PRACTICE_MODES } from '@/lib/practice-modes'
import { cn } from '@/lib/utils'

export interface PracticeSelectorProps {
  onSelect: (config: PracticeConfig) => void
  recommendedMode?: PracticeMode
  className?: string
}

export interface PracticeConfig {
  mode: PracticeMode
  language?: Language
  difficulty?: Difficulty
  duration: number
  targetCharacters?: Array<string>
}

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
]

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'hardcore', label: 'Hardcore' },
]

const DURATIONS = [30, 60, 90, 120, 180]

export function PracticeSelector({
  onSelect,
  recommendedMode,
  className = '',
}: PracticeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null)
  const [language, setLanguage] = useState<Language>('javascript')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [duration, setDuration] = useState<number>(60)

  const modeConfig = selectedMode ? PRACTICE_MODES[selectedMode] : null

  const handleStart = () => {
    if (!selectedMode) return

    onSelect({
      mode: selectedMode,
      language: modeConfig?.requiresLanguage ? language : undefined,
      difficulty: modeConfig?.requiresDifficulty ? difficulty : undefined,
      duration,
    })
  }

  return (
    <div className={cn('practice-selector', className)}>
      {/* Mode Selection Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Select Practice Mode</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(PRACTICE_MODES).map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedMode(mode.id)
                setDuration(mode.defaultDuration)
              }}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all text-left',
                'hover:border-cyan-500/50 hover:bg-slate-800/50',
                selectedMode === mode.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-900',
                recommendedMode === mode.id && selectedMode !== mode.id && 'ring-2 ring-yellow-500/50'
              )}
              aria-pressed={selectedMode === mode.id}
            >
              {/* Recommended badge */}
              {recommendedMode === mode.id && (
                <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}

              {/* Mode icon */}
              <div className={cn(
                'text-2xl font-mono mb-2',
                mode.color === 'cyan' && 'text-cyan-400',
                mode.color === 'purple' && 'text-purple-400',
                mode.color === 'red' && 'text-red-400',
                mode.color === 'green' && 'text-green-400',
                mode.color === 'yellow' && 'text-yellow-400',
                mode.color === 'orange' && 'text-orange-400'
              )}>
                {mode.icon}
              </div>

              {/* Mode name and description */}
              <h3 className="font-semibold text-white mb-1">{mode.name}</h3>
              <p className="text-sm text-gray-400">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Options */}
      {selectedMode && modeConfig && (
        <div className="space-y-6 p-6 bg-slate-900 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white">Configure {modeConfig.name}</h3>

          {/* Language Selection */}
          {modeConfig.requiresLanguage && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Programming Language
              </label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      language === lang.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          {modeConfig.requiresDifficulty && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Difficulty Level
              </label>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      difficulty === diff.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    duration === d
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-600 text-gray-400 hover:border-slate-500'
                  )}
                >
                  {d >= 60 ? `${d / 60}min` : `${d}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            Start Practice
          </button>
        </div>
      )}
    </div>
  )
}

export default PracticeSelector
